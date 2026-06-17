// controllers/postController.js
const Post = require('../models/Post');
const Forum = require('../models/Forum'); // <-- Importante para atualizar os membros do fórum!

// @desc    Criar um novo Commit (Projeto, Snippet ou Dúvida) ou um Tópico de Fórum
// @route   POST /api/posts
// controllers/postController.js
const createPost = async (req, res) => {
  try {
    const { tipo, titulo, conteudo, tags, linkExtra, forumId } = req.body;

    // Pega os caminhos dos arquivos enviados pelo Multer (se houver)
    const arquivos = req.files ? req.files.map(file => ({
        nome: file.originalname,
        url: `/uploads/${file.filename}`,
        tipo: file.mimetype
    })) : [];

    const novoPost = await Post.create({
      autor: req.user._id,
      tipo: tipo || 'Snippet',
      titulo,
      conteudo,
      tags: tags || [],
      linkExtra,
      forumId: forumId || null,
      arquivos  // <-- novo campo
    });

    if (forumId) {
        await Forum.findByIdAndUpdate(forumId, {
            $addToSet: { membros: req.user._id }
        });
    }

    res.status(201).json(novoPost);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar o commit', error: error.message });
  }
};

// @desc    Buscar os Commits para o Feed (Geral)
// @route   GET /api/posts
const getFeedPosts = async (req, res) => {
  try {
    // Busca apenas posts que NÃO pertencem a um fórum específico
    const posts = await Post.find({ forumId: null })
      .populate('autor', 'nome username foto') 
      .populate('comentarios.autor', 'nome username foto') 
      .sort({ createdAt: -1 }); 

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar o feed', error: error.message });
  }
};

// @desc    Curtir ou Descurtir um Post
// @route   PUT /api/posts/:id/like
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    const jaCurtiu = post.curtidas.some(
      (curtida) => curtida.toString() === req.user._id.toString()
    );

    if (jaCurtiu) {
      post.curtidas = post.curtidas.filter(
        (curtida) => curtida.toString() !== req.user._id.toString()
      );
    } else {
      post.curtidas.push(req.user._id);
    }

    await post.save();

    res.json({ curtidas: post.curtidas });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar curtida', error: error.message });
  }
};

// @desc    Adicionar um comentário a um Post
// @route   POST /api/posts/:id/comment
const commentPost = async (req, res) => {
  try {
    const { texto } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    if (!texto) {
      return res.status(400).json({ message: 'O texto do comentário é obrigatório' });
    }

    const novoComentario = {
      autor: req.user._id,
      texto: texto,
      data: Date.now()
    };

    post.comentarios.push(novoComentario);

    await post.save();

    const postAtualizado = await Post.findById(post._id).populate('comentarios.autor', 'nome username foto');

    res.status(201).json(postAtualizado.comentarios);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar comentário', error: error.message });
  }
};

module.exports = { createPost, getFeedPosts, likePost, commentPost };