import React, { useEffect, useState, useContext } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js'; // Import Chart.js components
import AxiosInstance from './Axios';
import { AuthContext } from './AuthContext';

// Register all components
Chart.register(...registerables);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [progressData, setProgressData] = useState([]);
  const [studyTips, setStudyTips] = useState([]);

  useEffect(() => {
    const fetchProgressData = async () => {
      if (user) {
        try {
          const response = await AxiosInstance.get(`/studyprogress?subject__user=${user.id}`); // Update query param
          setProgressData(response.data);
        } catch (error) {
          console.error('Error fetching progress data:', error);
        }
      }
    };

    const fetchStudyTips = async () => {
        if (user) {
          try {
            const response = await AxiosInstance.get(`/studytip?subject__user=${user.id}`); // Update query param
            console.log('Study Tips:', response.data); // Log study tips to verify the response
            setStudyTips(response.data);
          } catch (error) {
            console.error('Error fetching study tips:', error);
          }
        }
      };

    fetchProgressData();
    fetchStudyTips();
  }, [user]);

  const chartData = {
    labels: progressData.map(data => data.subject_name), // Adjusted to match your model
    datasets: [
      {
        label: 'Total Minutes Studied',
        data: progressData.map(data => data.total_minutes_studied),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <h2>Study Progress Dashboard</h2>
      <Bar data={chartData} options={options} />

      <h3>Study Tips</h3>
      <ul>
        {studyTips.length > 0 ? (
            studyTips.map((tip) => (
            <li key={tip.id}>
                <strong>{tip.subject_name}:</strong> {tip.suggestion}
            </li>
            ))
        ) : (
            <li>No study tips available.</li> // Optional: Inform user if there are no tips
        )}
      </ul>
    </div>
  );
};

export default Dashboard;
