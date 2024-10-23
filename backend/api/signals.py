from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import StudySession, Progress
from django.db import models

@receiver(post_save, sender=StudySession)
def update_progress(sender, instance, **kwargs):
    subject = instance.subject
    progress, created = Progress.objects.get_or_create(subject=subject)

    # Update total minutes studied
    total_minutes = StudySession.objects.filter(subject=subject).aggregate(total=models.Sum('duration_minutes'))['total']
    progress.total_minutes_studied = total_minutes if total_minutes else 0

    # Update last session date
    last_session = StudySession.objects.filter(subject=subject).order_by('-session_date').first()
    if last_session:
        progress.last_session_date = last_session.session_date

    progress.save()
