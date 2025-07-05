# File: app/routes.py
from flask import Blueprint, render_template, request, jsonify, current_app
from flask_login import login_required, current_user
import numpy as np
from flask import Flask, render_template, request, jsonify
import pickle, base64, cv2, numpy as np
import mediapipe as mp
import logging

main = Blueprint('main', __name__)

# ── Load trained model once ───────────────────────────────────
model = pickle.load(open('model.p', 'rb'))['model']
labels_dict = {i: chr(65 + i) for i in range(26)}  # 0→A … 25→Z

# ── MediaPipe Hands (tracking mode) ───────────────────────────
mp_hands = mp.solutions.hands


@main.route('/')
@login_required
def index():
    return render_template('index.html', user=current_user)

@main.route('/about')
@login_required
def about():
    return render_template('about.html', user=current_user)

@main.route('/demo')
@login_required
def demo():
    return render_template('demo.html', user=current_user)

@main.route('/predict-ui')
@login_required
def predict_ui():
    return render_template('predict.html', user=current_user)

@main.route('/predict', methods=['POST'])
def predict():
    try:
        payload = request.get_json(force=True)
        img_b64 = payload['image'].split(',', 1)[1]
        img_bytes = base64.b64decode(img_b64)
    except Exception as e:
        main.logger.error(f"Bad payload: {e}")
        return jsonify({'error': 'Invalid image payload'}), 400

    # Decode image
    img_np = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
    if frame is None:
        return jsonify({'error': 'Failed to decode image'}), 400

    img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Use new hands instance per request to avoid MediaPipe graph errors
    with mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=1,
        min_detection_confidence=0.7
    ) as hands:
        results = hands.process(img_rgb)

    if not results.multi_hand_landmarks:
        return jsonify({'prediction': None, 'message': 'No hand detected'})

    lm = results.multi_hand_landmarks[0]
    xs, ys, feats = [], [], []

    for p in lm.landmark:
        xs.append(p.x)
        ys.append(p.y)
    for p in lm.landmark:
        feats.extend([p.x - min(xs), p.y - min(ys)])

    features = np.asarray(feats)
    pred_id = int(model.predict([features])[0])
    letter  = labels_dict.get(pred_id, '?')

    # Calculate prediction confidence
    if hasattr(model, "predict_proba"):
        confidence = float(np.max(model.predict_proba([features])[0])) * 100
    else:
        confidence = 100.0  # fallback for models that don't support probabilities

    return jsonify({
        'prediction': letter,
        'confidence': round(confidence, 2)
    })



@main.route('/train-status')
@login_required
def train_status():
    return jsonify({
        'model_loaded': current_app.sign_model is not None
    })

@main.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'ml_models_loaded': current_app.sign_model is not None
    }), 200
