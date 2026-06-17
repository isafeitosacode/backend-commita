// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Verifica se o token foi enviado nos Headers (padrão Bearer)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // O header vem assim: "Bearer dkjh12389y12...". O split pega só o token.
      token = req.headers.authorization.split(' ')[1];

      // Decodifica e verifica se o token é válido com o nosso segredo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Busca o usuário no banco de dados pelo ID contido no token
      // O .select('-senha') garante que a senha não seja retornada por segurança
      req.user = await User.findById(decoded.id).select('-senha');

      // Tudo certo! Passa a bola para o próximo controlador (ex: createPost)
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Não autorizado, token inválido ou expirado' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, nenhum token encontrado' });
  }
};

module.exports = { protect };