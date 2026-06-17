<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

// Inicializar banco de dados
initializeDatabase();

$db = getDB();
$action = $_POST['action'] ?? '';

// ========================================
// CADASTRO
// ========================================
if ($action === 'cadastro') {
    $nome = $_POST['nome'] ?? '';
    $usuario = $_POST['usuario'] ?? '';
    $email = $_POST['email'] ?? '';
    $telefone = $_POST['telefone'] ?? '';
    $senha = $_POST['senha'] ?? '';
    $confirmarSenha = $_POST['confirmarSenha'] ?? '';
    
    // Validações
    if (empty($nome) || empty($usuario) || empty($email) || empty($telefone) || empty($senha)) {
        http_response_code(400);
        die(json_encode(['erro' => 'Preencha todos os campos obrigatórios.']));
    }
    
    if ($senha !== $confirmarSenha) {
        http_response_code(400);
        die(json_encode(['erro' => 'As senhas não coincidem.']));
    }
    
    if (strlen($senha) < 8) {
        http_response_code(400);
        die(json_encode(['erro' => 'A senha deve ter no mínimo 8 caracteres.']));
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        die(json_encode(['erro' => 'E-mail inválido.']));
    }
    
    try {
        // Verificar se usuário ou email já existem
        $stmt = $db->prepare("SELECT id FROM usuarios WHERE usuario = ? OR email = ?");
        $stmt->execute([$usuario, $email]);
        
        if ($stmt->fetch()) {
            http_response_code(409);
            die(json_encode(['erro' => 'Usuário ou e-mail já cadastrado.']));
        }
        
        // Criptografar senha
        $senhaCriptografada = password_hash($senha, PASSWORD_DEFAULT);
        
        // Inserir usuário
        $stmt = $db->prepare("
            INSERT INTO usuarios (nome, usuario, email, telefone, senha)
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([$nome, $usuario, $email, $telefone, $senhaCriptografada]);
        
        echo json_encode(['sucesso' => true, 'mensagem' => 'Cadastro realizado com sucesso!']);
        
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(['erro' => 'Erro ao cadastrar: ' . $e->getMessage()]));
    }
}

// ========================================
// LOGIN
// ========================================
else if ($action === 'login') {
    $usuario = $_POST['usuario'] ?? '';
    $senha = $_POST['senha'] ?? '';
    
    if (empty($usuario) || empty($senha)) {
        http_response_code(400);
        die(json_encode(['erro' => 'Usuário e senha são obrigatórios.']));
    }
    
    try {
        $stmt = $db->prepare("SELECT id, nome, usuario, senha FROM usuarios WHERE usuario = ? OR email = ?");
        $stmt->execute([$usuario, $usuario]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || !password_verify($senha, $user['senha'])) {
            http_response_code(401);
            die(json_encode(['erro' => 'Usuário ou senha incorretos.']));
        }
        
        // Definir sessão
        $_SESSION['usuario_id'] = $user['id'];
        $_SESSION['usuario_nome'] = $user['nome'];
        $_SESSION['usuario_username'] = $user['usuario'];
        
        echo json_encode([
            'sucesso' => true,
            'mensagem' => 'Login realizado com sucesso!',
            'usuario' => [
                'id' => $user['id'],
                'nome' => $user['nome'],
                'usuario' => $user['usuario']
            ]
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(['erro' => 'Erro ao fazer login: ' . $e->getMessage()]));
    }
}

// ========================================
// LOGOUT
// ========================================
else if ($action === 'logout') {
    session_destroy();
    echo json_encode(['sucesso' => true, 'mensagem' => 'Logout realizado com sucesso!']);
}

// ========================================
// VERIFICAR SESSÃO
// ========================================
else if ($action === 'verificar') {
    if (isset($_SESSION['usuario_id'])) {
        echo json_encode([
            'logado' => true,
            'usuario' => [
                'id' => $_SESSION['usuario_id'],
                'nome' => $_SESSION['usuario_nome'],
                'usuario' => $_SESSION['usuario_username']
            ]
        ]);
    } else {
        echo json_encode(['logado' => false]);
    }
}

else {
    http_response_code(400);
    die(json_encode(['erro' => 'Ação não reconhecida.']));
}
?>
