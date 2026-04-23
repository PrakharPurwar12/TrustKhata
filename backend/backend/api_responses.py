from rest_framework.response import Response

def success_response(data=None, status=200):
    """
    Standard successful response envelope.
    """
    return Response({
        "success": True,
        "data": data
    }, status=status)

def error_response(message, *, code="ERROR", status_code=400, details=None):
    """
    Standard error response envelope.
    """
    payload = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
        }
    }
    if details is not None:
        payload["error"]["details"] = details
    return Response(payload, status=status_code)
