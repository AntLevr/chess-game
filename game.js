class CheckersGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.mustCapture = false;
        this.capturingPiece = null;
        this.gameOver = false;
        
        this.init();
    }

    init() {
        this.createBoard();
        this.setupPieces();
        this.renderBoard();
        this.setupEventListeners();
        this.updateUI();
    }

    createBoard() {
        this.board = [];
        for (let row = 0; row < 8; row++) {
            this.board[row] = [];
            for (let col = 0; col < 8; col++) {
                this.board[row][col] = null;
            }
        }
    }

    setupPieces() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    if (row < 3) {
                        this.board[row][col] = {
                            player: 'blue',
                            isKing: false
                        };
                    } else if (row > 4) {
                        this.board[row][col] = {
                            player: 'red',
                            isKing: false
                        };
                    }
                }
            }
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = `cell ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                cell.dataset.row = row;
                cell.dataset.col = col;

                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${piece.player}`;
                    if (piece.isKing) {
                        pieceElement.classList.add('king');
                        pieceElement.textContent = '♔';
                    }
                    cell.appendChild(pieceElement);
                }

                boardElement.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        const board = document.getElementById('board');
        board.addEventListener('click', (e) => this.handleCellClick(e));

        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('rules-btn').addEventListener('click', () => this.showRules());
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.hideModal('game-over-modal');
            this.restart();
        });

        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    handleCellClick(e) {
        if (this.gameOver) return;

        const cell = e.target.closest('.cell');
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (this.capturingPiece) {
            this.handleCaptureMove(row, col);
        } else {
            this.handleNormalClick(row, col);
        }
    }

    handleNormalClick(row, col) {
        const piece = this.board[row][col];

        if (piece && piece.player === this.currentPlayer) {
            this.selectPiece(row, col);
        } else if (this.selectedPiece) {
            this.tryMove(row, col);
        }
    }

    selectPiece(row, col) {
        this.selectedPiece = { row, col };
        this.validMoves = this.getValidMoves(row, col);
        
        this.highlightCells();
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = [];
        const directions = piece.isKing 
            ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
            : piece.player === 'red' 
                ? [[-1, -1], [-1, 1]]
                : [[1, -1], [1, 1]];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (this.isValidPosition(newRow, newCol)) {
                if (!this.board[newRow][newCol]) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                } else if (this.board[newRow][newCol].player !== piece.player) {
                    const jumpRow = newRow + dr;
                    const jumpCol = newCol + dc;
                    
                    if (this.isValidPosition(jumpRow, jumpCol) && !this.board[jumpRow][jumpCol]) {
                        moves.push({ 
                            row: jumpRow, 
                            col: jumpCol, 
                            type: 'capture',
                            capturedRow: newRow,
                            capturedCol: newCol
                        });
                    }
                }
            }
        }

        return moves;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    tryMove(row, col) {
        const move = this.validMoves.find(m => m.row === row && m.col === col);
        
        if (move) {
            if (move.type === 'capture') {
                this.executeCapture(move);
            } else {
                this.executeMove(move);
            }
        } else {
            this.clearSelection();
        }
    }

    executeMove(move) {
        const piece = this.board[this.selectedPiece.row][this.selectedPiece.col];
        this.board[move.row][move.col] = piece;
        this.board[this.selectedPiece.row][this.selectedPiece.col] = null;

        this.checkKingPromotion(move.row, move.col);
        this.switchPlayer();
        this.clearSelection();
        this.renderBoard();
        this.updateUI();
        this.checkGameOver();
    }

    executeCapture(move) {
        const piece = this.board[this.selectedPiece.row][this.selectedPiece.col];
        this.board[move.row][move.col] = piece;
        this.board[this.selectedPiece.row][this.selectedPiece.col] = null;
        this.board[move.capturedRow][move.capturedCol] = null;

        this.checkKingPromotion(move.row, move.col);

        const additionalCaptures = this.getValidMoves(move.row, move.col)
            .filter(m => m.type === 'capture');

        if (additionalCaptures.length > 0) {
            this.capturingPiece = { row: move.row, col: move.col };
            this.selectedPiece = { row: move.row, col: move.col };
            this.validMoves = additionalCaptures;
            this.renderBoard();
            this.highlightCells();
        } else {
            this.switchPlayer();
            this.clearSelection();
            this.renderBoard();
            this.updateUI();
            this.checkGameOver();
        }
    }

    handleCaptureMove(row, col) {
        const move = this.validMoves.find(m => m.row === row && m.col === col);
        
        if (move) {
            this.executeCapture(move);
        }
    }

    checkKingPromotion(row, col) {
        const piece = this.board[row][col];
        if (!piece.isKing) {
            if ((piece.player === 'red' && row === 0) || 
                (piece.player === 'blue' && row === 7)) {
                piece.isKing = true;
            }
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'red' ? 'blue' : 'red';
        this.capturingPiece = null;
    }

    clearSelection() {
        this.selectedPiece = null;
        this.validMoves = [];
        this.clearHighlights();
    }

    highlightCells() {
        this.clearHighlights();

        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);

            if (this.selectedPiece && 
                row === this.selectedPiece.row && 
                col === this.selectedPiece.col) {
                cell.classList.add('selected');
            }

            const move = this.validMoves.find(m => m.row === row && m.col === col);
            if (move) {
                if (move.type === 'capture') {
                    cell.classList.add('capture-move');
                } else {
                    cell.classList.add('valid-move');
                }
            }
        });
    }

    clearHighlights() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'valid-move', 'capture-move');
        });
    }

    updateUI() {
        document.getElementById('player-red').classList.toggle('active', this.currentPlayer === 'red');
        document.getElementById('player-blue').classList.toggle('active', this.currentPlayer === 'blue');
        document.getElementById('turn-indicator').textContent = 
            this.currentPlayer === 'red' ? '红方回合' : '蓝方回合';

        const redPieces = this.countPieces('red');
        const bluePieces = this.countPieces('blue');
        document.getElementById('red-pieces').textContent = redPieces;
        document.getElementById('blue-pieces').textContent = bluePieces;
    }

    countPieces(player) {
        let count = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] && this.board[row][col].player === player) {
                    count++;
                }
            }
        }
        return count;
    }

    checkGameOver() {
        const redPieces = this.countPieces('red');
        const bluePieces = this.countPieces('blue');

        if (redPieces === 0) {
            this.endGame('蓝方获胜！');
        } else if (bluePieces === 0) {
            this.endGame('红方获胜！');
        } else if (!this.hasValidMoves(this.currentPlayer)) {
            const winner = this.currentPlayer === 'red' ? '蓝方' : '红方';
            this.endGame(`${winner}获胜！`);
        }
    }

    hasValidMoves(player) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.player === player) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    endGame(message) {
        this.gameOver = true;
        document.getElementById('winner-text').textContent = message;
        document.getElementById('game-over-modal').style.display = 'block';
    }

    restart() {
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.capturingPiece = null;
        this.gameOver = false;
        
        this.createBoard();
        this.setupPieces();
        this.renderBoard();
        this.updateUI();
    }

    showRules() {
        document.getElementById('rules-modal').style.display = 'block';
    }

    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CheckersGame();
});