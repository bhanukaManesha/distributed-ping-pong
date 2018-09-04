
// Dependencies
let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io');
let Observable = require('./public/observable')

// Setting up the server
let app = express();
let server = http.Server(app);
let io = socketIO(server);

// Setting the port
app.set('port', 5000);

// Setting up the root directory for the files
app.use(express.static('public/'))

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, '/public'));
});
// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

// Variable to store the game data
let gameData = {}
// Server 
let serverIO = io.sockets

// Setting up the connection with the socket IO server
io.on('connection', function(socket) {

  // Stop checking for players
  socket.on('stop_searching_for_players', function(res) {
    gameData[res] = undefined
    stop_checking_for_player()
  });

  /**
   * Function to intialize a new game i.e Create a new lobby
   */
  socket.on('new_game', function() {

    // Setting the variables
    max_number_of_players = 20
    gameid = Math.floor(Math.random() * max_number_of_players)
    count = 0

    // looping until we get a gameplay id to play in
    while (gameData[gameid] != undefined){
      gameid = Math.floor(Math.random() * max_number_of_players)
      count++
      if (count >= 2*max_number_of_players){
        io.sockets.emit('game_id',{code:404,message:"Server Full"});
        break
      }
    }

    // if the game_play id is found then initialize the location and start the session
    if (gameData[gameid] == undefined){
      let players = {};
      gameData[gameid] = players
      gameData[gameid][socket.id] = 0
      let res = {
        "code" : 200,
        "gameid":gameid,
        "socket_id":socket.id,
        "players":players,
        "player_id":1
      }
      // Send the data to the socket
      io.sockets.emit('game_id', res);

      // Send a stream of data every 1 second to the hosts with the updated data
      search_stream = setInterval(function() {
        let res = {
            game:gameid,
            socket:socket.id, 
            game_data:gameData[gameid]
        }
        // Emit the player update
        io.sockets.emit('player_update', res);
      }, 1000)
      // Get the clear interval function of the serach stream in to a varibale
      stop_checking_for_player = () => clearInterval(search_stream)
    }
  });

  /**
   * Function to join a game
   */
  socket.on('join_game', function(gameid) {
    // Check the game id 
    if (gameData[gameid] != undefined){
      // Check if the lobby has the maximumnumber of players
      if (Object.keys(gameData[gameid]).length > 1){
        let res = {
          "code":404,
          "message":"Maximum players currently present in the lobby? Did you enter the correct Game ID?"
        }
        // Emit join with the error message
        io.sockets.emit('join', res)
      }
      // If the game ID is correct and there are the correct number of players
      gameData[gameid][socket.id] = 0
      players = gameData[gameid]

      let res = {
        "code":200,
        "gameid":gameid,
        "socket_id":socket.id,
        "players":players,
        "player_id":2
      }
      // Emit join with the sucess message
      io.sockets.emit('join', res)


    }else{
      // If the game id is wrong
      let res = {
        "code":404,
        "message":"Did you enter a valid Game ID?"
      }
      // Emit join with the error message
      io.sockets.emit('join', res)
    }


  }),

  /**
   * Function to update player paddle movements
   */
  socket.on('movement', function(data) {
    if (data != undefined){
      if (gameData[data.gameid] != undefined){
        // Update the server socket with the movement data
        gameData[data.gameid][data.socket] = data.y
        // Send to the clients the updated player movements
        serverIO.emit('player_movement', gameData);
      }
      
    }
    
  }),
  
  /**
   * Function to update the ball movement
   */
  socket.on('ball', function(data) {
    if (data != undefined){
      if (gameData[data.gameid] != undefined){
        // Emit the ball movement from the server to the clients
        serverIO.emit('ball_move', data);
      }
    }

    
  });

  /**
   * Function to update the score
   */
  socket.on('score_update', function(res) {
    // Emit the score back to the client
    serverIO.emit("update_score",res)
      
  });

  /**
   * Function to detach from the server
   */
  socket.on('detach', function(res) {
      if (res === "check"){
        // If the server is till checking for a game, then stop seaching and detach
        for (const [key, value] of Object.entries(gameData)) {

          if (Object.keys(gameData[key]) !== undefined){
            if (Object.keys(gameData[key]).length === 1){
              
              delete gameData[key]
              stop_checking_for_player()
              
            }
          } 
        }
      }
      // Detach from the server
      delete gameData[res]
      })
});