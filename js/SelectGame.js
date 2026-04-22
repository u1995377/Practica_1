import {$} from "../library/jquery-4.0.0.slim.module.min.js";

function prepareGame(mode){
    sessionStorage.removeItem('load');
    
    // 1. Llegim el que l'usuari va decidir a Options
    let userOptions = { pairs: 2, difficulty: 'normal' }; // Valors per defecte
    if (localStorage.options) {
        userOptions = JSON.parse(localStorage.options);
    }

    // 2. Agafem el groupSize (parelles, trios...) del selector de la pantalla actual
    const groupSize = $('#group').val();

    // 3. Passem tota la configuració al sessionStorage pel joc
    sessionStorage.setItem('mode', mode);
    sessionStorage.setItem('groupSize', groupSize);
    sessionStorage.setItem('pairs', userOptions.pairs); // <--- AQUÍ USEM LES OPCIONS
    sessionStorage.setItem('difficulty', userOptions.difficulty);

    window.location.assign("./canvasgame.html");
}

$(document).ready(function() {
    console.log("JQuery a punt, vinculant botons...");

    $('#gamemode1').on('click', function() {
        console.log("Has clicat el Mode 1");
        prepareGame('1');
    });

    $('#gamemode2').on('click', function() {
        console.log("Has clicat el Mode 2");
        prepareGame('2');
    });
});