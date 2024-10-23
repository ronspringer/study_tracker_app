from rest_framework import serializers
from .models import *  # Ensure all models are imported
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ('id', 'user', 'subject_name')

class StudySessionSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.subject_name', read_only=True)

    class Meta:
        model = StudySession
        fields = ('id', 'subject', 'subject_name', 'session_date', 'duration_minutes', 'notes')

class ProgressSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.subject_name', read_only=True)

    class Meta:
        model = Progress
        fields = ('id', 'subject', 'subject_name', 'total_minutes_studied', 'last_session_date')

class StudyTipSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.subject_name', read_only=True)

    class Meta:
        model = StudyTip
        fields = ('id', 'subject', 'subject_name', 'suggestion')

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid credentials")

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')