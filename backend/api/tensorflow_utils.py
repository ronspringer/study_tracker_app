"""
This module implements machine learning functionality for tracking and 
enhancing study sessions within the application. It includes data 
retrieval, preprocessing, model building, training, and generating study 
tips based on predictions.

Key Functions:

1. get_study_data(user): Retrieves study session and progress data for 
   a specified user from the database.

2. preprocess_data(sessions, progress): Preprocesses the retrieved 
   study session and progress data, merging and encoding necessary fields, 
   and preparing labels for machine learning tasks.

3. build_model(input_shape): Defines a neural network architecture 
   using TensorFlow Keras, including input, hidden, and output layers for 
   predicting study duration, focus, and feedback.

4. train_model(data): Trains the neural network model using the preprocessed 
   data, fitting the model to predict the duration, focus, and time feedback 
   labels.

5. generate_study_tip(model, subject, duration_minutes, total_minutes_studied, session_time): 
   Generates personalized study tips based on model predictions for a 
   given subject and study parameters, saving the suggestions to the 
   StudyTip model.

This module integrates machine learning techniques to improve user 
engagement and effectiveness in study habits by providing actionable 
insights based on historical study data.
"""

# Import necessary libraries and modules
import pandas as pd  # Data manipulation library
from sklearn.preprocessing import LabelEncoder, StandardScaler  # Tools for encoding labels and scaling data
import tensorflow as tf  # TensorFlow for building machine learning models
from tensorflow.keras.models import Model  # Model class from Keras for defining models
from tensorflow.keras.layers import Dense, Input  # Layers used to build neural network
from .models import StudySession, Progress, StudyTip  # Import models from the current app
import numpy as np  # Numerical computing library
from tensorflow.keras import layers  # Layers for building neural network architectures
from tensorflow.keras.callbacks import EarlyStopping
from datetime import timedelta

# Function to retrieve study session and progress data for a specific user
def get_study_data(user):
    sessions = StudySession.objects.filter(subject__user=user).values('subject_id', 'session_date', 'duration_minutes')
    progress = Progress.objects.filter(subject__user=user).values('subject_id', 'total_minutes_studied', 'last_session_date')
    
    session_df = pd.DataFrame(sessions)
    if not session_df.empty:
        average_durations = session_df.groupby('subject_id')['duration_minutes'].mean().to_dict()
    else:
        average_durations = {}

    return sessions, progress, average_durations


# Function to preprocess data for the machine learning model
def preprocess_data(sessions, progress):
    session_df = pd.DataFrame(sessions)
    progress_df = pd.DataFrame(progress)

    if session_df.empty or progress_df.empty:
        raise ValueError("No data available for processing.")

    data = pd.merge(session_df, progress_df, on='subject_id')

    if data.empty:
        raise ValueError("Merged data is empty, check your session and progress data.")

    le = LabelEncoder()
    data['subject_id'] = le.fit_transform(data['subject_id'])
    data['session_hour'] = pd.to_datetime(data['session_date']).dt.hour

    # Calculate average duration by subject
    average_durations = data.groupby('subject_id')['duration_minutes'].mean().reset_index()
    average_durations.columns = ['subject_id', 'average_duration']
    data = pd.merge(data, average_durations, on='subject_id')

    # Scale and categorize data
    scaler = StandardScaler()
    data[['duration_minutes', 'total_minutes_studied']] = scaler.fit_transform(data[['duration_minutes', 'total_minutes_studied']])

    # Adjust bins based on the new averages
    data['duration_label'] = pd.cut(data['duration_minutes'], bins=[-np.inf, 25, 60, np.inf], labels=[0, 1, 2])
    data['focus_label'] = pd.cut(data['total_minutes_studied'], bins=[-np.inf, 60, 120, np.inf], labels=[0, 1, 2])
    data['time_label'] = pd.cut(data['session_hour'], bins=[-1, 6, 12, 18, 24], labels=[3, 0, 1, 2])

    return data


