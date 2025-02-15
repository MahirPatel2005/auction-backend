const cors = require('cors');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    '*', 
];

// CORS setup for socket.io
const io = socketIo(server, {
    cors: {
        origin: allowedOrigins, // Allow multiple origins
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
    },
});

// CORS setup for Express
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow requests from allowed origins
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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
    
  ];

// Create a copy for the all players list, and add sold property
let allPlayers = players.map(player => ({ ...player, sold: false }));

// Initialize captains
let captains =  [
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

allPlayers = allPlayers.filter(player => !captains.some(captain => captain.name === player.name));

// Remove captains from the players list
players = players.filter(player => !captains.some(captain => captain.name === player.name));

// API to add a player
app.post('/players', (req, res) => {
    const { name, house, age, mobile } = req.body;
    const newPlayer = { name, house, age, mobile, sold: false }; // Add sold property
    players.push(newPlayer);
    allPlayers.push({ ...newPlayer }); // Update allPlayers as well
    res.status(201).json(newPlayer);
});

// Get all players (for the players list page)
app.get('/all-players', (req, res) => {
    res.json(allPlayers);
});

// Get random players for auction
app.get('/players', (req, res) => {
    res.json(randomizedPlayers);
});

// function resetAuction() {
//     randomizedPlayers = players.sort(() => Math.random() - 0.5); // Randomize players again
//     currentPlayerIndex = 0;
//     currentPlayer = randomizedPlayers[currentPlayerIndex];
//     passedPlayers = [];
//     captains.forEach(captain => {
//         captain.team = [];
//         captain.points = 1500; // Reset captain points
//     });

//     // Reset all players to available (sold: false)
//     allPlayers.forEach(player => {
//         player.sold = false; // Mark all players as available
//     });

//     io.emit('auctionStart', { randomizedPlayers, captains, currentPlayer });
//     io.emit('bidUpdate', { allPlayers }); // Emit updated allPlayers to clients
// }


io.on('connection', (socket) => {
    console.log('A user connected');

    socket.emit('auctionStart', { randomizedPlayers, captains, currentPlayer });

    socket.on('getAuctionData', () => {
        // Send the auction data to the client when requested
        socket.emit('auctionStart', {
            randomizedPlayers, 
            captains, 
            currentPlayer
        });
    });

    // socket.on('resetAuction', () => {
    //     resetAuction(); // Reset the auction and emit the start data again
    // });

    socket.on('placeBid', (bid, captainId) => {
        const captain = captains.find(c => c.id === captainId);

        if (captain.team.length >= 6) {
            socket.emit('errorMessage', 'You can only buy 6 players');
            return;
          }

        if (bid > captain.points) {
            socket.emit('errorMessage', 'Not enough points to place this bid!');
        } else {
            captain.points -= bid;

            currentPlayer.sold = true;
            const allPlayersIndex = allPlayers.findIndex(p => p.name === currentPlayer.name);
            if (allPlayersIndex !== -1) {
                allPlayers[allPlayersIndex].sold = true;
            }

            captain.team.push({ player: currentPlayer, bid });
            io.emit('bidUpdate', { captains, currentPlayer, allPlayers });

            moveToNextPlayer();
        }
    });  

    socket.on('passPlayer', () => {
        console.log('Player passed:', currentPlayer.name);
        passedPlayers.push(currentPlayer);

        moveToNextPlayer();
    });

    function moveToNextPlayer() {
        currentPlayerIndex++;
    
        if (currentPlayerIndex < randomizedPlayers.length) {
            currentPlayer = randomizedPlayers[currentPlayerIndex];
            io.emit('nextPlayer', currentPlayer);
        } else if (passedPlayers.length > 0) {
            console.log('All players shown once. Revisiting passed players...');
            randomizedPlayers = [...passedPlayers]; // Reassign with passed players
            passedPlayers = []; // Reset passed players
            currentPlayerIndex = 0; // Restart index
            currentPlayer = randomizedPlayers[currentPlayerIndex]; // Set next player
            io.emit('nextPlayer', currentPlayer);
        } else {
            currentPlayer = null;
            console.log('Auction Ended');
            io.emit('auctionEnd'); 
        }
    }

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
    console.log("Server running on port",PORT);
});