# Import the admin module from Django to register models for the Django admin site
from django.contrib import admin
# Importing the models that will be registered with the admin interface
from .models import Subject, StudySession, Progress, StudyTip

# Register the Subject model in the Django admin and define how it should be displayed
@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    # Columns displayed in the list view for the Subject model in the admin site
    list_display = ('subject_name', 'user', 'created_at', 'updated_at')

# Register the StudySession model in the Django admin and define how it should be displayed
@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    # Columns displayed in the list view for the StudySession model in the admin site
    list_display = ('subject', 'session_date', 'duration_minutes', 'notes', 'created_at', 'updated_at')

# Register the Progress model in the Django admin and define how it should be displayed
@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    # Columns displayed in the list view for the Progress model in the admin site
    list_display = ('subject', 'total_minutes_studied', 'last_session_date', 'created_at', 'updated_at')

# Register the StudyTip model in the Django admin and define how it should be displayed
@admin.register(StudyTip)
class StudyTipAdmin(admin.ModelAdmin):
    # Columns displayed in the list view for the StudyTip model in the admin site
    list_display = ('subject', 'suggestion', 'generated_at')
