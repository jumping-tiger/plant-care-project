import os
import uuid
import asyncio
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Request, Query
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import PlantPredictionRequest
from auth import get_current_user
from services.zhipu_service import analyze_plant, predict_health
from services.weather_service import (
    get_weather_by_coords,
    get_weather_by_city,
    format_weather_for_prompt,
)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "E:/cursor_workspace/1/user_photo")

router = APIRouter(prefix="/api/plant", tags=["植物分析"])


@router.post("/analyze")
async def analyze(
    request: Request,
    image: UploadFile = File(...),
    latitude: Optional[str] = Form(None),
    longitude: Optional[str] = Form(None),
    city_name: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="请上传图片文件")

    ext = os.path.splitext(image.filename or "photo.jpg")[1] or ".jpg"
    filename = f"plant_{current_user.id}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    with open(filepath, "wb") as f:
        content = await image.read()
        f.write(content)

    weather_data = {}
    weather_context = ""
    try:
        if latitude and longitude:
            weather_data = await asyncio.to_thread(get_weather_by_coords, latitude, longitude)
            weather_context = format_weather_for_prompt(weather_data)
        elif city_name:
            weather_data = await asyncio.to_thread(get_weather_by_city, city_name)
            weather_context = format_weather_for_prompt(weather_data)
    except Exception:
        pass

    try:
        result = await asyncio.to_thread(analyze_plant, filepath, weather_context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"分析失败: {str(e)}")

    result["id"] = str(uuid.uuid4())
    base_url = str(request.base_url).rstrip("/")
    result["imageUri"] = f"{base_url}/uploads/{filename}"
    result["analyzedAt"] = datetime.utcnow().isoformat()

    if weather_data and not weather_data.get("error") and weather_data.get("current") and weather_data["current"].get("temp") is not None:
        result["weatherInfo"] = weather_data

    return {"success": True, "data": result}


@router.get("/weather")
async def get_weather(
    latitude: float = Query(...),
    longitude: float = Query(...),
    current_user: User = Depends(get_current_user),
):
    try:
        data = await asyncio.to_thread(get_weather_by_coords, str(latitude), str(longitude))
        if data and not data.get("error") and data.get("current"):
            c = data["current"]
            return {"success": True, "data": {
                "temp": str(c.get("temp", "--")),
                "text": c.get("text", ""),
                "humidity": str(c.get("humidity", "")),
                "windSpeed": str(c.get("windSpeed", "")),
            }}
        return {"success": False, "error": "天气获取失败"}
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/prediction")
async def prediction(
    req: PlantPredictionRequest,
    current_user: User = Depends(get_current_user),
):
    weather_data = {}
    weather_context = ""
    if req.city_name:
        try:
            weather_data = await asyncio.to_thread(get_weather_by_city, req.city_name)
            weather_context = format_weather_for_prompt(weather_data)
        except Exception:
            pass

    try:
        result = await asyncio.to_thread(
            predict_health, req.plantName, req.currentScore, weather_context
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"预测失败: {str(e)}")

    if weather_data and not weather_data.get("error") and weather_data.get("current") and weather_data["current"].get("temp") is not None:
        result["weatherInfo"] = weather_data

    return {"success": True, "data": result}
