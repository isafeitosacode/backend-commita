// controllers/userController.js
const User = require('../models/User');
const Post = require('../models/Post'); // Importante para contar as estatísticas e o ranking!
const bcrypt = require('bcrypt');

// 1. Pegar Perfil do Usuário
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-senha');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar perfil' });
    }
};

// 2. Atualizar Perfil
const updateUserProfile = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: req.body },
            { returnDocument: 'after', runValidators: true }
        ).select('-senha'); 

        if (updatedUser) {
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'Esse nome de usuário já está sendo usado por outra pessoa.' 
            });
        }
        console.error("Erro no backend:", error); 
        res.status(500).json({ message: 'Erro ao atualizar perfil.', erro: error.message });
    }
};

// 3. Atualizar Senha
const updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const salt = await bcrypt.genSalt(10);
            user.senha = await bcrypt.hash(req.body.senha, salt);
            
            await user.save();
            res.json({ message: 'Senha atualizada com sucesso' });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar senha' });
    }
};

// 4. Excluir Conta
const deleteUserProfile = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        res.json({ message: 'Conta excluída com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir conta' });
    }
};

// 5. Buscar Contribuições do Usuário (Posts + Comentários)
const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const postsCount = await Post.countDocuments({ autor: userId });
        
        const postsComMeusComentarios = await Post.find({ "comentarios.autor": userId });
        let comentariosCount = 0;
        postsComMeusComentarios.forEach(post => {
            comentariosCount += post.comentarios.filter(c => c.autor.toString() === userId.toString()).length;
        });
        
        res.json({ contribuicoes: postsCount + comentariosCount });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar estatísticas.' });
    }
};

// 6. Gerar Ranking de Colaboradores (10 pontos por ação)
const getRanking = async (req, res) => {
    try {
        const users = await User.find().select('nome username foto');
        const posts = await Post.find();

        const ranking = users.map(user => {
            let acoes = 0;
            
            posts.forEach(post => {
                if (post.autor.toString() === user._id.toString()) acoes++; 
                if (post.curtidas.includes(user._id)) acoes++; 
                post.comentarios.forEach(c => {
                    if (c.autor.toString() === user._id.toString()) acoes++; 
                });
            });

            return {
                _id: user._id,
                nome: user.nome,
                pontos: acoes * 10
            };
        });

        ranking.sort((a, b) => b.pontos - a.pontos);
        res.json(ranking.slice(0, 5)); // Retorna o Top 5
    } catch (error) {
        res.status(500).json({ message: 'Erro ao gerar ranking.' });
    }
};

module.exports = { 
    getUserProfile, 
    updateUserProfile, 
    updatePassword, 
    deleteUserProfile,
    getUserStats,
    getRanking
};