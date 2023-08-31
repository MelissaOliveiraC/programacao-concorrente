// Nomes: Bárbara, Larissa, Melissa
const fs = require('fs');
const { performance } = require('perf_hooks');

// Array para armazenar as contagens de sequência
const seq = new Array(15).fill(0);

// Função para ler o arquivo de entrada e mapeia linha por linha do arquivo
function lerInput(caminho) {
    // Lê o conteúdo do arquivo e divide em linhas
    const conteudo = fs.readFileSync(caminho, 'utf8');
    const linhas = conteudo.split('\n').filter(Boolean);

    // Processa as linhas para criar uma matriz numérica
    const data = linhas.map(linha => linha.split(',').slice(2).map(Number));
    return data; // retorna dados processados
}

// Função para identificar sequências em uma linha
function sequencia(linha, i, cont) {
    for (let j = 0; j < linha.length; j++) {
        const num = linha[j];
        
        // Verifica se estamos no último elemento da linha
        if (i === linha.length - 1) {
            break;
        }

        // Verifica se há uma sequência com o próximo número
        if (num + 1 === linha[i + 1]) {
            cont++;
            i++;
        } else {
            // Se houver uma contagem, atualiza o array de contagens
            if (cont > 0) {
              seq[cont]++
                cont = 0;
            }
            i++;
            cont = 0;
        }
    }

    // Verifica se há uma contagem não finalizada no final da linha
    if (cont > 0) {
        seq[cont]++;
    }
}

// Função para aplicar a análise de sequência a um intervalo de linhas
function aplicarSequencia(mat, inicio, fim) {
    console.log(`Thread: ${inicio + 1} - ${fim}`);
    for (let j = inicio; j < fim; j++) {
        sequencia(mat[j], 0, 0);
    }
}

// Função para mostrar os resultados das sequências
function mostrarSequencia() {
    for (let i = 1; i < seq.length; i++) {
        console.log(`Sequencia de ${i + 1} - ${seq[i]}`);
    }
}

// Função principal
function main() {
    // Lê os dados do arquivo de entrada
    const data = lerInput('resultados.csv');

    // Inicia a contagem de tempo
    const tempoInicial = performance.now(); //medir tempo

    // Aplica a análise de sequência para o conjunto inteiro de dados
    aplicarSequencia(data, 0, data.length);

    // Finaliza a contagem de tempo
    const tempoFinal = performance.now();

    // Imprime resultados e tempo de execução para uma única thread
    console.log('\n> Uma thread');
    mostrarSequencia();
    console.log(`\n\nTempo de execução 1 thread: ${(tempoFinal - tempoInicial) / 1000} segundos`);

    // Threads
    // Zera o array de contagens para usar nas threads
    seq.fill(0);

    // Número de threads e cálculo do intervalo
    const numThreads = 4;//define qtd de threads
    const intervalo = Math.floor(data.length / numThreads);

    // Criação de promessas para as threads
    const threadPromises = [];
    for (let num = 0; num < numThreads; num++) {
        const inicio = intervalo * num;
        const fim = inicio + intervalo;
        
        // Cria uma promessa para aplicar a análise de sequência a um intervalo
        threadPromises.push(
            new Promise((resolve) => {
                aplicarSequencia(data, inicio, fim);
                resolve();
            })
        );
    }

    // Aguarda todas as promessas das threads serem resolvidas
    Promise.all(threadPromises).then(() => {
        // Calcula o tempo de execução final
        const finalTempo = performance.now();

        // Imprime resultados e tempo de execução para múltiplas threads
        console.log('\n> Multithreads');
        mostrarSequencia();
        console.log(`\nTempo de execução ${numThreads} threads: ${(finalTempo - tempoInicial) / 1000} segundos\n\n`);
    });
}

main();
