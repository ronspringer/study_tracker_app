# Import necessary modules from Django Rest Framework and models
from rest_framework import serializers
from .models import *  # Import all models from the current module
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

"""
This module defines serializers for the study tracking application. Each serializer transforms model instances
to JSON format for API responses, handles data validation, and optionally manages model-specific logic like
password hashing for the User model.
"""

# Serializer for the Subject model to convert Subject instances to JSON format and handle data validation
class SubjectSerializer(serializers.ModelSerializer):
    """
    Serializes Subject model instances, converting them to JSON format.
    Includes the fields: id, user, and subject_name.
    """
    class Meta:
        model = Subject  # Specifies the model to serialize
        fields = ('id', 'user', 'subject_name')  # Specifies fields to include in the serialized data


# Serializer for StudySession model to handle data validation and serialization
class StudySessionSerializer(serializers.ModelSerializer):
    """
    Serializes StudySession model instances, providing a JSON representation with session details.
    Includes a read-only field for displaying the related subject name.
    """
    # Read-only field to include the subject name (from the related Subject model) in the serialized output
    subject_name = serializers.CharField(source='subject.subject_name', read_only=True)

    class Meta:
        model = StudySession  # Specifies the model to serialize
        fields = ('id', 'subject', 'subject_name', 'session_date', 'duration_minutes', 'notes')  # Fields to include


# Serializer for Progress model, enabling data validation and serialization
class ProgressSerializer(serializers.ModelSerializer):
    """
    Serializes Progress model instances, providing a JSON representation of progress data for each subject.
    Includes a read-only field for displaying the related subject name.
    """
    # Read-only field to include the subject name from the related Subject model in the serialized output
    subject_name = serializers.CharField(source='subject.subject_name', read_only=True)

    class Meta:
        model = Progress  # Specifies the model to serialize
        fields = ('id', 'subject', 'subject_name', 'total_minutes_studied', 'last_session_date')  # Fields to include


# Serializer for StudyTip model, responsible for validation and serialization
class StudyTipSerializer(serializers.ModelSerializer):
    """
    Serializes StudyTip model instances, providing a JSON format of study tips associated with subjects.
    Includes a read-only field for displaying the related subject name.
    """
    # Read-only field to display the subject name from the related Subject model in the serialized output
    subject_name = serializers.CharField(source='subject.subject_name', read_only=True)

    class Meta:
        model = StudyTip  # Specifies the model to serialize
        fields = ('id', 'subject', 'subject_name', 'suggestion')  # Fields to include in serialized data


# Serializer for user registration, extending the built-in User model
class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles user registration, serializing required fields for user creation and managing password hashing.
    """
    class Meta:
        model = User  # Specifies the User model for serialization
        fields = ('username', 'password', 'email')  # Fields required for registration

    def create(self, validated_data):
        """
        Overrides the create method to hash the password and create a new User instance.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user  # Returns the created user instance


# Serializer for user login, handles username and password validation
class LoginSerializer(serializers.Serializer):
    """
    Authenticates users based on username and password input.
    Validates user credentials and returns the user instance upon successful authentication.
    """
    username = serializers.CharField()  # Username field for login
    password = serializers.CharField()  # Password field for login

    def validate(self, data):
        """
        Validates user credentials using the authenticate function.
        Returns the user if credentials are correct; raises an error otherwise.
        """
        user = authenticate(**data)
        if user and user.is_active:
            return user  # Return authenticated user
        raise serializers.ValidationError("Invalid credentials")  # Raise validation error if credentials are invalid


# Serializer for general user details, including superuser status
class UserSerializer(serializers.ModelSerializer):
    """
    Provides a JSON representation of user details, including superuser status.
    Intended for retrieving user information.
    """
    class Meta:
        model = User  # Specifies the User model to serialize
        fields = ('id', 'username', 'email', 'is_superuser')  # Fields to include in serialized data


# Serializer for updating user profile information, including password change capability
class UserProfileSerializer(serializers.ModelSerializer):
    """
    Handles user profile updates, including fields for updating personal information.
    Allows password updates by including a write-only password field.
    """
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User  # Specifies the User model for serialization
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password']  # Fields for profile update

    def update(self, instance, validated_data):
        """
        Updates the user instance, including the option to change the password if provided.
        """
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)  # Hash the new password
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()  # Save changes to the user instance
        return instance  # Return updated user instance
