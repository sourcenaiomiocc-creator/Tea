document.addEventListener('DOMContentLoaded', () => {
    const gameState = {
        playerName: '',
        score: 0,
        currentGame: null,
        currentWord: [],
        correctWord: '',
        correctSyllables: [],
        lastSavedScore: 0,
        correctAnswers: 0,
    };

    // Efeitos Sonoros
    let soundsEnabled = false;
    let sounds = {};

    if (typeof jsfxr !== 'undefined') {
        soundsEnabled = true;
        sounds = {
            correct: jsfxr.sfxr_to_string([0,0.24,0.4,0.182,0.424,0.732,,0.2,-0.26,0.14,,,,0.31,,,,,0.84,,,0.44,,0.25]),
            incorrect: jsfxr.sfxr_to_string([2,,0.21,0.52,0.25,0.088,,,,,,,,,,,0.79,,,,,1,,,0.4,,-0.02]),
            click: jsfxr.sfxr_to_string([0,,0.08,0.22,0.18,0.52,,,,,,,,,,0.32,0.01,-0.36,0.3,,,-0.04,1,,,,,,0.5])
        };
    }

    function playSound(sound) {
        if (!soundsEnabled) return;
        const audio = new Audio();
        audio.src = sound;
        audio.play();
    }

    // Elementos do DOM
    const nameScreen = document.getElementById('name-screen');
    const playerNameInput = document.getElementById('player-name-input');
    const startButton = document.getElementById('start-button');
    const scoreElement = document.getElementById('score');
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const leaderboardScreen = document.getElementById('leaderboard-screen');
    const questionTitle = document.getElementById('question-title');
    const questionContent = document.getElementById('question-content');
    const optionsArea = document.getElementById('options-area');
    const feedbackArea = document.getElementById('feedback-area');
    const menuButtons = document.querySelectorAll('.menu .menu-button');
    const backButton = document.getElementById('back-to-menu');
    const leaderboardButton = document.getElementById('leaderboard-button');
    const backToMenuFromLeaderboardButton = document.getElementById('back-to-menu-from-leaderboard');
    const leaderboardList = document.getElementById('leaderboard-list');

    function init() {
        // Event delegation for option buttons (prevents memory leaks)
        optionsArea.addEventListener('click', (e) => {
            if (e.target.classList.contains('option-button')) {
                playSound(sounds.click);
                handleOptionClick(e.target);
            }
        });

        // Salvar antes de fechar o navegador
        window.addEventListener('beforeunload', () => {
            if (gameState.score > gameState.lastSavedScore && typeof firebaseService !== 'undefined') {
                // Usa sendBeacon para garantir que a requisição seja enviada mesmo fechando a página
                const data = {
                    playerName: gameState.playerName,
                    score: gameState.score,
                    game: gameState.currentGame,
                    timestamp: new Date()
                };
                // Fallback: tenta salvar sincronamente
                firebaseService.saveScore(gameState.playerName, gameState.score, gameState.currentGame);
            }
        });

        // Lógica da tela de nome
        startButton.addEventListener('click', () => {
            const name = playerNameInput.value.trim();
            if (name.length > 0) {
                playSound(sounds.click);
                gameState.playerName = name;
                nameScreen.classList.remove('active');
                menuScreen.classList.add('active');
            } else {
                playerNameInput.style.borderColor = 'var(--secondary-color)';
                setTimeout(() => {
                    playerNameInput.style.borderColor = 'var(--primary-color)';
                }, 500);
            }
        });

        // Permitir Enter para enviar o nome
        playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                startButton.click();
            }
        });

        menuButtons.forEach(button => {
            button.addEventListener('click', () => {
                playSound(sounds.click);
                gameState.currentGame = button.dataset.game;
                startGame(gameState.currentGame);
            });
        });

        leaderboardButton.addEventListener('click', () => {
            playSound(sounds.click);
            showLeaderboard();
        });

        backButton.addEventListener('click', () => {
            playSound(sounds.click);
            backToMenu();
        });

        backToMenuFromLeaderboardButton.addEventListener('click', () => {
            playSound(sounds.click);
            backToMenu();
        });
    }

    // Central handler for all option button clicks (event delegation)
    function handleOptionClick(button) {
        switch (gameState.currentGame) {
            case 'vowels':
                const answer = button.dataset.answer === 'true';
                checkVowelAnswer(answer, gameState.currentVowelIsVowel);
                break;
            case 'alphabet':
                checkAlphabetAnswer(button.textContent, gameState.currentCorrectAnswer);
                break;
            case 'syllables':
                checkSyllableAnswer(button.textContent, gameState.currentCorrectAnswer);
                break;
            case 'words':
                gameState.currentWord.push(button.textContent);
                button.disabled = true;
                button.style.opacity = '0.5';
                updateWordDisplay();
                if (gameState.currentWord.length === gameState.correctSyllables.length) {
                    checkWordAnswer();
                }
                break;
        }
    }

    function backToMenu() {
        // Salva pontuação ao voltar ao menu
        if (gameState.score > gameState.lastSavedScore && typeof firebaseService !== 'undefined') {
            firebaseService.saveScore(gameState.playerName, gameState.score, gameState.currentGame);
            gameState.lastSavedScore = gameState.score;
        }

        // Remove apenas as telas, mantém a pontuação acumulada
        gameScreen.classList.remove('active');
        leaderboardScreen.classList.remove('active');
        menuScreen.classList.add('active');
        questionContent.innerHTML = '';
        optionsArea.innerHTML = '';
    }

    async function showLeaderboard() {
        menuScreen.classList.remove('active');
        leaderboardScreen.classList.add('active');
        leaderboardList.innerHTML = '<div class="loading">Carregando ranking...</div>';

        if (typeof firebaseService === 'undefined') {
            leaderboardList.innerHTML = '<div class="error">Funcionalidade de ranking indisponível.</div>';
            return;
        }

        const result = await firebaseService.getLeaderboard();

        if (!result.success) {
            if (result.error === 'not_ready') {
                leaderboardList.innerHTML = '<div class="error">Conectando ao servidor... Tente novamente em instantes.</div>';
            } else {
                leaderboardList.innerHTML = '<div class="error">Erro ao carregar ranking. Verifique sua conexão.</div>';
            }
            return;
        }

        if (result.data.length === 0) {
            leaderboardList.innerHTML = '<div class="empty">Nenhuma pontuação registrada ainda. Seja o primeiro!</div>';
            return;
        }

        leaderboardList.innerHTML = result.data.map((entry, index) => `
            <div class="leaderboard-item">
                <span class="rank">${index + 1}º</span>
                <span class="player-info">
                    <span class="player-name">${entry.playerName}</span>
                    <span class="player-score">${entry.score} pts</span>
                </span>
                <span class="game">(${entry.game})</span>
            </div>
        `).join('');
    }

    function startGame(gameType) {
        // Se está trocando de jogo, salva a pontuação do jogo anterior
        if (gameState.currentGame && gameState.currentGame !== gameType && gameState.score > gameState.lastSavedScore) {
            if (typeof firebaseService !== 'undefined') {
                firebaseService.saveScore(gameState.playerName, gameState.score, gameState.currentGame);
            }
            // Reseta para o novo jogo
            gameState.score = 0;
            gameState.correctAnswers = 0;
            gameState.lastSavedScore = 0;
            scoreElement.textContent = gameState.score;
        }

        // Continuando o mesmo jogo, mantém a pontuação
        gameState.currentGame = gameType;

        menuScreen.classList.remove('active');
        gameScreen.classList.add('active');
        feedbackArea.innerHTML = '';

        switch (gameType) {
            case 'vowels':
                startVowelsGame();
                break;
            case 'alphabet':
                startAlphabetGame();
                break;
            case 'syllables':
                startSyllablesGame();
                break;
            case 'words':
                startWordsGame();
                break;
        }
    }

    function handleCorrectAnswer(points) {
        playSound(sounds.correct);
        feedbackArea.textContent = 'Certo!';
        feedbackArea.className = 'correct';
        gameState.score += points;
        gameState.correctAnswers += 1;
        scoreElement.textContent = gameState.score;

        // Salva em tempo real a cada acerto
        if (typeof firebaseService !== 'undefined') {
            firebaseService.saveScore(gameState.playerName, gameState.score, gameState.currentGame);
            gameState.lastSavedScore = gameState.score;
        }
    }

    function handleIncorrectAnswer(message) {
        playSound(sounds.incorrect);
        feedbackArea.textContent = message;
        feedbackArea.className = 'incorrect';
    }

    // --- JOGO DAS VOGAIS ---
    function startVowelsGame() {
        questionTitle.textContent = 'Isto é uma vogal?';
        generateVowelQuestion();
    }

    function generateVowelQuestion() {
        const isVowel = Math.random() < 0.5;
        let letter;

        if (isVowel) {
            letter = GAME_DATA.vowels[Math.floor(Math.random() * GAME_DATA.vowels.length)];
        } else {
            const consonants = GAME_DATA.alphabet.filter(l => !GAME_DATA.vowels.includes(l.letter));
            letter = consonants[Math.floor(Math.random() * consonants.length)].letter;
        }

        // Store current state for event handler
        gameState.currentVowelIsVowel = isVowel;

        questionContent.textContent = letter;
        renderVowelOptions(isVowel);
    }

    function renderVowelOptions(isVowel) {
        // No event listeners needed - using event delegation
        optionsArea.innerHTML = `
            <button class="option-button" data-answer="true">Sim</button>
            <button class="option-button" data-answer="false">Não</button>
        `;
    }

    function checkVowelAnswer(answer, isVowel) {
        if (answer === isVowel) {
            handleCorrectAnswer(10);
        } else {
            handleIncorrectAnswer('Errado!');
        }
        setTimeout(() => {
            feedbackArea.innerHTML = '';
            generateVowelQuestion();
        }, 1000);
    }

    // --- JOGO DO ALFABETO ---
    function startAlphabetGame() {
        questionTitle.textContent = 'Qual a letra inicial?';
        generateAlphabetQuestion();
    }

    function generateAlphabetQuestion() {
        const questionData = GAME_DATA.alphabet[Math.floor(Math.random() * GAME_DATA.alphabet.length)];
        const correctAnswer = questionData.letter;

        // Store current state for event handler
        gameState.currentCorrectAnswer = correctAnswer;

        questionContent.innerHTML = `<div>${questionData.word}</div><div style="font-size: 4rem;">${questionData.emoji}</div>`;
        const options = [correctAnswer];
        while (options.length < 4) {
            const randomLetter = GAME_DATA.alphabet[Math.floor(Math.random() * GAME_DATA.alphabet.length)].letter;
            if (!options.includes(randomLetter)) options.push(randomLetter);
        }
        options.sort(() => Math.random() - 0.5);
        renderAlphabetOptions(options, correctAnswer);
    }

    function renderAlphabetOptions(options, correctAnswer) {
        // No event listeners needed - using event delegation
        optionsArea.innerHTML = options.map(option => `<button class="option-button">${option}</button>`).join('');
    }

    function checkAlphabetAnswer(selectedAnswer, correctAnswer) {
        if (selectedAnswer === correctAnswer) {
            handleCorrectAnswer(15);
        } else {
            handleIncorrectAnswer(`Quase! A resposta era ${correctAnswer}.`);
        }
        setTimeout(() => {
            feedbackArea.innerHTML = '';
            generateAlphabetQuestion();
        }, 1500);
    }

    // --- JOGO DAS SÍLABAS ---
    function startSyllablesGame() {
        questionTitle.textContent = 'Qual a primeira sílaba?';
        generateSyllableQuestion();
    }

    function generateSyllableQuestion() {
        const questionData = GAME_DATA.syllables[Math.floor(Math.random() * GAME_DATA.syllables.length)];
        const correctAnswer = questionData.syllable;

        // Store current state for event handler
        gameState.currentCorrectAnswer = correctAnswer;

        questionContent.innerHTML = `<div>${questionData.word}</div><div style="font-size: 4rem;">${questionData.emoji}</div>`;
        const options = [correctAnswer];
        while (options.length < 4) {
            const randomSyllable = GAME_DATA.syllables[Math.floor(Math.random() * GAME_DATA.syllables.length)].syllable;
            if (!options.includes(randomSyllable)) options.push(randomSyllable);
        }
        options.sort(() => Math.random() - 0.5);
        renderSyllableOptions(options, correctAnswer);
    }

    function renderSyllableOptions(options, correctAnswer) {
        // No event listeners needed - using event delegation
        optionsArea.innerHTML = options.map(option => `<button class="option-button">${option}</button>`).join('');
    }

    function checkSyllableAnswer(selectedAnswer, correctAnswer) {
        if (selectedAnswer === correctAnswer) {
            handleCorrectAnswer(20);
        } else {
            handleIncorrectAnswer(`O correto é ${correctAnswer}.`);
        }
        setTimeout(() => {
            feedbackArea.innerHTML = '';
            generateSyllableQuestion();
        }, 1500);
    }

    // --- JOGO DE FORMAR PALAVRAS ---
    function startWordsGame() {
        questionTitle.textContent = 'Forme a palavra!';
        generateWordQuestion();
    }

    function generateWordQuestion() {
        const questionData = GAME_DATA.words[Math.floor(Math.random() * GAME_DATA.words.length)];
        gameState.correctWord = questionData.word;
        gameState.correctSyllables = questionData.syllables;
        gameState.currentWord = [];

        questionContent.innerHTML = `<div>${questionData.hint}</div><div style="font-size: 4rem;">${questionData.emoji}</div><div id="word-display" class="word-display-box"></div>`;
        const options = [...questionData.syllables];
        options.sort(() => Math.random() - 0.5);
        renderWordOptions(options);
    }

    function renderWordOptions(options) {
        // No event listeners needed - using event delegation
        optionsArea.innerHTML = options.map(option => `<button class="option-button">${option}</button>`).join('');
    }

    function updateWordDisplay() {
        document.getElementById('word-display').textContent = gameState.currentWord.join('');
    }

    function checkWordAnswer() {
        if (gameState.currentWord.length === gameState.correctSyllables.length) {
            if (gameState.currentWord.join('') === gameState.correctWord) {
                handleCorrectAnswer(30);
            } else {
                handleIncorrectAnswer('Tente de novo!');
            }
            setTimeout(() => {
                feedbackArea.innerHTML = '';
                generateWordQuestion();
            }, 1500);
        }
    }

    init();
});
