import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    name: { type: String, required: true },
    desc: { type: String, required: true },
    image: { type: String, required: true }, // Тут буде посилання на картинку
    file: { type: String, required: true },  // Тут буде посилання на MP3 файл
    duration: { type: String, required: true },
    album: { type: String, default: "Single" },
    genre: { type: String, default: "Pop" }
})

// Створюємо модель 'Song'
export default mongoose.model('SongG', songSchema);