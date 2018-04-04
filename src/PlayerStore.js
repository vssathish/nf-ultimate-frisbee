import { extendObservable } from 'mobx'
import axios from 'axios'


class PlayerStore {

    constructor() {
        extendObservable(this, {
            nextGame: '',
            players: []
        });

        axios.get('/players')
        
    }

    addPlayer(player) {

    	axios.post('/players/' + player);

    }

    removePlayer(player) {

    	axios.delete('/players/' + player);

    }


}

let p = new PlayerStore();
export default p;