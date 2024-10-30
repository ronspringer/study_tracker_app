# Import necessary modules and views
from django.urls import path  # Django function for defining URL patterns
from .views import *  # Import all view classes from the views module in the current app
from rest_framework.routers import DefaultRouter  # DefaultRouter from DRF for automatic route generation

# Initialize a DefaultRouter instance to handle routing for viewsets
router = DefaultRouter()

# Register each viewset with the router, associating each with a URL prefix and a basename
router.register('subject', SubjectViewset, basename='subject')  # Register SubjectViewset for subject-related routes
router.register('studysession', StudySessionViewset, basename='studysession')  # Register StudySessionViewset for session-related routes
router.register('studyprogress', ProgressViewset, basename='studyprogress')  # Register ProgressViewset for progress-related routes
router.register('studytip', StudyTipViewset, basename='studytip')  # Register StudyTipViewset for study tip routes
router.register('register', RegisterView, basename='register')  # Register RegisterView for user registration route
router.register('login', LoginView, basename='login')  # Register LoginView for user login route
router.register('userprofile', UserProfileViewset, basename='userprofile')  # Register UserProfileViewset for user profile routes

# Assign the automatically generated URL patterns from the router to urlpatterns
urlpatterns = router.urls
