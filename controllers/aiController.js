const { Message, User } = require('../models');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = class AIController {
    static async summarizeChat(req, res, next) {
        try {
            // Kita ambil 'limit' dari query atau body, default 20 jika tidak diisi
            const limit = parseInt(req.query.limit) || 20;

            const lastMessages = await Message.findAll({
                limit: limit,
                order: [['createdAt', 'DESC']],
                include: [{ model: User, attributes: ['username'] }]
            });

            if (lastMessages.length === 0) {
                return res.status(404).json({ message: "Belum ada percakapan untuk dirangkum." });
            }

            // Format pesan agar AI tahu siapa yang bicara apa
            const chatTexts = lastMessages
                .reverse()
                .map(m => `${m.User.username}: ${m.content}`)
                .join("\n");

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
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
                messagesCount: lastMessages.length 
            });
        } catch (error) {
            next(error);
        }
    }
};