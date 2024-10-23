import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Subject from './components/Subject';
import StudySession from './components/StudySession';
import StudyProgress from './components/StudyProgress';
import StudyTip from './components/StudyTip';
import CreateSubject from './components/CreateSubject';
import EditSubject from './components/EditSubject';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedLayout from './components/ProtectedLayout'; // Import the new layout component
import { AuthContext } from './components/AuthContext';
import React, { useContext } from 'react';

function App() {
  const { isAuthenticated } = useContext(AuthContext);
  return (
    <div className="App">
      <Routes>
        {/* Routes without Navbar */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />

        {/* Routes with Navbar using ProtectedLayout */}
        <Route element={<ProtectedLayout />}>

          {/* Protect routes that require authentication */}
          <Route path="/" element={isAuthenticated ? <Home/> : <Navigate to="/login" />} />
          <Route path="/subject" element={isAuthenticated ? <Subject/> : <Navigate to="/login" />} />
          <Route path="/studysession" element={isAuthenticated ? <StudySession/> : <Navigate to="/login" />} />
          <Route path="/studyprogress" element={isAuthenticated ? <StudyProgress/> : <Navigate to="/login" />} />
          <Route path="/studytip" element={isAuthenticated ? <StudyTip/> : <Navigate to="/login" />} />
          <Route path="/createsubject" element={isAuthenticated ? <CreateSubject/> : <Navigate to="/login" />} />
          <Route path="subject/editsubject/:id" element={isAuthenticated ? <EditSubject/> : <Navigate to="/login" />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
