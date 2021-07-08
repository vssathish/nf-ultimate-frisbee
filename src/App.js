import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import { observer } from 'mobx-react'
import store from './PlayerStore'

import io from 'socket.io-client'
let socket = io()


class App extends Component {

  constructor(props) {
    super(props);
    this.addPlayer = this.addPlayer.bind(this);
  }

  componentDidMount() {

    socket.on(`update`, data => {
      store.players = data.players;
      store.nextGame = data.nextGame;
    })

    this.textInput.focus();
  }

  _handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.addPlayer()
    }
  }

  addPlayer() {
    if (this.textInput.value.length > 1) {
    console.log(this.textInput.value)

      store.addPlayer(this.textInput.value)

    this.textInput.value = ''
    }
  }

  removePlayer(player) {
    console.log('Remove ' + player)

    store.removePlayer(player)

  }

  render() {
    const nextGame = store.nextGame || { venue: {}};
    const venue = nextGame.venue;
    return (
      <div className="App">
        <header className="header">
            <h1 className="title">Netflix <strong>Ultimate</strong> Pickup</h1>
            <p className="next-game">
              Next Game: <strong>{nextGame.time}</strong>&nbsp; 
              (<a className="details-link" target="_blank" rel="noopener noreferrer" href={nextGame.details}>Details</a>)
            </p>
            <p className="next-game-venue">
              Venue: <strong>
              {venue.name} - &nbsp;
              </strong>
              <a className="details-link" target="_blank" rel="noopener noreferrer" href={venue.map}>{venue.address}</a>
            </p>
            <p className="next-game">
              (List will be reset one hour after "current game" starts. E.g. you can't sign up for Friday until after Thursday's game.)
            </p>
        </header>

        <section>
          <div className="signup">
            <input type="text" placeholder="Player Name" ref={(input) => { this.textInput = input; }} onKeyPress={this._handleKeyPress} />
            <button id="add" onClick={ this.addPlayer }>Sign-Up</button>
          </div>

          {store.players.length >= venue.min && (
            <h2 className="game-on">The game is <strong>ON</strong> (Minimum {venue.min})!</h2>
          )}

          {store.players.length < venue.min && (
            <h2 className="game-off">Waiting for <strong>{ venue.min - store.players.length }</strong> more players</h2>
          )}

          <div>
            <ol>
            { store.players.map ( (p, i) =>
              <li key={i}>
                <span>{ i + 1 }. { p } </span>
                <a href="#" className="remove" onClick={ () => this.removePlayer(p) }>X</a>
              </li>
            )}
            </ol>
          </div>
        </section>
      </div>
    );
  }
}

export default observer(App);
