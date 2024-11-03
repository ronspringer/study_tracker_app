# Import necessary libraries and modules
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.utils import timezone
from datetime import datetime

# Import models and serializers
from .models import *
from .serializers import *
from .tensorflow_utils import get_study_data, preprocess_data, train_model, generate_study_tip

# Viewset for handling subjects
class SubjectViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    # List all subjects for the authenticated user
    def list(self, request):
        user = request.user
        queryset = self.queryset.filter(user=user)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    # Create a new subject for the authenticated user
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    # Retrieve a specific subject by primary key
    def retrieve(self, request, pk=None):
        subject = get_object_or_404(self.queryset, pk=pk)
        serializer = self.serializer_class(subject)
        return Response(serializer.data)

    # Update a specific subject by primary key
    def update(self, request, pk=None):
        subject = get_object_or_404(self.queryset, pk=pk)
        serializer = self.serializer_class(subject, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    # Delete a specific subject by primary key
    def destroy(self, request, pk=None):
        subject = get_object_or_404(self.queryset, pk=pk)
        subject.delete()
        return Response(status=204)


# Viewset for handling study sessions
class StudySessionViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = StudySession.objects.all()
    serializer_class = StudySessionSerializer

    # List all study sessions for a specific subject or all sessions
    def list(self, request):
        subject_id = request.query_params.get('subject')
        queryset = self.queryset.filter(subject_id=subject_id) if subject_id else self.queryset
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    # Create a new study session
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    # Retrieve a specific study session by primary key
    def retrieve(self, request, pk=None):
        session = get_object_or_404(self.queryset, pk=pk)
        serializer = self.serializer_class(session)
        return Response(serializer.data)

    # Update a specific study session by primary key
    def update(self, request, pk=None):
        session = get_object_or_404(self.queryset, pk=pk)
        serializer = self.serializer_class(session, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    # Delete a specific study session by primary key
    def destroy(self, request, pk=None):
        session = get_object_or_404(self.queryset, pk=pk)
        session.delete()
        return Response(status=204)
    

    # Action to get a study suggestion
    @action(detail=True, methods=['get'], url_path='get_study_suggestion')
    def get_study_suggestion(self, request, pk=None):
        try:
            user = request.user
            if user.is_anonymous:
                return JsonResponse({"error": "Authentication required."}, status=401)

            # Retrieve study data for the user
            sessions, progress = get_study_data(user)
            if not sessions or not progress:
                return JsonResponse({"error": "No study data available for the user."}, status=404)

            # Preprocess the data for model training
            data = preprocess_data(sessions, progress)

            # Get the specific subject or return 404 if not found
            subject = get_object_or_404(Subject, pk=pk)
            
            # Calculate the total session duration and total minutes studied for the subject
            subject_sessions = StudySession.objects.filter(subject=subject)
            total_minutes_studied = Progress.objects.filter(subject=subject).first().total_minutes_studied or 0
            
            # Get the most recent session time
            latest_session = subject_sessions.order_by('-session_date').first()
            session_time = latest_session.session_date if latest_session else None

            # If no session time, return an error
            if not session_time:
                return JsonResponse({"error": "No session data available for this subject."}, status=404)

            # Train the model once with the preprocessed data
            model = train_model(data)

            suggestion = generate_study_tip(model, subject, total_minutes_studied, session_time)
            
            return JsonResponse({"suggestion": suggestion})

        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return JsonResponse({"error": "Internal server error."}, status=500)


# Viewset for handling progress tracking
class ProgressViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer

    # List all progress records for the authenticated user
    def list(self, request):
        user = request.user
        subject_id = request.query_params.get('subject')
        queryset = self.queryset.filter(subject__user=user, subject_id=subject_id) if subject_id else self.queryset.filter(subject__user=user)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    # Create a new progress record
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    # Retrieve a specific progress record by primary key
    def retrieve(self, request, pk=None):
        progress = get_object_or_404(self.queryset, pk=pk)
        serializer = self.serializer_class(progress)
        return Response(serializer.data)

    # Update a specific progress record by primary key
    def update(self, request, pk=None):
        progress = get_object_or_404(self.queryset, pk=pk)
        serializer = self.serializer_class(progress, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    # Delete a specific progress record by primary key
    def destroy(self, request, pk=None):
        progress = get_object_or_404(self.queryset, pk=pk)
        progress.delete()
        return Response(status=204)


# Viewset for handling study tips
class StudyTipViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = StudyTip.objects.all()
    serializer_class = StudyTipSerializer

    # List all study tips for the authenticated user
    def list(self, request):
        user = request.user
        subject_id = request.query_params.get('subject')
        queryset = self.queryset.filter(subject__user=user, subject_id=subject_id) if subject_id else self.queryset.filter(subject__user=user)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    # Create a new study tip
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    # Retrieve a specific study tip by primary key
    def retrieve(self, request, pk=None):
        tip = get_object_or_404(self.queryset, pk=pk)
        serializer = self.serializer_class(tip)
        return Response(serializer.data)

    # Update a specific study tip by primary key
    def update(self, request, pk=None):
        tip = get_object_or_404(self.queryset, pk=pk)
        serializer = self.serializer_class(tip, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    # Delete a specific study tip by primary key
    def destroy(self, request, pk=None):
        tip = get_object_or_404(self.queryset, pk=pk)
        tip.delete()
        return Response(status=204)


# Registration view with token generation
class RegisterView(viewsets.ModelViewSet):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    # Create a new user and generate JWT tokens
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })


# Login view with token generation
class LoginView(viewsets.ViewSet):
    permission_classes = [AllowAny]

    # Authenticate user and generate JWT tokens
    def create(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })


# User profile management
class UserProfileViewset(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Retrieve user profile
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    # Update user profile
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
