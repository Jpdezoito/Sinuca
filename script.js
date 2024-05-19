document.addEventListener('DOMContentLoaded', () => {
    const numJogadoresInput = document.getElementById('num-jogadores');
    const jogadoresNomesDiv = document.getElementById('jogadores-nomes');
    const iniciarJogoButton = document.getElementById('iniciar-jogo');
    const jogoInfoDiv = document.getElementById('jogo-info');
    const infoTextDiv = document.getElementById('info-text');
    const bolaDerrubadaInput = document.getElementById('bola-derrubada');
    const suicidioInput = document.getElementById('suicidio');
    const enviarBolaButton = document.getElementById('enviar-bola');

    let jogadores = [];
    let bolasPorJogador = {};
    let bolasNeutras = [];
    let bolasReveladas = {};
    let bolasCaidas = {};
    let jogadoresSuicidados = new Set();
    let ordemJogadores = [];

    numJogadoresInput.addEventListener('input', () => {
        const numJogadores = parseInt(numJogadoresInput.value);
        jogadoresNomesDiv.innerHTML = '';
        for (let i = 0; i < numJogadores; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Nome do Jogador ${i + 1}`;
            input.id = `jogador-${i + 1}`;
            jogadoresNomesDiv.appendChild(input);
        }
    });

    iniciarJogoButton.addEventListener('click', () => {
        const numJogadores = parseInt(numJogadoresInput.value);
        jogadores = [];
        for (let i = 0; i < numJogadores; i++) {
            const nome = document.getElementById(`jogador-${i + 1}`).value;
            jogadores.push(nome);
        }
        [bolasPorJogador, bolasNeutras] = distribuirBolasIgualmente(jogadores);
        ordemJogadores = [...jogadores];
        shuffle(ordemJogadores);
        bolasReveladas = jogadores.reduce((acc, jogador) => ({ ...acc, [jogador]: [] }), {});
        bolasReveladas['neutras'] = [];
        bolasCaidas = {};
        jogadoresSuicidados = new Set();
        jogoInfoDiv.classList.remove('hidden');
        mostrarBolas();
    });

    enviarBolaButton.addEventListener('click', () => {
        const bolaDerrubada = bolaDerrubadaInput.value;
        const suicidio = suicidioInput.value.toLowerCase();
        bolaDerrubadaInput.value = '';
        suicidioInput.value = '';

        if (ordemJogadores.length === 0) {
            infoTextDiv.textContent += 'Fim do jogo!\n';
            return;
        }

        const jogador = ordemJogadores[0];
        ordemJogadores.push(ordemJogadores.shift());

        if (bolaDerrubada === 'ER') {
            infoTextDiv.textContent += 'Erro de digitação. Por favor, informe um número de 1 a 15.\n';
            return;
        }

        if (!/^\d+$/.test(bolaDerrubada) || parseInt(bolaDerrubada) < 0 || parseInt(bolaDerrubada) > 15) {
            infoTextDiv.textContent += 'Erro de digitação. Por favor, informe um número de 1 a 15 ou 0 para nenhuma.\n';
            return;
        }

        const bola = parseInt(bolaDerrubada);

        if (bolasReveladas[jogador].includes(bola) || bolasReveladas['neutras'].includes(bola)) {
            infoTextDiv.textContent += 'Essa bola já caiu.\n';
            return;
        }

        if (bola > 0) {
            if (bolasNeutras.includes(bola)) {
                bolasNeutras = bolasNeutras.filter(b => b !== bola);
                bolasReveladas['neutras'].push(bola);
            } else {
                for (const adversario of jogadores) {
                    if (bolasPorJogador[adversario].includes(bola)) {
                        bolasPorJogador[adversario] = bolasPorJogador[adversario].filter(b => b !== bola);
                        bolasReveladas[adversario].push(bola);
                        bolasCaidas[adversario] = bolasCaidas[adversario] || [];
                        bolasCaidas[adversario].push(bola);
                        break;
                    }
                }
            }
        }

        if (suicidio === 's') {
            jogadoresSuicidados.add(jogador);
            infoTextDiv.textContent += `${jogador} cometeu um 'suicídio' e ficará fora da próxima rodada.\n`;
        }

        mostrarBolas();
        verificarVencedor();
    });

    function distribuirBolasIgualmente(jogadores) {
        const maxBolas = Math.floor(15 / jogadores.length);
        const bolas = Array.from({ length: 15 }, (_, i) => i + 1);
        shuffle(bolas);
        const bolasPorJogador = jogadores.reduce((acc, jogador, i) => {
            acc[jogador] = bolas.slice(i * maxBolas, (i + 1) * maxBolas);
            return acc;
        }, {});
        const bolasNeutras = bolas.slice(jogadores.length * maxBolas);
        return [bolasPorJogador, bolasNeutras];
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function mostrarBolas() {
        infoTextDiv.textContent = '';
        for (const jogador of jogadores) {
            const bolas = bolasPorJogador[jogador].map(bola => bolasReveladas[jogador].includes(bola) ? bola : '*').join(' ');
            const caidas = (bolasCaidas[jogador] || []).join(' ');
            infoTextDiv.textContent += `Jogador: ${jogador} - Bolas: ${bolas}      Bolas caídas: ${caidas}\n`;
        }
        const neutras = bolasNeutras.map(bola => bolasReveladas['neutras'].includes(bola) ? bola : '*').join(' ');
        infoTextDiv.textContent += `Bolas neutras: ${neutras}\n`;
    }

    function verificarVencedor() {
        const jogadoresAtivos = jogadores.filter(jogador => !jogadoresSuicidados.has(jogador));
        if (jogadoresAtivos.length === 1 && jogadoresSuicidados.size > 0) {
            const vencedor = jogadoresAtivos[0];
            infoTextDiv.textContent += `${vencedor} ganha a partida porque todos os outros jogadores se suicidaram.\n`;
            ordemJogadores = [];
        }
    }
});
