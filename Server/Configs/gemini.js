const Gemini_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
]

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getGeminiUrl = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

export const generateGeminiResponse = async ({
    prompt,
    apikey,
    user
}) => {
    if (!apikey) {
        throw new Error("Gemini API key missing")
    }

    let lastError = null

    for (const model of Gemini_MODELS) {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const response = await fetch(getGeminiUrl(model), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-goog-api-key": apikey,
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: prompt
                                    }
                                ]
                            }
                        ],
                        generationConfig: {
                            maxOutputTokens: 500,
                            thinkingConfig: {
                                thinkingLevel: "low",
                            },
                        },
                    })
                })

                const responseText = await response.text()
                let data = {}
                try {
                    data = responseText ? JSON.parse(responseText) : {}
                } catch {
                    data = { error: { message: responseText } }
                }

                if (!response.ok) {
                    const status = response.status
                    const message = data?.error?.message || "Gemini request failed"

                    const isQuotaError = status === 429 ||
                        /quota|resource.?exhausted|rate.?limit/i.test(message)
                    const isInvalidKey = status === 401 ||
                        ((status === 400 || status === 403) && /api.?key|credential|permission denied/i.test(message))

                    if (isInvalidKey) {
                        user.geminiStatus = "invalid"
                        await user.save()
                        throw new Error("Gemini API key is invalid. Please add a valid key in Builder.")
                    }

                    if (isQuotaError) {
                        user.geminiStatus = "quota_exceeded"
                        await user.save()
                        throw new Error("Gemini quota exceeded. Please check your Gemini API limit.")
                    }

                    if ((status === 429 || status === 500 || status === 503) && attempt < 2) {
                        lastError = new Error("Gemini is busy right now. Retrying...")
                        await wait(800)
                        continue
                    }

                    lastError = new Error(message)
                    break
                }

                user.geminiStatus = "active"
                await user.save()

                const text = data.candidates?.[0]
                    ?.content?.parts
                    ?.map((part) => part.text || "")
                    .join(" ")
                    .trim()

                if (!text) {
                    const reason = data.candidates?.[0]?.finishReason
                    throw new Error(
                        reason
                            ? `Gemini returned no text. Reason: ${reason}`
                            : "Gemini returned no text."
                    )
                }

                return text.trim()
            } catch (error) {
                lastError = error

                if (
                    error.message.includes("invalid") ||
                    error.message.includes("quota") ||
                    error.message.includes("no text")
                ) {
                    throw error
                }

                if (attempt < 2) {
                    await wait(800)
                }
            }
        }
    }

    console.error("Gemini Fetch Error:", lastError?.message)
    throw new Error(
        /high demand|busy|UNAVAILABLE|temporarily unavailable/i.test(lastError?.message || "")
            ? "Gemini is busy right now. Please try again."
            : lastError?.message || "Gemini API fetch failed"
    )
}


