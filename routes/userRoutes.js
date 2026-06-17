// routes/userRoutes.js
const express = require('express');
const { 
    getUserProfile, 
    updateUserProfile, 
    updatePassword, 
    deleteUserProfile,
    getUserStats, // <-- Adicionado aqui
    getRanking    // <-- Adicionado aqui
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Rotas de Estatísticas e Ranking
router.get('/stats', protect, getUserStats);
router.get('/ranking', getRanking);

// Rotas encadeadas para o mesmo caminho '/profile'
router.route('/profile')
    .get(protect, getUserProfile)      // Puxa os dados
    .put(protect, updateUserProfile)   // Atualiza os dados
    .delete(protect, deleteUserProfile); // Deleta a conta

// Rota separada para a senha
router.put('/password', protect, updatePassword);

module.exports = router;