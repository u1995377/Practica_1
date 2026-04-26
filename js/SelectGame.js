import {$} from "../library/jquery-4.0.0.slim.module.min.js";

function prepareGame(modeSeleccionat){
    sessionStorage.clear();
    let userOptions = { pairs: 2, difficulty: 'normal' }; 
    if (localStorage.options) {
        userOptions = JSON.parse(localStorage.options);
    }
    const groupSize = $('#group').val();
    const gameMode = (modeSeleccionat === '2') ? 'infinite' : 'normal';
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