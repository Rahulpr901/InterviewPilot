const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL =
  process.env.GROQ_API_URL || "https://api.groq.com/openai/v1";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const createProviderError = (message, statusCode = 502) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const requestGroq = async (prompt) => {
  if (!GROQ_API_KEY || GROQ_API_KEY === "YOUR_GROQ_API_KEY") {
    throw createProviderError(
      "Groq API key is missing. Set GROQ_API_KEY in backend/.env.",
      500,
    );
  }

  let response;
  try {
    response = await global.fetch(`${GROQ_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Return only valid JSON. Do not include markdown fences or explanatory text.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });
  } catch (error) {
    const cause = error.cause || error;
    const detail = cause.code || cause.message || "network error";
    throw createProviderError(
      `Unable to reach Groq API (${detail}). Check your internet/DNS connection and GROQ_API_URL.`,
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw createProviderError(
      `Groq API error: ${response.status} ${errorText}`,
      response.status >= 500 ? 502 : response.status,
    );
  }

  const json = await response.json();
  return normalizeGroqResponse(json);
};

const parsePossibleJsonString = (value) => {
  if (typeof value !== "string") return value;
  const cleaned = value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    return value;
  }
};

const normalizeGroqResponse = (payload) => {
  if (!payload) return null;
  if (Array.isArray(payload)) {
    return parsePossibleJsonString(payload[0]);
  }
  if (
    payload.outputs &&
    Array.isArray(payload.outputs) &&
    payload.outputs.length
  ) {
    return parsePossibleJsonString(payload.outputs[0]);
  }
  if (payload.output) return parsePossibleJsonString(payload.output);
  if (payload.choices && Array.isArray(payload.choices) && payload.choices[0]) {
    return parsePossibleJsonString(payload.choices[0].message?.content);
  }
  if (typeof payload === "string") return parsePossibleJsonString(payload);
  return payload;
};

const toNumber = (value, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return fallback;
  const match = value.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : fallback;
};

const toStringArray = (value) => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

const normalizeAnswerEvaluation = (evaluation) => {
  const data = evaluation && typeof evaluation === "object" ? evaluation : {};
  return {
    score: toNumber(data.score ?? data.overallScore),
    communication: toNumber(data.communication ?? data.communicationScore),
    technicalAccuracy: toNumber(
      data.technicalAccuracy ?? data.technicalScore ?? data.accuracy,
    ),
    confidence: toNumber(data.confidence),
    completeness: toNumber(data.completeness),
    grammar: toNumber(data.grammar),
    strengths: toStringArray(data.strengths),
    weaknesses: toStringArray(data.weaknesses),
    suggestedBetterAnswer:
      data.suggestedBetterAnswer || data.betterAnswer || data.feedback || "",
    followUpQuestion: data.followUpQuestion || "",
  };
};

exports.analyzeResume = async (resumeText) => {
  const prompt = `Analyze the following resume text and return valid JSON with keys: name, email, phone, education, skills, projects, experience, certifications, programmingLanguages, technologies, resumeScore, missingSkills, strengths, weaknesses, suggestedImprovements. Text:\n${resumeText}`;
  const result = await requestGroq(prompt);
  return result;
};

exports.generateInterviewQuestions = async (resumeText) => {
  const prompt = `Based only on the resume text below, generate 10 software engineering interview questions that feel specific and grounded in the candidate's projects, skills, and experience. Return valid JSON with a single key questions that contains an array of question strings. Resume text:\n${resumeText}`;
  const result = await requestGroq(prompt);
  return result;
};

exports.evaluateAnswer = async ({ resumeText, question, answer }) => {
  const prompt = `Evaluate this interview answer. Return valid JSON with exactly these keys: score, communication, technicalAccuracy, confidence, completeness, grammar, strengths, weaknesses, suggestedBetterAnswer, followUpQuestion. Use numeric scores from 0 to 100. Resume text:\n${resumeText}\nQuestion:\n${question}\nAnswer:\n${answer}`;
  const result = await requestGroq(prompt);
  return normalizeAnswerEvaluation(result);
};

exports.summarizeInterview = async ({ resumeText, session }) => {
  const prompt = `Create a final interview report from the session data below. Include overallScore, communicationScore, technicalScore, resumeConfidence, topStrengths, topWeaknesses, recommendedTopics, hiringRecommendation, detailedFeedback, and questionFeedback for each answer. Return valid JSON only. Resume text:\n${resumeText}\nSession data:\n${JSON.stringify(session)}`;
  const result = await requestGroq(prompt);
  return result;
};
