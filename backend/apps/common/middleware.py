import logging
import time

logger = logging.getLogger("requests_logger")


class RequestLoggingMiddleware:
    """Logs every HTTP request with method, path, status, and duration."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.monotonic()
        response = self.get_response(request)
        duration_ms = (time.monotonic() - start) * 1000

        user = getattr(request, "user", None)
        user_str = str(user) if user and hasattr(user, "is_authenticated") and user.is_authenticated else "anonymous"

        logger.info(
            "%s %s %d %.0fms user=%s",
            request.method,
            request.get_full_path(),
            response.status_code,
            duration_ms,
            user_str,
        )

        return response
