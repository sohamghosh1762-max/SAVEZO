"""
SAVEZO FFT + CNN + LSTM Training Script
Auto Dataset Discovery Version
"""

import os
import argparse
from pathlib import Path

import torch
from torch.utils.data import DataLoader

from advanced_models import (
    FFT_CNN_LSTM,
    FFTVideoDataset,
    train_model,
    evaluate_model,
)

from dataset import create_data_splits

VIDEO_EXTENSIONS = (
    ".mp4",
    ".avi",
    ".mov",
    ".mkv",
    ".webm",
)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Train FFT + CNN + LSTM Deepfake Detector"
    )

    base_dir = Path(__file__).resolve().parent

    default_dataset = (
        base_dir
        / "datasets"
        / "deepfake"
        / "videos"
    )

    parser.add_argument(
        "--data_dir",
        type=str,
        default=str(default_dataset),
    )

    parser.add_argument(
        "--epochs",
        type=int,
        default=10,
    )

    parser.add_argument(
        "--batch_size",
        type=int,
        default=4,
    )

    parser.add_argument(
        "--lr",
        type=float,
        default=1e-4,
    )

    parser.add_argument(
        "--max_frames",
        type=int,
        default=32,
    )

    parser.add_argument(
        "--save_path",
        type=str,
        default="checkpoints",
    )

    parser.add_argument(
        "--max_videos_per_class",
        type=int,
        default=5,
        help="Maximum REAL and FAKE videos to use",
    )

    return parser.parse_args()


def find_videos_recursive(folder):
    videos = []

    if not os.path.exists(folder):
        return videos

    for root, _, files in os.walk(folder):
        for file in files:
            if file.lower().endswith(VIDEO_EXTENSIONS):
                videos.append(
                    os.path.join(root, file)
                )

    return videos


def auto_discover_dataset(data_dir):
    print("\nSearching Dataset...\n")

    candidates = [
        (
            os.path.join(data_dir, "real"),
            os.path.join(data_dir, "fake"),
        ),
        (
            os.path.join(data_dir, "REAL"),
            os.path.join(data_dir, "FAKE"),
        ),
    ]

    for real_dir, fake_dir in candidates:
        if (
            os.path.exists(real_dir)
            and os.path.exists(fake_dir)
        ):
            return real_dir, fake_dir

    raise FileNotFoundError(
        f"""
Could not locate dataset.

Expected one of:

{data_dir}/real
{data_dir}/fake

or

{data_dir}/REAL
{data_dir}/FAKE
"""
    )

def sample_videos(videos, max_samples=5, seed=42):
    """
    Randomly select a limited number of videos.
    """

    import random

    if len(videos) <= max_samples:
        return videos

    random.seed(seed)

    sampled = random.sample(
        videos,
        max_samples
    )

    return sampled

def main():
    args = parse_args()

    print("=" * 60)
    print("FFT + CNN + LSTM Deepfake Detector")
    print("=" * 60)

    device = torch.device(
        "cuda"
        if torch.cuda.is_available()
        else "cpu"
    )

    print(f"\nDevice: {device}")

    real_dir, fake_dir = auto_discover_dataset(
        args.data_dir
    )

    print(f"\nREAL Folder : {real_dir}")
    print(f"FAKE Folder : {fake_dir}")

    real_videos = find_videos_recursive(real_dir)
    fake_videos = find_videos_recursive(fake_dir)

    print(
        f"\nREAL Videos Found : {len(real_videos)}"
    )

    print(
        f"FAKE Videos Found : {len(fake_videos)}"
    )

    # ------------------------------------------------
    # SAVEZO SMALL TRAINING MODE
    # ------------------------------------------------

    real_videos = sample_videos(
        real_videos,
        args.max_videos_per_class
    )

    fake_videos = sample_videos(
        fake_videos,
        args.max_videos_per_class
    )

    print(
        f"\nREAL Videos Selected : {len(real_videos)}"
    )

    print(
        f"FAKE Videos Selected : {len(fake_videos)}"
    )

    if len(real_videos) == 0:
        raise ValueError(
            "\nNo REAL videos found."
        )

    if len(fake_videos) == 0:
        raise ValueError(
            "\nNo FAKE videos found."
        )

    video_paths = (
        real_videos
        + fake_videos
    )

    labels = (
        [0] * len(real_videos)
        + [1] * len(fake_videos)
    )

    print(
        f"\nTotal Samples : {len(video_paths)}"
    )

    if len(video_paths) < 4:
        raise ValueError(
            """
    Need at least:

    2 REAL videos
    2 FAKE videos

    for training.
    """
        )

    (
        train_paths,
        train_labels,
        val_paths,
        val_labels,
        test_paths,
        test_labels,
    ) = create_data_splits(
        video_paths,
        labels,
        train_ratio=0.7,
        val_ratio=0.15,
        test_ratio=0.15,
    )

    print("\nCreating Datasets...")

    train_dataset = FFTVideoDataset(
        train_paths,
        train_labels,
        max_frames=args.max_frames,
    )

    val_dataset = FFTVideoDataset(
        val_paths,
        val_labels,
        max_frames=args.max_frames,
    )

    test_dataset = FFTVideoDataset(
        test_paths,
        test_labels,
        max_frames=args.max_frames,
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        shuffle=True,
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size,
        shuffle=False,
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=args.batch_size,
        shuffle=False,
    )

    print("\nLoading Model...")

    model = FFT_CNN_LSTM()
    model = model.to(device)

    print("\nTraining Started...\n")

    history = train_model(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        epochs=args.epochs,
        learning_rate=args.lr,
        device=str(device),
        model_name="FFT-CNN-LSTM",
    )

    os.makedirs(
        args.save_path,
        exist_ok=True,
    )

    checkpoint_path = os.path.join(
        args.save_path,
        "fft_lstm.pth",
    )

    torch.save(
        model.state_dict(),
        checkpoint_path,
    )

    print(
        f"\nModel Saved:\n{checkpoint_path}"
    )

    print("\nEvaluating...\n")

    results = evaluate_model(
        model,
        test_loader,
        device=str(device),
    )

    print("\nResults")
    print("-" * 40)

    print(
        f"Accuracy : {results['accuracy']:.4f}"
    )

    print(
        f"ROC-AUC  : {results['roc_auc']:.4f}"
    )

    print("\nTraining Complete.")


if __name__ == "__main__":
    main()