"""
predictor.py

SAVEZO Deepfake Prediction Orchestrator

Responsibilities:
- Central prediction layer
- Image prediction
- Video prediction
- Batch prediction
- Risk assessment
- Confidence scoring
- Result standardization
- Future ensemble voting
- API-ready response generation

Depends On:
- inference.py
- frame_extractor.py

Author: SAVEZO
"""

from __future__ import annotations

import os
import json
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

from inference import (
    predict_file,
    build_response,
    initialize_models,
    get_runtime_mode,
    get_checkpoint_status
)


# ==============================================================================
# RISK ASSESSMENT
# ==============================================================================

class RiskAssessor:
    """
    Converts probability score
    into human-readable risk levels.
    """

    @staticmethod
    def determine_risk(
        probability: float
    ) -> str:

        if probability >= 90:
            return "CRITICAL"

        if probability >= 75:
            return "HIGH"

        if probability >= 50:
            return "MEDIUM"

        if probability >= 25:
            return "LOW"

        return "MINIMAL"

    @staticmethod
    def determine_severity_color(
        probability: float
    ) -> str:

        if probability >= 90:
            return "red"

        if probability >= 75:
            return "orange"

        if probability >= 50:
            return "yellow"

        if probability >= 25:
            return "blue"

        return "green"


# ==============================================================================
# FILE UTILITIES
# ==============================================================================

class FileInspector:

    IMAGE_EXTENSIONS = {
        ".jpg",
        ".jpeg",
        ".png",
        ".bmp",
        ".webp"
    }

    VIDEO_EXTENSIONS = {
        ".mp4",
        ".avi",
        ".mov",
        ".mkv",
        ".webm"
    }

    @classmethod
    def is_image(
        cls,
        file_path: str
    ) -> bool:

        extension = (
            Path(file_path)
            .suffix
            .lower()
        )

        return (
            extension
            in cls.IMAGE_EXTENSIONS
        )

    @classmethod
    def is_video(
        cls,
        file_path: str
    ) -> bool:

        extension = (
            Path(file_path)
            .suffix
            .lower()
        )

        return (
            extension
            in cls.VIDEO_EXTENSIONS
        )

    @classmethod
    def file_size_mb(
        cls,
        file_path: str
    ) -> float:

        if not os.path.exists(
            file_path
        ):
            return 0

        size = os.path.getsize(
            file_path
        )

        return round(
            size / 1024 / 1024,
            2
        )

    @classmethod
    def generate_file_hash(
        cls,
        file_path: str
    ) -> str:

        if not os.path.exists(
            file_path
        ):
            return ""

        md5 = hashlib.md5()

        with open(
            file_path,
            "rb"
        ) as file:

            while True:

                chunk = file.read(
                    4096
                )

                if not chunk:
                    break

                md5.update(
                    chunk
                )

        return md5.hexdigest()


# ==============================================================================
# RECOMMENDATION ENGINE
# ==============================================================================

class RecommendationEngine:

    @staticmethod
    def generate(
        probability: float
    ) -> List[str]:

        recommendations = []

        if probability >= 90:

            recommendations.extend([
                "Avoid sharing this media.",
                "Verify source authenticity.",
                "Flag for manual review.",
                "Potential deepfake detected."
            ])

        elif probability >= 75:

            recommendations.extend([
                "Exercise caution.",
                "Verify original source.",
                "Check metadata."
            ])

        elif probability >= 50:

            recommendations.extend([
                "Further review recommended.",
                "Potential anomalies detected."
            ])

        else:

            recommendations.extend([
                "Media appears authentic.",
                "No major deepfake indicators."
            ])

        return recommendations


# ==============================================================================
# RESULT STANDARDIZATION
# ==============================================================================

