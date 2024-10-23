import { React, useEffect, useMemo, useState, useContext } from 'react';
import AxiosInstance from './Axios';
import { Box, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Import AuthContext to get current user

const Subject = () => {
  const { user } = useContext(AuthContext); // Get the current logged-in user from AuthContext
  const [myData, setMydata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // State for delete confirmation dialog
  const [subjectToDelete, setSubjectToDelete] = useState(null); // Track the subject to be deleted

  const GetData = () => {
    if (user) {
      AxiosInstance.get(`subject/?user_id=${user.id}`) // Filter data by user ID
        .then((res) => {
          setMydata(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
    else{

    }
  };

  useEffect(() => {
    GetData();
  }, [user]); // Run the function when the user changes (e.g., login/logout)

  const columns = useMemo(
    () => [
      {
        accessorKey: 'subject_name', // Access nested data with dot notation
        header: 'Subject Name',
        size: 150,
      }
    ],
    [],
  );

  const handleOpenConfirmDialog = (row) => {
    setSubjectToDelete(row.original); // Set the subject data for deletion
    setOpenConfirmDialog(true); // Open confirmation dialog
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false); // Close confirmation dialog
    setSubjectToDelete(null); // Reset subject to delete
  };

  const handleDeleteSubject = () => {
    AxiosInstance.delete(`subject/${subjectToDelete.id}/`)
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

  return (
    <div>
      {/* Add Subject Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', paddingRight: '20px' }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/createsubject"  // Navigate to CreateSubject page
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

      {/* Data Table */}
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <MaterialReactTable
          columns={columns}
          data={myData}
          enableRowActions
          renderRowActions={({ row }) => (
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
              <IconButton color="secondary" component={Link} to={`editsubject/${row.original.id}`}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => handleOpenConfirmDialog(row)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        />
      )}
    </div>
  );
};

export default Subject;
