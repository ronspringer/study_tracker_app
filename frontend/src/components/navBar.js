import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import { AuthContext } from './AuthContext'; // Assuming you have AuthContext

export default function Navbar(props) {
    const { drawerWidth, content } = props;
    const location = useLocation();
    const path = location.pathname;

    const { user, logout } = React.useContext(AuthContext);

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button color='inherit' component={Link} to={`/`}>
                    <Typography variant="h6" noWrap component="div">
                        Study Tracker
                    </Typography>
                    </Button>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {user && (
                            <Button color='inherit' component={Link} to={`/userprofile/${user.id}`}>
                                User Profile
                            </Button>
                        )}
                        <Button color="inherit" onClick={logout}>
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/" selected={"/" === path}>
                                <ListItemIcon>
                                    <HomeIcon />
                                </ListItemIcon>
                                <ListItemText primary={"Home"} />
                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/subject" selected={"/subject" === path}>
                                <ListItemIcon>
                                    <BookIcon />
                                </ListItemIcon>
                                <ListItemText primary={"Subject"} />
                            </ListItemButton>
                        </ListItem>
                        {user && user.is_superuser && ( // Explicitly check if is_superuser is 1
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/userprofile" selected={"/userprofile" === path}>
                                <ListItemIcon>
                                    <BookIcon />
                                </ListItemIcon>
                                <ListItemText primary={"Manage Users"} />
                            </ListItemButton>
                        </ListItem>
                        )}
                    </List>
                </Box>
            </Drawer>

            {/* Adjust width of the main content to account for the drawer */}
            <Box component="main" sx={{ flexGrow: 1, p: 3}}>
                <Toolbar />
                {content}
            </Box>
        </Box>
    );
}

