class TerritoryIOGame {
    constructor() {
        this.grid = [];
        this.gridSize = 50;
        this.cellSize = 12;
        this.players = [];
        this.currentPlayer = null;
        this.gameRunning = false;
        this.canvas = null;
        this.ctx = null;
        this.expansionRate = 0.5;
        this.baseGrowthRate = 0.1;
        
        this.init();
    }

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.setupCanvas();
        this.createGrid();
        this.setupPlayers();
        this.setupEventListeners();
        this.startGame();
    }

    setupCanvas() {
        this.canvas.width = this.gridSize * this.cellSize;
        this.canvas.height = this.gridSize * this.cellSize;
    }

    createGrid() {
        this.grid = [];
        for (let y = 0; y < this.gridSize; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridSize; x++) {
                this.grid[y][x] = {
                    owner: null,
                    troops: 0
                };
            }
        }
    }

    setupPlayers() {
        const colors = [
            { name: '玩家', color: '#ff6b6b', isPlayer: true },
            { name: 'AI 1', color: '#4dabf7', isPlayer: false },
            { name: 'AI 2', color: '#51cf66', isPlayer: false },
            { name: 'AI 3', color: '#ffd43b', isPlayer: false },
            { name: 'AI 4', color: '#cc5de8', isPlayer: false },
            { name: 'AI 5', color: '#ff922b', isPlayer: false }
        ];

        this.players = colors.map((c, index) => ({
            id: index,
            name: c.name,
            color: c.color,
            isPlayer: c.isPlayer,
            totalTroops: 0,
            territoryCount: 0,
            expansionRate: 0.5,
            isAlive: true
        }));

        const positions = [
            { x: 5, y: 5 },
            { x: 44, y: 5 },
            { x: 5, y: 44 },
            { x: 44, y: 44 },
            { x: 25, y: 5 },
            { x: 25, y: 44 }
        ];

        this.players.forEach((player, index) => {
            const pos = positions[index];
            const startX = pos.x;
            const startY = pos.y;
            
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = startX + dx;
                    const ny = startY + dy;
                    if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
                        this.grid[ny][nx].owner = player.id;
                        this.grid[ny][nx].troops = 100;
                    }
                }
            }
            
            player.territoryCount = 9;
            player.totalTroops = 900;
        });

        this.currentPlayer = this.players[0];
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('rules-btn').addEventListener('click', () => this.showRules());
        document.getElementById('expansion-slider').addEventListener('input', (e) => {
            this.currentPlayer.expansionRate = parseInt(e.target.value) / 100;
            document.getElementById('expansion-value').textContent = e.target.value + '%';
        });
    }

    handleClick(e) {
        if (!this.gameRunning || !this.currentPlayer.isPlayer) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.cellSize);
        const y = Math.floor((e.clientY - rect.top) / this.cellSize);

        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            this.selectTerritory(x, y);
        }
    }

    handleMouseMove(e) {
        if (!this.gameRunning || !this.currentPlayer.isPlayer) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.cellSize);
        const y = Math.floor((e.clientY - rect.top) / this.cellSize);

        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            this.mouseX = x;
            this.mouseY = y;
        }
    }

    selectTerritory(x, y) {
        const cell = this.grid[y][x];
        if (cell.owner === this.currentPlayer.id) {
            this.selectedTerritory = { x, y };
        }
    }

    startGame() {
        this.gameRunning = true;
        this.gameLoop();
    }

    gameLoop() {
        if (!this.gameRunning) return;

        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.players.forEach(player => {
            if (!player.isAlive) return;

            let totalTerritoryTroops = 0;
            let territoryCount = 0;

            for (let y = 0; y < this.gridSize; y++) {
                for (let x = 0; x < this.gridSize; x++) {
                    const cell = this.grid[y][x];
                    if (cell.owner === player.id) {
                        const growth = this.baseGrowthRate * (1 + territoryCount * 0.01);
                        cell.troops += growth;
                        totalTerritoryTroops += cell.troops;
                        territoryCount++;
                    }
                }
            }

            player.totalTroops = totalTerritoryTroops;
            player.territoryCount = territoryCount;

            if (territoryCount === 0) {
                player.isAlive = false;
            }

            if (!player.isPlayer && player.isAlive) {
                this.aiAction(player);
            }
        });

        this.handleExpansion();
        this.checkGameOver();
    }

    aiAction(player) {
        if (Math.random() < 0.02) {
            const territories = [];
            for (let y = 0; y < this.gridSize; y++) {
                for (let x = 0; x < this.gridSize; x++) {
                    const cell = this.grid[y][x];
                    if (cell.owner === player.id && cell.troops > 50) {
                        territories.push({ x, y, troops: cell.troops });
                    }
                }
            }

            if (territories.length > 0) {
                const source = territories[Math.floor(Math.random() * territories.length)];
                const neighbors = this.getNeighbors(source.x, source.y);
                const emptyNeighbors = neighbors.filter(n => 
                    this.grid[n.y][n.x].owner !== player.id
                );

                if (emptyNeighbors.length > 0) {
                    const target = emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
                    this.expand(source.x, source.y, target.x, target.y, player.expansionRate);
                }
            }
        }
    }

    handleExpansion() {
        if (!this.currentPlayer.isPlayer || !this.selectedTerritory) return;

        const source = this.grid[this.selectedTerritory.y][this.selectedTerritory.x];
        if (source.owner === this.currentPlayer.id && source.troops > 10) {
            const neighbors = this.getNeighbors(this.selectedTerritory.x, this.selectedTerritory.y);
            
            neighbors.forEach(n => {
                if (this.grid[n.y][n.x].owner !== this.currentPlayer.id) {
                    this.expand(this.selectedTerritory.x, this.selectedTerritory.y, n.x, n.y, this.currentPlayer.expansionRate);
                }
            });
        }
    }

    expand(fromX, fromY, toX, toY, rate) {
        const fromCell = this.grid[fromY][fromX];
        const toCell = this.grid[toY][toX];

        if (fromCell.troops <= 10) return;

        const troopsToSend = fromCell.troops * rate;
        fromCell.troops -= troopsToSend;

        if (toCell.owner === null) {
            toCell.owner = fromCell.owner;
            toCell.troops = troopsToSend;
        } else if (toCell.owner !== fromCell.owner) {
            toCell.troops -= troopsToSend;
            if (toCell.troops <= 0) {
                toCell.owner = fromCell.owner;
                toCell.troops = Math.abs(toCell.troops);
            }
        }
    }

    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
                neighbors.push({ x: nx, y: ny });
            }
        }

        return neighbors;
    }

    render() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = this.grid[y][x];
                
                if (cell.owner !== null) {
                    const player = this.players[cell.owner];
                    this.ctx.fillStyle = player.color;
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                } else {
                    this.ctx.fillStyle = '#2d2d44';
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }

        if (this.selectedTerritory) {
            this.ctx.strokeStyle = '#ffd700';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                this.selectedTerritory.x * this.cellSize,
                this.selectedTerritory.y * this.cellSize,
                this.cellSize,
                this.cellSize
            );
        }

        this.updateUI();
    }

    updateUI() {
        const sortedPlayers = [...this.players].sort((a, b) => b.totalTroops - a.totalTroops);
        
        let html = '';
        sortedPlayers.forEach((player, index) => {
            if (!player.isAlive) return;
            html += `
                <div class="player-stat ${player.isPlayer ? 'player' : ''}" style="border-left: 4px solid ${player.color}">
                    <div class="player-rank">#${index + 1}</div>
                    <div class="player-name">${player.name}</div>
                    <div class="player-stats">
                        <div>兵力: ${Math.floor(player.totalTroops)}</div>
                        <div>领土: ${player.territoryCount}</div>
                    </div>
                </div>
            `;
        });
        
        document.getElementById('player-stats').innerHTML = html;
    }

    checkGameOver() {
        const alivePlayers = this.players.filter(p => p.isAlive);
        
        if (alivePlayers.length === 1) {
            this.gameRunning = false;
            const winner = alivePlayers[0];
            document.getElementById('winner-text').textContent = `${winner.name} 获胜！`;
            document.getElementById('game-over-modal').style.display = 'block';
        } else if (alivePlayers.length === 0) {
            this.gameRunning = false;
            document.getElementById('winner-text').textContent = '游戏结束！';
            document.getElementById('game-over-modal').style.display = 'block';
        }
    }

    restart() {
        this.createGrid();
        this.setupPlayers();
        this.selectedTerritory = null;
        this.gameRunning = true;
        document.getElementById('game-over-modal').style.display = 'none';
        this.gameLoop();
    }

    showRules() {
        document.getElementById('rules-modal').style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TerritoryIOGame();
});