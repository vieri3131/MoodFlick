import os
import threading
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

ALLOWED_EMOTIONS = [
    "sad", "happy", "romantic", "scary", "excited",
    "calm", "lonely", "angry", "tired", "bored",
    "confused", "nostalgic", "empty", "frustrated", "regretful",
]

EMOTION_KEYWORD_HINTS = {
    "confused": [
        "confused", "lost", "overwhelmed", "complicated", "unclear",
        "복잡", "혼란", "모르겠", "정리", "갈피", "어지러",
    ],
    "nostalgic": [
        "nostalgic", "miss", "memory", "past", "remember",
        "그립", "그리움", "예전", "추억", "생각나", "떠올",
    ],
    "empty": [
        "empty", "hollow", "meaningless", "pointless", "void",
        "허무", "공허", "비어", "의미가 없", "무의미",
    ],
    "frustrated": [
        "frustrated", "stuck", "blocked", "trapped",
        "답답", "막힌", "안 풀", "풀리지", "꽉 막",
    ],
    "regretful": [
        "regret", "regretful", "remorse", "should have",
        "후회", "아쉬", "반성", "그때", "다시 했",
    ],
}

LANGUAGE_MAP = {
    "ko": "Korean",
    "en": "English",
    "ja": "Japanese",
    "zh": "Chinese",
}

FALLBACK_REASONS = {
    "ko": "이 영화가 지금 당신의 감정에 잘 어울립니다.",
    "en": "This film suits your current mood well.",
    "ja": "この映画は今のあなたの気持ちにぴったりです。",
    "zh": "这部电影非常适合您目前的心情。",
}

_groq_client = None
_client_lock = threading.Lock()


def _get_client():
    global _groq_client
    with _client_lock:
        if _groq_client is None:
            _groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        return _groq_client


def _get_language_instruction(language: str) -> str:
    for prefix, name in LANGUAGE_MAP.items():
        if language.startswith(prefix):
            return name
    return "English"


def _get_fallback_reason(language: str) -> str:
    for prefix, reason in FALLBACK_REASONS.items():
        if language.startswith(prefix):
            return reason
    return FALLBACK_REASONS["en"]


def infer_emotion_from_keywords(raw_mood: str) -> str | None:
    normalized = raw_mood.strip().lower()
    for emotion, keywords in EMOTION_KEYWORD_HINTS.items():
        if any(keyword in normalized for keyword in keywords):
            return emotion
    return None


def parse_mood(raw_mood: str) -> str:
    keyword_emotion = infer_emotion_from_keywords(raw_mood)
    if keyword_emotion:
        return keyword_emotion

    try:
        client = _get_client()
        prompt = f"""
A user described their mood as: "{raw_mood}"

Classify this into EXACTLY one word from this list:
sad, happy, romantic, scary, excited, calm, lonely, angry, tired, bored,
confused, nostalgic, empty, frustrated, regretful

Rules:
- Return ONLY the single word, nothing else
- No punctuation, no explanation, no sentences
- If unsure, pick the closest match
- "confused", "lost", "overwhelmed", "thinking too much" -> confused
- "nostalgic", "missing the past", "old memories", "thinking of someone" -> nostalgic
- "empty", "hollow", "meaningless", "pointless" -> empty
- "frustrated", "stuck", "blocked", "trapped", "can't breathe" -> frustrated
- "regret", "should have", "remorse", "wish I had chosen differently" -> regretful
- "exhausted", "drained" -> tired
- "furious", "rage" -> angry
- Choose confused for unclear, tangled thoughts, but never because the user wants mystery or thriller.
- Never return a word not in the list

Your response must be a single word only.
"""
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=10
        )
        result = completion.choices[0].message.content.strip().lower()
        print(f"Groq mood output: '{result}'")

        if result not in ALLOWED_EMOTIONS:
            print(f"Not in list, defaulting to calm")
            return "calm"

        return result

    except Exception as e:
        print(f"Groq error in parse_mood: {e}")
        return "calm"


def generate_reason(raw_mood: str, movie_title: str, language: str) -> str:
    lang_instruction = _get_language_instruction(language)
    fallback = _get_fallback_reason(language)

    try:
        client = _get_client()
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
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=60
        )
        result = completion.choices[0].message.content.strip()
        return result if result else fallback

    except Exception as e:
        print(f"Groq error in generate_reason: {e}")
        return fallback
