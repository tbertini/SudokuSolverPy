from flask import Flask, render_template, request, jsonify
from z3 import *
import random

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

def add_sudoku_constraints(s, puzzle):
    # Ensure each value is in the correct range
    s.add([And(1 <= puzzle[i][j], puzzle[i][j] <= 9) for i in range(9) for j in range(9)])
    
    # Ensure each row contains distinct values
    s.add([Distinct(puzzle[i]) for i in range(9)])
    
    # Ensure each column contains distinct values
    for j in range(9):
        s.add(Distinct([puzzle[i][j] for i in range(9)]))
    
    # Ensure each 3x3 subgrid contains distinct values
    for i in 0, 3, 6:
        for j in 0, 3, 6:
            s.add(Distinct([puzzle[i + di][j + dj] for di in range(3) for dj in range(3)]))

@app.route('/solve', methods=['POST'])
def solve():
    try:
        data = request.json['puzzle']
        print(data)
        puzzle = [[Int(f'x_{i+1}_{j+1}') for j in range(9)] for i in range(9)]
        s = Solver()
        add_sudoku_constraints(s, puzzle)
        
        # Integrating puzzle clues as constraints
        for i in range(9):
            for j in range(9):
                if data[i][j] != 0:
                    s.add(puzzle[i][j] == data[i][j])

        if s.check() == sat:
            m = s.model()
            solution = [[m.evaluate(puzzle[i][j]).as_long() for j in range(9)] for i in range(9)]
            return jsonify({'status': 'solved', 'solution': solution})
        else:
            return jsonify({'status': 'unsolvable'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})
    
@app.route('/generate')
def generate():
    difficulty = request.args.get('difficulty', '2')  # Default to medium if not specified
    puzzle = generate_sudoku_puzzle(difficulty)
    return jsonify({'status': 'generated', 'puzzle': puzzle})


def generate_full_grid():
    base = 3
    side = base * base

    # pattern for a baseline valid solution
    def pattern(r, c): return (base * (r % base) + r // base + c) % side

    # randomize rows, columns and numbers (of valid base pattern)
    def shuffle(s): return random.sample(s, len(s))

    rBase = range(base)
    rows = [g * base + r for g in shuffle(rBase) for r in shuffle(rBase)]
    cols = [g * base + c for g in shuffle(rBase) for c in shuffle(rBase)]
    nums = shuffle(range(1, base * base + 1))

    # produce board using randomized baseline pattern
    board = [[nums[pattern(r, c)] for c in cols] for r in rows]

    return board

def remove_cells(grid, level):
    base = 3
    side = base * base
    squares = side * side
    empty_cells = int(squares * level)  # level is the fraction of cells to clear

    for p in random.sample(range(squares), empty_cells):
        grid[p // side][p % side] = 0

    return grid

def generate_sudoku_puzzle(difficulty):
    grid = generate_full_grid()
    if difficulty == '1':  # Easy
        level = 0.37
    elif difficulty == '2':  # Medium
        level = 0.49
    else:  # Hard
        level = 0.61

    puzzle = remove_cells(grid, level)
    return puzzle


if __name__ == '__main__':
    app.run(debug=True)
