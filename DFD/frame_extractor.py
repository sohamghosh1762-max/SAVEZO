"""
frame_extractor.py

Video Frame Extraction Utilities for SAVEZO Deepfake Detection

Supports:
- Xception Deepfake Detector
- Vision Transformer (ViT)
- FFT + CNN + LSTM

Features:
- Video metadata extraction
- Uniform frame sampling
- Random frame sampling
- Sequential frame extraction
- OpenCV integration
- FFT-LSTM support
- Dataset generation support
- Frame quality filtering
- Frame resizing
- Batch extraction

Author: SAVEZO
"""

from __future__ import annotations

import os
import cv2
import math
import random
import numpy as np

from pathlib import Path
from typing import List, Dict, Optional, Tuple


# ==============================================================================
# VIDEO INFORMATION
# ==============================================================================

def get_video_info(video_path: str) -> Dict:
    """
    Extract video metadata.

    Returns:
        {
            fps,
            frame_count,
            duration,
            width,
            height
        }
    """

    if not os.path.exists(video_path):
        raise FileNotFoundError(
            f"Video not found: {video_path}"
        )

    cap = cv2.VideoCapture(video_path)

    fps = cap.get(cv2.CAP_PROP_FPS)

    frame_count = int(
        cap.get(cv2.CAP_PROP_FRAME_COUNT)
    )

    width = int(
        cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    )

    height = int(
        cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    )

    duration = (
        frame_count / fps
        if fps > 0
        else 0
    )

    cap.release()

    return {
        "fps": fps,
        "frame_count": frame_count,
        "duration": duration,
        "width": width,
        "height": height,
    }


# ==============================================================================
# FRAME QUALITY CHECKS
# ==============================================================================

def calculate_blur_score(frame: np.ndarray) -> float:
    """
    Compute Laplacian variance.

    Higher = sharper frame.
    """

    gray = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY
    )

    return cv2.Laplacian(
        gray,
        cv2.CV_64F
    ).var()


def is_valid_frame(
    frame: np.ndarray,
    min_blur_score: float = 30
) -> bool:
    """
    Determine whether frame is usable.
    """

    if frame is None:
        return False

    blur_score = calculate_blur_score(
        frame
    )

    return blur_score >= min_blur_score


# ==============================================================================
# FRAME RESIZING
# ==============================================================================

def resize_frame(
    frame: np.ndarray,
    width: int,
    height: int
) -> np.ndarray:
    """
    Resize frame.
    """

    return cv2.resize(
        frame,
        (width, height),
        interpolation=cv2.INTER_AREA
    )


# ==============================================================================
# UNIFORM FRAME SAMPLING
# ==============================================================================

def uniform_sample_indices(
    total_frames: int,
    max_frames: int
) -> List[int]:
    """
    Evenly distribute frame selections.
    """

    if total_frames <= max_frames:
        return list(range(total_frames))

    step = total_frames / max_frames

    indices = []

    for i in range(max_frames):
        indices.append(
            int(i * step)
        )

    return indices


# ==============================================================================
# RANDOM FRAME SAMPLING
# ==============================================================================

def random_sample_indices(
    total_frames: int,
    max_frames: int
) -> List[int]:
    """
    Random frame selection.
    """

    if total_frames <= max_frames:
        return list(range(total_frames))

    sampled = random.sample(
        range(total_frames),
        max_frames
    )

    sampled.sort()

    return sampled


# ==============================================================================
# FRAME EXTRACTION
# ==============================================================================

def extract_frames(
    video_path: str,
    max_frames: int = 32,
    min_frames: int = 4,
    resize_to: Optional[Tuple[int, int]] = (224, 224),
    filter_blurry: bool = False,
) -> List[np.ndarray]:
    """
    SAVEZO-safe frame extraction.

    - Supports tiny videos
    - Supports corrupted videos
    - Ensures minimum frame count
    - Compatible with FFT-LSTM
    """

    if not os.path.exists(video_path):
        raise FileNotFoundError(video_path)

    cap = cv2.VideoCapture(video_path)

    total_frames = int(
        cap.get(cv2.CAP_PROP_FRAME_COUNT)
    )

    if total_frames <= 0:
        cap.release()
        return []

    indices = uniform_sample_indices(
        total_frames,
        max_frames
    )

    index_set = set(indices)

    frames = []

    frame_id = 0

    while True:

        success, frame = cap.read()

        if not success:
            break

        if frame_id in index_set:

            if filter_blurry:

                if not is_valid_frame(frame):
                    frame_id += 1
                    continue

            if resize_to is not None:

                frame = resize_frame(
                    frame,
                    resize_to[0],
                    resize_to[1]
                )

            frame = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2RGB
            )

            frames.append(frame)

        frame_id += 1

    cap.release()

    if len(frames) == 0:
        return []

    while len(frames) < min_frames:

        frames.append(
            frames[-1].copy()
        )

    frames = frames[:max_frames]

    return frames


