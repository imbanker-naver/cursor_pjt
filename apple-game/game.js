class AppleGame {
    constructor() {
        this.board = [];
        this.rows = 10;
        this.cols = 10;
        this.score = 0;
        this.timeLeft = 60;
        this.isPlaying = false;
        this.timer = null;
        this.selectedCells = new Set();
        this.isSelecting = false;
        this.startX = 0;
        this.startY = 0;

        this.gameBoard = document.getElementById('game-board');
        this.selectionBox = document.getElementById('selection-box');
        this.scoreDisplay = document.getElementById('score');
        this.timerDisplay = document.getElementById('timer');
        this.selectedSumDisplay = document.getElementById('selected-sum');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.scoreMessage = document.getElementById('score-message');
        this.playAgainBtn = document.getElementById('play-again-btn');

        this.initEventListeners();
        this.createBoard();
    }

    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());

        // 마우스 이벤트
        this.gameBoard.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // 터치 이벤트
        this.gameBoard.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }

    createBoard() {
        this.board = [];
        this.gameBoard.innerHTML = '';

        for (let i = 0; i < this.rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.cols; j++) {
                const value = Math.floor(Math.random() * 9) + 1;
                this.board[i][j] = value;

                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.textContent = value;
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.gameBoard.appendChild(cell);
            }
        }
    }

    startGame() {
        this.isPlaying = true;
        this.score = 0;
        this.timeLeft = 60;
        this.updateScore();
        this.updateTimer();
        this.createBoard();

        this.startBtn.disabled = true;
        this.resetBtn.disabled = false;

        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();

            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    resetGame() {
        this.gameOverModal.classList.remove('show');
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.startGame();
    }

    endGame() {
        this.isPlaying = false;
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.startBtn.disabled = false;
        this.finalScoreDisplay.textContent = this.score;
        
        if (this.score >= 150) {
            this.scoreMessage.textContent = '🏆 대단해요! 사과게임 마스터!';
        } else if (this.score >= 100) {
            this.scoreMessage.textContent = '🌟 훌륭해요! 100점 돌파!';
        } else if (this.score >= 50) {
            this.scoreMessage.textContent = '👍 좋아요! 조금만 더 연습해보세요!';
        } else {
            this.scoreMessage.textContent = '💪 다시 도전해보세요!';
        }

        this.gameOverModal.classList.add('show');
    }

    handleMouseDown(e) {
        if (!this.isPlaying) return;
        e.preventDefault();

        const rect = this.gameBoard.getBoundingClientRect();
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.isSelecting = true;

        this.clearSelection();
        this.updateSelectionBox(e.clientX, e.clientY, e.clientX, e.clientY);
        this.selectionBox.style.display = 'block';
    }

    handleMouseMove(e) {
        if (!this.isSelecting) return;

        this.updateSelectionBox(this.startX, this.startY, e.clientX, e.clientY);
        this.updateSelectedCells();
    }

    handleMouseUp(e) {
        if (!this.isSelecting) return;

        this.isSelecting = false;
        this.selectionBox.style.display = 'none';
        this.checkMatch();
    }

    handleTouchStart(e) {
        if (!this.isPlaying) return;
        e.preventDefault();

        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.isSelecting = true;

        this.clearSelection();
        this.updateSelectionBox(touch.clientX, touch.clientY, touch.clientX, touch.clientY);
        this.selectionBox.style.display = 'block';
    }

    handleTouchMove(e) {
        if (!this.isSelecting) return;
        e.preventDefault();

        const touch = e.touches[0];
        this.updateSelectionBox(this.startX, this.startY, touch.clientX, touch.clientY);
        this.updateSelectedCells();
    }

    handleTouchEnd(e) {
        if (!this.isSelecting) return;

        this.isSelecting = false;
        this.selectionBox.style.display = 'none';
        this.checkMatch();
    }

    updateSelectionBox(x1, y1, x2, y2) {
        const containerRect = this.gameBoard.parentElement.getBoundingClientRect();
        
        const left = Math.min(x1, x2) - containerRect.left;
        const top = Math.min(y1, y2) - containerRect.top;
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);

        this.selectionBox.style.left = `${left}px`;
        this.selectionBox.style.top = `${top}px`;
        this.selectionBox.style.width = `${width}px`;
        this.selectionBox.style.height = `${height}px`;
    }

    updateSelectedCells() {
        const selectionRect = this.selectionBox.getBoundingClientRect();
        const cells = this.gameBoard.querySelectorAll('.cell:not(.empty)');

        this.selectedCells.clear();

        cells.forEach(cell => {
            const cellRect = cell.getBoundingClientRect();
            
            if (this.isOverlapping(selectionRect, cellRect)) {
                cell.classList.add('selected');
                this.selectedCells.add(cell);
            } else {
                cell.classList.remove('selected');
            }
        });

        this.updateSelectedSum();
    }

    isOverlapping(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                 rect1.left > rect2.right || 
                 rect1.bottom < rect2.top || 
                 rect1.top > rect2.bottom);
    }

    updateSelectedSum() {
        let sum = 0;
        this.selectedCells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            sum += this.board[row][col];
        });
        this.selectedSumDisplay.textContent = sum;

        // 합이 10이면 색상 변경
        if (sum === 10 && this.selectedCells.size > 0) {
            this.selectedSumDisplay.style.color = '#4ecdc4';
        } else if (sum > 10) {
            this.selectedSumDisplay.style.color = '#f5576c';
        } else {
            this.selectedSumDisplay.style.color = '#667eea';
        }
    }

    clearSelection() {
        this.selectedCells.forEach(cell => {
            cell.classList.remove('selected');
        });
        this.selectedCells.clear();
        this.selectedSumDisplay.textContent = '0';
        this.selectedSumDisplay.style.color = '#667eea';
    }

    checkMatch() {
        if (this.selectedCells.size === 0) return;

        let sum = 0;
        this.selectedCells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            sum += this.board[row][col];
        });

        if (sum === 10) {
            this.handleMatch();
        } else {
            this.clearSelection();
        }
    }

    handleMatch() {
        const matchedCount = this.selectedCells.size;
        
        // 보너스 점수 계산 (많이 제거할수록 보너스)
        let points = matchedCount;
        if (matchedCount >= 5) {
            points += matchedCount * 2;
        } else if (matchedCount >= 3) {
            points += matchedCount;
        }

        this.score += points;
        this.updateScore();

        // 애니메이션 적용 후 제거
        this.selectedCells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            this.board[row][col] = 0;
            cell.classList.remove('selected');
            cell.classList.add('matched');
        });

        setTimeout(() => {
            this.selectedCells.forEach(cell => {
                cell.classList.add('empty');
                cell.classList.remove('matched');
                cell.textContent = '';
            });
            this.selectedCells.clear();
            this.selectedSumDisplay.textContent = '0';
            this.selectedSumDisplay.style.color = '#667eea';
        }, 300);
    }

    updateScore() {
        this.scoreDisplay.textContent = this.score;
    }

    updateTimer() {
        this.timerDisplay.textContent = this.timeLeft;
        
        if (this.timeLeft <= 10) {
            this.timerDisplay.style.color = '#f5576c';
        } else {
            this.timerDisplay.style.color = '#333';
        }
    }
}

// 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
    new AppleGame();
});
