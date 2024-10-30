import { React, useEffect, useMemo, useState, useContext } from 'react'; // Import React and necessary hooks
import AxiosInstance from './Axios'; // Import Axios instance for API requests
import { Box, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'; // Import Material-UI components
import { MaterialReactTable } from 'material-react-table'; // Import Material React Table for displaying data
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'; // Import icons for edit and delete actions
import { Link } from 'react-router-dom'; // Import Link for navigation
import { AuthContext } from './AuthContext'; // Import AuthContext to get current user

// Define the Subject component
const Subject = () => {
  const { user } = useContext(AuthContext); // Get the current logged-in user from AuthContext
  const [myData, setMydata] = useState([]); // State to hold fetched subject data
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // State for delete confirmation dialog
  const [subjectToDelete, setSubjectToDelete] = useState(null); // Track the subject to be deleted

  // Function to fetch subject data from the API
  const GetData = () => {
    if (user) {
      AxiosInstance.get(`subject/?user_id=${user.id}`) // Fetch subjects filtered by user ID
        .then((res) => {
          setMydata(res.data); // Update state with fetched data
          setLoading(false); // Set loading to false
        })
        .catch((err) => {
          console.error(err); // Log any errors that occur
          setLoading(false); // Set loading to false in case of an error
        });
    } else {
      // Optionally handle case when there is no user
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
        accessorKey: 'subject_name', // Accessor for the subject name field
        header: 'Subject Name', // Column header
        size: 150, // Column size
      },
    ],
    []
  );

  // Function to open the delete confirmation dialog
  const handleOpenConfirmDialog = (row) => {
    setSubjectToDelete(row.original); // Set the subject data for deletion
    setOpenConfirmDialog(true); // Open confirmation dialog
  };

  // Function to close the delete confirmation dialog
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false); // Close confirmation dialog
    setSubjectToDelete(null); // Reset subject to delete
  };

  // Function to handle deletion of a subject
  const handleDeleteSubject = () => {
    AxiosInstance.delete(`subject/${subjectToDelete.id}/`) // Send delete request to API
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

  return (
    <div>
      {/* Button to add a new subject */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', paddingRight: '20px' }}>
        <Button
          variant="contained"
          color="primary"
          component={Link} // Use Link for navigation
          to="/createsubject" // Navigate to CreateSubject page
        >
          Add Subject
        </Button>
      </Box>

      {/* Confirmation Dialog for Deletion */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this subject?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteSubject} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data Table for displaying subjects */}
      {loading ? (
        <p>Loading data...</p> // Show loading message if data is being fetched
      ) : (
        <MaterialReactTable
          columns={columns} // Pass defined columns
          data={myData} // Pass fetched subject data
          enableRowActions // Enable row actions for edit/delete
          renderRowActions={({ row }) => (
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
              <IconButton color="secondary" component={Link} to={`editsubject/${row.original.id}`}> {/* Edit button that navigates to edit page */}
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => handleOpenConfirmDialog(row)}> {/* Delete button */}
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        />
      )}
    </div>
  );
};

// Export the Subject component as the default export
export default Subject;
