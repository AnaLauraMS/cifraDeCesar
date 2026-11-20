# 🏴‍☠️ Poneglyph Cipher & Security Hub

> Trabalho Prático de **Segurança no Desenvolvimento de Aplicações (5º Semestre - FATEC)**.  
> Uma aplicação full-stack conteinerizada inspirada no universo de *One Piece*, implementando a **Cifra de César**, autenticação stateless com **JWT**, persistência relacional com **MySQL** e uma **trava de segurança de uso único (Single-Use Hash)** contra ataques de repetição.

---

## 🧭 Sobre o Projeto

O **Poneglyph Cipher** simula a escrita e a leitura de mensagens secretas (Poneglyphs) através da **Cifra de César**, com suporte a deslocamentos positivos e negativos sobre um alfabeto alfanumérico estendido (`a-z`, `0-9`).

Para garantir os pilares da Segurança da Informação, o sistema conta com:
- **Autenticação & Integridade:** Tokens JWT assinados com algoritmo `HMAC-256`.
- **Criptografia de Senhas:** Senhas de tripulantes armazenadas com hash `BCrypt`.
- **Trava de Uso Único (Log Pose):** Cada mensagem cifrada gera uma chave privada única (UUID) persistida no banco com status `used = false`. Ao ser descriptografada com sucesso, a chave é consumida (`used = true`), impedindo leituras repetidas ou ataques de replay.
- **Isolamento de Telas:** As telas de Cifrar e Decodificar permanecem bloqueadas até que o usuário realize o login.

---

## ⚙️ Tecnologias Utilizadas

* **Backend:** Java 21, Spring Boot 3, Spring Security 6, Spring Data JPA, Hibernate, Auth0 Java JWT.
* **Frontend:** React 19, Vite, React Router DOM, Axios, CSS Moderno Temático (*Dark/Pirate Theme*).
* **Banco de Dados:** MySQL 8.0.
* **DevOps:** Docker e Docker Compose (Multi-container monorepo).

---

## 🏛️ Arquitetura do Sistema

```text
cifra_de_cesar/
├── back/poneglyph-api/        # API REST em Spring Boot (Porta 8080)
├── front/frontend/            # Interface SPA React + Vite (Porta 5173)
├── docker-compose.yml         # Orquestrador dos 3 containers (DB, Backend, Frontend)
├── .env.example               # Modelo das variáveis de ambiente
└── README.md                  # Documentação completa
```

---

## 🚀 Como Clonar e Rodar o Projeto

