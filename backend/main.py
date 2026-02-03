from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import create_db_and_tables
from .routes import users, tools, inspections, alerts, upload
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="QR Code Tools Management API")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# Mount uploads directory to serve files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(users.router)
app.include_router(tools.router)
app.include_router(inspections.router)
app.include_router(alerts.router)
app.include_router(upload.router)

@app.get("/system/ip")
def get_local_ip():
    import socket
    try:
        # Connect to an external server (doesn't actually send data) to get the interface IP used for routing
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return {"ip": local_ip}
    except Exception:
        return {"ip": "localhost"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the QR Code Tools Management System API"}
