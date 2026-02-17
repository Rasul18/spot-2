import SongG from "./Song.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class SongController {
    async createSong(req, res) {
        try {
            // Добавь эти логи, чтобы увидеть всё в консоли VS Code
            console.log("BODY:", req.body);
            console.log("FILES:", req.files);

            // Проверка: если файлы не дошли, не идем дальше
            if (!req.files || !req.files.file || !req.files.image) {
                return res.status(400).json({ message: "Файлы 'file' или 'image' не получены сервером" });
            }

            const { name, desc, duration, album, genre } = req.body;
            const audioPath = req.files.file[0].path;
            const imagePath = req.files.image[0].path;

            const uploadedImage = await cloudinary.v2.uploader.upload(imagePath, {
                folder: "spotify/images",
                resource_type: "image"
            });

            const uploadedAudio = await cloudinary.v2.uploader.upload(audioPath, {
                folder: "spotify/audio",
                resource_type: "video"
            });

            await fs.unlink(imagePath);
            await fs.unlink(audioPath);

            const song = await SongG.create({
                name,
                desc,
                duration,
                album,
                genre: genre || "Pop",
                image: uploadedImage.secure_url,
                file: uploadedAudio.secure_url
            });

            res.json(song);
        } catch (e) {
            console.log("ОШИБКА ТУТ:", e);
            res.status(500).json({ message: "Ошибка на сервере", error: e.message });
        }
    }

    async getAllSongs(req, res) {
        try {
            const songs = await SongG.find();
            return res.json(songs); // ВИПРАВЛЕНО: повертаємо songs, а не posts
        } catch (e) {
            res.status(500).json(e);
        }
    }

    async getOne(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'ID не вказано' });
            }
            const song = await SongG.findById(id);
            return res.json(song);
        } catch (e) {
            res.status(500).json(e);
        }
    }

    async update(req, res) {
        try {
            const song = req.body;
            // ВИПРАВЛЕНО: перевіряємо song._id
            if (!song._id) {
                return res.status(400).json({ message: 'ID не вказано' });
            }
            const updatedSong = await SongG.findByIdAndUpdate(song._id, song, { new: true });
            return res.json(updatedSong);
        } catch (e) {
            res.status(500).json(e);
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'ID не вказано' });
            }
            const song = await SongG.findByIdAndDelete(id);
            return res.json(song);
        } catch (e) {
            res.status(500).json(e);
        }
    }
}

export default new SongController();
