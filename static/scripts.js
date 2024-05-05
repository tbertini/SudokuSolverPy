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
            document.body.style.backgroundColor = "#28a745"; // Set background color to green
            document.body.classList.remove('flash-red'); // Remove flashing effect if present
        } else {
            document.body.classList.add('flash-red'); // Add flashing effect
        }
    });
}

function restartSudoku() {
    const restartButton = document.getElementById('restart-button');
    if (restartButton.classList.contains('disabled')) return; // Prevent function if button is disabled

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            document.getElementById(`cell-${i}-${j}`).value = initialPuzzle[i][j] || '';
        }
    }
    document.body.style.backgroundColor = ""; // Reset background color
    document.body.classList.remove('flash-red'); // Remove flashing effect
}

function resetSudoku() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            document.getElementById(`cell-${i}-${j}`).value = '';
        }
    }
    document.body.style.backgroundColor = ""; // Reset background color
    document.body.classList.remove('flash-red'); // Remove flashing effect
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
        restartButton.disabled = false; // Ensure button is not disabled
        isPuzzleGenerated = true;
    } else {
        restartButton.classList.add('disabled');
        restartButton.disabled = true; // Disable the button
        isPuzzleGenerated = false;
    }
}