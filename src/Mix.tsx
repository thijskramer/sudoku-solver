import clsx from "clsx";
import { useCallback, useState } from "react";

type Cell = {
  index: number;
  x: number;
  y: number;
  value: number | null;
  options: number[];
  isPrefilled: boolean;
  group: number | string;
};

const prefilled = [
  { x: 2, y: 1, value: 5 },
  { x: 2, y: 3, value: 3 },
  { x: 2, y: 7, value: 2 },
  { x: 2, y: 9, value: 6 },

  { x: 3, y: 4, value: 1 },
  { x: 3, y: 5, value: 2 },
  { x: 3, y: 6, value: 5 },

  { x: 4, y: 2, value: 4 },
  { x: 4, y: 8, value: 2 },

  { x: 5, y: 2, value: 5 },
  { x: 5, y: 3, value: 8 },
  { x: 5, y: 7, value: 7 },
  { x: 5, y: 8, value: 9 },

  { x: 6, y: 2, value: 6 },
  { x: 6, y: 8, value: 8 },

  { x: 7, y: 4, value: 7 },
  { x: 7, y: 5, value: 9 },
  { x: 7, y: 6, value: 3 },

  { x: 8, y: 1, value: 8 },
  { x: 8, y: 3, value: 7 },
  { x: 8, y: 13, value: 3 },
  { x: 8, y: 15, value: 6 },

  { x: 9, y: 10, value: 9 },
  { x: 9, y: 11, value: 6 },
  { x: 9, y: 12, value: 4 },

  { x: 10, y: 8, value: 9 },
  { x: 10, y: 14, value: 3 },

  { x: 11, y: 8, value: 3 },
  { x: 11, y: 9, value: 5 },
  { x: 11, y: 13, value: 6 },
  { x: 11, y: 14, value: 1 },

  { x: 12, y: 8, value: 8 },
  { x: 12, y: 14, value: 4 },

  { x: 13, y: 10, value: 8 },
  { x: 13, y: 11, value: 4 },
  { x: 13, y: 12, value: 7 },

  { x: 14, y: 7, value: 8 },
  { x: 14, y: 9, value: 4 },
  { x: 14, y: 13, value: 7 },
  { x: 14, y: 15, value: 1 },
];

const groups = `
A A B B B B C C C
A A A A B B B C C
A A D A B B E C C
D D D D E E E C C
D D D D E F F F F
G G E E E F F F F
G G E H H F I I I
G G H H H H I I I
G G G H H H I I I
`;

const getCoords = (idx: number) => {
  let x = 1 + (idx % 9);
  let y = 1 + Math.floor(idx / 9);
  if (idx >= 54 && idx < 99) {
    x = 1 + ((idx + 6) % 15);
    y = 7 + Math.floor((idx - 54) / 15);
  }
  if (idx >= 99) {
    x += 6;
    y = y = -1 + Math.floor(idx / 9);
  }
  return [x, y];
};

// set default groups.
const getGroup = ({ x, y }: Cell) => {
  const groupMap = groups
    .split("\n")
    .filter(Boolean)
    .map((row) => row.split(" "));
  if (y <= 6) {
    return groupMap[y - 1][x - 1];
  }
  if (y <= 9 && x <= 9) {
    return groupMap[y - 1][x - 1];
  }
  return Math.ceil(x / 3) + 3 * Math.floor((y - 1) / 3);
};

const getInitialCells = () => {
  const cells = Array.from({ length: 17 * 9 }, (_, v) => {
    const [x, y] = getCoords(v);

    const prefilledCell = prefilled.find((c) => c.x === x && c.y === y);
    return {
      index: v,
      x,
      y,
      value: prefilledCell ? prefilledCell.value : null,
      // value: null,
      options: [] as number[],
      isPrefilled: !!prefilledCell,
    } as Cell;
  });
  cells.forEach((cell) => {
    cell.group = getGroup(cell);
  });
  cells.forEach((cell) => {
    cell.options = getOptions(cell, cells);
  });
  return cells;
};

const getOptions = (cell: Cell, cells: Cell[]) => {
  if (cell.isPrefilled) {
    return [];
  }
  return Array.from({ length: 9 }, (_, v) => v + 1).filter((v) =>
    cellValueIsValid(cell, cells, v),
  );
};

