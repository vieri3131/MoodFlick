import os
import google.generativeai as genai
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

_gemini_model = None


def _get_model():
    global _gemini_model
    if _gemini_model is None:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        _gemini_model = genai.GenerativeModel("gemini-2.5-flash")
    return _gemini_model


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
        model = _get_model()
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
- "exhausted", "drained" → tired
- "furious", "rage" -> angry
- Choose confused for unclear, tangled thoughts, but never because the user wants mystery or thriller.
- Never return a word not in the list

Your response must be a single word only.
"""
        response = model.generate_content(prompt, generation_config=genai.GenerationConfig(temperature=0.0, max_output_tokens=10))
        result = response.text.strip().lower()
        print(f"Gemini mood output: '{result}'")

        if result not in ALLOWED_EMOTIONS:
            print(f"Not in list, defaulting to calm")
            return "calm"

        return result

    except Exception as e:
        print(f"Gemini error in parse_mood: {e}")
        return "calm"


def generate_reason(raw_mood: str, movie_title: str, language: str) -> str:
    lang_instruction = _get_language_instruction(language)
    fallback = _get_fallback_reason(language)

    try:
        model = _get_model()
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
        response = model.generate_content(prompt, generation_config=genai.GenerationConfig(temperature=0.7, max_output_tokens=60))
        return response.text.strip()

    except Exception as e:
        print(f"Gemini error in generate_reason: {e}")
        return fallback
