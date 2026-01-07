import { Router } from 'express';
import SongController from './SongController.js'; // Виправлено імпорт

const router = new Router();

router.post('/songs', SongController.createSong);
router.get('/songs', SongController.getAllSongs);
router.get('/songs/:id', SongController.getOne);
router.put('/songs/:id', SongController.update);
router.delete('/songs/:id', SongController.delete);

export default router;