import './App.css'; // Import CSS for styling the application
import { Routes, Route, Navigate } from 'react-router-dom'; // Import routing components from react-router-dom
import Home from './components/Home'; // Import the Home component
import Subject from './components/Subject'; // Import the Subject component
import StudySession from './components/StudySession'; // Import the StudySession component
import StudyProgress from './components/StudyProgress'; // Import the StudyProgress component
import StudyTip from './components/StudyTip'; // Import the StudyTip component
import CreateSubject from './components/CreateSubject'; // Import the CreateSubject component
import EditSubject from './components/EditSubject'; // Import the EditSubject component
import Login from './components/Login'; // Import the Login component
import Register from './components/Register'; // Import the Register component
import ProtectedLayout from './components/ProtectedLayout'; // Import the ProtectedLayout component for authenticated routes
import { AuthContext } from './components/AuthContext'; // Import AuthContext to get authentication status
import React, { useContext } from 'react'; // Import React and useContext hook
import EditUserProfile from './components/EditUserProfile'; // Import EditUserProfile component
import User from './components/User'; // Import User component for user management

// Define the main App component
function App() {
  const { isAuthenticated } = useContext(AuthContext); // Get authentication status from AuthContext

  return (
    <div className="App">
      <Routes>
        {/* Routes without Navbar */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />

        {/* Routes with Navbar using ProtectedLayout */}
        <Route element={<ProtectedLayout />}>
          {/* Protect routes that require authentication */}
          <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
          <Route path="/subject" element={isAuthenticated ? <Subject /> : <Navigate to="/login" />} />
          <Route path="/studysession" element={isAuthenticated ? <StudySession /> : <Navigate to="/login" />} />
          <Route path="/studyprogress" element={isAuthenticated ? <StudyProgress /> : <Navigate to="/login" />} />
          <Route path="/studytip" element={isAuthenticated ? <StudyTip /> : <Navigate to="/login" />} />
          <Route path="/createsubject" element={isAuthenticated ? <CreateSubject /> : <Navigate to="/login" />} />
          <Route path="subject/editsubject/:id" element={isAuthenticated ? <EditSubject /> : <Navigate to="/login" />} />
          <Route path="/userprofile/:id" element={isAuthenticated ? <EditUserProfile /> : <Navigate to="/login" />} />
          <Route path="/userprofile" element={isAuthenticated ? <User /> : <Navigate to="/login" />} />
        </Route>
      </Routes>
    </div>
  );
}

// Export the App component as the default export
export default App;
