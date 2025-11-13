import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  alpha,
  styled,
  useTheme,
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from '@fullcalendar/core';
import { ArrowBack } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { API_BASE_URL } from '../../config/api';

const CalendarPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor:
    theme.palette.mode === 'light'
      ? alpha(theme.palette.background.default, 0.8)
      : alpha(theme.palette.background.default, 0.5),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const CalendarTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  background: theme.palette.text.primary,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    characterName?: string;
    characterRealm?: string;
    version?: string;
    bracket?: string;
    hours?: string;
    discordUsername?: string;
    status?: string;
  };
}

interface Job {
  _id: string;
  characterName: string;
  characterRealm: string;
  version: string;
  bracket: string;
  hours: string;
  availabilityDateTime: string;
  discordUsername: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export function Calendar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      const jobs: Job[] = data.data || data || [];

      // Convert jobs to calendar events
      const calendarEvents: CalendarEvent[] = jobs
        .filter(job => job.status === 'approved' || !job.status) // Show approved or pending as approved for now
        .map(job => {
          const startDate = new Date(job.availabilityDateTime);
          const hours = parseInt(job.hours, 10) || 1;
          const endDate = new Date(startDate);
          endDate.setHours(endDate.getHours() + hours);

          return {
            id: job._id,
            title: `${job.characterName} - ${job.bracket}`,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            backgroundColor:
              job.status === 'approved'
                ? theme.palette.primary.main
                : alpha(theme.palette.warning.main, 0.7),
            borderColor:
              job.status === 'approved'
                ? theme.palette.primary.dark
                : theme.palette.warning.main,
            extendedProps: {
              characterName: job.characterName,
              characterRealm: job.characterRealm,
              version: job.version,
              bracket: job.bracket,
              hours: job.hours,
              discordUsername: job.discordUsername,
              status: job.status || 'pending',
            },
          };
        });

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    // Navigate to booking form with pre-filled date/time
    // Use local date to avoid timezone issues
    const selectedDate = new Date(selectInfo.start);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    // Default to 12 PM (noon) instead of 12 AM (midnight)
    const hours = '12';
    const minutes = '00';
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
    navigate(`${ROUTE_PATHS.booking}?date=${formattedDate}`);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const extendedProps = event.extendedProps as CalendarEvent['extendedProps'];

    // Show event details (you can customize this)
    alert(
      `Event: ${event.title}\n` +
        `Character: ${extendedProps?.characterName}\n` +
        `Realm: ${extendedProps?.characterRealm}\n` +
        `Bracket: ${extendedProps?.bracket}\n` +
        `Hours: ${extendedProps?.hours}\n` +
        `Discord: ${extendedProps?.discordUsername}`
    );
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    return (
      <Box
        sx={{
          padding: '2px 4px',
          fontSize: '0.85rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <strong>{eventInfo.timeText}</strong>
        <br />
        {eventInfo.event.title}
      </Box>
    );
  };

  return (
    <Container maxWidth='lg'>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(ROUTE_PATHS.home)}
          sx={{ mb: 2 }}
        >
          Back to Home
        </Button>
      </Box>

      <CalendarPaper elevation={3}>
        <CalendarTitle variant='h2' gutterBottom>
          Schedule
        </CalendarTitle>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
          View approved coaching sessions on the calendar. Click on a date to
          request to book a new session.
        </Typography>

        <Box
          sx={{
            '& .fc': {
              fontFamily: theme.typography.fontFamily,
            },
            '& .fc-header-toolbar': {
              marginBottom: theme.spacing(3),
            },
            '& .fc-button': {
              backgroundColor: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                borderColor: theme.palette.primary.dark,
              },
              '&:focus': {
                boxShadow: `0 0 0 3px ${alpha(
                  theme.palette.primary.main,
                  0.3
                )}`,
              },
            },
            '& .fc-button-active': {
              backgroundColor: theme.palette.primary.dark,
              borderColor: theme.palette.primary.dark,
            },
            '& .fc-daygrid-day': {
              backgroundColor:
                theme.palette.mode === 'light'
                  ? theme.palette.background.paper
                  : alpha(theme.palette.background.paper, 0.5),
            },
            '& .fc-day-today': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
            '& .fc-col-header-cell': {
              backgroundColor:
                theme.palette.mode === 'light'
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.primary.main, 0.2),
              color: theme.palette.text.primary,
              fontWeight: 600,
            },
            '& .fc-event': {
              cursor: 'pointer',
              border: 'none',
              borderRadius: theme.shape.borderRadius,
            },
            '& .fc-event-title': {
              fontWeight: 500,
            },
            '& .fc-daygrid-event': {
              borderRadius: theme.shape.borderRadius,
            },
            '& .fc-timegrid-event': {
              borderRadius: theme.shape.borderRadius,
            },
          }}
        >
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView='dayGridMonth'
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            editable={false}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            events={events}
            eventContent={renderEventContent}
            height='auto'
            slotMinTime='00:00:00'
            slotMaxTime='24:00:00'
            allDaySlot={false}
          />
        </Box>
      </CalendarPaper>
    </Container>
  );
}
