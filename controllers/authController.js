// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Função auxiliar para gerar o token JWT (precisaremos adicionar JWT_SECRET no .env)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'segredo_padrao', {
    expiresIn: '30d',
  });
};

// @desc    Cadastrar novo usuário
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  const { nome, username, email, telefone, senha } = req.body;

  try {
    // Verifica se usuário já existe
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'E-mail ou Username já cadastrado' });
    }

    // Cria o usuário
    const user = await User.create({ nome, username, email, telefone, senha });

    if (user) {
      res.status(201).json({
        _id: user._id,
        nome: user.nome,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  }
};

// @desc    Autenticar usuário (Login)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(senha))) {
      res.json({
        _id: user._id,
        nome: user.nome,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'E-mail ou senha inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no login', error: error.message });
  }
};

module.exports = { registerUser, loginUser };