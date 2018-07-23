var _ = require('lodash')
var compression = require('compression')
var bodyParser = require('body-parser')

const express = require('express');
const path = require('path');
const app = express();

var server = require('http').createServer(app);  
var io = require('socket.io')(server);

var gm = require('./game-player-manager')
var eb = require('./event-bus.js')
var storage = require('node-persist');


let players = [], nextGame = undefined;

eb.on('next-game', (obj) => {
    console.log('clearing players')

    if  (nextGame.time != obj.nextGame.time) {

      nextGame = obj.nextGame
      console.log('setting storage')
      storage.setItemSync(nextGame.time, []);

      io.emit('update', {
        players: [],
        nextGame: nextGame
      });

    }    
})

app.use(express.static('./build'));
app.use(compression())
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, './build', 'index.html'));
});

app.post('/players/:name', function(req, res){

    let players = storage.getItemSync(nextGame.time);

    console.log(nextGame)
    console.log(players)

    players.push(req.params.name)
    storage.setItemSync(nextGame.time, players)

    io.emit('update', {
      players: players,
      nextGame: nextGame
    });

    res.send();
})

app.get('/players', function(req, res){
    
    if (! nextGame) {
      nextGame = gm.getNextGame();
    }
    let players = storage.getItemSync(nextGame.time)

    console.log(players)

    let resp = {
      players: players,
      nextGame: nextGame
    }

    io.emit('update', resp);

    res.send();
})

app.delete('/players/:name', function(req, res){

    let players = storage.getItemSync(nextGame.time)
    players = _.without(players, req.params.name)
    storage.setItemSync(nextGame.time, players)

    io.emit('update', {
      players: players,
      nextGame: nextGame
    });

    res.send();

})



server.listen(process.env.PORT || 3000, function(){
  console.log('server up and running on ' + process.env.PORT || 3000)
  
  nextGame = gm.getNextGame();
  console.log('Next game on: ' + nextGame)

  storage.init().then(function(){
    
    let players = storage.getItemSync(nextGame.time)

    if (! players) {
      console.log('Setting game on startup')
      storage.setItemSync(nextGame.time, []);
    } else {
      console.log('Game already setup')
    }

  });

});