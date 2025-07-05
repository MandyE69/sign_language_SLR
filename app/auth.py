from flask import Blueprint, render_template, redirect, url_for, flash, request
from .models import db, User
from flask_login import login_user, logout_user, login_required, current_user
from . import bcrypt

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    # Redirect if already logged in
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
        
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        if not email or not password:
            flash('Please fill in all fields.', 'error')
            return render_template('login.html')

        user = User.query.filter_by(Umail=email).first()

        if user and bcrypt.check_password_hash(user.Upass, password):
            login_user(user, remember=True)
            flash('Welcome back! You have successfully logged in.', 'success')
            
            # Redirect to next page if specified, otherwise to index
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('main.index'))
        else:
            flash('Invalid email or password. Please try again.', 'error')
    
    return render_template('login.html')

@auth.route('/signup', methods=['GET', 'POST'])
def signup():
    # Redirect if already logged in
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
        
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        # Validation
        if not username or not email or not password:
            flash('Please fill in all fields.', 'error')
            return render_template('signup.html')

        if len(password) < 6:
            flash('Password must be at least 6 characters long.', 'error')
            return render_template('signup.html')

        # Check if user already exists
        existing_user = User.query.filter_by(Umail=email).first()
        if existing_user:
            flash('Email already registered. Please use a different email.', 'error')
            return render_template('signup.html')

        try:
            # Create new user
            hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
            new_user = User(Uname=username, Umail=email, Upass=hashed_password)
            db.session.add(new_user)
            db.session.commit()
            
            flash('Account created successfully! Please sign in.', 'success')
            return redirect(url_for('auth.login'))
        except Exception as e:
            db.session.rollback()
            flash('An error occurred while creating your account. Please try again.', 'error')
    
    return render_template('signup.html')

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been successfully logged out. See you soon!', 'info')
    return redirect(url_for('auth.login'))
