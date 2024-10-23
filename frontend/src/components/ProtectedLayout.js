import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './navBar';

const ProtectedLayout = () => {
    const myWidth = 180;

    return (
        <div style={{ display: 'flex' }}>
            <Navbar drawerWidth={myWidth} />
            <div style={{ marginTop: '5%', marginRight: '5%', width: '100%' }}>
                <Outlet /> {/* This renders the nested routes here */}
            </div>
        </div>
    );
};

export default ProtectedLayout;
