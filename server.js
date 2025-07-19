const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend files

let secretWord = '';
const validWords = new Set();

// Fetch the word list on server startup
async function fetchWordList() {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/tabatkins/wordle-list/main/words');
        const words = response.data.split('\n').filter(word => word.length === 5).map(word => word.toUpperCase());
        words.forEach(word => validWords.add(word));
        console.log(`Loaded ${validWords.size} words.`);
    } catch (error) {
        console.error('Failed to load word list:', error.message);
        // Fallback to a small list if the fetch fails
        const fallbackWords = ["STYLE", "WORLD", "AGENT", "APPLE", "HELLO"];
        fallbackWords.forEach(word => validWords.add(word));
        console.log('Using fallback word list.');
    }
}

// Endpoint to start a new game
app.get('/start', (req, res) => {
    const wordList = Array.from(validWords);
    secretWord = wordList[Math.floor(Math.random() * wordList.length)];
    // console.log(`New game started. Secret word is: ${secretWord}`); // For server-side debugging
    res.json({ success: true, message: 'Game started.' });
});

// Endpoint to validate a guess
app.post('/guess', (req, res) => {
    const { guess } = req.body;

    if (!guess || guess.length !== 5) {
        return res.status(400).json({ error: 'Invalid guess.' });
    }

    const upperGuess = guess.toUpperCase();

    if (!validWords.has(upperGuess)) {
        return res.json({ isValid: false });
    }

    let checkSecret = secretWord;
    const result = Array(5).fill(null);
    const guessLetters = upperGuess.split('');

    // First pass for correct letters
    guessLetters.forEach((letter, index) => {
        if (letter === checkSecret[index]) {
            result[index] = 'correct';
            checkSecret = checkSecret.substring(0, index) + ' ' + checkSecret.substring(index + 1);
            guessLetters[index] = ' ';
        }
    });

    // Second pass for present letters
    guessLetters.forEach((letter, index) => {
        if (result[index]) return;
        if (letter !== ' ' && checkSecret.includes(letter)) {
            result[index] = 'present';
            checkSecret = checkSecret.replace(letter, ' ');
        } else {
            result[index] = 'absent';
        }
    });

    const isWin = upperGuess === secretWord;
    res.json({ isValid: true, result, isWin });
});

// Endpoint to get the secret word if the player loses
app.get('/reveal', (req, res) => {
    res.json({ secretWord });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, async () => {
    await fetchWordList();
    console.log(`Server is running on http://localhost:${PORT}`);
});
