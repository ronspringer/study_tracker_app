from rest_framework import viewsets, permissions
from .serializers import *
from rest_framework.response import Response
from .models import *
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .tensorflow_utils import get_study_data, preprocess_data, train_model, generate_study_tip
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from django.http import JsonResponse
from django.utils import timezone
from datetime import datetime


class SubjectViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]  # Ensure the user is authenticated to view subjects
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    def list(self, request):
        # Filter subjects by the currently logged-in user
        user = request.user
        queryset = self.queryset.filter(user=user)  # Filter by the logged-in user
        
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # Assign the logged-in user as the owner of the subject
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def retrieve(self, request, pk=None):
        subject = self.queryset.get(pk=pk)
        serializer = self.serializer_class(subject)
        return Response(serializer.data)

    def update(self, request, pk=None):
        subject = self.queryset.get(pk=pk)
        serializer = self.serializer_class(subject, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        subject = self.queryset.get(pk=pk)
        subject.delete()
        return Response(status=204)


class StudySessionViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]  # Ensure this is the correct spelling
    queryset = StudySession.objects.all()
    serializer_class = StudySessionSerializer

    def list(self, request):
        subject_id = request.query_params.get('subject', None)
        
        if subject_id:
            queryset = self.queryset.filter(subject_id=subject_id)
        else:
            queryset = self.queryset.all()

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)  # Return status 201 for created
        else:
            return Response(serializer.errors, status=400)

    def retrieve(self, request, pk=None):
        studysession = get_object_or_404(self.queryset, pk=pk)
        serializer = self.serializer_class(studysession)
        return Response(serializer.data)

    def update(self, request, pk=None):
        studysession = get_object_or_404(self.queryset, pk=pk)
        serializer = self.serializer_class(studysession, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        studysession = get_object_or_404(self.queryset, pk=pk)
        studysession.delete()
        return Response(status=204)
    
    # Action to get study suggestion
    @action(detail=True, methods=['get'], url_path='get_study_suggestion')
    def get_study_suggestion(self, request, pk=None):
        try:
            user = request.user
            if user.is_anonymous:
                return JsonResponse({"error": "Authentication required."}, status=401)

            # Fetch study data and preprocess it
            sessions, progress = get_study_data(user)
            data = preprocess_data(sessions, progress)

            # Get the specified subject instance
            subject = Subject.objects.get(pk=pk)

            # Fetch all study sessions for the subject
            sessions = StudySession.objects.filter(subject=subject).values('session_date', 'duration_minutes')
            duration_minutes = sum(session['duration_minutes'] for session in sessions)

            # Get total study time from progress for the subject
            progress = Progress.objects.filter(subject=subject).first()
            total_minutes_studied = progress.total_minutes_studied if progress else 0

            # Determine session time (latest or average session time)
            if sessions:
                latest_session_date = max(session['session_date'] for session in sessions)
                session_time = latest_session_date
            else:
                session_time = datetime.now()  # Default to current time if no sessions

            # Load or train model
            model = train_model(data)  # Ensure model is trained on relevant data

            # Generate suggestions
            suggestion = generate_study_tip(model, subject, duration_minutes, total_minutes_studied, session_time)

            return JsonResponse({"suggestion": suggestion})

        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return JsonResponse({"error": "Internal server error."}, status=500)

class ProgressViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer

    def list(self, request):
        user = request.user
        subject_id = request.query_params.get('subject', None)

        if subject_id:
            # Filter by subject and the user associated with the subject
            queryset = self.queryset.filter(subject__user=user, subject_id=subject_id)
        else:
            # Filter all progress entries by the user associated with the subject
            queryset = self.queryset.filter(subject__user=user)

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def retrieve(self, request, pk=None):
        try:
            progress = self.queryset.get(pk=pk)
            serializer = self.serializer_class(progress)
            return Response(serializer.data)
        except Progress.DoesNotExist:
            return Response({'error': 'Progress not found'}, status=404)

    def update(self, request, pk=None):
        try:
            progress = self.queryset.get(pk=pk)
            serializer = self.serializer_class(progress, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except Progress.DoesNotExist:
            return Response({'error': 'Progress not found'}, status=404)

    def destroy(self, request, pk=None):
        try:
            progress = self.queryset.get(pk=pk)
            progress.delete()
            return Response(status=204)
        except Progress.DoesNotExist:
            return Response({'error': 'Progress not found'}, status=404)

class StudyTipViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = StudyTip.objects.all()
    serializer_class = StudyTipSerializer

    def list(self, request):
        user = request.user
        subject_id = request.query_params.get('subject', None)

        if subject_id:
            queryset = self.queryset.filter(subject__user=user, subject_id=subject_id)
        else:
            queryset = self.queryset.filter(subject__user=user)

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def retrieve(self, request, pk=None):
        studytip = self.queryset.get(pk=pk)
        serializer = self.serializer_class(studytip)
        return Response(serializer.data)

    def update(self, request, pk=None):
        studytip = self.queryset.get(pk=pk)
        serializer = self.serializer_class(studytip,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        studytip = self.queryset.get(pk=pk)
        studytip.delete()
        return Response(status=204)

class RegisterView(viewsets.ModelViewSet):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
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

class LoginView(viewsets.ViewSet):
    permission_classes = [AllowAny]

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

    def retrieve(self, request):
        # You can return a login form or just a message.
        return Response({"message": "Please send a POST request to login."})