const cellValueIsValid = (
  cell: Cell,
  cells: Cell[],
  attemptedValue: number,
) => {
  const group = cells.filter(
    (c) => c.group === cell.group && c.index !== cell.index,
  );
  if (
    group
      .map((g) => g.value)
      .filter(Boolean)
      .includes(attemptedValue)
  ) {
    return false;
  }

  const tldrDiagonal = cells.filter((c) => c.x === c.y && c.x >= 7);
  if (
    tldrDiagonal.some((c) => c.index === cell.index) &&
    tldrDiagonal
      .filter((c) => c.index !== cell.index)
      .map((g) => g.value)
      .filter(Boolean)
      .includes(attemptedValue)
  ) {
    return false;
  }
  const trdlDiagonal = cells.filter((c) => c.x + c.y === 22);
  if (
    trdlDiagonal.some((c) => c.index === cell.index) &&
    trdlDiagonal
      .filter((c) => c.index !== cell.index)
      .map((g) => g.value)
      .filter(Boolean)
      .includes(attemptedValue)
  ) {
    return false;
  }

  const leftSideCheck = () => {
    const row = cells.filter(
      (c) => c.y === cell.y && c.x !== cell.x && c.x <= 9,
    );
    if (
      row
        .map((r) => r.value)
        .filter(Boolean)
        .includes(attemptedValue)
    ) {
      return false;
    }
    return true;
  };
  const rightSideCheck = () => {
    const row = cells.filter(
      (c) => c.y === cell.y && c.x !== cell.x && c.x >= 7,
    );
    if (
      row
        .map((r) => r.value)
        .filter(Boolean)
        .includes(attemptedValue)
    ) {
      return false;
    }
    return true;
  };
  const checkColumnUp = () => {
    const column = cells.filter(
      (c) => c.x === cell.x && c.y !== cell.y && c.y <= 9,
    );
    if (
      column
        .map((r) => r.value)
        .filter(Boolean)
        .includes(attemptedValue)
    ) {
      return false;
    }
    return true;
  };
  const checkColumnDown = () => {
    const column = cells.filter(
      (c) => c.x === cell.x && c.y !== cell.y && c.y >= 7,
    );
    if (
      column
        .map((r) => r.value)
        .filter(Boolean)
        .includes(attemptedValue)
    ) {
      return false;
    }
    return true;
  };
  const leftSide = leftSideCheck();
  const rightSide = rightSideCheck();
  const upSide = checkColumnUp();
  const downSide = checkColumnDown();
  if ([7, 8, 9].includes(cell.x)) {
    if (!(leftSide && rightSide)) {
      return false;
    }
  } else {
    if (cell.x <= 9) {
      if (!leftSide) {
        return false;
      }
    } else {
      if (!rightSide) {
        return false;
      }
    }
  }
  if ([7, 8, 9].includes(cell.y)) {
    if (!(upSide && downSide)) {
      return false;
    }
  } else {
    if (cell.y <= 9) {
      if (!upSide) {
        return false;
      }
    } else {
      if (!downSide) {
        return false;
      }
    }
  }

  return true;
};

class Grid {
  #_cells: Cell[] = [];
  #specialCell = {} as Cell;
  constructor(cells: Cell[]) {
    this.#_cells = cells;
  }
  get cells() {
    return this.#_cells;
  }

  get unsolved() {
    return this.#_cells.filter((x) => x.value === null);
  }

  get unsolvedWithoutOptions() {
    return this.unsolved.filter((x) => x.options.length === 0);
  }

  updateCell(cell: Cell, value: number) {
    const idx = this.#_cells.findIndex((x) => x.index === cell.index);
    // console.log(`Updating R${cell.y}C${cell.x}: ${value}`);
    const newCells = [
      ...this.#_cells.slice(0, idx),
      {
        ...this.#_cells[idx],
        value,
      },
      ...this.#_cells.slice(idx + 1),
    ];
    newCells.forEach((cell) => {
      cell.options = getOptions(cell, newCells);
    });
    this.#_cells = newCells;
  }

  fillSingles() {
    const cellsWithSingleOption = this.#_cells
      .filter((c) => c.value === null)
      .filter((c) => c.options.length === 1);
    if (cellsWithSingleOption.length > 0) {
      cellsWithSingleOption.forEach((c) => {
        this.updateCell(c, c.options[0]);
      });
    }
    return cellsWithSingleOption.length;
  }

