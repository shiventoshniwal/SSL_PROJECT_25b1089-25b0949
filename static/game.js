const Game = {
    canvas: document.getElementById('gameCanvas'),
    ctx: document.getElementById('gameCanvas').getContext('2d'),
    gridSize: 30,
    tileCount: 30,
    snake: [],
    direction: { x: 1, y: 0 },
    score: 1,
    startTime: null,

    // changed from single food → multiple foods
    foods: [],
    foodSpawner: null,

    isImmune: false,
    immunityTimer: null,
    interval: null,
    speed: 150, // Reduced speed for better playability

    init() {
        this.snake = [{ x: 15, y: 15 }];
        this.direction = { x: 1, y: 0 };
        this.score = 1; // Score = Length
        this.isImmune = false;
        if (this.immunityTimer) clearTimeout(this.immunityTimer);
        this.startTime = Date.now();

        this.foods = [];

        // spawn initial food (instead of every 5 sec)
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

        let newFood;
        let valid = false;

        while (!valid) {
            newFood = {
                x: Math.floor(Math.random()*30),
                y: Math.floor(Math.random()*30),
                ...types[Math.floor(Math.random() * types.length)]
            };

            // ensure not on snake
            const onSnake = this.snake.some(s => s.x === newFood.x && s.y === newFood.y);

            // ensure not on another food
            const onFood = this.foods.some(f => f.x === newFood.x && f.y === newFood.y);

            if (!onSnake && !onFood) valid = true;
        }

        this.foods.push(newFood);
    },

    loop() {
        const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };

        // 1. Collision Logic
        if (!this.isImmune) {
            // Check Walls
            if (head.x < 0 || head.x >= 30 || head.y < 0 || head.y >= 30) return this.endGame("WALL");
            // Check Self
            if (this.snake.some(s => s.x === head.x && s.y === head.y)) return this.endGame("SELF");
        } else {
            // Wrapping logic while immune
            if (head.x < 0) head.x = 29; if (head.x > 29) head.x = 0;
            if (head.y < 0) head.y = 29; if (head.y > 29) head.y = 0;
        }

        this.snake.unshift(head);

        // food collision (multiple foods)
        const foodIndex = this.foods.findIndex(f => f.x === head.x && f.y === head.y);

        if (foodIndex !== -1) {
            const food = this.foods[foodIndex];

            if (food.immune) {
                this.snake.pop(); // Golden Apple: No length increase
                this.startImmunity();
            } else {
                // Growth: Carrot (+1) or Pie (+3)
                for (let i = 1; i < food.val; i++) {
                    this.snake.push({ ...this.snake[this.snake.length - 1] });
                }
                this.score = this.snake.length;
            }

            // remove eaten food
            this.foods.splice(foodIndex, 1);

            // spawn new food immediately
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
        this.ctx.fillRect(0, 0, 900, 900);

        // draw all foods
        this.foods.forEach(f => {
            this.ctx.fillStyle = f.color;
            this.ctx.fillRect(f.x * 30, f.y * 30, 28, 28);
        });

        // Draw Snake (Cyan if immune, Lime if normal)
        this.ctx.fillStyle = this.isImmune ? "cyan" : "lime";
        this.snake.forEach(s => this.ctx.fillRect(s.x * 30, s.y * 30, 28, 28));
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
        // clearInterval(this.foodSpawner); // removed

        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        UI.showGameOver(this.score, cause, duration);

        // Automatically send score to Flask server
        API.saveScore({ name: window.playerName, score: this.score, cause: cause, duration: duration });
    }
};
