const CROSS = 'X';
const ZERO = 'O';
const EMPTY = ' ';
let currentTurn = CROSS;

const container = document.getElementById('fieldWrapper');

startGame();
addResetListener();

field = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => EMPTY));
dimension = 3;


function startGame () {
    renderGrid(3);
}

function renderGrid (dimension) {
    container.innerHTML = '';

    for (let i = 0; i < dimension; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < dimension; j++) {
            const cell = document.createElement('td');
            cell.textContent = EMPTY;
            cell.addEventListener('click', () => cellClickHandler(i, j));
            row.appendChild(cell);
        }
        container.appendChild(row);
    }
}

function checkFilledAmount() {
    let count = 0;
    for (let i = 0; i < dimension; i++) {
        for (let j = 0; j < dimension; j++) {
            if (field[i][j] !== EMPTY) {
                count++;
            }
        }
    }
    return count > dimension * dimension / 2;
}

function expandField() {
    oldField = field.map(row => [...row]);
    console.log(`Expanding field to ${dimension+1}`);
    renderGrid(dimension + 1);
    field = Array.from({ length: dimension + 1 }, () => Array.from({ length: dimension + 1 }, () => EMPTY));
    for (let i = 0; i < dimension; i++) {
        for (let j = 0; j < dimension; j++) {
            field[i][j] = oldField[i][j];
            renderSymbolInCell(field[i][j], i, j);
        }
    }
    dimension++;
} 

function getBestMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < dimension; i++) {
        for (let j = 0; j < dimension; j++) {
            if (field[i][j] === EMPTY) {
                field[i][j] = ZERO;
                const score = minimax(field, 0, false);
                field[i][j] = EMPTY;
                if (score > bestScore) {
                    bestScore = score;
                    move = [i, j];
                }
            }
        }
    }
    console.log(`Best move: ${move}`);
    return move;
}

function minimax(field, depth, isMaximizing) {
    if (depth > 7) {
        return 0;
    }
    const result = checkWin();
    if (result.isWin) {
        return isMaximizing ? -10 : 1;
    }
    if (checkDraw()) {
        return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        currentTurn = ZERO;
        for (let i = 0; i < dimension; i++) {
            for (let j = 0; j < dimension; j++) {
                if (field[i][j] === EMPTY) {
                    field[i][j] = ZERO;
                    const score = minimax(field, depth + 1, false);
                    field[i][j] = EMPTY;
                    bestScore = Math.max(score, bestScore);
                }
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        currentTurn = CROSS;
        for (let i = 0; i < dimension; i++) {
            for (let j = 0; j < dimension; j++) {
                if (field[i][j] === EMPTY) {
                    field[i][j] = CROSS;
                    const score = minimax(field, depth + 1, true);
                    field[i][j] = EMPTY;
                    bestScore = Math.min(score, bestScore);
                }
            }
        }
        return bestScore;
    }
}


function getRandomCell() {
    let row, col;
    do {
        row = Math.floor(Math.random() * dimension);
        col = Math.floor(Math.random() * dimension);
    } while (field[row][col] !== EMPTY);
    return [row, col];
}

function makeMoveByAI(aiType) {
    const move = aiType === 'random' ? getRandomCell() : getBestMove();
    const [row, col] = move;
    currentTurn = ZERO;
    field[row][col] = currentTurn;
    renderSymbolInCell(currentTurn, row, col);
    
    const winInfo = checkWin();
    if (winInfo.isWin) {
        highlightWinningCells(winInfo.winningCells);
        setTimeout(() => alert(`${currentTurn} wins!`), 0); // setTimeout для того, чтобы сначала подсветились клетки, а потом выскочило окно
        endGame();
        return;
    };
    
    if (checkDraw()) {
        setTimeout(() => alert("Победила дружба"), 0);
        endGame()
        return;
    }
    if (aiType === 'random' && checkFilledAmount()) {
        expandField();
    }
    currentTurn = CROSS;
}

function cellClickHandler(row, col) {
    if (field[row][col] !== EMPTY) return;

    field[row][col] = currentTurn;
    renderSymbolInCell(currentTurn, row, col);

    const winInfo = checkWin();
    if (winInfo.isWin) {
        highlightWinningCells(winInfo.winningCells);
        setTimeout(() => alert(`${currentTurn} wins!`), 0);
        endGame();
        return;
    };

    if (checkDraw()) {
        setTimeout(() => alert("Победила дружба"), 0);
        endGame()
        return;
    }
    const aiType = document.getElementById('ai-selection').value;
    if (aiType === 'random' && checkFilledAmount()) {
        expandField();
    }
    makeMoveByAI(aiType);
    console.log(`Clicked on cell: ${row}, ${col}`);
}

function highlightWinningCells(winningCells) {
    winningCells.forEach(cell => {
        const [row, col] = cell;
        renderSymbolInCell(field[row][col], row, col, 'red');
    });
}


function checkWin() {
    for (let i = 0; i < dimension; i++) {
        let rowWin = true;
        let colWin = true;
        let winningCellsRow = [];
        let winningCellsCol = [];
        for (let j = 0; j < dimension; j++) {
            if (field[i][j] !== currentTurn) {
                rowWin = false;
            }
            if (field[j][i] !== currentTurn) {
                colWin = false;
            }
            // Запоминаем победные клетки
            if (rowWin) {
                winningCellsRow.push([i, j]);
            }
            if (colWin) {
                winningCellsCol.push([j, i]);
            }
        }
        if (rowWin) {
            return { isWin: true, winningCells: winningCellsRow };
        }
        if (colWin) {
            return { isWin: true, winningCells: winningCellsCol };
        }
    }

    // Проверка диагоналей
    let diagonalWin1 = true;
    let diagonalWin2 = true;
    let winningCellsDiag1 = [];
    let winningCellsDiag2 = [];
    for (let i = 0; i < dimension; i++) {
        if (field[i][i] !== currentTurn) {
            diagonalWin1 = false;
        }
        if (field[i][dimension - i - 1] !== currentTurn) {
            diagonalWin2 = false;
        }
        // Запоминаем победные клетки
        if (diagonalWin1) {
            winningCellsDiag1.push([i, i]);
        }
        if (diagonalWin2) {
            winningCellsDiag2.push([i, dimension - i - 1]);
        }
    }
    if (diagonalWin1) {
        return { isWin: true, winningCells: winningCellsDiag1 };
    }
    if (diagonalWin2) {
        return { isWin: true, winningCells: winningCellsDiag2 };
    }

    return { isWin: false };
}


function checkDraw() {
    return field.flat().indexOf(EMPTY) === -1;
}

function renderSymbolInCell (symbol, row, col, color = '#333') {
    const targetCell = findCell(row, col);

    targetCell.textContent = symbol;
    targetCell.style.color = color;
}

function findCell (row, col) {
    const targetRow = container.querySelectorAll('tr')[row];
    return targetRow.querySelectorAll('td')[col];
}

function addResetListener () {
    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', resetClickHandler);
}

function resetClickHandler () {
    dimension = prompt("Введите размер поля", 3);
    field = Array.from({ length: dimension }, () => Array.from({ length: dimension }, () => EMPTY));
    renderGrid(dimension);
    currentTurn = CROSS;
}

function endGame() {
    container.querySelectorAll('td').forEach(cell => {
        const clonedCell = cell.cloneNode(true); // Создание клонов для сохранения текущих данных и отвязки eventListener
        cell.parentNode.replaceChild(clonedCell, cell);
    });
}
