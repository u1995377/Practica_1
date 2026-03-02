window.addEventListener('load', function() {
    var alies;

    // Botó Jugar: demana l'àlies i el mostra per consola
    document.getElementById('play').addEventListener('click', function(){
        alies = window.prompt("Introdueix el teu àlies de guerrer:", "Jugador1");
        
        if (alies != null && alies != "") {
            console.log("Àlies del jugador: " + alies);
            alert("Benvingut, " + alies + "!");
			window.location.assign("./html/game.html");
        } else {
            console.warn("No s'ha introduït cap àlies.");
        }
    });

    // Botó Opcions
    document.getElementById('options').addEventListener('click', function(){
        console.error("Opció no implementada");
        // Corregit: Canviem el fons del body com a exemple
        document.body.style.backgroundColor = "rgba(0, 200, 0, 0.2)";
    });

    // Botó Partides
    document.getElementById('saves').addEventListener('click', function(){
        console.error("Opció no implementada");
    });

    // Botó Sortir
    document.getElementById('exit').addEventListener('click', function(){
        console.warn("No es pot sortir del navegador!");
    });
});