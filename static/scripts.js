let initialPuzzle = [];
let isPuzzleGenerated = false;

function storeInitialPuzzle() {
    initialPuzzle = [];
    for (let i = 0; i < 9; i++) {
        let row = [];
        for (let j = 0; j < 9; j++) {
            let cell = document.getElementById(`cell-${i}-${j}`);
            row.push(cell.value ? parseInt(cell.value) : 0);
        }
        initialPuzzle.push(row);
    }
}

function solveSudoku() {
    const solveButton = document.querySelector('.solve-button');
    const resetButton = document.querySelector('.reset-button');
    const generateButton = document.querySelector('.generate-button');
    const restartButton = document.querySelector('.restart-button');

    solveButton.disabled = true; 
    solveButton.textContent = "Solving Sudoku";
    solveButton.classList.add('disabled'); 

    resetButton.disabled = true;
    resetButton.classList.add('disabled');

    generateButton.disabled = true;
    generateButton.classList.add('disabled');

    restartButton.disabled = true;
    restartButton.classList.add('disabled');

    let puzzle = [];
    for (let i = 0; i < 9; i++) {
        let row = [];
        for (let j = 0; j < 9; j++) {
            let val = document.getElementById(`cell-${i}-${j}`).value;
            row.push(val ? parseInt(val) : 0);
        }
        puzzle.push(row);
    }
    fetch('/solve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({puzzle: puzzle}),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'solved') {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    document.getElementById(`cell-${i}-${j}`).value = data.solution[i][j];
                }
            }
            document.body.style.backgroundColor = "#28a745"; 
            document.body.classList.remove('flash-red'); 
        } else {
            document.body.classList.add('flash-red'); 
        }
    })
    .catch(error => {
        console.error('Error solving the Sudoku:', error);
        alert('Failed to solve the Sudoku. Please try again.');
    })
    .finally(() => {
        solveButton.disabled = false; 
        solveButton.textContent = "Solve Sudoku"; 
        solveButton.classList.remove('disabled'); 

        resetButton.disabled = false;
        resetButton.classList.remove('disabled');

        generateButton.disabled = false;
        generateButton.classList.remove('disabled');

        restartButton.disabled = false;
        restartButton.classList.remove('disabled');
    });
}

function restartSudoku() {
    const restartButton = document.getElementById('restart-button');
    if (restartButton.classList.contains('disabled')) return;

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            document.getElementById(`cell-${i}-${j}`).value = initialPuzzle[i][j] || '';
        }
    }
    document.body.style.backgroundColor = ""; 
    document.body.classList.remove('flash-red'); 
}

function resetSudoku() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            document.getElementById(`cell-${i}-${j}`).value = '';
        }
    }
    document.body.style.backgroundColor = ""; 
    document.body.classList.remove('flash-red');
    toggleRestartButton(false);
}

function generateSudoku() {
    resetSudoku();
    const difficulty = document.getElementById('difficulty-slider').value;
    fetch(`/generate?difficulty=${difficulty}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'generated') {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    document.getElementById(`cell-${i}-${j}`).value = data.puzzle[i][j] || '';
                }
            }
            storeInitialPuzzle();
            toggleRestartButton(true);
        } else {
            alert('Failed to generate sudoku');
        }
    });
}

function toggleRestartButton(enable) {
    const restartButton = document.getElementById('restart-button');
    if (enable) {
        restartButton.classList.remove('disabled');
        restartButton.disabled = false; 
        isPuzzleGenerated = true;
    } else {
        restartButton.classList.add('disabled');
        restartButton.disabled = true; 
        isPuzzleGenerated = false;
    }
}
