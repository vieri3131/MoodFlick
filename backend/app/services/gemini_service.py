import os
import httpx
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    f"gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
)

ALLOWED_EMOTIONS = [
    "sad", "happy", "romantic", "scary", "excited",
    "calm", "lonely", "angry", "tired", "bored"
]


def parse_mood(raw_mood: str) -> str:
    """
    Takes raw user emotion text (Korean or English).
    Returns exactly one keyword from ALLOWED_EMOTIONS.
    """
    prompt = f"""
A user described their mood as: "{raw_mood}"

Classify this into EXACTLY one word from this list:
sad, happy, romantic, scary, excited, calm, lonely, angry, tired, bored

Rules:
- Return ONLY the single word
- No punctuation, no explanation, no extra text
- If unsure, pick the closest match
- Never return a word not in the list
"""
    try:
        with httpx.Client() as client:
            response = client.post(
                GEMINI_URL,
                json={"contents": [{"parts": [{"text": prompt}]}]},
                timeout=30
            )
        data = response.json()
        result = data["candidates"][0]["content"]["parts"][0]["text"].strip().lower()

        if result not in ALLOWED_EMOTIONS:
            return "calm"

        return result

    except Exception:
        return "calm"


def generate_reason(raw_mood: str, movie_title: str, language: str) -> str:
    """
    Takes raw mood + movie title.
    Returns one personalized sentence explaining why this movie fits this mood.
    """
    lang_instruction = "Korean" if language.startswith("ko") else "English"

    prompt = f"""
User's mood: "{raw_mood}"
Movie title: "{movie_title}"

Write exactly ONE sentence (maximum 25 words) explaining why this specific movie
suits the user's current emotional state.

Rules:
- Write in {lang_instruction}
- Be specific to this movie, not generic
- Sound warm and human, not robotic
- Return only the sentence, nothing else
"""
    try:
        with httpx.Client() as client:
            response = client.post(
                GEMINI_URL,
                json={"contents": [{"parts": [{"text": prompt}]}]},
                timeout=30
            )
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()

    except Exception:
        return "이 영화가 지금 당신의 감정에 잘 어울립니다." if language.startswith("ko") else "This film suits your current mood well."