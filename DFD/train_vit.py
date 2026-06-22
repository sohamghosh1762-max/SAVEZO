"""
SAVEZO Vision Transformer Training Script
Auto Dataset Discovery Version

Supported Dataset Structure:

datasets/
│
├── images/
│   ├── train/
│   │   ├── REAL/
│   │   └── FAKE/
│   │
│   └── test/
│       ├── REAL/
│       └── FAKE/
"""

import os
import random
import argparse
from pathlib import Path

import torch
import torchvision.transforms as transforms

from torch.utils.data import DataLoader

from advanced_models import (
    ViTDeepfake,
    ImageDeepfakeDataset,
    train_model,
    evaluate_model,
)

SUPPORTED_EXTENSIONS = (
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp",
)


# =============================================================================
# ARGUMENTS
# =============================================================================

def parse_args():
    parser = argparse.ArgumentParser(
        description="Train SAVEZO ViT Deepfake Detector"
    )

    parser.add_argument(
        "--epochs",
        type=int,
        default=10
    )

    parser.add_argument(
        "--batch_size",
        type=int,
        default=16
    )

    parser.add_argument(
        "--lr",
        type=float,
        default=1e-4
    )

    parser.add_argument(
        "--dataset_root",
        type=str,
        default="datasets/deepfake/images"
    )

    parser.add_argument(
        "--save_path",
        type=str,
        default="checkpoints"
    )

    parser.add_argument(
        "--val_split",
        type=float,
        default=0.15
    )

    parser.add_argument(
        "--max_train_samples",
        type=int,
        default=10,
        help="Maximum training images to use"
    )

    parser.add_argument(
        "--max_test_samples",
        type=int,
        default=2,
        help="Maximum testing images to use"
    )

    return parser.parse_args()


# =============================================================================
# IMAGE COLLECTION
# =============================================================================

def collect_images(folder):
    images = []

    if not os.path.exists(folder):
        return images

    for file in os.listdir(folder):
        if file.lower().endswith(SUPPORTED_EXTENSIONS):
            images.append(
                os.path.join(folder, file)
            )

    return images


# =============================================================================
# DATASET VALIDATION
# =============================================================================

def validate_dataset(dataset_root):

    train_real = os.path.join(
        dataset_root,
        "train",
        "REAL"
    )

    train_fake = os.path.join(
        dataset_root,
        "train",
        "FAKE"
    )

    test_real = os.path.join(
        dataset_root,
        "test",
        "REAL"
    )

    test_fake = os.path.join(
        dataset_root,
        "test",
        "FAKE"
    )

    required = [
        train_real,
        train_fake,
        test_real,
        test_fake
    ]

    missing = []

    for folder in required:
        if not os.path.exists(folder):
            missing.append(folder)

    if missing:

        print("\nERROR: Missing Dataset Folders\n")

        for folder in missing:
            print(folder)

        raise FileNotFoundError(
            "Dataset structure invalid."
        )

    return (
        train_real,
        train_fake,
        test_real,
        test_fake
    )


# =============================================================================
# LOAD DATASET
# =============================================================================

def load_dataset(dataset_root):

    (
        train_real,
        train_fake,
        test_real,
        test_fake
    ) = validate_dataset(dataset_root)

    train_paths = []
    train_labels = []

    test_paths = []
    test_labels = []

    # REAL TRAIN

    real_train_imgs = collect_images(train_real)

    train_paths.extend(real_train_imgs)
    train_labels.extend([0] * len(real_train_imgs))

    # FAKE TRAIN

    fake_train_imgs = collect_images(train_fake)

    train_paths.extend(fake_train_imgs)
    train_labels.extend([1] * len(fake_train_imgs))

    # REAL TEST

    real_test_imgs = collect_images(test_real)

    test_paths.extend(real_test_imgs)
    test_labels.extend([0] * len(real_test_imgs))

    # FAKE TEST

    fake_test_imgs = collect_images(test_fake)

    test_paths.extend(fake_test_imgs)
    test_labels.extend([1] * len(fake_test_imgs))

    return (
        train_paths,
        train_labels,
        test_paths,
        test_labels
    )


