from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
from sqlmodel import Session, select
from ..database import get_session
from ..models import User, UserCreate, UserRead, UserUpdate
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user
from datetime import timedelta

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    statement = select(User).where(User.username == form_data.username)
    user = session.exec(statement).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@router.post("/", response_model=UserRead)
def create_user(user: UserCreate, session: Session = Depends(get_session)): # Removed current_user dependency for initial setup ease, typically admin only
    # Check if user exists
    statement = select(User).where(User.username == user.username)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    # Exclude password, unpack the rest, and add hashed_password explicitly
    user_data = user.dict(exclude={"password"})
    db_user = User(**user_data, hashed_password=hashed_password)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    # Generate Info Alert
    from ..models import Alert
    # Alert doesn't have user_id field for target, just generic info
    new_user_alert = Alert(
        type="new-user",
        severity="info",
        title="New User Created",
        message=f"New user created: {db_user.full_name} ({db_user.role})",
        tool_id=None,
        site=db_user.site,
    )
    session.add(new_user_alert)
    session.commit()
    
    return db_user

@router.get("/", response_model=List[UserRead])
def read_users(offset: int = 0, limit: int = 100, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    users = session.exec(select(User).offset(offset).limit(limit)).all()
    return users

@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete users")
        
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    session.delete(user)
    session.commit()
    return None

@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: int, user_update: UserUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
        
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_data = user_update.dict(exclude_unset=True)
    
    # If email is updated but username is not, sync them (assuming username=email convention)
    if "email" in user_data and "username" not in user_data:
        user_data["username"] = user_data["email"]

    if "password" in user_data and user_data["password"]:
        hashed_password = get_password_hash(user_data["password"])
        user_data["hashed_password"] = hashed_password
        del user_data["password"]
    elif "password" in user_data:
        del user_data["password"] # Remove empty password if present
        
    for key, value in user_data.items():
        setattr(db_user, key, value)
        
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user
