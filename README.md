# Alchemist

Alchemist — прототип автономного музыкального клиента с единым поиском и офлайн-библиотекой. Он состоит из:

- **Backend (FastAPI + SQLite)** — авторизация по коду, управление библиотекой, поиск через yt-dlp.
- **Frontend (React + Vite + TypeScript)** — PWA-оболочка с минималистичным плеером и анимациями.

## Быстрый старт (dev)

### Backend
1. Создай виртуальное окружение и установи зависимости:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Запусти API:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend
1. Установи зависимости и запусти dev-сервер:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. API адрес настраивается в `frontend/src/config.ts`.

## Что сейчас работает
- Авторизация через почту + код (в деве код печатается в консоль и возвращается в ответе).
- Базовые модели пользователей/треков/библиотеки с уникальностью по `source + source_id`.
- Добавление трека в библиотеку и выдача списка треков с вложенными данными.
- Поиск по YouTube через yt-dlp без скачивания файлов.
