var _ = require('lodash')
var compression = require('compression')
var bodyParser = require('body-parser')
var mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;


const app = express();
app.use(compression())
app.use(bodyParser.json())

// WebSockets
var server = require('http').createServer(app);  
var io = require('socket.io')(server);

var gm = require('./game-player-manager')
var eb = require('./event-bus.js')

// Mongoose Schema definition
// const MONGOLAB_URI='mongodb://nfUltimateUser:LetsP1ayFrisbee@ds145911.mlab.com:45911/nf-ultimate-frisbee';
const MLAB_URI = 'mongodb+srv://nfUltimateUser:LetsP1ayFrisbee@cluster0.zoya2.mongodb.net/nf-ultimate-frisbee?retryWrites=true&w=majority';

const Schema = new mongoose.Schema({
  time       : String, 
  players    : [String]
}),
Game = mongoose.model('Game', Schema);
mongoose.connect(MLAB_URI, function (error) {
    if (error) console.error(error);
    else console.log('mongo connected');
});

const client = new MongoClient(MLAB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});


let players = [], nextGame = undefined;
eb.on('next-game', (obj) => {
    console.log('clearing players')

    if (nextGame.time != obj.nextGame.time) {

      nextGame = obj.nextGame
      console.log('setting new game')

      let newGame = Game({
        time: nextGame.time,
        players: []
      });

      newGame.save()
      .then(doc => { console.log('game saved'); })
      .catch(err => { console.log('save failed'); console.error(err) });

      io.emit('update', {
        players: [],
        nextGame: nextGame
      });
    }
})

if (process.env.ENV !== 'local') {
  app.use(express.static('./build'));  
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, './build', 'index.html'));
});

app.post('/players/:name', function(req, res){

  Game.findOneAndUpdate(
    { time: nextGame.time },
    { $push: { players: req.params.name  } },
    { upsert: true, returnNewDocument: true, new: true },
    (error, game) => {
      if (error) console.log(error);

      const resp = {
        players: game.players,
        nextGame
      };
      console.log(resp);
      
      io.emit('update', {
        players: game.players,
        nextGame
      });
    });

    res.send();
});

app.get('/players', function(req, res){

  Game.findOne({ time: nextGame.time })  
    .then(game => {
      console.log('game found');
      console.log(game)
      io.emit('update', {
        players: game.players,
        nextGame
      })
    });

    res.send();
})

app.delete('/players/:name', function(req, res){

  Game.findOneAndUpdate(
    { time: nextGame.time },
    { $pullAll: { players: [req.params.name]  } },
    { upsert: true, returnNewDocument: true, new: true },
    function (error, game) {
        if (error) console.log(error);

        console.log(game);
        
        io.emit('update', {
          players: game.players,
          nextGame
        });
    });

    res.send();
})

const PORT = (process.env.ENV === 'local' ? 3001 :  process.env.PORT || 3000);

server.listen(PORT, function(){
  console.log('server up and running on ' + PORT)
  
  nextGame = gm.getNextGame();
  console.log('Next game on: ' + JSON.stringify(nextGame));

  Game.findOne({ time: nextGame.time }).exec(function(err, game) {
    if (err) console.log(errors);

    let players = game ? game.players : undefined;

    if (! players) {
      console.log('Setting game on startup')
      
      let newGame = Game({
        time: nextGame.time,
        players: []
      });
      newGame.save()
      .then(doc => {
        console.log('game saved');
      })
      .catch(err => {
        console.log('save failed');
        console.error(err)
      })

    } else {
      console.log('Game already setup')
    }
  })
});