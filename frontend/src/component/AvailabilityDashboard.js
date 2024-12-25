import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button, Typography, Modal, Box, TextField, Card, CardContent } from "@mui/material";
import {
  fetchWeekdays,
  fetchWorkdays,
  fetchAvailability,
  fetchCurrentAccount,
  postAvailability,
  deleteAvailability,
} from "../utils/dataUtils";
import { formatTime } from "../utils/funcUtils";
import "./AvailabilityDashboard.css";
import { Height } from "@mui/icons-material";

export const AvailabilityDashboard = () => {
  const [account, setAccount] = useState(null);
  const [workdays, setWorkdays] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [selectedWorkday, setSelectedWorkday] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [isAddAvailabilityDisabled, setIsAddAvailabilityDisabled] = useState(false);
  const [isRemoveAvailabilityDisabled, setIsRemoveAvailabilityDisabled] = useState(true);
  const [isCreateAvailabilityModalOpen, setIsCreateAvailabilityModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState({
    start_time: "",
    end_time: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const [weekdays, workdays, availability, account] = await Promise.all([
        fetchWeekdays(),
        fetchWorkdays(true),
        fetchAvailability(null, false, true),
        fetchCurrentAccount(),
      ]);
      setAccount(account);
      setWorkdays(workdays);
      setAvailability(availability);
    };

    loadData();
  }, []);

  const handleDateSelect = (selectionInfo) => {
    const { startStr } = selectionInfo;
    const workday = workdays.find((workday) => workday.date === startStr);

    if (workday) {
      setSelectedWorkday(workday);

      const hasAvailability = availability.some((avail) => avail.workday.id === workday.id);

      const selectedAvailabilities = availability.filter((avail) => avail.workday.id === workday.id);

      setSelectedAvailability(selectedAvailabilities.length > 0 ? selectedAvailabilities[0] : null);

      setIsAddAvailabilityDisabled(hasAvailability || !workday.is_enrolment_open);
      setIsRemoveAvailabilityDisabled(!hasAvailability);
    } else {
      setSelectedWorkday(null);
      setSelectedAvailability(null);
      setIsAddAvailabilityDisabled(true);
      setIsRemoveAvailabilityDisabled(true);
    }
  };

  const handleEventClick = (info) => {
    const workdayId = info.event.extendedProps.workday_id;
    const clickedWorkday = workdays.find((workday) => workday.id === workdayId);

    if (clickedWorkday) {
      setSelectedWorkday(clickedWorkday);

      const hasAvailability = availability.some((avail) => avail.workday.id === clickedWorkday.id);

      const selectedAvailabilities = availability.filter((avail) => avail.workday.id === clickedWorkday.id);

      setSelectedAvailability(selectedAvailabilities.length > 0 ? selectedAvailabilities[0] : null);

      setIsAddAvailabilityDisabled(hasAvailability || !clickedWorkday.is_enrolment_open);
      setIsRemoveAvailabilityDisabled(!hasAvailability);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setAvailabilityForm({
      ...availabilityForm,
      [name]: value,
    });
  };

  const handleCreateAvailability = async () => {
    if (!selectedWorkday) return;

    const { start_time, end_time } = availabilityForm;

    const data = {
      account_id: account.id,
      workday_id: selectedWorkday.id,
      start_time,
      end_time,
    };
    try {
      await postAvailability(data);
      setErrors(null);
    } catch (error) {
      setErrors(error.response.data.error_messages);
      return;
    }

    const updatedAvailability = await fetchAvailability(null, false, true);

    const newAvailability = updatedAvailability.find(
      (avail) => !availability.some((existing) => existing.id === avail.id)
    );

    setAvailability(updatedAvailability);
    setSelectedAvailability(newAvailability || null);

    setIsRemoveAvailabilityDisabled(false);
    setIsAddAvailabilityDisabled(true);
    setAvailabilityForm({ start_time: "", end_time: "" });
    setIsCreateAvailabilityModalOpen(false);
  };

  const handleRemoveAvailability = async () => {
    if (!selectedAvailability) return;

    try {
      await deleteAvailability(selectedAvailability.id);
      const updatedAvailability = await fetchAvailability(null, false, true);
      setAvailability(updatedAvailability);
      setSelectedAvailability(null);
      setIsRemoveAvailabilityDisabled(true);
      setIsAddAvailabilityDisabled(false);
      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenModal = (modalType) => {
    if (modalType === "createAvailability") {
      setIsCreateAvailabilityModalOpen(true);
    } else if (modalType === "confirmDelete") {
      setIsConfirmDeleteModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsCreateAvailabilityModalOpen(false);
    setIsConfirmDeleteModalOpen(false);
  };

  const createWorkdayEvents = (workdays) => {
    return workdays.map((workday) => ({
      id: workday.id,
      start: workday.date,
      end: workday.date,
      display: "background",
      className: `custom-workday-event ${selectedWorkday?.id === workday.id ? "selected-workday" : ""}`,
      color: workday.is_enrolment_open ? "#00ff00" : "#ff0000",
    }));
  };

  const createAvailabilityEvents = (availability) => {
    return availability.map((availability) => ({
      id: availability.id,
      title: "available",
      start: `${availability.workday.date}T${availability.start_time}`,
      end: `${availability.workday.date}T${availability.end_time}`,
      extendedProps: {
        workday_id: availability.workday.id,
        workday_date: availability.workday.date,
      },
      className: "custom-availability-event",
    }));
  };

  const workdayEvents = createWorkdayEvents(workdays);
  const availabilityEvents = createAvailabilityEvents(availability);

  return (
    <div className="employee-dashboard-window">
      <div className="main-container">
        <div className="containers">
          <div className="left-container">
            <div className="toolbar-buttons">
              <Button
                variant="contained"
                color="primary"
                disabled={isAddAvailabilityDisabled}
                onClick={() => handleOpenModal("createAvailability")}
                sx={{ marginRight: "1rem" }}
              >
                Add availability
              </Button>
              <Button
                variant="contained"
                color="secondary"
                disabled={isRemoveAvailabilityDisabled}
                onClick={() => handleOpenModal("confirmDelete")}
              >
                Remove availability
              </Button>
            </div>
            <div className="employee-dashboard-calendar">
              <FullCalendar
                key={workdayEvents.length + availabilityEvents.length}
                firstDay={1}
                weekends={true}
                aspectRatio={0.9}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                selectable={true}
                select={handleDateSelect}
                // headerToolbar={false}
                events={[...workdayEvents, ...availabilityEvents]}
                eventContent={(eventInfo) => (
                  <div>
                    <span>{eventInfo.event.title}</span>
                  </div>
                )}
                dayMaxEvents={true}
                eventClick={handleEventClick}
              />
            </div>
          </div>
          <div className="right-container">
            <div style={{ width: "30vw", height: "5rem" }}></div>
            <Card
              sx={{
                boxShadow: 5,
                borderRadius: 5,
                padding: 3,
                bgcolor: selectedWorkday?.is_enrolment_open ? "#e0ffe0" : "#ffe0e0",
                maxWidth: "400px",
                width: "100%",
                margin: "auto",
                marginBottom: "20px",
              }}
            >
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  Workday Info
                </Typography>
                {selectedWorkday ? (
                  <>
                    <Typography variant="body1" sx={{ fontSize: "18px" }}>
                      <strong>Date:</strong> {selectedWorkday.date}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: "18px" }}>
                      <strong>Day:</strong> {selectedWorkday.week_day.day_name}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: "18px" }}>
                      <strong>Open Hours:</strong>{" "}
                      {`${formatTime(selectedWorkday.week_day.open_at)} - ${formatTime(
                        selectedWorkday.week_day.close_at
                      )}`}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: "18px",
                        color: selectedWorkday.is_enrolment_open ? "green" : "red",
                      }}
                    >
                      <strong>Status:</strong>{" "}
                      {selectedWorkday.is_enrolment_open ? "Enrolment open" : "Enrolment closed"}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Select a workday to view details.
                  </Typography>
                )}
              </CardContent>
            </Card>
            {selectedAvailability && (
              <>
                <Card
                  sx={{
                    boxShadow: 5,
                    borderRadius: 5,
                    padding: 3,
                    bgcolor: "#e0e0ff",
                    maxWidth: "400px",
                    width: "100%",
                    margin: "auto",
                  }}
                >
                  <CardContent>
                    <Typography variant="h4" gutterBottom>
                      Availability Info
                    </Typography>
                    {selectedAvailability && (
                      <>
                        <Typography variant="body1" sx={{ fontSize: "18px" }}>
                          <strong>Start Time:</strong>
                          {` ${formatTime(selectedAvailability.start_time)}`}
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: "18px" }}>
                          <strong>End Time:</strong>
                          {` ${formatTime(selectedAvailability.end_time)}`}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Availability Modal */}
      <Modal open={isCreateAvailabilityModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            borderRadius: 4,
            p: 4,
            width: "40vw",
          }}
        >
          <Typography id="create-availability-title" variant="h6" component="h2">
            Create Availability
          </Typography>
          {selectedWorkday && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              <strong>Date:</strong> {selectedWorkday.date}
              <br />
              <strong>Day:</strong> {selectedWorkday.week_day.day_name}
              <br />
              <strong>Open Hours:</strong> {formatTime(selectedWorkday.week_day.open_at)} -{" "}
              {formatTime(selectedWorkday.week_day.close_at)}
            </Typography>
          )}
          {errors && Object.keys(errors).length > 0 && (
            <Box mt={2} sx={{ color: "error.main" }}>
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {Object.entries(errors).map(([field, message], index) => (
                  <li style={{ marginBottom: 4 }} key={index}>
                    {message}
                  </li>
                ))}
              </ul>
            </Box>
          )}
          <TextField
            label="Start Time"
            type="time"
            fullWidth
            margin="normal"
            name="start_time"
            value={availabilityForm.start_time}
            onChange={handleInputChange}
          />
          <TextField
            label="End Time"
            type="time"
            fullWidth
            margin="normal"
            name="end_time"
            value={availabilityForm.end_time}
            onChange={handleInputChange}
          />

          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button onClick={handleCreateAvailability} variant="contained" color="primary">
              Confirm
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                if (selectedWorkday && selectedWorkday.week_day) {
                  setAvailabilityForm({
                    start_time: selectedWorkday.week_day.open_at,
                    end_time: selectedWorkday.week_day.close_at,
                  });
                }
              }}
            >
              Set to Workday Times
            </Button>
            <Button onClick={handleCloseModal} variant="outlined" color="secondary">
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal open={isConfirmDeleteModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="confirm-delete-title" variant="h6">
            Confirm Deletion
          </Typography>
          <Typography sx={{ mt: 2 }}>Are you sure you want to remove this availability?</Typography>
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button variant="outlined" color="error" onClick={handleRemoveAvailability}>
              Yes, Remove
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default AvailabilityDashboard;
