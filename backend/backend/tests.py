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


class FetchEventsTests(TestCase):

    def setUp(self):
        self.factory = RequestFactory()

    @patch("backend.views.Event")
    def test_fetch_all_events(self, MockEvent):
        """GET without filters should return all events."""
        mock_event = MagicMock()
        mock_event.to_mongo.return_value.to_dict.return_value = {
            "_id": "event123",
            "title": "Test Event",
        }
        MockEvent.objects.return_value = [mock_event]

        request = self.factory.get("/events/")
        request.user = make_user()

        from backend.views import fetch_events

        response = fetch_events(request)

        self.assertEqual(response.status_code, 200)
        data = response.data
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["id"], "event123")

    @patch("backend.views.Event")
    def test_fetch_event_by_id(self, MockEvent):
        """GET with ?id= should return a single event."""
        mock_event = MagicMock()
        mock_event.to_mongo.return_value.to_dict.return_value = {
            "_id": "event123",
            "title": "Specific Event",
        }
        MockEvent.objects.get.return_value = mock_event

        request = self.factory.get("/events/", {"id": "event123"})
        request.user = make_user()

        from backend.views import fetch_events

        response = fetch_events(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["id"], "event123")

    @patch("backend.views.Event")
    def test_fetch_event_by_id_not_found(self, MockEvent):
        """GET with unknown id should return empty list."""
        MockEvent.objects.get.side_effect = MockEvent.DoesNotExist()

        request = self.factory.get("/events/", {"id": "nonexistent"})
        request.user = make_user()

        from backend.views import fetch_events

        response = fetch_events(request)

        self.assertEqual(response.data, [])


class CreateEventTests(TestCase):

    def setUp(self):
        self.factory = RequestFactory()

    @patch("backend.views.Event")
    @patch("backend.views.User")
    def test_create_event_success(self, MockUser, MockEvent):
        """Authenticated POST with valid data should create an event."""
        MockUser.objects.get.return_value = make_user()
        mock_event = make_event()
        MockEvent.return_value = mock_event

        request = self.factory.post("/events/create/")
        request.user = make_user()
        request.data = {
            "title": "New Event",
            "description": "A cool event",
            "category": "Music",
            "date": "2025-06-01",
            "time": "18:00",
            "location": "Poznan",
            "city": "Poznan",
            "price": 50,
            "ticket_type": "Paid",
            "capacity": 100,
        }

        from backend.views import create_event

        response = create_event(request)

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["success"])

    @patch("backend.views.Event")
    @patch("backend.views.User")
    def test_create_event_exception(self, MockUser, MockEvent):
        """If an exception is raised, should return 500."""
        MockUser.objects.get.return_value = make_user()
        MockEvent.side_effect = Exception("DB error")

        request = self.factory.post("/events/create/")
        request.user = make_user()
        request.data = {"title": "Bad Event"}

        from backend.views import create_event

        response = create_event(request)

        self.assertEqual(response.status_code, 500)
        self.assertIn("error", response.data)


class DeleteEventTests(TestCase):

    def setUp(self):
        self.factory = RequestFactory()

    @patch("backend.views.Event")
    def test_delete_event_success(self, MockEvent):
        """Owner deleting their event should return success."""
        user = make_user()
        mock_event = make_event(created_by=user.email)
        MockEvent.objects.get.return_value = mock_event

        request = self.factory.delete("/events/delete/event123/")
        request.user = user

        from backend.views import delete_event

        response = delete_event(request, "event123")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        mock_event.delete.assert_called_once()

    @patch("backend.views.Event")
    def test_delete_event_forbidden(self, MockEvent):
        """Non-owner should receive 403."""
        mock_event = make_event(created_by="other@example.com")
        MockEvent.objects.get.return_value = mock_event

        request = self.factory.delete("/events/delete/event123/")
        request.user = make_user(email="me@example.com")

        from backend.views import delete_event

        response = delete_event(request, "event123")

        self.assertEqual(response.status_code, 403)

    @patch("backend.views.Event")
    def test_delete_event_not_found(self, MockEvent):
        """Deleting a non-existent event should return 404."""
        from mongoengine.errors import DoesNotExist

        MockEvent.objects.get.side_effect = DoesNotExist()

        request = self.factory.delete("/events/delete/missing/")
        request.user = make_user()

        from backend.views import delete_event

        response = delete_event(request, "missing")

        self.assertEqual(response.status_code, 404)


class CreateBookingTests(TestCase):

    def setUp(self):
        self.factory = RequestFactory()

    @patch("backend.views.Booking")
    @patch("backend.views.Event")
    def test_create_booking_success(self, MockEvent, MockBooking):
        """Valid booking request should return booking_id."""
        MockBooking.objects.return_value = []  # no existing bookings
        mock_booking = make_booking()
        MockBooking.return_value = mock_booking
        MockEvent.objects.get.return_value = make_event()

        request = self.factory.post("/bookings/create/")
        request.user = make_user()
        request.data = {
            "event_id": "event123",
            "event_title": "Test Event",
            "event_date": "2025-06-01",
            "event_time": "18:00",
            "event_location": "Poznan",
            "seats": [{"row": 1, "column": 1}, {"row": 1, "column": 2}],
            "total_price": 100.0,
        }

        from backend.views import create_booking

        response = create_booking(request)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertIn("booking_id", response.data)

    @patch("backend.views.Booking")
    def test_create_booking_missing_fields(self, MockBooking):
        """Missing required fields should return 400."""
        request = self.factory.post("/bookings/create/")
        request.user = make_user()
        request.data = {}  # missing event_id, seats, total_price

        from backend.views import create_booking

        response = create_booking(request)

        self.assertEqual(response.status_code, 400)

    @patch("backend.views.Booking")
    def test_create_booking_seat_collision(self, MockBooking):
        """Attempting to book an already reserved seat should return 400."""
        taken_seat = MagicMock()
        taken_seat.row = 1
        taken_seat.column = 1

        existing_booking = MagicMock()
        existing_booking.seats = [taken_seat]
        MockBooking.objects.return_value = [existing_booking]

        request = self.factory.post("/bookings/create/")
        request.user = make_user()
        request.data = {
            "event_id": "event123",
            "seats": [{"row": 1, "column": 1}],
            "total_price": 50.0,
        }

        from backend.views import create_booking

        response = create_booking(request)

        self.assertEqual(response.status_code, 400)
        self.assertIn("already reserved", response.data["error"])


