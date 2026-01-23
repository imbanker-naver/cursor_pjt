// 간단한 브라우저용 수도쿠 게임

const boardElement = document.getElementById("sudoku-board");
const difficultySelect = document.getElementById("difficulty");
const newGameBtn = document.getElementById("new-game-btn");
const checkBtn = document.getElementById("check-btn");
const hintBtn = document.getElementById("hint-btn");
const resetBtn = document.getElementById("reset-btn");
const statusText = document.getElementById("status-text");

// 3x3 미니 수도쿠 퍼즐 데이터: 0은 빈 칸
const PUZZLES = {
  easy: [
    {
      grid: [
        [1, 0, 0],
        [0, 2, 0],
        [0, 0, 3],
      ],
      solution: [
        [1, 3, 2],
        [3, 2, 1],
        [2, 1, 3],
      ],
    },
    {
      grid: [
        [2, 0, 0],
        [0, 3, 0],
        [0, 0, 1],
      ],
      solution: [
        [2, 1, 3],
        [1, 3, 2],
        [3, 2, 1],
      ],
    },
  ],
  medium: [
    {
      grid: [
        [0, 2, 0],
        [3, 0, 1],
        [0, 1, 0],
      ],
      solution: [
        [1, 2, 3],
        [3, 1, 2],
        [2, 3, 1],
      ],
    },
    {
      grid: [
        [0, 0, 2],
        [1, 0, 0],
        [0, 3, 0],
      ],
      solution: [
        [3, 1, 2],
        [1, 2, 3],
        [2, 3, 1],
      ],
    },
  ],
  hard: [
    {
      grid: [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ],
      solution: [
        [2, 3, 1],
        [3, 1, 2],
        [1, 2, 3],
      ],
    },
    {
      grid: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 2],
      ],
      solution: [
        [1, 2, 3],
        [3, 1, 2],
        [2, 3, 1],
      ],
    },
  ],
};

let currentPuzzle = null;
let cells = []; // DOM input 요소들

function createBoard() {
  boardElement.innerHTML = "";
  cells = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cellDiv = document.createElement("div");
      cellDiv.classList.add("cell");
      cellDiv.dataset.row = row;
      cellDiv.dataset.col = col;

      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 1;
      input.autocomplete = "off";

      input.addEventListener("input", (e) => {
        const v = e.target.value.replace(/[^1-3]/g, "");
        e.target.value = v;
        clearStatus();
      });

      input.addEventListener("focus", () => {
        highlightRelatedCells(row, col);
      });
      input.addEventListener("blur", () => {
        clearHighlights();
      });

      cellDiv.appendChild(input);
      boardElement.appendChild(cellDiv);
      cells.push(input);
    }
  }
}

function getCell(row, col) {
  return cells[row * 3 + col];
}

function loadPuzzle(difficulty) {
  const list = PUZZLES[difficulty];
  const puzzle = list[Math.floor(Math.random() * list.length)];
  currentPuzzle = JSON.parse(JSON.stringify(puzzle)); // 깊은 복사

  // 초기화
  cells.forEach((input) => {
    input.value = "";
    input.placeholder = "";
    input.disabled = false;
    input.parentElement.classList.remove("prefilled", "error", "correct", "completed");
  });

  // 값 채우기
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const value = puzzle.grid[r][c];
      const cell = getCell(r, c);
      if (value !== 0) {
        cell.value = value;
        cell.disabled = true;
        cell.parentElement.classList.add("prefilled");
      } else {
        cell.placeholder = "";
      }
    }
  }

  setStatus("퍼즐이 생성되었습니다. 빈 칸에 1~3 숫자를 채워 보세요.", "ok");
}

function setStatus(message, type = "normal") {
  statusText.textContent = message;
  statusText.classList.remove("ok", "error");
  if (type === "ok") statusText.classList.add("ok");
  if (type === "error") statusText.classList.add("error");
}

function clearStatus() {
  statusText.textContent = "";
  statusText.classList.remove("ok", "error");
}

function highlightRelatedCells(row, col) {
  clearHighlights();
  // 3x3에서는 가로줄과 세로줄만 하이라이트 (전체가 하나의 박스)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cellDiv = getCell(r, c).parentElement;
      if (r === row) cellDiv.classList.add("highlight-row");
      if (c === col) cellDiv.classList.add("highlight-col");
    }
  }
}

function clearHighlights() {
  cells.forEach((input) => {
    input.parentElement.classList.remove("highlight-row", "highlight-col", "highlight-box");
  });
}

function checkBoard() {
  if (!currentPuzzle) {
    setStatus("먼저 새 퍼즐을 시작해 주세요.", "error");
    return;
  }

  let hasError = false;
  let isComplete = true;

  cells.forEach((input) => {
    input.parentElement.classList.remove("error", "correct", "completed");
  });

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const input = getCell(r, c);
      const value = input.value ? parseInt(input.value, 10) : 0;
      const solutionValue = currentPuzzle.solution[r][c];

      if (value === 0) {
        isComplete = false;
        continue;
      }

      if (value === solutionValue) {
        input.parentElement.classList.add("correct");
      } else {
        input.parentElement.classList.add("error");
        hasError = true;
      }
    }
  }

  if (hasError) {
    setStatus("틀린 칸이 있습니다. 빨간 숫자를 확인해 보세요.", "error");
  } else if (isComplete) {
    cells.forEach((input) => {
      input.parentElement.classList.add("completed");
    });
    setStatus("축하합니다! 퍼즐을 모두 완성했습니다.", "ok");
  } else {
    setStatus("현재까지는 맞게 풀고 있습니다. 계속 진행해 보세요!", "ok");
  }
}

function giveHint() {
  if (!currentPuzzle) {
    setStatus("먼저 새 퍼즐을 시작해 주세요.", "error");
    return;
  }

  const empties = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const input = getCell(r, c);
      if (input.disabled) continue;
      const value = input.value ? parseInt(input.value, 10) : 0;
      const correct = currentPuzzle.solution[r][c];
      if (value !== correct) {
        empties.push({ r, c });
      }
    }
  }

  if (empties.length === 0) {
    setStatus("힌트를 줄 칸이 없습니다. 거의 다 풀었어요!", "ok");
    return;
  }

  const target = empties[Math.floor(Math.random() * empties.length)];
  const cell = getCell(target.r, target.c);
  const correctValue = currentPuzzle.solution[target.r][target.c];

  cell.value = correctValue;
  cell.parentElement.classList.remove("error", "correct");
  cell.parentElement.classList.add("correct");
  setStatus("힌트를 한 칸 채워드렸어요.", "ok");
}

function resetBoard() {
  if (!currentPuzzle) return;
  loadPuzzle(difficultySelect.value);
}

newGameBtn.addEventListener("click", () => {
  loadPuzzle(difficultySelect.value);
});

checkBtn.addEventListener("click", checkBoard);
hintBtn.addEventListener("click", giveHint);
resetBtn.addEventListener("click", resetBoard);

// 초기 보드 생성 & 기본 난이도 로드
createBoard();
loadPuzzle(difficultySelect.value);

