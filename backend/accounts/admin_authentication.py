
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


class AdminJWTAuthentication(JWTAuthentication):

    def authenticate(self, request):
        result = super().authenticate(request)

        if result is None:
            return None

        user, validated_token = result

        if validated_token.get("role") != "admin":
            raise AuthenticationFailed(
                "Admin access token required."
            )

        return user, validated_token
