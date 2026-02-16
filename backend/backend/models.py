# backend/models.py
from mongoengine import (
    Document,
    StringField,
    ListField,
    EmailField,
    DateField,
    FloatField,
    IntField,
    BooleanField,
    EmbeddedDocumentListField,
    EmbeddedDocument,
)
from mongoengine.fields import DateTimeField
from datetime import datetime


class User(Document):
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    full_name = StringField(required=True)
    phone = StringField()
    city = StringField()
    avatar_url = StringField()
    role = StringField(choices=["user", "admin"], default="user")
    favorite_categories = ListField(StringField())
    favorite_events = ListField(StringField())
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {"collection": "users", "ordering": ["-created_at"], "strict": False}

    @property
    def is_authenticated(self):
        return True

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super(User, self).save(*args, **kwargs)


class Event(Document):
    title = StringField(required=True)
    description = StringField()

    category = StringField(required=True)
    subcategory = StringField()

    date = DateField(required=True)
    time = StringField(required=True)
    end_date = DateField()

    location = StringField(required=True)
    city = StringField(required=True)
    address = StringField()

    price = FloatField(default=0)

    ticket_type = StringField(choices=["Free", "Paid", "Donation"], default="Paid")

    capacity = IntField()

    organizer_name = StringField()
    organizer_email = StringField()
    organizer_phone = StringField()

    image_url = StringField()
    banner_url = StringField()

    tags = ListField(StringField())

    status = StringField(
        choices=["Draft", "Published", "Cancelled", "Completed"], default="Published"
    )

    featured = BooleanField(default=False)
    attendees_count = IntField(default=0)

    created_by = StringField()

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {"collection": "events", "ordering": ["-created_at"], "strict": False}

    def to_json_safe(self):
        def safe_date(value):
            return value.isoformat() if isinstance(value, datetime) else value

        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "subcategory": self.subcategory,
            "date": safe_date(self.date),
            "time": self.time,
            "end_date": safe_date(self.end_date),
            "location": self.location,
            "city": self.city,
            "address": self.address,
            "price": self.price,
            "ticket_type": self.ticket_type,
            "capacity": self.capacity,
            "organizer_name": self.organizer_name,
            "organizer_email": self.organizer_email,
            "organizer_phone": self.organizer_phone,
            "image_url": self.image_url,
            "banner_url": self.banner_url,
            "tags": self.tags,
            "status": self.status,
            "featured": self.featured,
            "attendees_count": self.attendees_count,
            "created_by": self.created_by,
            "created_at": safe_date(self.created_at),
            "updated_at": safe_date(self.updated_at),
        }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super(Event, self).save(*args, **kwargs)

class Seat(EmbeddedDocument):
    row = IntField(required=True)
    column = IntField(required=True)


class Booking(Document):
    event_id = StringField(required=True)
    event_title = StringField()
    event_date = StringField()
    event_time = StringField()
    event_location = StringField()
    user_email = StringField(required=True)
    user_name = StringField()

    num_tickets = IntField(default=1)
    total_price = FloatField(required=True)

    seats = EmbeddedDocumentListField(Seat)

    booking_status = StringField(
        choices=["Confirmed", "Cancelled", "Pending"], default="Confirmed"
    )

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {"collection": "bookings", "ordering": ["-created_at"], "strict": False}

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
