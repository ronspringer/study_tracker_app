import React, { useEffect, useMemo, useState } from 'react'; // Import React and necessary hooks
import AxiosInstance from './Axios'; // Import Axios instance for API requests
import Dayjs from 'dayjs'; // Import Dayjs for date manipulation
import { Box, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'; // Import Material-UI components
import { MaterialReactTable } from 'material-react-table'; // Import Material React Table for displaying data
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'; // Import icons for edit and delete actions
import { LocalizationProvider } from '@mui/x-date-pickers'; // Import LocalizationProvider for date handling
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; // Import Adapter for Dayjs
import CreateStudySession from './CreateStudySession'; // Import the CreateStudySession form
import EditStudySession from './EditStudySession'; // Import the EditStudySession form
import utc from 'dayjs/plugin/utc'; // Import UTC plugin for Dayjs
import timezone from 'dayjs/plugin/timezone'; // Import timezone plugin for Dayjs

// Extend Dayjs with UTC and timezone capabilities
Dayjs.extend(utc);
Dayjs.extend(timezone);

// Define the StudySession component, receiving subjectId as a prop
const StudySession = ({ subjectId }) => {
  const [myData, setMydata] = useState(); // State to hold fetched data
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [openDialog, setOpenDialog] = useState(false); // State to control the dialog for create/edit
  const [editSessionData, setEditSessionData] = useState(null); // State to track the session being edited
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // State for delete confirmation dialog
  const [sessionToDelete, setSessionToDelete] = useState(null); // Track the session to be deleted
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get the user's time zone

  // Function to fetch data from the API
  const GetData = () => {
    AxiosInstance.get(`studysession/`, {
      params: { subject: subjectId }, // Pass subjectId as a parameter for filtering
    }).then((res) => {
      setMydata(res.data); // Update state with fetched data
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
        accessorFn: (row) => Dayjs.utc(row.session_date).tz(userTimeZone).format('YYYY-MM-DD HH:mm'), // Format session date to user's timezone
        header: 'Session Date',
        size: 150,
      },
      {
        accessorKey: 'notes', // Accessor for notes
        header: 'Notes',
        size: 150,
      },
      {
        accessorKey: 'duration_minutes', // Accessor for session duration in minutes
        header: 'Duration Minutes',
        size: 150,
      },
    ],
    []
  );

  // Function to open the dialog for create/edit
  const handleOpenDialog = () => setOpenDialog(true);
  // Function to close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false); // Close the dialog
    setEditSessionData(null); // Reset edit session data
    GetData(); // Refresh data after closing
  };

  // Function to handle the click event for editing a session
  const handleEditClick = (row) => {
    setEditSessionData(row.original); // Set the session data for editing
    setOpenDialog(true); // Open the dialog
  };

  // Function to open the delete confirmation dialog
  const handleOpenConfirmDialog = (row) => {
    setSessionToDelete(row.original); // Set the session data for deletion
    setOpenConfirmDialog(true); // Open confirmation dialog
  };

  // Function to close the delete confirmation dialog
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false); // Close confirmation dialog
    setSessionToDelete(null); // Reset session to delete
  };

  // Function to handle deletion of a study session
  const handleDeleteSession = () => {
    AxiosInstance.delete(`studysession/${sessionToDelete.id}/`) // Delete request to API
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

  return (
    <div>
      {/* Button to add a new study session */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          Add Study Session
        </Button>
      </Box>

      {/* Dialog for Create/Edit Study Session */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editSessionData ? 'Edit Study Session' : 'Add Study Session'}</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {editSessionData ? (
              <EditStudySession sessionData={editSessionData} onClose={handleCloseDialog} />
            ) : (
              <CreateStudySession subjectId={subjectId} onClose={handleCloseDialog} />
            )}
          </LocalizationProvider>
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
          <Typography>Are you sure you want to delete this study session?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteSession} color="error">
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

// Export the StudySession component as the default export
export default StudySession;
