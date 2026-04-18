require('dotenv').config();
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const multer = require('multer');
const pdfParse = require('pdf-parse');

// Multer setup (memory storage for PDF)
const upload = multer({ storage: multer.memoryStorage() });

// Groq (OpenAI-compatible)
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});


router.post("/upload-resume", upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const pdfData = await pdfParse(req.file.buffer);

    res.json({ text: pdfData.text });
  } catch (error) {
    console.error("PDF ERROR:", error);
    res.status(500).json({ error: "PDF parsing failed" });
  }
});



router.post("/analyze", async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;

    if (!resume || !jobDescription) {
      return res.status(400).json({ error: "Missing input data" });
    }

    // 🔴 Agent 1 - Critic
    const criticResponse = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a harsh technical recruiter looking for reasons to REJECT this candidate. 
Return JSON with:
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

    // 🟢 Agent 2 - Coach
    const coachResponse = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a supportive career coach. 
Return JSON with:
- profileStrengths (array)
- skillGapAnalysis (string)
- microSkillBridge (array of objects with skill & project)
- overallVerdict (string)
- recommendedJobTitles (array)`
        },
        {
          role: "user",
          content: `Resume: ${resume}\n\nJob Description: ${jobDescription}`
        }
      ],
    });

    // Parse responses
    const critic = JSON.parse(criticResponse.choices[0].message.content);
    const coach = JSON.parse(coachResponse.choices[0].message.content);

    // Final response
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

module.exports = router;