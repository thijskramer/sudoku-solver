import { useState } from "react";

type Cell = {
  index: number;
  x: number;
  y: number;
  value: number | null;
  options: number[];
  isPrefilled: boolean;
  group: number;
};

const prefilled = [
  { x: 1, y: 3, value: 3 },
  { x: 1, y: 5, value: 8 },
  { x: 2, y: 1, value: 6 },
  { x: 2, y: 2, value: 8 },
  { x: 3, y: 2, value: 7 },
  { x: 3, y: 3, value: 4 },
  { x: 3, y: 6, value: 1 },
  { x: 3, y: 7, value: 5 },
  { x: 4, y: 4, value: 6 },
  { x: 4, y: 6, value: 3 },
  { x: 4, y: 7, value: 4 },
  { x: 4, y: 8, value: 9 },
  { x: 5, y: 1, value: 3 },
  { x: 5, y: 9, value: 1 },
  { x: 6, y: 2, value: 6 },
  { x: 6, y: 3, value: 8 },
  { x: 6, y: 4, value: 9 },
  { x: 6, y: 6, value: 7 },
  { x: 7, y: 3, value: 6 },
  { x: 7, y: 4, value: 2 },
  { x: 7, y: 7, value: 9 },
  { x: 7, y: 8, value: 7 },
  { x: 8, y: 8, value: 3 },
  { x: 8, y: 9, value: 6 },
  { x: 9, y: 5, value: 7 },
  { x: 9, y: 7, value: 2 },
];

const getCoords = (idx: number) => {
  const x = 1 + (idx % 9);
  const y = 1 + Math.floor(idx / 9);
  return [x, y];
};

const getBorder = (idx: number) => {
  const [x, y] = getCoords(idx);
  const borders = ["border-black"];
  if (x === 1) {
    borders.push(`border-l-2`);
    borders.push(`border-r`);
  } else {
    if (x % 3 === 0) {
      borders.push(`border-r-2`);
    } else {
      borders.push(`border-r`);
    }
  }
  if (y === 1) {
    borders.push(`border-t-2`);
    borders.push("border-b");
  } else {
    if (y % 3 === 0) {
      borders.push(`border-b-2`);
    } else {
      borders.push("border-b");
    }
  }
  return borders.join(" ");
};

const getInitialCells = () => {
  const cells = Array.from({ length: 81 }, (_, v) => {
    const [x, y] = getCoords(v);
    const prefilledCell = prefilled.find((c) => c.x === x && c.y === y);
    return {
      index: v,
      x,
      y,
      value: prefilledCell ? prefilledCell.value : null,
      options: [] as number[],
      isPrefilled: !!prefilledCell,
    } as Cell;
  });
  // set default squares.
  const getGroup = ({ x, y }: Cell) => {
    return Math.ceil(x / 3) + 3 * Math.floor((y - 1) / 3);
  };

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
    cellValueIsValid(cell, cells, v)
  );
};

const cellValueIsValid = (
  cell: Cell,
  cells: Cell[],
  attemptedValue: number
) => {
  const row = cells.filter((c) => c.y === cell.y && c.x !== cell.x);
  const column = cells.filter((c) => c.x === cell.x && c.y !== cell.y);
  const group = cells.filter(
    (c) => c.group === cell.group && c.index !== cell.index
  );
  if (
    row
      .map((r) => r.value)
      .filter(Boolean)
      .includes(attemptedValue)
  ) {
    // console.log(`Nope, ${attemptedValue} is already in the same row.`);
    return false;
  }
  if (
    column
      .map((r) => r.value)
      .filter(Boolean)
      .includes(attemptedValue)
  ) {
    // console.log(`Nope, ${attemptedValue} is already in the same column.`);
    return false;
  }
  if (
    group
      .map((g) => g.value)
      .filter(Boolean)
      .includes(attemptedValue)
  ) {
    // console.log(`Nope, ${attemptedValue} is already in the same group.`);
    return false;
  }
  return true;
};

