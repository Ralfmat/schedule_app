import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { Grid2, Typography, Button, Box } from '@mui/material';

import './Dashboard.css';

import { fetchWeekdays, fetchWorkdays, postWorkday, deleteWorkday, fetchShifts, postShift, fetchAvailability, deleteShift, fetchAccounts } from '../utils/dataUtils';

export const Dashboard = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
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
    const [selectedShift, setSelectedShift] = useState(null);
    const [availabilities, setAvailabilities] = useState([]);
    const [partAvailabilities, setPartAvailabilities] = useState([]);
    const [assignedEmployees, setAssignedEmployees] = useState([]);
    const [partAssignedEmployees, setPartAssignedEmployees] = useState([]);
    const [employees, setEmployees] = useState([]);


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
            const shifts = await fetchShifts(undefined, true);
            setShifts(shifts);
        };
        // const loadEmployees = async () => {
        //     const accounts = await fetchAccounts();
        //     const employees = accounts.filter((account) => {
        //         return account.role === "EMPLOYEE";
        //     });
        //     setEmployees(employees);
        // }

        loadWeekdays();
        loadWorkdays();
        loadShifts();
        // loadEmployees();
    }, []);

    useEffect(() => {
        const loadEmployees = async () => {
            const accounts = await fetchAccounts();
            const employees = accounts.filter((account) => {
                return account.role === "EMPLOYEE"; // Filter for employees
            });
    
            // If selectedShift is available, filter employees based on its date
            if (selectedShift) {
                const selectedShiftDate = selectedShift.workday_date; // Get the date of the selected shift
    
                try {
                    // Fetch availabilities for the selected shift's workday
                    const availabilities = await fetchAvailability(selectedShift.workday_id, true);
    
                    // Filter employees who do not have availability on the selected shift date
                    const employeesWithoutAvailability = employees.filter((employee) => {
                        // Check if this employee has availability on the selected shift's date
                        const employeeHasAvailability = availabilities.some((availability) => {
                            return availability.account.id === employee.id && availability.workday.date === selectedShiftDate;
                        });
    
                        // Return only employees who don't have availability on that date
                        return !employeeHasAvailability;
                    });
    
                    setEmployees(employeesWithoutAvailability);
                } catch (error) {
                    console.error("Error fetching availabilities:", error);
                }
            }
        };
    
        loadEmployees();
    }, [selectedShift]); // Dependency on selectedShift to reload when it changes

    const isWithinShiftHours = (availStart, availEnd, shiftStartISO, shiftEndISO) => {
        const toMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };
    
        // Extract time portion from ISO format
        const extractTime = (isoTime) => {
            return isoTime.split('T')[1].split('+')[0]; // Gets "HH:mm:ss" from "2024-12-07T12:00:00+01:00"
        };
    
        const shiftStart = extractTime(shiftStartISO);
        const shiftEnd = extractTime(shiftEndISO);
    
        return (
            toMinutes(availStart) <= toMinutes(shiftStart) &&
            toMinutes(availEnd) >= toMinutes(shiftEnd)
        );
    };

    const isPartlyWithinShiftHours = (availStart, availEnd, shiftStartISO, shiftEndISO) => {
        const toMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };
    
        // Extract time portion from ISO format
        const extractTime = (isoTime) => {
            return isoTime.split('T')[1].split('+')[0]; // Gets "HH:mm:ss" from "2024-12-07T12:00:00+01:00"
        };
    
        const shiftStart = extractTime(shiftStartISO);
        const shiftEnd = extractTime(shiftEndISO);
    
        return (
            (toMinutes(availStart) < toMinutes(shiftEnd) && toMinutes(availStart) > toMinutes(shiftStart)) ||
            (toMinutes(availEnd) < toMinutes(shiftEnd) && toMinutes(availEnd) > toMinutes(shiftStart))
        );
    };

    useEffect(() => {
        const loadAvailabilities = async () => {
            if (selectedShift && selectedShift.workday_id) {
                try {
                    const response = await fetchAvailability(selectedShift.workday_id, true);
                    setAvailabilities(
                        response.filter((availability) =>
                            isWithinShiftHours(
                                availability.start_time,
                                availability.end_time,
                                selectedShift.start_time,
                                selectedShift.end_time
                            )
                        )
                    );
                    setPartAvailabilities(
                        response.filter((availability) =>
                            isPartlyWithinShiftHours(
                                availability.start_time,
                                availability.end_time,
                                selectedShift.start_time,
                                selectedShift.end_time
                            )
                        )
                    );
                    
                } catch (error) {
                    console.error("Error fetching availabilities:", error);
                }
            }
        };

        loadAvailabilities();
        setAssignedEmployees([]);
        setAvailabilities([]);
        setPartAssignedEmployees([]);
        setPartAvailabilities([]);
    }, [selectedShift]);
    
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
        setAssignedEmployees([]);
        setAvailabilities([]);
        setPartAssignedEmployees([]);
        setPartAvailabilities([]);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setModalType('');
        setAssignedEmployees([]);
        setAvailabilities([]);
        setPartAssignedEmployees([]);
        setPartAvailabilities([]);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleAssignEmployee = (availability) => {
        setAssignedEmployees((prev) => [...prev, availability]);
        setAvailabilities((prev) => prev.filter((avail) => avail.id !== availability.id));
    };

    const handlePartlyAssignEmployee = (availability) => {
        setPartAssignedEmployees((prev) => [...prev, availability]);
        setPartAvailabilities((prev) => prev.filter((avail) => avail.id !== availability.id));
    };
    
    const handleUnassignEmployee = (employee) => {
        setAssignedEmployees((prev) => prev.filter((assigned) => assigned.id !== employee.id));
        setAvailabilities((prev) => [...prev, employee]);
    };

    const handlePartlyUnassignEmployee = (employee) => {
        setPartAssignedEmployees((prev) => prev.filter((assigned) => assigned.id !== employee.id));
        setPartAvailabilities((prev) => [...prev, employee]);
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
        const workday = selectedWorkday ? selectedWorkday : null;

        if(!workday) {
            console.error("Workday not found for:", formData.date);
            return;
        }

        const data = {
            start_time: formData.shift_start_time,
            end_time: formData.shift_end_time,
            workday_id: workday.id
        };

        console.log("Submitting shift data:", data);

        try {
            await postShift(data); // Replace with your actual API call
            const updatedShifts = await fetchShifts(undefined, true); // Fetch updated shifts
            const newShift = updatedShifts.find(
                updatedShift => !shifts.some(
                    existingShift => existingShift.id === updatedShift.id
                )
            );
            setSelectedShift(newShift);
            setShifts(updatedShifts); // Update shifts state
            // handleCloseModal(); // Close the modal after successful creation
            handleOpenModal('modifyShift');
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

                const updatedShifts = await fetchShifts(undefined, true); // Fetch updated shifts
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

    const handleRemoveShift = async () => {
        try {
            await deleteShift(selectedShift.id);

            const updatedShifts = await fetchShifts(undefined, true);
            setShifts(updatedShifts);

            handleCloseModal();
        } catch (error) {
            console.error("Error removing shift:", error);
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
                extendedProps: {
                    workday_id: shift.workday.id,
                    workday_date: shift.workday.date
                },
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
                        const clickedShift = shifts.find(shift => `${shift.id}` === `${info.event.id}`);
    
                        if (clickedShift) {
                            setSelectedShift(clickedShift);
                        } else {
                            console.error("Shift not found for ID:", info.event.id);
                        }
                        
                        handleOpenModal('modifyShift');
                    }}
                />
            </div>
            
            {/* Edit Shift Modal */}
            <Modal
                open={openModal && modalType === 'modifyShift'}
                onClose={handleCloseModal}
                aria-labelledby="edit-shift-modal-title"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '40%',
                        overflowY: 'auto',
                        maxHeight: '95vh',
                        transform: 'translate(-35%, -50%)',
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        borderRadius: 4,
                        p: 4,
                    }}
                >
                    <Typography id="edit-shift-modal-title" variant="h6" sx={{ mb: 2 }}>
                        Assign Employees To The Shift
                    </Typography>

                    <Typography>
                        <strong>Date:</strong> {selectedShift ? selectedShift.workday.date : ""} <br />
                        <strong>Shift:</strong> {selectedShift ? selectedShift.start_time : ""} - {selectedShift ? selectedShift.end_time : ""}
                    </Typography>

                    {/* Grid layout for employees */}
                    <Grid2 container spacing={3} sx={{ mt: 3 }}>
                        {/* First Column: Available and Partly Available Employees */}
                        <Grid2 item xs={6} sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: '300px' }}>
                                {/* Available Employees */}
                                <Typography variant="subtitle1">Fully Available Employees</Typography>
                                <Box
                                    sx={{
                                        minHeight: '130px',
                                        maxHeight: '130px', // Fixed height for scrollable box
                                        minWidth: '500px',
                                        maxWidth: '500px',
                                        overflowY: 'auto',  // Makes the list scrollable
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        p: 1,
                                    }}
                                >
                                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                        {availabilities.map((availability) => (
                                            <li key={availability.id}>
                                                {availability.account.username} ({availability.start_time} - {availability.end_time})
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleAssignEmployee(availability)}
                                                    sx={{ ml: 2 }}
                                                >
                                                    +
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </Box>

                                {/* Partly Available Employees */}
                                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                                    Partly Available Employees
                                </Typography>
                                <Box
                                    sx={{
                                        minHeight: '150px',
                                        maxHeight: '150px', // Fixed height for scrollable box
                                        minWidth: '500px',
                                        maxWidth: '500px',
                                        overflowY: 'auto',  // Makes the list scrollable
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        p: 1,
                                    }}
                                >
                                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                        {partAvailabilities.map((availability) => (
                                            <li key={availability.id}>
                                                {availability.account.username} ({availability.start_time} - {availability.end_time})
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handlePartlyAssignEmployee(availability)}
                                                    sx={{ ml: 2 }}
                                                >
                                                    +
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </Box>
                            </Box>
                        </Grid2>

                        {/* Second Column: All Employees (Not Just Available or Partly Available) */}
                        <Grid2 item xs={6}>
                            <Typography variant="subtitle1">
                                Non available Employees
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: '300px' }}>
                                <Box
                                    sx={{
                                        minHeight: '325px',
                                        maxHeight: '325px', // Fixed height for scrollable box
                                        minWidth: '500px',
                                        maxWidth: '500px',
                                        overflowY: 'auto',  // Makes the list scrollable
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        p: 1,
                                    }}
                                >
                                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                        {employees.map((employee) => (
                                            <li key={employee.id}>
                                                {employee.username} ({employee.role})
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleAssignEmployee(employee)}
                                                    sx={{ ml: 2, mb: 1 }}
                                                >
                                                    +
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </Box>
                            </Box>
                        </Grid2>
                    </Grid2>

                    {/* Assigned Employees Section */}
                    <Typography variant="subtitle1" sx={{ mt: 3 }}>
                        Assigned Employees
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Assigned Employees */}
                        <Box
                            sx={{
                                minHeight: '150px',
                                maxHeight: '150px', // Fixed height for scrollable box
                                minWidth: '500px',
                                maxWidth: '500px',
                                overflowY: 'auto',  // Makes the list scrollable
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                p: 1,
                                mb: 1, // Margin-bottom to separate the two sections
                            }}
                        >
                            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                {assignedEmployees.map((employee) => (
                                    <li key={employee.id}>
                                        {employee.account.username}
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="secondary"
                                            onClick={() => handleUnassignEmployee(employee)}
                                            sx={{ ml: 2 }}
                                        >
                                            -
                                        </Button>
                                    </li>
                                ))}
                            </ul>

                            <ul>
                                {partAssignedEmployees.map((employee) => (
                                    <li key={employee.id}>
                                        {employee.account.username}
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="secondary"
                                            onClick={() => handlePartlyUnassignEmployee(employee)}
                                            sx={{ ml: 2 }}
                                        >
                                            -
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box display="flex" justifyContent="space-between" mt={4}>
                        <Button
                            onClick={async () => {
                                try {
                                    const assignments = assignedEmployees.map((employee) => ({
                                        account_id: employee.account.id,
                                        shift_id: selectedShift.id,
                                    }));
                                    // await postShiftAssignments(assignments); // Batch request
                                    console.log("Assignments saved successfully!");
                                    handleCloseModal();
                                } catch (error) {
                                    console.error("Error saving assignments:", error);
                                }
                            }}
                            variant="contained"
                            color="primary"
                        >
                            Confirm
                        </Button>

                        {/* Remove Shift Button */}
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleRemoveShift}
                        >
                            Remove Shift
                        </Button>

                        <Button onClick={handleCloseModal} variant="outlined" color="secondary">
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
            
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
                        width: 550, // Increased width
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
                        value={formData.shift_start_time || ""}
                        onChange={handleInputChange}
                    />
                    <TextField
                        label="Shift End Time"
                        type="time"
                        fullWidth
                        margin="normal"
                        sx={{ mb: 3 }}
                        name="shift_end_time"
                        value={formData.shift_end_time || ""}
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

