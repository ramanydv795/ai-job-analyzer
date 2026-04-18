import dotenv from "dotenv";
dotenv.config();

import express from "express";
import multer from "multer";
import OpenAI from "openai";
import { createRequire } from "module";


const require = createRequire(import.meta.url);

const pdfParseModule = require("pdf-parse");

const pdfParse =
  typeof pdfParseModule === "function"
    ? pdfParseModule
    : pdfParseModule?.default || pdfParseModule;

const router = express.Router();

// -------------------- MULTER SETUP --------------------
const upload = multer({ storage: multer.memoryStorage() });

// -------------------- GROQ CLIENT --------------------
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// -------------------- UPLOAD RESUME --------------------
router.post("/upload-resume", upload.single("resume"), async (req, res) => {
  try {
    console.log("=== UPLOAD HIT ===");

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ✅ PDF parsing (stable)
    const pdfData = await pdfParse(req.file.buffer);

    res.json({ text: pdfData.text });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// -------------------- ANALYZE RESUME --------------------
router.post("/analyze", async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;

    if (!resume || !jobDescription) {
      return res.status(400).json({ error: "Missing input data" });
    }

    // 🔴 CRITIC AGENT
    const criticResponse = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a harsh technical recruiter. Return JSON:
- matchScore (0-100)
- missingSkills (array)
- weaknesses (array)
- aiBotScore (percentage)
- rejectionReasons (array)`
        },
        {
          role: "user",
          content: `Resume: ${resume}\n\nJob Description: ${jobDescription}`
        }
      ],
    });

    // 🟢 COACH AGENT
    const coachResponse = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a supportive career coach. Return JSON:
- profileStrengths (array)
- skillGapAnalysis (string)
- microSkillBridge (array)
- overallVerdict (string)
- recommendedJobTitles (array)`
        },
        {
          role: "user",
          content: `Resume: ${resume}\n\nJob Description: ${jobDescription}`
        }
      ],
    });

    const critic = JSON.parse(criticResponse.choices[0].message.content);
    const coach = JSON.parse(coachResponse.choices[0].message.content);

    // -------------------- FINAL RESPONSE --------------------
    res.json({
      matchScore: critic.matchScore,
      aiBotScore: critic.aiBotScore,
      missingSkills: critic.missingSkills,
      weaknesses: critic.weaknesses,
      rejectionReasons: critic.rejectionReasons,
      profileStrengths: coach.profileStrengths,
      skillGapAnalysis: coach.skillGapAnalysis,
      microSkillBridge: coach.microSkillBridge,
      overallVerdict: coach.overallVerdict,
      recommendedJobTitles: coach.recommendedJobTitles,
    });

  } catch (error) {
    console.error("ANALYZE ERROR:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

// -------------------- EXPORT --------------------
export default router;