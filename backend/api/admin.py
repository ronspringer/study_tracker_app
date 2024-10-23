from django.contrib import admin
from .models import Subject, StudySession, Progress, StudyTip

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('subject_name', 'user', 'created_at','updated_at')

@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ('subject', 'session_date', 'duration_minutes','notes','created_at','updated_at')

@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ('subject', 'total_minutes_studied', 'last_session_date','created_at','updated_at')

@admin.register(StudyTip)
class StudyTipAdmin(admin.ModelAdmin):
    list_display = ('subject', 'suggestion', 'generated_at')