Para executar a aplicação completa na sua máquina de forma 100% automatizada, você só precisa ter o **Docker** e o **Docker Compose** instalados (por exemplo, via [Docker Desktop](https://www.docker.com/products/docker-desktop/)).

O projeto foi configurado com **Zero-Config Run**: todos os parâmetros de banco de dados e chave JWT já possuem valores padrão no `docker-compose.yml`, permitindo rodar imediatamente sem necessidade de configurações manuais.

---

### Opção A: Via Terminal / Git CLI (Recomendado para desenvolvedores)

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/AnaLauraMS/cifra_de_cesar.git
   ```

2. **Acesse a pasta do projeto:**
   ```bash
   cd cifra_de_cesar
   ```

3. **(Opcional) Configurar variáveis de ambiente:**
   Se desejar customizar credenciais, crie um arquivo `.env` na raiz baseado no `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *(Caso não crie o `.env`, o Docker usará automaticamente as credenciais padrão já definidas no `docker-compose.yml`).*

4. **Suba todos os serviços com o Docker Compose:**
   ```bash
   docker compose up --build -d
   ```
   *(ou `docker-compose up --build -d`)*

---

### Opção B: Via GitHub Desktop (Ideal para notebooks e apresentações rápidas)

1. Abra o **GitHub Desktop**.
2. Vá no menu **File > Clone Repository...** (ou atalho `Ctrl + Shift + O`).
3. Selecione o repositório `AnaLauraMS/cifra_de_cesar` ou cole a URL:
   ```text
   https://github.com/AnaLauraMS/cifra_de_cesar.git
   ```
4. Escolha a pasta de destino local e clique em **Clone**.
5. No próprio **GitHub Desktop**, com o repositório selecionado, clique em:
   * **Repository > Open in Command Prompt** (ou **Open in PowerShell** / atalho `Ctrl + ` `).
6. Certifique-se de que o **Docker Desktop** esteja aberto e execute no terminal:
   ```bash
   docker compose up --build
   ```

> ⏳ **Nota:** Na primeira vez em que os containers forem construídos, o Docker fará o download da imagem do MySQL, compilará o backend com Maven e montará o pacote do frontend Vite. Esse processo leva cerca de 2 a 3 minutos.

---

## 🌐 Acessando a Aplicação

Assim que os containers estiverem em execução, acesse os serviços nos seguintes endereços:

| Serviço | Endereço | Descrição | Credenciais Padrão |
|---|---|---|---|
| 🏴‍☠️ **Frontend** | [http://localhost:5173](http://localhost:5173) | Interface Web Temática One Piece | Cadastre seu usuário na aba 1 |
| ⚙️ **Backend** | [http://localhost:8080](http://localhost:8080) | API REST Spring Boot + JWT | Autenticação via Bearer Token |
| 🗄️ **Banco MySQL** | `localhost:3306` | Banco de dados `cifra_db` | Usuário: `root` \| Senha: `root` |

---

## 🔒 Regras de Negócio e Segurança

1. **Gestão de Tripulantes (Cadastro e Login):**
   * Registro com hashing de senha via **BCrypt**.
   * Autenticação via **Spring Security** emitindo **Token JWT (HMAC-256)** com validade de 2 horas.
   * Controle de rotas protegidas: enquanto o usuário não faz login, as abas de Cifrar e Decodificar ficam totalmente inacessíveis.

2. **Cifra de César com Poneglyphs:**
   * Suporta deslocamentos numéricos positivos e negativos sobre o alfabeto alfanumérico estendido (`a-z`, `0-9`).
   * Mantém caracteres especiais e pontuações preservados.

3. **Trava de Segurança de Uso Único (Anti-Replay):**
   * Toda mensagem cifrada gera um **Log Pose (Hash UUID)** persistido no banco com `used = false`.
   * A decodificação só é autorizada se o Hash existir e ainda não tiver sido consumido.
   * Ao decodificar com sucesso, o sistema imediatamente atualiza para `used = true`, bloqueando qualquer tentativa futura de descriptografia com aquela mesma chave.

---

## 🎬 Roteiro de Demonstração / Apresentação

Para validar todos os critérios solicitados na avaliação:

1. **Cadastrar Tripulante:** Acesse a aplicação na rota inicial `1. Cadastrar` e crie um novo usuário (ex: `luffy`, senha `onepiece`).
2. **Login com JWT:** Faça login na aba `2. Login`. Ao autenticar, o menu se transforma e desbloqueia as abas internas `3. Cifrar` e `4. Decodificar`, exibindo seu nome no topo.
3. **Cifrar Mensagem:** Na aba `3. Cifrar`, insira um texto e um deslocamento (ex: `3`). Clique em **Cifrar Mensagem**. Use os botões para copiar o Hash e o Texto Cifrado gerados.
4. **Decodificar Manualmente:** Vá para a aba `4. Decodificar`. Cole o texto cifrado e o Hash nos campos e clique em **Decodificar**. A mensagem original será revelada em texto claro.
5. **Comprovar a Trava de Uso Único:** Clique novamente no botão **Decodificar** com os mesmos dados. O sistema rejeitará a transação e exibirá o erro:
   > 🛑 **"Hash já utilizado! O Log Pose foi quebrado."**
6. **Desembarque (Logout Seguro):** Clique em **🚪 Desembarcar (Logout)** no topo. A sessão é destruída, a memória é limpa e a tela volta para o Login deslogado.

---

## 🛑 Comandos Úteis

* **Parar os containers:**
  ```bash
  docker compose down
  ```

* **Parar e remover os dados persistidos do banco:**
  ```bash
  docker compose down -v
  ```

* **Verificar logs em tempo real:**
  ```bash
  docker compose logs -f
  ```

---

## 👩‍💻 Autoria

Desenvolvido por **Ana Laura Martins Souto (AnaLauraMS)**  
*Faculdade de Tecnologia (FATEC) — 5º Semestre: Segurança no Desenvolvimento de Aplicações*
