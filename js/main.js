import {$} from "../library/jquery-4.0.0.slim.module.min.js";

var alies;
var color1;
var color2;
var color3;
var color4;

//Crear elements
var body = $('body');
body.append('<h1 id="title">Menú</h1>');
body.append('<button id="play" class="center"> Jugar </button>');
body.append('<button id="options" class="center"> Opcions </button>');
body.append('<button id="saves" class="center"> Partides </button>');
body.append('<button id="exit" class="center"> Sortir </button>');

//Obtenir elements
var play = $('#play');
var options = $('#options');
var saves = $('#saves');
var exit = $('#exit');

//Fer els clics
play.on('click', function(){
	sessionStorage.removeItem('load');
	alies = window.prompt("Introdueix el teu àlies de jugador:", "Jugador1");
        if (alies != null && alies != "") {
            console.log("Àlies del jugador: " + alies);
            alert("Benvingut, " + alies + "!");
			window.location.assign("./html/game.html");
        } else {
            console.warn("No s'ha introduït cap àlies.");
        }
});

options.on('click', function(){
        // Corregit: Canviem el fons del body com a exemple
		color1 = random_colors();
		color2 = random_colors();
		color3 = random_colors();
		color4 = random_colors();
        document.body.style.backgroundColor = `rgba(${color1}, ${color2}, ${color3}, ${color4})`;
});

saves.on('click', function(){
	let to_load = localStorage.save;
        fetch('../php/load.php', {
            method: "POST",
            body: JSON.stringify({}),
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json())
        .then(json => to_load = (!json.error)?JSON.stringify(json.save): localStorage.save)
        .catch (err => {
            console.error(err);
            console.warn("La partida s'intentarà carregar de local");
        });

        if (!to_load) {
            alert("No hi ha cap partida a carregar");
            return;
        }
        sessionStorage.load = to_load;
        window.location.assign("./html/game.html");
});

exit.on('click',function(){
	console.warn("No es pot sortir del navegador!");
});

function random_colors(){return Math.random() * 0.314159265359}