  solveForGroup(groupCells: Cell[], groupName: string) {
    // each cell: do I have a unique option?
    const cells = groupCells.filter((x) => x.value === null);
    let solutionsFound = 0;
    cells.forEach((cell) => {
      const singularCellOption = cell.options.filter((co) => {
        const numCellsWithThisOption = cells.filter((gc) =>
          gc.options.includes(co),
        ).length;
        return numCellsWithThisOption === 1;
      });
      if (singularCellOption.length > 0) {
        this.updateCell(cell, singularCellOption[0]);
        console.log(
          `${groupName}: writing ${singularCellOption[0]} to cell ${cell.y},${cell.x}`,
        );
        solutionsFound++;
      }
    });
    return solutionsFound;
  }

  fillGroups() {
    let solutionsFound = 0;
    const groups = Array.from(new Set(this.#_cells.map((x) => x.group)));
    groups.forEach((group) => {
      // foreach group, find cells in that group...
      const groupCells = this.#_cells.filter((x) => x.group === group);
      solutionsFound += this.solveForGroup(groupCells, `Group ${group}`);
    });
    return solutionsFound;
  }
  fillColumns() {
    let solutionsFound = 0;
    Array.from({ length: 9 }, (_, v) => v + 1).forEach((num) => {
      // foreach column, find cells in that column...
      const cellsInColumn = this.#_cells.filter((x) => x.x === num && x.y <= 9);
      solutionsFound += this.solveForGroup(cellsInColumn, `Column ${num}`);
    });
    Array.from({ length: 9 }, (_, v) => v + 7).forEach((num) => {
      // foreach group, find cells in that group...
      const cellsInColumn = this.#_cells.filter((x) => x.x === num && x.y >= 7);
      solutionsFound += this.solveForGroup(cellsInColumn, `Column ${num}`);
    });
    return solutionsFound;
  }
  fillRows() {
    let solutionsFound = 0;
    Array.from({ length: 9 }, (_, v) => v + 1).forEach((num) => {
      const cellsInRow = this.#_cells.filter((x) => x.y === num && x.x <= 9);
      solutionsFound += this.solveForGroup(cellsInRow, `Row ${num}`);
    });
    Array.from({ length: 9 }, (_, v) => v + 7).forEach((num) => {
      const cellsInRow = this.#_cells.filter((x) => x.y === num && x.x >= 7);
      solutionsFound += this.solveForGroup(cellsInRow, `Row ${num}`);
    });
    return solutionsFound;
  }

  fillDiagonals() {
    let solutionsFound = 0;
    const topLeftToBottomRight = this.#_cells.filter(
      (x) => x.y >= 7 && x.x === x.y,
    );
    solutionsFound += this.solveForGroup(topLeftToBottomRight, `Diagonal ↘️`);
    const topRightToBottomLeft = this.#_cells.filter(
      (x) => x.y >= 7 && x.x + x.y === 22,
    );
    solutionsFound += this.solveForGroup(topRightToBottomLeft, `Diagonal ↗️`);
    return solutionsFound;
  }

