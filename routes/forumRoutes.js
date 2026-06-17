// routes/forumRoutes.js
const express = require('express');
// Importe a nova função getForumPosts aqui:
const { getForums, createForum, getForumPosts } = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getForums);
router.post('/', protect, createForum);

// Nova rota para buscar os tópicos:
router.get('/:id/posts', protect, getForumPosts);

module.exports = router;