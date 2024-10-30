import { React, useEffect, useMemo, useState } from 'react'; // Import React and necessary hooks
import AxiosInstance from './Axios'; // Import Axios instance for API requests
import { Box, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'; // Import Material-UI components
import { MaterialReactTable } from 'material-react-table'; // Import Material React Table for displaying data
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'; // Import icons for edit and delete actions
import CreateStudyTip from './CreateStudyTip'; // Import the CreateStudyTip form
import EditStudyTip from './EditStudyTip'; // Import the EditStudyTip form

// Define the StudyTip component, receiving subjectId as a prop
const StudyTip = ({ subjectId }) => {
  const [myData, setMydata] = useState(); // State to hold fetched data
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [openDialog, setOpenDialog] = useState(false); // State to control the dialog for create/edit
  const [editTipData, setEditTipData] = useState(null); // State to track the tip being edited
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // State for delete confirmation dialog
  const [tipToDelete, setTipToDelete] = useState(null); // Track the tip to be deleted

  // Function to fetch data from the API
  const GetData = () => {
    AxiosInstance.get(`studytip/`, {
      params: { subject: subjectId } // Pass the subjectId as a parameter for filtering
    }).then((res) => {
      setMydata(res.data); // Update state with fetched data
      console.log(res.data); // Log the fetched data
      setLoading(false); // Set loading to false once data is fetched
    });
  };

  // useEffect hook to fetch data when the component mounts or when subjectId changes
  useEffect(() => {
    GetData();
  }, [subjectId]);

  // Define columns for the MaterialReactTable
  const columns = useMemo(
    () => [
      {
        accessorKey: 'suggestion', // Accessor for the suggestion field
        header: 'Suggestion', // Column header
        size: 150, // Column size
      },
    ],
    []
  );

  // Function to close the create/edit dialog
  const handleCloseDialog = () => {
    setOpenDialog(false); // Close the dialog
    setEditTipData(null); // Reset edit tip data
    GetData(); // Refresh data after closing
  };

  // Function to handle the click event for editing a study tip
  const handleEditClick = (row) => {
    setEditTipData(row.original); // Set the tip data for editing
    setOpenDialog(true); // Open the dialog
  };

  // Function to open the delete confirmation dialog
  const handleOpenConfirmDialog = (row) => {
    setTipToDelete(row.original); // Set the tip data for deletion
    setOpenConfirmDialog(true); // Open confirmation dialog
  };

  // Function to close the delete confirmation dialog
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false); // Close confirmation dialog
    setTipToDelete(null); // Reset tip to delete
  };

  // Function to handle deletion of a study tip
  const handleDeleteTip = () => {
    AxiosInstance.delete(`studytip/${tipToDelete.id}/`) // Delete request to API
      .then((response) => {
        console.log('Deleted:', response.data); // Log the response
        GetData(); // Refresh data after deletion
      })
      .catch((error) => {
        console.log('Error:', error.response.data); // Log any error response
      })
      .finally(() => {
        handleCloseConfirmDialog(); // Close confirmation dialog after deletion
      });
  };

  // Function to generate a new study suggestion
  const handleGenerateSuggestion = async () => {
    try {
      const response = await AxiosInstance.get(`studysession/${subjectId}/get_study_suggestion/`); // Fetch a new study suggestion
      console.log('Suggestion generated:', response.data.suggestion); // Log the generated suggestion
      // Optionally refresh the StudyTip data or display the suggestion
      GetData(); // Refresh the study tips data
    } catch (error) {
      console.error('Error generating suggestion:', error); // Log any error that occurs
    }
  };

  return (
    <div>
      {/* Button to generate a new study suggestion */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateSuggestion} // Trigger suggestion generation on click
        >
          Generate Suggestion
        </Button>
      </Box>

      {/* Dialog for Create/Edit Study Tip */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editTipData ? 'Edit Study Tip' : 'Add Study Tip'}</DialogTitle>
        <DialogContent>
          {editTipData ? (
            <EditStudyTip tipData={editTipData} onClose={handleCloseDialog} /> // Render EditStudyTip component
          ) : (
            <CreateStudyTip subjectId={subjectId} onClose={handleCloseDialog} /> // Render CreateStudyTip component
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Deletion */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this study tip?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteTip} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Render loading state or the data table */}
      {loading ? (
        <p>Loading data...</p> // Show loading message if data is being fetched
      ) : (
        <MaterialReactTable
          columns={columns} // Pass defined columns
          data={myData} // Pass fetched data
          enableRowActions // Enable row actions for edit/delete
          renderRowActions={({ row }) => (
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
              <IconButton color="secondary" onClick={() => handleEditClick(row)}>
                <EditIcon /> {/* Edit button */}
              </IconButton>
              <IconButton color="error" onClick={() => handleOpenConfirmDialog(row)}>
                <DeleteIcon /> {/* Delete button */}
              </IconButton>
            </Box>
          )}
        />
      )}
    </div>
  );
};

// Export the StudyTip component as the default export
export default StudyTip;
