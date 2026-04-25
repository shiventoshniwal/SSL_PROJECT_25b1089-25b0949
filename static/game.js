const Game = {
    canvas: document.getElementById('gameCanvas'),
    ctx: document.getElementById('gameCanvas').getContext('2d'),
    gridSize: 60,
    tileCount: 15,
    snake: [],
    direction: { x: 1, y: 0 },
    score: 1,
    startTime: null,

    foods: [],
    foodSpawner: null,

    isImmune: false,
    immunityTimer: null,
    interval: null,
    speed: 200,

    init() {
        this.snake = [{
            x: Math.floor(this.tileCount / 2),
            y: Math.floor(this.tileCount / 2)
        }];

        this.direction = { x: 1, y: 0 };
        this.score = 1;
        this.isImmune = false;
        
        //clear existing timer
        if (this.immunityTimer) clearTimeout(this.immunityTimer);
        this.startTime = Date.now();

        this.foods = [];
        this.spawnFood();

        window.onkeydown = (e) => this.handleInput(e);

        //repeat code in loop() every 200ms
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.loop(), this.speed);

        this.draw();
    },

    spawnFood() {
        const types = [
            { name: "Carrot", color: "orange", val: 1 },
            { name: "Pumpkin Pie", color: "brown", val: 3 },
            { name: "Golden Apple", color: "gold", val: 0, immune: true }
        ];

        let newFood;
        let valid = false;
        //checking whether valid (non-overlapping) food exists 
        // ... expands to elements of iterable so this chooses any one food at random
        while (!valid) {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount),
                ...types[Math.floor(Math.random() * types.length)]
            };

        // .some for checking if at least one array element satisfies condition
            const onSnake = this.snake.some(
                s => s.x === newFood.x && s.y === newFood.y
            );

            const onFood = this.foods.some(
                f => f.x === newFood.x && f.y === newFood.y
            );

            if (!onSnake && !onFood) valid = true;
        }

        this.foods.push(newFood);
    },

    loop() {
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        if (!this.isImmune) {
            if (
                head.x < 0 || head.x >= this.tileCount ||
                head.y < 0 || head.y >= this.tileCount
            ) return this.endGame("WALL");

            if (this.snake.some(s => s.x === head.x && s.y === head.y))
                return this.endGame("SELF");
        } else {
            if (head.x < 0) head.x = this.tileCount - 1;
            if (head.x >= this.tileCount) head.x = 0;
            if (head.y < 0) head.y = this.tileCount - 1;
            if (head.y >= this.tileCount) head.y = 0;
        }

        //adding new position of head to snake array
        this.snake.unshift(head);

        const foodIndex = this.foods.findIndex(
            f => f.x === head.x && f.y === head.y
        );

        if (foodIndex !== -1) {
            const food = this.foods[foodIndex];

            if (food.immune) {
                this.snake.pop();
                this.startImmunity();
            } 
            //Add copies of last 'food.val' number of elements in snake array. 
            //Increase in length becomes visible when snake moves as the original copies of those elements are still there.
            else {
                for (let i = 1; i < food.val; i++) {
                    this.snake.push({
                        ...this.snake[this.snake.length - 1]
                    });
                }

                this.score = this.snake.length;
            }
            //remove food if eaten
            this.foods.splice(foodIndex, 1);
            this.spawnFood();

        } else {
            this.snake.pop();
        }

        this.draw();
    },

    startImmunity() {
        this.isImmune = true;

        if (this.immunityTimer) clearTimeout(this.immunityTimer);

        this.immunityTimer = setTimeout(() => {
            this.isImmune = false;
        }, 10000);
    },

    draw() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, 900, 900);

        // Grid
        this.ctx.strokeStyle = "#999";
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, 900);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(900, i * this.gridSize);
            this.ctx.stroke();
        }

        const inset = 2;

        // Foods
        this.foods.forEach(f => {
            this.ctx.fillStyle = f.color;
            this.ctx.fillRect(
                f.x * this.gridSize + inset,
                f.y * this.gridSize + inset,
                this.gridSize - 2 * inset,
                this.gridSize - 2 * inset
            );
        });

        // Snake
        this.ctx.fillStyle = this.isImmune ? "cyan" : "lime";
        this.snake.forEach(s =>
            this.ctx.fillRect(
                s.x * this.gridSize + inset,
                s.y * this.gridSize + inset,
                this.gridSize - 2 * inset,
                this.gridSize - 2 * inset
            )
        );
    },

    handleInput(e) {
        const key = e.key;
        //origin at top left corner, y coordinate increases downwards
        if ((key === 'w' || key === 'W' || key === 'ArrowUp') && this.direction.y === 0)
            this.direction = { x: 0, y: -1 };

        if ((key === 's' || key === 'S' || key === 'ArrowDown') && this.direction.y === 0)
            this.direction = { x: 0, y: 1 };

        if ((key === 'a' || key === 'A' || key === 'ArrowLeft') && this.direction.x === 0)
            this.direction = { x: -1, y: 0 };

        if ((key === 'd' || key === 'D' || key === 'ArrowRight') && this.direction.x === 0)
            this.direction = { x: 1, y: 0 };
    },

    endGame(cause) {
        clearInterval(this.interval);

        const duration = Math.floor(
            (Date.now() - this.startTime) / 1000
        );

        UI.showGameOver(this.score, cause, duration);

        API.saveScore({
            name: window.playerName,
            score: this.score,
            cause: cause,
            duration: duration
        });
    }
};
