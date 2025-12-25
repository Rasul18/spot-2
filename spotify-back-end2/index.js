import express from 'express'
import mongoose from 'mongoose'
import router from './router.js'

const app = express()
const PORT = 5000;

const DB_URL = 'mongodb+srv://razimov2005_db_user:DDkOZoR1HqczXzf0@cluster0.azwxcs6.mongodb.net/';

app.use(express.json());
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