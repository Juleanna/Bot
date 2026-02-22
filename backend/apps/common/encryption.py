from cryptography.fernet import Fernet
from django.conf import settings


def get_fernet():
    key = settings.FERNET_KEY
    if not key:
        raise ValueError("FERNET_KEY is not set in environment variables")
    if isinstance(key, str):
        key = key.encode()
    return Fernet(key)


def encrypt_token(token: str) -> str:
    f = get_fernet()
    return f.encrypt(token.encode()).decode()


def decrypt_token(encrypted_token: str) -> str:
    f = get_fernet()
    return f.decrypt(encrypted_token.encode()).decode()
