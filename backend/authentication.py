from rest_framework_simplejwt.authentication import JWTAuthentication
from mongoengine import DoesNotExist
from backend.models import User

class MongoJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_id = validated_token.get("user_id")

        try:
            return User.objects.get(id=user_id)
        except DoesNotExist:
            return None
