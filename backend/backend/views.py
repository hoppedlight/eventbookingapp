from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from mongoengine.errors import DoesNotExist, NotUniqueError
import json
import os
import uuid
from django.conf import settings
from django.core.files.storage import default_storage
from django.contrib.auth.hashers import make_password, check_password

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import User, Event, Booking, Seat


# --- HELPERS ---

def serialize_user(user):
    """Helper to standardize user data output across views"""
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "city": user.city,
        "avatar_url": user.avatar_url,
        "role": user.role,
        "favorite_categories": user.favorite_categories,
        "favorite_events": user.favorite_events,
    }


# --- AUTH VIEWS ---

@api_view(["POST"])
def register_view(request):
    data = request.data

    # Validation
    required_fields = ["email", "password", "full_name"]
    for field in required_fields:
        if not data.get(field):
            return Response({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        hashed_password = make_password(data.get("password"))
        user = User(
            email=data.get("email"),
            password=hashed_password,
            full_name=data.get("full_name"),
            phone=data.get("phone", ""),
            city=data.get("city", ""),
            role=data.get("role", "user"),
            favorite_categories=[],
            favorite_events=[],
        )
        user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "success": True,
            "message": "User registered successfully",
            "token": str(refresh.access_token),
            "user": serialize_user(user)
        }, status=status.HTTP_201_CREATED)
    except NotUniqueError:
        return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def login_view(request):
    data = request.data
    email = data.get("email")
    password = data.get("password")

    try:
        user = User.objects.get(email=email)
        if check_password(password, user.password):
            refresh = RefreshToken.for_user(user)
            return Response({
                "success": True,
                "token": str(refresh.access_token),
                "user": serialize_user(user)
            })
        return Response({"error": "Invalid password"}, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    try:
        user = User.objects.get(id=request.user.id)
        return Response(serialize_user(user))
    except DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_current_user(request):
    try:
        user = User.objects.get(id=request.user.id)
        data = request.data

        fields = ["full_name", "phone", "city", "avatar_url", "favorite_categories", "favorite_events"]
        for field in fields:
            if field in data:
                setattr(user, field, data[field])

        user.save()
        return Response(serialize_user(user))
    except DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


# --- EVENT VIEWS ---

@api_view(["GET"])
def fetch_events(request):
    event_id = request.GET.get("id")
    status_filter = request.GET.get("status")
    created_by_who = request.GET.get("created_by")

    if event_id:
        try:
            event = Event.objects.get(id=event_id)
            event_dict = event.to_mongo().to_dict()
            event_dict["id"] = str(event_dict.pop("_id"))
            return Response([event_dict])
        except Event.DoesNotExist:
            return Response([])

    events = Event.objects()

    if created_by_who == "me":
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)
        events = events.filter(created_by=request.user.email)
    elif created_by_who:
        events = events.filter(created_by=created_by_who)

    if status_filter:
        events = events.filter(status=status_filter)

    # Simple Pagination
    limit = int(request.GET.get("limit", 20))
    events = events.limit(limit)

    event_list = []
    for e in events:
        edict = e.to_mongo().to_dict()
        edict["id"] = str(edict.pop("_id"))
        event_list.append(edict)

    return Response(event_list)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_event(request):
    data = request.data
    try:
        # Numeric validation
        price = float(data.get("price", 0))
        capacity = int(data.get("capacity", 0))
        if price < 0 or capacity < 0:
            return Response({"error": "Price and capacity must be positive"}, status=400)

        user = User.objects.get(id=request.user.id)
        event = Event(
            title=data.get("title"),
            description=data.get("description"),
            category=data.get("category"),
            date=data.get("date"),
            time=data.get("time"),
            location=data.get("location"),
            city=data.get("city"),
            price=price,
            capacity=capacity,
            organizer_name=user.full_name,
            organizer_email=user.email,
            organizer_phone=user.phone,
            created_by=user.email,
            status=data.get("status", "Published"),
            attendees_count=0
        )
        event.save()
        return Response({"success": True, "id": str(event.id)}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_event(request, event_id):
    try:
        event = Event.objects.get(id=event_id)

        # Business Logic: Check if tickets are already sold
        if Booking.objects(event_id=event_id, booking_status="Confirmed").count() > 0:
            return Response({"error": "Cannot delete event with active bookings"}, status=400)

        if event.created_by != request.user.email:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        event.delete()
        return Response({"success": True, "message": "Deleted successfully"})
    except DoesNotExist:
        return Response({"error": "Not found"}, status=404)


# --- BOOKING VIEWS ---

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_booking(request):
    data = request.data
    try:
        event_id = data.get("event_id")
        seats_data = data.get("seats", [])

        if not event_id or not seats_data:
            return Response({"error": "Missing booking details"}, status=400)

        # Prevent organizer from booking own event
        event = Event.objects.get(id=event_id)
        if event.created_by == request.user.email:
            return Response({"error": "Organizers cannot book their own events"}, status=400)

        # Check seat collisions
        active_bookings = Booking.objects(event_id=event_id, booking_status="Confirmed")
        taken_seats = {(s.row, s.column) for b in active_bookings for s in b.seats}

        for s in seats_data:
            if (s["row"], s["column"]) in taken_seats:
                return Response({"error": f"Seat {s} is already taken"}, status=400)

        booking = Booking(
            event_id=event_id,
            user_email=request.user.email,
            user_name=getattr(request.user, "full_name", ""),
            seats=[Seat(**s) for s in seats_data],
            num_tickets=len(seats_data),
            total_price=float(data.get("total_price", 0)),
            booking_status="Confirmed"
        )
        booking.save()

        # Update event attendee count
        event.attendees_count = (event.attendees_count or 0) + len(seats_data)
        event.save()

        return Response({"success": True, "booking_id": str(booking.id)})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_bookings(request):
    bookings = Booking.objects.filter(user_email=request.user.email).order_by("-created_at")
    data = [{
        "booking_id": str(b.id),
        "event_title": b.event_title,
        "num_tickets": b.num_tickets,
        "booking_status": b.booking_status,
        "total_price": b.total_price
    } for b in bookings]
    return Response(data)


# --- FILE UPLOAD ---

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_file(request):
    if "file" not in request.FILES:
        return Response({"error": "No file provided"}, status=400)

    file = request.FILES["file"]

    # Security checks
    if file.size > 2 * 1024 * 1024:
        return Response({"error": "File exceeds 2MB limit"}, status=400)

    allowed_exts = ['.jpg', '.jpeg', '.png', '.webp']
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in allowed_exts:
        return Response({"error": "Invalid file type"}, status=400)

    filename = f"{uuid.uuid4()}{ext}"
    upload_path = os.path.join("uploads", filename)
    saved_path = default_storage.save(upload_path, file)
    file_url = request.build_absolute_uri(settings.MEDIA_URL + saved_path)

    return Response({"file_url": file_url}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_reserved_seats(request, event_id):
    """Returns a list of seats already booked for a specific event"""
    bookings = Booking.objects(event_id=event_id, booking_status="Confirmed")
    reserved = [
        {"row": seat.row, "column": seat.column}
        for booking in bookings
        for seat in booking.seats
    ]
    return Response(reserved)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_bookings(request):
    """Admin or general view to list bookings, filterable by email or event"""
    user_email = request.query_params.get("user_email")
    event_id = request.query_params.get("event_id")

    bookings = Booking.objects()
    if user_email:
        bookings = bookings.filter(user_email=user_email)
    if event_id:
        bookings = bookings.filter(event_id=event_id)

    data = [{
        "id": str(b.id),
        "event_id": b.event_id,
        "user_email": b.user_email,
        "num_tickets": b.num_tickets,
        "booking_status": b.booking_status,
        "total_price": b.total_price
    } for b in bookings]
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_booking(request, booking_id):
    """Retrieve details of a single booking"""
    try:
        booking = Booking.objects.get(id=booking_id)
        return Response({
            "id": str(booking.id),
            "event_id": booking.event_id,
            "user_email": booking.user_email,
            "num_tickets": booking.num_tickets,
            "booking_status": booking.booking_status
        })
    except DoesNotExist:
        return Response({"error": "Booking not found"}, status=404)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_booking(request, booking_id):
    """Update booking status or details"""
    try:
        booking = Booking.objects.get(id=booking_id)
        data = request.data
        if "booking_status" in data:
            booking.booking_status = data["booking_status"]
        booking.save()
        return Response({"success": True})
    except DoesNotExist:
        return Response({"error": "Booking not found"}, status=404)