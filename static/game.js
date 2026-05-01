const Game = {
    canvas: document.getElementById('gameCanvas'),
    ctx: document.getElementById('gameCanvas').getContext('2d'),

    gridSize: 60,              // Size of each square tile
    tileCount: 15,             // Number of tiles per row/column

    snake: [],                 // Stores snake body segments
    direction: { x: 1, y: 0 }, // Initial movement direction
    score: 1,
    startTime: null,

    foods: [],                 // Active food objects

    interval: null,            // Main game loop timer
    immunityTimer: null,       // Immunity timeout
    speedResetTimer: null,     // Speed boost timeout

    isImmune: false,
    speed: 200,                // Default snake speed (ms)

    init() {
        // Place snake in center of board
        this.snake = [{
            x: Math.floor(this.tileCount / 2),
            y: Math.floor(this.tileCount / 2)
        }];

        // Reset all gameplay variables
        this.direction = { x: 1, y: 0 };
        this.score = 1;
        this.isImmune = false;
        this.speed = 200;
        this.startTime = Date.now();

        // Clear previous timers
        if (this.interval) clearInterval(this.interval);
        if (this.immunityTimer) clearTimeout(this.immunityTimer);
        if (this.speedResetTimer) clearTimeout(this.speedResetTimer);

        // Reset food
        this.foods = [];
        this.spawnFood();

        // Attach keyboard listener
        window.onkeydown = (e) => this.handleInput(e);

        // Start main game loop
        this.interval = setInterval(() => this.loop(), this.speed);

        this.draw();
    },

    spawnFood() {
        const types = [
            { name: "Carrot", color: "orange", val: 1 },
            { name: "Pumpkin Pie", color: "brown", val: 3 },
            { name: "Golden Apple", color: "gold", val: 0, immune: true },
            { name: "Power Fruit", color: "blue", val: 0, fast: true },
            { name: "Super Power Fruit", color: "purple", val: 0, immune: true, fast: true }
        ];

        let attempts = 0;
        let valid = false;
        let newFood;

        // Prevent infinite loops if board fills up
        while (!valid && attempts < 500) {
            attempts++;

            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount),
                ...types[Math.floor(Math.random() * types.length)]
            };

            // Ensure food does not overlap snake
            const onSnake = this.snake.some(
                s => s.x === newFood.x && s.y === newFood.y
            );

            // Ensure food does not overlap existing food
            const onFood = this.foods.some(
                f => f.x === newFood.x && f.y === newFood.y
            );

            if (!onSnake && !onFood) valid = true;
        }

        if (valid) {
            this.foods.push(newFood);
        }
    },

    loop() {
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // Normal collision rules
        if (!this.isImmune) {
            // Wall collision
            if (
                head.x < 0 || head.x >= this.tileCount ||
                head.y < 0 || head.y >= this.tileCount
            ) {
                return this.endGame("WALL");
            }

            // Self collision (excluding tail because tail may move)
            const bodyToCheck = this.snake.slice(0, this.snake.length - 1);

            if (bodyToCheck.some(
                s => s.x === head.x && s.y === head.y
            )) {
                return this.endGame("SELF");
            }

        } else {
            // Immunity mode allows wraparound
            if (head.x < 0) head.x = this.tileCount - 1;
            if (head.x >= this.tileCount) head.x = 0;
            if (head.y < 0) head.y = this.tileCount - 1;
            if (head.y >= this.tileCount) head.y = 0;
        }

        // Add new head position
        this.snake.unshift(head);

        // Check if snake ate food
        const foodIndex = this.foods.findIndex(
            f => f.x === head.x && f.y === head.y
        );

        if (foodIndex !== -1) {
            const food = this.foods[foodIndex];

            // Speed boost effect
            if (food.fast) {
                this.speedUp();
            }

            // Immunity effect
            if (food.immune) {
                this.startImmunity();
            }

            // Growth food
            if (food.val > 0) {
                for (let i = 1; i < food.val; i++) {
                    this.snake.push({
                        ...this.snake[this.snake.length - 1]
                    });
                }
            }
            else{
                    this.snake.pop()
            }
            // Remove consumed food
            this.foods.splice(foodIndex, 1);

            // Spawn replacement food
            this.spawnFood();

        } else {
            // Standard movement removes tail
            this.snake.pop();
        }

        // Score always equals snake length
        this.score = this.snake.length;

        this.draw();
    },

    speedUp() {
        // Prevent stacking speed boosts
        if (this.interval) clearInterval(this.interval);
        if (this.speedResetTimer) clearTimeout(this.speedResetTimer);

        // Temporary faster speed
        this.interval = setInterval(() => this.loop(), 175);

        // Restore normal speed after 10 seconds
        this.speedResetTimer = setTimeout(() => {
            clearInterval(this.interval);
            this.interval = setInterval(() => this.loop(), 200);
        }, 10000);
    },

    startImmunity() {
        this.isImmune = true;

        // Reset immunity timer if another power-up is eaten
        if (this.immunityTimer) clearTimeout(this.immunityTimer);

        this.immunityTimer = setTimeout(() => {
            this.isImmune = false;
        }, 10000);
    },

    draw() {
        // Clear canvas
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        // Draw board grid
        this.ctx.strokeStyle = "#999";
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }

        const inset = 2; // Slight padding inside tiles

        // Draw foods
        this.foods.forEach(f => {
            this.ctx.fillStyle = f.color;
            this.ctx.fillRect(
                f.x * this.gridSize + inset,
                f.y * this.gridSize + inset,
                this.gridSize - 2 * inset,
                this.gridSize - 2 * inset
            );
        });

        // Draw snake
        this.ctx.fillStyle = this.isImmune ? "cyan" : "lime";

        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize + inset,
                segment.y * this.gridSize + inset,
                this.gridSize - 2 * inset,
                this.gridSize - 2 * inset
            );
        });
    },

    handleInput(e) {
        const key = e.key;

        // Prevent reversing into itself
        if (
            (key === 'w' || key === 'W' || key === 'ArrowUp') &&
            this.direction.y === 0
        ) {
            this.direction = { x: 0, y: -1 };
        }

        if (
            (key === 's' || key === 'S' || key === 'ArrowDown') &&
            this.direction.y === 0
        ) {
            this.direction = { x: 0, y: 1 };
        }

        if (
            (key === 'a' || key === 'A' || key === 'ArrowLeft') &&
            this.direction.x === 0
        ) {
            this.direction = { x: -1, y: 0 };
        }

        if (
            (key === 'd' || key === 'D' || key === 'ArrowRight') &&
            this.direction.x === 0
        ) {
            this.direction = { x: 1, y: 0 };
        }
    },

    endGame(cause) {
        // Stop all timers
        clearInterval(this.interval);
        clearTimeout(this.immunityTimer);
        clearTimeout(this.speedResetTimer);

        // Calculate survival time
        const duration = Math.floor(
            (Date.now() - this.startTime) / 1000
        );

        // Show UI modal
        UI.showGameOver(
            this.score,
            cause,
            duration
        );

        // Send score to backend
        API.saveScore({
            name: window.playerName,
            score: this.score,
            cause: cause,
            duration: duration
        });
    }
};
