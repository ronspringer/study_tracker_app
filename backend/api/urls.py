from django.urls import path
from .views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('subject', SubjectViewset, basename='subject')
router.register('studysession', StudySessionViewset, basename='studysession')
router.register('studyprogress', ProgressViewset, basename='studyprogress')
router.register('studytip', StudyTipViewset, basename='studytip')
router.register('register', RegisterView, basename='register')
router.register('login', LoginView, basename='login')
router.register('userprofile', UserProfileViewset, basename='userprofile')
urlpatterns = router.urls