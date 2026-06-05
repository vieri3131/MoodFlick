import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

ALLOWED_EMOTIONS = [
    "sad", "happy", "romantic", "scary", "excited",
    "calm", "lonely", "angry", "tired", "bored"
]

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


def _get_client() -> Groq:
    global _groq_client
    if _groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY가 설정되어 있지 않습니다.")
        _groq_client = Groq(api_key=api_key)
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


def parse_mood(raw_mood: str) -> str:
    try:
        client = _get_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": f"""
A user described their mood as: "{raw_mood}"

Classify this into EXACTLY one word from this list:
sad, happy, romantic, scary, excited, calm, lonely, angry, tired, bored

Rules:
- Return ONLY the single word, nothing else
- No punctuation, no explanation, no sentences
- If unsure, pick the closest match
- "empty", "lost", "hollow" → lonely
- "exhausted", "drained" → tired
- "furious", "frustrated" → angry
- Never return a word not in the list

Your response must be a single word only.
"""
                }
            ],
            temperature=0,
            max_tokens=10
        )

        result = response.choices[0].message.content.strip().lower()
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
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": f"""
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
                }
            ],
            temperature=0.7,
            max_tokens=60
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Groq error in generate_reason: {e}")
        return fallback
