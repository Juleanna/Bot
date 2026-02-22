import logging
import traceback

from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger("apps")


def custom_exception_handler(exc, context):
    """DRF exception handler that logs all API errors."""
    response = drf_exception_handler(exc, context)

    view = context.get("view")
    request = context.get("request")
    view_name = view.__class__.__name__ if view else "Unknown"
    method = request.method if request else "?"
    path = request.get_full_path() if request else "?"
    user = getattr(request, "user", None) if request else None
    user_str = str(user) if user and user.is_authenticated else "anonymous"

    if response is not None:
        if response.status_code >= 500:
            logger.error(
                "API 500 %s %s [%s] user=%s: %s",
                method,
                path,
                view_name,
                user_str,
                exc,
                exc_info=True,
            )
        elif response.status_code >= 400:
            logger.warning(
                "API %d %s %s [%s] user=%s: %s",
                response.status_code,
                method,
                path,
                view_name,
                user_str,
                exc,
            )
    else:
        # Unhandled exception — DRF will return 500
        logger.error(
            "Unhandled exception %s %s [%s] user=%s: %s\n%s",
            method,
            path,
            view_name,
            user_str,
            exc,
            traceback.format_exc(),
        )

    return response
