import React from 'react'; // Import React
import { Outlet } from 'react-router-dom'; // Import Outlet for rendering nested routes
import Navbar from './navBar'; // Import the Navbar component

// Define the ProtectedLayout component
const ProtectedLayout = () => {
    const myWidth = 180; // Set the width for the Navbar drawer

    return (
        <div style={{ display: 'flex' }}> {/* Flexbox container for layout */}
            <Navbar drawerWidth={myWidth} /> {/* Render the Navbar with specified width */}
            <div style={{ marginTop: '5%', marginRight: '5%', width: '100%' }}>
                {/* The Outlet component is used to render the nested routes */}
                <Outlet /> 
            </div>
        </div>
    );
};

// Export the ProtectedLayout component as the default export
export default ProtectedLayout;
