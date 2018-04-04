const moment = require('moment-timezone')
const getNextGame = require('./nextgame');
const eb = require('./event-bus')

class GameAndPlayerManager {

  constructor(options) {

    console.log('Inside constructor of manager')

    this._options = options || {
      refreshIntervalMs: 60 * 1000 * 30  // 30 minute refresh interval
      //refreshIntervalMs: 15 * 1000  // 15 secs refresh interval
    };

    this.nextGame = ''

    // initialze by getting the values from Prana
    this.seed();
  }

  getNextGame() {
    return this.nextGame;
  }

  seed() {
    const mmt = moment().tz('America/Los_Angeles');
    console.log(mmt + ': Refreshing next game time');

    this.nextGame = getNextGame(mmt);

    eb.emit('next-game', {nextGame: this.nextGame});

    this._refresh();
  }

  _refresh() {
    console.log('refresh timeoutId: ' + this._options.refreshIntervalMs)
    var refreshTime = this._options.refreshIntervalMs;

    this.timeoutId = setTimeout(() => this.seed(), refreshTime);
  }

}

let mgr = new GameAndPlayerManager();
module.exports = mgr;
