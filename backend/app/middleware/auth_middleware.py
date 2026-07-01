# ─── SENTINEL Auth Middleware ─────────────────────────────────────────────────
# FastAPI dependencies for extracting and validating the current user.
# These are injected into route handlers via Depends().

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.services.auth_service import decode_token, get_user_by_id

# HTTPBearer automatically extracts 'Authorization: Bearer <token>' header
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency: Validates JWT token and returns the current User.
    
    Usage in a router:
        @router.get("/protected")
        def protected_route(user: User = Depends(get_current_user)):
            ...
    
    Raises HTTP 401 if:
        - No Authorization header is provided
        - Token is invalid or expired
        - User no longer exists in the database
    """
    token_data = decode_token(credentials.credentials)
    user = get_user_by_id(db, token_data.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency: Requires the current user to have 'admin' or 'analyst' role.
    
    Usage:
        @router.get("/admin-only")
        def admin_route(user: User = Depends(require_admin)):
            ...
    
    Raises HTTP 403 if the user's role is not admin/analyst.
    """
    if current_user.role not in ("admin", "analyst"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource.",
        )
    return current_user
