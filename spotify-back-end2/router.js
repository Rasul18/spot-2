import Router from 'express';
import PostController from './PostController.js';

const router = new Router();

router.post('/posts', PostController.createPost);

router.get('/posts', PostController.getAllPosts);

// Отримання ОДНОГО поста за ID
router.get('/posts/:id', PostController.getOne);

// Оновлення поста
router.put('/posts/:id', PostController.update);

// Видалення поста
router.delete('/posts/:id', PostController.delete);

export default router;