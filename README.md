# 🎮 TEA - Jogo Educacional de Alfabetização

Jogo web interativo para auxiliar no processo de alfabetização de crianças com atividades gamificadas de letras, números, cores e animais.

## ✨ Funcionalidades

- **4 Tipos de Jogos**
  - 🔤 Alfabeto - Aprenda as letras
  - 🔢 Números - Domine os números
  - 🎨 Cores - Identifique cores
  - 🐾 Animais - Conheça os animais

- **Sistema de Pontuação** - Ganhe pontos a cada acerto
- **Placar Online** - Compare suas pontuações com outros jogadores
- **Feedback Interativo** - Respostas visuais e auditivas
- **Interface Amigável** - Design pensado para crianças

## 🚀 Como Jogar

### Online

Acesse o jogo diretamente pelo navegador (se hospedado).

### Localmente

```bash
git clone https://github.com/sourcenaiomiocc-creator/Tea.git
cd Tea
```

Abra `index.html` no navegador ou use um servidor local:

```bash
python -m http.server 8000
# Acesse http://localhost:8000
```

## 🔧 Configuração (Firebase)

Para habilitar o placar online, configure o Firebase:

1. Crie um projeto em [Firebase Console](https://console.firebase.google.com/)
2. Ative Firestore Database
3. Copie `.env.example` para `.env` e preencha:

```env
FIREBASE_API_KEY=sua-chave-api
FIREBASE_PROJECT_ID=seu-projeto
# ...
```

4. Implante as regras de segurança:

```bash
firebase deploy --only firestore:rules
```

## 🔐 Melhorias de Segurança

- ✅ **Validação de Input** - Sanitização de nomes de jogadores
- ✅ **Rate Limiting** - Prevenção de spam de pontuações
- ✅ **Firebase Rules** - Validação server-side de dados
- ✅ **XSS Protection** - Escape de HTML em inputs
- ✅ **Credenciais Seguras** - Variáveis de ambiente

## 🎯 Como Jogar

1. Digite seu nome
2. Escolha um tipo de jogo
3. Responda as perguntas
4. Ganhe pontos a cada acerto!
5. Veja seu ranking no placar

## 📁 Arquivos Principais

```
Tea/
├── index.html          # Interface do jogo
├── game.js             # Lógica principal do jogo
├── data.js             # Dados dos jogos (questões)
├── firebase-config.js  # Configuração segura Firebase (NEW!)
├── styles.css          # Estilos visuais
├── firestore.rules     # Regras de segurança (UPDATED!)
├── .env.example        # Template de configuração
└── README.md           # Este arquivo
```

## 🛠️ Tecnologias

- **HTML5/CSS3** - Interface responsiva
- **JavaScript** - Lógica do jogo
- **Firebase Firestore** - Banco de dados do placar

## 🎨 Personalização

### Adicionar Novos Jogos

Edite `data.js` e adicione novos objetos ao `GAME_DATA`:

```javascript
GAME_DATA.frutas = {
    name: 'Frutas',
    emoji: '🍎',
    questions: [
        { question: 'Qual é vermelha?', options: ['Maçã', 'Banana'], correct: 0 }
    ]
};
```

## 📝 Licença

MIT License

## 🤝 Contribuindo

Pull requests são bem-vindos! Abra uma issue primeiro para discutir mudanças maiores.

---

Desenvolvido com ❤️ para tornar a alfabetização divertida! 🎮✨
