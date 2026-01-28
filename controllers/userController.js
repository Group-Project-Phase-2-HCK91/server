const { User } = require('../models');

module.exports = class UserController {
    static async createUser(req, res, next) {
        try {
            const { username } = req.body;
            const [user] = await User.findOrCreate({
                where: { username },
                defaults: { username }
            });
            res.status(201).json({ id: user.id, username: user.username });
        } catch (error) {
            next(error);
        }
    }
};