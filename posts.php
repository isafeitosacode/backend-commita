<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

initializeDatabase();
$db = getDB();
$action = $_GET['action'] ?? $_POST['action'] ?? '';

// ========================================
// CRIAR POST
// ========================================
if ($action === 'criar' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    verificarAutenticacao();
    
    $conteudo = $_POST['conteudo'] ?? '';
    
    if (empty($conteudo)) {
        http_response_code(400);
        die(json_encode(['erro' => 'O conteúdo do post é obrigatório.']));
    }
    
    try {
        $stmt = $db->prepare("
            INSERT INTO posts (usuario_id, conteudo)
            VALUES (?, ?)
        ");
        
        $stmt->execute([$_SESSION['usuario_id'], $conteudo]);
        $postId = $db->lastInsertId();
        
        echo json_encode([
            'sucesso' => true,
            'mensagem' => 'Post criado com sucesso!',
            'post_id' => $postId
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(['erro' => 'Erro ao criar post: ' . $e->getMessage()]));
    }
}

// ========================================
// LISTAR POSTS (FEED)
// ========================================
else if ($action === 'listar' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $db->prepare("
            SELECT 
                p.id,
                p.conteudo,
                p.criado_em,
                u.id as usuario_id,
                u.nome as usuario_nome,
                u.usuario as usuario_username,
                (SELECT COUNT(*) FROM comentarios WHERE post_id = p.id) as total_comentarios
            FROM posts p
            JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.criado_em DESC
            LIMIT 50
        ");
        
        $stmt->execute();
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Buscar comentários para cada post
        foreach ($posts as &$post) {
            $stmtComentarios = $db->prepare("
                SELECT 
                    c.id,
                    c.conteudo,
                    c.criado_em,
                    u.nome as usuario_nome,
                    u.usuario as usuario_username,
                    c.usuario_id
                FROM comentarios c
                JOIN usuarios u ON c.usuario_id = u.id
                WHERE c.post_id = ?
                ORDER BY c.criado_em ASC
            ");
            
            $stmtComentarios->execute([$post['id']]);
            $post['comentarios'] = $stmtComentarios->fetchAll(PDO::FETCH_ASSOC);
            
            // Adicionar informação se o post pertence ao usuário logado
            if (isset($_SESSION['usuario_id'])) {
                $post['eh_meu_post'] = ($post['usuario_id'] == $_SESSION['usuario_id']);
            } else {
                $post['eh_meu_post'] = false;
            }
        }
        
        echo json_encode(['sucesso' => true, 'posts' => $posts]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(['erro' => 'Erro ao buscar posts: ' . $e->getMessage()]));
    }
}

// ========================================
// DELETAR POST
// ========================================
else if ($action === 'deletar' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    verificarAutenticacao();
    
    parse_str(file_get_contents("php://input"), $deleteData);
    $postId = $deleteData['post_id'] ?? '';
    
    if (empty($postId)) {
        http_response_code(400);
        die(json_encode(['erro' => 'ID do post é obrigatório.']));
    }
    
    try {
        // Verificar se o post pertence ao usuário
        $stmt = $db->prepare("SELECT usuario_id FROM posts WHERE id = ?");
        $stmt->execute([$postId]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$post) {
            http_response_code(404);
            die(json_encode(['erro' => 'Post não encontrado.']));
        }
        
        if ($post['usuario_id'] != $_SESSION['usuario_id']) {
            http_response_code(403);
            die(json_encode(['erro' => 'Você não pode deletar um post que não é seu.']));
        }
        
        // Deletar post (comentários são deletados automaticamente pela FK)
        $stmt = $db->prepare("DELETE FROM posts WHERE id = ?");
        $stmt->execute([$postId]);
        
        echo json_encode(['sucesso' => true, 'mensagem' => 'Post deletado com sucesso!']);
        
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(['erro' => 'Erro ao deletar post: ' . $e->getMessage()]));
    }
}

// ========================================
// ADICIONAR COMENTÁRIO
// ========================================
else if ($action === 'comentar' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    verificarAutenticacao();
    
    $postId = $_POST['post_id'] ?? '';
    $conteudo = $_POST['conteudo'] ?? '';
    
    if (empty($postId) || empty($conteudo)) {
        http_response_code(400);
        die(json_encode(['erro' => 'Post ID e conteúdo são obrigatórios.']));
    }
    
    try {
        // Verificar se o post existe
        $stmt = $db->prepare("SELECT id FROM posts WHERE id = ?");
        $stmt->execute([$postId]);
        
        if (!$stmt->fetch()) {
            http_response_code(404);
            die(json_encode(['erro' => 'Post não encontrado.']));
        }
        
        // Inserir comentário
        $stmt = $db->prepare("
            INSERT INTO comentarios (post_id, usuario_id, conteudo)
            VALUES (?, ?, ?)
        ");
        
        $stmt->execute([$postId, $_SESSION['usuario_id'], $conteudo]);
        $comentarioId = $db->lastInsertId();
        
        echo json_encode([
            'sucesso' => true,
            'mensagem' => 'Comentário adicionado com sucesso!',
            'comentario_id' => $comentarioId
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(['erro' => 'Erro ao adicionar comentário: ' . $e->getMessage()]));
    }
}

else {
    http_response_code(400);
    die(json_encode(['erro' => 'Ação não reconhecida ou método inválido.']));
}
?>
