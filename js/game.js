import {$} from "../library/jquery-4.0.0.slim.module.min.js";
import {clickCard, items, selectCards, startGame} from "./memory.js";

var cards = [];
var game = $('#game');

selectCards();
items.forEach(function (value, idx)
{
    // Hem afegit class="card"
    game.append(`<img id="${idx}" class="card" title="card">`); 
    cards.push($(`#${idx}`));
    setValue(idx, value);
});

export function setValue(idx, value){
    cards[idx].attr('src', value);
}

export function clickOff(idx){
    cards[idx].off('click');
}

export function clickOn(idx){
    cards[idx].on('click', function(){
        clickCard(idx);
    });
}

startGame();