function App() {
  const [selectedCell, setSelectedCell] = useState(-1);
  const [cells, setCells] = useState<Cell[]>(getInitialCells());
  const [showOptions, toggleOptions] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [steps, setSteps] = useState(1);

  const selectCell = (idx: number) => {
    setSelectedCell(idx === selectedCell ? -1 : idx);
  };

  const handleKeyPress = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    if ("123456789".indexOf(evt.key) >= 0 && selectedCell >= 0) {
      const val = parseInt(evt.key);
      const [x, y] = getCoords(selectedCell);
      const cell = cells.find((c) => c.x === x && c.y === y);
      if (cell) {
        setCellValue(val, cell);
      }
    }
  };

  const setCellValue = (value: number, cell: Cell) => {
    const { x, y } = cell;

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

  const writeLog = (msg: string) => {
    setLogs((curr) => [...curr, `${steps}. ${msg}`]);
  };

  const solve = () => {
    // if cells with single option, apply that.
    // if no cells with single option, check if row/col/group
    // contains cell with unique option, apply that.
    setSteps((s) => (s += 1));
    function applySingles() {
      const cellsWithSingleOption = cells
        .filter((c) => c.value === null)
        .filter((c) => c.options.length === 1);
      console.log(cellsWithSingleOption.length);
      if (cellsWithSingleOption.length > 0) {
        cellsWithSingleOption.forEach((c) => {
          setCellValue(c.options[0], c);
          writeLog(`Applied ${c.options[0]} to cell R${c.y}C${c.x}. (Single)`);
        });
      }
      return cellsWithSingleOption.length;
    }
    function applySquares() {
      const groups = Array.from(new Set(cells.map((x) => x.group)));
      groups.forEach((group) => {
        // foreach group, find cells in that group...
        const groupCells = cells.filter((x) => x.group === group);
        hoeba(groupCells, "square");
      });
    }
    function applyColumns() {
      Array.from({ length: 9 }, (_, v) => v + 1).forEach((col) => {
        // foreach group, find cells in that group...
        const groupCells = cells.filter((x) => x.x === col);
        hoeba(groupCells, "column");
      });
    }
    function applyRows() {
      Array.from({ length: 9 }, (_, v) => v + 1).forEach((row) => {
        // foreach group, find cells in that group...
        const groupCells = cells.filter((x) => x.y === row);
        hoeba(groupCells, "row");
      });
    }

    function hoeba(groupCells: Cell[], boundary: string) {
      // each cell: do I have a unique option?
      const cells = groupCells.filter((x) => x.value === null);
      cells.forEach((cell) => {
        const huu = cell.options.filter((co) => {
          const numCellsWithThisOption = cells.filter((gc) =>
            gc.options.includes(co)
          ).length;
          if (numCellsWithThisOption > 1) {
            return false;
          }
          return true;
        });
        if (huu.length > 0) {
          setCellValue(huu[0], cell);
          writeLog(
            `Applied ${huu[0]} to cell R${cell.y}C${cell.x}. (${boundary})`
          );
        }
      });
    }

    const singles = applySingles();
    if (singles < 1) {
      applySquares();
      applyRows();
      applyColumns();
    }
  };

  return (
    <div className="p-4 grid grid-cols-[auto_1fr] gap-10">
      <div>
        <div
          className="grid grid-cols-[repeat(9,40px)] focus:outline-none"
          onKeyDown={(evt) => handleKeyPress(evt)}
          tabIndex={0}
        >
          {cells.map((c) => (
            <div
              className={`w-10 h-10 grid place-content-center relative text-xl ${getBorder(
                c.index
              )} ${c.index === selectedCell ? "bg-yellow-100" : "bg-white"}`}
              key={c.index}
              onClick={() => selectCell(c.index)}
            >
              <span
                className={`${
                  c.isPrefilled
                    ? "font-bold text-black"
                    : "font-light text-gray-800"
                } ${
                  c.value !== null && !c.isPrefilled
                    ? cellValueIsValid(c, cells, c.value)
                      ? ""
                      : "text-red-600"
                    : ""
                }`}
              >
                {c.value}
              </span>
              {c.value === null && showOptions && (
                <span className="absolute left-0 top-0 text-xs text-slate-300">
                  {c.options.join("")}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="pt-4 flex gap-2">
          <button
            onClick={() => toggleOptions((o) => !o)}
            type="button"
            className="bg-blue-600 text-white px-2 py-2"
          >
            {showOptions ? "Hide" : "Show"} options
          </button>
          <button
            onClick={() => reset()}
            type="button"
            className="bg-blue-600 text-white px-2 py-2"
          >
            Reset
          </button>
          <button
            onClick={solve}
            type="button"
            className="bg-blue-600 text-white px-2 py-2"
          >
            Solve
          </button>
          {cells.filter((x) => x.value === null).length === 0
            ? "Well done!"
            : ""}
        </div>
      </div>
      <div className="border border-blue-600 bg-white max-h-screen overflow-scroll">
        {logs.map((x, i) => (
          <div key={i}>{x}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
