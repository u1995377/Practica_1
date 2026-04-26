import {$} from "../library/jquery-4.0.0.slim.module.min.js";

var alies;

// Crear elements del menú
var body = $('body');
body.append('<h1 id="title">Menú</h1>');
body.append('<button id="play" class="center"> Jugar </button>');
body.append('<button id="options" class="center"> Opcions </button>');
body.append('<button id="saves" class="center"> Partides </button>');
body.append('<button id="exit" class="center"> Sortir </button>');

// --- SECCIÓ RÀNQUING ---
body.append('<div id="ranking-container" style="margin-top: 40px; text-align: center; font-family: Arial, sans-serif;"></div>');
var rankingContainer = $('#ranking-container');
rankingContainer.append('<h3>🏆 Top 5 Rànquing (Mode Infinit)</h3>');
rankingContainer.append('<table id="ranking-table" style="margin: 0 auto; border-collapse: collapse; width: 300px; background: #fff; color: #333; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"></table>');

var table = $('#ranking-table');
table.append('<thead style="background: #3498db; color: white;"><tr><th style="padding: 8px;">Nom</th><th style="padding: 8px;">Punts</th></tr></thead>');
table.append('<tbody id="ranking-body"></tbody>');

function drawRanking() {
    var rankingBody = $('#ranking-body');
    rankingBody.empty();
    var rankingData = JSON.parse(localStorage.getItem('memory_ranking')) || [];

    if (rankingData.length === 0) {
        rankingBody.append('<tr><td colspan="2" style="padding: 10px; color: #999;">Encara no hi ha records</td></tr>');
    } else {
        rankingData.forEach(function(item) {
            rankingBody.append(
                '<tr style="border-bottom: 1px solid #eee;">' +
                '<td style="padding: 10px; text-align: left;">' + item.name + '</td>' +
                '<td style="padding: 10px; text-align: right; font-weight: bold; color: #2ecc71;">' + item.score + '</td>' +
                '</tr>'
            );
        });
    }
}

drawRanking();

// --- LOGICA DELS BOTONS ---

$('#play').on('click', function(){
    sessionStorage.removeItem('load'); // Netejem si hi havia alguna càrrega prèvia
    alies = window.prompt("Introdueix el teu àlies de jugador:", "Jugador1");
    
    if (alies != null && alies != "") {
        localStorage.setItem('player_name', alies);
        window.location.assign("./html/SelectGame.html");
    }
});

$('#options').on('click', function(){
    window.location.assign("./html/options.html");
});

$('#saves').on('click', function(){
    // LLEGIR PARTIDA LOCAL
    let savedData = localStorage.getItem('memory_save_game');

    if (!savedData) {
        alert("No hi ha cap partida guardada en aquest navegador.");
        return;
    }

    // Preparem la càrrega per al fitxer memory.js
    sessionStorage.setItem('load', savedData);
    alert("Carregant partida guardada...");
    window.location.assign("./html/canvasgame.html");
});

$('#exit').on('click', function(){
    console.warn("No es pot sortir!");
});