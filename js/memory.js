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
    score: 0,
    lives: 3,
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
        if (this.mode === "infinite") this.score += (this.level * 50);

        if (this.pairs < 15) this.pairs++; 
        if (this.level % 3 === 0 && this.groupSize < 3) {
            this.groupSize++;
            this.pairs = Math.max(3, this.pairs - 2); 
        }
        this.visualTime = Math.max(200, this.visualTime - 100);
    },

    // FUNCIÓ DE GUARDAT LOCAL
    save: function() {
        let estatAConservar = {
            items: this.items,
            states: this.states,
            score: this.score,
            lives: this.lives,
            pairs: this.pairs,
            groupSize: this.groupSize,
            mode: this.mode,
            level: this.level,
            visualTime: this.visualTime,
            initialized: true
        };
        localStorage.setItem('memory_save_game', JSON.stringify(estatAConservar));
        alert("Partida guardada a sobre de l'anterior!");
    },

    select: function() {
        this.setValue = []; 
        
        // SISTEMA DE CÀRREGA
        if (sessionStorage.getItem('load')) {
            let toLoad = JSON.parse(sessionStorage.getItem('load'));
            // Substituïm totes les propietats de 'game' per les guardades
            Object.assign(this, toLoad);
            sessionStorage.removeItem('load'); // Netegem després de carregar
        } else {
            // Inicialització normal si no hi ha càrrega
            if (!this.initialized) {
                const modeLlegit = sessionStorage.getItem('gameMode');
                this.mode = modeLlegit === "infinite" ? "infinite" : "normal";
                this.initialized = true; 
            }

            if (this.mode === "normal") {
                this.groupSize = parseInt(sessionStorage.getItem('groupSize')) || 2;
                this.pairs = parseInt(sessionStorage.getItem('pairs')) || 2;
                this.score = 200; 
            } else if (this.level === 1) {
                this.pairs = 2;
                this.groupSize = 2;
                this.score = 0;
                this.lives = 3;
            }

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
            this.pairs = Math.min(this.pairs, modelsDisponibles.length); 

            let tauler = [];
            modelsDisponibles.slice(0, this.pairs).forEach(model => {
                for (let i = 0; i < this.groupSize; i++) {
                    tauler.push({ ...model });
                }
            });

            this.items = tauler;
            shuffle(this.items);
            this.states = new Array(this.items.length).fill(StateCard.DISABLE);
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
            if (this.mode === "infinite") this.score += (10 * this.groupSize);

            if (cartesRestants === 0) {
                setTimeout(() => {
                    if (this.mode === "infinite") {
                        alert(`Nivell ${this.level} superat!`);
                        this.upgradeDifficulty();
                        this.select();
                        if (this.onLevelUp) this.onLevelUp(); 
                        this.start();
                    } else {
                        alert(`Has guanyat!`);
                        window.location.assign("../");
                    }
                }, 500);
            }
        } else {
            this.ready = 0;
            setTimeout(() => {
                this.selectedCards.forEach(i => this.goBack(i));
                
                if (this.mode === "infinite") {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.manageGameOver();
                        return;
                    }
                } else {
                    this.score -= this.penalty;
                    if (this.score <= 0) {
                        alert("Has mort!");
                        window.location.assign("../");
                    }
                }
                this.selectedCards = [];
                this.ready = this.items.length;
            }, 700);
        }
    },

    manageGameOver: function() {
        let finalScore = this.score;
        let nomFinal = localStorage.getItem('player_name') || "Anònim";

        let ranking = JSON.parse(localStorage.getItem('memory_ranking')) || [];
        ranking.push({ name: nomFinal, score: finalScore });
        ranking.sort((a, b) => b.score - a.score);
        ranking = ranking.slice(0, 5); 
        
        localStorage.setItem('memory_ranking', JSON.stringify(ranking));
        alert(`FI DEL JOC!\nJugador: ${nomFinal}\nPuntuació: ${finalScore}`);
        window.location.assign("../index.html");
    }
};

function shuffle(arr) {
    arr.sort(() => Math.random() - 0.5);
}

export function selectCards() { game.select(); }
export function clickCard(indx) { game.click(indx); }
export function startGame() { game.start(); }
export function initCard(callback) {
    if (!game.setValue) game.setValue = [];
    game.setValue.push(callback);
}
export function saveGame() { game.save(); } // EXPORTEM EL GUARDAT
export function setLevelUpCallback(cb) { game.onLevelUp = cb; }
window.debugGame = game;
window.debugGame = game;