from django.db import models
from django.conf import settings

class Subject(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.subject_name

class StudySession(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    session_date = models.DateField()
    duration_minutes = models.PositiveIntegerField()  # duration in minutes
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.subject.subject_name} on {self.session_date}"

class Progress(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    total_minutes_studied = models.PositiveIntegerField(default=0)
    last_session_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Progress for {self.subject.subject_name}"

class StudyTip(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    suggestion = models.TextField()
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Tip for {self.user.username}"
    
