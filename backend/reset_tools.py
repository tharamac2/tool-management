from sqlmodel import Session, delete
from .database import engine
from .models import Tool, Inspection

def reset_tools():
    with Session(engine) as session:
        # Delete inspections first (child records)
        statement_inspections = delete(Inspection)
        result_inspections = session.exec(statement_inspections)
        print(f"Deleted {result_inspections.rowcount} inspections.")

        # Delete tools
        statement_tools = delete(Tool)
        result_tools = session.exec(statement_tools)
        print(f"Deleted {result_tools.rowcount} tools.")
        
        session.commit()
    print("All tools and inspections have been removed.")

if __name__ == "__main__":
    reset_tools()
