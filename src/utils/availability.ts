import { AvailabilitySlot } from '../contexts/UserContext';
import {
  getTimezoneAbbreviation,
  abbreviationToIANA,
  getIANATimezone,
  convertTimeBetweenTimezones,
} from './timezone';

/**
 * Checks if a given date/time range is within the coach's availability
 * @param startDate - Start date/time of the booking
 * @param endDate - End date/time of the booking
 * @param availability - Array of availability slots
 * @returns true if the time range is within availability, false otherwise
 */
export function isTimeWithinAvailability(
  startDate: Date,
  endDate: Date,
  availability: AvailabilitySlot[] | undefined
): boolean {
  // If no availability is set, allow all times
  if (!availability || availability.length === 0) {
    return true;
  }

  // Get the day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = startDate.getDay();

  // Find availability slots for this day of week
  const daySlots = availability.filter(slot => slot.dayOfWeek === dayOfWeek);

  // If no slots for this day, the time is not available
  if (daySlots.length === 0) {
    return false;
  }

  // Get the time components (hours and minutes)
  const startHours = startDate.getHours();
  const startMinutes = startDate.getMinutes();
  const endHours = endDate.getHours();
  const endMinutes = endDate.getMinutes();

  // Convert to total minutes for easier comparison
  const bookingStartMinutes = startHours * 60 + startMinutes;
  const bookingEndMinutes = endHours * 60 + endMinutes;

  // Check if the booking time range fits within any availability slot
  for (const slot of daySlots) {
    const [slotStartHours, slotStartMins] = slot.startTime
      .split(':')
      .map(Number);
    const [slotEndHours, slotEndMins] = slot.endTime.split(':').map(Number);

    const slotStartTotalMinutes = slotStartHours * 60 + slotStartMins;
    const slotEndTotalMinutes = slotEndHours * 60 + slotEndMins;

    // Check if booking is completely within this slot
    if (
      bookingStartMinutes >= slotStartTotalMinutes &&
      bookingEndMinutes <= slotEndTotalMinutes
    ) {
      return true;
    }
  }

  // Booking doesn't fit within any availability slot
  return false;
}

/**
 * Gets a human-readable description of availability for a specific day
 * @param dayOfWeek - Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 * @param availability - Array of availability slots
 * @returns String describing availability for that day, or "Not available" if no slots
 */
export function getAvailabilityForDay(
  dayOfWeek: number,
  availability: AvailabilitySlot[] | undefined
): string {
  if (!availability || availability.length === 0) {
    return 'Available all day';
  }

  const daySlots = availability.filter(slot => slot.dayOfWeek === dayOfWeek);

  if (daySlots.length === 0) {
    return 'Not available';
  }

  return daySlots.map(slot => `${slot.startTime} - ${slot.endTime}`).join(', ');
}

/**
 * Converts 24-hour time string (HH:mm) to 12-hour format with AM/PM
 * @param time24 - Time string in 24-hour format (e.g., "09:00", "17:30")
 * @returns Time string in 12-hour format (e.g., "9:00 AM", "5:30 PM")
 */
function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Formats availability slots into a grouped structure by day of week
 * Converts times from coach's timezone to user's timezone for display
 * @param availability - Array of availability slots
 * @param coachTimezone - Coach's timezone abbreviation (e.g., "PST", "EST")
 * @returns Array of objects with day name and time slots (formatted in 12-hour format in user's timezone)
 */
export function formatAvailabilityByDay(
  availability: AvailabilitySlot[] | undefined,
  coachTimezone?: string
): Array<{ dayName: string; slots: string[] }> {
  if (!availability || availability.length === 0) {
    return [];
  }

  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // Get user's IANA timezone
  const userIANA = getIANATimezone();

  // Get coach's IANA timezone if available
  // coachTimezone can be either an IANA timezone string (e.g., "America/Los_Angeles")
  // or an abbreviation (e.g., "PST")
  let coachIANA = userIANA;
  if (coachTimezone) {
    // Check if it's already an IANA timezone (contains "/")
    if (coachTimezone.includes('/')) {
      coachIANA = coachTimezone;
    } else {
      // Try to convert abbreviation to IANA
      const converted = abbreviationToIANA(coachTimezone);
      coachIANA = converted || userIANA;
    }
  }

  // Group slots by day of week
  const groupedByDay: { [key: number]: string[] } = {};

  availability.forEach(slot => {
    if (!groupedByDay[slot.dayOfWeek]) {
      groupedByDay[slot.dayOfWeek] = [];
    }

    // Convert times from coach's timezone to user's timezone
    let startTime = slot.startTime;
    let endTime = slot.endTime;

    if (coachIANA && coachIANA !== userIANA) {
      // Convert times to user's timezone
      const today = new Date();
      startTime = convertTimeBetweenTimezones(
        slot.startTime,
        coachIANA,
        userIANA,
        today
      );
      endTime = convertTimeBetweenTimezones(
        slot.endTime,
        coachIANA,
        userIANA,
        today
      );
    }

    const startTime12 = formatTime12Hour(startTime);
    const endTime12 = formatTime12Hour(endTime);
    groupedByDay[slot.dayOfWeek].push(`${startTime12} - ${endTime12}`);
  });

  // Convert to array and sort by day of week
  return Object.keys(groupedByDay)
    .map(dayOfWeek => Number(dayOfWeek))
    .sort((a, b) => a - b)
    .map(dayOfWeek => ({
      dayName: dayNames[dayOfWeek],
      slots: groupedByDay[dayOfWeek],
    }));
}

/**
 * Gets the current user's timezone abbreviation
 * @returns Timezone abbreviation (e.g., "PST", "EST", "CST")
 */
export function getCurrentTimezone(): string {
  return getTimezoneAbbreviation();
}
