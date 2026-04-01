const API = {
    async saveScore(gameData) {
        // Automatically sends score using fetch API 
        const response = await fetch('/save_score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameData)
        });
        return response.json();
    }
};

