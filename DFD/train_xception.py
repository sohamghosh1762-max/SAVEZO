"""
Training Script for Xception Deepfake Detector

Expected dataset structure (DFD/datasets/deepfake/images):

    datasets/deepfake/images/
    ├── train/
    │   ├── REAL/      (real images for training)
    │   └── FAKE/      (fake images for training)
    └── test/
        ├── REAL/      (real images for testing)
        └── FAKE/      (fake images for testing)

Usage:
    python train_xception.py --data_dir datasets/deepfake/images
    python train_xception.py --data_dir datasets/deepfake/images --epochs 20 --batch_size 32
"""

import torch
from torch.utils.data import DataLoader
import argparse
import os
import random

from advanced_models import XceptionDeepfake, ImageDeepfakeDataset, train_model, evaluate_model
from dataset import is_image_file, print_dataset_statistics
import torchvision.transforms as transforms


# Default path relative to the DFD/ directory
DEFAULT_DATA_DIR = os.path.join(os.path.dirname(__file__), "datasets", "deepfake", "images")

SUPPORTED_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.bmp', '.webp')


def parse_args():
    parser = argparse.ArgumentParser(description='Train Xception Deepfake Detector')
    parser.add_argument(
        '--data_dir', type=str, default=DEFAULT_DATA_DIR,
        help='Path to image dataset root (must contain train/ and test/ subdirs, '
             'each with REAL/ and FAKE/ folders). '
             'Default: datasets/deepfake/images'
    )
    parser.add_argument('--val_split', type=float, default=0.15,
                        help='Fraction of training data to use for validation (default: 0.15)')
    parser.add_argument('--epochs', type=int, default=10, help='Number of epochs')
    parser.add_argument('--batch_size', type=int, default=16, help='Batch size')
    parser.add_argument('--lr', type=float, default=1e-4, help='Learning rate')
    parser.add_argument('--save_path', type=str, default='checkpoints', help='Save path')
    parser.add_argument('--seed', type=int, default=42, help='Random seed')
    parser.add_argument('--max_train_samples', type=int, default=10, help='Maximum training images to use')
    parser.add_argument('--max_test_samples', type=int, default=2,help='Maximum testing images to use')
    return parser.parse_args()


def _find_subdir(parent: str, target_name: str) -> str:
    """
    Find a subdirectory by name (case-insensitive).
    Handles both 'REAL'/'FAKE' and 'real'/'fake' folder naming.
    """
    for entry in os.listdir(parent):
        if entry.lower() == target_name.lower() and os.path.isdir(os.path.join(parent, entry)):
            return os.path.join(parent, entry)
    raise FileNotFoundError(
        f"Could not find '{target_name}' directory (case-insensitive) inside: {parent}"
    )


def load_images_from_split(split_dir: str):
    """
    Load image paths and labels from a split directory (train/ or test/).
    Expects <split_dir>/REAL/ and <split_dir>/FAKE/ (case-insensitive).

    Returns:
        image_paths (list[str]), labels (list[int])   — real=0, fake=1
    """
    real_dir = _find_subdir(split_dir, "real")
    fake_dir = _find_subdir(split_dir, "fake")

    image_paths = []
    labels = []

    # Real images (label = 0)
    for f in sorted(os.listdir(real_dir)):
        if f.lower().endswith(SUPPORTED_EXTENSIONS):
            image_paths.append(os.path.join(real_dir, f))
            labels.append(0)

    # Fake images (label = 1)
    for f in sorted(os.listdir(fake_dir)):
        if f.lower().endswith(SUPPORTED_EXTENSIONS):
            image_paths.append(os.path.join(fake_dir, f))
            labels.append(1)

    return image_paths, labels


def split_train_val(paths, labels, val_ratio=0.15, seed=42):
    """Split training data into train + validation subsets."""
    combined = list(zip(paths, labels))
    random.seed(seed)
    random.shuffle(combined)

    val_count = int(len(combined) * val_ratio)
    val_data = combined[:val_count]
    train_data = combined[val_count:]

    train_paths, train_labels = zip(*train_data) if train_data else ([], [])
    val_paths, val_labels = zip(*val_data) if val_data else ([], [])

    return list(train_paths), list(train_labels), list(val_paths), list(val_labels)

def sample_dataset(paths, labels, max_samples, seed=42):
    """
    Randomly sample dataset while preserving labels.
    """
    if len(paths) <= max_samples:
        return paths, labels

    combined = list(zip(paths, labels))

    random.seed(seed)
    random.shuffle(combined)

    combined = combined[:max_samples]

    sampled_paths, sampled_labels = zip(*combined)

    return list(sampled_paths), list(sampled_labels)