# Function to define the machine learning model architecture
def build_model(input_shape):
    inputs = layers.Input(shape=(input_shape,))
    
    # Deepen network for capturing more nuances in data
    x = layers.Dense(128, activation='relu')(inputs)
    x = layers.Dense(64, activation='relu')(x)
    x = layers.Dense(32, activation='relu')(x)

    # Output layers
    duration_output = layers.Dense(4, activation='softmax', name='duration_suggestion')(x)
    focus_output = layers.Dense(4, activation='softmax', name='focus_suggestion')(x)
    time_output = layers.Dense(4, activation='softmax', name='time_feedback')(x)

    model = Model(inputs=inputs, outputs=[duration_output, focus_output, time_output])
    model.compile(optimizer='adam', 
                loss={
                    'duration_suggestion': 'categorical_crossentropy',
                    'focus_suggestion': 'categorical_crossentropy',
                    'time_feedback': 'categorical_crossentropy'
                },
                metrics={
                    'duration_suggestion': 'accuracy',
                    'focus_suggestion': 'accuracy',
                    'time_feedback': 'accuracy'
                })
    return model


# Function to train the machine learning model
def train_model(data):
    # Extract features and labels for training
    X = data[['subject_id', 'duration_minutes', 'total_minutes_studied']].values
    session_hour = data['session_hour'].values.reshape(-1, 1)
    X = np.column_stack((X, session_hour))  # Combine features with session hour

    # Prepare target variables with one-hot encoding
    y_duration = tf.keras.utils.to_categorical(data['duration_label'].values, num_classes=4)
    y_focus = tf.keras.utils.to_categorical(data['focus_label'].values, num_classes=4)
    y_time = tf.keras.utils.to_categorical(data['time_label'].values, num_classes=4)

    # Build the model and fit it with a validation split
    model = build_model(X.shape[1])

    # Early stopping callback
    early_stopping = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
    model.fit(X, 
              {'duration_suggestion': y_duration, 
               'focus_suggestion': y_focus, 
               'time_feedback': y_time},
              epochs=10,
              batch_size=16, 
              validation_split=0.2,
              callbacks=[early_stopping])
    return model


# Function to generate a study tip based on model predictions
def generate_study_tip(model, subject, duration_minutes, total_minutes_studied, session_time, average_duration):
    # Adjust session_time for UTC+4
    session_time_utc = session_time - timedelta(hours=4)
    subject_id = int(subject.id)
    session_hour = session_time_utc.hour + session_time_utc.minute / 60.0
    input_data = np.array([[subject_id, duration_minutes, total_minutes_studied, session_hour]], dtype=np.float32)

    # Make predictions
    duration_prediction, focus_prediction, time_prediction = model.predict(input_data)

    # Generate suggestions dynamically based on the provided average_duration
    if average_duration <= 30:
        duration_suggestion = "25-30 minutes per session seems effective. Keep it up!"
    elif 30 < average_duration <= 45:
        duration_suggestion = "Consider extending your study sessions slightly for better retention."
    else:
        duration_suggestion = "You are studying for a long time. Take breaks to stay sharp."

    focus_suggestion = "Start with short, focused sessions." if average_duration <= 30 else "You're showing progress! Try to keep sessions around 40-45 minutes."

    # Determine time suggestion based on session hour
    if session_hour > 6 and session_hour < 12:
        time_suggestion = "Morning sessions are effective for fresh learning."
    elif session_hour >= 12 and session_hour < 18:
        time_suggestion = "Afternoon studies provide a balanced focus."
    else:
        time_suggestion = "Late-night sessions might affect energy levels. Try earlier if possible."

    # Construct full suggestion
    full_suggestion = f"{duration_suggestion} {focus_suggestion} {time_suggestion}"

    StudyTip.objects.create(subject=subject, suggestion=full_suggestion)
    return full_suggestion