const resources = ['../resources/cb.png', '../resources/co.png',
                '../resources/sb.png', '../resources/so.png',
                '../resources/tb.png', '../resources/to.png'];
const back = '../resources/back.png';

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
    goBack: function(idx){
        this.setValue && this.setValue[idx](back);
        this.states[idx] = StateCard.ENABLE;
    },
    goFront: function(idx){
        this.setValue && this.setValue[idx](this.items[idx]);
        this.states[idx] = StateCard.DISABLE;
    },
    select: function(){
        if (sessionStorage.load){ // Carreguem partida
            let toLoad = JSON.parse(sessionStorage.load);
            this.items = toLoad.items;
            this.states = toLoad.states;
            this.selectedCards = toLoad.lastCard || []; 
			this.groupSize = toLoad.groupSize || 2;
            this.score = toLoad.score;
            this.pairs = toLoad.pairs;
			this.groupSize = toLoad.groupSize;
        }
        else{ // Nova partida
			// 1. Llegim la configuració que ve de SelectGame
			this.groupSize = parseInt(sessionStorage.getItem('groupSize')) || 2;
			this.pairs = parseInt(sessionStorage.getItem('pairs')) || 2; 
			
			// 2. Preparem els models de cartes segons 'this.pairs'
			let modelsDisponibles = resources.slice(); // ['cb.png', 'co.png', etc.]
			shuffe(modelsDisponibles);
			
			// Agafem només la quantitat que el jugador ha demanat a options
			let seleccionats = modelsDisponibles.slice(0, this.pairs);

			// 3. Creem el tauler multiplicant cada model pel groupSize
			let tauler = [];
			seleccionats.forEach(model => {
				for (let i = 0; i < this.groupSize; i++) {
					tauler.push(model);
				}
			});

			this.items = tauler;
			shuffe(this.items);
			this.states = new Array(this.items.length).fill(StateCard.ENABLE);
		}
    },
    start: function(){
        this.items.forEach((_,indx)=>{
            if (this.states[indx] === StateCard.DISABLE ||
                this.states[indx] === StateCard.DONE){
                this.ready++;
            }
            else{
                setTimeout(()=>{
                    this.ready++;
                    this.goBack(indx);
                }, 1000 + 100 * indx);
            }
        });
    },
    click: function(indx){
        if (this.states[indx] !== StateCard.ENABLE || this.ready < this.items.length) return;
        // Dins de click(indx):
		this.goFront(indx);

		if (this.selectedCards.length === 0) {
			this.selectedCards.push(indx);
		} else {
			let primeraCartaIdx = this.selectedCards[0];
			if (this.items[indx] === this.items[primeraCartaIdx]) {
				// Són iguals, la guardem
				this.selectedCards.push(indx);
				
				// Està el grup complet?
				if (this.selectedCards.length === this.groupSize) {
					// ÈXIT: Marcar totes com a DONE i buidar array
					this.selectedCards.forEach(i => this.states[i] = StateCard.DONE);
					this.pairs--;
					this.selectedCards = [];
					if (this.pairs <= 0){
						alert(`Has guanyat amb ${this.score} punts!!!!`);
						window.location.assign("../");
					}
				}
			}
			else { 
				// ERROR: No són iguals
				this.ready = 0; // Bloquegem el clic perquè no es puguin girar més cartes durant el delay

				// Guardem la carta actual per girar-la també, ja que encara no és a l'array
				this.selectedCards.push(indx);

				// Donem mig segon perquè l'usuari vegi l'error
				setTimeout(() => {
					// 1. Fem goBack de TOTES les cartes que teníem seleccionades
					this.selectedCards.forEach(i => {
						this.goBack(i);
					});

					// 2. Restar punts
					this.score -= 25;
					if (this.score <= 0) {
						alert("Has perdut");
						window.location.assign("../");
					}

					// 3. Buidar array i desbloquejar el joc
					this.selectedCards = [];
					this.ready = this.items.length; 
				}, 500);
			}
		}
	},
    save: function(){
        let to_save = JSON.stringify({
            items: this.items,
            states: this.states,
            lastCard: this.selectedCards, 
			groupSize: this.groupSize,
            score: this.score,
            pairs: this.pairs,
        });
        let ret = false;
        fetch('../php/save.php', {
            method: "POST",
            body: to_save,
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => ret = JSON.parse(response))
        .catch (err => console.error(err));

        if (!ret) {
            console.warn("La partida s'ha guardat en local.");
            localStorage.save = to_save;
        }
        window.location.assign("../");
    },
}

function shuffe(arr){
    arr.sort(function () {return Math.random() - 0.5});
}

export var gameItems;
export function selectCards() { 
    game.select();
    gameItems = game.items;
}

export function clickCard(indx){ game.click(indx); }
export function startGame(){ game.start(); }
export function initCard(callback) { 
    if (!game.setValue) game.setValue = [];
    game.setValue.push(callback); 
}
export function saveGame(){
    game.save();
}