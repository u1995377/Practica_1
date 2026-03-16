import {$} from "../library/jquery-4.0.0.slim.module.min.js";

$('#gamemode1').on('click', function(){
    location.assign("./game.html");
});

$('#gamemode2').on('click', function(){
    location.assign("../");
});