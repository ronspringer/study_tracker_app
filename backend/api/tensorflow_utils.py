"""
This module implements machine learning functionality for tracking and 
enhancing study sessions within the application. It includes data 
retrieval, preprocessing, model building, training, and generating study 
tips based on predictions.

Key Functions:

1. `get_study_data(user)`: Retrieves study session and progress data for 
   a specified user from the database.

2. `preprocess_data(sessions, progress)`: Preprocesses the retrieved 
   study session and progress data, merging and encoding necessary fields, 
   and preparing labels for machine learning tasks.

3. `build_model(input_shape)`: Defines a neural network architecture 
   using TensorFlow Keras, including input, hidden, and output layers for 
   predicting study duration, focus, and feedback.

4. `train_model(data)`: Trains the neural network model using the preprocessed 
   data, fitting the model to predict the duration, focus, and time feedback 
   labels.

5. `generate_study_tip(model, subject, duration_minutes, total_minutes_studied, session_time)`: 
   Generates personalized study tips based on model predictions for a 
   given subject and study parameters, saving the suggestions to the 
   StudyTip model.

This module integrates machine learning techniques to improve user 
engagement and effectiveness in study habits by providing actionable 
insights based on historical study data.
"""

# Import necessary libraries and modules
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, Input, Dropout, BatchNormalization
from .models import StudySession, Progress, StudyTip
import numpy as np
from tensorflow.keras.callbacks import EarlyStopping

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
    data['duration_label'] = pd.cut(data['duration_minutes'], bins=[-np.inf, 30, 60, np.inf], labels=[0, 1, 2])
    data['focus_label'] = pd.cut(data['total_minutes_studied'], bins=[-np.inf, 60, 120, np.inf], labels=[0, 1, 2])
    data['time_label'] = pd.cut(data['session_hour'], bins=[-1, 6, 12, 18, 24], labels=[3, 0, 1, 2])

    return data


# Function to define the machine learning model architecture
def build_model(input_shape):
    inputs = Input(shape=(input_shape,))
    
    x = Dense(256, activation='relu')(inputs)
    x = Dropout(0.4)(x)
    x = BatchNormalization()(x)
    
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.4)(x)
    x = BatchNormalization()(x)
    
    x = Dense(64, activation='relu')(x)
    x = Dropout(0.4)(x)
    x = BatchNormalization()(x)

    # Output layers for each prediction task
    duration_output = Dense(4, activation='softmax', name='duration_suggestion')(x)
    focus_output = Dense(4, activation='softmax', name='focus_suggestion')(x)
    time_output = Dense(4, activation='softmax', name='time_feedback')(x)

    model = Model(inputs=inputs, outputs=[duration_output, focus_output, time_output])
    
    # Use Adam optimizer
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001), 
                  loss={'duration_suggestion': 'categorical_crossentropy',
                        'focus_suggestion': 'categorical_crossentropy',
                        'time_feedback': 'categorical_crossentropy'},
                  metrics={
                      'duration_suggestion': 'accuracy',  # Metric for duration output
                      'focus_suggestion': 'accuracy',      # Metric for focus output
                      'time_feedback': 'accuracy'          # Metric for time feedback output
                  })
    return model


# Function to train the machine learning model
def train_model(data):
    X = data[['subject_id', 'duration_minutes', 'total_minutes_studied']].values
    session_hour = data['session_hour'].values.reshape(-1, 1)
    X = np.column_stack((X, session_hour))

    y_duration = tf.keras.utils.to_categorical(data['duration_label'].values, num_classes=4)
    y_focus = tf.keras.utils.to_categorical(data['focus_label'].values, num_classes=4)
    y_time = tf.keras.utils.to_categorical(data['time_label'].values, num_classes=4)

    model = build_model(X.shape[1])

    early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
    
    # Learning Rate Scheduler
    lr_scheduler = tf.keras.callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-6)

    model.fit(X, 
              {'duration_suggestion': y_duration, 
               'focus_suggestion': y_focus, 
               'time_feedback': y_time},
              epochs=100, 
              batch_size=16,
              validation_split=0.2,
              callbacks=[early_stopping, lr_scheduler])
    
    return model


# Function to generate a study tip based on model predictions
def generate_study_tip(model, subject, duration_minutes, total_minutes_studied, session_time):
    subject_id = int(subject.id)
    session_hour = session_time.hour + session_time.minute / 60.0
    input_data = np.array([[subject_id, duration_minutes, total_minutes_studied, session_hour]], dtype=np.float32)

    # Run prediction
    predictions = model.predict(input_data)

    # Unpack predictions
    duration_prediction = predictions[0][0]  # For duration suggestion
    focus_prediction = predictions[1][0]      # For focus suggestion
    time_prediction = predictions[2][0]       # For time feedback

    # Labels for each category of suggestion
    duration_labels = [
        "Consider shorter sessions for focused retention.",
        "25-30 minutes per session seems effective. Keep it up!",
        "Consider extending your study sessions slightly for better retention.",
        "You are studying for a long time. Take breaks to stay sharp."
    ]
    focus_labels = [
        "Try starting with brief, focused sessions.",
        "Maintain focused sessions around 25-30 minutes.",
        "You're showing progress! Try to keep sessions around 40-45 minutes.",
        "Your focus is impressive. Keep up the long sessions!"
    ]
    time_labels = [
        "Morning sessions are effective for fresh learning.",
        "Midday sessions provide balanced focus and retention.",
        "Afternoon studies are productive for review.",
        "Late-night sessions might affect energy levels. Try earlier if possible."
    ]

    # Helper function to interpret prediction results
    def interpret_prediction(predictions, labels):
        max_prob = max(predictions)
        return labels[np.argmax(predictions)], max_prob

    # Interpret each prediction
    duration_suggestion, duration_confidence = interpret_prediction(duration_prediction, duration_labels)
    focus_suggestion, focus_confidence = interpret_prediction(focus_prediction, focus_labels)
    time_suggestion, time_confidence = interpret_prediction(time_prediction, time_labels)

    # Combine suggestions into a full suggestion message based on confidence
    if duration_confidence > 0.6 and focus_confidence > 0.6 and time_confidence > 0.6:
        full_suggestion = f"{duration_suggestion} {focus_suggestion} {time_suggestion}"
    else:
        full_suggestion = "Adjust study approach based on patterns and keep track of progress."

    # Store the suggestion in StudyTip for later reference
    StudyTip.objects.create(subject=subject, suggestion=full_suggestion)
    return full_suggestion
