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
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            document.getElementById(`cell-${i}-${j}`).value = '';
        }
    }
    document.body.style.backgroundColor = ""; // Reset background color
    document.body.classList.remove('flash-red'); // Remove flashing effect
}

function generatePuzzle() {
    restartSudoku();
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
        } else {
            alert('Failed to generate puzzle');
        }
    });
}
