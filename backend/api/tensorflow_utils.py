import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense,Input
from .models import StudySession, Progress, StudyTip
import numpy as np
from tensorflow.keras import layers, Model


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

    data['session_hour'] = pd.to_datetime(data['session_date']).dt.hour

    scaler = StandardScaler()
    data[['duration_minutes', 'total_minutes_studied']] = scaler.fit_transform(data[['duration_minutes', 'total_minutes_studied']])
    
    # Create labels based on some criteria (update according to your logic)
    data['duration_label'] = pd.cut(data['duration_minutes'], bins=3, labels=[0, 1, 2])  # Example for duration labels
    data['focus_label'] = pd.cut(data['total_minutes_studied'], bins=3, labels=[0, 1, 2])  # Example for focus labels
    data['time_label'] = pd.cut(data['total_minutes_studied'], bins=4, labels=[0, 1, 2, 3])  # Example for time labels

    return data

def build_model(input_shape):
    # Input layer
    inputs = layers.Input(shape=(input_shape,))
    
    # Hidden layers
    x = layers.Dense(64, activation='relu')(inputs)
    x = layers.Dense(32, activation='relu')(x)

    # Output layers
    duration_output = layers.Dense(3, activation='softmax', name='duration_suggestion')(x)
    focus_output = layers.Dense(3, activation='softmax', name='focus_suggestion')(x)
    time_output = layers.Dense(4, activation='softmax', name='time_feedback')(x)

    # Create the model
    model = Model(inputs=inputs, outputs=[duration_output, focus_output, time_output])

    # Compile the model with loss for each output
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

def train_model(data):
    # Prepare features and target variables
    X = data[['subject_id', 'duration_minutes', 'total_minutes_studied']].values
    session_hour = data['session_hour'].values.reshape(-1, 1)
    X = np.column_stack((X, session_hour))

    y_duration = data['duration_label'].values
    y_focus = data['focus_label'].values
    y_time = data['time_label'].values

    y_duration = tf.keras.utils.to_categorical(y_duration, num_classes=3)
    y_focus = tf.keras.utils.to_categorical(y_focus, num_classes=3)
    y_time = tf.keras.utils.to_categorical(y_time, num_classes=4)

    # Build and train the model
    model = build_model(X.shape[1])
    
    # Fit the model with validation split
    model.fit(X, 
              {'duration_suggestion': y_duration, 
               'focus_suggestion': y_focus, 
               'time_feedback': y_time},
              epochs=10, 
              batch_size=32, 
              validation_split=0.2)
    
    return model

def generate_study_tip(model, subject, duration_minutes, total_minutes_studied, session_time):
    # Prepare input data for prediction
    subject_id = int(subject.id)
    session_hour = session_time.hour + session_time.minute / 60.0
    input_data = np.array([[subject_id, duration_minutes, total_minutes_studied, session_hour]], dtype=np.float32)

    # Get predictions for each suggestion category
    duration_prediction, focus_prediction, time_prediction = model.predict(input_data)

    # Map predictions to suggestions
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

    # Choose suggestion based on highest probability
    suggestion = duration_options[np.argmax(duration_prediction)]
    focus_suggestion = focus_options[np.argmax(focus_prediction)]
    time_suggestion = time_options[np.argmax(time_prediction)]

    # Combine all suggestions into final output
    full_suggestion = f"{suggestion} {focus_suggestion} {time_suggestion}"

    # Save suggestion to StudyTip
    StudyTip.objects.create(subject=subject, suggestion=full_suggestion)
    return full_suggestion


