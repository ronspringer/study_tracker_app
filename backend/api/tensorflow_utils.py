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
import pandas as pd  # Data manipulation library
from sklearn.preprocessing import LabelEncoder, StandardScaler  # Tools for encoding labels and scaling data
import tensorflow as tf  # TensorFlow for building machine learning models
from tensorflow.keras.models import Model  # Model class from Keras for defining models
from tensorflow.keras.layers import Dense, Input  # Layers used to build neural network
from .models import StudySession, Progress, StudyTip  # Import models from the current app
import numpy as np  # Numerical computing library
from tensorflow.keras import layers, Model  # Layers and Model for building neural network architectures

# Function to retrieve study session and progress data for a specific user
def get_study_data(user):
    # Query study sessions and progress data related to the user
    sessions = StudySession.objects.filter(subject__user=user).values('subject_id', 'session_date', 'duration_minutes')
    progress = Progress.objects.filter(subject__user=user).values('subject_id', 'total_minutes_studied', 'last_session_date')
    return sessions, progress

# Function to preprocess data for the machine learning model
def preprocess_data(sessions, progress):
    session_df = pd.DataFrame(sessions)  # Convert session data to DataFrame
    progress_df = pd.DataFrame(progress)  # Convert progress data to DataFrame

    # Ensure data is available for processing
    if session_df.empty or progress_df.empty:
        raise ValueError("No data available for processing.")

    # Merge session and progress data on 'subject_id'
    data = pd.merge(session_df, progress_df, on='subject_id')

    # Check if merged data is empty
    if data.empty:
        raise ValueError("Merged data is empty, check your session and progress data.")

    # Encode 'subject_id' as numeric labels
    le = LabelEncoder()
    data['subject_id'] = le.fit_transform(data['subject_id'])

    # Extract hour from 'session_date' as a new feature
    data['session_hour'] = pd.to_datetime(data['session_date']).dt.hour

    # Scale numerical features
    scaler = StandardScaler()
    data[['duration_minutes', 'total_minutes_studied']] = scaler.fit_transform(data[['duration_minutes', 'total_minutes_studied']])

    # Create labels for duration, focus, and time feedback based on criteria
    data['duration_label'] = pd.cut(data['duration_minutes'], bins=3, labels=[0, 1, 2])  # Labels for duration
    data['focus_label'] = pd.cut(data['total_minutes_studied'], bins=3, labels=[0, 1, 2])  # Labels for focus
    data['time_label'] = pd.cut(data['total_minutes_studied'], bins=4, labels=[0, 1, 2, 3])  # Labels for time
    return data

# Function to define the machine learning model architecture
def build_model(input_shape):
    inputs = layers.Input(shape=(input_shape,))  # Define input layer with specified shape

    # Define hidden layers with ReLU activation
    x = layers.Dense(64, activation='relu')(inputs)
    x = layers.Dense(32, activation='relu')(x)

    # Define output layers with softmax activation for multiclass classification
    duration_output = layers.Dense(3, activation='softmax', name='duration_suggestion')(x)
    focus_output = layers.Dense(3, activation='softmax', name='focus_suggestion')(x)
    time_output = layers.Dense(4, activation='softmax', name='time_feedback')(x)

    # Combine inputs and outputs into a model
    model = Model(inputs=inputs, outputs=[duration_output, focus_output, time_output])

    # Compile the model with categorical crossentropy loss and accuracy metrics for each output
    model.compile(optimizer='adam',
                  loss={
                      'duration_suggestion': ' ',
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
    y_duration = tf.keras.utils.to_categorical(data['duration_label'].values, num_classes=3)
    y_focus = tf.keras.utils.to_categorical(data['focus_label'].values, num_classes=3)
    y_time = tf.keras.utils.to_categorical(data['time_label'].values, num_classes=4)

    # Build the model and fit it with a validation split
    model = build_model(X.shape[1])
    model.fit(X, 
              {'duration_suggestion': y_duration, 
               'focus_suggestion': y_focus, 
               'time_feedback': y_time},
              epochs=10, 
              batch_size=32, 
              validation_split=0.2)
    return model

# Function to generate a study tip based on model predictions
def generate_study_tip(model, subject, duration_minutes, total_minutes_studied, session_time):
    # Prepare input data for prediction
    subject_id = int(subject.id)
    session_hour = session_time.hour + session_time.minute / 60.0
    input_data = np.array([[subject_id, duration_minutes, total_minutes_studied, session_hour]], dtype=np.float32)

    # Get predictions from the model
    duration_prediction, focus_prediction, time_prediction = model.predict(input_data)

    # Define possible suggestions for each category
    duration_options = ["Consider increasing your study duration to improve focus.", 
                        "Keep up your current study pace!", 
                        "You are studying for a long time. Take regular breaks to avoid burnout."]
    focus_options = ["Try focusing for 25-30 minutes per session.", 
                     "Your focus time is improving. Aim for 40-45 minutes per session.", 
                     "Consider deep study sessions of 60 minutes with short breaks for best results."]
    time_options = ["Morning studies are a good choice for learning new concepts.", 
                    "Afternoon studies can help with steady energy levels; remember to take breaks.",
                    "Evening study sessions are effective for reviewing learned material.", 
                    "Late-night study can be tiring. Consider an earlier time if possible."]

    # Select suggestions with the highest probability
    suggestion = duration_options[np.argmax(duration_prediction)]
    focus_suggestion = focus_options[np.argmax(focus_prediction)]
    time_suggestion = time_options[np.argmax(time_prediction)]

    # Combine all suggestions into one final suggestion message
    full_suggestion = f"{suggestion} {focus_suggestion} {time_suggestion}"

    # Save the generated suggestion to the StudyTip model
    StudyTip.objects.create(subject=subject, suggestion=full_suggestion)
    return full_suggestion
