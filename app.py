from flask import Flask, render_template, request, jsonify
from z3 import *

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

if __name__ == '__main__':
    app.run(debug=True)
