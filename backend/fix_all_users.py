from sqlmodel import Session, select
from backend.database import engine
from backend.models import User
from backend.auth import get_password_hash

def fix_all_users():
    with Session(engine) as session:
        # Standard password for all
        pwd_hash = get_password_hash("Admin@1234")
        
        users_to_fix = [
            {"username": "inspector", "email": "inspector@example.com", "role": "inspector", "full_name": "Inspector"},
            {"username": "worker", "email": "worker@example.com", "role": "worker", "full_name": "Site Worker"},
            {"username": "store", "email": "store@example.com", "role": "store", "full_name": "Store Manager"},
            {"username": "manager", "email": "manager@example.com", "role": "management", "full_name": "Project Manager"}
        ]

        for u in users_to_fix:
            statement = select(User).where(User.username == u["username"])
            db_user = session.exec(statement).first()
            
            if db_user:
                print(f"Updating '{u['username']}' password...")
                db_user.hashed_password = pwd_hash
                session.add(db_user)
            else:
                print(f"Creating '{u['username']}' user...")
                # Check email conflict
                statement = select(User).where(User.email == u["email"])
                email_conflict = session.exec(statement).first()
                if email_conflict:
                    print(f"  Removing conflicting email user: {email_conflict.username}")
                    session.delete(email_conflict)
                    session.commit()
                
                new_user = User(
                    username=u["username"],
                    email=u["email"],
                    full_name=u["full_name"],
                    role=u["role"],
                    hashed_password=pwd_hash,
                    status="active"
                )
                session.add(new_user)
        
        session.commit()
        print("\nAll users fixed/created with password: 'Admin@1234'")
        print("Users: inspector, worker, store, manager")

if __name__ == "__main__":
    fix_all_users()
