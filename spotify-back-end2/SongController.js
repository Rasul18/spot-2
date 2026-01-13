import SongG from "./Song.js";

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

            const { name, desc, duration, album } = req.body;
            const audioFile = req.files.file[0].filename;
            const imageFile = req.files.image[0].filename;

            const song = await SongG.create({
                name, desc, duration, album,
                image: `/uploads/images/${imageFile}`,
                file: `/uploads/music/${audioFile}`
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