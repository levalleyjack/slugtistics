# wsgi.py
from app import app, init_app

# Initialize the application before running
init_app()

if __name__ == "__main__":
    # Use port 5001 because macOS ControlCenter uses port 5000
    app.run(host="0.0.0.0", port=5001, debug=True)