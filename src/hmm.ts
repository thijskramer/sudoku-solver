// Sudoku!

// check each cell which number is possible.
// generate 81 cells

const cells = [];
for (let x = 1; x <= 9; x++) {
  for (let y = 1; y <= 9; y++) {
    cells.push({ x, y, value: null });
  }
}


const setup() {
  const prefilled = [
    {x: 1, y: 3, value: 3},
    {x: 1, y: 5, value: 8},
    {x: 2, y: 1, value: 6},
    {x: 2, y: 2, value: 8},
    {x: 3, y: 2, value: 7},
    {x: 3, y: 3, value: 4},
    {x: 3, y: 6, value: 1},
    {x: 3, y: 7, value: 5},
    {x: 4, y: 4, value: 6},
    {x: 4, y: 6, value: 3},
    {x: 4, y: 7, value: 4},
    {x: 4, y: 8, value: 9},
    {x: 5, y: 1, value: 3},
    {x: 6, y: 2, value: 6},
    {x: 6, y: 3, value: 8},
    {x: 6, y: 4, value: 9},
    {x: 6, y: 6, value: 7},
    {x: 7, y: 3, value: 6},
    {x: 7, y: 4, value: 2},
    {x: 7, y: 7, value: 7},
    {x: 7, y: 8, value: 9},
    {x: 8, y: 8, value: 3},
    {x: 8, y: 9, value: 6},
    {x: 9, y: 5, value: 7},
    {x: 9, y: 7, value: 2},
  ]
  cells.find(x => x === 1 &&)
}
