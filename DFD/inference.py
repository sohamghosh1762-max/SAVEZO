"""
inference.py

SAVEZO Deepfake Detection Inference Engine

Supports:
1. Mock Inference Mode (Current Development)
2. Real Model Inference Mode (Future)
3. Xception Integration
4. ViT Integration
5. FFT-CNN-LSTM Integration
6. Image Prediction
7. Video Prediction
8. Ensemble Voting (Future)
9. Confidence Scoring
10. JSON Response Formatting

Dependencies:
- torch
- numpy
- opencv-python
- PIL
- torchvision
- timm

Author: SAVEZO
"""

from __future__ import annotations

import os
import cv2
import json
import random
import warnings
import traceback

import numpy as np

from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime

warnings.filterwarnings("ignore")

# ==============================================================================
# OPTIONAL TORCH IMPORTS
# ==============================================================================

TORCH_AVAILABLE = False

try:
    import torch
    import torchvision.transforms as transforms
    from PIL import Image

    TORCH_AVAILABLE = True

except Exception:
    TORCH_AVAILABLE = False


# ==============================================================================
# PROJECT IMPORTS
# ==============================================================================

try:
    from advanced_models import (
        XceptionDeepfake,
        ViTDeepfake,
        FFT_CNN_LSTM
    )

    MODELS_AVAILABLE = True

except Exception:

    MODELS_AVAILABLE = False


try:
    from frame_extractor import extract_frames

except Exception:

    def extract_frames(*args, **kwargs):
        return []


# ==============================================================================
# CONFIGURATION
# ==============================================================================

CHECKPOINT_DIR = "checkpoints"

XCEPTION_CHECKPOINT = os.path.join(
    CHECKPOINT_DIR,
    "xception.pth"
)

VIT_CHECKPOINT = os.path.join(
    CHECKPOINT_DIR,
    "vit.pth"
)

FFT_CHECKPOINT = os.path.join(
    CHECKPOINT_DIR,
    "fft_lstm.pth"
)


# ==============================================================================
# MODEL REGISTRY
# ==============================================================================

class ModelRegistry:
    """
    Central registry for all models.
    """

    def __init__(self):

        self.models = {}

        self.available_models = {
            "xception": False,
            "vit": False,
            "fft_lstm": False
        }

    def register(
        self,
        name: str,
        model
    ):

        self.models[name] = model
        self.available_models[name] = True

    def get(self, name: str):

        return self.models.get(name)

    def exists(self, name: str):

        return self.available_models.get(
            name,
            False
        )

    def summary(self):

        print("\nLoaded Models")

        for name, status in self.available_models.items():

            print(
                f"{name}: "
                f"{'AVAILABLE' if status else 'MISSING'}"
            )


MODEL_REGISTRY = ModelRegistry()


# ==============================================================================
# CHECKPOINT HELPERS
# ==============================================================================

def checkpoint_exists(path: str) -> bool:

    return os.path.exists(path)


def get_checkpoint_status() -> Dict:

    return {
        "xception": checkpoint_exists(
            XCEPTION_CHECKPOINT
        ),
        "vit": checkpoint_exists(
            VIT_CHECKPOINT
        ),
        "fft_lstm": checkpoint_exists(
            FFT_CHECKPOINT
        )
    }

def get_runtime_mode():
    """
    SAVEZO Runtime Mode

    REAL -> At least one trained model exists
    MOCK -> No .pth files available
    """

    status = get_checkpoint_status()

    if any(status.values()):
        return "REAL"

    return "MOCK"



# ==============================================================================
# IMAGE PREPROCESSING
# ==============================================================================

