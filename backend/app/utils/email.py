# === ОТКЛЮЧАЕМ РЕАЛЬНУЮ ОТПРАВКУ ПИСЕМ ===
# Пока ты не настроишь Gmail — просто печатаем код в консоль
async def send_login_code(email: str, code: str):
    print("\n" + "=" * 50)
    print("ALCHEMIST — КОД ДЛЯ ВХОДА")
    print(f"Email: {email}")
    print(f"Код:   {code}")
    print("= Действителен 10 минут =")
    print("=" * 50 + "\n")

    # В будущем тут будет реальная отправка
    # await real_send_login_code(email, code)
