from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from mongoengine.errors import DoesNotExist, NotUniqueError
import json
import os
import uuid
from django.conf import settings
from django.core.files.storage import default_storage
from .models import User, Event, Booking, Seat
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from mongoengine.errors import DoesNotExist
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Event

def serialize_user(user):
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

@api_view(["POST"])
def register_view(request):
    data = request.data
    try:
        hashed_password = make_password(data.get("password"))
        user = User(
            email=data.get("email"),
            password=hashed_password,
            full_name=data.get("full_name"),
            phone=data.get("phone", ""),
            city=data.get("city", ""),
            role=data.get("role", "user")
        )
        user.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "success": True,
            "token": str(refresh.access_token),
            "user": serialize_user(user)
        }, status=status.HTTP_201_CREATED)
    except NotUniqueError:
        return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)
    required_fields = ["email", "password", "full_name"]
    for field in required_fields:
        if not data.get(field):
            return Response({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
def login_view(request):
    try:
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")
        user = User.objects.get(email=email)

        if check_password(password, user.password):
            refresh = RefreshToken.for_user(user)
            return JsonResponse({
                "success": True,
                "user": serialize_user(user),
                "token": str(refresh.access_token)
            })
        return JsonResponse({"success": False, "message": "Invalid password"}, status=401)
    except User.DoesNotExist:
        return JsonResponse({"success": False, "message": "User does not exist"}, status=404)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    try:
        user = User.objects.get(id=request.user.id)
        user_data = {
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
        return Response(user_data)
    except DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_current_user(request):
    try:
        user = User.objects.get(id=request.user.id)
        data = request.data

        for field in [
            "full_name",
            "phone",
            "city",
            "avatar_url",
            "favorite_categories",
            "favorite_events",
        ]:
            if field in data:
                setattr(user, field, data[field])
        user.save()

        user_data = {
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
        return Response(user_data)
    except DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


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
        events = events.filter(created_by=request.user.email)
    elif created_by_who:
        events = events.filter(created_by=created_by_who)
    elif created_by_who == "me":
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)
        events = events.filter(created_by=request.user.email)

    if status_filter:
        events = events.filter(status=status_filter)

    event_list = []
    for e in events:
        edict = e.to_mongo().to_dict()
        edict["id"] = str(edict.pop("_id"))
        event_list.append(edict)

    return Response(event_list)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_event(request):
    try:
        price = float(data.get("price", 0))
        capacity = int(data.get("capacity", 0))
        if price < 0 or capacity < 0:
            return Response({"error": "Price and capacity must be positive"}, status=400)
    except (ValueError, TypeError):
        return Response({"error": "Invalid numeric format"}, status=400)
    try:
        data = request.data
        user = User.objects.get(id=request.user.id)

        event = Event(
            title=data.get("title"),
            description=data.get("description"),
            category=data.get("category"),
            subcategory=data.get("subcategory", ""),
            date=data.get("date"),
            time=data.get("time"),
            location=data.get("location"),
            city=data.get("city"),
            address=data.get("address", ""),
            price=float(data.get("price", 0)),
            ticket_type=data.get("ticket_type"),
            capacity=data.get("capacity"),
            organizer_name=user.full_name,
            organizer_email=user.email,
            organizer_phone=user.phone,
            image_url=data.get("image_url", ""),
            banner_url=data.get("banner_url", ""),
            tags=data.get("tags", []),
            status=data.get("status", "Published"),
            featured=data.get("featured", False),
            attendees_count=0,
            created_by=user.email,
        )

        event.save()

        return Response(
            {
                "success": True,
                "id": str(event.id),
                "message": "Event created successfully",
            },
            status=status.HTTP_201_CREATED,
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_event(request, event_id):
    try:
        event = Event.objects.get(id=event_id)

        if event.created_by != request.user.email:
            return Response(
                {"error": "You don't have permission to delete this event"},
                status=status.HTTP_403_FORBIDDEN,
            )

        event.delete()
        return Response(
            {"success": True, "message": "Event deleted successfully"},
            status=status.HTTP_200_OK,
        )
    except DoesNotExist:
        return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    has_bookings = Booking.objects(event_id=event_id, booking_status="Confirmed").count() > 0
    if has_bookings:
        return Response({"error": "Cannot delete event with active bookings"}, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_booking(request):
    data = request.data

    try:
        event_id = data.get("event_id")
        seats = data.get("seats", [])
        total_price = data.get("total_price")

        if not event_id or not seats or total_price is None:
            return Response(
                {"error": "event_id, seats and total_price are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Always use authenticated user
        user_email = request.user.email
        user_name = getattr(request.user, "full_name", "")

        # ---- CHECK SEAT COLLISIONS ----
        bookings = Booking.objects(event_id=event_id, booking_status="Confirmed")

        taken_seats = {
            (seat.row, seat.column) for booking in bookings for seat in booking.seats
        }

        for seat in seats:
            if (seat["row"], seat["column"]) in taken_seats:
                return Response(
                    {"error": f"Seat {seat} already reserved"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        incoming_seats = data.get("seats", [])

        # ---- CREATE BOOKING ----
        booking = Booking(
            event_id=event_id,
            event_title=data.get("event_title", ""),
            event_date=data.get("event_date", ""),
            event_time=data.get("event_time", ""),
            event_location=data.get("event_location", ""),
            user_email=user_email,
            user_name=user_name,
            seats=[Seat(**s) for s in incoming_seats],
            num_tickets=len(incoming_seats),
            total_price=float(total_price),
            booking_status="Confirmed",
        )

        booking.save()

        try:
            event = Event.objects.get(id=event_id)
            event.attendees_count = (event.attendees_count or 0) + len(seats)
            event.save()
        except Event.DoesNotExist:
            pass

        return Response({"success": True, "booking_id": str(booking.id)})

    except Exception as e:
        return Response({"error": str(e)}, status=500)

    taken_seats = {(s.row, s.column) for b in bookings for s in b.seats}
    for seat in seats:
        if (seat["row"], seat["column"]) in taken_seats:
            return Response(
                {"error": f"Seat Row {seat['row']} Col {seat['column']} is occupied"},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_bookings(request):
    try:
        user_email = request.query_params.get("user_email")
        if user_email:
            bookings = Booking.objects(user_email=user_email)
        else:
            bookings = Booking.objects()

        bookings_list = []
        for b in bookings:
            bookings_list.append(
                {
                    "id": str(b.id),
                    "event_id": b.event_id,
                    "event_title": b.event_title,
                    "event_date": b.event_date,
                    "event_time": b.event_time,
                    "event_location": b.event_location,
                    "user_email": b.user_email,
                    "user_name": b.user_name,
                    "num_tickets": b.num_tickets,
                    "total_price": b.total_price,
                    "booking_status": b.booking_status,
                    "created_at": b.created_at.isoformat(),
                    "updated_at": b.updated_at.isoformat(),
                }
            )

        return Response(bookings_list)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_booking(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
        return Response(
            {
                "id": str(booking.id),
                "event_id": booking.event_id,
                "event_title": booking.event_title,
                "event_date": booking.event_date,
                "event_time": booking.event_time,
                "event_location": booking.event_location,
                "user_email": booking.user_email,
                "user_name": booking.user_name,
                "num_tickets": booking.num_tickets,
                "total_price": booking.total_price,
                "booking_status": booking.booking_status,
                "created_at": booking.created_at.isoformat(),
                "updated_at": booking.updated_at.isoformat(),
            }
        )
    except DoesNotExist:
        return Response(
            {"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_reserved_seats(request, event_id):

    bookings = Booking.objects(event_id=event_id, booking_status="Confirmed")

    reserved = [
        {"row": seat.row, "column": seat.column}
        for booking in bookings
        for seat in booking.seats
    ]

    return Response(reserved)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_bookings(request):
    try:
        user_email = request.user.email

        bookings = Booking.objects.filter(user_email=user_email).order_by("-created_at")

        data = [
            {
                "booking_id": str(b.id),
                "event_id": b.event_id,
                "event_title": b.event_title,
                "event_date": b.event_date,
                "event_time": b.event_time,
                "event_location": b.event_location,
                "num_tickets": b.num_tickets,
                "total_price": b.total_price,
                "booking_status": b.booking_status,
            }
            for b in bookings
        ]

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_booking(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
        data = request.data

        for field in ["booking_status", "num_tickets", "user_name"]:
            if field in data:
                setattr(booking, field, data[field])

        booking.save()
        return Response({"success": True, "message": "Booking updated successfully"})
    except DoesNotExist:
        return Response(
            {"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_file(request):
    if "file" not in request.FILES:
        return Response(
            {"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST
        )

    file = request.FILES["file"]

    if not file.content_type.startswith("image/"):
        return Response(
            {"error": "Only image uploads are allowed"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    ext = os.path.splitext(file.name)[1]
    filename = f"{uuid.uuid4()}{ext}"

    upload_path = os.path.join("uploads", filename)
    saved_path = default_storage.save(upload_path, file)

    file_url = request.build_absolute_uri(settings.MEDIA_URL + saved_path)

    return Response({"file_url": file_url}, status=status.HTTP_201_CREATED)
