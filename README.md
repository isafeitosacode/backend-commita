# Backend do Projeto Commita

## Descrição
Backend em PHP com banco de dados SQLite para gerenciar autenticação, posts e comentários.

## Estrutura

### Arquivos
- `config.php` - Configuração do banco de dados e funções auxiliares
- `auth.php` - Endpoints de autenticação (login, cadastro, logout)
- `posts.php` - Endpoints de posts e comentários (criar, listar, deletar, comentar)
- `index.php` - Documentação das APIs
- `database.db` - Banco de dados SQLite (criado automaticamente)

## APIs Disponíveis

### Autenticação (`auth.php`)

#### 1. Cadastro
```
POST /auth.php
Parâmetros:
- action: "cadastro"
- nome: string
- usuario: string (único)
- email: string (único)
- telefone: string
- senha: string (mínimo 8 caracteres)
- confirmarSenha: string

Resposta:
{
  "sucesso": true,
  "mensagem": "Cadastro realizado com sucesso!"
}
```

#### 2. Login
```
POST /auth.php
Parâmetros:
- action: "login"
- usuario: string (usuário ou email)
- senha: string

Resposta:
{
  "sucesso": true,
  "mensagem": "Login realizado com sucesso!",
  "usuario": {
    "id": integer,
    "nome": string,
    "usuario": string
  }
}
```

#### 3. Logout
```
POST /auth.php
Parâmetros:
- action: "logout"

Resposta:
{
  "sucesso": true,
  "mensagem": "Logout realizado com sucesso!"
}
```

#### 4. Verificar Sessão
```
POST /auth.php
Parâmetros:
- action: "verificar"

Resposta:
{
  "logado": true/false,
  "usuario": {...} // se logado
}
```

### Posts (`posts.php`)

#### 1. Criar Post
```
POST /posts.php?action=criar
Requer autenticação
Parâmetros:
- conteudo: string

Resposta:
{
  "sucesso": true,
  "mensagem": "Post criado com sucesso!",
  "post_id": integer
}
```

#### 2. Listar Posts (Feed)
```
GET /posts.php?action=listar
Resposta:
{
  "sucesso": true,
  "posts": [
    {
      "id": integer,
      "conteudo": string,
      "criado_em": timestamp,
      "usuario_id": integer,
      "usuario_nome": string,
      "usuario_username": string,
      "eh_meu_post": boolean,
      "total_comentarios": integer,
      "comentarios": [
        {
          "id": integer,
          "conteudo": string,
          "criado_em": timestamp,
          "usuario_nome": string,
          "usuario_username": string,
          "usuario_id": integer
        }
      ]
    }
  ]
}
```

#### 3. Deletar Post
```
DELETE /posts.php?action=deletar
Requer autenticação
Parâmetros:
- post_id: integer

Resposta:
{
  "sucesso": true,
  "mensagem": "Post deletado com sucesso!"
}
```

#### 4. Adicionar Comentário
```
POST /posts.php?action=comentar
Requer autenticação
Parâmetros:
- post_id: integer
- conteudo: string

Resposta:
{
  "sucesso": true,
  "mensagem": "Comentário adicionado com sucesso!",
  "comentario_id": integer
}
```

## Banco de Dados

### Tabelas

#### usuarios
- `id` (INTEGER, PK)
- `nome` (TEXT, NOT NULL)
- `usuario` (TEXT, UNIQUE, NOT NULL)
- `email` (TEXT, UNIQUE, NOT NULL)
- `telefone` (TEXT)
- `senha` (TEXT, NOT NULL)
- `criado_em` (TIMESTAMP)

#### posts
- `id` (INTEGER, PK)
- `usuario_id` (INTEGER, FK)
- `conteudo` (TEXT, NOT NULL)
- `criado_em` (TIMESTAMP)

#### comentarios
- `id` (INTEGER, PK)
- `post_id` (INTEGER, FK)
- `usuario_id` (INTEGER, FK)
- `conteudo` (TEXT, NOT NULL)
- `criado_em` (TIMESTAMP)

## Instalação

1. Certifique-se de ter PHP 7.4+ instalado
2. Coloque os arquivos em um servidor web (Apache/Nginx com suporte a PHP)
3. O banco de dados SQLite será criado automaticamente na primeira requisição

## Uso no Frontend

Exemplos de requisições AJAX/Fetch:

### Cadastro
```javascript
const formData = new FormData();
formData.append('action', 'cadastro');
formData.append('nome', 'João Silva');
formData.append('usuario', 'joao_silva');
formData.append('email', 'joao@example.com');
formData.append('telefone', '11999999999');
formData.append('senha', 'senha123');
formData.append('confirmarSenha', 'senha123');

fetch('/Backend/auth.php', {
  method: 'POST',
  body: formData
})
.then(r => r.json())
.then(data => console.log(data));
```

### Login
```javascript
const formData = new FormData();
formData.append('action', 'login');
formData.append('usuario', 'joao_silva');
formData.append('senha', 'senha123');

fetch('/Backend/auth.php', {
  method: 'POST',
  body: formData,
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log(data));
```

### Listar Posts
```javascript
fetch('/Backend/posts.php?action=listar')
  .then(r => r.json())
  .then(data => console.log(data));
```

### Criar Post
```javascript
const formData = new FormData();
formData.append('action', 'criar');
formData.append('conteudo', 'Meu primeiro post!');

fetch('/Backend/posts.php', {
  method: 'POST',
  body: formData,
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log(data));
```

### Comentar
```javascript
const formData = new FormData();
formData.append('action', 'comentar');
formData.append('post_id', 1);
formData.append('conteudo', 'Que post legal!');

fetch('/Backend/posts.php', {
  method: 'POST',
  body: formData,
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log(data));
```

### Deletar Post
```javascript
const formData = new FormData();
formData.append('post_id', 1);

fetch('/Backend/posts.php?action=deletar', {
  method: 'DELETE',
  body: new URLSearchParams(formData),
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log(data));
```

## Segurança

- Senhas são criptografadas com `password_hash()` (bcrypt)
- Validação de entrada em todos os endpoints
- Verificação de autenticação para ações sensíveis
- Proteção contra SQL Injection com prepared statements
- Validação de email com `filter_var()`
- Foreign Keys configuradas para integridade referencial

## Notas

- O banco de dados usa SQLite, não requer servidor MySQL/PostgreSQL
- As sessões são gerenciadas com `$_SESSION` (padrão PHP)
- CORS habilitado para requisições de outros domínios
- Todas as respostas são em JSON
