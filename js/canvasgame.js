import { $ } from "../library/jquery-4.0.0.slim.module.min.js";
import { 
    clickCard, gameItems, selectCards, startGame, 
    initCard, saveGame, gameStates, setLevelUpCallback 
} from "./memory.js";

// --- CONFIGURACIÓ I VARIABLES ---
let game = $('#game');
let canvas = game[0].getContext('2d');
let cards = []; 
let cardImages = []; 
let backImage;   

const e_click = { click: false, x: -1, y: -1 };
let key = null;
const c_w = 96;
const c_h = 128;
let idxSel = -1;

const SVG_W = 100;
const SVG_H = 140;

// --- INICIALITZACIÓ ---
if (canvas) {
    // 0. GENERACIÓ DINÀMICA DE BOTONS (Novetat)
    setupUI();

    // Ajustem el tamany del canvas
    game.attr("width", 1000);
    game.attr("height", 800);
    
    // 1. Preparem les dades del joc
    selectCards(); 
    
    // 2. CONFIGURACIÓ DEL CALLBACK DE NIVELL
    setLevelUpCallback(async () => {
        console.log("Pujant de nivell: regenerant gràfics...");
        await initGameGraphics(); 
        setupCards();             
        idxSel = -1;             
    });

    // 3. Càrrega inicial del joc
    initGameGraphics().then(() => {
        setupCards(); 
        startGame();  
        update();     
    });
}

// --- FUNCIÓ PER GENERAR ELS BOTONS AMB JQUERY ---
function setupUI() {
    // Creem un contenidor per als botons
    let uiContainer = $('<div id="ui-controls"></div>').css({
        'margin-bottom': '15px',
        'display': 'flex',
        'gap': '10px'
    });

    // Botó Guardar
    let btnSave = $('<button id="btnSave">💾 Guardar Partida (Esc)</button>').css({
        'padding': '10px 20px',
        'background-color': '#2ecc71',
        'color': 'white',
        'border': 'none',
        'border-radius': '5px',
        'cursor': 'pointer',
        'font-weight': 'bold',
        'font-family': 'sans-serif'
    });

    // Botó Sortir
    let btnExit = $('<button id="btnExit">🚪 Sortir al Menú</button>').css({
        'padding': '10px 20px',
        'background-color': '#e74c3c',
        'color': 'white',
        'border': 'none',
        'border-radius': '5px',
        'cursor': 'pointer',
        'font-weight': 'bold',
        'font-family': 'sans-serif'
    });

    // Injectem els botons abans del canvas
    uiContainer.append(btnSave).append(btnExit);
    game.before(uiContainer);

    // Accions dels botons
    btnSave.on('click', () => saveGame());
    btnExit.on('click', () => {
        if(confirm("Vols sortir al menú? El progrés no guardat es perdrà.")) {
            window.location.assign("../index.html");
        }
    });
}

// --- GENERADOR DE GRÀFICS (SVG a Imatge) ---
async function initGameGraphics() {
    backImage = await createSVGImage({ shape: 'pattern', color: '#444' }, SVG_W, SVG_H);
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
        const points = `${centerX},${padding} ${width - padding},${height - padding} ${padding},${height - padding}`;
        svgElement = `<polygon points="${points}" fill="${color}" stroke="black" stroke-width="${strokeWidth}" />`;
    } else if (shape === 'pattern') {
        svgElement = `<rect width="100%" height="100%" fill="${color}" />
                      <circle cx="50" cy="70" r="30" fill="white" opacity="0.3" />
                      <rect x="20" y="20" width="60" height="10" fill="white" opacity="0.1" rx="5"/>`;
    }
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${svgElement}</svg>`;
}

// --- LÒGICA VISUAL I EVENTS ---
function setupCards() {
    const columnes = gameItems.length > 12 ? 8 : 6; 
    const margreX = 50;
    const margreY = 50;

    cards = gameItems.map((item, indx) => {
        let col = indx % columnes;
        let fila = Math.floor(indx / columnes);

        const xMin = margreX + (c_w + 15) * col;
        const yMin = margreY + (c_h + 15) * fila;

        initCard(() => { }); 

        return {
            position: { xMin, xMax: xMin + c_w, yMin, yMax: yMin + c_h },
            onClick: function(x, y) {
                return x >= this.position.xMin && x <= this.position.xMax &&
                       y >= this.position.yMin && y <= this.position.yMax;
            }
        };
    });

    game.off('click').on('click', function(e) {
        const rect = this.getBoundingClientRect();
        e_click.click = true;
        e_click.x = e.clientX - rect.left;
        e_click.y = e.clientY - rect.top;
    });

    $(document).off('keydown').on('keydown', e => {
        key = e.key;
        if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }
    });
}

function draw() {
    if (!backImage || cardImages.length !== gameItems.length) return;
    canvas.clearRect(0, 0, game.attr("width"), game.attr("height"));
    
    cards.forEach((card, i) => {
        const x = card.position.xMin;
        const y = card.position.yMin;
        const state = gameStates[i];

        if (state === 1) { 
            canvas.drawImage(backImage, x, y, c_w, c_h);
        } else { 
            if (cardImages[i]) {
                canvas.drawImage(cardImages[i], x, y, c_w, c_h);
            }
        }

        if (i === idxSel) {
            canvas.strokeStyle = "#FFD700";
            canvas.lineWidth = 4;
            canvas.strokeRect(x - 3, y - 3, c_w + 6, c_h + 6);
        }
    });
}

function update() {
    checkInput();
    draw();
    requestAnimationFrame(update);
}

function checkInput() {
    if (e_click.click) {
        cards.some((card, indx) => {
            let click = card.onClick(e_click.x, e_click.y);
            if (click) clickCard(indx);
            return click;
        });
        e_click.click = false;
    }
    
    if (key) {
        switch(key) {
            case "Escape": saveGame(); break;
            case "ArrowRight": idxSel = (idxSel + 1) % cards.length; break;
            case "ArrowLeft": idxSel = (idxSel - 1 + cards.length) % cards.length; break;
            case "Enter": 
            case " ":
                if (idxSel >= 0) clickCard(idxSel); 
                break;
        }
        key = null;
    }
}