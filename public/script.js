const gameBoard = document.getElementById('game-board');
const keyboardContainer = document.getElementById('keyboard-container');
const notificationContainer = document.getElementById('notification-container');

let currentRow = 0;
let currentTile = 0;
const maxGuesses = 6;
let isAnimating = false;
let isGameOver = false;

const keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

async function startGame() {
    try {
        await fetch('/start');
        createBoard();
        createKeyboard();
        addEventListeners();
    } catch (error) {
        showNotification('Failed to start game. Please refresh.', 5000);
        console.error('Error starting game:', error);
    }
}

function createBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < maxGuesses * 5; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        gameBoard.appendChild(tile);
    }
}

const keyElements = {};
function createKeyboard() {
    keyboardContainer.innerHTML = '';
    keys.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');
        row.forEach(key => {
            const keyButton = document.createElement('button');
            keyButton.classList.add('key');
            if (key.length > 1) keyButton.classList.add('large');
            keyButton.textContent = key;
            keyButton.addEventListener('click', () => handleKeyPress(key));
            rowDiv.appendChild(keyButton);
            keyElements[key] = keyButton;
        });
        keyboardContainer.appendChild(rowDiv);
    });
}

function addEventListeners() {
    const restartButton = document.getElementById('restart-button');
    restartButton.addEventListener('click', () => {
        if (!isAnimating) location.reload();
    });

    document.addEventListener('keydown', (e) => {
        if (isAnimating) return;
        if (e.key.toUpperCase() === 'ENTER' && isGameOver) {
            location.reload();
            return;
        }
        handleKeyPress(e.key.toUpperCase());
    });
}

function handleKeyPress(key) {
    if (isGameOver) return;
    if (key === 'ENTER') {
        handleGuess();
    } else if (key === 'BACKSPACE') {
        handleBackspace();
    } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
        handleInput(key);
    }
}

function handleInput(letter) {
    if (currentTile < 5) {
        const tile = gameBoard.children[currentRow * 5 + currentTile];
        tile.textContent = letter;
        tile.classList.add('filled');
        currentTile++;
    }
}

function handleBackspace() {
    if (currentTile > 0) {
        currentTile--;
        const tile = gameBoard.children[currentRow * 5 + currentTile];
        tile.textContent = '';
        tile.classList.remove('filled');
    }
}

async function handleGuess() {
    if (currentTile !== 5) {
        showNotification('Not enough letters');
        shakeRow();
        return;
    }

    const guess = getGuess();
    isAnimating = true;

    try {
        const response = await fetch('/guess', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guess })
        });
        const data = await response.json();

        if (!data.isValid) {
            showNotification('Not in word list');
            shakeRow();
            isAnimating = false;
            return;
        }

        revealTiles(guess, data.result);

        if (data.isWin) {
            setTimeout(() => {
                showNotification('You win!', 3000);
                isGameOver = true;
            }, 1500);
        } else if (currentRow === maxGuesses - 1) {
            const revealResponse = await fetch('/reveal');
            const revealData = await revealResponse.json();
            setTimeout(() => {
                showNotification(`The word was ${revealData.secretWord}`, 5000);
                isGameOver = true;
            }, 1500);
        }

    } catch (error) {
        showNotification('Error checking guess.', 2000);
        console.error('Error during guess:', error);
        isAnimating = false;
    }
}

function getGuess() {
    let guess = '';
    for (let i = 0; i < 5; i++) {
        guess += gameBoard.children[currentRow * 5 + i].textContent;
    }
    return guess;
}

function shakeRow() {
    const rowTiles = Array.from(gameBoard.children).slice(currentRow * 5, currentRow * 5 + 5);
    rowTiles.forEach(tile => {
        tile.classList.add('shake');
        tile.addEventListener('animationend', () => tile.classList.remove('shake'), { once: true });
    });
}

function revealTiles(guess, result) {
    const tiles = Array.from(gameBoard.children).slice(currentRow * 5, currentRow * 5 + 5);
    const guessLetters = guess.split('');

    tiles.forEach((tile, index) => {
        const state = result[index];
        setTimeout(() => {
            tile.classList.add(state);
            updateKeyboard(guessLetters[index], state);
            if (index === 4) {
                isAnimating = false;
                if (!isGameOver) {
                    currentRow++;
                    currentTile = 0;
                }
            }
        }, index * 300);
    });
}

function updateKeyboard(letter, state) {
    const key = keyElements[letter];
    if (!key) return;

    const currentState = key.dataset.state;
    if (currentState === 'correct' || (currentState === 'present' && state !== 'correct')) {
        return;
    }
    key.classList.add(state);
    key.dataset.state = state;
}

function showNotification(message, duration = 1500) {
    notificationContainer.textContent = message;
    notificationContainer.classList.add('show');
    setTimeout(() => {
        notificationContainer.classList.remove('show');
    }, duration);
}

startGame();