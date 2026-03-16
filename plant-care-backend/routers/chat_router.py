import os
import asyncio
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from zhipuai import ZhipuAI
from dotenv import load_dotenv

from models import User
from auth import get_current_user

load_dotenv()

router = APIRouter(prefix="/api/chat", tags=["AI专家聊天"])

client = ZhipuAI(api_key=os.getenv("ZHIPU_API_KEY", ""))
TEXT_MODEL = os.getenv("ZHIPU_TEXT_MODEL", "glm-4-flash")

SYSTEM_PROMPT = (
    "你是植觉 App 的 AI 植物专家助手，名叫「植觉」。"
    "你专注于植物养护、病虫害防治、浇水施肥、光照管理等领域。"
    "回答要简洁实用，带一点亲切温暖的语气，适当使用 emoji。"
    "如果问题与植物无关，礼貌地引导用户回到植物话题。"
)


class ChatMsg(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMsg]


def _do_chat(messages: List[dict]) -> str:
    resp = client.chat.completions.create(
        model=TEXT_MODEL,
        messages=messages,
        timeout=30,
    )
    return resp.choices[0].message.content or "抱歉，我暂时无法回答这个问题。"


@router.post("")
async def chat(req: ChatRequest, current_user: User = Depends(get_current_user)):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in req.messages:
        if m.role in ("user", "assistant"):
            messages.append({"role": m.role, "content": m.content})

    try:
        reply = await asyncio.to_thread(_do_chat, messages)
        return {"success": True, "data": {"reply": reply}}
    except Exception as e:
        return {"success": False, "error": str(e)}