# ==============================================================================
# RANDOM EXTRACTION
# ==============================================================================

def extract_random_frames(
    video_path: str,
    max_frames: int = 32
) -> List[np.ndarray]:
    """
    Random frame extraction.
    """

    if not os.path.exists(video_path):
        return []

    cap = cv2.VideoCapture(video_path)

    total_frames = int(
        cap.get(
            cv2.CAP_PROP_FRAME_COUNT
        )
    )

    if total_frames <= 0:

        cap.release()
        return []

    selected = random_sample_indices(
        total_frames,
        max_frames
    )

    selected = set(selected)

    frames = []

    frame_index = 0

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        if frame_index in selected:

            frame = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2RGB
            )

            frames.append(frame)

        frame_index += 1

    cap.release()

    return frames

def extract_frames_safe(
    video_path: str,
    max_frames: int = 32,
    resize_to=(224, 224)
):
    """
    SAVEZO-safe extraction wrapper.

    Never crashes training.
    """

    try:

        frames = extract_frames(
            video_path,
            max_frames=max_frames,
            resize_to=resize_to,
            filter_blurry=False
        )

        if len(frames) == 0:
            return None

        return frames

    except Exception as e:

        print(
            f"[SAVEZO] Extraction failed:"
        )

        print(video_path)

        print(str(e))

        return None


# ==============================================================================
# SAVE FRAMES TO DISK
# ==============================================================================

def save_frames(
    frames: List[np.ndarray],
    output_dir: str,
    prefix: str = "frame"
):
    """
    Save frames.
    """

    os.makedirs(
        output_dir,
        exist_ok=True
    )

    for idx, frame in enumerate(frames):

        output_path = os.path.join(
            output_dir,
            f"{prefix}_{idx:04d}.jpg"
        )

        cv2.imwrite(
            output_path,
            frame
        )


# ==============================================================================
# VIDEO -> IMAGE DATASET
# ==============================================================================

def generate_image_dataset(
    video_directory: str,
    output_directory: str,
    frames_per_video: int = 10
):
    """
    Convert videos to image dataset.
    """

    os.makedirs(
        output_directory,
        exist_ok=True
    )

    videos = []

    for file in os.listdir(video_directory):

        if file.lower().endswith(
            (
                ".mp4",
                ".avi",
                ".mov",
                ".mkv",
                ".webm"
            )
        ):
            videos.append(
                os.path.join(
                    video_directory,
                    file
                )
            )

    total_saved = 0

    for video in videos:

        name = Path(video).stem

        frames = extract_frames(
            video,
            max_frames=frames_per_video
        )

        save_frames(
            frames,
            output_directory,
            prefix=name
        )

        total_saved += len(frames)

    print(
        f"Saved {total_saved} frames."
    )


# ==============================================================================
# BATCH EXTRACTION
# ==============================================================================

def batch_extract_frames(
    video_paths: List[str],
    max_frames: int = 32
) -> Dict[str, List[np.ndarray]]:
    """
    Extract frames from multiple videos.
    """

    results = {}

    for path in video_paths:

        try:

            frames = extract_frames_safe(
                path,
                max_frames=max_frames
            )

            if frames is not None:

                results[path] = frames

        except Exception as e:

            print(
                f"Failed: {path}"
            )

            print(str(e))

    return results


# ==============================================================================
# FRAME STATISTICS
# ==============================================================================

def frame_statistics(
    frames: List[np.ndarray]
) -> Dict:
    """
    Generate statistics.
    """

    if len(frames) == 0:

        return {
            "count": 0
        }

    height = frames[0].shape[0]
    width = frames[0].shape[1]

    return {
        "count": len(frames),
        "height": height,
        "width": width
    }


# ==============================================================================
# DEBUG UTILITIES
# ==============================================================================

def preview_video(
    video_path: str
):
    """
    OpenCV preview window.
    """

    cap = cv2.VideoCapture(
        video_path
    )

    while True:

        success, frame = cap.read()

        if not success:
            break

        cv2.imshow(
            "SAVEZO Preview",
            frame
        )

        key = cv2.waitKey(25)

        if key == 27:
            break

    cap.release()

    cv2.destroyAllWindows()


# ==============================================================================
# QUICK TEST
# ==============================================================================

if __name__ == "__main__":

    print("=" * 60)
    print("SAVEZO FRAME EXTRACTOR")
    print("=" * 60)

    sample_video = "sample.mp4"

    if os.path.exists(sample_video):

        info = get_video_info(
            sample_video
        )

        print("\nVideo Info:")

        for key, value in info.items():
            print(
                f"{key}: {value}"
            )

        frames = extract_frames(
            sample_video,
            max_frames=16
        )

        stats = frame_statistics(
            frames
        )

        print("\nFrame Statistics:")

        for key, value in stats.items():
            print(
                f"{key}: {value}"
            )

    else:

        print(
            "\nNo sample video found."
        )

    print("\nFrame extractor loaded successfully.")