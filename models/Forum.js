// models/Forum.js
const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: true,
    unique: true 
  },
  descricao: { 
    type: String, 
    required: true 
  },
  categoria: { 
    type: String, 
    required: true // Ex: 'programacao', 'desenvolvimento', 'dados', etc.
  },
  icone: { 
    type: String, 
    default: 'fas fa-code' // O ícone do FontAwesome
  },
  criador: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  membros: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ]
}, { timestamps: true });

const Forum = mongoose.model('Forum', forumSchema);
module.exports = Forum;