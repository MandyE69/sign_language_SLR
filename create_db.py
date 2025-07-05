# create_tables.py  (place this at project root)
from app import create_app, db          # adjust imports to your layout
from app.models import *               # make sure User is imported

app = create_app()                     # or however you build the Flask app

with app.app_context():
    db.create_all()
    print("✓ All tables created")
