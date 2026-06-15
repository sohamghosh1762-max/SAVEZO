"""
api.py

SAVEZO Deepfake Detection API

Features:
- Flask REST API
- Mock Mode Support
- Future .pth Support
- File Upload Handling
- Image Analysis
- Video Analysis
- Health Check Endpoint
- Model Status Endpoint
- Prediction Endpoint
- JSON Responses
- Frontend Ready

Author: SAVEZO
"""

from __future__ import annotations

import os
import uuid
import traceback

from pathlib import Path
from datetime import datetime

from flask import (
    Flask,
    jsonify,
    request
)

from flask_cors import CORS

from werkzeug.utils import secure_filename

from predictor import predict_media , predictor_status


# ==============================================================================
# CONFIGURATION
# ==============================================================================

APP_NAME = "SAVEZO Deepfake API"

APP_VERSION = "1.0.0"

HOST = "0.0.0.0"

PORT = 5000

UPLOAD_DIRECTORY = "uploads"

MAX_FILE_SIZE_MB = 500

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp",
    ".mp4",
    ".avi",
    ".mov",
    ".mkv",
    ".webm"
}


# ==============================================================================
# APP INITIALIZATION
# ==============================================================================

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/*": {
            "origins": "*"
        }
    }
)

app.config[
    "MAX_CONTENT_LENGTH"
] = MAX_FILE_SIZE_MB * 1024 * 1024

os.makedirs(
    UPLOAD_DIRECTORY,
    exist_ok=True
)


# ==============================================================================
# HELPERS
# ==============================================================================

def allowed_file(
    filename: str
) -> bool:

    extension = (
        Path(filename)
        .suffix
        .lower()
    )

    return (
        extension
        in ALLOWED_EXTENSIONS
    )


def generate_filename(
    original_name: str
) -> str:

    extension = (
        Path(original_name)
        .suffix
    )

    unique_id = str(
        uuid.uuid4()
    )

    return (
        f"{unique_id}{extension}"
    )


def create_success_response(
    data
):

    return jsonify({
        "success": True,
        "timestamp":
            datetime.utcnow()
            .isoformat(),
        "data": data
    })


def create_error_response(
    message: str,
    status_code: int = 400
):

    response = jsonify({
        "success": False,
        "timestamp":
            datetime.utcnow()
            .isoformat(),
        "error": message
    })

    response.status_code = status_code

    return response


# ==============================================================================
# ROOT
# ==============================================================================

@app.route(
    "/",
    methods=["GET"]
)
def root():

    return jsonify({
        "service": APP_NAME,
        "version": APP_VERSION,
        "status": "running"
    })


# ==============================================================================
# HEALTH CHECK
# ==============================================================================

@app.route(
    "/health",
    methods=["GET"]
)
def health():

    return jsonify({
        "service": APP_NAME,
        "status": "healthy",
        "timestamp":
            datetime.utcnow()
            .isoformat()
    })

@app.route(
    "/status",
    methods=["GET"]
)
def status():

    return jsonify(
        predictor_status()
    )


# ==============================================================================
# MODEL STATUS
# ==============================================================================

@app.route(
    "/models",
    methods=["GET"]
)
def model_status():

    checkpoint_dir = "checkpoints"

    return jsonify({
        "xception":
            os.path.exists(
                os.path.join(
                    checkpoint_dir,
                    "xception.pth"
                )
            ),

        "vit":
            os.path.exists(
                os.path.join(
                    checkpoint_dir,
                    "vit.pth"
                )
            ),

        "fft_lstm":
            os.path.exists(
                os.path.join(
                    checkpoint_dir,
                    "fft_lstm.pth"
                )
            ),

        "mode":
            "REAL"
            if any([
                os.path.exists(
                    os.path.join(
                        checkpoint_dir,
                        "xception.pth"
                    )
                ),
                os.path.exists(
                    os.path.join(
                        checkpoint_dir,
                        "vit.pth"
                    )
                ),
                os.path.exists(
                    os.path.join(
                        checkpoint_dir,
                        "fft_lstm.pth"
                    )
                )
            ])
            else "MOCK"
    })


# ==============================================================================
# ANALYZE MEDIA
# ==============================================================================

@app.route(
    "/analyze",
    methods=["POST"]
)
def analyze_media():

    try:

        if "file" not in request.files:

            return create_error_response(
                "No file uploaded."
            )

        uploaded_file = (
            request.files["file"]
        )

        if uploaded_file.filename == "":

            return create_error_response(
                "Empty filename."
            )

        if not allowed_file(
            uploaded_file.filename
        ):

            return create_error_response(
                "Unsupported file type."
            )

        filename = (
            secure_filename(
                uploaded_file.filename
            )
        )

        unique_filename = (
            generate_filename(
                filename
            )
        )

        save_path = (
            os.path.join(
                UPLOAD_DIRECTORY,
                unique_filename
            )
        )

        uploaded_file.save(
            save_path
        )

        prediction = (
            predict_media(
                save_path
            )
        )

        try:
            os.remove(save_path)
        except:
            pass

        prediction[
            "original_filename"
        ] = filename

        prediction[
            "uploaded_path"
        ] = save_path

        return create_success_response(
            prediction
        )

    except Exception as e:

        traceback.print_exc()

        return create_error_response(
            str(e),
            500
        )


# ==============================================================================
# ANALYZE MULTIPLE FILES
# ==============================================================================

@app.route(
    "/analyze/batch",
    methods=["POST"]
)
def analyze_batch():

    try:

        files = request.files.getlist(
            "files"
        )

        if len(files) == 0:

            return create_error_response(
                "No files uploaded."
            )

        results = []

        for uploaded_file in files:

            if (
                uploaded_file.filename
                == ""
            ):
                continue

            if not allowed_file(
                uploaded_file.filename
            ):
                continue

            filename = (
                secure_filename(
                    uploaded_file.filename
                )
            )

            save_path = (
                os.path.join(
                    UPLOAD_DIRECTORY,
                    generate_filename(
                        filename
                    )
                )
            )

            uploaded_file.save(
                save_path
            )

            prediction = (
                predict_media(
                    save_path
                )
            )

            try:
                os.remove(save_path)
            except:
                pass

            prediction[
                "original_filename"
            ] = filename

            results.append(
                prediction
            )

        return create_success_response(
            {
                "total_files":
                    len(results),
                "results":
                    results
            }
        )

    except Exception as e:

        traceback.print_exc()

        return create_error_response(
            str(e),
            500
        )


# ==============================================================================
# RECENT ANALYSIS (PLACEHOLDER)
# ==============================================================================

@app.route(
    "/history",
    methods=["GET"]
)
def history():

    return jsonify({
        "message":
            "History database not integrated yet.",
        "records": []
    })


# ==============================================================================
# API INFORMATION
# ==============================================================================

@app.route(
    "/info",
    methods=["GET"]
)
def info():

    return jsonify({

        "application":
            APP_NAME,

        "version":
            APP_VERSION,

        "supported_formats":
            list(
                ALLOWED_EXTENSIONS
            ),

        "maximum_upload_mb":
            MAX_FILE_SIZE_MB,

        "current_mode":
            "MOCK / REAL AUTO-DETECTION"
    })

@app.route(
    "/ping",
    methods=["GET"]
)
def ping():

    return {
        "message": "pong"
    }

# ==============================================================================
# ERROR HANDLERS
# ==============================================================================

@app.errorhandler(404)
def not_found(error):

    return create_error_response(
        "Endpoint not found.",
        404
    )


@app.errorhandler(413)
def file_too_large(error):

    return create_error_response(
        "File exceeds upload limit.",
        413
    )


@app.errorhandler(500)
def internal_error(error):

    return create_error_response(
        "Internal server error.",
        500
    )


# ==============================================================================
# START SERVER
# ==============================================================================

if __name__ == "__main__":

    print("=" * 60)
    print("SAVEZO DEEPFAKE API")
    print("=" * 60)

    print(f"Host : {HOST}")
    print(f"Port : {PORT}")

    print("\nAvailable Endpoints")

    print("GET  /")
    print("GET  /health")
    print("GET  /models")
    print("GET  /info")
    print("GET  /history")

    print("POST /analyze")
    print("POST /analyze/batch")
    print("GET  /ping")
    print("GET  /status")

    print("\nStarting Server...\n")

    app.run(
        host=HOST,
        port=PORT,
        debug=True
    )