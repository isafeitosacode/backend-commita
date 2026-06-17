const express = require('express');
const { 
  createPost, 
  getFeedPosts, 
  likePost, 
  commentPost 
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // <-- importa o multer

const router = express.Router();

router.get('/', getFeedPosts);

router.post('/', protect, upload.array('arquivos', 5), createPost); 

// Novas rotas (note o :id na URL para identificar qual post está recebendo a ação)
router.put('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentPost);

module.exports = router;