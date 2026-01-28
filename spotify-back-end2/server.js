import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors' //cors: Чтобы разрешить вашему фронтенду (localhost:5173) брать данные с бэкенда (localhost:4000).
import router from './router.js'
import 'dotenv/config' //dotenv: Чтобы прятать пароли от базы данных.


const app = express()
const PORT = process.env.PORT || 5000
const DB_URL = process.env.DB_URL
const FRONTEND_URL = process.env.FRONTEND_URL

app.use(cors({
    origin: FRONTEND_URL || '*'
})) // Разрешает запросы с фронтенда
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));
app.use('/api', router)

async function startApp() {
    try {
        await mongoose.connect(DB_URL)
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
}

startApp()