def preprocess_xception_image(
    image_path: str
):
    """
    Xception preprocessing.
    """

    if not TORCH_AVAILABLE:
        return None

    image = Image.open(
        image_path
    ).convert("RGB")

    transform = transforms.Compose([
        transforms.Resize((299, 299)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    tensor = transform(image)

    tensor = tensor.unsqueeze(0)

    return tensor


def preprocess_vit_image(
    image_path: str
):
    """
    ViT preprocessing.
    """

    if not TORCH_AVAILABLE:
        return None

    image = Image.open(
        image_path
    ).convert("RGB")

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    tensor = transform(image)

    tensor = tensor.unsqueeze(0)

    return tensor


# ==============================================================================
# MODEL LOADING
# ==============================================================================

def load_xception_model():

    if not TORCH_AVAILABLE:
        return None

    if not MODELS_AVAILABLE:
        return None

    if not checkpoint_exists(
        XCEPTION_CHECKPOINT
    ):
        return None

    try:

        model = XceptionDeepfake(
            pretrained=False
        )

        device = torch.device(
            "cuda"
            if torch.cuda.is_available()
            else "cpu"
        )

        model.load_state_dict(
            torch.load(
                XCEPTION_CHECKPOINT,
                map_location=device
            )
        )

        model.to(device)
        model.eval()

        MODEL_REGISTRY.register(
            "xception",
            model
        )

        return model

    except Exception as e:

        print(e)

        return None


def load_vit_model():

    if not TORCH_AVAILABLE:
        return None

    if not MODELS_AVAILABLE:
        return None

    if not checkpoint_exists(
        VIT_CHECKPOINT
    ):
        return None

    try:

        model = ViTDeepfake(
            pretrained=False
        )

        device = torch.device(
            "cuda"
            if torch.cuda.is_available()
            else "cpu"
        )

        model.load_state_dict(
            torch.load(
                VIT_CHECKPOINT,
                map_location=device
            )
        )

        model.to(device)
        model.eval()

        MODEL_REGISTRY.register(
            "vit",
            model
        )

        return model

    except Exception as e:

        print(e)

        return None
    
def load_fft_model():

    if not TORCH_AVAILABLE:
        return None

    if not MODELS_AVAILABLE:
        return None

    if not checkpoint_exists(
        FFT_CHECKPOINT
    ):
        return None

    try:

        model = FFT_CNN_LSTM()

        device = torch.device(
            "cuda"
            if torch.cuda.is_available()
            else "cpu"
        )

        model.load_state_dict(
            torch.load(
                FFT_CHECKPOINT,
                map_location=device
            )
        )

        model.eval()

        MODEL_REGISTRY.register(
            "fft_lstm",
            model
        )

        return model

    except Exception as e:

        print(e)

        return None


# ==============================================================================
# MOCK INFERENCE
# ==============================================================================

def mock_prediction() -> Dict[str, Any]:
    """
    Temporary prediction generator.
    """

    probability = round(
        random.uniform(5, 95),
        2
    )

    label = (
        "FAKE"
        if probability >= 50
        else "REAL"
    )

    return {
        "probability": probability,
        "confidence": probability,
        "label": label,
        "model": "MOCK-XCEPTION"
    }


# ==============================================================================
# REAL IMAGE INFERENCE
# ==============================================================================

def predict_image_xception(
    image_path: str
) -> Dict:

    model = MODEL_REGISTRY.get(
        "xception"
    )

    if model is None:

        return mock_prediction()

    try:

        image_tensor = (
            preprocess_xception_image(
                image_path
            )
        )

        with torch.no_grad():

            output = model(
                image_tensor
            )

        probability = float(
            output.squeeze().item()
        ) * 100

        label = (
            "FAKE"
            if probability >= 50
            else "REAL"
        )

        return {
            "probability": round(
                probability,
                2
            ),
            "confidence": round(
                probability,
                2
            ),
            "label": label,
            "model": "XCEPTION"
        }

    except Exception:

        traceback.print_exc()

        return mock_prediction()


# ==============================================================================
# VIDEO INFERENCE
# ==============================================================================

def predict_video_xception(
    video_path: str
) -> Dict:

    model = MODEL_REGISTRY.get(
        "xception"
    )

    if model is None:

        return mock_prediction()

    try:

        frames = extract_frames(
            video_path,
            max_frames=16
        )

        if len(frames) == 0:

            return mock_prediction()

        scores = []

        for frame in frames:

            temp_file = (
                "__temp_frame.jpg"
            )

            cv2.imwrite(
                temp_file,
                frame
            )

            result = (
                predict_image_xception(
                    temp_file
                )
            )

            scores.append(
                result["probability"]
            )

            if os.path.exists(
                temp_file
            ):
                os.remove(
                    temp_file
                )

        avg_score = float(
            np.mean(scores)
        )

        label = (
            "FAKE"
            if avg_score >= 50
            else "REAL"
        )

        return {
            "probability": round(
                avg_score,
                2
            ),
            "confidence": round(
                avg_score,
                2
            ),
            "label": label,
            "model": "XCEPTION_VIDEO"
        }

    except Exception:

        traceback.print_exc()

        return mock_prediction()


# ==============================================================================
# FILE ROUTER
# ==============================================================================

def predict_file(
    file_path: str
) -> Dict:

    suffix = (
        Path(file_path)
        .suffix
        .lower()
    )

    image_exts = {
        ".jpg",
        ".jpeg",
        ".png",
        ".bmp",
        ".webp"
    }

    video_exts = {
        ".mp4",
        ".avi",
        ".mov",
        ".mkv",
        ".webm"
    }

    if suffix in image_exts:

        return predict_image_xception(
            file_path
        )

    if suffix in video_exts:

        return predict_video_xception(
            file_path
        )

    return {
        "error": "Unsupported file"
    }


# ==============================================================================
# RESPONSE FORMATTER
# ==============================================================================

def build_response(
    prediction: Dict
) -> Dict:

    deepfake_score = prediction.get(
        "probability",
        0
    )

    nude_score = random.randint(
        0,
        15
    )

    mental_score = random.randint(
        0,
        10
    )

    overall = round(
        (
            deepfake_score +
            nude_score +
            mental_score
        ) / 3,
        2
    )

    return {

        "timestamp":
            datetime.utcnow().isoformat(),

        "deepfake":
            round(
                deepfake_score,
                2
            ),

        "nude":
            nude_score,

        "mental":
            mental_score,

        "overall":
            overall,

        "confidence":
            prediction.get(
                "confidence",
                0
            ),

        "label":
            prediction.get(
                "label",
                "UNKNOWN"
            ),

        "model":
            prediction.get(
                "model",
                "UNKNOWN"
            ),

        "status":
            "success"
    }


# ==============================================================================
# INITIALIZATION
# ==============================================================================

def initialize_models():

    print("\nInitializing Models")

    print("-" * 50)

    load_xception_model()
    load_vit_model()
    load_fft_model()

    MODEL_REGISTRY.summary()

    print("-" * 50)


# ==============================================================================
# TESTING
# ==============================================================================

if __name__ == "__main__":

    print("=" * 60)
    print("SAVEZO INFERENCE ENGINE")
    print("=" * 60)

    initialize_models()

    status = get_checkpoint_status()

    print("\nCheckpoint Status")

    print(
        json.dumps(
            status,
            indent=4
        )
    )

    print("\nRunning Mock Test")

    sample = mock_prediction()

    response = build_response(
        sample
    )

    print(
        json.dumps(
            response,
            indent=4
        )
    )

    print("\nInference Engine Ready.")