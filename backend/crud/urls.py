from django.contrib import admin  # Import the Django admin module
from django.urls import path, include  # Import path and include functions for URL routing
from rest_framework_simplejwt.views import (TokenObtainPairView, TokenRefreshView)  # Import views for JWT token management

# URL patterns for the Django project
urlpatterns = [
    path('admin/', admin.site.urls),  # URL for accessing the Django admin interface
    path('', include('api.urls')),  # Include URL patterns from the 'api' app
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # URL for obtaining JWT access and refresh tokens
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # URL for refreshing JWT tokens
]
