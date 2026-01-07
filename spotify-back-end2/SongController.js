import SongG from "./Song.js";

class SongController {
    async createSong(req, res) {
        try {
            // ВИПРАВЛЕНО: Тепер ми чекаємо поля пісні, а не поста
            const { name, desc, image, file, duration, album } = req.body;
            
            // Створюємо пісню
            const song = await SongG.create({ name, desc, image, file, duration, album });
            
            res.json(song);
        } catch (e) {
            res.status(500).json(e);
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