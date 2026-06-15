# SAVEZO Dataset Setup

SAVEZO uses two public datasets.

## Image Deepfake Dataset

Dataset: CIFAKE

Expected Structure:

datasets/
└── deepfake/
└── images/
├── train/
│   ├── REAL/
│   └── FAKE/
│
└── test/
├── REAL/
└── FAKE/

Download CIFAKE dataset and extract the folders into the structure above.

---

## Video Deepfake Dataset

Dataset: FaceForensics++

Expected Structure:

datasets/
└── deepfake/
└── videos/
├── REAL/
└── FAKE/

Download FaceForensics++ videos and place them in the folders above.

---

After setup: Run all the files

python train_xception.py

python train_vit.py

python train_fft_lstm.py
