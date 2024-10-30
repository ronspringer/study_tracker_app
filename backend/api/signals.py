"""
This module contains a signal handler for updating progress tracking 
related to study sessions in the application.

When a StudySession instance is saved, this module listens for the 
`post_save` signal and performs the following actions:

1. Retrieves or creates a Progress instance associated with the subject 
   of the StudySession.
2. Aggregates the total minutes studied for the subject from all related 
   StudySession instances.
3. Updates the total_minutes_studied field in the Progress instance, 
   setting it to 0 if no sessions exist.
4. Determines the most recent session date and updates the 
   last_session_date field in the Progress instance.
5. Saves the updated Progress instance to the database.

This ensures that the Progress model accurately reflects the current 
study session statistics for each subject whenever a new study session 
is recorded.
"""

# Import necessary modules and functions for Django signals and database models
from django.db.models.signals import post_save  # Signal for handling actions after saving a model instance
from django.dispatch import receiver  # Decorator to connect signal handlers to signals
from .models import StudySession, Progress  # Import StudySession and Progress models from current app
from django.db import models  # Import Django models module for database-related functions

# Signal handler that updates the Progress model whenever a StudySession instance is saved
@receiver(post_save, sender=StudySession)
def update_progress(sender, instance, **kwargs):
    # Get the subject related to the current StudySession instance
    subject = instance.subject

    # Retrieve or create a Progress instance for the subject (unique for each subject)
    progress, created = Progress.objects.get_or_create(subject=subject)

    # Calculate the total minutes studied for the subject by aggregating durations from all sessions
    total_minutes = StudySession.objects.filter(subject=subject).aggregate(total=models.Sum('duration_minutes'))['total']
    # Update the total_minutes_studied field in Progress (set to 0 if there are no sessions)
    progress.total_minutes_studied = total_minutes if total_minutes else 0

    # Find the most recent session date for the subject by ordering StudySessions
    last_session = StudySession.objects.filter(subject=subject).order_by('-session_date').first()
    # Update the last_session_date field in Progress with the date of the latest session, if it exists
    if last_session:
        progress.last_session_date = last_session.session_date

    # Save the updated Progress instance
    progress.save()
