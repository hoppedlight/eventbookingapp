from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from mongoengine.errors import DoesNotExist, NotUniqueError
import json
from .models import User, Event
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from mongoengine.errors import DoesNotExist

@csrf_exempt
def register_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")
        full_name = data.get("full_name")
        phone = data.get("phone", "")
        city = data.get("city", "")
        avatar_url = data.get("avatar_url", "")
        role = data.get("role", "user")

        try:
            hashed_password = make_password(password)

            user = User(
                email=email,
                password=hashed_password,
                full_name=full_name,
                phone=phone,
                city=city,
                avatar_url=avatar_url,
                role=role,
                favorite_categories=[],
                favorite_events=[]
            )
            user.save()
            refresh = RefreshToken.for_user(user)
            return JsonResponse({
                "success": True,
                "message": "User registered successfully",
                "token": str(refresh.access_token),
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "full_name": user.full_name
                }
            })
        except NotUniqueError:
            return JsonResponse({"success": False, "message": "Email already exists"})
    return JsonResponse({"success": False, "message": "Only POST method allowed"})


@csrf_exempt
def login_view(request):
    try:
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        user = User.objects.get(email=email)

        if check_password(password, user.password):
            refresh = RefreshToken.for_user(user)
            user_data = {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "phone": user.phone,
                "city": user.city,
                "avatar_url": user.avatar_url,
                "role": user.role,
                "favorite_categories": user.favorite_categories,
                "favorite_events": user.favorite_events
            }
            return JsonResponse({
                "success": True,
                "user": user_data,
                "token": str(refresh.access_token)
            })
        else:
            return JsonResponse({"success": False, "message": "Invalid password"})
    except User.DoesNotExist:
        return JsonResponse({"success": False, "message": "User does not exist"})
    
    
@api_view(['GET'])
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
            "favorite_events": user.favorite_events
        }
        return Response(user_data)
    except DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_current_user(request):
    try:
        user = User.objects.get(id=request.user.id)
        data = request.data

        for field in ['full_name', 'phone', 'city', 'avatar_url', 'favorite_categories', 'favorite_events']:
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
            "favorite_events": user.favorite_events
        }
        return Response(user_data)
    except DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(["GET"])
def fetch_events(request):
    events = Event.objects(status="Published")
    return Response([event.to_json_safe() for event in events])

