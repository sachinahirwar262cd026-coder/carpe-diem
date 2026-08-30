"""
Sound Classification Engine — ESC-50 CNN (MobileNetV2)

Maps ESC-50 labels to 5 main environmental sound categories:
  Traffic  |  Environmental  |  Industrial  |  Human_Activity  |  Construction
"""

from __future__ import annotations

import io
import os
import logging
import numpy as np
from typing import Optional

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# ESC-50 TAXONOMY  (50 labels → 5 main categories)
# ─────────────────────────────────────────────────────────────────────────────

ESC50_LABEL_TO_CATEGORY: dict[str, str] = {
    # Traffic
    "car_horn":             "Traffic",
    "engine":               "Traffic",
    "siren":                "Traffic",
    "train":                "Traffic",
    "airplane":             "Traffic",
    "helicopter":           "Traffic",
    "motorcycle":           "Traffic",
    "bus":                  "Traffic",
    # Environmental
    "rain":                 "Environmental",
    "sea_waves":            "Environmental",
    "crackling_fire":       "Environmental",
    "crickets":             "Environmental",
    "chirping_birds":       "Environmental",
    "wind":                 "Environmental",
    "thunderstorm":         "Environmental",
    "water_drops":          "Environmental",
    "frog":                 "Environmental",
    "crow":                 "Environmental",
    # Industrial
    "chainsaw":             "Industrial",
    "clock_tick":           "Industrial",
    "vacuum_cleaner":       "Industrial",
    "washing_machine":      "Industrial",
    "can_opening":          "Industrial",
    "door_wood_creaks":     "Industrial",
    "mouse_click":          "Industrial",
    "keyboard_typing":      "Industrial",
    "hand_saw":             "Industrial",
    "electric_shaver":      "Industrial",
    "drilling":             "Industrial",
    # Human Activity
    "clapping":             "Human_Activity",
    "breathing":            "Human_Activity",
    "coughing":             "Human_Activity",
    "crying_baby":          "Human_Activity",
    "laughing":             "Human_Activity",
    "brushing_teeth":       "Human_Activity",
    "sneezing":             "Human_Activity",
    "snoring":              "Human_Activity",
    "drinking_sipping":     "Human_Activity",
    "footsteps":            "Human_Activity",
    "door_wood_knock":      "Human_Activity",
    # Construction
    "jackhammer":           "Construction",
    "glass_breaking":       "Construction",
    "fireworks":            "Construction",
    "gun_shot":             "Construction",
    "church_bells":         "Construction",
    "clock_alarm":          "Construction",
    "toilet_flush":         "Construction",
    "pouring_water":        "Construction",
    "pig":                  "Construction",
    "cow":                  "Construction",
}

CATEGORY_TO_LABELS: dict[str, list[str]] = {}
for _lbl, _cat in ESC50_LABEL_TO_CATEGORY.items():
    CATEGORY_TO_LABELS.setdefault(_cat, []).append(_lbl)

MAIN_CATEGORIES = [
    "Traffic",
    "Environmental",
    "Industrial",
    "Human_Activity",
    "Construction",
]

# CNN was trained on these 5 classes (sorted = Keras default)
CNN_CLASSES = sorted([
    "car_horn",
    "engine",
    "helicopter",
    "siren",
    "train",
])

IMG_SIZE = (128, 128)

_HERE = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(_HERE, "..", "pollution_sound_mobilenetv2.h5")

_model = None
_model_loaded: bool = False
_model_error: Optional[str] = None


def _load_model() -> None:
    global _model, _model_loaded, _model_error
    if _model_loaded:
        return
    try:
        import tensorflow as tf
        abs_path = os.path.abspath(MODEL_PATH)
        if not os.path.exists(abs_path):
            _model_error = (
                f"CNN model not found at '{abs_path}'. "
                "Please run 'python models/train_cnn.py' first."
            )
            logger.warning(_model_error)
            return
        _model = tf.keras.models.load_model(abs_path)
        _model_loaded = True
        logger.info("Sound CNN loaded from %s", abs_path)
    except Exception as exc:
        _model_error = f"Failed to load CNN model: {exc}"
        logger.error(_model_error)


def _preprocess_image_bytes(image_bytes: bytes) -> "np.ndarray":
    from PIL import Image
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    arr = np.expand_dims(arr, axis=0)
    arr = preprocess_input(arr)
    return arr


def predict(image_bytes: bytes) -> dict:
    """
    Run CNN inference on a spectrogram PNG/JPEG bytes.

    Returns dict with keys:
      status, model_loaded, main_category, sub_label, confidence,
      all_scores, category_scores, error
    """
    _load_model()

    if not _model_loaded:
        return {
            "status": "error",
            "model_loaded": False,
            "error": _model_error or "CNN model is not loaded.",
            "main_category": None,
            "sub_label": None,
            "confidence": None,
            "all_scores": {},
            "category_scores": {},
        }

    try:
        arr = _preprocess_image_bytes(image_bytes)
        raw_probs = _model.predict(arr, verbose=0)[0]

        all_scores: dict[str, float] = {
            cls: round(float(prob) * 100, 2)
            for cls, prob in zip(CNN_CLASSES, raw_probs)
        }

        best_idx = int(np.argmax(raw_probs))
        sub_label = CNN_CLASSES[best_idx]
        confidence = round(float(raw_probs[best_idx]) * 100, 2)

        main_category = ESC50_LABEL_TO_CATEGORY.get(sub_label, "Traffic")

        category_scores: dict[str, float] = {cat: 0.0 for cat in MAIN_CATEGORIES}
        for cls, score in all_scores.items():
            cat = ESC50_LABEL_TO_CATEGORY.get(cls, "Traffic")
            category_scores[cat] = round(category_scores[cat] + score, 2)

        total_cat_score = sum(category_scores.values()) or 1.0
        category_scores = {
            cat: round(v / total_cat_score * 100, 2)
            for cat, v in category_scores.items()
        }

        return {
            "status": "success",
            "model_loaded": True,
            "main_category": main_category,
            "sub_label": sub_label,
            "confidence": confidence,
            "all_scores": all_scores,
            "category_scores": category_scores,
            "error": None,
        }

    except Exception as exc:
        logger.exception("CNN inference error")
        return {
            "status": "error",
            "model_loaded": _model_loaded,
            "error": str(exc),
            "main_category": None,
            "sub_label": None,
            "confidence": None,
            "all_scores": {},
            "category_scores": {},
        }


def get_taxonomy() -> dict:
    """Return the full category → sub-label taxonomy."""
    return {
        "main_categories": MAIN_CATEGORIES,
        "taxonomy": CATEGORY_TO_LABELS,
        "cnn_classes": CNN_CLASSES,
        "model_path": os.path.abspath(MODEL_PATH),
        "model_loaded": _model_loaded,
    }