  bruteForce() {
    // 1. find cell with only two options.
    // 2. fill in one of the options.
    // 3. run algorithm
    // 4. if not all cells have a value, and those without a value also have no options,
    //    the option of step 2 is the wrong one, so run it with the other option.

    const cellWithTwoOptions = this.#_cells.find((c) => c.options.length === 2);
    if (!cellWithTwoOptions) {
      return;
    }
    console.log(
      `Brute forcing our way! Using the options ${cellWithTwoOptions.options.join(
        ",",
      )} of cell R${cellWithTwoOptions.y}C${cellWithTwoOptions.x} for that.`,
    );
    const correctOption = cellWithTwoOptions.options.find((option) => {
      const copyOfCells = [...this.#_cells].map((x) => structuredClone(x));
      const tempGrid = new Grid(copyOfCells);
      tempGrid.updateCell(cellWithTwoOptions, option);

      while (tempGrid.unsolved.length > 0) {
        tempGrid.solve();
        // this option is the correct one, because all cells have a solution!
        if (tempGrid.unsolved.length === 0) {
          return true;
        }
        // this option causes empty cells without an option.
        if (tempGrid.unsolvedWithoutOptions.length > 0) {
          return false;
        }
      }
    });
    if (correctOption) {
      this.updateCell(cellWithTwoOptions, correctOption);
    }
  }

  solve() {
    // console.log(`${this.unsolved.length} cells remaining`);
    if (this.unsolved.length === 0) {
      return true;
    }
    if (this.unsolvedWithoutOptions.length > 0) {
      return false;
    }
    const singles = this.fillSingles();
    if (singles < 1) {
      const groups = this.fillGroups();
      if (groups < 1) {
        const cols = this.fillColumns();
        if (cols < 1) {
          const rows = this.fillRows();
          if (rows < 1) {
            const diagonals = this.fillDiagonals();
            // console.log(`Found ${diagonals} diagonals`);
            if (diagonals < 1) {
              this.bruteForce();
            }
          } else {
            // console.log(`Found ${rows} rows`);
          }
        } else {
          // console.log(`Found ${cols} cols`);
        }
      } else {
        // console.log(`Found ${groups} groups`);
      }
    } else {
      // console.log(`Found ${singles} singles`);
    }
    // const solvedWithSudoku = groups + cols + rows + singles + diagonals;
    // if (solvedWithSudoku === 0) {

    // }
    return true;
  }
}

function getSolution(allCells: Cell[]) {
  // if cells with single option, apply that.
  // if no cells with single option, check if row/col/group
  // contains cell with unique option, apply that.
  const t1 = performance.now();
  const grid = new Grid(allCells);

  const isValid = grid.solve();

  if (!isValid) {
    console.log("Cannot solve!");
  }

  const t2 = performance.now();
  console.log(`Duration: ${Math.round(t2 - t1)}ms`);
  return grid.cells;
}

function App() {
  const [selectedCell, setSelectedCell] = useState(-1);
  const [cells, setCells] = useState<Cell[]>(getInitialCells());
  const [showOptions, toggleOptions] = useState(false);

  const selectCell = (idx: number) => {
    setSelectedCell(idx === selectedCell ? -1 : idx);
  };

  const handleKeyPress = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    const [x, y] = getCoords(selectedCell);
    const cell = cells.find((c) => c.x === x && c.y === y);
    if (evt.key === "Backspace") {
      if (cell) {
        setCellValue(null, cell);
      }
    } else if ("123456789".indexOf(evt.key) >= 0 && selectedCell >= 0) {
      if (cell) {
        setCellValue(parseInt(evt.key), cell);
      }
    }
  };

  const setCellValue = (value: number | null, cell: Cell) => {
    const { x, y } = cell;
    if (cell.isPrefilled) {
      return;
    }

    setCells((curr) => {
      const cellIndex = curr.findIndex((c) => c.x === x && c.y === y);
      const newArr = [
        ...curr.slice(0, cellIndex),
        {
          ...curr[cellIndex],
          value,
        },
        ...curr.slice(cellIndex + 1),
      ];
      newArr.forEach((cell) => {
        cell.options = getOptions(cell, newArr);
      });

      return newArr;
    });
  };

  const reset = () => {
    setCells((curr) => {
      const arr = [...curr];
      arr.filter((x) => !x.isPrefilled).forEach((x) => (x.value = null));
      arr.forEach((x) => (x.options = getOptions(x, arr)));
      return arr;
    });
  };

  const solve = () => {
    const solution = getSolution(cells);
    setCells(solution);
  };

