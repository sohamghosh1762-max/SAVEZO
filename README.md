# SAVEZO

AI-powered platform for detecting deepfake images and videos.

## Features

* Deepfake Image Detection
* Deepfake Video Detection
* Xception Model
* Vision Transformer (ViT)
* FFT + CNN + LSTM
* REST API
* Next.js Frontend

## Installation

git clone <repository>

cd SAVEZO

pip install -r requirements.txt

## Dataset Setup

See:

DFD/datasets/README.md

## Model Setup

See:

DFD/checkpoints/README.md

## Start Backend

cd DFD

python api.py

## Start Frontend

cd frontend

npm install

npm run dev

## API Endpoints

GET /health

GET /models

POST /analyze

POST /analyze/batch
