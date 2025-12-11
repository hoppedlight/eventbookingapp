# backend/models.py
from mongoengine import Document, StringField, ListField, EmailField, DateField, FloatField, IntField, BooleanField
from mongoengine.fields import DateTimeField
from datetime import datetime

class User(Document):
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    full_name = StringField(required=True)
    phone = StringField()
    city = StringField()
    avatar_url = StringField()
    role = StringField(choices=['user', 'admin'], default='user')
    favorite_categories = ListField(StringField())
    favorite_events = ListField(StringField())
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'users',
        'ordering': ['-created_at'],
        'strict': False
    }
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

    ticket_type = StringField(
        choices=['Free', 'Paid', 'Donation'],
        default='Paid'
    )

    capacity = IntField()

    organizer_name = StringField()
    organizer_email = StringField()
    organizer_phone = StringField()

    image_url = StringField()
    banner_url = StringField()

    tags = ListField(StringField())

    status = StringField(
        choices=['Draft', 'Published', 'Cancelled', 'Completed'],
        default='Published'
    )

    featured = BooleanField(default=False)
    attendees_count = IntField(default=0)

    created_by = StringField()

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'events',
        'ordering': ['-created_at'],
        'strict': False
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super(Event, self).save(*args, **kwargs)