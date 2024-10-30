import * as React from 'react'; // Import React
import Box from '@mui/material/Box'; // Import Box component from MUI
import Drawer from '@mui/material/Drawer'; // Import Drawer component from MUI
import AppBar from '@mui/material/AppBar'; // Import AppBar component from MUI
import CssBaseline from '@mui/material/CssBaseline'; // Import CssBaseline for consistent styling
import Toolbar from '@mui/material/Toolbar'; // Import Toolbar component from MUI
import Typography from '@mui/material/Typography'; // Import Typography for text styling
import List from '@mui/material/List'; // Import List component from MUI
import ListItem from '@mui/material/ListItem'; // Import ListItem component from MUI
import ListItemButton from '@mui/material/ListItemButton'; // Import ListItemButton component from MUI
import ListItemIcon from '@mui/material/ListItemIcon'; // Import ListItemIcon component from MUI
import ListItemText from '@mui/material/ListItemText'; // Import ListItemText component from MUI
import Button from '@mui/material/Button'; // Import Button component from MUI
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation from react-router
import HomeIcon from '@mui/icons-material/Home'; // Import Home icon from MUI icons
import BookIcon from '@mui/icons-material/Book'; // Import Book icon from MUI icons
import { AuthContext } from './AuthContext'; // Import AuthContext for authentication

// Define the Navbar component
export default function Navbar(props) {
    const { drawerWidth, content } = props; // Destructure props for drawer width and content
    const location = useLocation(); // Get the current location from react-router
    const path = location.pathname; // Extract the current path

    const { user, logout } = React.useContext(AuthContext); // Access user and logout function from AuthContext

    return (
        <Box sx={{ display: 'flex' }}> {/* Main container with flex display */}
            <CssBaseline /> {/* Apply baseline CSS for consistent styling */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                {/* AppBar to hold the top navigation */}
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    {/* Toolbar for layout */}
                    <Button color='inherit' component={Link} to={`/`}>
                        <Typography variant="h6" noWrap component="div">
                            Study Tracker {/* Title of the application */}
                        </Typography>
                    </Button>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* Conditional rendering of user profile and logout button */}
                        {user && (
                            <Button color='inherit' component={Link} to={`/userprofile/${user.id}`}>
                                User Profile {/* Link to the user's profile */}
                            </Button>
                        )}
                        <Button color="inherit" onClick={logout}>
                            Logout {/* Button to trigger logout */}
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent" // Permanent drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' }, // Set drawer width
                }}
            >
                <Toolbar /> {/* Spacer to account for AppBar height */}
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {/* List of navigation items */}
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/" selected={"/" === path}>
                                <ListItemIcon>
                                    <HomeIcon /> {/* Icon for Home */}
                                </ListItemIcon>
                                <ListItemText primary={"Home"} /> {/* Text for Home */}
                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/subject" selected={"/subject" === path}>
                                <ListItemIcon>
                                    <BookIcon /> {/* Icon for Subject */}
                                </ListItemIcon>
                                <ListItemText primary={"Subject"} /> {/* Text for Subject */}
                            </ListItemButton>
                        </ListItem>

                        {/* Conditional rendering for superuser management */}
                        {user && user.is_superuser && ( // Check if user is a superuser
                            <ListItem disablePadding>
                                <ListItemButton component={Link} to="/userprofile" selected={"/userprofile" === path}>
                                    <ListItemIcon>
                                        <BookIcon /> {/* Icon for Manage Users */}
                                    </ListItemIcon>
                                    <ListItemText primary={"Manage Users"} /> {/* Text for Manage Users */}
                                </ListItemButton>
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Drawer>

            {/* Main content area */}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar /> {/* Spacer for AppBar */}
                {content} {/* Render content passed as a prop */}
            </Box>
        </Box>
    );
}
