import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button, Typography, Modal, Box, Card, CardContent, Grid2 } from "@mui/material";
import { fetchAssignments, fetchAccounts } from "../utils/dataUtils";
import { formatDate, formatTime } from "../utils/funcUtils";
import "./ShiftAssignmentDashboard.css";

export const ShiftAssignmentDashboard = () => {
  const [myAssignments, setMyAssignments] = useState([]);
  const [shiftAssignments, setShiftAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const loadMyAssignments = async () => {
      const fetchedAssignments = await fetchAssignments(undefined, false, true);
      setMyAssignments(fetchedAssignments);
    };
    loadMyAssignments();
  }, []);

  useEffect(() => {
    const loadAccounts = async () => {
      if (!selectedAssignment) {
        setAccounts([]);
        return;
      }

      const shiftAssignments = await fetchAssignments(selectedAssignment.shift.id, true, true);
      const shiftAccounts = shiftAssignments.map((assignment) => assignment.account);
      setAccounts(shiftAccounts);
    };
    loadAccounts();
  }, [selectedAssignment, shiftAssignments]);

  const handleEventClick = (info) => {
    const clickedAssignment = myAssignments.find((assignment) => `${assignment.id}` === `${info.event.id}`);

    if (clickedAssignment) {
      setSelectedAssignment(clickedAssignment);
      setOpenModal(true);
    } else {
      console.error("Assignment not found for ID:", info.event.id);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAssignment(null);
  };

  const createAssignmentEvents = (assignments) => {
    return assignments.map((assignment) => ({
      id: assignment.id,
      title: `${formatTime(assignment.shift.start_time)} - ${formatTime(assignment.shift.end_time)}`,
      start: `${assignment.shift.workday.date}T${assignment.shift.start_time}`,
      end: `${assignment.shift.workday.date}T${assignment.shift.end_time}`,
      className: "custom-assignment-event",
    }));
  };

  const assignmentEvents = createAssignmentEvents(myAssignments);

  return (
    <div className="employee-dashboard-window">
      <div className="main-container">
        <div className="assign-containers">
          <div className="left-container">
            <div className="employee-dashboard-calendar">
              <FullCalendar
                key={assignmentEvents.length}
                firstDay={1}
                weekends={true}
                aspectRatio={0.9}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                selectable={true}
                events={assignmentEvents}
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
            <Card
              sx={{
                boxShadow: 5,
                borderRadius: 5,
                padding: 3,
                bgcolor: "#e0e0ff",
                width: "100%",
                margin: "auto",
                marginBottom: "20px",
              }}
            >
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  {selectedAssignment ? (
                    <>Shift on the {formatDate(selectedAssignment.shift.workday.date)}</>
                  ) : (
                    <>Select an assignment</>
                  )}
                </Typography>
                {selectedAssignment ? (
                  <>
                    <Typography variant="body1" sx={{ fontSize: "20px", color: "green", ml: 1 }}>
                      {`${formatTime(selectedAssignment.shift.start_time)} - ${formatTime(
                        selectedAssignment.shift.end_time
                      )}`}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 3 }}>
                      {accounts && accounts.filter((account) => account.role === "MANAGER").length > 1
                        ? "Managers"
                        : "Manager"}
                      :
                    </Typography>
                    {accounts && accounts.length > 0 ? (
                      <>
                        {accounts.filter((account) => account.role === "MANAGER").length > 0 ? (
                          <Box sx={{ mt: 1, display: "flex", flexDirection: "column" }}>
                            {accounts
                              .filter((account) => account.role === "MANAGER")
                              .map((manager) => (
                                <Typography variant="body1" key={manager.id} sx={{ textAlign: "start", mb: 1, ml: 2 }}>
                                  {manager.first_name} {manager.last_name}
                                </Typography>
                              ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No Managers Assigned
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        No Accounts Available
                      </Typography>
                    )}

                    <Typography variant="h6" sx={{ mt: 3 }}>
                      {accounts && accounts.filter((account) => account.role === "EMPLOYEE").length > 1
                        ? "Employees"
                        : "Employee"}
                      :
                    </Typography>
                    {accounts && accounts.length > 0 ? (
                      <>
                        {accounts.filter((account) => account.role === "EMPLOYEE").length > 0 ? (
                          <Box sx={{ mt: 1, display: "flex", flexDirection: "column" }}>
                            {accounts
                              .filter((account) => account.role === "EMPLOYEE")
                              .map((employee) => (
                                <Typography variant="body1" key={employee.id} sx={{ textAlign: "start", mb: 1, ml: 2 }}>
                                  {employee.first_name} {employee.last_name}
                                </Typography>
                              ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No Employees Assigned
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        No Accounts Available
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Select an assignment to view details.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftAssignmentDashboard;
