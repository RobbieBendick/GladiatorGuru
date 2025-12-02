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
    const timeZoneName = parts.find(
      part => part.type === 'timeZoneName'
    )?.value;

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

/**
 * Get the IANA timezone identifier (e.g., "America/New_York", "America/Los_Angeles")
 * @returns The IANA timezone identifier string
 */
export const getIANATimezone = (): string => {
  try {
    // Use Intl to get the timezone
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    // Fallback: try to determine from offset
    const offset = -new Date().getTimezoneOffset() / 60;
    // This is a simplified mapping - not perfect but better than nothing
    const offsetToTimezone: Record<number, string> = {
      '-12': 'Etc/GMT+12',
      '-11': 'Pacific/Midway',
      '-10': 'Pacific/Honolulu',
      '-9': 'America/Anchorage',
      '-8': 'America/Los_Angeles',
      '-5': 'America/New_York',
      '-7': 'America/Denver',
      '-6': 'America/Chicago',
      '-4': 'America/Halifax',
      '-3': 'America/Sao_Paulo',
      '-2': 'Atlantic/South_Georgia',
      '-1': 'Atlantic/Azores',
      '0': 'Europe/London',
      '1': 'Europe/Paris',
      '2': 'Europe/Athens',
      '3': 'Europe/Moscow',
      '4': 'Asia/Dubai',
      '5': 'Asia/Karachi',
      '6': 'Asia/Dhaka',
      '7': 'Asia/Bangkok',
      '8': 'Asia/Shanghai',
      '9': 'Asia/Tokyo',
      '10': 'Australia/Sydney',
      '11': 'Pacific/Norfolk',
      '12': 'Pacific/Auckland',
    };
    return offsetToTimezone[offset] || 'UTC';
  }
};

/**
 * Map timezone abbreviation to IANA timezone identifier
 * @param abbreviation - Timezone abbreviation (e.g., "PST", "EST", "CST")
 * @returns IANA timezone identifier or null if not found
 */
export const abbreviationToIANA = (abbreviation: string): string | null => {
  const mapping: Record<string, string> = {
    PST: 'America/Los_Angeles',
    PDT: 'America/Los_Angeles',
    EST: 'America/New_York',
    EDT: 'America/New_York',
    CST: 'America/Chicago',
    CDT: 'America/Chicago',
    MST: 'America/Denver',
    MDT: 'America/Denver',
    AKST: 'America/Anchorage',
    AKDT: 'America/Anchorage',
    HST: 'Pacific/Honolulu',
    GMT: 'Europe/London',
    UTC: 'UTC',
  };

  return mapping[abbreviation.toUpperCase()] || null;
};

/**
 * Convert a time string (HH:mm) from one timezone to another for a specific date
 * @param timeStr - Time string in HH:mm format
 * @param fromTimezone - IANA timezone identifier to convert from
 * @param toTimezone - IANA timezone identifier to convert to
 * @param date - Date to use for the conversion (defaults to today)
 * @returns Time string in HH:mm format in the target timezone
 */
export const convertTimeBetweenTimezones = (
  timeStr: string,
  fromTimezone: string,
  toTimezone: string,
  date: Date = new Date()
): string => {
  try {
    if (fromTimezone === toTimezone) {
      return timeStr;
    }

    const [hours, minutes] = timeStr.split(':').map(Number);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Create a date string that we'll interpret in the source timezone
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(
      minutes
    ).padStart(2, '0')}:00`;

    // Create formatters to get the UTC time for this time in the source timezone
    const sourceFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: fromTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Create a temporary date to get the UTC representation
    // We'll create a date in local time, then use the formatter to see what it would be in source timezone
    const tempDate = new Date(dateStr);

    // Get what this date/time represents in UTC when interpreted in source timezone
    // We need to create a date that, when formatted in source timezone, gives us our desired time
    // This is tricky - we'll use a different approach

    // Create date components for the source timezone
    const sourceDateParts = {
      year,
      month: month + 1,
      day,
      hour: hours,
      minute: minutes,
    };

    // Create a date string in ISO format
    const isoStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(
      minutes
    ).padStart(2, '0')}:00`;

    // Now we need to figure out what UTC time this represents in the source timezone
    // We'll use a workaround: create the date and adjust based on timezone offsets
    const testDate = new Date(isoStr);

    // Get the offset difference between source and target timezones
    const sourceOffset = getTimezoneOffsetMinutes(fromTimezone, testDate);
    const targetOffset = getTimezoneOffsetMinutes(toTimezone, testDate);
    const offsetDiff = (targetOffset - sourceOffset) * 60000;

    // Apply the offset difference
    const convertedDate = new Date(testDate.getTime() + offsetDiff);

    // Format in target timezone
    const targetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: toTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return targetFormatter.format(convertedDate);
  } catch (error) {
    console.error('Error converting timezone:', error);
    return timeStr; // Return original if conversion fails
  }
};

/**
 * Get timezone offset in minutes for a given timezone and date
 */
function getTimezoneOffsetMinutes(timezone: string, date: Date): number {
  try {
    // Create a formatter for UTC
    const utcFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    // Create a formatter for the target timezone
    const tzFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    // Format the same date in both timezones
    const utcParts = utcFormatter.formatToParts(date);
    const tzParts = tzFormatter.formatToParts(date);

    // Calculate the difference
    const utcTime = new Date(
      parseInt(utcParts.find(p => p.type === 'year')?.value || '0'),
      parseInt(utcParts.find(p => p.type === 'month')?.value || '0') - 1,
      parseInt(utcParts.find(p => p.type === 'day')?.value || '0'),
      parseInt(utcParts.find(p => p.type === 'hour')?.value || '0'),
      parseInt(utcParts.find(p => p.type === 'minute')?.value || '0')
    ).getTime();

    const tzTime = new Date(
      parseInt(tzParts.find(p => p.type === 'year')?.value || '0'),
      parseInt(tzParts.find(p => p.type === 'month')?.value || '0') - 1,
      parseInt(tzParts.find(p => p.type === 'day')?.value || '0'),
      parseInt(tzParts.find(p => p.type === 'hour')?.value || '0'),
      parseInt(tzParts.find(p => p.type === 'minute')?.value || '0')
    ).getTime();

    return (tzTime - utcTime) / 60000;
  } catch (error) {
    return 0;
  }
}
