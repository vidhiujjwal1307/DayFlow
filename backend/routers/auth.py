from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Setting
from ..schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    email_clean = user_data.email.strip().lower()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    new_user = User(
        email=email_clean,
        name=user_data.name.strip(),
        hashed_password=hash_password(user_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Automatically create user's personal default settings
    default_setting = Setting(
        user_id=new_user.id,
        preferred_name=new_user.name,
        theme="light",
        default_start_time="09:00",
        default_end_time="18:00",
        week_start="Monday",
        reminders_enabled=True
    )
    db.add(default_setting)
    db.commit()

    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    email_clean = login_data.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
