const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = class UploadController {
    static async uploadImage(req, res, next) {
        try {
            if (!req.file) throw { name: "BadRequest", message: "Image is required" };

            const base64File = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${base64File}`;
            
            const result = await cloudinary.uploader.upload(dataURI);
            res.json({ imgUrl: result.secure_url });
        } catch (error) {
            next(error);
        }
    }
};