import {$} from "../library/jquery-4.0.0.slim.module.min.js";

function prepareGame(modeSeleccionat){
    // Netegem rastres de partides anteriors
    sessionStorage.clear();
    
    // 1. Llegim el que l'usuari va decidir a Options
    let userOptions = { pairs: 2, difficulty: 'normal' }; 
    if (localStorage.options) {
        userOptions = JSON.parse(localStorage.options);
    }

    // 2. Agafem el groupSize
    const groupSize = $('#group').val();

    // 3. MAPEJAT DE MODES: Convertim '1'/'2' als noms que entén memory.js
    const gameMode = (modeSeleccionat === '2') ? 'infinite' : 'normal';

    // 4. Guardem amb els noms EXACTES que espera memory.js
    sessionStorage.setItem('gameMode', gameMode); 
    sessionStorage.setItem('groupSize', groupSize);
    sessionStorage.setItem('pairs', userOptions.pairs);
    
    console.log("Configurant joc:", {gameMode, groupSize, pairs: userOptions.pairs});

    window.location.assign("./canvasgame.html");
}

$(document).ready(function() {
    console.log("JQuery a punt, vinculant botons...");

    $('#gamemode1').on('click', function() {
        prepareGame('1');
    });

    $('#gamemode2').on('click', function() {
        prepareGame('2');
    });
});