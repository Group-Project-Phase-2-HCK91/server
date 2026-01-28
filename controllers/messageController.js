const { Message, User } = require('../models');

module.exports = class MessageController {
    static async getMessage(req, res, next) {
        try {
            const messages = await Message.findAll({
                order: [['createdAt', 'ASC']],
                include: [{
                    model: User,
                    attributes: ['username', 'id']
                }]
            });

            res.json(messages);
        } catch (error) {
            next(error);
        }
    }

    static async createMessage(req, res, next) {
        try {
            const { UserId, content, imgUrl } = req.body;
            const message = await Message.create({
                UserId,
                content,
                imgUrl
            });

            const messageUser = await Message.findOne({
                where: { id: message.id },
                include: [{
                    model: User,
                    attributes: ['username', 'id']
                }]
            });

            res.status(201).json(messageUser);
        } catch (error) {
            next(error);
        }
    }
}