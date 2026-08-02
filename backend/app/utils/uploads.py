from __future__ import annotations

import os
import uuid
from pathlib import Path

from fastapi import UploadFile

UPLOAD_DIR = Path(__file__).resolve().parent.parent / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)


def save_upload(file: UploadFile, prefix: str = 'upload') -> str:
    filename = file.filename or 'upload'
    file_ext = os.path.splitext(filename)[1]
    unique_name = f"{prefix}_{uuid.uuid4().hex}{file_ext}"
    target = UPLOAD_DIR / unique_name
    with target.open('wb') as out_file:
        while True:
            chunk = file.file.read(1024 * 1024)
            if not chunk:
                break
            out_file.write(chunk)
    return f'/uploads/{unique_name}'


def delete_upload(url: str | None) -> None:
    if not url:
        return
    relative_path = url.replace('/uploads/', '')
    file_path = UPLOAD_DIR / relative_path
    if file_path.exists():
        file_path.unlink()