  const getBorder = useCallback((cell: Cell, allCells: Cell[]) => {
    const cellHasTopNeighbour = allCells.some(
      (c) => c.y < cell.y && c.x === cell.x,
    );
    const cellHasBottomNeighbour = allCells.some(
      (c) => c.y > cell.y && c.x === cell.x,
    );
    const cellHasLeftNeighbour = allCells.some(
      (c) => c.x < cell.x && c.y === cell.y,
    );
    const cellHasRightNeighbour = allCells.some(
      (c) => c.x > cell.x && c.y === cell.y,
    );
    const borders = ["border-black"];
    // outer borders.
    if (!cellHasTopNeighbour) {
      borders.push(`border-t-2`);
    } else {
      if (
        !allCells
          .filter((x) => x.group === cell.group)
          .some((c) => c.y === cell.y - 1 && c.x === cell.x)
      ) {
        borders.push(`border-t`);
      }
    }
    if (!cellHasBottomNeighbour) {
      borders.push(`border-b-2`);
    } else {
      if (
        !allCells
          .filter((x) => x.group === cell.group)
          .some((c) => c.y === cell.y + 1 && c.x === cell.x)
      ) {
        borders.push(`border-b`);
      }
    }
    if (!cellHasLeftNeighbour) {
      borders.push(`border-l-2`);
    } else {
      if (
        !allCells
          .filter((x) => x.group === cell.group)
          .some((c) => c.x === cell.x - 1 && c.y === cell.y)
      ) {
        borders.push(`border-l`);
      }
    }
    if (!cellHasRightNeighbour) {
      borders.push(`border-r-2`);
    } else {
      if (
        !allCells
          .filter((x) => x.group === cell.group)
          .some((c) => c.x === cell.x + 1 && c.y === cell.y)
      ) {
        borders.push(`border-r`);
      }
    }
    return borders.join(" ");
  }, []);

  return (
    <div className="grid grid-cols-[auto_1fr] gap-10 p-4">
      <div>
        <div
          className="relative grid grid-cols-[repeat(15,48px)] gap-px bg-gray-800 focus:outline-none"
          onKeyDown={(evt) => handleKeyPress(evt)}
          tabIndex={0}
        >
          <div className="col-span-6 col-start-10 row-span-6 row-start-1 bg-gray-200">
            {/* SPACER! */}
          </div>
          <div className="col-span-6 row-span-6 row-start-[10] bg-gray-200">
            {/* SPACER2! */}
          </div>
          {cells.map((c, i) => {
            const isValid = cellValueIsValid(c, cells, c.value);
            return (
              <div
                className={clsx(
                  "relative grid h-12 w-12 place-content-center bg-white text-2xl",
                  getBorder(c, cells),
                  {
                    // "bg-gray-200":
                    //   c.x >= 7 && c.x <= 9 && c.index !== selectedCell,
                    "bg-yellow-100": c.index === selectedCell,
                  },
                )}
                key={c.index}
                onClick={() => selectCell(c.index)}
              >
                <span
                  className={clsx("z-10", {
                    "font-bold text-black": c.isPrefilled,
                    "font-light": !c.isPrefilled,
                    "text-red-600":
                      c.value !== null && !c.isPrefilled && !isValid,
                    "text-blue-800": isValid && !c.isPrefilled,
                  })}
                >
                  {c.value}
                </span>
                {/* <span className="absolute bottom-0 left-0 text-xs text-slate-300">
                  {c.group}
                </span> */}

                {/* <span className="absolute bottom-0 left-0 text-xs text-slate-300">
                  {c.x},{c.y}
                </span> */}

                {c.value === null && showOptions && (
                  <span className="absolute left-0 top-0 p-px text-[10px] leading-none text-slate-400">
                    {c.options.join("")}
                  </span>
                )}
              </div>
            );
          })}
          <div className="pointer-events-none absolute bottom-px right-[3px] h-1 w-[615px] origin-bottom-right rotate-45 border-t-4 border-dotted border-gray-300"></div>
          <div className="pointer-events-none absolute bottom-1 right-0 h-1 w-[615px] origin-bottom-right -translate-y-[432px] -rotate-45 border-t-4 border-dotted border-gray-300"></div>
        </div>
        <div className="flex gap-2 pt-4">
          <button
            onClick={() => toggleOptions((o) => !o)}
            type="button"
            className="bg-blue-600 px-2 py-2 text-white"
          >
            {showOptions ? "Hide" : "Show"} options
          </button>
          <button
            onClick={() => reset()}
            type="button"
            className="bg-blue-600 px-2 py-2 text-white"
          >
            Reset
          </button>
          <button
            onClick={solve}
            disabled={cells.every((x) => x.value !== null)}
            type="button"
            className="bg-blue-600 px-2 py-2 text-white disabled:bg-blue-300"
          >
            Solve
          </button>
          {cells.filter((x) => x.value === null).length === 0
            ? "Well done!"
            : ""}
        </div>
      </div>
    </div>
  );
}

export default App;
