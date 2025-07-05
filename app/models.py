from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'user'

    Uid = db.Column(db.Integer, primary_key=True)
    Uname = db.Column(db.String(255), nullable=False)
    Umail = db.Column(db.String(255), unique=True, nullable=False)
    Upass = db.Column(db.String(255), nullable=False)

    # Flask-Login requires this method to return a unique ID
    def get_id(self):
        return str(self.Uid)

    def __repr__(self):
        return f'<User {self.Uname}>'
