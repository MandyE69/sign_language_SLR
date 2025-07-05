# File: app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from .models import db, User
import os
import logging
import pickle, numpy as np
import mediapipe as mp


bcrypt = Bcrypt()
login_manager = LoginManager()


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/asl'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    logging.basicConfig(level=logging.INFO)

    # ── Load trained model once ───────────────────────────────────
    model = pickle.load(open('model.p', 'rb'))['model']
    labels_dict = {i: chr(65 + i) for i in range(26)}  # 0→A … 25→Z

    # ── MediaPipe Hands (tracking mode) ───────────────────────────
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(
        static_image_mode=False,      # track across frames
        max_num_hands=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )

    # Configure logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger('signlanguage')
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    app.logger = logger

    # Init extensions
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)

    # Configure login manager
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'

    # ── Load ML model from model.p ──
    try:
        ml_dir = os.path.join(app.root_path, 'ml')
        os.makedirs(ml_dir, exist_ok=True)
        model_path = os.path.join(ml_dir, 'model.p')
        if os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                obj = pickle.load(f)
            app.sign_model = obj['model'] if isinstance(obj, dict) else obj
            app.logger.info("✅ model.p loaded successfully")
        else:
            app.sign_model = None
            app.logger.warning("⚠️ model.p not found in /ml")

    except Exception as e:
        app.logger.error(f"❌ Error loading model.p: {e}")
        app.sign_model = None

    # Create tables
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("✅ Database tables created")
        except Exception as e:
            app.logger.error(f"❌ Database error: {str(e)}")

    # Register blueprints
    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)

    from .routes import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app


@login_manager.user_loader
def load_user(user_id):
    try:
        return User.query.get(int(user_id))
    except Exception as e:
        logging.error(f"User load error: {str(e)}")
        return None
