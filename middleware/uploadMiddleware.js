// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // pasta onde os arquivos ficam salvos
    },
    filename: (req, file, cb) => {
        // Nome único: timestamp + nome original
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, unique + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Aceita imagens, vídeos e arquivos de código
    const allowed = /jpeg|jpg|png|gif|mp4|webm|pdf|txt|js|ts|py|html|css|json/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // máximo 20MB
});

module.exports = upload;