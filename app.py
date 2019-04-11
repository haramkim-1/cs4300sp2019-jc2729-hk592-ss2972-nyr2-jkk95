from app import app, socketio
from flask_cors import CORS

if __name__ == "__main__":
  print("Flask app running at http://0.0.0.0:5000")
  CORS(app)
  socketio.run(app, host="0.0.0.0", port=5000)
