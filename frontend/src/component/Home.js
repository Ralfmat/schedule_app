import React, { useState, useEffect } from "react";
import { Typography, CardContent, Grid, Paper } from "@mui/material";
import { fetchAssignments, fetchWeekdays } from "../utils/dataUtils";
import { formatTime } from "../utils/funcUtils";
import "./Home.css";

export const Home = () => {
  const [assignments, setAssignments] = useState([]);
  const [weekdays, setWeekdays] = useState([]);
  const [nextAssignment, setNextAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMyAssignments = async () => {
      try {
        const fetchedAssignments = await fetchAssignments(undefined, false, true);
        const today = new Date().toISOString().split("T")[0];
        const filteredAssignments = fetchedAssignments.filter((assignment) => assignment.shift.workday.date >= today);
        const nextAssignment = filteredAssignments.length > 0 ? filteredAssignments[0] : null;
        setAssignments(filteredAssignments);
        setNextAssignment(nextAssignment);
      } catch (error) {
        setError("Failed to fetch assignments.");
      } finally {
        setLoading(false);
      }
    };
    const loadWeekdays = async () => {
      try {
        const fetchedWeekdays = await fetchWeekdays();
        setWeekdays(fetchedWeekdays);
      } catch (error) {
        setError("Failed to fetch weekdays.");
      }
    };
    loadMyAssignments();
    loadWeekdays();
  }, []);

  const getWeekdayByDate = (date) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    return weekdays.find((weekday) => weekday.day_name.toLowerCase() === dayName);
  };

  const todayWeekday = getWeekdayByDate(new Date());
  const nextAssignmentWeekday = nextAssignment ? getWeekdayByDate(new Date(nextAssignment.shift.workday.date)) : null;

  const getShiftDayLabel = (shiftDate) => {
    const today = new Date();
    const shiftDay = new Date(shiftDate);
    const diffTime = shiftDay - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return "TODAY";
    } else if (diffDays === 1) {
      return "TOMORROW";
    } else {
      return null;
    }
  };

  return (
    <div className="home-container">
      <Typography variant="h4" className="home-title">
        Welcome to Your Schedule Hub!
      </Typography>
      <Typography variant="h6" className="home-subtitle">
        Plan, Track, and Thrive.
      </Typography>
      <Grid container spacing={3} justifyContent="center" sx={{ marginTop: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} className="home-paper">
            <CardContent
              sx={{
                boxShadow: 5,
                borderRadius: 5,
                padding: 3,
                bgcolor: "#e0ffe0",
                width: "100%",
                margin: "auto",
                marginBottom: "20px",
              }}
            >
              <Typography variant="h5">Today's Date</Typography>
              <Typography variant="body1">{new Date().toISOString().split("T")[0]}</Typography>
            </CardContent>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} className="home-paper">
            <CardContent
              sx={{
                boxShadow: 5,
                borderRadius: 5,
                padding: 3,
                bgcolor: "#ffe090",
                width: "100%",
                margin: "auto",
                marginBottom: "20px",
              }}
            >
              <Typography variant="h5">Today's Open Hours</Typography>
              {todayWeekday ? (
                <Typography variant="body1">
                  {todayWeekday.day_name}: {formatTime(todayWeekday.open_at)} - {formatTime(todayWeekday.close_at)}
                </Typography>
              ) : (
                <Typography variant="body1">No data available</Typography>
              )}
            </CardContent>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} className="home-paper">
            <CardContent
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
              <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <Typography variant="h6">Your Next Shift</Typography>
                {nextAssignment ? (
                  <>
                    <Typography variant="body1" sx={{ color: "red" }}>
                      {getShiftDayLabel(nextAssignment.shift.workday.date)}
                    </Typography>
                  </>
                ) : (
                  <></>
                )}
              </div>

              {nextAssignment ? (
                <>
                  <Typography variant="body1">{nextAssignment.shift.workday.date}</Typography>
                  <Typography variant="body1">
                    {formatTime(nextAssignment.shift.start_time)} - {formatTime(nextAssignment.shift.end_time)}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1">No shifts scheduled.</Typography>
              )}
            </CardContent>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} className="home-paper">
            <CardContent
              sx={{
                boxShadow: 5,
                borderRadius: 5,
                padding: 3,
                bgcolor: "#E4C1F7",
                width: "100%",
                margin: "auto",
                marginBottom: "20px",
              }}
            >
              <Typography variant="h5">Next Shift's Workday Open Hours</Typography>
              {nextAssignmentWeekday ? (
                <Typography variant="body1">
                  {nextAssignmentWeekday.day_name}: {formatTime(nextAssignmentWeekday.open_at)} -{" "}
                  {formatTime(nextAssignmentWeekday.close_at)}
                </Typography>
              ) : (
                <Typography variant="body1">No data available</Typography>
              )}
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Home;
