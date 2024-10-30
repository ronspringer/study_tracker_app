# Import necessary modules from Django
from django.db import models
from django.conf import settings

"""
This module defines the models for a study tracking application, including subjects, study sessions, progress tracking, 
and study tips. Each model represents a table in the database.
"""

# Define the Subject model representing a study subject associated with a user
class Subject(models.Model):
    """
    Represents a study subject associated with a specific user.
    Includes fields for the subject name, user association, and timestamps for creation and updates.
    """
    # Foreign key linking each subject to a specific user; if the user is deleted, related subjects are also deleted
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    # Name of the subject with a maximum length of 100 characters
    subject_name = models.CharField(max_length=100)
    # Timestamp automatically set when the subject is created
    created_at = models.DateTimeField(auto_now_add=True)
    # Timestamp automatically updated whenever the subject is modified
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """
        Returns a string representation of the model to display the subject name.
        """
        return self.subject_name


# Define the StudySession model, representing individual study sessions for a subject
class StudySession(models.Model):
    """
    Represents an individual study session for a given subject.
    Includes fields for session date, duration, notes, and timestamps for tracking.
    """
    # Foreign key linking each study session to a specific subject; if the subject is deleted, sessions are also deleted
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    # Date and time of the study session
    session_date = models.DateTimeField()
    # Duration of the study session in minutes (positive integer)
    duration_minutes = models.PositiveIntegerField()
    # Notes about the session, optional field
    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """
        Returns a string representation to show the subject name and session date.
        """
        return f"{self.subject.subject_name} on {self.session_date}"


# Define the Progress model to track overall progress for a specific subject
class Progress(models.Model):
    """
    Represents cumulative progress for a subject, tracking total study time and the last session date.
    Helps users monitor study achievements for each subject over time.
    """
    # Foreign key linking progress to a specific subject; if the subject is deleted, progress records are also deleted
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    # Total minutes studied for this subject, with a default value of 0
    total_minutes_studied = models.PositiveIntegerField(default=0)
    # Date of the most recent study session; optional field
    last_session_date = models.DateField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """
        Returns a string representation to display progress information for the subject.
        """
        return f"Progress for {self.subject.subject_name}"


# Define the StudyTip model for storing study tips generated for each subject
class StudyTip(models.Model):
    """
    Stores study tips generated for individual subjects, providing users with helpful suggestions for study improvement.
    Includes fields for suggestion text and generation timestamp.
    """
    # Foreign key linking each study tip to a specific subject; if the subject is deleted, related tips are also deleted
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    # Suggestion text containing the study tip
    suggestion = models.TextField()
    # Timestamp automatically set when the study tip is generated
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """
        Returns a string representation to display the tip associated with the subject.
        """
        return f"Tip for {self.subject.subject_name}"
