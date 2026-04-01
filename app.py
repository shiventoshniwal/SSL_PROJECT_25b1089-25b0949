from flask import Flask, request, jsonify, send_from_directory
import datetime
import os

# Initialize Flask to look into the 'static' folder
app = Flask(__name__, static_folder='static')

@app.route('/')
def index():
    # Serves the frontend to the browser
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/save_score', methods=['POST'])
def save_score():
    try:
        data = request.get_json()

        # Validation to prevent data corruption
        required = ["name", "score", "cause", "duration"]
        if not all(k in data for k in required):
            return jsonify({"error": "Invalid Data"}), 400

        # Consistent format for history.txt
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = f"[{timestamp}] {data['name']} | {data['score']} {data['cause']} {data['duration']}\n"

        # Append score to history.txt
        with open("history.txt", "a") as f:
            f.write(entry)

        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Must run on localhost:5000
    app.run(host='127.0.0.1', port=5000, debug=True)
