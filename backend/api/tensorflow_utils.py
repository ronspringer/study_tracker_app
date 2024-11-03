"""
This module provides functionalities for retrieving, preprocessing,
and analyzing study session data for users. It includes functions to 
train a machine learning model that predicts optimal study session 
durations and generates personalized study tips based on model predictions.
"""

import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, Input
from .models import StudySession, Progress, StudyTip
import numpy as np
from tensorflow.keras import layers
from tensorflow.keras.callbacks import EarlyStopping
from datetime import timedelta

# Data Retrieval and Preprocessing
def get_study_data(user):
    """
    Retrieves study session and progress data for a given user.

    Args:
        user: The user for whom to retrieve study data.

    Returns:
        Tuple of two DataFrames: sessions and progress for the user.
    """
    sessions = StudySession.objects.filter(subject__user=user).values('subject_id', 'session_date', 'duration_minutes')
    progress = Progress.objects.filter(subject__user=user).values('subject_id', 'total_minutes_studied', 'last_session_date')
    
    return sessions, progress


def preprocess_data(sessions, progress):
    """
    Preprocesses study session and progress data.

    Args:
        sessions: The study sessions data.
        progress: The progress data for the user.

    Returns:
        A DataFrame containing merged and preprocessed study data.

    Raises:
        ValueError: If either the sessions or progress data is empty.
    """
    session_df = pd.DataFrame(sessions)
    progress_df = pd.DataFrame(progress)

    if session_df.empty or progress_df.empty:
        raise ValueError("No data available for processing.")

    # Merge session and progress data on 'subject_id'
    data = pd.merge(session_df, progress_df, on='subject_id')
    le = LabelEncoder()
    # Encode 'subject_id' as numerical values
    data['subject_id'] = le.fit_transform(data['subject_id'])
    # Extract hour from session date
    data['session_hour'] = pd.to_datetime(data['session_date']).dt.hour

    # Standardize numerical features
    scaler = StandardScaler()
    data[['duration_minutes', 'total_minutes_studied']] = scaler.fit_transform(data[['duration_minutes', 'total_minutes_studied']])

    return data


# Model Architecture for Duration Prediction
def build_model(input_shape):
    """
    Builds a deep learning model for predicting study session duration.

    Args:
        input_shape: The shape of the input features.

    Returns:
        A compiled Keras model ready for training.
    """
    inputs = layers.Input(shape=(input_shape,))
    
    # Deep network with several hidden layers
    x = layers.Dense(128, activation='relu')(inputs)
    x = layers.Dense(64, activation='relu')(x)
    x = layers.Dense(32, activation='relu')(x)

    # Single output for continuous duration prediction
    duration_output = layers.Dense(1, name='duration_prediction')(x)

    model = Model(inputs=inputs, outputs=duration_output)
    # Compile model with Adam optimizer and mean squared error loss
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])  # Mean squared error for regression
    return model


# Model Training Function
def train_model(data):
    """
    Trains the deep learning model using preprocessed study data.

    Args:
        data: The preprocessed DataFrame containing study session data.

    Returns:
        The trained Keras model.
    """
    # Prepare training data
    X = data[['subject_id', 'total_minutes_studied', 'session_hour']].values
    y_duration = data['duration_minutes'].values  # Use duration as continuous target variable

    # Build and train model with early stopping
    model = build_model(X.shape[1])
    early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
    model.fit(X, y_duration, epochs=100, batch_size=16, validation_split=0.2, callbacks=[early_stopping])
    
    return model


# Generate Study Tip Based on Model Prediction
def generate_study_tip(model, subject, total_minutes_studied, session_time):
    """
    Generates a study tip based on the model's prediction of optimal study duration.

    Args:
        model: The trained Keras model used for prediction.
        subject: The subject for which to generate a study tip.
        total_minutes_studied: Total minutes studied by the user.
        session_time: The time of the current study session.

    Returns:
        A string containing the generated study tip.
    """
    # Adjust session time to UTC
    session_time_utc = session_time - timedelta(hours=4)
    subject_id = int(subject.id)
    session_hour = session_time_utc.hour + session_time_utc.minute / 60.0
    input_data = np.array([[subject_id, total_minutes_studied, session_hour]], dtype=np.float32)

    # Predict duration
    predicted_duration = model.predict(input_data)[0][0]

    # Create study suggestions based on predicted duration
    if predicted_duration <= 30:
        duration_suggestion = "25-30 minutes per session seems effective. Keep it up!"
    elif 30 < predicted_duration <= 45:
        duration_suggestion = "Consider extending your study sessions slightly for better retention."
    else:
        duration_suggestion = "You are studying for a long time. Take breaks to stay sharp."

    focus_suggestion = "Start with short, focused sessions." if predicted_duration <= 30 else "You're showing progress! Try to keep sessions around 40-45 minutes."

    # Determine time suggestion based on session hour
    if 6 <= session_hour < 12:
        time_suggestion = "Morning sessions are effective for fresh learning."
    elif 12 <= session_hour < 18:
        time_suggestion = "Afternoon studies provide a balanced focus."
    else:
        time_suggestion = "Late-night sessions might affect energy levels. Try earlier if possible."

    # Full suggestion combining duration, focus, and time feedback
    full_suggestion = f"{duration_suggestion} {focus_suggestion} {time_suggestion}"

    # Save the generated study tip to the database
    StudyTip.objects.create(subject=subject, suggestion=full_suggestion)
    return full_suggestion
