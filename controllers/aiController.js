const { Message, User } = require("../models");
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = class AIController {
  static async summarizeChat(req, res, next) {
    try {
      // Check if API key exists
      if (
        !process.env.GEMINI_API_KEY ||
        process.env.GEMINI_API_KEY === "your_gemini_api_key_here"
      ) {
        return res.status(500).json({
          message:
            "Gemini API key not configured. Please set GEMINI_API_KEY in .env file.",
        });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      // Kita ambil 'limit' dari query atau body, default 20 jika tidak diisi
      const limit = parseInt(req.query.limit) || 20;

      const lastMessages = await Message.findAll({
        limit: limit,
        order: [["createdAt", "DESC"]],
        include: [{ model: User, attributes: ["username"] }],
      });

      if (lastMessages.length === 0) {
        return res
          .status(404)
          .json({ message: "Belum ada percakapan untuk dirangkum." });
      }

      // Format pesan agar AI tahu siapa yang bicara apa
      const chatTexts = lastMessages
        .reverse()
        .filter((m) => m.User && m.content) // Filter out messages with null User or empty content
        .map((m) => `${m.User.username}: ${m.content}`)
        .join("\n");

      const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
      });

      const prompt = `
                Kamu adalah asisten chat yang pintar. Tugasmu adalah membantu user yang baru bergabung 
                untuk memahami isi percakapan terakhir tanpa harus membaca semuanya.
                
                Berikut adalah daftar percakapan terakhir:
                ${chatTexts}
                
                Tolong buatkan rangkuman dalam Bahasa Indonesia yang singkat, padat, dan gunakan poin-poin.
            `;

      const result = await model.generateContent(prompt);
      res.json({
        summary: result.response.text(),
        messagesCount: lastMessages.length,
      });
    } catch (error) {
      next(error);
    }
  }
};
