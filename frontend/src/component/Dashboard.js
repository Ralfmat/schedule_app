import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import './Dashboard.css';

import { fetchWeekdays, fetchWorkdays, postWorkday, deleteWorkday } from '../utils/dataUtils';

export const Dashboard = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
    const [modalType, setModalType] = useState(''); // To track which modal to open
    const [weekdays, setWeekdays] = useState([]);
    const [workdays, setWorkdays] = useState([]);
    const [formData, setFormData] = useState({
        week_day: '',
    });
    const [isWorkdaySelected, setIsWorkdaySelected] = useState(false);

    const today = new Date();

    useEffect(() => {
        // Set today as the initially selected date on component mount
        setSelectedDate(today);

        const loadWeekdays = async() => {
            const weekdays = await fetchWeekdays();
            setWeekdays(weekdays);
        };

        const loadWorkdays = async() => {
            const workdays = await fetchWorkdays(true);
            setWorkdays(workdays);
        }
        loadWeekdays();
        loadWorkdays();
    }, []);
    
    
    const handleDateSelect = (selectionInfo) => {
        const { startStr } = selectionInfo;
        setSelectedDate(startStr);
        const isWorkday = workdays.some((workday) => workday.date === startStr);
        setIsWorkdaySelected(isWorkday);

        // Determine the selected weekday based on the date
        const date = new Date(startStr);
        const weekdayName = date.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
        
        // Find the open_at and close_at times for the selected weekday from weekdays array
        const selectedWeekday = weekdays.find(day => day.day_name.toLowerCase() === weekdayName);
        
        
        // Set formData with weekday name and corresponding open and close times
        if (selectedWeekday) {
            setFormData({
                week_day: selectedWeekday.day_name, // Weekday name from the selected date
                open_at: selectedWeekday.open_at, // Corresponding open time from database
                close_at: selectedWeekday.close_at, // Corresponding close time from database
            });
        }
    };

    const handleOpenModal = (type) => {
        setModalType(type);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setModalType('');
    };

    const handleConfirm = async () => {
        try {
            // Find the weekday ID based on the weekday name in formData
            const selectedWeekday = weekdays.find(day => day.day_name === formData.week_day);
            const weekdayId = selectedWeekday ? selectedWeekday.id : null;
    
            // Check if weekdayId is valid before proceeding
            if (!weekdayId) {
                console.error("Weekday ID not found for:", formData.week_day);
                return;
            }
    
            const data = {
                date: selectedDate,
                week_day: weekdayId,
            };
            
            // TODO: Add creating multiple workdays (multiple selection and for loop with post request)
            //       Add removing workdays
            //       Add displaying workdays in dashboard
            //       Limit access to only manager user

            console.log("Submitting data:", data);
            await postWorkday(data);
            const updatedWorkdays = await fetchWorkdays(true);
            setWorkdays(updatedWorkdays);
            handleCloseModal();
        } catch (error) {
            console.error("Error creating workday:", error);
        }
    };

    const handleRemoveWorkday = async () => {
        if (!selectedDate) return;

        try {
            // Find the workday ID for the selected date
            const workdayToRemove = workdays.find((workday) => workday.date === selectedDate);
            console.log(workdayToRemove);
            
            if (workdayToRemove) {
                await deleteWorkday(workdayToRemove.id);
                const updatedWorkdays = await fetchWorkdays(true);
                setWorkdays(updatedWorkdays);

                // Reset selection
                setSelectedDate(null);
                setIsWorkdaySelected(false);
            }
        } catch (error) {
            console.error("Error removing workday:", error);
        } finally {
            setConfirmDeleteModalOpen(false);
        }
    };


    const createBackgroundEvents = (workdays) => {
        return workdays.map((workday) => ({
            start: workday.date, // Start of the workday (ISO 8601 format)
            end: workday.date,   // End is the same for single-day background events
            display: 'background',
            color: '#ff9999',
        }));
    };

    
    const backgroundEvents = createBackgroundEvents(workdays);

    return (
        <div className='dashboard-window'>
            <div className='dashboard-toolbar'>
                <h1>Dashboard Toolbar</h1>
                <Button variant="contained"
                color="primary"
                onClick={() => handleOpenModal('createWorkday')}
                disabled={isWorkdaySelected}>
                    Create Workday
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setConfirmDeleteModalOpen(true)}
                    disabled={!isWorkdaySelected} // Disable unless a workday is selected
                    sx={{ ml: 2 }}
                >
                    Remove Workday
                </Button>
            </div>
            <div className='dashboard-calendar'>
                <FullCalendar
                    key={backgroundEvents.length}
                    firstDay={1}
                    weekends={true}
                    height={"70vh"}
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    selectable={true}
                    select={handleDateSelect}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,dayGridWeek',
                    }}
                    events={backgroundEvents}
                    dayMaxEvents={true} // Limit displayed events with "more" link
                    eventColor="#4285f4" // Google Calendar primary color
                    eventTextColor="white"
                />
            </div>

            {/* Create Workday Modal */}
            <Modal
                open={openModal && modalType === 'createWorkday'}
                onClose={handleCloseModal}
                aria-labelledby="modal-title"
            >
                <Box
                
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        borderRadius: 4,
                        p: 4,
                    }}
                >
                    <Typography id="modal-title" variant="h6" component="h2">
                        Workday Details
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        <strong>Date:</strong> {selectedDate}
                    </Typography>
                    {/* Display weekday name */}
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        <strong>Weekday:</strong> {formData.week_day ? formData.week_day.charAt(0).toUpperCase() + formData.week_day.slice(1) : 'N/A'}
                    </Typography>
                    {/* Display open time */}
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        <strong>Open Time:</strong> {formData.open_at ? formData.open_at : 'N/A'}
                    </Typography>
                    {/* Display close time */}
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        <strong>Close Time:</strong> {formData.close_at ? formData.close_at : 'N/A'}
                    </Typography>
                    {/* Buttons */}
                    <Box display="flex" justifyContent="space-between" mt={4}>
                        <Button onClick={handleConfirm} variant="contained" color="primary">
                            Confirm
                        </Button>
                        <Button onClick={handleCloseModal} variant="outlined" color="secondary">
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Confirm Delete Modal */}
            <Modal
                open={confirmDeleteModalOpen}
                onClose={() => setConfirmDeleteModalOpen(false)}
                aria-labelledby="confirm-delete-title"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    borderRadius: 4,
                    p: 4,
                }}>
                    <Typography id="confirm-delete-title" variant="h6">
                        Confirm Deletion
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        Are you sure you want to remove the workday for {selectedDate}?
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mt={4}>
                        <Button onClick={handleRemoveWorkday} variant="contained" color="error">
                            Yes, Remove
                        </Button>
                        <Button onClick={() => setConfirmDeleteModalOpen(false)} variant="outlined" color="secondary">
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

