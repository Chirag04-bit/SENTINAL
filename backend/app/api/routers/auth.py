# ─── SENTINEL Auth Router ─────────────────────────────────────────────────────
# Endpoints: POST /auth/login, POST /auth/register, GET /auth/me

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.services import auth_service
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="User Login",
    description="Authenticate with email and password. Returns a JWT access token.",
)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    **POST /auth/login**
    
    Request:  { email, password }
    Response: { access_token, token_type, user }
    Errors:   401 — invalid credentials | 403 — account inactive
    """
    user  = auth_service.authenticate_user(db, request.email, request.password)
    token = auth_service.create_access_token(user)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=201,
    summary="Register New Account",
    description="Create a new SENTINEL user account. Returns JWT token immediately.",
)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    **POST /auth/register**
    
    Request:  { name, email, password }
    Response: { access_token, token_type, user }
    Errors:   409 — email already exists | 422 — validation error
    """
    user  = auth_service.create_user(db, request.name, request.email, request.password)
    token = auth_service.create_access_token(user)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get Current User",
    description="Returns the authenticated user's profile.",
)
def get_me(current_user: User = Depends(get_current_user)):
    """
    **GET /auth/me**
    
    Auth:     Bearer token required
    Response: UserResponse object
    """
    return UserResponse.model_validate(current_user)


@router.post(
    "/logout",
    summary="User Logout",
    description="Invalidate session on client side. Backend returns success.",
)
def logout():
    return {"message": "Logged out successfully"}
