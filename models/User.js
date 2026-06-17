// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  telefone: { type: String },
  senha: { type: String, required: true },
  foto: { type: String, default: '' },
  bio: { type: String, default: '' }
}, { timestamps: true });

// Função que roda ANTES de salvar no banco para criptografar a senha
userSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
});

// Método para comparar a senha digitada no login com a do banco
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.senha);
};

const User = mongoose.model('User', userSchema);
module.exports = User;