import {React, useEffect, useMemo, useState} from 'react'
import AxiosInstance from './Axios'
import Dayjs from 'dayjs'; // Ensure proper import for Dayjs
import { Box, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { MaterialReactTable } from 'material-react-table';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import CreateStudyProgress from './CreateStudyProgress'; // Import the CreateStudyProgress form
import EditStudyProgress from './EditStudyProgress';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const StudyProgress = ({ subjectId }) => {
    
    const [myData, setMyData] = useState();
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editProgressData, setEditProgressData] = useState(null); // State to track the progress being edited
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // State for delete confirmation dialog
    const [progressToDelete, setProgressToDelete] = useState(null); // Track the Progress to be deleted

    const GetData = () => {
        AxiosInstance.get('studyprogress/', {
          params: { subject: subjectId }
        }).then((res) => {
            setMyData(res.data);
            setLoading(false);
        });
    };

    useEffect(() => {
        GetData();
    }, [subjectId])

    const columns = useMemo(
        () => [
            // {
            //     accessorKey: 'subject',
            //     header: 'Subject',
            //     size: 150,
            // },
            {
                accessorFn: (row) => Dayjs(row.last_session_date).format('DD-MM-YYYY'),
                header: 'Last Session Date',
                size: 150,
            },
            {
                accessorKey: 'total_minutes_studied',
                header: 'Total Minutes Studied',
                size: 150,
            },
        ],
        []
    );

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => {
      setOpenDialog(false);
      setEditProgressData(null); // Reset after closing
      GetData();
    };
  
    const handleEditClick = (row) => {
    setEditProgressData(row.original); // Set the progress data for editing
      setOpenDialog(true); // Open the dialog
    };


    const handleOpenConfirmDialog = (row) => {
        setProgressToDelete(row.original); // Set the progress data for deletion
        setOpenConfirmDialog(true); // Open confirmation dialog
      };
    
      const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false); // Close confirmation dialog
        setProgressToDelete(null); // Reset progress to delete
      };
    
    const handleDeleteProgress = () => {
    AxiosInstance.delete(`studyprogress/${progressToDelete.id}/`)
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <Button variant="contained" color="primary" onClick={handleOpenDialog}>
                    Add Study Progress
                </Button>
            </Box>

            {/* Dialog for Create/Edit Study Progress */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
                <DialogTitle>{editProgressData ? 'Edit Study Progress' : 'Add Study Progress'}</DialogTitle>
                <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {editProgressData ? (
                    <EditStudyProgress progressData={editProgressData} onClose={handleCloseDialog} />
                    ) : (
                    <CreateStudyProgress subjectId={subjectId} onClose={handleCloseDialog} />
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
                <Typography>Are you sure you want to delete this study progress?</Typography>
                </DialogContent>
                <DialogActions>
                <Button onClick={handleCloseConfirmDialog} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleDeleteProgress} color="error">
                    Delete
                </Button>
                </DialogActions>
            </Dialog>

            {loading ? <p>Loading data...</p> : 
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
            />}
        </div>
    );
}

export default StudyProgress;
