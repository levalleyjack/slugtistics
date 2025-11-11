from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
from pathlib import Path
from datetime import datetime
import pytz


app = Flask(__name__)
# Allow CORS from all origins (especially for local development)
# Simple CORS configuration that allows all origins
CORS(app, resources={r"/*": {"origins": "*"}})


current_dir = Path(__file__).parent
slugtistics_db_path = current_dir / "slugtistics.db"

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///courses.db?cache=shared")

app.config.update(
    SQLALCHEMY_DATABASE_URI=DATABASE_URL,
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SQLALCHEMY_ENGINE_OPTIONS={
        "pool_pre_ping": True,
        "pool_recycle": 300,  
        "pool_size": 20,   
        "max_overflow": 30,  
        "pool_timeout": 30,  
        "echo_pool": True     
    }
)

db = SQLAlchemy(app)
migrate = Migrate(app, db)

courses_cache = {}
instructor_cache = {}
gpa_cache = {}
