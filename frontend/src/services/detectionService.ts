/**
 * detectionService.ts
 *
 * SAVEZO Deepfake Detection Service
 *
 * Responsibilities:
 * - Upload media
 * - Call DFD API
 * - Health checks
 * - Model checks
 * - Batch analysis
 * - Error handling
 * - Type-safe API layer
 *
 * Author: SAVEZO
 */

export const API_BASE_URL =
  "http://localhost:5000"

/* =============================================================================
   TYPES
============================================================================= */

export type RiskLevel =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "MINIMAL"

export interface DetectionResult {
  analysis_id: string

  timestamp: string

  filename: string

  file_size_mb: number

  file_hash: string

  deepfake: number

  confidence: number

  label: string

  model: string

  risk_level: RiskLevel

  risk_color: string

  recommendations: string[]

  status: string

  original_filename?: string

  uploaded_path?: string
}

export interface AnalyzeResponse {
  success: boolean
  timestamp: string
  data: DetectionResult
}

export interface BatchAnalyzeResponse {
  success: boolean

  timestamp: string

  data: {
    total_files: number
    results: DetectionResult[]
  }
}

export interface HealthResponse {
  service: string
  status: string
  timestamp: string
}

export interface ModelsResponse {
  xception: boolean
  vit: boolean
  fft_lstm: boolean
  mode: "MOCK" | "REAL"
}

export interface ApiErrorResponse {
  success?: boolean
  error?: string
  message?: string
}

/* =============================================================================
   CUSTOM ERROR
============================================================================= */

export class DetectionApiError extends Error {
  public status?: number

  constructor(
    message: string,
    status?: number
  ) {
    super(message)

    this.name = "DetectionApiError"

    this.status = status
  }
}

/* =============================================================================
   INTERNAL HELPERS
============================================================================= */

async function handleResponse<T>(
  response: Response
): Promise<T> {
  let payload: any = null

  try {
    payload = await response.json()
  } catch {
    throw new DetectionApiError(
      "Invalid server response",
      response.status
    )
  }

  if (!response.ok) {
    throw new DetectionApiError(
      payload?.error ??
        payload?.message ??
        "Unknown server error",
      response.status
    )
  }

  return payload as T
}

function validateFile(file: File): void {
  const supported = [
    "jpg",
    "jpeg",
    "png",
    "bmp",
    "webp",
    "mp4",
    "avi",
    "mov",
    "mkv",
    "webm",
  ]

  const extension =
    file.name.split(".").pop()?.toLowerCase() ?? ""

  if (!supported.includes(extension)) {
    throw new DetectionApiError(
      `Unsupported file type: ${extension}`
    )
  }

  const maxSizeMB = 500

  const sizeMB =
    file.size / 1024 / 1024

  if (sizeMB > maxSizeMB) {
    throw new DetectionApiError(
      `File exceeds ${maxSizeMB}MB limit`
    )
  }
}

/* =============================================================================
   MAIN SERVICE
============================================================================= */

class DetectionService {
  /* ---------------------------------------------------------------------------
     HEALTH
  --------------------------------------------------------------------------- */

  async health(): Promise<HealthResponse> {
    const response = await fetch(
      `${API_BASE_URL}/health`,
      {
        method: "GET",
      }
    )

    return handleResponse<HealthResponse>(
      response
    )
  }

  /* ---------------------------------------------------------------------------
     MODELS
  --------------------------------------------------------------------------- */

  async models(): Promise<ModelsResponse> {
    const response = await fetch(
      `${API_BASE_URL}/models`,
      {
        method: "GET",
      }
    )

    return handleResponse<ModelsResponse>(
      response
    )
  }

  /* ---------------------------------------------------------------------------
     INFO
  --------------------------------------------------------------------------- */

  async info(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/info`,
      {
        method: "GET",
      }
    )

    return handleResponse(response)
  }

  /* ---------------------------------------------------------------------------
     SINGLE FILE ANALYSIS
  --------------------------------------------------------------------------- */

  async analyzeFile(
    file: File
  ): Promise<DetectionResult> {
    validateFile(file)

    const formData = new FormData()

    formData.append(
      "file",
      file
    )

    const response = await fetch(
      `${API_BASE_URL}/analyze`,
      {
        method: "POST",
        body: formData,
      }
    )

    const result =
      await handleResponse<AnalyzeResponse>(
        response
      )

    return result.data
  }

  /* ---------------------------------------------------------------------------
     MULTIPLE FILE ANALYSIS
  --------------------------------------------------------------------------- */

  async analyzeBatch(
    files: File[]
  ): Promise<DetectionResult[]> {
    if (files.length === 0) {
      throw new DetectionApiError(
        "No files selected"
      )
    }

    const formData = new FormData()

    files.forEach((file) => {
      validateFile(file)

      formData.append(
        "files",
        file
      )
    })

    const response = await fetch(
      `${API_BASE_URL}/analyze/batch`,
      {
        method: "POST",
        body: formData,
      }
    )

    const result =
      await handleResponse<BatchAnalyzeResponse>(
        response
      )

    return result.data.results
  }

  /* ---------------------------------------------------------------------------
     HISTORY
  --------------------------------------------------------------------------- */

  async history(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/history`,
      {
        method: "GET",
      }
    )

    return handleResponse(response)
  }

  /* ---------------------------------------------------------------------------
     SERVER AVAILABILITY
  --------------------------------------------------------------------------- */

  async isOnline(): Promise<boolean> {
    try {
      await this.health()

      return true
    } catch {
      return false
    }
  }

  /* ---------------------------------------------------------------------------
     PREVIEW METADATA
  --------------------------------------------------------------------------- */

  getFileMetadata(file: File) {
    const extension =
      file.name.split(".").pop() ?? ""

    const sizeMB =
      file.size / 1024 / 1024

    return {
      name: file.name,
      extension,
      sizeMB: Number(
        sizeMB.toFixed(2)
      ),
      mimeType: file.type,
    }
  }

  /* ---------------------------------------------------------------------------
     FILE TYPE HELPERS
  --------------------------------------------------------------------------- */

  isImage(file: File): boolean {
    return file.type.startsWith(
      "image"
    )
  }

  isVideo(file: File): boolean {
    return file.type.startsWith(
      "video"
    )
  }

  /* ---------------------------------------------------------------------------
     FORMAT RISK LABEL
  --------------------------------------------------------------------------- */

  getRiskBadgeClass(
    risk: RiskLevel
  ): string {
    switch (risk) {
      case "CRITICAL":
        return "bg-red-500 text-white"

      case "HIGH":
        return "bg-orange-500 text-white"

      case "MEDIUM":
        return "bg-yellow-500 text-black"

      case "LOW":
        return "bg-blue-500 text-white"

      case "MINIMAL":
        return "bg-green-500 text-white"

      default:
        return "bg-gray-500 text-white"
    }
  }

  /* ---------------------------------------------------------------------------
     CONFIDENCE FORMAT
  --------------------------------------------------------------------------- */

  formatConfidence(
    value: number
  ): string {
    return `${value.toFixed(2)}%`
  }

  /* ---------------------------------------------------------------------------
     LABEL FORMAT
  --------------------------------------------------------------------------- */

  isDeepfake(
    result: DetectionResult
  ): boolean {
    return (
      result.label
        .toUpperCase()
        .trim() === "FAKE"
    )
  }
}

/* =============================================================================
   SINGLETON EXPORT
============================================================================= */

export const detectionService =
  new DetectionService()

export default detectionService