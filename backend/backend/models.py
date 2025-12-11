# backend/models.py
from mongoengine import Document, StringField, ListField, EmailField
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
