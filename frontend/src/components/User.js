import React, { useEffect, useMemo, useState, useContext } from 'react';
import AxiosInstance from './Axios';
import { Box, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Import AuthContext to get current user

const User = () => {
  const { user } = useContext(AuthContext); // Get the current logged-in user from AuthContext
  const [myData, setMydata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // State for delete confirmation dialog
  const [userToDelete, setUserToDelete] = useState(null); // Track the user to be deleted

  // Fetch users only if the current user is a superuser
  const GetData = () => {
    if (user && user.is_superuser) {
      AxiosInstance.get('userprofile/') // Adjust the endpoint as necessary
        .then((res) => {
          setMydata(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      // Handle the case where the user is not a superuser
      setLoading(false);
    }
  };

  useEffect(() => {
    GetData();
  }, [user]); // Run the function when the user changes (e.g., login/logout)

  const columns = useMemo(
    () => [
      {
        accessorKey: 'username', // Access the username field
        header: 'Username',
        size: 150,
      },
      {
        accessorKey: 'email', // Access the email field
        header: 'Email',
        size: 200,
      },
      {
        accessorKey: 'first_name', // Access the first name field
        header: 'First Name',
        size: 150,
      },
      {
        accessorKey: 'last_name', // Access the last name field
        header: 'Last Name',
        size: 150,
      },
    ],
    [],
  );

  const handleOpenConfirmDialog = (row) => {
    setUserToDelete(row.original); // Set the user data for deletion
    setOpenConfirmDialog(true); // Open confirmation dialog
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false); // Close confirmation dialog
    setUserToDelete(null); // Reset user to delete
  };

  const handleDeleteUser = () => {
    AxiosInstance.delete(`userprofile/${userToDelete.id}/`) // Adjust the endpoint as necessary
      .then((response) => {
        console.log('Deleted:', response.data);
        GetData(); // Refresh data after deletion
      })
      .catch((error) => {
        console.log('Error:', error.response.data);
      })
      .finally(() => {
        handleCloseConfirmDialog(); // Close dialog after deletion
      });
  };

  if (loading) {
    return <p>Loading data...</p>; // Optional loading indicator
  }

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

      {/* Data Table */}
      <MaterialReactTable
        columns={columns}
        data={myData}
        enableRowActions
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
            <IconButton color="secondary" component={Link} to={`/userprofile/${row.original.id}`}>
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => handleOpenConfirmDialog(row)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      />
    </div>
  );
};

export default User;
