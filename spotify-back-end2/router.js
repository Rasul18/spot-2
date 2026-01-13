import { Router } from 'express';
import SongController from './SongController.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = new Router();

// Логирование перед multer
router.use((req, res, next) => {
    console.log('🔍 Запрос:', req.method, req.path);
    console.log('📋 Content-Type:', req.get('content-type'));
    next();
});

// Настройка хранилища: куда и под каким именем сохранять файлы
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "file") {
            cb(null, path.join(__dirname, 'uploads/music')); // Абсолютный путь
        } else {
            cb(null, path.join(__dirname, 'uploads/images')); // Абсолютный путь
        }
    },
    filename: (req, file, cb) => {
        // Сохраняем как: ТЕКУЩАЯ_ДАТА + расширение оригинала
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

// Логирование ПОСЛЕ multer
router.post('/songs', (req, res, next) => {
    upload.fields([
        { name: 'file', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            console.error('❌ ОШИБКА MULTER:', err.message);
            return res.status(400).json({ message: `Ошибка multer: ${err.message}` });
        }
        console.log('✅ MULTER ОТРАБОТАЛ');
        console.log('FILES ПОСЛЕ MULTER:', req.files);
        console.log('BODY ПОСЛЕ MULTER:', req.body);
        next();
    });
}, SongController.createSong);

router.get('/songs', SongController.getAllSongs);
router.get('/songs/:id', SongController.getOne);
router.put('/songs/:id', SongController.update);
router.delete('/songs/:id', SongController.delete);

export default router;