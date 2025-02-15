const cors = require('cors');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
    },
});

app.use(cors({
    origin: '*',
    credentials: true,
}));
app.use(express.json());

let players = [
    { name: "Dax Patel ", role: "Batsman", basePrice: 20 },
    { name: "Dev Patel ", role: "Batsman", basePrice: 20 },
    { name: "Garvit Trivedi ", role: "Batsman", basePrice: 20 },
    { name: "Ishita Trivedi ", role: "Batsman", basePrice: 20 },
    { name: "Kalp Patel ", role: "Batsman", basePrice: 20 },
    { name: "Kalpan Kaneria", role: "Batsman", basePrice: 20 },
    { name: "Krishna Paridwal", role: "Batsman", basePrice: 20 },
    { name: "Mohit Soni ", role: "Batsman", basePrice: 20 },
    { name: "Priyasha Yadav  ", role: "Batsman", basePrice: 20 },
    { name: "Shivam Singh Negi ", role: "Batsman", basePrice: 20 },
    
    { name: "Isha Patel ", role: "Bowler", basePrice: 20 },
    { name: "Arjun Divraniya ", role: "Bowler", basePrice: 20 },
    { name: "Arya Patel ", role: "Bowler", basePrice: 20 },
    { name: "Dhruv Sonagra ", role: "Bowler", basePrice: 20 },
    { name: "Dhruvil Patel ", role: "Bowler", basePrice: 20 },
    { name: "Dridti Gupta ", role: "Bowler", basePrice: 20 },
    { name: "Akshar Gangani ", role: "Bowler", basePrice: 20 },
    { name: "Hardagya Rajput ", role: "Bowler", basePrice: 20 },
    { name: "Homasvi Kaneriya ", role: "Bowler", basePrice: 20 },
    { name: "Parth Jadav ", role: "Bowler", basePrice: 20 },
  
    { name: "Jatan Mathasoliya ", role: "All-rounder", basePrice: 20 },
    { name: "Jatin Rajwani ", role: "All-rounder", basePrice: 20 },
    { name: "Jenil Savalia ", role: "All-rounder", basePrice: 20 },
    { name: "Kaniska Trivedi  ", role: "All-rounder", basePrice: 20 },
    { name: "Kashyap Dhamecha ", role: "All-rounder", basePrice: 20 },
    { name: "Khushbu Patel ", role: "All-rounder", basePrice: 20 },
    { name: "Khushi Rajput ", role: "All-rounder", basePrice: 20 },
    { name: "Kiran Chaudhary ", role: "All-rounder", basePrice: 20 },
    { name: "Krish shyara ", role: "All-rounder", basePrice: 20 },
    { name: "Mayank Dudhatra ", role: "All-rounder", basePrice: 20 },
  
    { name: "Nagesh Jagtap ", role: "Wicketkeeper", basePrice: 20 },
    { name: "Narvin ", role: "Wicketkeeper", basePrice: 20 },
    { name: "Prem Kambliya ", role: "Wicketkeeper", basePrice: 20 },
    { name: "Priy Mavani  ", role: "Wicketkeeper", basePrice: 20 },
    { name: "Ridham Patel ", role: "Wicketkeeper", basePrice: 20 },
    { name: "Rijans Patoliya ", role: "Wicketkeeper", basePrice: 20 },
    { name: "Veer Modi ", role: "Wicketkeeper", basePrice: 20 },
    { name: "Shubham Modi ", role: "Wicketkeeper", basePrice: 20 },
    { name: "Aashish Tejvani ", role: "Wicketkeeper", basePrice: 20 },
    { name: "Aditya Rajput ", role: "Wicketkeeper", basePrice: 20 },
  
    { name: "Aswani", role: "Batsman", basePrice: 20 },
    { name: "Jeevan Kadam", role: "Bowler", basePrice: 20 },
    { name: "Mayur Waykar", role: "All-rounder", basePrice: 20 },
    { name: "Vanshika Jagram", role: "Wicketkeeper", basePrice: 20 },
    { name: "Yasar Khan", role: "Batsman", basePrice: 20 },
    { name: "Mahir Patel", role: "Bowler", basePrice: 20 },
    { name: "Sujal", role: "All-rounder", basePrice: 20 },
    
  ]; // Same player data as before

// Create a copy for the all players list, and add sold property
let allPlayers = players.map(player => ({ ...player, sold: false }));

// Initialize captains
let captains = [
    { id: 1, name: 'Deep Goyani', points: 1200, team: [] },
    { id: 2, name: 'Krutgya Kaneria', points: 1200, team: [] },
    { id: 3, name: 'Jagjeet Dangar', points: 1200, team: [] },
    { id: 4, name: 'Yashvi Dholkiya', points: 1200, team: [] },
];

allPlayers = allPlayers.filter(player => !captains.some(captain => captain.name === player.name));
players = players.filter(player => !captains.some(captain => captain.name === player.name));

let randomizedPlayers = players.sort(() => Math.random() - 0.5);

let currentPlayerIndex = 0;
let currentPlayer = randomizedPlayers[currentPlayerIndex];
let passedPlayers = [];

// POST endpoint to add a new player
app.post('/players', (req, res) => {
    const { name, house, age, mobile } = req.body;
    const newPlayer = { name, house, age, mobile, sold: false };
    players.push(newPlayer);
    allPlayers.push({ ...newPlayer });
    res.status(201).json(newPlayer);
});

// GET endpoint to get all players
app.get('/all-players', (req, res) => {
    res.json(allPlayers);
});

// GET endpoint to get players for auction
app.get('/players', (req, res) => {
    res.json(randomizedPlayers);
});

app.get('/auction-start', (req, res) => {
    res.json({ randomizedPlayers, captains, currentPlayer });
});

app.post('/place-bid', (req, res) => {
    const { bid, captainId } = req.body;
    const captain = captains.find(c => c.id === captainId);

    if (captain.team.length >= 6) {
        return res.status(400).json({ message: 'You can only buy 6 players' });
    }

    if (bid > captain.points) {
        return res.status(400).json({ message: 'Not enough points to place this bid!' });
    } else {
        captain.points -= bid;
        currentPlayer.sold = true;
        const allPlayersIndex = allPlayers.findIndex(p => p.name === currentPlayer.name);
        if (allPlayersIndex !== -1) {
            allPlayers[allPlayersIndex].sold = true;
        }
        captain.team.push({ player: currentPlayer, bid });
        moveToNextPlayer();
        return res.status(200).json({ captains, currentPlayer, allPlayers });
    }
});

// Endpoint to pass the current player
app.post('/pass-player', (req, res) => {
    passedPlayers.push(currentPlayer);
    moveToNextPlayer();
    res.status(200).json({ currentPlayer });
});

function moveToNextPlayer() {
    currentPlayerIndex++;

    if (currentPlayerIndex < randomizedPlayers.length) {
        currentPlayer = randomizedPlayers[currentPlayerIndex];
    } else if (passedPlayers.length > 0) {
        randomizedPlayers = [...passedPlayers];
        passedPlayers = [];
        currentPlayerIndex = 0;
        currentPlayer = randomizedPlayers[currentPlayerIndex];
    } else {
        currentPlayer = null;
    }
}

module.exports = app;