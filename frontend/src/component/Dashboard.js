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

import { fetchWeekdays, fetchWorkdays, postWorkday } from '../utils/dataUtils';

export const Dashboard = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [modalType, setModalType] = useState(''); // To track which modal to open
    const [weekdays, setWeekdays] = useState([]);
    const [workdays, setWorkdays] = useState([]);
    const [formData, setFormData] = useState({
        week_day: '',
    });

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

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
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
            postWorkday(data);
            handleCloseModal();
        } catch (error) {
            console.error("Error creating workday:", error);
        }
    };

    return (
        <div className='dashboard-window'>
            <div className='dashboard-toolbar'>
                <h1>Dashboard Toolbar</h1>
                <Button variant="contained" color="primary" onClick={() => handleOpenModal('createWorkday')}>
                    Create Workday
                </Button>
            </div>
            <div className='dashboard-calendar'>
                <FullCalendar
                    firstDay={1}
                    weekends={true}
                    height={"60vh"}
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    selectable={true}
                    select={handleDateSelect}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,dayGridWeek',
                    }}
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
                        p: 4,
                    }}
                >
                    <Typography id="modal-title" variant="h6" component="h2">
                        Create Workday
                    </Typography>
                    {/* Display weekday name as non-editable text */}
                    <TextField
                        label="Weekday"
                        value={formData.weekday ? formData.weekday.charAt(0).toUpperCase() + formData.weekday.slice(1) : ''}
                        fullWidth
                        margin="normal"
                        input={{
                            readOnly: true,
                        }}
                    />
                    <TextField
                        label="Open Time"
                        type="time"
                        name="open_at"
                        value={formData.open_at}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Close Time"
                        type="time"
                        name="close_at"
                        value={formData.close_at}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <Box display="flex" justifyContent="space-between" mt={2}>
                        <Button onClick={handleCloseModal} variant="outlined" color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} variant="contained" color="primary">
                            Confirm
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

