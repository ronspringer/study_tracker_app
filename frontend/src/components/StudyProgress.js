import { React, useEffect, useMemo, useState } from 'react'; // Import necessary hooks and React
import AxiosInstance from './Axios'; // Import Axios instance for API calls
import Dayjs from 'dayjs'; // Import Dayjs for date formatting
import { Box, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'; // Import Material-UI components
import { MaterialReactTable } from 'material-react-table'; // Import Material React Table component
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'; // Import icons for edit and delete actions
import CreateStudyProgress from './CreateStudyProgress'; // Import the form for creating study progress
import EditStudyProgress from './EditStudyProgress'; // Import the form for editing study progress
import { LocalizationProvider } from '@mui/x-date-pickers'; // Import LocalizationProvider for date handling
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; // Import Adapter for Dayjs

// Define the StudyProgress component, receiving subjectId as a prop
const StudyProgress = ({ subjectId }) => {
    const [myData, setMyData] = useState(); // State to hold fetched data
    const [loading, setLoading] = useState(true); // State to manage loading state
    const [openDialog, setOpenDialog] = useState(false); // State to control the dialog for create/edit
    const [editProgressData, setEditProgressData] = useState(null); // State to track the progress being edited
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // State for delete confirmation dialog
    const [progressToDelete, setProgressToDelete] = useState(null); // Track the progress to be deleted

    // Function to fetch data from the API
    const GetData = () => {
        AxiosInstance.get('studyprogress/', {
          params: { subject: subjectId } // Pass subjectId as a parameter
        }).then((res) => {
            setMyData(res.data); // Update state with fetched data
            setLoading(false); // Set loading to false once data is fetched
        });
    };

    // useEffect hook to fetch data when subjectId changes
    useEffect(() => {
        GetData();
    }, [subjectId]);

    // Define columns for the MaterialReactTable
    const columns = useMemo(
        () => [
            {
                accessorFn: (row) => Dayjs(row.last_session_date).format('DD-MM-YYYY'), // Format last session date
                header: 'Last Session Date',
                size: 150,
            },
            {
                accessorKey: 'total_minutes_studied', // Accessor for total minutes studied
                header: 'Total Minutes Studied',
                size: 150,
            },
        ],
        []
    );

    // Function to open the dialog for create/edit
    const handleOpenDialog = () => setOpenDialog(true);
    // Function to close the dialog
    const handleCloseDialog = () => {
      setOpenDialog(false);
      setEditProgressData(null); // Reset edit progress data
      GetData(); // Refresh data after closing
    };

    // Function to handle edit button click
    const handleEditClick = (row) => {
        setEditProgressData(row.original); // Set the progress data for editing
        setOpenDialog(true); // Open the dialog
    };

    // Function to open the delete confirmation dialog
    const handleOpenConfirmDialog = (row) => {
        setProgressToDelete(row.original); // Set the progress data for deletion
        setOpenConfirmDialog(true); // Open confirmation dialog
    };
    
    // Function to close the delete confirmation dialog
    const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false); // Close confirmation dialog
        setProgressToDelete(null); // Reset progress to delete
    };
    
    // Function to handle deletion of study progress
    const handleDeleteProgress = () => {
        AxiosInstance.delete(`studyprogress/${progressToDelete.id}/`)
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
            {/* Button to add new study progress */}
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

            {/* Render loading state or the data table */}
            {loading ? <p>Loading data...</p> : 
                <MaterialReactTable 
                    columns={columns} 
                    data={myData}
                    enableRowActions
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
            }
        </div>
    );
}

// Export the StudyProgress component as the default export
export default StudyProgress;