def main():
    args = parse_args()

    print("=" * 60)
    print("  Training Xception Deepfake Detector")
    print("=" * 60)

    # ── Validate dataset directory ──────────────────────────────
    data_dir = os.path.abspath(args.data_dir)
    train_split_dir = os.path.join(data_dir, "train")
    test_split_dir = os.path.join(data_dir, "test")

    if not os.path.isdir(data_dir):
        raise FileNotFoundError(
            f"Dataset root not found: {data_dir}\n"
            f"Expected structure:\n"
            f"  {data_dir}/\n"
            f"  ├── train/\n"
            f"  │   ├── REAL/\n"
            f"  │   └── FAKE/\n"
            f"  └── test/\n"
            f"      ├── REAL/\n"
            f"      └── FAKE/"
        )

    for d, name in [(train_split_dir, "train"), (test_split_dir, "test")]:
        if not os.path.isdir(d):
            raise FileNotFoundError(
                f"Missing '{name}/' directory inside: {data_dir}\n"
                f"Place your images in {d}/REAL/ and {d}/FAKE/"
            )

    print(f"Dataset root : {data_dir}")

    # ── Device ──────────────────────────────────────────────────
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device       : {device}")

    # ── Image transforms ────────────────────────────────────────
    transform = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((299, 299)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    # ── Load pre-split datasets ─────────────────────────────────
    print("\nLoading training images...")
    all_train_paths, all_train_labels = load_images_from_split(train_split_dir)

    print(
        f"Found {len(all_train_paths)} images "
        f"(Real: {all_train_labels.count(0)}, "
        f"Fake: {all_train_labels.count(1)})"
    )

    print("\nSampling training images...")
    all_train_paths, all_train_labels = sample_dataset(
        all_train_paths,
        all_train_labels,
        args.max_train_samples,
        args.seed
    )

    print(
        f"Using {len(all_train_paths)} training images"
    )

    print("\nLoading test images...")
    test_paths, test_labels = load_images_from_split(test_split_dir)

    print(
        f"Found {len(test_paths)} images "
        f"(Real: {test_labels.count(0)}, "
        f"Fake: {test_labels.count(1)})"
    )

    print("\nSampling test images...")
    test_paths, test_labels = sample_dataset(
        test_paths,
        test_labels,
        args.max_test_samples,
        args.seed
    )

    print(
        f"Using {len(test_paths)} test images"
    )

    if len(all_train_paths) == 0:
        raise ValueError(
            f"No images found in {train_split_dir}/REAL or {train_split_dir}/FAKE.\n"
            f"Supported formats: {SUPPORTED_EXTENSIONS}"
        )

    # ── Split training data into train + validation ─────────────
    train_paths, train_labels, val_paths, val_labels = split_train_val(
        all_train_paths, all_train_labels,
        val_ratio=args.val_split, seed=args.seed
    )

    print(f"\nDataset Split Summary")
    print("-" * 40)
    print(f"  Train      : {len(train_paths)} samples")
    print(f"  Validation : {len(val_paths)} samples")
    print(f"  Test       : {len(test_paths)} samples")
    print("-" * 40)

    # ── Create PyTorch datasets & loaders ───────────────────────
    train_dataset = ImageDeepfakeDataset(train_paths, train_labels, transform=transform)
    val_dataset = ImageDeepfakeDataset(val_paths, val_labels, transform=transform)
    test_dataset = ImageDeepfakeDataset(test_paths, test_labels, transform=transform)

    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=args.batch_size, shuffle=False)

    # ── Create model ────────────────────────────────────────────
    model = XceptionDeepfake(pretrained=True)
    model = model.to(device)

    # ── Train ───────────────────────────────────────────────────
    print("\nStarting training...")
    history = train_model(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        epochs=args.epochs,
        learning_rate=args.lr,
        device=str(device),
        model_name="Xception"
    )

    # ── Save model ──────────────────────────────────────────────
    os.makedirs(args.save_path, exist_ok=True)
    save_path = os.path.join(args.save_path, 'xception.pth')
    torch.save(model.state_dict(), save_path)
    print(f"\nModel saved to: {save_path}")

    # ── Evaluate ────────────────────────────────────────────────
    print("\nEvaluating on test set...")
    results = evaluate_model(model, test_loader, device=str(device))
    print(f"Test Accuracy: {results['accuracy']:.4f}")
    print(f"Test ROC-AUC : {results['roc_auc']:.4f}")

if __name__ == "__main__":
    main()

