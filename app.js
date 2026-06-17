// server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const cors = require('cors');

// Importação das rotas
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const forumRoutes = require('./routes/forumRoutes');
const userRoutes = require('./routes/userRoutes');  

dotenv.config();

// Conecta ao banco de dados
connectDB();

const app = express();
app.use(cors({
    origin: [
        'https://frontene-commita.vercel.app',
        'http://localhost:5500',
        'http://127.0.0.1:5500'
    ],
    credentials: true
})); 
app.use(express.json());

// Definição dos caminhos principais
// Adicione após as suas outras configurações
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));