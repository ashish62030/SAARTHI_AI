const Gemini_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
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
                const response = await fetch(`${getGeminiUrl(model)}?key=${apikey}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
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
                            temperature: 0.7,
                            maxOutputTokens: 500,
                        },
                    })
                })

                const data = await response.json().catch(async () => ({
                    error: {
                        message: await response.text()
                    }
                }))

                if (!response.ok) {
                    const status = response.status
                    const message = data?.error?.message || "Gemini request failed"

                    if (status === 400 || status === 401) {
                        user.geminiStatus = "invalid"
                        await user.save()
                        throw new Error("Gemini API key is invalid. Please add a valid key in Builder.")
                    }

                    if (status === 429) {
                        user.geminiStatus = "quota_exceeded"
                        await user.save()
                        throw new Error("Gemini quota exceeded. Please check your Gemini API limit.")
                    }

                    if (status === 503 && attempt < 2) {
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
        lastError?.message?.includes("high demand") ||
        lastError?.message?.includes("busy") ||
        lastError?.message?.includes("UNAVAILABLE")
            ? "Gemini is busy right now. Please try again."
            : lastError?.message || "Gemini API fetch failed"
    )
}


