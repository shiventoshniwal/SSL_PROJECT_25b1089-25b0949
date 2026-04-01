const UI = {
    startModal: new bootstrap.Modal(document.getElementById('startModal')),
    gameOverModal: new bootstrap.Modal(document.getElementById('gameOverModal')),
    sessionHighScore: 0,

    init() {
        this.startModal.show();
        document.getElementById('startBtn').onclick = () => {
            const name = document.getElementById('usernameInput').value;
            if (name.trim() !== "") {
                window.playerName = name;
                this.startModal.hide();
                Game.init();
            } else {
                alert("Please enter a username!");
            }
        };
    },

    // Updates and displays the game over stats
    showGameOver(score, cause, duration) {
        // Update session high score if current score is higher
        if (score > this.sessionHighScore) {
            this.sessionHighScore = score;
        }

        const body = document.getElementById('gameOverBody');
        body.innerHTML = `
            <div class="text-center text-dark">
                <p><strong>Player:</strong> ${window.playerName}</p>
                <p class="text-success"><strong>Session High Score:</strong> ${this.sessionHighScore}</p>
                <p><strong>Current Score (Length):</strong> ${score}</p>
                <p><strong>Cause:</strong> ${cause}</p>
                <p><strong>Duration:</strong> ${duration} seconds</p>
                <hr>
                <p class="text-muted small">Score = Snake Length</p>
            </div>
        `;
        this.gameOverModal.show();
    }
};

window.onload = () => UI.init();
