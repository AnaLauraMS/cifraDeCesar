# 🏴‍☠️ Poneglyph Cipher & Security Hub

> Uma aplicação full-stack de nível de portfólio inspirada no universo de *One Piece*, desenvolvida para demonstrar segurança em aplicações web com autenticação JWT, controle de acesso e criptografia com trava de uso único.

---

## 🧭 Sobre o Projeto
O **Poneglyph Cipher** simula o decodificar de mensagens secretas (Poneglyphs) utilizando o algoritmo clássico da **Cifra de César**, aliado a padrões modernos de arquitetura de software e segurança da informação. O sistema garante que cada mensagem cifrada possua um identificador único (**Log Pose / Hash**) e uma **trava de uso único**, impedindo ataques de replay ou re-leitura não autorizada.

---

## ⚙️ Tecnologias Utilizadas

### **Backend**
- **Java 21** & **Spring Boot**
- **Spring Security** (Autenticação e Autorização baseada em tokens JWT)
- **Spring Data JPA** & **Hibernate**
- **MySQL 8.0** (Persistência de dados e controle de hashes utilizados)

### **Frontend**
- **React** com **Vite**
- **Axios** (Comunicação HTTP com interceptação de tokens)
- **CSS Moderno** (Interface temática e responsiva dividida em painéis/abas)

### **DevOps & Infraestrutura**
- **Docker** & **Docker Compose** (Orquestração de múltiplos containers: Banco de dados, API e Frontend)
- **Variáveis de Ambiente (`.env`)** para isolamento de credenciais e boas práticas de segurança.

---

## 🏛️ Arquitetura do Sistema
O projeto está estruturado em um formato de **Monorepo** conteinerizado, onde cada camada roda de forma isolada e se comunica através de uma rede interna do Docker (`poneglyph-net`):

```text
cifra_de_cesar/
├── back/poneglyph-api/        # API Rest em Spring Boot
├── front/frontend/            # Interface SPA em React + Vite
├── docker-compose.yml         # Orquestração dos serviços (DB, Backend, Frontend)
└── .env                       # Configurações de ambiente sensíveis (Ignorado pelo Git)

🚀 Como Clonar e Rodar o Projeto

Para rodar a aplicação inteira na sua máquina de forma automatizada, você só precisará ter o Docker e o Docker Compose instalados.

    Clone o repositório:
    Bash

    git clone https://github.com/AnaLauraMS/cifra_de_cesar.git
    cd cifra_de_cesar

    Crie o arquivo .env na raiz do projeto:
    Crie um arquivo chamado .env e defina as variáveis de ambiente para o banco de dados:
    Snippet de código

    DB_NAME=cifra_db
    DB_ROOT_PASSWORD=sua_senha_segura

    Suba os containers com o Docker Compose:
    Bash

    docker-compose up --build -d

    Acesse a aplicação:

        Frontend (Interface Web): http://localhost:5173

        Backend (API Spring Boot): http://localhost:8080

        Banco de Dados MySQL: localhost:3306

🔒 Funcionalidades e Regras de Segurança

    Gestão de Tripulantes (Cadastro e Login):

        Registro seguro de usuários com criptografia de senhas.

        Autenticação via Spring Security + JWT, gerando um token de acesso para rotas protegidas.

    Cifra de César com Poneglyphs:

        O usuário define uma mensagem e um deslocamento (step).

        O sistema retorna o texto cifrado e gera um Log Pose (Hash único) registrado no banco de dados.

    Trava de Segurança de Uso Único:

        Ao tentar descriptografar a mensagem utilizando o Log Pose, o sistema valida a transação. Caso o hash já tenha sido consumido anteriormente, a API bloqueia a requisição, garantindo integridade e rastreabilidade.
```
👩‍💻 Desenvolvido por

Ana Laura Martins Souto (AnaLauraMS)
