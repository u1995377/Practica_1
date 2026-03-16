import {$} from "../library/jquery-4.0.0.slim.module.min.js";
import {clickCard, gameItems, selectCards, startGame, initCard, saveGame} from "./memory.js";

var game = $('#game');

selectCards();
gameItems.forEach(function (value, idx)
{
	game.append(`<img id="${idx}" class="card" title="card">`); 
    let card = $(`#${idx}`);
    card.on('click', function(){
        clickCard(idx);
    });
    card.attr('src', value);
    initCard(val => card.attr('src', val));
});
startGame();
$('#save').on('click', ()=>saveGame());