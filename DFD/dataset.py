"""
dataset.py

Dataset Utilities for SAVEZO Deepfake Detection

Supports:
- Xception
- Vision Transformer (ViT)
- FFT + CNN + LSTM

Expected Structure:

datasets/
└── deepfake/
    ├── images/
    │   ├── real/
    │   └── fake/
    │
    └── videos/
        ├── real/
        └── fake/
"""

from __future__ import annotations

import os
import random
from pathlib import Path
from typing import List, Tuple, Dict, Any

SUPPORTED_IMAGE_EXTENSIONS = (
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp",
)

SUPPORTED_VIDEO_EXTENSIONS = (
    ".mp4",
    ".avi",
    ".mov",
    ".mkv",
    ".webm",
)


# ==============================================================================
# FILE HELPERS
# ==============================================================================

def is_image_file(filename: str) -> bool:
    return filename.lower().endswith(SUPPORTED_IMAGE_EXTENSIONS)


def is_video_file(filename: str) -> bool:
    return filename.lower().endswith(SUPPORTED_VIDEO_EXTENSIONS)


def safe_listdir(directory: str) -> List[str]:
    if not os.path.exists(directory):
        return []

    return sorted(os.listdir(directory))


# ==============================================================================
# IMAGE DATASET LOADER
# ==============================================================================

def load_image_dataset(
    dataset_root: str
) -> Tuple[List[str], List[int]]:
    """
    Load image paths and labels.

    Structure:

    dataset_root/
        real/
        fake/

    Returns:
        image_paths
        labels

    Labels:
        real = 0
        fake = 1
    """

    real_dir = os.path.join(dataset_root, "real")
    fake_dir = os.path.join(dataset_root, "fake")

    image_paths: List[str] = []
    labels: List[int] = []

    # Real images
    for filename in safe_listdir(real_dir):

        if not is_image_file(filename):
            continue

        image_paths.append(
            os.path.join(real_dir, filename)
        )
        labels.append(0)

    # Fake images
    for filename in safe_listdir(fake_dir):

        if not is_image_file(filename):
            continue

        image_paths.append(
            os.path.join(fake_dir, filename)
        )
        labels.append(1)

    return image_paths, labels


# ==============================================================================
# VIDEO DATASET LOADER
# ==============================================================================

def load_video_dataset(
    dataset_root: str
) -> Tuple[List[str], List[int]]:
    """
    Load video paths and labels.

    Structure:

    dataset_root/
        real/
        fake/
    """

    real_dir = os.path.join(dataset_root, "real")
    fake_dir = os.path.join(dataset_root, "fake")

    video_paths: List[str] = []
    labels: List[int] = []

    # Real videos
    for filename in safe_listdir(real_dir):

        if not is_video_file(filename):
            continue

        video_paths.append(
            os.path.join(real_dir, filename)
        )
        labels.append(0)

    # Fake videos
    for filename in safe_listdir(fake_dir):

        if not is_video_file(filename):
            continue

        video_paths.append(
            os.path.join(fake_dir, filename)
        )
        labels.append(1)

    return video_paths, labels


# ==============================================================================
# DATASET VALIDATION
# ==============================================================================

def validate_dataset(
    paths: List[str],
    labels: List[int]
) -> bool:
    """
    Validate dataset integrity.
    """

    if len(paths) == 0:
        raise ValueError(
            "Dataset contains zero files."
        )

    if len(paths) != len(labels):
        raise ValueError(
            "Number of labels and paths do not match."
        )

    missing_files = []

    for path in paths:

        if not os.path.exists(path):
            missing_files.append(path)

    if missing_files:

        print(
            f"Found {len(missing_files)} missing files."
        )

        for file in missing_files[:10]:
            print("Missing:", file)

        raise FileNotFoundError(
            "Dataset contains missing files."
        )

    return True


# ==============================================================================
# DATASET STATISTICS
# ==============================================================================

def dataset_statistics(
    labels: List[int]
) -> Dict[str, Any]:
    """
    Generate dataset statistics.
    """

    total = len(labels)

    real_count = labels.count(0)
    fake_count = labels.count(1)

    real_pct = (
        real_count / total * 100
        if total > 0 else 0
    )

    fake_pct = (
        fake_count / total * 100
        if total > 0 else 0
    )

    return {
        "total": total,
        "real_count": real_count,
        "fake_count": fake_count,
        "real_percentage": round(real_pct, 2),
        "fake_percentage": round(fake_pct, 2),
    }


