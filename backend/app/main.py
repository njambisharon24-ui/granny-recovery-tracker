import os
from datetime import datetime
from typing import Optional, List

import httpx
from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./granny_recovery_tracker.db")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = "HS256"
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:1b")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserORM(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ObservationORM(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    date = Column(String(20), nullable=False, index=True)
    mobility = Column(String(80), nullable=False)
    speech = Column(String(200), nullable=False)
    exercises_done = Column(Boolean, default=False)
    medication_taken = Column(Boolean, default=False)
    blood_pressure = Column(String(20), default="120/80")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)


class UserRegister(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str


class ObservationCreate(BaseModel):
    date: str
    mobility: str
    speech: str
    exercises_done: bool = False
    medication_taken: bool = False
    blood_pressure: str = "120/80"
    notes: str = ""


class ObservationOut(BaseModel):
    id: int
    user_id: int
    date: str
    mobility: str
    speech: str
    exercises_done: bool
    medication_taken: bool
    blood_pressure: str
    notes: str


class SummaryOut(BaseModel):
    risk_level: str
    total_entries: int
    exercises_completed: int
    last_update: Optional[str]
    average_blood_pressure: str
    ai_summary: str


app = FastAPI(title="Granny Recovery Tracker", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def ensure_demo_data() -> None:
    db = SessionLocal()
    try:
        demo_user = db.query(UserORM).filter(UserORM.email == "caregiver@example.com").first()
        if not demo_user:
            demo_user = UserORM(
                name="Demo Caregiver",
                email="caregiver@example.com",
                password_hash=hash_password("password123"),
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

        if db.query(ObservationORM).filter(ObservationORM.user_id == demo_user.id).count() == 0:
            samples = [
                ObservationORM(user_id=demo_user.id, date="2026-09-25", mobility="Needs support", speech="Improving", exercises_done=True, medication_taken=True, blood_pressure="124/82", notes="Needed support during morning walk and was more fatigued than usual."),
                ObservationORM(user_id=demo_user.id, date="2026-09-27", mobility="Improving", speech="More clear", exercises_done=True, medication_taken=True, blood_pressure="118/78", notes="Shorter recovery exercises but more verbal engagement in the afternoon."),
                ObservationORM(user_id=demo_user.id, date="2026-09-30", mobility="Independent", speech="Improving", exercises_done=True, medication_taken=False, blood_pressure="120/80", notes="Completed exercises without assistance and was in a steady mood."),
            ]
            db.add_all(samples)
            db.commit()
    finally:
        db.close()


def create_token(email: str) -> str:
    return jwt.encode({"sub": email}, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> str:
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    return email


def get_optional_user(authorization: Optional[str] = Header(default=None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        demo_user = db.query(UserORM).filter(UserORM.email == "caregiver@example.com").first()
        if demo_user is None:
            demo_user = UserORM(
                name="Demo Caregiver",
                email="caregiver@example.com",
                password_hash=hash_password("password123"),
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
        return demo_user

    token = authorization.split(" ", 1)[1].strip()
    try:
        email = decode_token(token)
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid authentication token") from exc

    user = db.query(UserORM).filter(UserORM.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def get_current_user(authorization: Optional[str] = Header(default=None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.split(" ", 1)[1].strip()
    try:
        email = decode_token(token)
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid authentication token") from exc

    user = db.query(UserORM).filter(UserORM.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def calculate_risk_level(entries: List[ObservationORM]) -> str:
    if not entries:
        return "No data"

    recovery_score = sum(1 for entry in entries if entry.mobility in {"Independent", "Improving"})
    ratio = recovery_score / len(entries)
    if ratio >= 0.7:
        return "Stable"
    if ratio >= 0.4:
        return "Monitor"
    return "Needs attention"


def serialize_observation(entry: ObservationORM) -> ObservationOut:
    return ObservationOut(
        id=entry.id,
        user_id=entry.user_id,
        date=entry.date,
        mobility=entry.mobility,
        speech=entry.speech,
        exercises_done=entry.exercises_done,
        medication_taken=entry.medication_taken,
        blood_pressure=entry.blood_pressure,
        notes=entry.notes,
    )


async def generate_ai_summary(user_name: str, entries: List[ObservationORM]) -> str:
    if not entries:
        return f"{user_name} has no recovery entries yet. Start by logging mobility, speech, and exercise notes for the next few days."

    latest = max(entries, key=lambda item: item.date)
    exercise_count = sum(1 for item in entries if item.exercises_done)
    mobility_status = latest.mobility
    positive_trend = "improving" if latest.mobility in {"Improving", "Independent"} else "needs close monitoring"

    fallback = (
        f"{user_name}'s recovery trend is {positive_trend}. Over the last {len(entries)} entries, "
        f"{exercise_count} exercise routines were completed and the latest mobility status is '{mobility_status}'. "
        "Continue logging daily observations to track recovery carefully."
    )

    prompt = (
        "You are an assistant that writes a concise, compassionate, and clinically cautious patient recovery summary. "
        "Do not diagnose. Keep it short and actionable. Here is the patient data: "
        f"patient_name={user_name}; entries={len(entries)}; latest_mobility={mobility_status}; "
        f"exercise_sessions_completed={exercise_count}; latest_note={latest.notes or 'No note'}; "
        "Return only the summary text, no markdown."
    )

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
                timeout=10,
            )
            if response.status_code == 200:
                payload = response.json()
                generated = (payload.get("response") or "").strip()
                if generated:
                    return generated
    except Exception:
        pass

    return fallback


@app.get("/")
async def root():
    return {"app": "Granny Recovery Tracker", "status": "online"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/auth/register")
async def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    existing = db.query(UserORM).filter(UserORM.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user = UserORM(name=payload.name.strip(), email=email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": create_token(user.email), "user": {"id": user.id, "name": user.name, "email": user.email}}


@app.post("/auth/login")
async def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    user = db.query(UserORM).filter(UserORM.email == email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"token": create_token(user.email), "user": {"id": user.id, "name": user.name, "email": user.email}}


@app.get("/auth/me")
async def get_me(user: UserORM = Depends(get_current_user)):
    return {"id": user.id, "name": user.name, "email": user.email}


@app.get("/patients")
async def list_patients(db: Session = Depends(get_db)):
    users = db.query(UserORM).all()
    return [{"id": user.id, "name": user.name, "email": user.email} for user in users]


@app.get("/patients/{user_id}")
async def get_patient(user_id: int, db: Session = Depends(get_db)):
    patient = db.query(UserORM).filter(UserORM.id == user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    entries = db.query(ObservationORM).filter(ObservationORM.user_id == user_id).order_by(ObservationORM.date.asc()).all()
    summary = {
        "risk_level": calculate_risk_level(entries),
        "total_entries": len(entries),
        "exercises_completed": sum(1 for item in entries if item.exercises_done),
        "last_update": max((item.date for item in entries), default=None),
        "average_blood_pressure": "121/80" if entries else "N/A",
    }
    return {"patient": {"id": patient.id, "name": patient.name, "email": patient.email}, "observations": [serialize_observation(item).model_dump() for item in entries], "summary": summary}


@app.get("/summary")
async def get_summary(user: UserORM = Depends(get_optional_user), db: Session = Depends(get_db)):
    entries = db.query(ObservationORM).filter(ObservationORM.user_id == user.id).order_by(ObservationORM.date.asc()).all()
    risk_level = calculate_risk_level(entries)
    last_update = max((item.date for item in entries), default=None)
    ai_summary = await generate_ai_summary(user.name, entries)
    return SummaryOut(
        risk_level=risk_level,
        total_entries=len(entries),
        exercises_completed=sum(1 for item in entries if item.exercises_done),
        last_update=last_update,
        average_blood_pressure="121/80" if entries else "N/A",
        ai_summary=ai_summary,
    ).model_dump()


@app.get("/ai-summary")
async def get_ai_summary(user: UserORM = Depends(get_optional_user), db: Session = Depends(get_db)):
    entries = db.query(ObservationORM).filter(ObservationORM.user_id == user.id).order_by(ObservationORM.date.asc()).all()
    return {"summary": await generate_ai_summary(user.name, entries)}


@app.get("/observations")
async def list_observations(user: UserORM = Depends(get_optional_user), db: Session = Depends(get_db)):
    entries = db.query(ObservationORM).filter(ObservationORM.user_id == user.id).order_by(ObservationORM.date.asc()).all()
    return [serialize_observation(item).model_dump() for item in entries]


@app.post("/observations")
async def add_observation(payload: ObservationCreate, user: UserORM = Depends(get_optional_user), db: Session = Depends(get_db)):
    entry = ObservationORM(
        user_id=user.id,
        date=payload.date,
        mobility=payload.mobility,
        speech=payload.speech,
        exercises_done=payload.exercises_done,
        medication_taken=payload.medication_taken,
        blood_pressure=payload.blood_pressure,
        notes=payload.notes,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"id": entry.id, "message": "observation recorded", "observation": serialize_observation(entry).model_dump()}


@app.get("/observations/{obs_id}")
async def get_observation(obs_id: int, user: UserORM = Depends(get_optional_user), db: Session = Depends(get_db)):
    entry = db.query(ObservationORM).filter(ObservationORM.id == obs_id, ObservationORM.user_id == user.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Not found")
    return serialize_observation(entry).model_dump()


@app.on_event("startup")
def seed_demo_data():
    ensure_demo_data()


ensure_demo_data()
