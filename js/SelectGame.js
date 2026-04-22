// 1. Posem un log ABANS de l'import per veure si el fitxer respira
console.log("Iniciant càrrega de SelectGame.js...");

// 2. Intentem l'import (REVISA MOLT BÉ AQUESTA RUTA)
import {$} from "../library/jquery-4.0.0.slim.module.min.js";

// 3. Si l'import falla, aquest log NO sortirà mai
console.log("JQuery importat correctament!");

$(document).ready(function() {
    console.log("DOM preparat");
    
    function prepareGame(mode) {
        const groupSize = $('#group').val();
        sessionStorage.setItem('mode', mode);
        sessionStorage.setItem('groupSize', groupSize);
        // Intentem anar directament al fitxer
        window.location.href = "canvasgame.html";
    }

    $('#gamemode1').on('click', () => prepareGame('1'));
    $('#gamemode2').on('click', () => prepareGame('2'));
});