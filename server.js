// Dependencies
let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io');
let Observable = require('./public/observable')
// let io = require('./node_modules/socket.io-client/dist/socket.io')

let app = express();
let server = http.Server(app);
let io = socketIO(server);
app.set('port', 5000);



app.use(express.static('public/'))
// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, '/public'));
});
// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

let gameData = {}

io.on('connection', function(socket) {

  // Stop checking for players
  socket.on('stop_searching_for_players', function(res) {
    gameData[res] = undefined
    stop_checking_for_player()
  });

  // Function to intialize a new game i.e Create a new lobby
  socket.on('new_game', function() {
    

    // looping until we get a gameplay id to play in
    max_number_of_players = 20
    gameid = Math.floor(Math.random() * max_number_of_players)
    count = 0

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
      io.sockets.emit('game_id', res);
  
      search_stream = setInterval(function() {
        let res = {
            game:gameid,
            socket:socket.id, 
            game_data:gameData[gameid]
        }
        io.sockets.emit('player_update', res);
      }, 1000)
      stop_checking_for_player = () => clearInterval(search_stream)
    }
    


  });

  socket.on('join_game', function(gameid) {

    if (gameData[gameid] != undefined){
      if (Object.keys(gameData[gameid]).length > 1){
        let res = {
          "code":404,
          "message":"Maximum players currently present in the lobby? Did you enter the correct Game ID?"
        }
        io.sockets.emit('join', res)
      }

      gameData[gameid][socket.id] = 0
      players = gameData[gameid]
      // // console.log()
      // if (Object.keys(players).length === 2){
      let res = {
        "code":200,
        "gameid":gameid,
        "socket_id":socket.id,
        "players":players,
        "player_id":2
      }
      io.sockets.emit('join', res)
      // io.sockets.emit('player_update', game_id[gameid]);
  
      // }

    }else{
      let res = {
        "code":404,
        "message":"Did you enter a valid Game ID?"
      }
      io.sockets.emit('join', res)
    }


  }),

  socket.on('movement', function(data) {
    if (data != undefined){
      if (gameData[data.gameid] != undefined){
        gameData[data.gameid][data.socket] = data.y
        io.sockets.emit('player_movement', gameData);
      }
      
    }
    
  }),
  socket.on('ball', function(data) {
    if (data != undefined){
      if (gameData[data.gameid] != undefined){
        io.sockets.emit('ball_move', data);
      }
    }

      
    
    

  });

  socket.on('score_update', function(res) {
    io.sockets.emit("update_score",res)
      
    })

    socket.on('detach', function(res) {
      delete gameData[res]
      console.log(gameData)
      })

  //   var players = {};
  //   game_id[gameid] = players
  //   game_id[gameid][socket.id] = 0
  //   let res = {
  //     "gameid":gameid,
  //     "socket_id":socket.id
  //   }
  //   io.sockets.emit('game_id', res);

  // });

  // socket.on('mouse_movement', function(data) {
  //   var player = players[socket.id] || {};
  //   player.y = data;
  // });
});
// setInterval(function() {
//   io.sockets.emit('state', players);
// }, 1000 / 60);

// io.on('connection', function(socket) {
//     socket.on('new player', function() {
//       players[socket.id] = {
//         y: 0
//       };
//     });
//     socket.on('mouse_movement', function(data) {
//       var player = players[socket.id] || {};
//       player.y = data;
//     });
//   });
//   setInterval(function() {
//     io.sockets.emit('state', players);
//   }, 1000 / 60);


