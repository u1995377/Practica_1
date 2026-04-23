import {$} from "../library/jquery-4.0.0.slim.module.min.js";
import {clickCard, gameItems, selectCards, startGame, initCard, saveGame, gameStates} from "./memory.js";

const Shape = { CIRCLE: 'c', SQUARE: 's', TRIANGLE: 't' };

let game = $('#game');
let canvas = game[0].getContext('2d');
let cards = []; 
let cardImages = []; 
let backImage;   

const e_click = {click: false, x: -1, y: -1}
let key = null;
const c_w = 96;
const c_h = 128;
let idxSel = -1;

const SVG_W = 100;
const SVG_H = 140;

if (canvas){
    game.attr("width", 800);
    game.attr("height", 600);
    
    selectCards(); 
    
    initGameGraphics().then(() => {
        setupCards(); 
        startGame();  
        update();     
    });
}

// --- GENERADOR SVG ---

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
    } 
    else if (shape === 's') { 
        svgElement = `<rect x="${padding}" y="${padding}" width="${drawW}" height="${drawH}" fill="${color}" stroke="black" stroke-width="${strokeWidth}" rx="10" />`;
    } 
    else if (shape === 't') { 
        const points = `${centerX},${padding} ${width-padding},${height-padding} ${padding},${height-padding}`;
        svgElement = `<polygon points="${points}" fill="${color}" stroke="black" stroke-width="${strokeWidth}" />`;
    }
    else if (shape === 'pattern') {
        // Assegura't que el color del patró sigui visible
        svgElement = `<rect width="100%" height="100%" fill="${color}" />
                      <circle cx="50" cy="70" r="30" fill="white" opacity="0.3" />`;
    }

    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${svgElement}</svg>`;
}

function createSVGImage(config, width, height) {
    return new Promise((resolve) => {
        const svgCode = generateSVGCode(config, width, height);
        
        // CORRECCIÓ: encodeURIComponent és més segur per a dades inline sense Base64 si no hi ha caràcters rars
        // Però per assegurar-nos que el navegador ho llegeix com a imatge:
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => console.error("Error carregant SVG:", config, err);
        
        // Fem servir la codificació directa que sol donar menys problemes de "imatge negra"
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgCode);
    });
}

async function initGameGraphics() {
    backImage = await createSVGImage({shape: 'pattern', color: '#444'}, SVG_W, SVG_H);
    cardImages = await Promise.all(
        gameItems.map(config => createSVGImage(config, SVG_W, SVG_H))
    );
}

// --- LOGICA DE JOC ---

function setupCards() {
    const columnes = 6;
    const margreX = 20;
    const margreY = 20;

    cards = gameItems.map((item, indx) => {
        let col = indx % columnes;
        let fila = Math.floor(indx / columnes);

        const xMin = margreX + (c_w + 10) * col;
        const yMin = margreY + (c_h + 10) * fila;

        initCard(() => { });

        return {
            position: {
                xMin: xMin,
                xMax: xMin + c_w,
                yMin: yMin,
                yMax: yMin + c_h
            },
            onClick: function(x, y) {
                return x >= this.position.xMin && x <= this.position.xMax &&
                       y >= this.position.yMin && y <= this.position.yMax;
            }
        };
    });

    // CORRECCIÓ CLIC: Detectar la posició real dins del canvas
    game.off('click').on('click', function(e){
        const rect = this.getBoundingClientRect();
        e_click.click = true;
        e_click.x = e.clientX - rect.left;
        e_click.y = e.clientY - rect.top;
    });

    $(document).off('keydown').on('keydown', e => key = e.key);
}

function draw() {
    if (!backImage || cardImages.length === 0) return;
    
    canvas.clearRect(0, 0, game.attr("width"), game.attr("height"));
    
    cards.forEach((card, i) => {
        const x = card.position.xMin;
        const y = card.position.yMin;
        const state = gameStates[i];

        if (state === 1) { // ENABLE (Darrere)
            canvas.drawImage(backImage, x, y, c_w, c_h);
        } else { // DISABLE o DONE (Davant)
            canvas.drawImage(cardImages[i], x, y, c_w, c_h);
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
    }
    if (key){
        let prevIndx = idxSel;
        switch(key){
            case "Escape": saveGame(); break;
            case "ArrowRight": idxSel = (idxSel + 1) % cards.length; break;
            case "ArrowLeft": idxSel = (idxSel - 1 + cards.length) % cards.length; break;
            case "Enter": if (idxSel >= 0) clickCard(idxSel); break;
        }
        key = false; // Reset de la tecla
    }
    e_click.click = false;
}