"""
URL configuration for eventbookingapp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from backend.views import (
    login_view,
    register_view,
    get_current_user,
    update_current_user,
    fetch_events,
    create_booking,
    get_user_bookings,
    get_reserved_seats,
    create_event,
    upload_file,
    delete_event,
)

urlpatterns = [
    path("api/register/", register_view),
    path("api/login/", login_view),
    path("api/me/", get_current_user),
    path("api/me/update/", update_current_user),
    path("api/events/", fetch_events),
    path("api/events/<str:event_id>/reserved-seats/", get_reserved_seats),
    path("api/events/create/", create_event),
    path("api/events/delete/<str:event_id>/", delete_event, name="delete_event"),
    path("api/bookings/", create_booking),
    path("api/bookings/get/", get_user_bookings),
    path("api/upload/", upload_file, name="upload-file"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
