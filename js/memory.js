const Shape = Object.freeze({ CIRCLE: 'c', SQUARE: 's', TRIANGLE: 't' });
const Color = Object.freeze({ BLUE: 'b', RED: 'r', GREEN: 'g', YELLOW: 'y' });

export var gameStates;
export var gameItems;

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
    mode: "normal", 
    level: 1,
    visualTime: 1000,
    penalty: 25,
    initialized: false,
    onLevelUp: null,

    goBack: function(idx) {
        if (this.setValue && this.setValue[idx]) this.setValue[idx]();
        this.states[idx] = StateCard.ENABLE;
    },

    goFront: function(idx) {
        if (this.setValue && this.setValue[idx]) this.setValue[idx]();
        this.states[idx] = StateCard.DISABLE;
    },

    upgradeDifficulty: function() {
		this.level++;
		
		// Pugem el número de parelles (o grups)
		// Posem un límit de 15 grups per no saturar el canvas
		if (this.pairs < 15) {
			this.pairs++; 
		}

		// Cada 3 nivells, si encara som en parelles, podem pujar a trios (opcional)
		if (this.level % 3 === 0 && this.groupSize < 3) {
			// Si pugem el groupSize, baixem una mica les pairs perquè no hi hagi massa cartes de cop
			this.groupSize++;
			this.pairs = Math.max(3, this.pairs - 2); 
		}

		this.visualTime = Math.max(200, this.visualTime - 100);
		this.score += 100;
		
		console.log(`--- NIVELL ${this.level} ---`);
		console.log(`Pairs: ${this.pairs}, GroupSize: ${this.groupSize}`);
	},

    select: function() {
		this.setValue = []; 

		if (!this.initialized) {
			const modeLlegit = sessionStorage.getItem('gameMode');
			this.mode = modeLlegit === "infinite" ? "infinite" : "normal";
			this.initialized = true; 
		}

		if (sessionStorage.load) {
			// ... (codi de càrrega igual)
		} else {
			if (this.mode === "normal") {
				this.groupSize = parseInt(sessionStorage.getItem('groupSize')) || 2;
				this.pairs = parseInt(sessionStorage.getItem('pairs')) || 2;
			} else if (this.level === 1) {
				this.pairs = 2;
				this.groupSize = 2;
				this.score = 500;
			}

			// Llista de models (assegura't que n'hi hagi prou!)
			const modelsDisponibles = [
				{ shape: 'c', color: '#3498db' }, { shape: 'c', color: '#e74c3c' },
				{ shape: 's', color: '#2ecc71' }, { shape: 's', color: '#f1c40f' },
				{ shape: 't', color: '#9b59b6' }, { shape: 't', color: '#e67e22' },
				{ shape: 'c', color: '#1abc9c' }, { shape: 's', color: '#34495e' },
				{ shape: 't', color: '#d35400' }, { shape: 's', color: '#7f8c8d' },
				{ shape: 'c', color: '#ff00ff' }, { shape: 's', color: '#00ffff' },
				{ shape: 't', color: '#ffffff' }, { shape: 'c', color: '#000000' }
			];

			shuffle(modelsDisponibles);
			
			// IMPORTANT: Calcula quantes parelles realment caben
			let nPairsReals = Math.min(this.pairs, modelsDisponibles.length);
			
			// Forcem que this.pairs reflecteixi el que realment dibuixarem
			this.pairs = nPairsReals; 

			let seleccionats = modelsDisponibles.slice(0, this.pairs);
			let tauler = [];

			seleccionats.forEach(model => {
				for (let i = 0; i < this.groupSize; i++) {
					tauler.push({ ...model });
				}
			});

			this.items = tauler;
			shuffle(this.items);
			this.states = new Array(this.items.length).fill(StateCard.DISABLE);
			
			console.log("Tauler generat amb items:", this.items.length);
		}
		gameStates = this.states;
		gameItems = this.items;
	},

    start: function() {
        this.ready = 0;
        this.items.forEach((_, indx) => {
            if (this.states[indx] === StateCard.DONE) {
                this.ready++;
            } else {
                setTimeout(() => {
                    this.goBack(indx);
                    this.ready++;
                }, this.visualTime + (80 * indx));
            }
        });
    },

    click: function(indx) {
		if (this.states[indx] !== StateCard.ENABLE || this.ready < this.items.length) return;
		if (this.selectedCards.includes(indx)) return;

		this.goFront(indx);
		this.selectedCards.push(indx);

		if (this.selectedCards.length < this.groupSize) return;

		let primeraCarta = this.items[this.selectedCards[0]];
		let match = this.selectedCards.every(idx => {
			return this.items[idx].shape === primeraCarta.shape && 
				   this.items[idx].color === primeraCarta.color;
		});

		if (match) {
			this.selectedCards.forEach(i => this.states[i] = StateCard.DONE);
			const cartesRestants = this.states.filter(s => s !== StateCard.DONE).length;
			this.selectedCards = [];
			
			if (cartesRestants === 0) {
				// USAR => AQUÍ TAMBÉ PER SEGURETAT
				setTimeout(() => {
					if (this.mode === "infinite") {
						alert(`Nivell ${this.level} superat!`);
						this.upgradeDifficulty();
						this.select();
						if (this.onLevelUp) this.onLevelUp(); 
						this.start();
					} else {
						alert(`Has guanyat amb ${this.score} punts!`);
						window.location.assign("../");
					}
				}, 500);
			}
		} else {
			this.ready = 0;
			// CANVI CRÍTIC: Passem de function() a () =>
			setTimeout(() => {
				// Ara 'this' sí que es refereix al 'game'
				this.selectedCards.forEach(i => this.goBack(i));
				
				console.log("Punts abans:", this.score);
				this.score -= this.penalty; 
				console.log("Punts després:", this.score);

				this.selectedCards = [];
				this.ready = this.items.length;

				if (this.score <= 0) {
					alert(`Has mort al nivell ${this.level}.`);
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
            level: this.level,
            mode: this.mode
        });
        localStorage.save = to_save;
        window.location.assign("../");
    }
}; // Tanquem l'objecte game correctament

// Funció shuffle corregida (estava mal escrita com a "shuffe")
function shuffle(arr) {
    arr.sort(() => Math.random() - 0.5);
}

// Exportacions de les funcions per al canvasgame.js
export function selectCards() { game.select(); }
export function clickCard(indx) { game.click(indx); }
export function startGame() { game.start(); }
export function initCard(callback) {
    if (!game.setValue) game.setValue = [];
    game.setValue.push(callback);
}
export function saveGame() { game.save(); }
export function setLevelUpCallback(cb) { game.onLevelUp = cb; }
window.debugGame = game;