from django.test import TestCase, RequestFactory
from unittest.mock import patch, MagicMock, PropertyMock
import json
from datetime import datetime


# Create your tests here.
def make_user(**kwargs):
    """Return a lightweight mock User object."""
    user = MagicMock()
    user.id = kwargs.get("id", "user123")
    user.email = kwargs.get("email", "test@example.com")
    user.full_name = kwargs.get("full_name", "Test User")
    user.phone = kwargs.get("phone", "123456789")
    user.city = kwargs.get("city", "Warsaw")
    user.avatar_url = kwargs.get("avatar_url", "")
    user.role = kwargs.get("role", "user")
    user.favorite_categories = kwargs.get("favorite_categories", [])
    user.favorite_events = kwargs.get("favorite_events", [])
    user.is_authenticated = True
    user.password = kwargs.get("password", "hashed_pw")
    return user


def make_event(**kwargs):
    """Return a lightweight mock Event object."""
    event = MagicMock()
    event.id = kwargs.get("id", "event123")
    event.title = kwargs.get("title", "Test Event")
    event.created_by = kwargs.get("created_by", "test@example.com")
    event.attendees_count = kwargs.get("attendees_count", 0)
    return event
