/**
 * Get the timezone abbreviation (PST, EST, CST, etc.) for the current user's timezone
 * @param date - Optional date to get timezone for (defaults to current date)
 * @returns The timezone abbreviation string (e.g., "PST", "EST", "CST")
 */
export const getTimezoneAbbreviation = (date: Date = new Date()): string => {
  try {
    // Try to get timezone abbreviation using Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
    });
    
    const parts = formatter.formatToParts(date);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value;

    // If we got a timezone name, return it (e.g., "PST", "EST", "CST", "PDT", "EDT")
    if (timeZoneName && timeZoneName.length <= 5) {
      return timeZoneName;
    }

    // Fallback: get timezone offset and convert to abbreviation
    const offset = -date.getTimezoneOffset() / 60;
    const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
    
    // Common US timezone abbreviations based on offset (standard time)
    // Note: This is a simplified mapping and doesn't account for DST
    const timezoneMap: Record<string, string> = {
      '-12': 'IDLW',
      '-11': 'HST',
      '-10': 'HST',
      '-9': 'AKST',
      '-8': 'PST',
      '-7': 'MST',
      '-6': 'CST',
      '-5': 'EST',
      '-4': 'AST',
      '-3': 'ADT',
      '-2': 'AT',
      '-1': 'WAT',
      '0': 'GMT',
      '1': 'CET',
      '2': 'EET',
      '3': 'MSK',
      '4': 'GST',
      '5': 'PKT',
      '6': 'BST',
      '7': 'ICT',
      '8': 'CST',
      '9': 'JST',
      '10': 'AEST',
      '11': 'AEDT',
      '12': 'NZST',
    };

    return timezoneMap[offsetStr] || `UTC${offsetStr}`;
  } catch (error) {
    // Final fallback: return UTC offset
    const offset = -date.getTimezoneOffset() / 60;
    const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
    return `UTC${offsetStr}`;
  }
};

/**
 * Format a date with timezone abbreviation
 * @param date - The date to format
 * @param options - Formatting options
 * @returns Formatted time string with timezone abbreviation
 */
export const formatTimeWithTimezone = (
  date: Date,
  options?: {
    hour?: 'numeric' | '2-digit';
    minute?: '2-digit';
    hour12?: boolean;
  }
): string => {
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: options?.hour || 'numeric',
    minute: options?.minute || '2-digit',
    hour12: options?.hour12 !== undefined ? options.hour12 : true,
  });
  const timezone = getTimezoneAbbreviation();
  return `${timeStr} ${timezone}`;
};

/**
 * Format a date range with timezone abbreviation
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string with timezone abbreviation
 */
export const formatDateRangeWithTimezone = (
  startDate: Date,
  endDate: Date
): string => {
  const isSameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate();

  const timezone = getTimezoneAbbreviation();

  if (isSameDay) {
    const dateStr = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const startTime = startDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const endTime = endDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr} ${startTime} - ${endTime} ${timezone}`;
  } else {
    const startStr = startDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const endStr = endDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${startStr} ${timezone} - ${endStr} ${timezone}`;
  }
};

