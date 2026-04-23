import {$} from "../library/jquery-4.0.0.slim.module.min.js";
import {clickCard, gameItems, selectCards, startGame, initCard, saveGame, gameStates, setLevelUpCallback} from "./memory.js";

// --- CONFIGURACIÓ I VARIABLES ---
const Shape = { CIRCLE: 'c', SQUARE: 's', TRIANGLE: 't' };
let game = $('#game');
let canvas = game[0].getContext('2d');
let cards = []; 
let cardImages = []; 
let backImage;   

const e_click = {click: false, x: -1, y: -1};
let key = null;
const c_w = 96;
const c_h = 128;
let idxSel = -1;

const SVG_W = 100;
const SVG_H = 140;

// --- INICIALITZACIÓ ---
if (canvas){
    game.attr("width", 1000);
    game.attr("height", 1000);
    
    // 1. Preparem les dades del joc
    selectCards(); 
    
    // 2. CONFIGURACIÓ DEL CALLBACK DE NIVELL (MOLT IMPORTANT)
    setLevelUpCallback(async () => {
        console.log("Pujant de nivell: regenerant gràfics...");
        
        // Esperem que les noves imatges es generin segons el nou gameItems
        await initGameGraphics();
        
        // Recalculem les posicions de les cartes al canvas
        setupCards();
        
        idxSel = -1; 
        console.log("Tauler llest amb " + gameItems.length + " cartes.");
    });

    // 3. Càrrega inicial
    initGameGraphics().then(() => {
        setupCards(); 
        startGame();  
        update();     
    });
}

// --- GENERADOR DE GRÀFICS ---

async function initGameGraphics() {
    // Generem la imatge de la part del darrere
    backImage = await createSVGImage({shape: 'pattern', color: '#444'}, SVG_W, SVG_H);
    
    // Mapegem gameItems (que ja ha estat actualitzat per memory.js) a noves imatges
    cardImages = await Promise.all(
        gameItems.map(config => createSVGImage(config, SVG_W, SVG_H))
    );
}

function createSVGImage(config, width, height) {
    return new Promise((resolve) => {
        const svgCode = generateSVGCode(config, width, height);
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => console.error("Error carregant SVG:", config, err);
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgCode);
    });
}

function generateSVGCode(config, width, height) {
    const { shape, color } = config;
    const strokeWidth = 5;
    const padding = 15;
    const drawW = width - (padding * 2);
    const drawH = height - (padding * 2);
    const centerX = width / 2;
    const centerY = height / 2;

    let svgElement = '';
    if (shape === 'c') { 
        const radius = Math.min(drawW, drawH) / 2;
        svgElement = `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${color}" stroke="black" stroke-width="${strokeWidth}" />`;
    } else if (shape === 's') { 
        svgElement = `<rect x="${padding}" y="${padding}" width="${drawW}" height="${drawH}" fill="${color}" stroke="black" stroke-width="${strokeWidth}" rx="10" />`;
    } else if (shape === 't') { 
        const points = `${centerX},${padding} ${width-padding},${height-padding} ${padding},${height-padding}`;
        svgElement = `<polygon points="${points}" fill="${color}" stroke="black" stroke-width="${strokeWidth}" />`;
    } else if (shape === 'pattern') {
        svgElement = `<rect width="100%" height="100%" fill="${color}" />
                      <circle cx="50" cy="70" r="30" fill="white" opacity="0.3" />`;
    }
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${svgElement}</svg>`;
}

// --- LÒGICA VISUAL ---

function setupCards() {
    const columnes = gameItems.length > 12 ? 8 : 6; 
    const margreX = 20;
    const margreY = 20;

    cards = gameItems.map((item, indx) => {
        let col = indx % columnes;
        let fila = Math.floor(indx / columnes);

        const xMin = margreX + (c_w + 10) * col;
        const yMin = margreY + (c_h + 10) * fila;

        // Important per registrar el callback de l'estat a memory.js
        initCard(() => { }); 

        return {
            position: { xMin, xMax: xMin + c_w, yMin, yMax: yMin + c_h },
            onClick: function(x, y) {
                return x >= this.position.xMin && x <= this.position.xMax &&
                       y >= this.position.yMin && y <= this.position.yMax;
            }
        };
    });

    game.off('click').on('click', function(e){
        const rect = this.getBoundingClientRect();
        e_click.click = true;
        e_click.x = e.clientX - rect.left;
        e_click.y = e.clientY - rect.top;
    });

    $(document).off('keydown').on('keydown', e => key = e.key);
}

function draw() {
    // Afegim una seguretat: si cardImages encara no s'ha sincronitzat amb gameItems, esperem
    if (!backImage || cardImages.length !== gameItems.length) return;
    
    canvas.clearRect(0, 0, game.attr("width"), game.attr("height"));
    
    cards.forEach((card, i) => {
        const x = card.position.xMin;
        const y = card.position.yMin;
        const state = gameStates[i];

        if (state === 1) { // ENABLE (Darrere)
            canvas.drawImage(backImage, x, y, c_w, c_h);
        } else { // DISABLE o DONE (Davant)
            if (cardImages[i]) {
                canvas.drawImage(cardImages[i], x, y, c_w, c_h);
            }
        }

        if (i === idxSel) {
            canvas.strokeStyle = "yellow";
            canvas.lineWidth = 3;
            canvas.strokeRect(x - 2, y - 2, c_w + 4, c_h + 4);
        }
    });
}

function update(){
    checkInput();
    draw();
    requestAnimationFrame(update);
}

function checkInput(){
    if (e_click.click){
        cards.some((card, indx)=>{
            let click = card.onClick(e_click.x, e_click.y);
            if (click) clickCard(indx);
            return click;
        });
        e_click.click = false;
    }
    if (key){
        switch(key){
            case "Escape": saveGame(); break;
            case "ArrowRight": idxSel = (idxSel + 1) % cards.length; break;
            case "ArrowLeft": idxSel = (idxSel - 1 + cards.length) % cards.length; break;
            case "Enter": if (idxSel >= 0) clickCard(idxSel); break;
        }
        key = false;
    }
}