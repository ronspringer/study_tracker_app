import {React, useEffect, useMemo, useState} from 'react'
import AxiosInstance from './Axios'
import { Box, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { MaterialReactTable } from 'material-react-table';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import CreateStudyTip from './CreateStudyTip'; // Import the CreateStudyTip form
import EditStudyTip from './EditStudyTip';
  

const StudyTip = ({ subjectId }) => { // Accept subjectId as a prop
    
    const [myData,setMydata] = useState()
    const [loading,setLoading] = useState(true)
    const [openDialog, setOpenDialog] = useState(false); // State to manage the dialog open/close
    const [editTipData, setEditTipData] = useState(null); // State to track the Tip being edited
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // State for delete confirmation dialog
    const [tipToDelete, setTipToDelete] = useState(null); // Track the tip to be deleted

    const GetData = () => {
        AxiosInstance.get(`studytip/`, {
          params: { subject: subjectId } // Pass the subjectId as a filter to the backend
        }).then((res) => {
            setMydata(res.data)
            console.log(res.data)
            setLoading(false)
          })
    }
    useEffect(()=> {
        GetData();
    },[subjectId]); // Re-fetch data if subjectId changes


  const columns = useMemo(
    () => [
      // {
      //   accessorKey: 'subject', //access nested data with dot notation
      //   header: 'Subject',
      //   size: 150,
      // },
      {
        accessorKey: 'suggestion',
        header: 'Suggestion',
        size: 150,
      },
    ],
    [],
  );

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditTipData(null); // Reset after closing
    GetData();
  };

  const handleEditClick = (row) => {
    setEditTipData(row.original); // Set the tip data for editing
    setOpenDialog(true); // Open the dialog
  };

  const handleOpenConfirmDialog = (row) => {
    setTipToDelete(row.original); // Set the tip data for deletion
    setOpenConfirmDialog(true); // Open confirmation dialog
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false); // Close confirmation dialog
    setTipToDelete(null); // Reset tip to delete
  };


  const handleDeleteTip = () => {
    AxiosInstance.delete(`studytip/${tipToDelete.id}/`)
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

  const handleGenerateSuggestion = async () => {
    try {
        const response = await AxiosInstance.get(`studysession/${subjectId}/get_study_suggestion/`);
        console.log('Suggestion generated:', response.data.suggestion);
        // Optionally refresh the StudyTip data or display the suggestion
        GetData();
    } catch (error) {
        console.error('Error generating suggestion:', error);
    }
  };



  return (
    <div>
        {/* Add Subject Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Button
          variant="contained"
          color="primary"
          //onClick={handleOpenDialog}
          onClick={handleGenerateSuggestion}
        >
          Generate Suggestion
        </Button>
      </Box>

      {/* Dialog for Create/Edit Study Tip */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editTipData ? 'Edit Study Tip' : 'Add Study Tip'}</DialogTitle>
        <DialogContent>
            {editTipData ? (
              <EditStudyTip tipData={editTipData} onClose={handleCloseDialog} />
            ) : (
              <CreateStudyTip subjectId={subjectId} onClose={handleCloseDialog} />
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

      {/* Table for displaying study tips */}

        { loading ? <p>Loading data...</p>:
        <MaterialReactTable
            columns={columns} 
            data={myData}
            enableRowActions
            renderRowActions={({row}) => (
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
        }
    </div>
  )
}

export default StudyTip