<?php
// Arquivo principal - redirecionar e documentar as APIs

header('Content-Type: application/json; charset=utf-8');

$endpoints = [
    'auth' => [
        'cadastro' => [
            'url' => '/auth.php',
            'metodo' => 'POST',
            'parametros' => [
                'action' => 'cadastro',
                'nome' => 'string',
                'usuario' => 'string',
                'email' => 'string',
                'telefone' => 'string',
                'senha' => 'string',
                'confirmarSenha' => 'string'
            ]
        ],
        'login' => [
            'url' => '/auth.php',
            'metodo' => 'POST',
            'parametros' => [
                'action' => 'login',
                'usuario' => 'string (usuário ou email)',
                'senha' => 'string'
            ]
        ],
        'logout' => [
            'url' => '/auth.php',
            'metodo' => 'POST',
            'parametros' => [
                'action' => 'logout'
            ]
        ],
        'verificar' => [
            'url' => '/auth.php',
            'metodo' => 'POST',
            'parametros' => [
                'action' => 'verificar'
            ]
        ]
    ],
    'posts' => [
        'criar' => [
            'url' => '/posts.php?action=criar',
            'metodo' => 'POST',
            'requer_autenticacao' => true,
            'parametros' => [
                'conteudo' => 'string'
            ]
        ],
        'listar' => [
            'url' => '/posts.php?action=listar',
            'metodo' => 'GET'
        ],
        'deletar' => [
            'url' => '/posts.php?action=deletar',
            'metodo' => 'DELETE',
            'requer_autenticacao' => true,
            'parametros' => [
                'post_id' => 'integer'
            ]
        ],
        'comentar' => [
            'url' => '/posts.php?action=comentar',
            'metodo' => 'POST',
            'requer_autenticacao' => true,
            'parametros' => [
                'post_id' => 'integer',
                'conteudo' => 'string'
            ]
        ]
    ]
];

echo json_encode($endpoints, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
