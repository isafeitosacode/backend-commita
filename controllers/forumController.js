// controllers/forumController.js
const Forum = require('../models/Forum');
const Post = require('../models/Post');

// Buscar todos os Fóruns
const getForums = async (req, res) => {
  try {
    const forums = await Forum.find().sort({ createdAt: -1 });
    
    // Mapeia os fóruns e conta quantos tópicos cada um tem no banco de dados
    const forumsComContagem = await Promise.all(forums.map(async (forum) => {
        const topicsCount = await Post.countDocuments({ forumId: forum._id });
        return {
            ...forum.toObject(), // Converte para objeto comum do JS
            topicsCount // Injeta a contagem real
        };
    }));

    res.json(forumsComContagem);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar fóruns', error: error.message });
  }
};

// Criar um novo Fórum
const createForum = async (req, res) => {
  try {
    const { nome, descricao, categoria, icone } = req.body;

    const novoForum = await Forum.create({
      nome,
      descricao,
      categoria,
      icone: icone || 'fas fa-code',
      criador: req.user._id,
      membros: [req.user._id]
    });

    res.status(201).json(novoForum);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar fórum', error: error.message });
  }
};

// Buscar os Tópicos de um Fórum específico
const getForumPosts = async (req, res) => {
  try {
    // Busca apenas os posts que tenham o forumId igual ao ID passado na URL
    const posts = await Post.find({ forumId: req.params.id })
      .populate('autor', 'nome username foto')
      .populate('comentarios.autor', 'nome username foto')
      .sort({ createdAt: -1 }); // Mais recentes primeiro

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar tópicos do fórum', error: error.message });
  }
};

module.exports = { getForums, createForum, getForumPosts };