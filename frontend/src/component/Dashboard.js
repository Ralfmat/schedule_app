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

import { fetchWeekdays, fetchWorkdays, postWorkday, deleteWorkday, fetchShifts, postShift } from '../utils/dataUtils';

export const Dashboard = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
    const [modalType, setModalType] = useState(''); // To track which modal to open
    const [weekdays, setWeekdays] = useState([]);
    const [workdays, setWorkdays] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [formData, setFormData] = useState({
        week_day: '',
        date: '',
        open_at: '',
        close_at: '',
        shift_start_time: '',
        shift_end_time: '',
    });
    const [isWorkdaySelected, setIsWorkdaySelected] = useState(false);

    useEffect(() => {
        const loadWeekdays = async() => {
            const weekdays = await fetchWeekdays();
            setWeekdays(weekdays);
        };

        const loadWorkdays = async() => {
            const workdays = await fetchWorkdays(true);
            setWorkdays(workdays);
        }
        const loadShifts = async () => {
            const shifts = await fetchShifts();
            setShifts(shifts);
        };

        loadWeekdays();
        loadWorkdays();
        loadShifts();
    }, []);
    
    const handleDateSelect = (selectionInfo) => {
        const { startStr } = selectionInfo;
        setSelectedDate(startStr);

        // Check if there's a workday for the selected date
        const workday = workdays.find((workday) => workday.date === startStr);
        const isWorkday = !!workday; // Boolean to check if workday exists
        setIsWorkdaySelected(isWorkday);

         // Determine the selected weekday based on the date
        const date = new Date(startStr);
        const weekdayName = date.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
        
        // Find the open_at and close_at times for the selected weekday from weekdays array
        const selectedWeekday = weekdays.find(day => day.day_name.toLowerCase() === weekdayName);

        // Set formData with weekday name, corresponding open and close times, and workday date if available
        setFormData({
            week_day: selectedWeekday ? selectedWeekday.day_name : '', // Weekday name from the selected date
            open_at: selectedWeekday ? selectedWeekday.open_at : '', // Corresponding open time from database
            close_at: selectedWeekday ? selectedWeekday.close_at : '', // Corresponding close time from database
            date: isWorkday ? workday.date : '', // Add workday date if it exists
        });
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

    const handleWorkdayCreate = async () => {
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

            console.log("Submitting data:", data);
            await postWorkday(data);
            const updatedWorkdays = await fetchWorkdays(true);
            setWorkdays(updatedWorkdays);
            handleCloseModal();
        } catch (error) {
            console.error("Error creating workday:", error);
        }
    };

    const handleShiftCreate = async () => {
        const selectedWorkday = workdays.find(day => day.date === formData.date);
        const workdayId = selectedWorkday ? selectedWorkday.id : null;

        if(!workdayId) {
            console.error("Workday ID not found for:", formData.date);
            return;
        }

        const data = {
            start_time: formData.shift_start_time,
            end_time: formData.shift_end_time,
            workday_id: workdayId
        };

        console.log("Submitting shift data:", data);

        try {
            await postShift(data); // Replace with your actual API call
            const updatedShifts = await fetchShifts(); // Fetch updated shifts
            setShifts(updatedShifts); // Update shifts state
            handleCloseModal(); // Close the modal after successful creation
        } catch (error) {
            console.error("Error creating shift:", error);
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

                const updatedShifts = await fetchShifts(); // Fetch updated shifts
                setShifts(updatedShifts); // Update shifts state

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

    const createWorkdayEvents = (workdays) => {
        return workdays.map((workday) => ({
            start: workday.date, // Start of the workday (ISO 8601 format)
            end: workday.date,   // End is the same for single-day background events
            display: 'background',
            color: '#ff9999',
        }));
    };

    const createShiftEvents = (shifts) => {
        return shifts.map((shift) => {

            // Extract hours and minutes
            const formatTime = (time) => {
                const [hours, minutes] = time.split(':'); // Split by colon
                return `${hours}:${minutes}`;
            };
    
            return {
                id: shift.id,
                title: `${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}`,
                start: `${shift.workday.date}T${shift.start_time}`,
                end: `${shift.workday.date}T${shift.end_time}`,
                className: 'custom-shift-event',
            };
        });
    };
    
    const workdayEvents = createWorkdayEvents(workdays);
    const shiftEvents = createShiftEvents(shifts);
    
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
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenModal('createShift')}
                    disabled={!isWorkdaySelected} // Enable only if a workday is selected
                    sx={{ ml: 2 }}
                >
                    Create Shift
                </Button>
            </div>
            <div className='dashboard-calendar'>
            <FullCalendar
                    key={workdayEvents.length + shiftEvents.length}
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
                    events={[...workdayEvents, ...shiftEvents]}
                    eventContent={(eventInfo) => (
                        <div>
                            <span>{eventInfo.event.title}</span>
                        </div>
                    )}
                    dayMaxEvents={true}
                    eventClick={(info) => {
                        console.log("Clicked event:", info.event);
                        // Open shift modal for modification
                        handleOpenModal('modifyShift');
                    }}
                />
            </div>
            
            {/* Create Shift Modal */}
            <Modal
                open={openModal && modalType === 'createShift'}
                onClose={handleCloseModal}
                aria-labelledby="shift-modal-title"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 600, // Increased width
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        borderRadius: 4,
                        p: 4,
                    }}
                >
                    <Typography id="shift-modal-title" variant="h6" component="h2" sx={{ mb: 3 }}>
                        Create Shift
                    </Typography>
                    {/* Display Date */}
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>Date:</strong> {selectedDate ? selectedDate : 'N/A'}
                    </Typography>
                    {/* Display Weekday */}
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>Weekday:</strong> {formData.week_day ? formData.week_day.charAt(0).toUpperCase() + formData.week_day.slice(1) : 'N/A'}
                    </Typography>
                    {/* Display Open and Close Times */}
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        <strong>Open Time:</strong> {formData.open_at ? formData.open_at : 'N/A'} | 
                        <strong> Close Time:</strong> {formData.close_at ? formData.close_at : 'N/A'}
                    </Typography>
                    {/* Input Fields for Shift Time */}
                    <TextField
                        label="Shift Start Time"
                        type="time"
                        fullWidth
                        margin="normal"
                        sx={{ mb: 2 }}
                        name="shift_start_time"
                        value={formData.shift_start_time || "06:00:00"}
                        onChange={handleInputChange}
                    />
                    <TextField
                        label="Shift End Time"
                        type="time"
                        fullWidth
                        margin="normal"
                        sx={{ mb: 3 }}
                        name="shift_end_time"
                        value={formData.shift_end_time || "12:00:00"}
                        onChange={handleInputChange}
                    />
                    {/* Action Buttons */}
                    <Box display="flex" justifyContent="space-between" mt={4}>
                        <Button onClick={handleShiftCreate} variant="contained" color="primary">
                            Confirm
                        </Button>
                        <Button onClick={handleCloseModal} variant="outlined" color="secondary">
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>

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
                        <Button onClick={handleWorkdayCreate} variant="contained" color="primary">
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
                        {"Are you sure you want to remove the workday for " + selectedDate + "?"}
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

