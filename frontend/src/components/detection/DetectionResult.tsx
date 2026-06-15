interface Props {
  result: {
    deepfake: number

    confidence?: number

    label?: string

    model?: string

    risk_level?: string

    risk_color?: string

    recommendations?: string[]

    nude?: number

    mental?: number

    overall?: number
  }
}

export default function DetectionResult({
  result,
}: Props) {

  const confidence =
    result.confidence ??
    (100 - result.deepfake)

  const overall =
    result.overall ??
    result.deepfake

  const nude =
    result.nude ?? 0

  const mental =
    result.mental ?? 0

  const model =
    result.model ??
    "SAVEZO AI"

  const riskLevel =
    result.risk_level ??
    (
      result.deepfake >= 90
        ? "CRITICAL"
        : result.deepfake >= 75
        ? "HIGH"
        : result.deepfake >= 50
        ? "MEDIUM"
        : result.deepfake >= 25
        ? "LOW"
        : "MINIMAL"
    )

  const recommendations =
    result.recommendations ?? []

  const isAuthentic =
    result.label
      ? result.label === "REAL"
      : result.deepfake < 30

  // =========================
  // 🟢 AUTHENTIC UI
  // =========================

  if (isAuthentic) {
    return (
      <div className="w-full space-y-6">

        {/* HEADER */}
        <div className="bg-safe/10 border border-safe/20 rounded-2xl p-6 text-center">

          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-safe/20 flex items-center justify-center text-xl text-safe">
            ✔
          </div>

          <h2 className="text-2xl font-bold text-safe">
            AUTHENTIC CONTENT
          </h2>

          <p className="text-muted-foreground text-sm mt-2">
            No deepfake indicators detected — content appears genuine
          </p>

        </div>

        {/* PROBABILITIES */}
        <div className="grid grid-cols-2 gap-4">

          <div className="bg-card border border-border rounded-xl p-5 text-center">

            <p className="text-xs text-muted-foreground mb-2">
              FAKE PROBABILITY
            </p>

            <p className="text-4xl font-bold text-safe">
              {result.deepfake.toFixed(0)}%
            </p>

            <p className="text-xs text-safe mt-1">
              LOW RISK
            </p>

          </div>

          <div className="bg-card border border-border rounded-xl p-5 text-center">

            <p className="text-xs text-muted-foreground mb-2">
              REAL PROBABILITY
            </p>

            <p className="text-4xl font-bold text-safe">
              {(100 - result.deepfake).toFixed(0)}%
            </p>

            <p className="text-xs text-safe mt-1">
              HIGH CONFIDENCE
            </p>

          </div>

        </div>

        {/* CONFIDENCE */}
        <div>

          <div className="flex justify-between text-sm mb-2">

            <span className="text-muted-foreground">
              Detection Confidence
            </span>

            <span className="text-safe font-semibold">
              {confidence.toFixed(0)}% Confidence
            </span>

          </div>

          <div className="h-3 bg-muted rounded-full overflow-hidden">

            <div
              className="h-full bg-safe transition-all duration-700"
              style={{
                width: `${confidence}%`,
              }}
            />

          </div>

        </div>

        {/* BREAKDOWN */}
        <div>

          <p className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
            📊 Detection Breakdown
          </p>

          <div className="space-y-3 text-sm">

            {[
              {
                label:
                  "Facial Landmark Anomaly",
                value: 5,
              },
              {
                label:
                  "GAN Artifacts",
                value: 8,
              },
              {
                label:
                  "Temporal Inconsistency",
                value: 7,
              },
              {
                label:
                  "Skin Texture Analysis",
                value: 5,
              },
              {
                label:
                  "Frequency Domain",
                value: 5,
              },
            ].map((item) => (
              <div key={item.label}>

                <div className="flex justify-between mb-1">

                  <span className="text-muted-foreground">
                    {item.label}
                  </span>

                  <span className="text-safe">
                    {item.value}%
                  </span>

                </div>

                <div className="h-1 bg-muted rounded">

                  <div
                    className="h-full bg-safe"
                    style={{
                      width:
                        `${item.value}%`,
                    }}
                  />

                </div>

              </div>
            ))}

          </div>

        </div>

        {/* MODEL INFO */}
        <div className="bg-card border border-border rounded-xl p-4">

          <div className="flex justify-between text-sm">

            <span className="text-muted-foreground">
              Model Used
            </span>

            <span className="font-semibold">
              {model}
            </span>

          </div>

          <div className="flex justify-between text-sm mt-2">

            <span className="text-muted-foreground">
              Risk Level
            </span>

            <span className="text-safe font-semibold">
              {riskLevel}
            </span>

          </div>

        </div>

        {/* SUCCESS CARD */}
        <div className="bg-safe/10 border border-safe/20 rounded-xl p-4 text-sm">

          <p className="text-safe font-semibold flex items-center gap-2">
            ✔ Content Cleared
          </p>

          <p className="text-muted-foreground text-xs mt-1">
            No deepfake indicators detected. This content appears authentic and safe to share.
          </p>

        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 mt-4">

          <button className="flex-1 py-3 rounded-xl bg-muted border border-border hover:bg-muted/70 transition text-sm text-foreground">
            🔄 New Analysis
          </button>

          <button className="flex-1 py-3 rounded-xl bg-accent-gradient text-white text-sm font-semibold">
            📤 Go to Feed
          </button>

        </div>

      </div>
    )
  }

  // =========================
  // 🔴 FAKE / SUSPICIOUS UI
  // =========================

  return (
    <div className="w-full space-y-6">

      {/* SCORE */}
      <div className="text-center">

        <div className="w-28 h-28 mx-auto rounded-full border-4 border-warning flex flex-col items-center justify-center">

          <span className="text-3xl font-bold text-warning">
            {overall.toFixed(0)}%
          </span>

          <span className="text-xs text-muted-foreground">
            SCORE
          </span>

        </div>

        <p className="mt-4 text-muted-foreground text-sm">
          Overall Deepfake Risk
        </p>

      </div>

      {/* BARS */}
      {[
        {
          label:
            "Deepfake Probability",
          value: result.deepfake,
        },
        {
          label: "Confidence",
          value: confidence,
        },
        {
          label:
            "Authenticity Score",
          value:
            100 -
            result.deepfake,
        },
      ].map((item) => (
        <div key={item.label}>

          <div className="flex justify-between mb-2 text-sm">

            <span className="text-foreground">
              {item.label}
            </span>

            <span className="text-muted-foreground">
              {item.value.toFixed(0)}%
            </span>

          </div>

          <div className="h-3 bg-muted rounded-full">

            <div
              className="h-full bg-danger"
              style={{
                width:
                  `${item.value}%`,
              }}
            />

          </div>

        </div>
      ))}

      {/* MODEL INFO */}
      <div className="bg-card border border-border rounded-xl p-4">

        <div className="flex justify-between mb-3">

          <span className="text-sm text-muted-foreground">
            Model Used
          </span>

          <span className="text-sm font-semibold">
            {model}
          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-sm text-muted-foreground">
            Risk Level
          </span>

          <span className="text-warning font-semibold">
            {riskLevel}
          </span>

        </div>

      </div>

      {/* ALERT */}
      <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 text-sm">

        <p className="text-warning font-semibold">
          ⚠ Potentially suspicious content
        </p>

        <p className="text-muted-foreground text-xs mt-1">
          Some inconsistencies detected. Review recommended.
        </p>

      </div>

      {/* RECOMMENDATIONS */}
      {recommendations.length > 0 && (

        <div className="bg-card border border-border rounded-xl p-4">

          <p className="text-sm font-semibold mb-3">
            Recommendations
          </p>

          <ul className="space-y-2">

            {recommendations.map(
              (
                item,
                index
              ) => (
                <li
                  key={index}
                  className="text-xs text-muted-foreground"
                >
                  • {item}
                </li>
              )
            )}

          </ul>

        </div>

      )}

    </div>
  )
}