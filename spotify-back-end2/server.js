import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors' //cors: Чтобы разрешить вашему фронтенду (localhost:5173) брать данные с бэкенда (localhost:4000).
import router from './router.js'
import User from './User.js'
import UserInteraction from './UserInteraction.js'
import dotenv from 'dotenv' //dotenv: Чтобы прятать пароли от базы данных.
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 5000
const DB_URL = process.env.DB_URL
const uploadsDir = path.join(__dirname, 'uploads')

app.use(cors()) // Разрешает запросы с любого фронтенда
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(uploadsDir));
app.get('/api/health', (req, res) => {
    const stateMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    res.json({
        ok: true,
        service: 'spotify-back-end2',
        dbState: stateMap[mongoose.connection.readyState] || 'unknown'
    });
});
app.use('/api', router)

app.use((req, res) => {
    res.status(404).json({ message: 'Маршрут не найден' });
});

app.use((err, req, res, next) => {
    console.error('UNHANDLED SERVER ERROR:', err);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

async function syncUserIndexes() {
    try {
        await User.syncIndexes();
        console.log('User indexes synced');
    } catch (e) {
        console.log('User index sync skipped:', e.message);
    }
}

async function syncInteractionIndexes() {
    try {
        await UserInteraction.syncIndexes();
        console.log('UserInteraction indexes synced');
    } catch (e) {
        console.log('UserInteraction index sync skipped:', e.message);
    }
}

async function startApp() {
    try {
        if (!DB_URL) {
            throw new Error(`DB_URL is not set. Expected .env at ${path.join(__dirname, '.env')}`);
        }

        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected');
        });

        mongoose.connection.on('error', (error) => {
            console.error('MongoDB error:', error.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });

        await mongoose.connect(DB_URL, {
            serverSelectionTimeoutMS: 10000
        })
        await syncUserIndexes()
        await syncInteractionIndexes()
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on http://0.0.0.0:${PORT}`);
        });
    } catch (e) {
        console.error('Failed to start server:', e.message);
    }
}

startApp()
