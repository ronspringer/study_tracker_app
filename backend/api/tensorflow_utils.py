import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from .models import StudySession, Progress, StudyTip
import traceback
import numpy as np
from django.utils import timezone
import datetime

def get_study_data(user):
    sessions = StudySession.objects.filter(subject__user=user).values('subject_id', 'session_date', 'duration_minutes')
    progress = Progress.objects.filter(subject__user=user).values('subject_id', 'total_minutes_studied', 'last_session_date')
    
    return sessions, progress

def preprocess_data(sessions, progress):
    session_df = pd.DataFrame(sessions)
    progress_df = pd.DataFrame(progress)
    
    # Check if dataframes are empty
    if session_df.empty or progress_df.empty:
        raise ValueError("No data available for processing.")
    
    # Merge dataframes on 'subject_id'
    data = pd.merge(session_df, progress_df, on='subject_id')

    # Check if merged data is empty
    if data.empty:
        raise ValueError("Merged data is empty, check your session and progress data.")

    le = LabelEncoder()
    data['subject_id'] = le.fit_transform(data['subject_id'])

    scaler = StandardScaler()
    data[['duration_minutes', 'total_minutes_studied']] = scaler.fit_transform(data[['duration_minutes', 'total_minutes_studied']])

    return data

def build_model(input_shape):
    model = Sequential([
        Dense(64, activation='relu', input_shape=(input_shape,)),  # Change input_shape to match the number of features
        Dense(32, activation='relu'),
        Dense(1, activation='linear')
    ])
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

def train_model(data):
    # Prepare features and target variable
    X = data[['subject_id', 'duration_minutes', 'total_minutes_studied']].values
    y = data['duration_minutes'].values  # Your target variable

    # Calculate session hour (You might need to adjust how you retrieve this)
    # Here you can set session_hour as an average, latest, or any specific logic
    session_hour = np.full((X.shape[0], 1), 12)  # Placeholder - replace this logic with actual session hour retrieval
    X = np.column_stack((X, session_hour))  # Add session_hour as the fourth feature

    model = build_model(X.shape[1])  # Now shape should be (4,)
    model.fit(X, y, epochs=10, batch_size=32, validation_split=0.2)
    return model


def generate_study_tip(model, user, subject, duration_minutes, total_minutes_studied, session_time):
    # Prepare input data for prediction
    subject_id = int(subject.id)
    session_hour = session_time.hour + session_time.minute / 60.0  # Convert time to decimal hours
    input_data = np.array([[subject_id, duration_minutes, total_minutes_studied, session_hour]], dtype=np.float32)

    # Make prediction
    prediction = model.predict(input_data)
    prediction_value = prediction[0][0] if prediction.size > 0 else None

    # Determine suggestion based on prediction value
    if prediction_value < 30:
        suggestion = "Consider increasing your study duration to improve focus."
    elif prediction_value > 60:
        suggestion = "You are studying for a long time. Take regular breaks to avoid burnout."
    else:
        suggestion = "Keep up your current study pace!"

    # Ideal focus time recommendation per subject
    # For example, assume focus time suggestions based on cumulative study data
    if total_minutes_studied < 120:
        focus_suggestion = "Try focusing for 25-30 minutes per session."
    elif total_minutes_studied < 300:
        focus_suggestion = "Your focus time is improving. Aim for 40-45 minutes per session."
    else:
        focus_suggestion = "Consider deep study sessions of 60 minutes with short breaks for best results."

    suggestion += " " + focus_suggestion

    # Add time-based feedback
    if 5 <= session_hour < 12:
        suggestion += " Morning studies are a good choice for learning new concepts."
    elif 12 <= session_hour < 17:
        suggestion += " Afternoon studies can help with steady energy levels; remember to take breaks."
    elif 17 <= session_hour < 21:
        suggestion += " Evening study sessions are effective for reviewing learned material."
    else:
        suggestion += " Late-night study can be tiring. Consider an earlier time if possible."

    # Save suggestion to StudyTip
    StudyTip.objects.create(subject=subject, suggestion=suggestion)

