import SongG from "./Song.js";
import cloudinary from "cloudinary";
import { fetchJamendoSongs } from "./jamendoService.js";

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadToCloudinary(localPath, options) {
    try {
        return await cloudinary.v2.uploader.upload(localPath, options);
    } catch (error) {
        console.error("CLOUDINARY UPLOAD ERROR:", error.message);
        return null;
    }
}

class SongController {
    async createSong(req, res) {
        try {
            if (process.env.NODE_ENV !== "production") {
                console.log("Upload payload received");
            }

            // Проверка: если файлы не дошли, не идем дальше
            if (!req.files || !req.files.file || !req.files.image) {
                return res.status(400).json({ message: "Файлы 'file' или 'image' не получены сервером" });
            }

            const { name, desc, duration, album, genre } = req.body;
            const audioPath = req.files.file[0].path;
            const imagePath = req.files.image[0].path;
            const localImagePath = `/uploads/images/${req.files.image[0].filename}`;
            const localAudioPath = `/uploads/music/${req.files.file[0].filename}`;

            const uploadedImage = await uploadToCloudinary(imagePath, {
                folder: "spotify/images",
                resource_type: "image"
            });

            const uploadedAudio = await uploadToCloudinary(audioPath, {
                folder: "spotify/audio",
                resource_type: "video"
            });

            const song = await SongG.create({
                name,
                desc,
                duration,
                album,
                genre: genre || "Pop",
                image: uploadedImage?.secure_url || localImagePath,
                file: uploadedAudio?.secure_url || localAudioPath
            });

            res.json(song);
        } catch (e) {
            console.error("CREATE SONG ERROR:", e);
            res.status(500).json({ message: "Ошибка на сервере", error: e.message });
        }
    }

    async getAllSongs(req, res) {
        try {
            const source = String(req.query.source || "all").toLowerCase();
            const offset = Number(req.query.offset || 0);
            const limit = Number(req.query.limit || process.env.JAMENDO_LIMIT || 30);

            if (source === "jamendo") {
                const jamendoResult = await fetchJamendoSongs({ offset, limit });
                return res.json(jamendoResult);
            }

            const [localSongs, jamendoResult] = await Promise.all([
                SongG.find().lean(),
                fetchJamendoSongs({ offset: 0, limit })
            ]);

            const songs = [
                ...localSongs.map((song) => ({
                    ...song,
                    source: "local"
                })),
                ...jamendoResult.songs
            ];

            return res.json(songs);
        } catch (e) {
            console.error("GET SONGS ERROR:", e.message);
            return res.status(500).json({ message: "Ошибка получения песен" });
        }
    }

    async getOne(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'ID не вказано' });
            }
            const song = await SongG.findById(id).lean();
            if (!song) {
                return res.status(404).json({ message: 'Песня не найдена' });
            }
            return res.json(song);
        } catch (e) {
            return res.status(500).json({ message: "Ошибка получения песни" });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'ID не вказано' });
            }
            const updatedSong = await SongG.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true
            }).lean();
            if (!updatedSong) {
                return res.status(404).json({ message: 'Песня не найдена' });
            }
            return res.json(updatedSong);
        } catch (e) {
            return res.status(500).json({ message: "Ошибка обновления песни" });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'ID не вказано' });
            }
            const song = await SongG.findByIdAndDelete(id);
            if (!song) {
                return res.status(404).json({ message: 'Песня не найдена' });
            }
            return res.json(song);
        } catch (e) {
            return res.status(500).json({ message: "Ошибка удаления песни" });
        }
    }
}

export default new SongController();
