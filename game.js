class TerritoryWarGame {
    constructor() {
        this.board = [];
        this.players = ['red', 'blue', 'green', 'yellow'];
        this.currentPlayerIndex = 0;
        this.selectedTerritory = null;
        this.gamePhase = 'setup';
        this.reinforcements = 0;
        this.conqueredTerritories = 0;
        this.gameOver = false;
        this.diceResults = [];
        
        this.init();
    }

    init() {
        this.createBoard();
        this.setupTerritories();
        this.renderBoard();
        this.setupEventListeners();
        this.updateUI();
    }

    createBoard() {
        this.board = [];
        for (let row = 0; row < 10; row++) {
            this.board[row] = [];
            for (let col = 0; col < 10; col++) {
                this.board[row][col] = {
                    owner: null,
                    troops: 0
                };
            }
        }
    }

    setupTerritories() {
        const territories = [
            { row: 0, col: 0, owner: 'red', troops: 3 },
            { row: 0, col: 1, owner: 'red', troops: 2 },
            { row: 0, col: 2, owner: 'red', troops: 2 },
            { row: 1, col: 0, owner: 'red', troops: 2 },
            { row: 1, col: 1, owner: 'red', troops: 3 },
            { row: 9, col: 9, owner: 'blue', troops: 3 },
            { row: 9, col: 8, owner: 'blue', troops: 2 },
            { row: 9, col: 7, owner: 'blue', troops: 2 },
            { row: 8, col: 9, owner: 'blue', troops: 2 },
            { row: 8, col: 8, owner: 'blue', troops: 3 },
            { row: 0, col: 9, owner: 'green', troops: 3 },
            { row: 0, col: 8, owner: 'green', troops: 2 },
            { row: 1, col: 9, owner: 'green', troops: 2 },
            { row: 1, col: 8, owner: 'green', troops: 2 },
            { row: 9, col: 0, owner: 'yellow', troops: 3 },
            { row: 9, col: 1, owner: 'yellow', troops: 2 },
            { row: 8, col: 0, owner: 'yellow', troops: 2 },
            { row: 8, col: 1, owner: 'yellow', troops: 2 }
        ];

        territories.forEach(t => {
            this.board[t.row][t.col].owner = t.owner;
            this.board[t.row][t.col].troops = t.troops;
        });

        this.gamePhase = 'reinforce';
        this.calculateReinforcements();
    }

    calculateReinforcements() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        let territoriesCount = 0;
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                if (this.board[row][col].owner === currentPlayer) {
                    territoriesCount++;
                }
            }
        }
        
        this.reinforcements = Math.max(3, Math.floor(territoriesCount / 3));
    }

    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'territory';
                cell.dataset.row = row;
                cell.dataset.col = col;

                const territory = this.board[row][col];
                if (territory.owner) {
                    cell.classList.add(territory.owner);
                    cell.innerHTML = `
                        <div class="troops">${territory.troops}</div>
                    `;
                }

                boardElement.appendChild(cell);
            }
        }

        this.highlightTerritories();
    }

    highlightTerritories() {
        document.querySelectorAll('.territory').forEach(cell => {
            cell.classList.remove('selected', 'valid-move', 'attack-move');
        });

        if (this.selectedTerritory) {
            const selectedCell = document.querySelector(`[data-row="${this.selectedTerritory.row}"][data-col="${this.selectedTerritory.col}"]`);
            if (selectedCell) {
                selectedCell.classList.add('selected');
            }

            const neighbors = this.getNeighbors(this.selectedTerritory.row, this.selectedTerritory.col);
            neighbors.forEach(n => {
                const cell = document.querySelector(`[data-row="${n.row}"][data-col="${n.col}"]`);
                if (cell) {
                    const territory = this.board[n.row][n.col];
                    if (territory.owner === this.players[this.currentPlayerIndex]) {
                        cell.classList.add('valid-move');
                    } else if (territory.owner && territory.owner !== this.players[this.currentPlayerIndex]) {
                        cell.classList.add('attack-move');
                    }
                }
            });
        }
    }

    getNeighbors(row, col) {
        const neighbors = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
                neighbors.push({ row: newRow, col: newCol });
            }
        }

        return neighbors;
    }

    setupEventListeners() {
        const board = document.getElementById('board');
        board.addEventListener('click', (e) => this.handleTerritoryClick(e));

        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('rules-btn').addEventListener('click', () => this.showRules());
        document.getElementById('end-turn-btn').addEventListener('click', () => this.endTurn());
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

    handleTerritoryClick(e) {
        if (this.gameOver) return;

        const cell = e.target.closest('.territory');
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const territory = this.board[row][col];
        const currentPlayer = this.players[this.currentPlayerIndex];

        if (this.gamePhase === 'reinforce') {
            if (territory.owner === currentPlayer && this.reinforcements > 0) {
                territory.troops++;
                this.reinforcements--;
                this.renderBoard();
                this.updateUI();
                
                if (this.reinforcements === 0) {
                    this.gamePhase = 'attack';
                }
            }
        } else if (this.gamePhase === 'attack') {
            if (!this.selectedTerritory) {
                if (territory.owner === currentPlayer && territory.troops > 1) {
                    this.selectedTerritory = { row, col };
                    this.renderBoard();
                }
            } else {
                const selectedTerritory = this.board[this.selectedTerritory.row][this.selectedTerritory.col];
                
                if (row === this.selectedTerritory.row && col === this.selectedTerritory.col) {
                    this.selectedTerritory = null;
                    this.renderBoard();
                } else if (territory.owner === currentPlayer && territory.troops > 1) {
                    this.selectedTerritory = { row, col };
                    this.renderBoard();
                } else if (territory.owner && territory.owner !== currentPlayer) {
                    if (this.isNeighbor(this.selectedTerritory.row, this.selectedTerritory.col, row, col)) {
                        this.attack(this.selectedTerritory.row, this.selectedTerritory.col, row, col);
                    }
                }
            }
        }
    }

    isNeighbor(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
    }

    attack(fromRow, fromCol, toRow, toCol) {
        const attacker = this.board[fromRow][fromCol];
        const defender = this.board[toRow][toCol];

        const attackDice = Math.min(3, attacker.troops - 1);
        const defendDice = Math.min(2, defender.troops);

        const attackRolls = [];
        const defendRolls = [];

        for (let i = 0; i < attackDice; i++) {
            attackRolls.push(Math.floor(Math.random() * 6) + 1);
        }
        for (let i = 0; i < defendDice; i++) {
            defendRolls.push(Math.floor(Math.random() * 6) + 1);
        }

        attackRolls.sort((a, b) => b - a);
        defendRolls.sort((a, b) => b - a);

        this.diceResults = {
            attack: attackRolls,
            defend: defendRolls
        };

        let attackLosses = 0;
        let defendLosses = 0;

        const minRolls = Math.min(attackRolls.length, defendRolls.length);
        for (let i = 0; i < minRolls; i++) {
            if (attackRolls[i] > defendRolls[i]) {
                defendLosses++;
            } else {
                attackLosses++;
            }
        }

        defender.troops -= defendLosses;
        attacker.troops -= attackLosses;

        if (defender.troops <= 0) {
            defender.owner = attacker.owner;
            defender.troops = 1;
            attacker.troops--;
            this.conqueredTerritories++;
        }

        this.selectedTerritory = null;
        this.renderBoard();
        this.showBattleResult(attackRolls, defendRolls, attackLosses, defendLosses);
        this.updateUI();
        this.checkGameOver();
    }

    showBattleResult(attackRolls, defendRolls, attackLosses, defendLosses) {
        const modal = document.getElementById('battle-modal');
        const content = document.getElementById('battle-result-content');
        
        content.innerHTML = `
            <h3>战斗结果</h3>
            <div class="battle-info">
                <div class="attack-info">
                    <h4>攻击方</h4>
                    <p>骰子点数: ${attackRolls.join(', ')}</p>
                    <p>损失: ${attackLosses}</p>
                </div>
                <div class="defend-info">
                    <h4>防守方</h4>
                    <p>骰子点数: ${defendRolls.join(', ')}</p>
                    <p>损失: ${defendLosses}</p>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 2000);
    }

    endTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.selectedTerritory = null;
        this.gamePhase = 'reinforce';
        this.calculateReinforcements();
        this.renderBoard();
        this.updateUI();
    }

    updateUI() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        document.querySelectorAll('.player').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(`player-${currentPlayer}`).classList.add('active');
        
        document.getElementById('turn-indicator').textContent = 
            `${this.getPlayerName(currentPlayer)}回合`;
        
        document.getElementById('game-phase').textContent = 
            this.gamePhase === 'reinforce' ? '增兵阶段' : '攻击阶段';
        
        document.getElementById('reinforcements').textContent = this.reinforcements;

        this.updatePlayerStats();
    }

    getPlayerName(player) {
        const names = {
            'red': '红方',
            'blue': '蓝方',
            'green': '绿方',
            'yellow': '黄方'
        };
        return names[player];
    }

    updatePlayerStats() {
        this.players.forEach(player => {
            let territories = 0;
            let troops = 0;
            
            for (let row = 0; row < 10; row++) {
                for (let col = 0; col < 10; col++) {
                    if (this.board[row][col].owner === player) {
                        territories++;
                        troops += this.board[row][col].troops;
                    }
                }
            }
            
            document.getElementById(`${player}-territories`).textContent = territories;
            document.getElementById(`${player}-troops`).textContent = troops;
        });
    }

    checkGameOver() {
        const activePlayers = [];
        
        for (const player of this.players) {
            let hasTerritories = false;
            for (let row = 0; row < 10; row++) {
                for (let col = 0; col < 10; col++) {
                    if (this.board[row][col].owner === player) {
                        hasTerritories = true;
                        break;
                    }
                }
                if (hasTerritories) break;
            }
            if (hasTerritories) {
                activePlayers.push(player);
            }
        }

        if (activePlayers.length === 1) {
            this.endGame(`${this.getPlayerName(activePlayers[0])}获胜！`);
        }
    }

    endGame(message) {
        this.gameOver = true;
        document.getElementById('winner-text').textContent = message;
        document.getElementById('game-over-modal').style.display = 'block';
    }

    restart() {
        this.currentPlayerIndex = 0;
        this.selectedTerritory = null;
        this.gamePhase = 'setup';
        this.reinforcements = 0;
        this.conqueredTerritories = 0;
        this.gameOver = false;
        this.diceResults = [];
        
        this.createBoard();
        this.setupTerritories();
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
    new TerritoryWarGame();
});