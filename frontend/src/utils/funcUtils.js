export const isWithinShiftHours = (availStart, availEnd, shiftStart, shiftEnd) => {
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  return toMinutes(availStart) <= toMinutes(shiftStart) && toMinutes(availEnd) >= toMinutes(shiftEnd);
};

export const isPartlyWithinShiftHours = (availStart, availEnd, shiftStart, shiftEnd) => {
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  return (
    (toMinutes(availStart) < toMinutes(shiftEnd) && toMinutes(availStart) > toMinutes(shiftStart)) ||
    (toMinutes(availEnd) < toMinutes(shiftEnd) && toMinutes(availEnd) > toMinutes(shiftStart))
  );
};

export const formatTime = (time) => {
  // Extract hours and minutes from '12:00:00'
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
};

export const formatDate = (date) => {
  // Split the date into components: [year, month, day]
  const [year, month, day] = date.split("-");

  const getOrdinal = (day) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const lastDigit = day % 10;
    const lastTwoDigits = day % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return `${day}th`;
    }
    return `${day}${suffixes[lastDigit] || "th"}`;
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return `${getOrdinal(parseInt(day, 10))} ${months[parseInt(month, 10) - 1]} ${year}`;
};
