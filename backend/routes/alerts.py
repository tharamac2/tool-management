from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlmodel import Session, select
from ..database import get_session
from ..models import Alert, AlertCreate, AlertRead, User
from ..auth import get_current_user

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[AlertRead])
def read_alerts(
    skip: int = 0, 
    limit: int = 50, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = select(Alert).order_by(Alert.date.desc()).offset(skip).limit(limit)
    alerts = session.exec(statement).all()
    return alerts

@router.post("/", response_model=AlertRead)
def create_alert(
    alert: AlertCreate, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_alert = Alert.from_orm(alert)
    session.add(db_alert)
    session.commit()
    session.refresh(db_alert)
    return db_alert

@router.post("/{alert_id}/read", response_model=AlertRead)
def mark_alert_read(
    alert_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    alert = session.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    session.add(alert)
    session.commit()
    session.refresh(alert)
    return alert

@router.post("/{alert_id}/resolve", response_model=AlertRead)
def resolve_alert(
    alert_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    alert = session.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_resolved = True
    session.add(alert)
    session.commit()
    session.refresh(alert)
    return alert
