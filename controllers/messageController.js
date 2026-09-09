const { Message, User } = require('../models');

module.exports = class MessageController {
    static async getMessage(req, res, next) {
        try {
            // Ambil page dari query, default page 1
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await Message.findAndCountAll({
                limit: limit,
                offset: offset,
                order: [['createdAt', 'DESC']],
                include: [{ model: User, attributes: ['username', 'id'] }]
            });

            res.json({
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                messages: rows.reverse() 
            });
        } catch (error) {
            next(error);
        }
    }

    static async createMessage(req, res, next) {
        try {
            const { UserId, content, imgUrl } = req.body;
            const message = await Message.create({ UserId, content, imgUrl });
            const messageUser = await Message.findByPk(message.id, {
                include: [{ model: User, attributes: ['username'] }]
            });
            res.status(201).json(messageUser);
        } catch (error) {
            next(error);
        }
    }
};