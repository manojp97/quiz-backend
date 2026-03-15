const express = require("express");
const router = express.Router();
const axios = require("axios");
const authMiddleware = require("../middleware/authMiddleware");
require("dotenv").config();

router.post("/generate", authMiddleware, async (req, res) => {
  const { topic, num_questions } = req.body;
  if (!topic || !num_questions)
    return res.status(400).json({ error: "Topic and number of questions required" });

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `
Generate ${num_questions} MCQ questions on ${topic}.
Return ONLY pure JSON array.
Example format:
[
  {"question":"Question text","options":["A","B","C","D"],"answer":"A"}
]
            `,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let quiz = response.data.choices[0].message.content;
    quiz = quiz.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(quiz);

    res.json({ topic, questions });
  } catch (err) {
    console.log("Groq Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Quiz generation failed" });
  }
});

module.exports = router;