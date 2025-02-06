# wsgi.py
from app import app, init_app

# Initialize the application before running
init_app()

if __name__ == "__main__":
    app.run()