import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Grid2, Typography, Button, Box, Table, TableHead, TableBody, TableRow, TableCell, FormControlLabel, Switch } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import "./Dashboard.css";

import {
  fetchWeekdays,
  fetchWorkdays,
  postWorkday,
  deleteWorkday,
  fetchShifts,
  postShift,
  fetchAvailability,
  deleteShift,
  fetchAccounts,
  fetchAssignments,
  postAssignment,
  deleteAssignment,
} from "../utils/dataUtils";

import { isWithinShiftHours, isPartlyWithinShiftHours, formatDate, formatTime } from "../utils/funcUtils";

export const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [weekdays, setWeekdays] = useState([]);
  const [workdays, setWorkdays] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [formData, setFormData] = useState({
    week_day: "",
    date: "",
    open_at: "",
    close_at: "",
    shift_start_time: "",
    shift_end_time: "",
  });
  const [isWorkdaySelected, setIsWorkdaySelected] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [futureOnly, setFutureOnly] = useState(true);

  const [fullyAvailableEmployees, setFullyAvailableEmployees] = useState([]);
  const [partlyAvailableEmployees, setPartlyAvailableEmployees] = useState([]);
  const [unavailableEmployees, setUnavailableEmployees] = useState([]);
  const [assignedEmployees, setAssignedEmployees] = useState([]);

  const [assignedManagers, setAssignedManagers] = useState([]);
  const [fullyAvailableManagers, setFullyAvailableManagers] = useState([]);
  const [partlyAvailableManagers, setPartlyAvailableManagers] = useState([]);
  const [unavailableManagers, setUnavailableManagers] = useState([]);

  const [employeesToBeAssigned, setEmployeesToBeAssigned] = useState([]);
  const [employeesToBeUnassigned, setEmployeesToBeUnassigned] = useState([]);

  const [managersToBeAssigned, setManagersToBeAssigned] = useState([]);
  const [managersToBeUnassigned, setManagersToBeUnassigned] = useState([]);

  useEffect(() => {
    const loadWeekdays = async () => {
      const weekdays = await fetchWeekdays();
      setWeekdays(weekdays);
    };
    const loadWorkdays = async () => {
      const workdays = await fetchWorkdays(futureOnly);
      setWorkdays(workdays);
    };
    const loadShifts = async () => {
      const shifts = await fetchShifts(undefined, futureOnly);
      setShifts(shifts);
    };

    loadWeekdays();
    loadWorkdays();
    loadShifts();
  }, [futureOnly]);

  useEffect(() => {
    const loadEmployeesAndManagers = async () => {
      const accounts = await fetchAccounts(); // Fetch all accounts

      if (selectedShift) {
        try {
          const shiftAssignments = await fetchAssignments(selectedShift.id);

          // Split employees and managers
          const employees = accounts.filter((account) => account.role === "EMPLOYEE");
          const managers = accounts.filter((account) => account.role === "MANAGER");

          const assignedEmployees = shiftAssignments
            .filter((assignment) => assignment.account.role === "EMPLOYEE")
            .map((assignment) => ({
              ...assignment.account,
              assignment_id: assignment.id, // Include assignment_id
            }));

          const assignedManagers = shiftAssignments
            .filter((assignment) => assignment.account.role === "MANAGER")
            .map((assignment) => ({
              ...assignment.account,
              assignment_id: assignment.id, // Include assignment_id
            }));

          setAssignedEmployees(assignedEmployees);
          setAssignedManagers(assignedManagers);

          // Fetch availability for the shift
          const response = await fetchAvailability(selectedShift.workday.id, true);

          // Process Employees
          const fullyAvailableEmployees = response
            .filter((availability) =>
              isWithinShiftHours(
                availability.start_time,
                availability.end_time,
                selectedShift.start_time,
                selectedShift.end_time
              )
            )
            .map((availability) => ({
              ...availability.account,
              start_time: availability.start_time,
              end_time: availability.end_time,
            }))
            .filter((employee) => !assignedEmployees.some((assigned) => assigned.id === employee.id));

          const partlyAvailableEmployees = response
            .filter((availability) =>
              isPartlyWithinShiftHours(
                availability.start_time,
                availability.end_time,
                selectedShift.start_time,
                selectedShift.end_time
              )
            )
            .map((availability) => ({
              ...availability.account,
              start_time: availability.start_time,
              end_time: availability.end_time,
            }))
            .filter((employee) => !assignedEmployees.some((assigned) => assigned.id === employee.id));

          const unavailableEmployees = employees.filter(
            (employee) =>
              !fullyAvailableEmployees.some((available) => available.id === employee.id) &&
              !partlyAvailableEmployees.some((available) => available.id === employee.id) &&
              !assignedEmployees.some((assigned) => assigned.id === employee.id)
          );

          // Process Managers (use same logic)
          const fullyAvailableManagers = response
            .filter((availability) =>
              isWithinShiftHours(
                availability.start_time,
                availability.end_time,
                selectedShift.start_time,
                selectedShift.end_time
              )
            )
            .map((availability) => ({
              ...availability.account,
              start_time: availability.start_time,
              end_time: availability.end_time,
            }))
            .filter(
              (manager) =>
                manager.role === "MANAGER" && !assignedManagers.some((assigned) => assigned.id === manager.id)
            );

          const partlyAvailableManagers = response
            .filter((availability) =>
              isPartlyWithinShiftHours(
                availability.start_time,
                availability.end_time,
                selectedShift.start_time,
                selectedShift.end_time
              )
            )
            .map((availability) => ({
              ...availability.account,
              start_time: availability.start_time,
              end_time: availability.end_time,
            }))
            .filter(
              (manager) =>
                manager.role === "MANAGER" && !assignedManagers.some((assigned) => assigned.id === manager.id)
            );

          const unavailableManagers = managers.filter(
            (manager) =>
              !fullyAvailableManagers.some((available) => available.id === manager.id) &&
              !partlyAvailableManagers.some((available) => available.id === manager.id) &&
              !assignedManagers.some((assigned) => assigned.id === manager.id)
          );

          // Update state for employees
          setFullyAvailableEmployees(fullyAvailableEmployees);
          setPartlyAvailableEmployees(partlyAvailableEmployees);
          setUnavailableEmployees(unavailableEmployees);

          // Update state for managers
          setFullyAvailableManagers(fullyAvailableManagers);
          setPartlyAvailableManagers(partlyAvailableManagers);
          setUnavailableManagers(unavailableManagers);
        } catch (error) {
          console.error("Error fetching availabilities or assignments:", error);
        }
      }
    };

    loadEmployeesAndManagers();
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
    const weekdayName = date.toLocaleString("en-US", { weekday: "long" }).toLowerCase();

    // Find the open_at and close_at times for the selected weekday from weekdays array
    const selectedWeekday = weekdays.find((day) => day.day_name.toLowerCase() === weekdayName);

    // Set formData with weekday name, corresponding open and close times, and workday date if available
    setFormData({
      week_day: selectedWeekday ? selectedWeekday.day_name : "",
      open_at: selectedWeekday ? selectedWeekday.open_at : "",
      close_at: selectedWeekday ? selectedWeekday.close_at : "",
      date: isWorkday ? workday.date : "",
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    // Reset temporary lists for employees
    setEmployeesToBeAssigned([]);
    setEmployeesToBeUnassigned([]);
    setAssignedEmployees([]);
    setFullyAvailableEmployees([]);
    setPartlyAvailableEmployees([]);
    setUnavailableEmployees([]);

    // Reset temporary lists for managers
    setManagersToBeAssigned([]);
    setManagersToBeUnassigned([]);
    setAssignedManagers([]);
    setFullyAvailableManagers([]);
    setPartlyAvailableManagers([]);
    setUnavailableManagers([]);

    // Reset shift selection and modal state
    setSelectedShift(null);
    setOpenModal(false);
    setModalType("");
  };

  const toggleFutureOnly = () => {
    setFutureOnly((prev) => !prev);
    // loadWorkdaysAndShifts(); // Refresh workdays and shifts
  };

  const handleWorkdayCreate = async () => {
    try {
      // Find the weekday ID based on the weekday name in formData
      const selectedWeekday = weekdays.find((day) => day.day_name === formData.week_day);
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

        const updatedShifts = await fetchShifts(undefined, true);
        setShifts(updatedShifts);

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

  const handleShiftCreate = async () => {
    const selectedWorkday = workdays.find((day) => day.date === formData.date);
    const workday = selectedWorkday ? selectedWorkday : null;

    if (!workday) {
      console.error("Workday not found for:", formData.date);
      return;
    }

    const data = {
      start_time: formData.shift_start_time,
      end_time: formData.shift_end_time,
      workday_id: workday.id,
    };

    try {
      await postShift(data);
      const updatedShifts = await fetchShifts(undefined, true);
      const newShift = updatedShifts.find(
        (updatedShift) => !shifts.some((existingShift) => existingShift.id === updatedShift.id)
      );
      setSelectedShift(newShift);
      setShifts(updatedShifts);
      // handleCloseModal(); // Close the modal after successful creation
      handleOpenModal("modifyShift");
    } catch (error) {
      console.error("Error creating shift:", error);
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
      start: workday.date,
      end: workday.date,
      display: "background",
      color: "#ff9999",
    }));
  };

  const createShiftEvents = (shifts) => {
    return shifts.map((shift) => {
      return {
        id: shift.id,
        title: `${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}`,
        start: `${shift.workday.date}T${shift.start_time}`,
        end: `${shift.workday.date}T${shift.end_time}`,
        extendedProps: {
          workday_id: shift.workday.id,
          workday_date: shift.workday.date,
        },
        className: "custom-shift-event",
      };
    });
  };

  const workdayEvents = createWorkdayEvents(workdays);
  const shiftEvents = createShiftEvents(shifts);

  const restoreToPreviousGroup = (employee) => {
    if (!employee.start_time && !employee.end_time) {
      setUnavailableEmployees((prev) => [...prev, employee]);
    } else if (
      isWithinShiftHours(employee.start_time, employee.end_time, selectedShift.start_time, selectedShift.end_time)
    ) {
      setFullyAvailableEmployees((prev) => [...prev, employee]);
    } else if (
      isPartlyWithinShiftHours(employee.start_time, employee.end_time, selectedShift.start_time, selectedShift.end_time)
    ) {
      setPartlyAvailableEmployees((prev) => [...prev, employee]);
    }
  };

  const removeEmployeeFromGroups = (employee) => {
    setFullyAvailableEmployees((prev) => prev.filter((e) => e.id !== employee.id));
    setPartlyAvailableEmployees((prev) => prev.filter((e) => e.id !== employee.id));
    setUnavailableEmployees((prev) => prev.filter((e) => e.id !== employee.id));
    setAssignedEmployees((prev) => prev.filter((e) => e.id !== employee.id));
  };

  const handleAddToAssign = (employee) => {
    setEmployeesToBeAssigned((prev) => [...prev, employee]);
    removeEmployeeFromGroups(employee); // Remove from other groups
  };

  const handleRemoveFromToBeAssigned = (employee) => {
    setEmployeesToBeAssigned((prev) => prev.filter((e) => e.id !== employee.id));
    restoreToPreviousGroup(employee); // Restore to the correct group
  };

  const handleRemoveFromAssigned = (employee) => {
    setEmployeesToBeUnassigned((prev) => [...prev, { ...employee, assignment_id: employee.assignment_id }]);
    setAssignedEmployees((prev) => prev.filter((e) => e.id !== employee.id));
  };

  const handleUndoUnassign = (employee) => {
    setEmployeesToBeUnassigned((prev) => prev.filter((e) => e.id !== employee.id));
    setAssignedEmployees((prev) => [...prev, employee]);
  };

  const removeManagerFromGroups = (manager) => {
    setFullyAvailableManagers((prev) => prev.filter((m) => m.id !== manager.id));
    setPartlyAvailableManagers((prev) => prev.filter((m) => m.id !== manager.id));
    setUnavailableManagers((prev) => prev.filter((m) => m.id !== manager.id));
    setAssignedManagers((prev) => prev.filter((m) => m.id !== manager.id));
  };

  const restoreManagerToPreviousGroup = (manager) => {
    if (!manager.start_time && !manager.end_time) {
      setUnavailableManagers((prev) => [...prev, manager]);
    } else if (
      isWithinShiftHours(manager.start_time, manager.end_time, selectedShift.start_time, selectedShift.end_time)
    ) {
      setFullyAvailableManagers((prev) => [...prev, manager]);
    } else if (
      isPartlyWithinShiftHours(manager.start_time, manager.end_time, selectedShift.start_time, selectedShift.end_time)
    ) {
      setPartlyAvailableManagers((prev) => [...prev, manager]);
    }
  };

  const handleAddManagerToAssign = (manager) => {
    setManagersToBeAssigned((prev) => [...prev, manager]);
    removeManagerFromGroups(manager); // Remove from other groups
  };

  const handleRemoveManagerFromToBeAssigned = (manager) => {
    setManagersToBeAssigned((prev) => prev.filter((m) => m.id !== manager.id));
    restoreManagerToPreviousGroup(manager); // Restore to the correct group
  };

  const handleRemoveManagerFromAssigned = (manager) => {
    setManagersToBeUnassigned((prev) => [...prev, { ...manager, assignment_id: manager.assignment_id }]);
    setAssignedManagers((prev) => prev.filter((m) => m.id !== manager.id));
  };

  const handleUndoManagerUnassign = (manager) => {
    setManagersToBeUnassigned((prev) => prev.filter((e) => e.id !== manager.id));
    setAssignedManagers((prev) => [...prev, manager]);
  };

  const handleConfirmAssignments = async () => {
    try {
      // Process "to be assigned" group
      for (const employee of employeesToBeAssigned) {
        await postAssignment({ account_id: employee.id, shift_id: selectedShift.id });
      }
      for (const manager of managersToBeAssigned) {
        await postAssignment({ account_id: manager.id, shift_id: selectedShift.id });
      }

      // Process "to be unassigned" group
      for (const employee of employeesToBeUnassigned) {
        console.log(employee);
        if (employee.assignment_id) {
          await deleteAssignment(employee.assignment_id);
        }
      }
      for (const manager of managersToBeUnassigned) {
        if (manager.assignment_id) {
          await deleteAssignment(manager.assignment_id);
        }
      }

      // Refresh the assignments after confirmation
      const updatedAssignments = await fetchAssignments(selectedShift.id);

      setAssignedEmployees(
        updatedAssignments
          .filter((a) => a.account.role === "EMPLOYEE")
          .map((a) => ({ ...a.account, assignment_id: a.id }))
      );
      setAssignedManagers(
        updatedAssignments
          .filter((a) => a.account.role === "MANAGER")
          .map((a) => ({ ...a.account, assignment_id: a.id }))
      );

      // Clear temporary lists
      setEmployeesToBeAssigned([]);
      setEmployeesToBeUnassigned([]);
      setManagersToBeAssigned([]);
      setManagersToBeUnassigned([]);

      // Close the modal
      handleCloseModal();
    } catch (error) {
      console.error("Error confirming assignments:", error);
    }
  };

  return (
    <div className="dashboard-window">
      <div className="dashboard-toolbar">
        <h1>Dashboard Toolbar</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenModal("createWorkday")}
          disabled={isWorkdaySelected}
        >
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
          onClick={() => handleOpenModal("createShift")}
          disabled={!isWorkdaySelected} // Enable only if a workday is selected
          sx={{ ml: 2 }}
        >
          Create Shift
        </Button>
        <FormControlLabel
          sx={{ml: "27vw"}}
          control={
            <Switch
              checked={!futureOnly}
              onChange={toggleFutureOnly}
              color="primary"
            />
          }
          label={futureOnly ? "Past Workload" : "Past Workload"}
        />
      </div>
      <div className="dashboard-calendar">
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
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          events={[...workdayEvents, ...shiftEvents]}
          eventContent={(eventInfo) => (
            <div>
              <span>{eventInfo.event.title}</span>
            </div>
          )}
          dayMaxEvents={true}
          eventClick={(info) => {
            const clickedShift = shifts.find((shift) => `${shift.id}` === `${info.event.id}`);

            if (clickedShift) {
              setSelectedShift(clickedShift);
            } else {
              console.error("Shift not found for ID:", info.event.id);
            }

            handleOpenModal("modifyShift");
          }}
        />
      </div>

      {/* Edit Shift Modal */}
      <Modal
        open={openModal && modalType === "modifyShift"}
        onClose={handleCloseModal}
        aria-labelledby="edit-shift-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "40%",
            overflowY: "auto",
            minHeight: "80vh",
            maxHeight: "80vh",
            minWidth: "70vw",
            maxWidth: "70vw",
            transform: "translate(-35%, -50%)",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="edit-shift-modal-title" variant="h5" sx={{ mb: 2 }}>
            Assignment To The Shift
          </Typography>

          <Typography>
            <strong>Date:</strong>{" "}
            {selectedShift
              ? `${formatDate(selectedShift.workday.date)} - ${selectedShift.workday.week_day.day_name}`
              : ""}
            <br />
            <strong>Shift:</strong> {selectedShift ? formatTime(selectedShift.start_time) : ""} -{" "}
            {selectedShift ? formatTime(selectedShift.end_time) : ""}
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 3 }}>
            Assign Employees
          </Typography>

          {/* Employee Tables */}
          <Grid2 container spacing={2} sx={{ display: "flex", flexDirection: "column" }}>
            {/* First Row */}
            <Grid2 container spacing={2} xs={12} className="assign-row">
              {/* Fully Available Employees */}
              <Grid2 xs={4}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Fully Available Employees
                </Typography>
                <Box className="user-box" sx={{overflowY: "auto"}}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Available Time</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fullyAvailableEmployees
                        .filter((employee) => employee.role === "EMPLOYEE")
                        .map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell>{employee.username}</TableCell>
                            <TableCell>{`${formatTime(employee.start_time)} - ${formatTime(
                              employee.end_time
                            )}`}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleAddToAssign(employee)}
                              >
                                +
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Box>
              </Grid2>

              {/* Partly Available Employees */}
              <Grid2 xs={4}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Partly Available Employees
                </Typography>
                <Box className="user-box" sx={{overflowY: "auto"}}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Available Time</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {partlyAvailableEmployees
                        .filter((employee) => employee.role === "EMPLOYEE")
                        .map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell>{employee.username}</TableCell>
                            <TableCell>{`${formatTime(employee.start_time)} - ${formatTime(
                              employee.end_time
                            )}`}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleAddToAssign(employee)}
                              >
                                +
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Box>
              </Grid2>

              {/* Unavailable Employees */}
              <Grid2 xs={4}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Unavailable Employees
                </Typography>
                <Box className="user-box" sx={{overflowY: "auto"}}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody >
                      {unavailableEmployees
                        .filter((employee) => employee.role === "EMPLOYEE")
                        .map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell>{employee.username}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleAddToAssign(employee)}
                              >
                                +
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Box>
              </Grid2>
            </Grid2>

            {/* Second Row - Employees */}
            <Grid2 container spacing={2} xs={12} className="assign-row">
              {/* Employees To Be Assigned */}
              <Grid2 xs={6}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Employees To Be Assigned
                </Typography>
                <Box className="user-box" sx={{overflowY: "auto"}}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Available Time</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {employeesToBeAssigned
                        .filter((employee) => employee.role === "EMPLOYEE")
                        .map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell>{employee.username}</TableCell>
                            <TableCell>
                              {employee.start_time && employee.end_time
                                ? `${formatTime(employee.start_time)} - ${formatTime(employee.end_time)}`
                                : "Unavailable"}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                onClick={() => handleRemoveFromToBeAssigned(employee)}
                              >
                                -
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Box>
              </Grid2>

              {/* Assigned Employees */}
              <Grid2 xs={6}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Assigned Employees
                </Typography>
                <Box className="user-box" sx={{overflowY: "auto"}}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Available Time</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assignedEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>{employee.username}</TableCell>
                          <TableCell>
                            {employee.start_time && employee.end_time
                              ? `${formatTime(employee.start_time)} - ${formatTime(employee.end_time)}`
                              : "Unavailable"}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => handleRemoveFromAssigned(employee)}
                            >
                              -
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {employeesToBeUnassigned.map((employee) => (
                        <TableRow key={employee.id} className="to-be-unassigned" style={{ backgroundColor: "#e0e0e0" }}>
                          {" "}
                          {/* Gray Background */}
                          <TableCell>{employee.username}</TableCell>
                          <TableCell>
                            {employee.start_time && employee.end_time
                              ? `${formatTime(employee.start_time)} - ${formatTime(employee.end_time)}`
                              : "Unavailable"}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="contained"
                              color="warning" // Different color for undo
                              onClick={() => handleUndoUnassign(employee)}
                            >
                              &#8592; {/* Left Arrow */}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Grid2>
            </Grid2>
          </Grid2>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Assign Managers
          </Typography>

          <Grid2 container spacing={2} sx={{ display: "flex", flexDirection: "columns" }}>
            {/* First Row */}
            <Grid2 container spacing={2} xs={12} sx={{ mb: 2 }}>
              <Grid2 xs={4}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Fully Available Managers
                </Typography>
                <Box className="user-box" sx={{overflowY: "auto"}}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Available Time</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fullyAvailableManagers.map((manager) => (
                        <TableRow key={manager.id}>
                          <TableCell>{manager.username}</TableCell>
                          <TableCell>{`${formatTime(manager.start_time)} - ${formatTime(manager.end_time)}`}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => handleAddManagerToAssign(manager)}
                            >
                              +
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Grid2>

              {/* Partly Available Managers */}
              <Grid2 xs={4}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Partly Available Managers
                </Typography>
                <Box className="user-box" sx={{overflowY: "auto"}}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Available Time</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {partlyAvailableManagers.map((manager) => (
                        <TableRow key={manager.id}>
                          <TableCell>{manager.username}</TableCell>
                          <TableCell>{`${formatTime(manager.start_time)} - ${formatTime(manager.end_time)}`}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => handleAddManagerToAssign(manager)}
                            >
                              +
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Grid2>

              {/* Unavailable Managers */}
              <Grid2 xs={4}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Unavailable Managers
                </Typography>
                <Box className="user-box" sx={{overflowY: "auto"}}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unavailableManagers.map((manager) => (
                        <TableRow key={manager.id}>
                          <TableCell>{manager.username}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => handleAddManagerToAssign(manager)}
                            >
                              +
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Grid2>
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2} xs={12}>
            {/* Managers To Be Assigned */}
            <Grid2 xs={6}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Managers To Be Assigned
              </Typography>
              <Box className="user-box" sx={{overflowY: "auto"}}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Available Time</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {managersToBeAssigned.map((manager) => (
                      <TableRow key={manager.id}>
                        <TableCell>{manager.username}</TableCell>
                        <TableCell>
                          {manager.start_time && manager.end_time
                            ? `${formatTime(manager.start_time)} - ${formatTime(manager.end_time)}`
                            : "Unavailable"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleRemoveManagerFromToBeAssigned(manager)}
                          >
                            -
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Grid2>

            {/* Assigned Managers */}
            <Grid2 xs={6}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Assigned Managers
              </Typography>
              <Box className="user-box" sx={{overflowY: "auto"}}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Available Time</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignedManagers.map((manager) => (
                      <TableRow key={manager.id}>
                        <TableCell>{manager.username}</TableCell>
                        <TableCell>
                          {manager.start_time && manager.end_time
                            ? `${formatTime(manager.start_time)} - ${formatTime(manager.end_time)}`
                            : "Unavailable"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleRemoveManagerFromAssigned(manager)}
                          >
                            -
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {managersToBeUnassigned.map((manager) => (
                      <TableRow key={manager.id} className="to-be-unassigned" style={{ backgroundColor: "#e0e0e0" }}>
                        {" "}
                        {/* Gray Background */}
                        <TableCell>{manager.username}</TableCell>
                        <TableCell>
                          {manager.start_time && manager.end_time
                            ? `${formatTime(manager.start_time)} - ${formatTime(manager.end_time)}`
                            : "Unavailable"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="contained"
                            color="warning" // Different color for undo
                            onClick={() => handleUndoManagerUnassign(manager)}
                          >
                            &#8592; {/* Left Arrow */}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Grid2>
          </Grid2>

          {/* Action Buttons */}
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button variant="contained" color="primary" onClick={handleConfirmAssignments}>
              Confirm
            </Button>

            <Button variant="outlined" color="error" onClick={handleRemoveShift}>
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
        open={openModal && modalType === "createShift"}
        onClose={handleCloseModal}
        aria-labelledby="shift-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 550, // Increased width
            bgcolor: "background.paper",
            border: "2px solid #000",
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
            <strong>Date:</strong> {selectedDate ? selectedDate : "N/A"}
          </Typography>
          {/* Display Weekday */}
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Weekday:</strong>{" "}
            {formData.week_day ? formData.week_day.charAt(0).toUpperCase() + formData.week_day.slice(1) : "N/A"}
          </Typography>
          {/* Display Open and Close Times */}
          <Typography variant="body1" sx={{ mb: 3 }}>
            <strong>Open Time:</strong> {formData.open_at ? formData.open_at : "N/A"} |<strong> Close Time:</strong>{" "}
            {formData.close_at ? formData.close_at : "N/A"}
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
      <Modal open={openModal && modalType === "createWorkday"} onClose={handleCloseModal} aria-labelledby="modal-title">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
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
            <strong>Weekday:</strong>{" "}
            {formData.week_day ? formData.week_day.charAt(0).toUpperCase() + formData.week_day.slice(1) : "N/A"}
          </Typography>
          {/* Display open time */}
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Open Time:</strong> {formData.open_at ? formData.open_at : "N/A"}
          </Typography>
          {/* Display close time */}
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Close Time:</strong> {formData.close_at ? formData.close_at : "N/A"}
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
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            borderRadius: 4,
            p: 4,
          }}
        >
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
