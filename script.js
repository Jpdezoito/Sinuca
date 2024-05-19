document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const nomesButton = document.getElementById('nomes-button');
    const bolaButton = document.getElementById('bola-button');
    const suicidioButton = document.getElementById('suicidio-button');
    const numJogadoresInput = document.getElementById('num-jogadores');
    const jogadoresNomesDiv = document.getElementById('jogadores-nomes');
    const nomesInputsDiv = document.getElementById('nomes-inputs');
    const gameSectionDiv = document.getElementById('game-section');
    const jogadorVezP = document.getElementById('jogador-vez');
    const bolaInput = document.getElementById('bola-input');
    const suicidioInput = document.getElementById('suicidio-input');
    const infoTextDiv = document.getElementById('info-text');

    let jogadores = [];
    let ordemJogadores = [];
    let jogadorAtualIndex = 0;
    let bolasPorJogador = {};
    let bolasNeutras = [];
    let bolasReveladas = {};
    let bolasCaidas = {};
    let jogadoresSuicidados = new Set();

    startButton.addEventListener('click', () => {
        const numJogadores = parseInt(numJogadoresInput.value);
        if (numJogadores > 0) {
            jogadoresNomesDiv.classList.remove('hidden');
            nomesInputsDiv.innerHTML = '';
            for (let i = 0; i < numJogadores; i++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `Nome do jogador ${i + 1}`;
                nomesInputsDiv.appendChild(input);
            }
        }
    });

    nomesButton.addEventListener('click', () => {
        jogadores = Array.from(nomesInputsDiv.querySelectorAll('input')).map(input => input.value.trim()).filter(nome => nome);
        if (jogadores.length > 0) {
            iniciarJogo();
            jogadoresNomesDiv.classList.add('hidden');
            gameSectionDiv.classList.remove('hidden');
            atualizarJogadorVez();
        }
    });

    bolaButton.addEventListener('click', () => {
        const bolaDerrubada = parseInt(bolaInput.value);
        const jogador = ordemJogadores[jogadorAtualIndex];
        if (bolaDerrubada >= 0 && bolaDerrubada <= 15 && !bolasReveladas[jogador].includes(bolaDerrubada)) {
            if (bolaDerrubada === 0) {
                avancarJogador();
            } else {
                registrarBolaDerrubada(jogador, bolaDerrubada);
                mostrarBolas();
            }
        } else {
            alert("Erro de digitação. Por favor, informe um número de 1 a 15 ou 0 para nenhuma.");
        }
    });

    suicidioButton.addEventListener('click', () => {
        const suicidio = suicidioInput.value.trim().toLowerCase();
        const jogador = ordemJogadores[jogadorAtualIndex];
        if (suicidio === 's') {
            jogadoresSuicidados.add(jogador);
            infoTextDiv.textContent += `${jogador} cometeu um 'suicídio' e ficará fora da próxima rodada.\n`;
        }
        avancarJogador();
    });

    function iniciarJogo() {
        ordemJogadores = [...jogadores];
        randomizeArray(ordemJogadores);
        [bolasPorJogador, bolasNeutras] = distribuirBolasIgualmente(jogadores);
        bolasReveladas = { 'neutras': [], ...jogadores.reduce((acc, jogador) => ({ ...acc, [jogador]: [] }), {}) };
        bolasCaidas = {};
        jogadoresSuicidados.clear();
        mostrarBolas();
    }

    function randomizeArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function distribuirBolasIgualmente(jogadores) {
        const maxBolas = 15 / jogadores.length;
        const bolas = Array.from({ length: 15 }, (_, i) => i + 1);
        randomizeArray(bolas);
        const bolasPorJogador = {};
        jogadores.forEach((jogador, i) => {
            bolasPorJogador[jogador] = bolas.slice(i * maxBolas, (i + 1) * maxBolas);
        });
        const bolasNeutras = bolas.slice(jogadores.length * maxBolas);
        return [bolasPorJogador, bolasNeutras];
    }

    function registrarBolaDerrubada(jogador, bola) {
        if (bolasNeutras.includes(bola)) {
            bolasNeutras.splice(bolasNeutras.indexOf(bola), 1);
            bolasReveladas['neutras'].push(bola);
        } else {
            for (const [adversario, bolas] of Object.entries(bolasPorJogador)) {
                if (bolas.includes(bola)) {
                    bolas.splice(bolas.indexOf(bola), 1);
                    bolasReveladas[adversario].push(bola);
                    if (!bolasCaidas[adversario]) {
                        bolasCaidas[adversario] = [];
                    }
                    bolasCaidas[adversario].push(bola);
                    break;
                }
            }
        }
    }

    function mostrarBolas() {
        let infoText = '';
        for (const jogador of jogadores) {
            const bolasJogador = bolasPorJogador[jogador].map(bola => bolasReveladas[jogador].includes(bola) ? bola : '*');
            const bolasCaidasJogador = bolasCaidas[jogador] || [];
            infoText += `Jogador: ${jogador} - Bolas: ${bolasJogador.join(', ')}      Bolas caídas: ${bolasCaidasJogador.join(', ')}\n`;
        }
        const bolasNeutrasOcultas = bolasNeutras.map(bola => bolasReveladas['neutras'].includes(bola) ? bola : '*');
        infoText += `Bolas neutras: ${bolasNeutrasOcultas.join(', ')}\n`;
        infoTextDiv.textContent = infoText;
    }

    function atualizarJogadorVez() {
        const jogador = ordemJogadores[jogadorAtualIndex];
        jogadorVezP.textContent = `Vez do jogador: ${jogador}`;
    }

    function avancarJogador() {
        jogadorAtualIndex = (jogadorAtualIndex + 1) % ordemJogadores.length;
        if (jogadoresSuicidados.has(ordemJogadores[jogadorAtualIndex])) {
            infoTextDiv.textContent += `${ordemJogadores[jogadorAtualIndex]} está fora desta rodada por ter cometido um 'suicídio'.\n`;
            jogadoresSuicidados.delete(ordemJogadores[jogadorAtualIndex]);
            avancarJogador();
        } else {
            atualizarJogadorVez();
        }
    }
});
