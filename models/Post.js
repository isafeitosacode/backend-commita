// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Faz o relacionamento com a coleção de Usuários
    required: true
  },
  tipo: {
    type: String,
    enum: ['Projeto', 'Snippet', 'Duvida', 'Dúvida', 'Fórum'],
    default: 'Snippet',
    required: true
  },
  titulo: {
    type: String,
    // O título pode ser opcional para Snippets rápidos, mas útil para Projetos e Dúvidas
  },
  conteudo: {
    type: String,
    required: true
  },
  tags: [
    { type: String } // Ex: ['react', 'nodejs', 'ui']
  ],
  linkExtra: {
    type: String // Útil para colocar o link do repositório em um "Projeto"
  },
  forumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Forum',
    default: null // Se for null, aparece no Feed Geral. Se tiver ID, pertence a um fórum.
  },
  curtidas: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Array de IDs de quem curtiu
  ],
  comentarios: [
    {
      autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      texto: { type: String, required: true },
      data: { type: Date, default: Date.now }
    }
  ],
  // Adicione dentro do postSchema, antes do { timestamps: true }
arquivos: [
    {
        nome: { type: String },
        url:  { type: String },
        tipo: { type: String }
    }
],
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

const Post = mongoose.model('Post', postSchema);
module.exports = Post;