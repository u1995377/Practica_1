import {$} from "../library/jquery-4.0.0.slim.module.min.js";

function prepareGame(mode) {
    // 1. Netegem partides anteriors
    sessionStorage.removeItem('load');

    // 2. Agafem el valor directament (serà "2", "3" o "4")
    const groupSize = $('#group').val();

    // 3. Guardem a la sessió
    sessionStorage.setItem('mode', mode);
    sessionStorage.setItem('groupSize', groupSize);

    // 4. Anem al joc
    window.location.assign("./canvasgame.html");
}

$('#gamemode1').on('click', function() {
    prepareGame('1');
});

$('#gamemode2').on('click', function() {
    prepareGame('2');
});