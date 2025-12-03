from datetime import datetime, timedelta
import hashlib
import random
import string

from fastapi import APIRouter, Depends, HTTPException, Response
from app.auth.utils import create_access_token, get_current_user, get_db
from app.models import LoginCode, User
from app.schemas import RequestCodeIn, RequestCodeOut, TokenOut, VerifyCodeIn
from app.utils.email import send_login_code

router = APIRouter(prefix="/auth", tags=["auth"])


def _hash_code(code: str) -> str:
    return hashlib.sha256(code.encode()).hexdigest()


def _generate_code() -> str:
    return "".join(random.choices(string.digits, k=6))


@router.post("/request-code", response_model=RequestCodeOut)
async def request_code(payload: RequestCodeIn, db=Depends(get_db)):
    email = payload.email.lower().strip()

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    code = _generate_code()
    code_hash = _hash_code(code)
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    login_code = LoginCode(
        user_id=user.id,
        email=email,
        code_hash=code_hash,
        expires_at=expires_at,
    )
    db.add(login_code)
    db.commit()

    await send_login_code(email, code)

    return RequestCodeOut(detail="Код отправлен", debug_code=code)


@router.post("/verify-code", response_model=TokenOut)
async def verify_code(
    payload: VerifyCodeIn,
    response: Response,
    db=Depends(get_db),
):
    email = payload.email.lower().strip()
    code_hash = _hash_code(payload.code.strip())

    login_code = (
        db.query(LoginCode)
        .filter(
            LoginCode.email == email,
            LoginCode.code_hash == code_hash,
            LoginCode.used == False,  # noqa: E712
            LoginCode.expires_at > datetime.utcnow(),
        )
        .order_by(LoginCode.created_at.desc())
        .first()
    )

    if not login_code:
        raise HTTPException(status_code=400, detail="Неверный или просроченный код")

    login_code.used = True
    db.commit()

    user = db.query(User).filter(User.id == login_code.user_id).first()

    access_token = create_access_token({"sub": user.id}, timedelta(days=7))
    refresh_token = create_access_token({"sub": user.id}, timedelta(days=30))
    response.set_cookie(
        key="alchemist_refresh",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=30 * 24 * 60 * 60,
    )

    return TokenOut(access_token=access_token)


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email}
