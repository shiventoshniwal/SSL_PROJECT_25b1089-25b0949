const Game = {
    canvas: document.getElementById('gameCanvas'),
    ctx: document.getElementById('gameCanvas').getContext('2d'),
    gridSize: 20,
    tileCount: 20,
    snake: [],
    direction: { x: 1, y: 0 },
    score: 1,
    startTime: null,
    food: null,
    isImmune: false,
    immunityTimer: null,
    interval: null,
    speed: 150, // Reduced speed for better playability

    init() {
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.score = 1; // Score = Length
        this.isImmune = false;
        if (this.immunityTimer) clearTimeout(this.immunityTimer);
        this.startTime = Date.now();

        this.spawnFood();
        window.onkeydown = (e) => this.handleInput(e);

        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.loop(), this.speed);
    },

    spawnFood() {
        const types = [
            { name: "Carrot", color: "orange", val: 1 },
            { name: "Pumpkin Pie", color: "brown", val: 3 },
            { name: "Golden Apple", color: "gold", val: 0, immune: true }
        ];
        const t = types[Math.floor(Math.random() * types.length)];
        this.food = { x: Math.floor(Math.random()*20), y: Math.floor(Math.random()*20), ...t };
    },

    loop() {
        const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };

        // 1. Collision Logic
        if (!this.isImmune) {
            // Check Walls
            if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) return this.endGame("WALL");
            // Check Self
            if (this.snake.some(s => s.x === head.x && s.y === head.y)) return this.endGame("SELF");
        } else {
            // Wrapping logic while immune
            if (head.x < 0) head.x = 19; if (head.x > 19) head.x = 0;
            if (head.y < 0) head.y = 19; if (head.y > 19) head.y = 0;
        }

        this.snake.unshift(head);

        // 2. Food Logic
        if (head.x === this.food.x && head.y === this.food.y) {
            if (this.food.immune) {
                this.snake.pop(); // Golden Apple: No length increase
                this.startImmunity();
            } else {
                // Growth: Carrot (+1) or Pie (+3)
                for (let i = 1; i < this.food.val; i++) {
                    this.snake.push({ ...this.snake[this.snake.length - 1] });
                }
                this.score = this.snake.length;
            }
            this.spawnFood();
        } else {
            this.snake.pop(); // Normal movement
        }
        this.draw();
    },

    startImmunity() {
        this.isImmune = true;
        if (this.immunityTimer) clearTimeout(this.immunityTimer);
        this.immunityTimer = setTimeout(() => { this.isImmune = false; }, 10000); // 10s immunity
    },

    draw() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, 400, 400);
        // Draw Food
        this.ctx.fillStyle = this.food.color;
        this.ctx.fillRect(this.food.x * 20, this.food.y * 20, 18, 18);
        // Draw Snake (Cyan if immune, Lime if normal)
        this.ctx.fillStyle = this.isImmune ? "cyan" : "lime";
        this.snake.forEach(s => this.ctx.fillRect(s.x * 20, s.y * 20, 18, 18));
    },

    handleInput(e) {
        const key = e.key;
        if ((key === 'w' || key === 'W' || key === 'ArrowUp') && this.direction.y === 0) this.direction = { x: 0, y: -1 };
        if ((key === 's' || key === 'S' || key === 'ArrowDown') && this.direction.y === 0) this.direction = { x: 0, y: 1 };
        if ((key === 'a' || key === 'A' || key === 'ArrowLeft') && this.direction.x === 0) this.direction = { x: -1, y: 0 };
        if ((key === 'd' || key === 'D' || key === 'ArrowRight') && this.direction.x === 0) this.direction = { x: 1, y: 0 };
    },

    endGame(cause) {
        clearInterval(this.interval);
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        UI.showGameOver(this.score, cause, duration);
        // Automatically send score to Flask server 
        API.saveScore({ name: window.playerName, score: this.score, cause: cause, duration: duration });
    }
};
