from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlmodel import Session, select
from ..database import get_session
from ..models import Tool, ToolCreate, ToolRead, ToolUpdate, User
from ..auth import get_current_user

router = APIRouter(prefix="/tools", tags=["tools"])

@router.post("/", response_model=ToolRead)
def create_tool(tool: ToolCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_tool = Tool.from_orm(tool)
    session.add(db_tool)
    session.commit()
    session.refresh(db_tool)
    
    # Generate Alert
    from ..models import Alert
    new_alert = Alert(
        type="new-tool",
        severity="info",
        title="New Tool Added",
        message=f"New tool has been added to the inventory: {db_tool.description} ({db_tool.qr_code})",
        tool_id=db_tool.id,
        site=db_tool.current_site,
    )
    session.add(new_alert)
    session.commit()
    
    return db_tool

@router.get("/", response_model=List[ToolRead])
def read_tools(
    offset: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    query = select(Tool)
    if search:
        query = query.where(Tool.description.contains(search) | Tool.qr_code.contains(search))
    
    tools = session.exec(query.offset(offset).limit(limit)).all()
    return tools

@router.get("/{tool_id}", response_model=ToolRead)
def read_tool(tool_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    tool = session.get(Tool, tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool

@router.patch("/{tool_id}", response_model=ToolRead)
def update_tool(tool_id: int, tool_update: ToolUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_tool = session.get(Tool, tool_id)
    if not db_tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    tool_data = tool_update.dict(exclude_unset=True)
    for key, value in tool_data.items():
        setattr(db_tool, key, value)
    
    session.add(db_tool)
    session.commit()
    session.refresh(db_tool)
    
    # Generate Info Alert for Update
    from ..models import Alert
    update_alert = Alert(
        type="tool-update",
        severity="info",
        title="Tool Updated",
        message=f"Tool details updated for {db_tool.description} ({db_tool.qr_code}).",
        tool_id=db_tool.id,
        site=db_tool.current_site,
    )
    session.add(update_alert)
    session.commit()
    
    return db_tool

@router.delete("/{tool_id}")
def delete_tool(tool_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    tool = session.get(Tool, tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    # Generate Info Alert for Deletion
    from ..models import Alert
    # Note: We can't link tool_id as it will be deleted (unless we rely on historical alert data or ON DELETE SET NULL)
    # But Alert.tool_id is foreign key. If we delete tool, cascade might delete alert?
    # Actually, often 'deletion' is soft delete, but here it's hard delete.
    # To keep the alert, we should unset tool_id or change alert model to allow null.
    # Alert model allows optional tool_id.
    
    del_alert = Alert(
        type="tool-deleted",
        severity="warning",
        title="Tool Deleted",
        message=f"Tool {tool.description} ({tool.qr_code}) has been deleted from inventory.",
        tool_id=None, # Tool is gone
        site=tool.current_site,
    )
    session.add(del_alert)
    
    session.delete(tool)
    session.commit()
    return {"ok": True}

@router.get("/qr/{qr_code}", response_model=ToolRead)
def read_tool_by_qr(qr_code: str, session: Session = Depends(get_session)):
    statement = select(Tool).where(Tool.qr_code == qr_code)
    tool = session.exec(statement).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool
