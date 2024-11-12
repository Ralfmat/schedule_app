import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // for date click handling
import { useState, useEffect } from 'react';
import { fetchAvailability, fetchShifts, fetchAssignments } from '../utils/dataUtils';
import './Calendar.css'

export const Calendar = () => {
    const [availabilities, setAvailabilties] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
      const loadAvailability = async () => {
        const availability = await fetchAvailability();
        setAvailabilties(availability);
      };

      const loadAssignments = async () => {
        const assignments = await fetchAssignments()
        setAssignments(assignments);
      };
    
      loadAvailability();
      loadAssignments();
    }, []);
    
    // Whenever availabilities or assignments update, update the events array
    useEffect(() => {
      // Transform availabilities and assignments into calendar event format
      const availabilityEvents = availabilities.map((availability) => ({
          title: 'Availability',
          start: new Date(`${availability.workday.date}`), // Combine workday.date with start_time
          end: new Date(`${availability.workday.date}`), // Combine workday.date with end_time
          extendedProps: {
              type: 'availability',
              account: availability.account_id,
          },
      }));

      const assignmentEvents = assignments.map((assignment) => ({
          title: 'Shift Assignment',
          start: new Date(`${assignment.shift.workday.date}T${assignment.shift.start_time}`), // Combine shift.workday.date with start_time
          end: new Date(`${assignment.shift.workday.date}T${assignment.shift.end_time}`), // Combine shift.workday.date with end_time
          extendedProps: {
              type: 'assignment',
              account: assignment.account_id,
          },
      }));

      setEvents([...availabilityEvents, ...assignmentEvents]);
    }, [availabilities, assignments]);


    const handleDateClick = (info) => {
        // Trigger an action when a date is clicked
        console.log("Clicked date:", info.dateStr);
        // Here, you could open a modal to add availability for employees or create a shift for managers
    };

    return (
      <div className='calendar-group'>
        <div className='calendar-buttons'>
          <h1>PLUS SIGN +++</h1>
        </div>
        <div className='calendar-window'>
        <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                customButtons={{
                    addAvailability: {
                        text: '+',
                        // click: handleOpenModal,
                    },
                }}
                headerToolbar={{
                    left: 'prev,next today', // Add custom button here
                    center: 'title',
                    right: 'addAvailability dayGridMonth,dayGridWeek',
                }}
                footerToolbar={{}}
                height={"80vh"}
                selectable={true}
            />
        </div>
      </div>
        
    );
};

export default Calendar;
