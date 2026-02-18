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


def make_booking(**kwargs):
    """Return a lightweight mock Booking object."""
    booking = MagicMock()
    booking.id = kwargs.get("id", "booking123")
    booking.event_id = kwargs.get("event_id", "event123")
    booking.event_title = kwargs.get("event_title", "Test Event")
    booking.event_date = kwargs.get("event_date", "2025-01-01")
    booking.event_time = kwargs.get("event_time", "18:00")
    booking.event_location = kwargs.get("event_location", "Warsaw")
    booking.user_email = kwargs.get("user_email", "test@example.com")
    booking.user_name = kwargs.get("user_name", "Test User")
    booking.num_tickets = kwargs.get("num_tickets", 2)
    booking.total_price = kwargs.get("total_price", 100.0)
    booking.booking_status = kwargs.get("booking_status", "Confirmed")
    booking.created_at = datetime(2025, 1, 1, 12, 0)
    booking.updated_at = datetime(2025, 1, 1, 12, 0)
    booking.seats = []
    return booking


class RegisterViewTests(TestCase):

    def setUp(self):
        self.factory = RequestFactory()

    @patch("backend.views.User")
    @patch("backend.views.make_password", return_value="hashed_pw")
    @patch("backend.views.RefreshToken")
    def test_register_success(self, mock_token, mock_hash, MockUser):
        """POST with valid data should return success and a token."""
        mock_user = make_user()
        MockUser.return_value = mock_user

        mock_refresh = MagicMock()
        mock_refresh.access_token = "access_token_value"
        mock_token.for_user.return_value = mock_refresh

        payload = {
            "email": "test@example.com",
            "password": "secret",
            "full_name": "Test User",
        }
        request = self.factory.post(
            "/register/", json.dumps(payload), content_type="application/json"
        )

        from backend.views import register_view
        response = register_view(request)
        data = json.loads(response.content)

        self.assertTrue(data["success"])
        self.assertIn("token", data)
        self.assertEqual(data["user"]["email"], "test@example.com")
        
    @patch("backend.views.User")
    @patch("backend.views.make_password", return_value="hashed_pw")
    def test_register_duplicate_email(self, mock_hash, MockUser):
        """Duplicate email should return success=False."""
        from mongoengine.errors import NotUniqueError
        MockUser.return_value.save.side_effect = NotUniqueError()

        payload = {"email": "dupe@example.com", "password": "pw", "full_name": "Dupe"}
        request = self.factory.post(
            "/register/", json.dumps(payload), content_type="application/json"
        )

        from backend.views import register_view
        response = register_view(request)
        data = json.loads(response.content)

        self.assertFalse(data["success"])
        self.assertIn("already exists", data["message"])
        
    def test_register_wrong_method(self):
        """GET request should return success=False."""
        request = self.factory.get("/register/")

        from backend.views import register_view
        response = register_view(request)
        data = json.loads(response.content)

        self.assertFalse(data["success"])
        self.assertIn("POST", data["message"])

class LoginViewTests(TestCase):

    def setUp(self):
        self.factory = RequestFactory()

    @patch("backend.views.User")
    @patch("backend.views.check_password", return_value=True)
    @patch("backend.views.RefreshToken")
    def test_login_success(self, mock_token, mock_check, MockUser):
        """Correct credentials should return user data and token."""
        mock_user = make_user()
        MockUser.objects.get.return_value = mock_user

        mock_refresh = MagicMock()
        mock_refresh.access_token = "tok"
        mock_token.for_user.return_value = mock_refresh

        payload = {"email": "test@example.com", "password": "secret"}
        request = self.factory.post(
            "/login/", json.dumps(payload), content_type="application/json"
        )

        from backend.views import login_view
        response = login_view(request)
        data = json.loads(response.content)

        self.assertTrue(data["success"])
        self.assertIn("token", data)
        self.assertEqual(data["user"]["email"], "test@example.com")
        
    @patch("backend.views.User")
    @patch("backend.views.check_password", return_value=False)
    def test_login_wrong_password(self, mock_check, MockUser):
        """Wrong password should return success=False."""
        MockUser.objects.get.return_value = make_user()

        payload = {"email": "test@example.com", "password": "wrongpw"}
        request = self.factory.post(
            "/login/", json.dumps(payload), content_type="application/json"
        )

        from backend.views import login_view
        response = login_view(request)
        data = json.loads(response.content)

        self.assertFalse(data["success"])
        self.assertIn("Invalid password", data["message"])
        
    @patch("backend.views.User")
    def test_login_user_not_found(self, MockUser):
        """Non-existent user should return success=False."""
        MockUser.objects.get.side_effect = MockUser.DoesNotExist()

        payload = {"email": "ghost@example.com", "password": "pw"}
        request = self.factory.post(
            "/login/", json.dumps(payload), content_type="application/json"
        )

        from backend.views import login_view
        response = login_view(request)
        data = json.loads(response.content)

        self.assertFalse(data["success"])
        self.assertIn("does not exist", data["message"])