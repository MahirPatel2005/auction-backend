from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
import random
from flask_cors import CORS;

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

socketio = SocketIO(app)

players = [
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

captains = [
    { id: 1, name: 'Deep Goyani', points: 1200, team: [] },
    { id: 2, name: 'Krutgya Kaneria', points: 1200, team: [] },
    { id: 3, name: 'Jagjeet Dangar', points: 1200, team: [] },
    { id: 4, name: 'Yashvi Dholkiya', points: 1200, team: [] },
]

randomized_players = random.sample(players, len(players))
current_player_index = 0
current_player = randomized_players[current_player_index]
passed_players = []

@app.route('/all-players', methods=['GET'])
def get_all_players():
    return jsonify(players)

@app.route('/players', methods=['GET'])
def get_players():
    return jsonify(randomized_players)

@app.route('/auction-start', methods=['GET'])
def auction_start():
    return jsonify({"randomizedPlayers": randomized_players, "captains": captains, "currentPlayer": current_player})

@app.route('/place-bid', methods=['POST'])
def place_bid():
    data = request.json
    bid = data['bid']
    captain_id = data['captainId']
    captain = next(c for c in captains if c['id'] == captain_id)
    
    if len(captain['team']) >= 6:
        return jsonify({"message": "You can only buy 6 players"}), 400

    if bid > captain['points']:
        return jsonify({"message": "Not enough points to place this bid!"}), 400

    captain['points'] -= bid
    current_player['sold'] = True
    captain['team'].append({"player": current_player, "bid": bid})
    move_to_next_player()

    # Emit updated data to all clients via SocketIO
    socketio.emit('bidUpdate', {'captains': captains, 'currentPlayer': current_player, 'allPlayers': players})
    
    return jsonify({"captains": captains, "currentPlayer": current_player, "allPlayers": players})

@app.route('/pass-player', methods=['POST'])
def pass_player():
    passed_players.append(current_player)
    move_to_next_player()

    # Emit updated data after passing player
    socketio.emit('passUpdate', {'currentPlayer': current_player})

    return jsonify({"currentPlayer": current_player})

def move_to_next_player():
    global current_player, current_player_index, randomized_players
    current_player_index += 1
    
    if current_player_index < len(randomized_players):
        current_player = randomized_players[current_player_index]
    elif passed_players:
        randomized_players = passed_players[:]
        passed_players.clear()
        current_player_index = 0
        current_player = randomized_players[current_player_index]
    else:
        current_player = None

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)  # Flask-SocketIO run