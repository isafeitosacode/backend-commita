<?php
// Configuração do banco de dados SQLite
define('DB_PATH', __DIR__ . '/database.db');

// Função para conectar ao banco de dados
function getDB() {
    try {
        $db = new PDO('sqlite:' . DB_PATH);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $db;
    } catch (PDOException $e) {
        die(json_encode(['erro' => 'Erro ao conectar ao banco: ' . $e->getMessage()]));
    }
}

// Inicializar o banco de dados
function initializeDatabase() {
    $db = getDB();
    
    // Tabela de usuários
    $db->exec("
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            usuario TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            telefone TEXT,
            senha TEXT NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    // Tabela de posts
    $db->exec("
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            conteudo TEXT NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
    ");
    
    // Tabela de comentários
    $db->exec("
        CREATE TABLE IF NOT EXISTS comentarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            usuario_id INTEGER NOT NULL,
            conteudo TEXT NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
    ");
    
    return $db;
}

// Verificar se o usuário está logado
function verificarAutenticacao() {
    if (!isset($_SESSION['usuario_id'])) {
        http_response_code(401);
        die(json_encode(['erro' => 'Não autorizado. Faça login primeiro.']));
    }
}
?>
