import {
  ImageVerificationProvider,
  VerificationResult,
  VerificationError,
  verificationResultSchema,
  VERIFICATION_SYSTEM_PROMPT,
} from "./imageVerification.types.js";

const insertCloudinaryTransform = (url: string): string => {
  const transform = "w_1024,q_auto";
  if (url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/${transform}/`);
  }
  return url;
};

const fetchImageAsInlineData = async (
  url: string
): Promise<{ mimeType: string; data: string }> => {
  const response = await fetch(insertCloudinaryTransform(url));

  if (!response.ok) {
    throw new VerificationError(
      `Failed to fetch image for verification: HTTP ${response.status}`
    );
  }

  const mimeType = response.headers.get("content-type") ?? "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());

  return { mimeType, data: buffer.toString("base64") };
};

export class GeminiVerificationProvider implements ImageVerificationProvider {
  private apiKey: string;
  private model: string;
  private timeoutMs: number;
  private retries: number;

  constructor(
    apiKey: string,
    model = "gemini-3.6-flash",
    timeoutMs = 30000,
    retries = 1
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.timeoutMs = timeoutMs;
    this.retries = retries;
  }

  async compare(
    referenceImageUrl: string,
    submissionImageUrl: string
  ): Promise<VerificationResult> {
    const [referenceImage, submissionImage] = await Promise.all([
      fetchImageAsInlineData(referenceImageUrl),
      fetchImageAsInlineData(submissionImageUrl),
    ]);

    let lastError: unknown;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": this.apiKey,
            },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: VERIFICATION_SYSTEM_PROMPT }],
              },
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: "REFERENCE image:" },
                    {
                      inline_data: {
                        mime_type: referenceImage.mimeType,
                        data: referenceImage.data,
                      },
                    },
                    { text: "STAFF SUBMISSION image:" },
                    {
                      inline_data: {
                        mime_type: submissionImage.mimeType,
                        data: submissionImage.data,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
                maxOutputTokens: 2048,
              },
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text().catch(() => "");
          throw new VerificationError(
            `Gemini API error: HTTP ${response.status} ${errorBody.slice(0, 300)}`
          );
        }

        const json = (await response.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };

        const raw = json.candidates?.[0]?.content?.parts
          ?.map((part) => part.text ?? "")
          .join("");

        if (!raw) {
          throw new VerificationError("Gemini returned an empty response");
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          throw new VerificationError("Gemini response was not valid JSON");
        }

        const result = verificationResultSchema.safeParse(parsed);

        if (!result.success) {
          throw new VerificationError(
            `Gemini response schema mismatch: ${result.error.message}`
          );
        }

        return {
          locationMatch: {
            score: result.data.location_match.score,
            reasoning: result.data.location_match.reasoning,
          },
          cleanlinessMatch: {
            score: result.data.cleanliness_match.score,
            reasoning: result.data.cleanliness_match.reasoning,
          },
        };
      } catch (error) {
        lastError = error;

        if (attempt < this.retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw new VerificationError(
      "AI verification service failed after retries",
      lastError
    );
  }
}
