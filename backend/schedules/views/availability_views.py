from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from schedules.serializers import AvailabilityCreateSerializer, AvailabilitySerializer


class AccountAvailabilityView(APIView):
    # permission_classes = (IsAuthenticated, )
    serializer_class = AvailabilitySerializer

    def post(self, request, pk):

        data = request.data.copy()
        # Ensure the account is set to the logged-in employee
        data['id'] = request.user.id 

        # Validate and save the availability record
        serializer = AvailabilityCreateSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)