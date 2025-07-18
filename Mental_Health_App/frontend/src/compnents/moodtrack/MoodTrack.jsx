import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import Navbar from '../navbar/Navbar';
import './MoodTrack.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const MoodTrack = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mood, setMood] = useState(null);
  const [moodData, setMoodData] = useState([]);
  
  const username = localStorage.getItem('tokenUser');
  console.log('Username:', username);

  useEffect(() => {
    if (username) {
      // Fetch existing mood data for the user - FIXED URL
      axios.get(`http://localhost:8000/api/moods/${username}`)
        .then(response => {
          console.log('Fetched mood data:', response.data);
          setMoodData(response.data);
        })
        .catch(error => console.error('Error fetching mood data:', error));
    }
  }, [username]);

  const handleDateChange = (event) => {
    const dateValue = event.target.value;
    console.log('Selected date:', dateValue);
    setSelectedDate(dateValue);
    setIsModalOpen(true);
  };

  const handleMoodSelect = (selectedMood) => {
    console.log('Selected mood:', selectedMood, 'for date:', selectedDate);
    
    if (!selectedDate) {
      console.error('No date selected');
      alert('Please select a date first');
      return;
    }

    if (!username) {
      console.error('No username found');
      alert('User not logged in');
      return;
    }
    
    setMood(selectedMood);
    
    const moodPayload = {
      date: new Date(selectedDate).toISOString(), // Ensure proper date format
      mood: selectedMood
    };
    
    console.log('Sending mood data:', moodPayload);

    // FIXED URL - added /api prefix to match backend routes
    axios.post(`http://localhost:8000/api/moods/${username}`, moodPayload)
      .then(response => {
        console.log('Mood saved successfully:', response.data);
        setMoodData(prevData => [...prevData, response.data]);
        setIsModalOpen(false);
        setSelectedDate(null);
        alert('Mood saved successfully!');
      })
      .catch(error => {
        console.error('Error saving mood:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          alert(`Failed to save mood: ${error.response.data.message || 'Unknown error'}`);
        } else if (error.request) {
          console.error('Error request:', error.request);
          alert('Failed to save mood: No response from server');
        } else {
          console.error('Error message:', error.message);
          alert(`Failed to save mood: ${error.message}`);
        }
      });
  };

  const moodLabels = ['😄', '😊', '😐', '😔', '😢'];
  const moodCounts = moodLabels.map(label => moodData.filter(entry => entry.mood === label).length);

  const data = {
    labels: moodLabels,
    datasets: [
      {
        label: 'Mood Frequency',
        data: moodCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-12 mt-20 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 rounded-lg shadow-lg border border-gray-400" style={{ maxWidth: '840px', marginTop: '100px' }}>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center">
            <input
              type="date"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-4"
              onChange={handleDateChange}
              value={selectedDate || ''}
            />
          </div>
          
          <Transition appear show={isModalOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-25" />
              </Transition.Child>
              
              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-full p-4 text-center">
                  <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        How do you feel on {selectedDate}?
                      </Dialog.Title>
                      
                      <div className="mt-4 flex justify-around">
                        {moodLabels.map((emoji, index) => (
                          <button
                            key={index}
                            className="text-4xl transition duration-300 ease-in-out transform hover:scale-110 hover:bg-gray-100 rounded-lg p-2"
                            onClick={() => handleMoodSelect(emoji)}
                            type="button"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Mood Frequency</h2>
          </div>
          <div className="mt-6 h-96">
            <Bar 
              data={data} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                  legend: { display: false } 
                } 
              }} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MoodTrack;