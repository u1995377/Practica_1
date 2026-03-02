import { jQuery } from '../library/jquery-4.0.0.slim.module.min.js';
import {setValue, clickOn, clickOff} from './game.js';
const resources = ['../resources/cb.png', '../resources/co.png',
                '../resources/sb.png', '../resources/so.png',
                '../resources/tb.png', '../resources/to.png'];
const back = '../resources/back.png';
export var items = [];

var game = {
    ready: 0,
    lastCard: null,
    score: 200,
    pairs: 2
}

function shuffe(arr){
    arr.sort(function () {return Math.random() - 0.5});
}

export function selectCards(){
    items = resources.slice();          // TODO: Copiem l'array resources
    shuffe(items);                      // Barregem les cartes
    items = items.slice(0, game.pairs); // TODO: Agafem N elements (Parelles de cartes)
    items = items.concat(items);        // TODO: Dupliquem l'array
    shuffe(items);                      // Barregem les cartes
}

export function startGame(){
    items.forEach(function(_,indx){
        setTimeout(function(){
            game.ready++;
            goBack(indx);
        }, 1000 + 100 * indx);
    });
}

export function clickCard(indx){
    if (game.ready < items.length) return;
    goFront(indx);
    if (game.lastCard === null) game.lastCard = indx; // Primera carta clicada
    else{ // Teníem carta prèvia
        if (items[game.lastCard] === items[indx]){
            game.pairs--;
            if (game.pairs <= 0){
                alert(`Has guanyat amb ${game.score} punts!!!!`);
                window.location.assign("../");
            }
        }
        else {
            goBack(indx);
            goBack(game.lastCard);
            game.score -= 25;
            if (game.score <= 0){
                alert ("Has perdut");
                window.location.assign("../");
            }
        }
        game.lastCard = null;
    }
}

function goBack(idx){
    setValue(idx, back);
    clickOn(idx);
}

function goFront(idx){
    setValue(idx, items[idx]);
    clickOff(idx);
}