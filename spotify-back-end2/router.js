import { Router } from 'express';
import SongController from './SongController.js';
import AuthController from './AuthController.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = new Router();

const ensureUploadsDirs = () => {
    const musicDir = path.join(__dirname, 'uploads/music');
    const imagesDir = path.join(__dirname, 'uploads/images');
    fs.mkdirSync(musicDir, { recursive: true });
    fs.mkdirSync(imagesDir, { recursive: true });
};

router.use((req, res, next) => {
    console.log('🔍 Запрос:', req.method, req.path);
    console.log('📋 Content-Type:', req.get('content-type'));
    next();
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        ensureUploadsDirs();
        if (file.fieldname === 'file') {
            cb(null, path.join(__dirname, 'uploads/music'));
        } else {
            cb(null, path.join(__dirname, 'uploads/images'));
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'file') {
            const ok = [
                'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
                'audio/ogg', 'audio/mp4', 'video/mp4', 'audio/x-m4a'
            ].includes(file.mimetype);
            return ok ? cb(null, true) : cb(new Error('Неподдерживаемый аудиоформат'));
        }

        if (file.fieldname === 'image') {
            return file.mimetype.startsWith('image/')
                ? cb(null, true)
                : cb(new Error('Файл обложки должен быть изображением'));
        }

        cb(new Error('Неизвестное поле файла'));
    }
});

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', AuthController.me);

router.post('/songs', (req, res, next) => {
    upload.fields([
        { name: 'file', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            console.error('❌ ОШИБКА MULTER:', err.message);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ message: 'Файл слишком большой. Максимальный размер: 200 MB' });
            }
            return res.status(400).json({ message: `Ошибка multer: ${err.message}` });
        }
        next();
    });
}, SongController.createSong);

router.get('/songs', SongController.getAllSongs);
router.get('/songs/:id', SongController.getOne);
router.put('/songs/:id', SongController.update);
router.delete('/songs/:id', SongController.delete);

export default router;