class ResultFormatter:

    @staticmethod
    def standardize(
        file_path: str,
        inference_result: Dict
    ) -> Dict:

        probability = (
            inference_result.get(
                "deepfake",
                0
            )
        )

        risk = (
            RiskAssessor
            .determine_risk(
                probability
            )
        )

        runtime_mode = get_runtime_mode()

        checkpoint_status = (
            get_checkpoint_status()
        )

        return {

            "analysis_id":
                hashlib.md5(
                    (
                        file_path +
                        str(datetime.utcnow())
                    ).encode()
                ).hexdigest(),

            "timestamp":
                datetime.utcnow()
                .isoformat(),

            "filename":
                Path(file_path).name,

            "file_size_mb":
                FileInspector
                .file_size_mb(
                    file_path
                ),

            "file_hash":
                FileInspector
                .generate_file_hash(
                    file_path
                ),

            "deepfake":
                probability,

            "confidence":
                inference_result.get(
                    "confidence",
                    0
                ),

            "label":
                inference_result.get(
                    "label",
                    "UNKNOWN"
                ),

            "model":
                inference_result.get(
                    "model",
                    "UNKNOWN"
                ),

            "risk_level":
                risk,

            "risk_color":
                RiskAssessor
                .determine_severity_color(
                    probability
                ),

            "recommendations":
                RecommendationEngine
                .generate(
                    probability
                ),

            "runtime_mode":
                runtime_mode,

            "available_models":
                checkpoint_status,
        }


# ==============================================================================
# FUTURE ENSEMBLE SUPPORT
# ==============================================================================

class EnsemblePredictor:
    """
    Placeholder for future:
    Xception + ViT + FFT-LSTM
    """

    @staticmethod
    def combine_scores(
        scores: List[float]
    ) -> float:

        if not scores:
            return 0

        return round(
            sum(scores) /
            len(scores),
            2
        )


# ==============================================================================
# MAIN PREDICTOR
# ==============================================================================

class DeepfakePredictor:

    def __init__(self):

        initialize_models()

    def predict(
        self,
        file_path: str
    ) -> Dict:

        if not os.path.exists(
            file_path
        ):
            return {
                "status": "error",
                "message":
                    "File not found"
            }

        try:

            raw_result = (
                predict_file(
                    file_path
                )
            )

            standardized = (
                ResultFormatter
                .standardize(
                    file_path,
                    build_response(
                        raw_result
                    )
                )
            )

            standardized[
                "status"
            ] = "success"

            return standardized

        except Exception as e:

            return {

                "status":
                    "error",

                "message":
                    str(e),

                "runtime_mode":
                    get_runtime_mode(),

                "timestamp":
                    datetime.utcnow()
                    .isoformat()
            }

    def predict_batch(
        self,
        file_paths: List[str]
    ) -> List[Dict]:

        results = []

        for path in file_paths:

            results.append(
                self.predict(path)
            )

        return results
    
    def get_status(self):

        return {

            "runtime_mode":
                get_runtime_mode(),

            "checkpoints":
                get_checkpoint_status(),

            "initialized":
                True
        }


# ==============================================================================
# EXPORT FUNCTIONS
# ==============================================================================

_global_predictor = (
    DeepfakePredictor()
)


def predict_media(
    file_path: str
) -> Dict:

    return (
        _global_predictor
        .predict(file_path)
    )


def predict_batch_media(
    file_paths: List[str]
) -> List[Dict]:

    return (
        _global_predictor
        .predict_batch(
            file_paths
        )
    )

def predictor_status():

    return (
        _global_predictor
        .get_status()
    )


# ==============================================================================
# JSON EXPORT
# ==============================================================================

def save_result(
    result: Dict,
    output_path: str
):

    with open(
        output_path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            result,
            file,
            indent=4
        )


# ==============================================================================
# HISTORY LOGGING
# ==============================================================================

class PredictionHistory:

    def __init__(self):

        self.records = []

    def add(
        self,
        result: Dict
    ):
        result["history_id"] = (
            len(self.records) + 1
        )

        self.records.append(
            result
        )

    def latest(
        self,
        limit: int = 10
    ):

        return (
            self.records[-limit:]
        )

    def clear(self):

        self.records.clear()


HISTORY = PredictionHistory()


# ==============================================================================
# SELF TEST
# ==============================================================================

if __name__ == "__main__":

    print("=" * 60)
    print("SAVEZO PREDICTOR")
    print("=" * 60)

    sample_file = "sample.jpg"

    if os.path.exists(
        sample_file
    ):

        result = predict_media(
            sample_file
        )

        HISTORY.add(
            result
        )

        print(
            json.dumps(
                result,
                indent=4
            )
        )

    else:

        print(
            "No sample file found."
        )

    print(
        "\nPredictor Ready."
    )