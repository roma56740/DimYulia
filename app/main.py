import json
from pathlib import Path
from urllib import parse, request as urlrequest
from urllib.error import URLError, HTTPError

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates


BASE_DIR = Path(__file__).resolve().parents[1]

TELEGRAM_BOT_TOKEN = "8945675667:AAGf_usKIE9U1l3-HQ03mS1e8ZJKdP2B-UE"
TELEGRAM_CHAT_ID = "1383653231"


app = FastAPI(title="Дима и Юля")

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static",
)

templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        name="index.html",
        request=request,
        context={"request": request, "title": "Дима и Юля"},
    )


@app.post("/api/rsvp")
async def rsvp(request: Request):
    try:
        data = await request.json()
    except json.JSONDecodeError:
        return JSONResponse({"ok": False, "message": "Некорректные данные"}, status_code=400)

    name = str(data.get("name", "")).strip()
    status = str(data.get("status", "")).strip()
    comment = str(data.get("comment", "")).strip()

    if not name or not status:
        return JSONResponse({"ok": False, "message": "Заполните имя и присутствие"}, status_code=400)

    status_text = "Буду" if status == "yes" else "Не смогу прийти"

    message = (
        "💌 Новая анкета гостя\n\n"
        f"Имя: {name}\n"
        f"Присутствие: {status_text}\n"
        f"Комментарий: {comment or '—'}"
    )

    bot_token = TELEGRAM_BOT_TOKEN.strip()
    chat_id = TELEGRAM_CHAT_ID.strip()

    telegram_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = parse.urlencode(
        {
            "chat_id": chat_id,
            "text": message,
            "disable_web_page_preview": "true",
        }
    ).encode("utf-8")

    try:
        req = urlrequest.Request(telegram_url, data=payload, method="POST")
        with urlrequest.urlopen(req, timeout=10) as response:
            if response.status >= 400:
                raise HTTPError(telegram_url, response.status, "Telegram error", response.headers, None)
    except (URLError, HTTPError, TimeoutError):
        return JSONResponse(
            {"ok": False, "message": "Не получилось отправить сообщение"},
            status_code=502,
        )

    return {"ok": True}


@app.get("/health")
async def health():
    return {"status": "ok"}
