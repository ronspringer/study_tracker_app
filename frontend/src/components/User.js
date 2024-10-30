import React, { useEffect, useMemo, useState, useContext } from 'react'; // Import React and necessary hooks
import AxiosInstance from './Axios'; // Import Axios instance for API requests
import { Box, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'; // Import Material-UI components
import { MaterialReactTable } from 'material-react-table'; // Import Material React Table for displaying user data
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'; // Import icons for edit and delete actions
import { Link } from 'react-router-dom'; // Import Link for navigation
import { AuthContext } from './AuthContext'; // Import AuthContext to get current user

// Define the User component
const User = () => {
  const { user } = useContext(AuthContext); // Get the current logged-in user from AuthContext
  const [myData, setMydata] = useState([]); // State to hold fetched user data
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // State for delete confirmation dialog
  const [userToDelete, setUserToDelete] = useState(null); // Track the user to be deleted

  // Function to fetch users only if the current user is a superuser
  const GetData = () => {
    if (user && user.is_superuser) { // Check if the user is logged in and is a superuser
      AxiosInstance.get('userprofile/') // Adjust the endpoint as necessary
        .then((res) => {
          setMydata(res.data); // Update state with fetched user data
          setLoading(false); // Set loading to false
        })
        .catch((err) => {
          console.error(err); // Log any errors that occur
          setLoading(false); // Set loading to false in case of an error
        });
    } else {
      // Handle the case where the user is not a superuser
      setLoading(false); // Set loading to false if not a superuser
    }
  };

  // useEffect hook to fetch data when the user changes (e.g., login/logout)
  useEffect(() => {
    GetData();
  }, [user]);

  // Define columns for the MaterialReactTable
  const columns = useMemo(
    () => [
      {
        accessorKey: 'username', // Accessor for the username field
        header: 'Username', // Column header
        size: 150, // Column size
      },
      {
        accessorKey: 'email', // Accessor for the email field
        header: 'Email', // Column header
        size: 200, // Column size
      },
      {
        accessorKey: 'first_name', // Accessor for the first name field
        header: 'First Name', // Column header
        size: 150, // Column size
      },
      {
        accessorKey: 'last_name', // Accessor for the last name field
        header: 'Last Name', // Column header
        size: 150, // Column size
      },
    ],
    []
  );

  // Function to open the delete confirmation dialog
  const handleOpenConfirmDialog = (row) => {
    setUserToDelete(row.original); // Set the user data for deletion
    setOpenConfirmDialog(true); // Open confirmation dialog
  };

  // Function to close the delete confirmation dialog
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false); // Close confirmation dialog
    setUserToDelete(null); // Reset user to delete
  };

  // Function to handle deletion of a user
  const handleDeleteUser = () => {
    AxiosInstance.delete(`userprofile/${userToDelete.id}/`) // Adjust the endpoint as necessary
      .then((response) => {
        console.log('Deleted:', response.data); // Log the response
        GetData(); // Refresh data after deletion
      })
      .catch((error) => {
        console.log('Error:', error.response.data); // Log any error response
      })
      .finally(() => {
        handleCloseConfirmDialog(); // Close dialog after deletion
      });
  };

  // Render loading indicator if data is being fetched
  if (loading) {
    return <p>Loading data...</p>;
  }

  // Render access denied message if the user is not a superuser
  if (!user.is_superuser) {
    return <Typography variant="h6">Access Denied: You do not have permission to view this page.</Typography>;
  }

  return (
    <div>
      {/* Confirmation Dialog for Deletion */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data Table for displaying users */}
      <MaterialReactTable
        columns={columns} // Pass defined columns
        data={myData} // Pass fetched user data
        enableRowActions // Enable row actions for edit/delete
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
            <IconButton color="secondary" component={Link} to={`/userprofile/${row.original.id}`}> {/* Edit button that navigates to edit user profile */}
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => handleOpenConfirmDialog(row)}> {/* Delete button */}
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      />
    </div>
  );
};

// Export the User component as the default export
export default User;
