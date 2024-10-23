import React, { useEffect, useMemo, useState } from 'react';
import AxiosInstance from './Axios';
import Dayjs from 'dayjs';
import { Box, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CreateStudySession from './CreateStudySession'; // Import the CreateStudySession form
import EditStudySession from './EditStudySession';

const StudySession = ({ subjectId }) => {
  const [myData, setMydata] = useState();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false); // State to manage the dialog open/close
  const [editSessionData, setEditSessionData] = useState(null); // State to track the session being edited
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // State for delete confirmation dialog
  const [sessionToDelete, setSessionToDelete] = useState(null); // Track the session to be deleted

  const GetData = () => {
    AxiosInstance.get(`studysession/`, {
      params: { subject: subjectId }, // Pass the subjectId as a filter to the backend
    }).then((res) => {
      setMydata(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    GetData();
  }, [subjectId]); // Re-fetch data if subjectId changes

  const columns = useMemo(
    () => [
      // {
      //   accessorKey: 'subject', //access nested data with dot notation
      //   header: 'Subject',
      //   size: 150,
      // },
      {
        accessorFn: (row) => Dayjs(row.session_date).format('DD-MM-YYYY'),
        header: 'Session Date',
        size: 150,
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        size: 150,
      },
      {
        accessorKey: 'duration_minutes',
        header: 'Duration Minutes',
        size: 150,
      },
    ],
    [],
  );

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditSessionData(null); // Reset after closing
    GetData();
  };

  const handleEditClick = (row) => {
    setEditSessionData(row.original); // Set the session data for editing
    setOpenDialog(true); // Open the dialog
  };

  const handleOpenConfirmDialog = (row) => {
    setSessionToDelete(row.original); // Set the session data for deletion
    setOpenConfirmDialog(true); // Open confirmation dialog
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false); // Close confirmation dialog
    setSessionToDelete(null); // Reset session to delete
  };

  const handleDeleteSession = () => {
    AxiosInstance.delete(`studysession/${sessionToDelete.id}/`)
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
      {/* Add Study Session Button */}
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

      {/* Table for displaying study sessions */}
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <MaterialReactTable
          columns={columns}
          data={myData}
          enableRowActions
          renderRowActions={({ row }) => (
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
              <IconButton color="secondary" onClick={() => handleEditClick(row)}>
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

export default StudySession;