class ListBookingsTests(TestCase):

    def setUp(self):
        self.factory = RequestFactory()

    @patch("backend.views.Booking")
    def test_list_all_bookings(self, MockBooking):
        """Without user_email filter, should return all bookings."""
        MockBooking.objects.return_value = [make_booking()]

        request = self.factory.get("/bookings/")
        request.user = make_user()
        request.query_params = {}

        from backend.views import list_bookings

        response = list_bookings(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    @patch("backend.views.Booking")
    def test_list_bookings_filtered_by_email(self, MockBooking):
        """With user_email filter, should pass filter to queryset."""
        MockBooking.objects.return_value = [make_booking()]

        request = self.factory.get("/bookings/", {"user_email": "test@example.com"})
        request.user = make_user()
        request.query_params = {"user_email": "test@example.com"}

        from backend.views import list_bookings

        response = list_bookings(request)

        MockBooking.objects.assert_called_with(user_email="test@example.com")
        self.assertEqual(response.status_code, 200)


class GetBookingTests(TestCase):

    def setUp(self):
        self.factory = RequestFactory()

    @patch("backend.views.Booking")
    def test_get_booking_success(self, MockBooking):
        """Valid booking_id should return booking details."""
        MockBooking.objects.get.return_value = make_booking()

        request = self.factory.get("/bookings/booking123/")
        request.user = make_user()

        from backend.views import get_booking

        response = get_booking(request, "booking123")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], "booking123")

    @patch("backend.views.Booking")
    def test_get_booking_not_found(self, MockBooking):
        """Non-existent booking_id should return 404."""
        from mongoengine.errors import DoesNotExist

        MockBooking.objects.get.side_effect = DoesNotExist()

        request = self.factory.get("/bookings/ghost/")
        request.user = make_user()

        from backend.views import get_booking

        response = get_booking(request, "ghost")

        self.assertEqual(response.status_code, 404)
        
class UpdateBookingTests(TestCase):

    def setUp(self):
        self.factory = RequestFactory()

    @patch("backend.views.Booking")
    def test_update_booking_success(self, MockBooking):
        """Valid update should return success."""
        MockBooking.objects.get.return_value = make_booking()

        request = self.factory.put("/bookings/booking123/update/")
        request.user = make_user()
        request.data = {"booking_status": "Cancelled"}

        from backend.views import update_booking
        response = update_booking(request, "booking123")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        
    @patch("backend.views.Booking")
    def test_update_booking_not_found(self, MockBooking):
        """Updating a non-existent booking should return 404."""
        from mongoengine.errors import DoesNotExist
        MockBooking.objects.get.side_effect = DoesNotExist()

        request = self.factory.put("/bookings/ghost/update/")
        request.user = make_user()
        request.data = {"booking_status": "Cancelled"}

        from backend.views import update_booking
        response = update_booking(request, "ghost")

        self.assertEqual(response.status_code, 404)
        
class GetReservedSeatsTests(TestCase):

    def setUp(self):
        self.factory = RequestFactory()

    @patch("backend.views.Booking")
    def test_get_reserved_seats(self, MockBooking):
        """Should return list of reserved seat dicts."""
        seat = MagicMock()
        seat.row = 2
        seat.column = 3

        booking = MagicMock()
        booking.seats = [seat]
        MockBooking.objects.return_value = [booking]

        request = self.factory.get("/events/event123/reserved-seats/")
        request.user = make_user()

        from backend.views import get_reserved_seats
        response = get_reserved_seats(request, "event123")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [{"row": 2, "column": 3}])
        
class GetCurrentUserTests(TestCase):

    def setUp(self):
        self.factory = RequestFactory()

    @patch("backend.views.User")
    def test_get_current_user_success(self, MockUser):
        """Authenticated user should get their profile."""
        MockUser.objects.get.return_value = make_user()

        request = self.factory.get("/users/me/")
        request.user = make_user()

        from backend.views import get_current_user
        response = get_current_user(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], "test@example.com")

    @patch("backend.views.User")
    def test_get_current_user_not_found(self, MockUser):
        """If user not in DB, should return 404."""
        from mongoengine.errors import DoesNotExist
        MockUser.objects.get.side_effect = DoesNotExist()

        request = self.factory.get("/users/me/")
        request.user = make_user()

        from backend.views import get_current_user
        response = get_current_user(request)

        self.assertEqual(response.status_code, 404)

class UpdateCurrentUserTests(TestCase):

    def setUp(self):
        self.factory = RequestFactory()

    @patch("backend.views.User")
    def test_update_user_success(self, MockUser):
        """Should update allowed fields and return updated profile."""
        mock_user = make_user()
        MockUser.objects.get.return_value = mock_user

        request = self.factory.put("/users/me/update/")
        request.user = make_user()
        request.data = {"full_name": "Updated Name", "city": "Krakow"}

        from backend.views import update_current_user
        response = update_current_user(request)

        self.assertEqual(response.status_code, 200)
        mock_user.save.assert_called_once()