from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from .serializers import UserSerializer, JobPostingSerializer, UserProfileSerializer, ReferenceSerializer, EducationSerializer
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from ..models import JobPosting, UserProfile, Reference, Education

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': serializer.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JobPostingViewSet(viewsets.ModelViewSet):
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = JobPosting.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(status='approved')
        return queryset

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user)

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        job = self.get_object()
        # Add application logic here
        return Response({'message': 'Application submitted successfully'})

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'put', 'patch', 'delete']  # Explicitly define allowed methods

    def get_object(self):
        return get_object_or_404(UserProfile, user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Handle file upload
        if 'resume' in request.FILES:
            # Delete old resume if it exists
            if instance.resume:
                instance.resume.delete()
            instance.resume = request.FILES['resume']
            instance.save()
        
        # Handle other fields
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=['get', 'post'])
    def references(self, request, pk=None):
        profile = self.get_object()
        if request.method == 'POST':
            serializer = ReferenceSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user_profile=profile)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        references = Reference.objects.filter(user_profile=profile)
        serializer = ReferenceSerializer(references, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'])
    def education(self, request, pk=None):
        profile = self.get_object()
        if request.method == 'POST':
            serializer = EducationSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user_profile=profile)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        education = Education.objects.filter(user_profile=profile)
        serializer = EducationSerializer(education, many=True)
        return Response(serializer.data) 