def print_dataset_statistics(
    labels: List[int]
) -> None:

    stats = dataset_statistics(labels)

    print("\n" + "=" * 60)
    print("DATASET STATISTICS")
    print("=" * 60)

    print(f"Total Samples : {stats['total']}")
    print(f"Real Samples  : {stats['real_count']}")
    print(f"Fake Samples  : {stats['fake_count']}")
    print(f"Real %        : {stats['real_percentage']}%")
    print(f"Fake %        : {stats['fake_percentage']}%")

    print("=" * 60 + "\n")


# ==============================================================================
# TRAIN / VALIDATION / TEST SPLITS
# ==============================================================================

def create_data_splits(
    paths: List[str],
    labels: List[int],
    train_ratio: float = 0.7,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    random_seed: int = 42
):
    """
    Small-dataset-safe splitting.
    """

    if abs(
        train_ratio +
        val_ratio +
        test_ratio - 1.0
    ) > 1e-6:
        raise ValueError(
            "Ratios must sum to 1.0"
        )

    validate_dataset(paths, labels)

    combined = list(zip(paths, labels))

    random.seed(random_seed)
    random.shuffle(combined)

    paths, labels = zip(*combined)

    total = len(paths)

    # ====================================================
    # SMALL DATASET MODE
    # ====================================================

    if total <= 10:

        train_count = max(
            int(total * train_ratio),
            2
        )

        val_count = max(
            int(total * val_ratio),
            1
        )

        remaining = total - (
            train_count +
            val_count
        )

        test_count = max(
            remaining,
            1
        )

    else:

        train_count = int(
            total * train_ratio
        )

        val_count = int(
            total * val_ratio
        )

        test_count = (
            total -
            train_count -
            val_count
        )

    train_end = train_count

    val_end = (
        train_end +
        val_count
    )

    train_paths = list(
        paths[:train_end]
    )

    train_labels = list(
        labels[:train_end]
    )

    val_paths = list(
        paths[train_end:val_end]
    )

    val_labels = list(
        labels[train_end:val_end]
    )

    test_paths = list(
        paths[val_end:]
    )

    test_labels = list(
        labels[val_end:]
    )

    print("\nDataset Split Summary")
    print("-" * 40)

    print(
        f"Train: {len(train_paths)} samples"
    )

    print(
        f"Validation: {len(val_paths)} samples"
    )

    print(
        f"Test: {len(test_paths)} samples"
    )

    print("-" * 40)

    return (
        train_paths,
        train_labels,
        val_paths,
        val_labels,
        test_paths,
        test_labels,
    )


def sample_dataset(
    paths: List[str],
    labels: List[int],
    max_samples: int,
    seed: int = 42
):
    """
    Generic SAVEZO dataset sampler.
    """

    if len(paths) <= max_samples:
        return paths, labels

    combined = list(
        zip(paths, labels)
    )

    random.seed(seed)

    random.shuffle(combined)

    combined = combined[:max_samples]

    sampled_paths, sampled_labels = zip(
        *combined
    )

    return (
        list(sampled_paths),
        list(sampled_labels)
    )

def sample_per_class(
    real_paths: List[str],
    fake_paths: List[str],
    samples_per_class: int = 5,
    seed: int = 42
):
    """
    Used by FFT-LSTM training.
    """

    random.seed(seed)

    if len(real_paths) > samples_per_class:
        real_paths = random.sample(
            real_paths,
            samples_per_class
        )

    if len(fake_paths) > samples_per_class:
        fake_paths = random.sample(
            fake_paths,
            samples_per_class
        )

    return real_paths, fake_paths

# ==============================================================================
# PATH DISCOVERY
# ==============================================================================

def discover_dataset_structure(
    root: str
) -> Dict[str, str]:
    """
    Discover SAVEZO dataset structure.
    """

    root = Path(root)

    return {
        "images_real":
            str(root / "images" / "real"),

        "images_fake":
            str(root / "images" / "fake"),

        "videos_real":
            str(root / "videos" / "real"),

        "videos_fake":
            str(root / "videos" / "fake"),
    }


# ==============================================================================
# QUICK TEST
# ==============================================================================

if __name__ == "__main__":

    print("=" * 60)
    print("SAVEZO DATASET MODULE")
    print("=" * 60)

    example_root = "datasets/deepfake"

    structure = discover_dataset_structure(
        example_root
    )

    print("\nExpected Dataset Structure:")

    for key, value in structure.items():
        print(f"{key}: {value}")

    print("\nDataset module loaded successfully.")