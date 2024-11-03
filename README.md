# Study Tracker App

## Overview
The Study Tracker App is a web application designed to help users manage and optimize their study sessions using a React.js frontend and a Django backend.

## Prerequisites
- Ensure you have Git installed on your system.
- Make sure you have Node.js and npm installed for the frontend.
- Python and pip should be installed for the backend.

## Installation Instructions

### Cloning the Repository
1. Open your terminal and navigate to your preferred directory.
2. Clone the repository using the following command:
   ```bash
   git clone https://github.com/ronspringer/study_tracker_app.git
3. Change to the master branch:
   ```bash
   git checkout master

### Setting Up the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
2. Install the required libraries for the React.js frontend
   ```bash
   npm install
3. Start the frontend server
   ```bash
   npm run start

### Setting Up the Backend
1. Open another terminal and navigate to the backend directory
   ```bash
   cd backend
2. Install the required libraries for the Django backend
   ```bash
   pip install -r requirements.txt
3. Run migrations to set up the SQLite database
   ```bash
   python manage.py migrate
4. Start the Django backend server
   ```bash
   python manage.py runserver
