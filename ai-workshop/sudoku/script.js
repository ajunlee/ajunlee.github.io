// 遊戲狀態管理
class SudokuGame {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.selectedNumber = null;
        this.errors = 0;
        this.maxErrors = 5;
        this.coins = 0;
        this.coinCells = new Set();
        this.collectedCoins = new Set();
        this.startTime = null;
        this.timeElapsed = 0;
        this.timerInterval = null;
        this.isPaused = false;
        this.currentDifficulty = 1;
        this.isGameOver = false;
        
        this.initializeEventListeners();
        this.loadLeaderboard();
    }

    // 初始化事件監聽器
    initializeEventListeners() {
        // 難度選擇按鈕
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = parseInt(e.target.dataset.level);
                this.startGame(level);
            });
        });

        // 數字選擇按鈕
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const number = parseInt(e.target.dataset.number);
                this.selectNumber(number);
            });
        });

        // 控制按鈕
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('back-btn').addEventListener('click', () => this.backToMenu());
        
        // 排行榜相關
        document.getElementById('leaderboard-btn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('back-to-menu').addEventListener('click', () => this.backToMenu());
        
        // 彈窗按鈕
        document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('play-again-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('back-to-menu-btn').addEventListener('click', () => this.backToMenu());

        // 排行榜標籤
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = parseInt(e.target.dataset.difficulty);
                this.showLeaderboardForDifficulty(difficulty);
                
                // 更新標籤狀態
                document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // 鍵盤事件監聽
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    // 鍵盤事件處理
    handleKeyPress(e) {
        if (this.isPaused || this.isGameOver) return;
        
        const key = e.key;
        
        // 數字鍵 1-9
        if (key >= '1' && key <= '9') {
            e.preventDefault();
            const number = parseInt(key);
            this.selectNumber(number);
        }
        
        // 刪除鍵或空格鍵清除格子
        if (key === 'Delete' || key === 'Backspace' || key === ' ') {
            e.preventDefault();
            this.selectNumber(0);
        }
        
        // 方向鍵移動選擇
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            e.preventDefault();
            this.moveSelection(key);
        }
        
        // ESC鍵暫停
        if (key === 'Escape') {
            e.preventDefault();
            this.togglePause();
        }
        
        // H鍵提示
        if (key.toLowerCase() === 'h') {
            e.preventDefault();
            this.showHint();
        }
    }

    // 方向鍵移動選擇
    moveSelection(direction) {
        if (!this.selectedCell) {
            // 如果沒有選中格子，選擇中心格子
            this.selectCell(4, 4);
            return;
        }
        
        let {row, col} = this.selectedCell;
        
        switch (direction) {
            case 'ArrowUp':
                row = Math.max(0, row - 1);
                break;
            case 'ArrowDown':
                row = Math.min(8, row + 1);
                break;
            case 'ArrowLeft':
                col = Math.max(0, col - 1);
                break;
            case 'ArrowRight':
                col = Math.min(8, col + 1);
                break;
        }
        
        this.selectCell(row, col);
    }

    // 生成完整的數獨解答
    generateSolution() {
        // 清空網格
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.solution[i][j] = 0;
            }
        }

        // 使用回溯算法生成完整解答
        this.solveSudoku(this.solution);
    }

    // 數獨求解算法（回溯法）
    solveSudoku(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    // 隨機嘗試1-9的數字
                    const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    
                    for (const num of numbers) {
                        if (this.isValidMove(grid, row, col, num)) {
                            grid[row][col] = num;
                            
                            if (this.solveSudoku(grid)) {
                                return true;
                            }
                            
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // 檢查移動是否有效
    isValidMove(grid, row, col, num) {
        // 檢查行
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) return false;
        }

        // 檢查列
        for (let x = 0; x < 9; x++) {
            if (grid[x][col] === num) return false;
        }

        // 檢查3x3方塊
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[boxRow + i][boxCol + j] === num) return false;
            }
        }

        return true;
    }

    // 洗牌算法
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // 根據難度生成謎題
    generatePuzzle(difficulty) {
        // 首先生成完整解答
        this.generateSolution();
        
        // 複製解答到遊戲網格
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.grid[i][j] = this.solution[i][j];
                this.originalGrid[i][j] = this.solution[i][j];
            }
        }

        // 根據難度決定要移除的格子數量
        const cellsToRemove = this.getCellsToRemove(difficulty);
        
        // 隨機移除格子
        const allCells = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                allCells.push({row: i, col: j});
            }
        }
        
        const shuffledCells = this.shuffleArray(allCells);
        
        for (let i = 0; i < cellsToRemove && i < shuffledCells.length; i++) {
            const {row, col} = shuffledCells[i];
            this.grid[row][col] = 0;
            this.originalGrid[row][col] = 0;
        }
    }

    // 根據難度獲取要移除的格子數量
    getCellsToRemove(difficulty) {
        const difficultySettings = {
            1: 40, // 初級 - 移除40個格子
            2: 45, // 簡單 - 移除45個格子
            3: 50, // 中等 - 移除50個格子
            4: 55, // 困難 - 移除55個格子
            5: 60  // 專家 - 移除60個格子
        };
        return difficultySettings[difficulty] || 40;
    }

    // 生成隱藏金幣位置
    generateCoinCells() {
        this.coinCells.clear();
        this.collectedCoins.clear();
        
        // 找出所有空格子
        const emptyCells = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }

        // 隨機選擇5-8個空格子作為金幣格子
        const coinCount = Math.floor(Math.random() * 4) + 5;
        const shuffledEmpty = this.shuffleArray(emptyCells);
        
        for (let i = 0; i < Math.min(coinCount, shuffledEmpty.length); i++) {
            const {row, col} = shuffledEmpty[i];
            this.coinCells.add(`${row}-${col}`);
        }
    }

    // 開始遊戲
    startGame(difficulty) {
        this.currentDifficulty = difficulty;
        this.errors = 0;
        this.coins = 0;
        this.timeElapsed = 0;
        this.isGameOver = false;
        this.selectedCell = null;
        this.selectedNumber = null;

        // 生成謎題和金幣
        this.generatePuzzle(difficulty);
        this.generateCoinCells();

        // 初始化UI
        this.renderGrid();
        this.updateGameStatus();
        this.startTimer();

        // 切換到遊戲畫面
        this.showScreen('game-screen');
    }

    // 渲染遊戲網格
    renderGrid() {
        const gridElement = document.getElementById('sudoku-grid');
        gridElement.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                const value = this.grid[row][col];
                if (value !== 0) {
                    cell.textContent = value;
                    if (this.originalGrid[row][col] !== 0) {
                        cell.classList.add('given');
                    }
                }

                // 添加金幣標記
                if (this.coinCells.has(`${row}-${col}`) && !this.collectedCoins.has(`${row}-${col}`)) {
                    cell.classList.add('coin-cell');
                }

                // 添加點擊事件
                cell.addEventListener('click', () => this.selectCell(row, col));

                gridElement.appendChild(cell);
            }
        }
    }

    // 選擇格子
    selectCell(row, col) {
        if (this.isPaused || this.isGameOver) return;
        
        // 如果是預設值格子，不能選擇
        if (this.originalGrid[row][col] !== 0) return;

        // 更新選中狀態
        document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('selected'));
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('selected');
            this.selectedCell = {row, col};
        }

        // 高亮相關格子
        this.highlightRelatedCells(row, col);

        // 如果已經選擇了數字，直接填入
        if (this.selectedNumber !== null) {
            this.makeMove(row, col, this.selectedNumber);
        }
    }

    // 選擇數字
    selectNumber(number) {
        if (this.isPaused || this.isGameOver) return;

        // 更新數字按鈕狀態
        document.querySelectorAll('.number-btn').forEach(btn => btn.classList.remove('selected'));
        if (number !== 0) {
            const btn = document.querySelector(`[data-number="${number}"]`);
            if (btn) btn.classList.add('selected');
        }

        this.selectedNumber = number;

        // 如果已經選擇了格子，直接填入
        if (this.selectedCell) {
            this.makeMove(this.selectedCell.row, this.selectedCell.col, number);
        }
    }

    // 執行移動
    makeMove(row, col, number) {
        if (this.isPaused || this.isGameOver) return;
        if (this.originalGrid[row][col] !== 0) return; // 不能修改預設值

        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const oldValue = this.grid[row][col];

        // 清除之前的樣式
        cell.classList.remove('error', 'correct');

        if (number === 0) {
            // 清除格子
            this.grid[row][col] = 0;
            cell.textContent = '';
        } else {
            // 填入數字
            this.grid[row][col] = number;
            cell.textContent = number;

            // 檢查答案
            if (this.solution[row][col] === number) {
                // 正確答案
                cell.classList.add('correct');
                
                // 檢查是否是金幣格子
                if (this.coinCells.has(`${row}-${col}`) && !this.collectedCoins.has(`${row}-${col}`)) {
                    this.collectCoin(row, col);
                }

                // 檢查是否完成遊戲
                setTimeout(() => {
                    if (this.checkGameComplete()) {
                        this.gameWin();
                    }
                }, 300);
            } else {
                // 錯誤答案
                cell.classList.add('error');
                this.errors++;
                this.updateGameStatus();

                // 檢查是否遊戲失敗
                if (this.errors >= this.maxErrors) {
                    setTimeout(() => this.gameLose(), 500);
                }
            }
        }

        // 高亮相關行、列和3x3區塊
        this.highlightRelatedCells(row, col);
        this.updateGameStatus();
    }

    // 高亮相關格子
    highlightRelatedCells(row, col) {
        // 清除之前的高亮
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('highlighted', 'same-number');
        });

        if (this.selectedCell && this.selectedCell.row === row && this.selectedCell.col === col) {
            const selectedNumber = this.grid[row][col];
            
            // 高亮同一行、列、3x3區塊
            for (let i = 0; i < 9; i++) {
                // 同一行
                const rowCell = document.querySelector(`[data-row="${row}"][data-col="${i}"]`);
                if (rowCell) rowCell.classList.add('highlighted');
                
                // 同一列
                const colCell = document.querySelector(`[data-row="${i}"][data-col="${col}"]`);
                if (colCell) colCell.classList.add('highlighted');
            }

            // 高亮3x3區塊
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const boxCell = document.querySelector(`[data-row="${boxRow + i}"][data-col="${boxCol + j}"]`);
                    if (boxCell) boxCell.classList.add('highlighted');
                }
            }

            // 高亮相同數字
            if (selectedNumber !== 0) {
                document.querySelectorAll('.cell').forEach(cell => {
                    if (cell.textContent === selectedNumber.toString()) {
                        cell.classList.add('same-number');
                    }
                });
            }
        }
    }

    // 收集金幣
    collectCoin(row, col) {
        const coinKey = `${row}-${col}`;
        if (this.collectedCoins.has(coinKey)) return;

        this.collectedCoins.add(coinKey);
        this.coins += Math.floor(Math.random() * 3) + 1; // 隨機獲得1-3金幣

        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.remove('coin-cell');
        cell.classList.add('coin-collected');

        // 播放金幣收集動畫
        const coinElement = document.createElement('div');
        coinElement.textContent = '💰';
        coinElement.style.position = 'absolute';
        coinElement.style.fontSize = '2em';
        coinElement.style.pointerEvents = 'none';
        coinElement.classList.add('coin-animation');
        cell.appendChild(coinElement);

        setTimeout(() => {
            if (coinElement.parentNode) {
                coinElement.remove();
            }
        }, 600);

        this.updateGameStatus();
    }

    // 檢查遊戲是否完成
    checkGameComplete() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0 || this.grid[row][col] !== this.solution[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }

    // 遊戲勝利
    gameWin() {
        this.isGameOver = true;
        this.stopTimer();
        
        // 計算分數並保存記錄
        const score = this.calculateScore();
        this.saveGameRecord(true, score);

        // 顯示勝利彈窗
        document.getElementById('game-over-title').textContent = '🎉 恭喜過關！';
        document.getElementById('game-over-stats').innerHTML = `
            <p><strong>完成時間：</strong>${this.formatTime(this.timeElapsed)}</p>
            <p><strong>錯誤次數：</strong>${this.errors}</p>
            <p><strong>獲得金幣：</strong>💰 ${this.coins}</p>
            <p><strong>總分：</strong>${score}</p>
        `;
        this.showModal('game-over-modal');
    }

    // 遊戲失敗
    gameLose() {
        this.isGameOver = true;
        this.stopTimer();

        // 保存失敗記錄
        this.saveGameRecord(false, 0);

        // 顯示失敗彈窗
        document.getElementById('game-over-title').textContent = '😞 遊戲失敗';
        document.getElementById('game-over-stats').innerHTML = `
            <p>錯誤次數超過限制！</p>
            <p><strong>遊戲時間：</strong>${this.formatTime(this.timeElapsed)}</p>
            <p><strong>錯誤次數：</strong>${this.errors}/${this.maxErrors}</p>
            <p><strong>獲得金幣：</strong>💰 ${this.coins}</p>
        `;
        this.showModal('game-over-modal');
    }

    // 計算分數
    calculateScore() {
        const timeBonus = Math.max(0, 3600 - this.timeElapsed); // 時間獎勵
        const errorPenalty = this.errors * 100; // 錯誤懲罰
        const coinBonus = this.coins * 50; // 金幣獎勵
        const difficultyBonus = this.currentDifficulty * 500; // 難度獎勵
        
        return Math.max(0, timeBonus + coinBonus + difficultyBonus - errorPenalty);
    }

    // 顯示提示
    showHint() {
        if (this.isPaused || this.isGameOver) return;
        if (!this.selectedCell) {
            alert('請先選擇一個空格子！');
            return;
        }

        const {row, col} = this.selectedCell;
        if (this.originalGrid[row][col] !== 0) {
            alert('不能對預設數字使用提示！');
            return;
        }

        const correctNumber = this.solution[row][col];
        this.makeMove(row, col, correctNumber);
        
        // 提示會增加錯誤計數
        this.errors++;
        this.updateGameStatus();
    }

    // 計時器相關
    startTimer() {
        this.startTime = Date.now() - this.timeElapsed * 1000;
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
                this.updateTimer();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimer() {
        document.getElementById('timer').textContent = this.formatTime(this.timeElapsed);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 暫停/繼續遊戲
    togglePause() {
        if (this.isGameOver) return;

        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.showModal('pause-modal');
            document.getElementById('pause-btn').textContent = '繼續 ▶️';
        } else {
            this.hideModal('pause-modal');
            document.getElementById('pause-btn').textContent = '暫停 ⏸️';
            this.startTime = Date.now() - this.timeElapsed * 1000;
        }
    }

    // 重新開始遊戲
    restartGame() {
        this.hideModal('game-over-modal');
        this.hideModal('pause-modal');
        this.stopTimer();
        this.startGame(this.currentDifficulty);
    }

    // 返回主選單
    backToMenu() {
        this.hideModal('game-over-modal');
        this.hideModal('pause-modal');
        this.stopTimer();
        this.showScreen('start-screen');
    }

    // 更新遊戲狀態顯示
    updateGameStatus() {
        document.getElementById('timer').textContent = this.formatTime(this.timeElapsed);
        document.getElementById('errors').textContent = `${this.errors}/${this.maxErrors}`;
        document.getElementById('coins').textContent = `💰 ${this.coins}`;
        
        const difficultyNames = ['', '初級 ⭐', '簡單 ⭐⭐', '中等 ⭐⭐⭐', '困難 ⭐⭐⭐⭐', '專家 ⭐⭐⭐⭐⭐'];
        document.getElementById('current-difficulty').textContent = difficultyNames[this.currentDifficulty];
    }

    // 畫面切換
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
    }

    // 彈窗控制
    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    // 排行榜功能
    saveGameRecord(isWin, score) {
        const records = this.loadLeaderboard();
        const newRecord = {
            date: new Date().toISOString(),
            difficulty: this.currentDifficulty,
            time: this.timeElapsed,
            errors: this.errors,
            coins: this.coins,
            score: score,
            isWin: isWin
        };

        if (!records[this.currentDifficulty]) {
            records[this.currentDifficulty] = [];
        }

        records[this.currentDifficulty].push(newRecord);
        
        // 只保留前10名
        records[this.currentDifficulty].sort((a, b) => b.score - a.score);
        records[this.currentDifficulty] = records[this.currentDifficulty].slice(0, 10);

        localStorage.setItem('sudoku-leaderboard', JSON.stringify(records));
    }

    loadLeaderboard() {
        const stored = localStorage.getItem('sudoku-leaderboard');
        return stored ? JSON.parse(stored) : {};
    }

    showLeaderboard() {
        this.showScreen('leaderboard-screen');
        this.showLeaderboardForDifficulty(1);
    }

    showLeaderboardForDifficulty(difficulty) {
        const records = this.loadLeaderboard();
        const difficultyRecords = records[difficulty] || [];
        
        const listElement = document.getElementById('leaderboard-list');
        
        if (difficultyRecords.length === 0) {
            listElement.innerHTML = '<p style="text-align: center; color: #666; padding: 50px;">暫無記錄</p>';
            return;
        }

        listElement.innerHTML = difficultyRecords.map((record, index) => `
            <div class="leaderboard-item">
                <div class="rank">#${index + 1}</div>
                <div class="player-name">
                    ${record.isWin ? '✅' : '❌'} ${this.formatTime(record.time)}
                </div>
                <div>💰 ${record.coins}</div>
                <div>${record.score}分</div>
            </div>
        `).join('');
    }
}

// 初始化遊戲
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new SudokuGame();
});