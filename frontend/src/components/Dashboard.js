import React, { useEffect, useState, useContext } from 'react';  // Import necessary libraries and hooks
import { Bar } from 'react-chartjs-2';  // Import Bar chart from react-chartjs-2
import { Chart, registerables } from 'chart.js'; // Import Chart.js components
import AxiosInstance from './Axios';  // Import the Axios instance for API calls
import { AuthContext } from './AuthContext';  // Import AuthContext to get current user

// Register all components of Chart.js
Chart.register(...registerables);

// Define the Dashboard component
const Dashboard = () => {
  const { user } = useContext(AuthContext);  // Get the current logged-in user from AuthContext
  const [progressData, setProgressData] = useState([]);  // State to store study progress data
  const [studyTips, setStudyTips] = useState([]);  // State to store study tips

  // useEffect to fetch data when the component mounts or when user changes
  useEffect(() => {
    // Function to fetch study progress data
    const fetchProgressData = async () => {
      if (user) {  // Check if user is available
        try {
          // Make a GET request to fetch study progress for the logged-in user
          const response = await AxiosInstance.get(`/studyprogress?subject__user=${user.id}`); // Update query param
          setProgressData(response.data);  // Set the fetched data to progressData state
        } catch (error) {
          console.error('Error fetching progress data:', error);  // Log any errors encountered
        }
      }
    };

    // Function to fetch study tips
    const fetchStudyTips = async () => {
      if (user) {  // Check if user is available
        try {
          // Make a GET request to fetch study tips for the logged-in user
          const response = await AxiosInstance.get(`/studytip?subject__user=${user.id}`); // Update query param
          console.log('Study Tips:', response.data); // Log study tips to verify the response
          setStudyTips(response.data);  // Set the fetched data to studyTips state
        } catch (error) {
          console.error('Error fetching study tips:', error);  // Log any errors encountered
        }
      }
    };

    // Call the data fetching functions
    fetchProgressData();
    fetchStudyTips();
  }, [user]);  // Dependency array ensures effect runs when user changes

  // Prepare data for the chart
  const chartData = {
    labels: progressData.map(data => data.subject_name), // Map subject names for the x-axis
    datasets: [
      {
        label: 'Total Minutes Studied',  // Label for the dataset
        data: progressData.map(data => data.total_minutes_studied),  // Map total minutes studied for the y-axis
        backgroundColor: 'rgba(75, 192, 192, 0.6)',  // Set background color for the bars
        borderColor: 'rgba(75, 192, 192, 1)',  // Set border color for the bars
        borderWidth: 1,  // Set border width
      },
    ],
  };

  // Chart options
  const options = {
    scales: {
      y: {
        beginAtZero: true,  // Start y-axis from zero
      },
    },
  };

  // Render the component
  return (
    <div>
      <h2>Study Progress Dashboard</h2>  {/* Dashboard title */}
      <Bar data={chartData} options={options} />  {/* Render the Bar chart with prepared data and options */}

      <h3>Study Tips</h3>  {/* Section title for study tips */}
      <ul>
        {studyTips.length > 0 ? (  // Check if there are study tips available
          studyTips.map((tip) => (  // Map over the study tips array
            <li key={tip.id}>  {/* Render each tip in a list item */}
              <strong>{tip.subject_name}:</strong> {tip.suggestion}  {/* Display subject name and suggestion */}
            </li>
          ))
        ) : (
          <li>No study tips available.</li> // Optional: Inform user if there are no tips
        )}
      </ul>
    </div>
  );
};

export default Dashboard;  // Export the Dashboard component
