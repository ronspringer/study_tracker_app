from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-k)z!25bklwd#lrug&rhnt^p5itsermmtmn9z2p+#8tu=-06!@v'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    'localhost',  # Allow local development
    '127.0.0.1',  # Allow local development
    'backend-image-238886609739.us-central1.run.app',  # Your Cloud Run URL
]


# Application definition

# List of installed applications for the Django project
INSTALLED_APPS = [
    'django.contrib.admin',         # Django's admin interface
    'django.contrib.auth',          # Authentication system
    'django.contrib.contenttypes',  # Content type framework
    'django.contrib.sessions',       # Session framework
    'django.contrib.messages',       # Messaging framework
    'django.contrib.staticfiles',    # Static files management
    'rest_framework',               # Django REST Framework
    'rest_framework_simplejwt',     # JWT authentication for REST Framework
    'corsheaders',                  # Middleware for handling CORS
    'api'                           # Custom application for API logic
]

# Middleware configuration for the Django project
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # CORS middleware to handle cross-origin requests
    'django.middleware.security.SecurityMiddleware',  # Middleware for security enhancements
    'django.contrib.sessions.middleware.SessionMiddleware',  # Middleware for session management
    'django.middleware.common.CommonMiddleware',  # Common middleware for various functionalities
    'django.middleware.csrf.CsrfViewMiddleware',  # Middleware for Cross-Site Request Forgery protection
    'django.contrib.auth.middleware.AuthenticationMiddleware',  # Middleware for user authentication
    'django.contrib.messages.middleware.MessageMiddleware',  # Middleware for temporary messages
    'django.middleware.clickjacking.XFrameOptionsMiddleware',  # Middleware to prevent clickjacking attacks
]

# List of allowed origins for CORS (Cross-Origin Resource Sharing)
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # Allow requests from this origin
    'https://frontend-image-238886609739.us-central1.run.app',
]

ROOT_URLCONF = 'crud.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'crud.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # Use JWT for authentication
    ),
}

from datetime import timedelta

# JWT settings for the application
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),  # Access token lifetime set to 5 minutes
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),     # Refresh token lifetime set to 1 day
    'ROTATE_REFRESH_TOKENS': True,                    # Enable token rotation
    'BLACKLIST_AFTER_ROTATION': True,                  # Blacklist the old refresh token after rotation
    'AUTH_HEADER_TYPES': ('Bearer',),                  # Specify the authentication header type
}