import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from .models import StudySession, Progress, StudyTip

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
        Dense(64, activation='relu', input_shape=(input_shape,)),
        Dense(32, activation='relu'),
        Dense(1, activation='linear')  # Change to softmax for classification if needed
    ])
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

def train_model(data):
    X = data[['subject_id', 'duration_minutes', 'total_minutes_studied']].values
    y = data['duration_minutes'].values  # Adjust this as per your target variable

    model = build_model(X.shape[1])
    model.fit(X, y, epochs=10, batch_size=32, validation_split=0.2)
    return model

def generate_study_tip(model, subject_id, duration_minutes, total_minutes_studied):
    prediction = model.predict([[subject_id, duration_minutes, total_minutes_studied]])[0][0]  # Ensure you're accessing the correct prediction value

    if prediction < 30:
        return "Consider increasing your study duration to improve focus."
    elif prediction > 60:
        return "You are studying for a long time. Take regular breaks to avoid burnout."
    else:
        return "Keep up your current study pace!"

def save_study_tip(user, subject, suggestion):
    study_tip = StudyTip(subject=subject, suggestion=suggestion)
    study_tip.save()