# =============================================================================
# CREATE VALIDATION SPLIT
# =============================================================================

def create_validation_split(
    paths,
    labels,
    val_ratio=0.15
):

    combined = list(zip(paths, labels))

    random.shuffle(combined)

    paths, labels = zip(*combined)

    split_idx = int(
        len(paths) * (1 - val_ratio)
    )

    train_paths = list(paths[:split_idx])
    train_labels = list(labels[:split_idx])

    val_paths = list(paths[split_idx:])
    val_labels = list(labels[split_idx:])

    return (
        train_paths,
        train_labels,
        val_paths,
        val_labels
    )

def sample_dataset(
    paths,
    labels,
    max_samples,
    seed=42
):
    """
    Randomly sample a subset of images.
    """

    if len(paths) <= max_samples:
        return paths, labels

    combined = list(
        zip(paths, labels)
    )

    random.seed(seed)
    random.shuffle(combined)

    combined = combined[:max_samples]

    sampled_paths, sampled_labels = zip(*combined)

    return (
        list(sampled_paths),
        list(sampled_labels)
    )


# =============================================================================
# MAIN
# =============================================================================

def main():

    args = parse_args()

    print("=" * 70)
    print("SAVEZO ViT Deepfake Training")
    print("=" * 70)

    device = torch.device(
        "cuda"
        if torch.cuda.is_available()
        else "cpu"
    )

    print(f"\nDevice: {device}")

    (
        train_paths,
        train_labels,
        test_paths,
        test_labels
    ) = load_dataset(
        args.dataset_root
    )

    print("\nSampling Dataset...")

    train_paths, train_labels = sample_dataset(
        train_paths,
        train_labels,
        args.max_train_samples
    )

    test_paths, test_labels = sample_dataset(
        test_paths,
        test_labels,
        args.max_test_samples
    )

    print("\nDataset Statistics")
    print("-" * 30)

    print(
        f"Training Samples : {len(train_paths)}"
    )

    print(
        f"Testing Samples  : {len(test_paths)}"
    )

    print(
        f"Train REAL       : {train_labels.count(0)}"
    )

    print(
        f"Train FAKE       : {train_labels.count(1)}"
    )

    if len(train_paths) < 2:
        raise ValueError(
            "Need at least 2 training images."
        )

    if len(test_paths) < 2:
        raise ValueError(
            "Need at least 2 testing images."
        )

    (
        train_paths,
        train_labels,
        val_paths,
        val_labels
    ) = create_validation_split(
        train_paths,
        train_labels,
        args.val_split
    )

    transform = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    train_dataset = ImageDeepfakeDataset(
        train_paths,
        train_labels,
        transform=transform,
        image_size=224
    )

    val_dataset = ImageDeepfakeDataset(
        val_paths,
        val_labels,
        transform=transform,
        image_size=224
    )

    test_dataset = ImageDeepfakeDataset(
        test_paths,
        test_labels,
        transform=transform,
        image_size=224
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        shuffle=True
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size,
        shuffle=False
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=args.batch_size,
        shuffle=False
    )

    print("\nLoading ViT Model...")

    model = ViTDeepfake(
        pretrained=True
    ).to(device)

    print("\nTraining Started...\n")

    history = train_model(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        epochs=args.epochs,
        learning_rate=args.lr,
        device=str(device),
        model_name="SAVEZO-ViT"
    )

    os.makedirs(
        args.save_path,
        exist_ok=True
    )

    checkpoint_path = os.path.join(
        args.save_path,
        "vit.pth"
    )

    torch.save(
        model.state_dict(),
        checkpoint_path
    )

    print(
        f"\nModel Saved:\n{checkpoint_path}"
    )

    print("\nEvaluating...\n")

    results = evaluate_model(
        model,
        test_loader,
        device=str(device)
    )

    print("=" * 70)

    print(
        f"Accuracy : {results['accuracy']:.4f}"
    )

    print(
        f"ROC-AUC  : {results['roc_auc']:.4f}"
    )

    print("=" * 70)

    print("\nTraining Completed Successfully.")


if __name__ == "__main__":
    main()