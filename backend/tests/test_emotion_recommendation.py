import unittest
from pathlib import Path
import sys
from types import SimpleNamespace


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

_mock_genai = SimpleNamespace(
    configure=lambda *args, **kwargs: None,
    GenerativeModel=lambda *args, **kwargs: SimpleNamespace(
        generate_content=lambda *a, **kw: SimpleNamespace(text="")
    ),
    GenerationConfig=lambda *args, **kwargs: None,
)
sys.modules.setdefault("google", SimpleNamespace(generativeai=_mock_genai))
sys.modules.setdefault("google.generativeai", _mock_genai)
sys.modules.setdefault(
    "dotenv",
    SimpleNamespace(load_dotenv=lambda *args, **kwargs: None),
)
sys.modules.setdefault(
    "requests",
    SimpleNamespace(
        get=lambda *args, **kwargs: None,
        exceptions=SimpleNamespace(
            Timeout=TimeoutError,
            HTTPError=RuntimeError,
        ),
    ),
)

from app.services.ai_service import infer_emotion_from_keywords
from app.services import recommend_service


class EmotionParsingTests(unittest.TestCase):
    def test_new_emotion_examples_are_classified_by_keywords(self):
        examples = {
            "요즘 머리가 너무 복잡하고 뭘 해야 할지 모르겠어.": "confused",
            "예전에 같이 보냈던 시간이 자꾸 생각나.": "nostalgic",
            "요즘 뭘 해도 의미가 없는 것 같아.": "empty",
        }

        for raw_mood, expected_emotion in examples.items():
            with self.subTest(raw_mood=raw_mood):
                self.assertEqual(
                    infer_emotion_from_keywords(raw_mood),
                    expected_emotion,
                )


class RecommendationMappingTests(unittest.TestCase):
    def test_confused_mapping_avoids_mystery_thriller_crime(self):
        recommendation = recommend_service.get_emotion_recommendation("confused")

        self.assertEqual(recommendation["mood"], "healing")
        self.assertEqual(recommendation["label"], "혼란")
        self.assertEqual(
            recommendation["recommendation_style"],
            "복잡한 생각을 덜어주고 편하게 볼 수 있는 영화",
        )
        self.assertEqual(
            recommend_service.emotion_to_genre_ids("confused"),
            [35, 10751],
        )
        self.assertFalse(
            {"Mystery", "Thriller", "Crime"} & set(recommendation["genres"])
        )

    def test_recommend_response_includes_new_emotion_fields(self):
        response = recommend_service.build_recommend_response(
            success=True,
            message="ok",
            emotion="confused",
            genre_ids=[35, 10751],
            country="KR",
            language="ko-KR",
            movies=[],
        )

        self.assertEqual(response["emotion"], "confused")
        self.assertEqual(response["emotionLabel"], "혼란")
        self.assertEqual(response["mood"], "healing")
        self.assertEqual(response["genres"], ["Comedy", "Family"])
        self.assertEqual(
            response["recommendation_style"],
            "복잡한 생각을 덜어주고 편하게 볼 수 있는 영화",
        )


    def test_new_emotions_do_not_share_the_same_genre_combo(self):
        new_emotions = [
            "confused",
            "nostalgic",
            "empty",
            "frustrated",
            "calm",
            "regretful",
        ]
        combos = {
            emotion: tuple(recommend_service.emotion_to_genre_ids(emotion))
            for emotion in new_emotions
        }

        self.assertEqual(len(set(combos.values())), len(combos))


if __name__ == "__main__":
    unittest.main()
