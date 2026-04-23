// Definició de les formes i colors bàsics
const Shape = Object.freeze({ CIRCLE: 'c', SQUARE: 's', TRIANGLE: 't' });
const Color = Object.freeze({ BLUE: 'b', RED: 'r', GREEN: 'g', YELLOW: 'y' });

export var gameStates;
export var gameItems; // L'exportem aquí per coherència

const StateCard = Object.freeze({
    DISABLE: 0,
    ENABLE: 1,
    DONE: 2
});

var game = {
    items: [],
    states: [],
    setValue: null,
    ready: 0,
    selectedCards: [],
    score: 200,
    pairs: 2,
    groupSize: 2,

    goBack: function(idx) {
        if (this.setValue && this.setValue[idx]) this.setValue[idx]();
        this.states[idx] = StateCard.ENABLE;
    },

    goFront: function(idx) {
        if (this.setValue && this.setValue[idx]) this.setValue[idx]();
        this.states[idx] = StateCard.DISABLE;
    },

    select: function() {
        if (sessionStorage.load) {
            let toLoad = JSON.parse(sessionStorage.load);
            this.items = toLoad.items;
            this.states = toLoad.states;
            this.selectedCards = toLoad.lastCard || [];
            this.groupSize = toLoad.groupSize || 2;
            this.score = toLoad.score;
            this.pairs = toLoad.pairs;
        } else {
            this.groupSize = parseInt(sessionStorage.getItem('groupSize')) || 2;
            this.pairs = parseInt(sessionStorage.getItem('pairs')) || 2;

            const modelsDisponibles = [
                { shape: 'c', color: '#3498db' },
                { shape: 'c', color: '#e74c3c' },
                { shape: 's', color: '#2ecc71' },
                { shape: 's', color: '#f1c40f' },
                { shape: 't', color: '#9b59b6' },
                { shape: 't', color: '#e67e22' }
            ];

            shuffe(modelsDisponibles);
            let seleccionats = modelsDisponibles.slice(0, this.pairs);

            let tauler = [];
            seleccionats.forEach(model => {
                for (let i = 0; i < this.groupSize; i++) {
                    tauler.push({ ...model });
                }
            });

            this.items = tauler;
            shuffe(this.items);
            this.states = new Array(this.items.length).fill(StateCard.DISABLE);
        }
        gameStates = this.states;
        gameItems = this.items;
    },

    start: function() {
		this.items.forEach((_, indx) => {
			// Si la carta ja estava resolta (cas de carregar partida), no fem res
			if (this.states[indx] === StateCard.DONE) {
				this.ready++;
			} 
			else {
				// Totes les cartes estan a 0 (de cara). 
				// Esperem un segon + el delay per girar-les a 1 (esquena)
				setTimeout(() => {
					this.goBack(indx); // Això posa l'estat a 1 (ENABLE)
					this.ready++;
				}, 1000 + (100 * indx)); // Donem 1 segons perquè les memoritzin
			}
		});
	},

    click: function(indx) {
        // Bloquejos de seguretat
        if (this.states[indx] !== StateCard.ENABLE || this.ready < this.items.length) return;
        if (this.selectedCards.includes(indx)) return;

        this.goFront(indx);
        this.selectedCards.push(indx);

        // Si encara no hem arribat al groupSize, l'usuari segueix triant
        if (this.selectedCards.length < this.groupSize) return;

        // Quan arribem al groupSize (parella, trio...), comprovem:
        let primeraCarta = this.items[this.selectedCards[0]];
        
        // CORRECCIÓ: Comparem propietats de l'objecte, no l'objecte sencer
        let match = this.selectedCards.every(idx => {
            return this.items[idx].shape === primeraCarta.shape && 
                   this.items[idx].color === primeraCarta.color;
        });

        if (match) {
            // ÈXIT
            this.selectedCards.forEach(i => this.states[i] = StateCard.DONE);
            this.pairs--; 
            this.selectedCards = [];
            
            if (this.pairs <= 0) {
                setTimeout(() => {
                    alert(`Has guanyat amb ${this.score} punts!`);
                    window.location.assign("../");
                }, 500);
            }
        } else {
            // ERROR
            this.ready = 0; // Bloquegem el clic
            setTimeout(() => {
                this.selectedCards.forEach(i => this.goBack(i));
                this.score -= 25;
                this.selectedCards = [];
                this.ready = this.items.length;

                if (this.score <= 0) {
                    alert("Has perdut!");
                    window.location.assign("../");
                }
            }, 700);
        }
    },

    save: function() {
        let to_save = JSON.stringify({
            items: this.items,
            states: this.states,
            lastCard: this.selectedCards,
            groupSize: this.groupSize,
            score: this.score,
            pairs: this.pairs,
        });

        localStorage.save = to_save; // Guardat local per seguretat
        
        fetch('../php/save.php', {
            method: "POST",
            body: to_save,
            headers: { "Content-type": "application/json; charset=UTF-8" }
        })
        .then(() => window.location.assign("../"))
        .catch(() => window.location.assign("../"));
    },
}

function shuffe(arr) {
    arr.sort(function() { return Math.random() - 0.5 });
}

export function selectCards() {
    game.select();
}

export function clickCard(indx) { game.click(indx); }
export function startGame() { game.start(); }
export function initCard(callback) {
    if (!game.setValue) game.setValue = [];
    game.setValue.push(callback);
}
export function saveGame() {
    game.save();
}