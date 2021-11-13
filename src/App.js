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
               Block the time on your calendar! <a target="_blank" href="https://calendar.google.com/event?action=TEMPLATE&amp;tmeid=MDQ4b2tqZHRsZGIyYmdmNGk4YTI3czhxdTdfMjAyMTA5MDFUMTkwMDAwWiBkYXJyeWwubGVlQG0&amp;tmsrc=darryl.lee%40gmail.com&amp;scp=ALL">Wed</a> | <a target="_blank" href="https://calendar.google.com/event?action=TEMPLATE&amp;tmeid=MDYyc3NtazB0Y3Rsa3VkbjRrNHZyOXNqYTBfMjAyMTA5MDNUMTkwMDAwWiBkYXJyeWwubGVlQG0&amp;tmsrc=darryl.lee%40gmail.com&amp;scp=ALL">Fri</a>
               <br />
               <img border="0" src="https://www.google.com/calendar/images/ext/gc_button1_en.gif" />
            </p>
            <p className="next-game">
              (Please bring water, and both a white and dark shirt. Vaccination preferred. Cleats optional.)
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
