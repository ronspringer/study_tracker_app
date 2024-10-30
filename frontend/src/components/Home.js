import React from 'react';  // Import React library
import Dashboard from './Dashboard';  // Import the Dashboard component

// Define the Home component
const Home = () => {
  return (
    <div>  {/* Main wrapper for the component */}
      <Dashboard/>  {/* Render the Dashboard component inside Home */}
    </div>
  );
}

// Export the Home component as default
export default Home;
