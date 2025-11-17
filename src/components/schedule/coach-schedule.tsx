import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  alpha,
  styled,
  useTheme,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  EventClickArg,
  EventContentArg,
  DateSelectArg,
  EventDropArg,
} from '@fullcalendar/core';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { API_BASE_URL } from '../../config/api';
import { isAdmin, getAuthToken } from '../../config/auth';

const SchedulePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor:
    theme.palette.mode === 'light'
      ? alpha(theme.palette.background.default, 0.8)
      : alpha(theme.palette.background.default, 0.5),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const ScheduleTitle = styled(Typography)(({ theme }) => ({
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
  availabilityStartDateTime: string;
  availabilityEndDateTime: string;
  discordUsername: string;
  status?:
    | 'pending'
    | 'accepted'
    | 'approved'
    | 'rejected'
    | 'completed'
    | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
  coachId?: string;
  coachIds?: string[];
  coachName?: string;
}

interface CoachInfo {
  _id: string;
  username: string;
  name?: string;
  role: string;
}

export function CoachSchedule() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [coachInfo, setCoachInfo] = useState<CoachInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity?: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'error' });
  // Initialize currentView from localStorage or default to 'dayGridMonth'
  const [currentView, setCurrentView] = useState<string>(() => {
    const cachedView = localStorage.getItem('coachScheduleView');
    return cachedView || 'dayGridMonth';
  });
  // Track abort controllers per event
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  // Track the latest event positions to prevent stale updates
  const latestEventPositionsRef = useRef<
    Map<string, { start: string; end: string }>
  >(new Map());
  // Track pending update IDs per event to prevent stale updates
  const pendingUpdateIdsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    fetchCoachSchedule();
  }, [id]);

  // Cache currentView to localStorage whenever it changes
  useEffect(() => {
    if (currentView) {
      localStorage.setItem('coachScheduleView', currentView);
    }
  }, [currentView]);

  const fetchCoachSchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        setError('Coach ID is required');
        setLoading(false);
        return;
      }

      // Fetch coach info by ID
      try {
        const token = getAuthToken();
        const coachResponse = await fetch(
          `${API_BASE_URL}/api/admin/users/${id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (coachResponse.ok) {
          const coachData = await coachResponse.json();
          const coach = Array.isArray(coachData.data)
            ? coachData.data[0]
            : coachData.data;
          if (coach) {
            console.log('Coach data received:', coach);
            setCoachInfo(coach);
            // Fetch jobs assigned to this coach
            await fetchCoachJobs(coach._id || id);
            return;
          }
        } else {
          console.error(
            'Failed to fetch coach info:',
            coachResponse.status,
            coachResponse.statusText
          );
          const errorData = await coachResponse.json().catch(() => ({}));
          console.error('Error data:', errorData);
        }
      } catch (err) {
        console.error('Error fetching coach info:', err);
      }

      // If we couldn't find the coach, try fetching jobs directly
      await fetchCoachJobs(id);
    } catch (err: any) {
      console.error('Error fetching coach schedule:', err);
      setError(err.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoachJobs = async (coachIdentifier: string) => {
    try {
      // Try different API endpoints
      const endpoints = [
        `${API_BASE_URL}/api/jobs?coachId=${coachIdentifier}`,
        `${API_BASE_URL}/api/jobs?coach=${coachIdentifier}`,
        `${API_BASE_URL}/api/admin/jobs?coachId=${coachIdentifier}`,
        `${API_BASE_URL}/api/admin/jobs?coach=${coachIdentifier}`,
        // Keep backward compatibility with boosterId
        `${API_BASE_URL}/api/jobs?boosterId=${coachIdentifier}`,
        `${API_BASE_URL}/api/jobs?booster=${coachIdentifier}`,
        `${API_BASE_URL}/api/admin/jobs?boosterId=${coachIdentifier}`,
        `${API_BASE_URL}/api/admin/jobs?booster=${coachIdentifier}`,
      ];

      let jobs: Job[] = [];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            const fetchedJobs: Job[] = data.data || data || [];
            // Filter to ensure coach is in coachIds array (handle both string and object IDs)
            jobs = fetchedJobs.filter((job: Job) => {
              // Check if coach is in coachIds array
              if (job.coachIds && job.coachIds.length > 0) {
                const isInCoachIds = job.coachIds.some((id: any) => {
                  const idStr = typeof id === 'string' ? id : id.toString();
                  return idStr === coachIdentifier;
                });
                if (isInCoachIds) return true;
              }
              // Backward compatibility checks
              return (
                job.coachId === coachIdentifier ||
                (job as any).boosterId === coachIdentifier
              );
            });
            if (jobs.length > 0) break;
          }
        } catch (err) {
          // Continue to next endpoint
          continue;
        }
      }

      // If no jobs found with coach filter, fetch all jobs and filter client-side
      if (jobs.length === 0) {
        const allJobsResponse = await fetch(`${API_BASE_URL}/api/jobs`, {
          credentials: 'include',
        });

        if (allJobsResponse.ok) {
          const allJobsData = await allJobsResponse.json();
          const allJobs: Job[] = allJobsData.data || allJobsData || [];
          // Filter jobs by coachIds array, coachId, or boosterId (for backward compatibility)
          // Handle both string IDs and ObjectId objects
          jobs = allJobs.filter((job: Job) => {
            // Check if coach is in coachIds array (handle both string and object IDs)
            if (job.coachIds && job.coachIds.length > 0) {
              const isInCoachIds = job.coachIds.some((id: any) => {
                const idStr = typeof id === 'string' ? id : id.toString();
                return idStr === coachIdentifier;
              });
              if (isInCoachIds) return true;
            }
            // Backward compatibility checks
            return (
              job.coachId === coachIdentifier ||
              (job as any).boosterId === coachIdentifier
            );
          });
        }
      }

      // Convert jobs to calendar events
      // Only show jobs with status: accepted
      const calendarEvents: CalendarEvent[] = jobs
        .filter(job => job.status === 'accepted')
        .map(job => {
          const startDate = new Date(job.availabilityStartDateTime);
          const endDate = new Date(job.availabilityEndDateTime);

          return {
            id: job._id,
            title: `${job.characterName} - ${job.bracket}`,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            backgroundColor:
              job.status === 'accepted' || job.status === 'approved'
                ? alpha(theme.palette.primary.main, 0.7)
                : job.status === 'completed'
                ? alpha(
                    theme.palette.success?.main || theme.palette.primary.main,
                    0.7
                  )
                : alpha(theme.palette.warning.main, 0.7),
            borderColor:
              job.status === 'accepted' || job.status === 'approved'
                ? theme.palette.primary.dark
                : job.status === 'completed'
                ? theme.palette.success?.dark || theme.palette.primary.dark
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
    } catch (err: any) {
      console.error('Error fetching coach jobs:', err);
      setError(err.message || 'Failed to load jobs');
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    // Use startStr and endStr to get timezone-aware times
    // These are in ISO format with timezone, so parse them to get the correct local time
    const start = selectInfo.startStr
      ? new Date(selectInfo.startStr)
      : selectInfo.start;

    // Use endStr to get the correct timezone-aware end time
    // endStr is in ISO format with timezone, so parse it to get the correct local time
    const end = selectInfo.endStr
      ? new Date(selectInfo.endStr)
      : selectInfo.end;

    // Calculate duration in hours
    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    // Show warning if duration exceeds 5 hours, but don't show dialog
    if (durationHours > 5) {
      setSnackbar({
        open: true,
        message:
          'Maximum selection time is 5 hours. Please select a shorter time range.',
        severity: 'error',
      });
      selectInfo.view.calendar.unselect();
      return;
    }

    // Use the timezone-aware times
    setSelectedTimeRange({ start, end });
    setShowTimeDialog(true);
    selectInfo.view.calendar.unselect();
  };

  const handleViewChange = (viewInfo: any) => {
    setCurrentView(viewInfo.view.type);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    // Navigate to job details page
    navigate(`/job/${event.id}`);
  };

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const event = dropInfo.event;
    const newStart = event.start;
    if (!newStart) {
      dropInfo.revert();
      return;
    }
    const newEnd =
      event.end || new Date(newStart.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours if no end

    const newStartISO = newStart.toISOString();
    const newEndISO = newEnd.toISOString();

    // Cancel any pending API call for this event
    const existingAbortController = abortControllersRef.current.get(event.id);
    if (existingAbortController) {
      existingAbortController.abort();
      abortControllersRef.current.delete(event.id);
    }

    // Generate a unique update ID for this move
    const updateId = Date.now();
    pendingUpdateIdsRef.current.set(event.id, updateId);

    // Store the latest position for this event
    latestEventPositionsRef.current.set(event.id, {
      start: newStartISO,
      end: newEndISO,
    });

    // Calculate hours from duration (rounded to 30-minute increments)
    const durationMs = newEnd.getTime() - newStart.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    const roundedMinutes = Math.round(durationMinutes / 30) * 30;
    const durationHours = roundedMinutes / 60;
    const hours = Math.max(0.5, Math.min(5, durationHours)).toFixed(1);

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllersRef.current.set(event.id, abortController);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/jobs/${event.id}/availability`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          signal: abortController.signal,
          body: JSON.stringify({
            availabilityStartDateTime: newStartISO,
            availabilityEndDateTime: newEndISO,
            hours: hours,
          }),
        }
      );

      // Check if request was aborted or if a newer update started
      if (abortController.signal.aborted) {
        return;
      }

      // Verify this update is still current
      const stillCurrentUpdateId = pendingUpdateIdsRef.current.get(event.id);
      if (stillCurrentUpdateId !== updateId) {
        // A newer update has started, ignore this response
        return;
      }

      if (!response.ok) {
        // Revert the event position on error
        dropInfo.revert();
        let errorMessage = 'Failed to update job availability';
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message || errorData.errorMessage || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        if (
          errorMessage &&
          errorMessage.trim() &&
          !abortController.signal.aborted
        ) {
          setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'error',
          });
        }
        abortControllersRef.current.delete(event.id);
        return;
      }

      // Verify this update is still current
      const finalUpdateId = pendingUpdateIdsRef.current.get(event.id);
      if (finalUpdateId !== updateId) {
        // A newer update has started, ignore this response
        abortControllersRef.current.delete(event.id);
        return;
      }

      // Verify this is still the latest position before showing success
      const currentLatestPosition = latestEventPositionsRef.current.get(
        event.id
      );
      if (
        currentLatestPosition &&
        currentLatestPosition.start === newStartISO &&
        currentLatestPosition.end === newEndISO &&
        !abortController.signal.aborted
      ) {
        // Don't update state - FullCalendar already has the event in the correct position
        // Only show success message
        setSnackbar({
          open: true,
          message: 'Job availability updated successfully',
          severity: 'success',
        });
      }
      abortControllersRef.current.delete(event.id);
    } catch (error: any) {
      // Don't show error if request was aborted
      if (error.name === 'AbortError' || abortController.signal.aborted) {
        abortControllersRef.current.delete(event.id);
        return;
      }
      // Revert the event position on error
      dropInfo.revert();
      console.error('Error updating job availability:', error);
      const errorMessage =
        error?.message || 'Failed to update job availability';
      if (errorMessage && errorMessage.trim()) {
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      }
      abortControllersRef.current.delete(event.id);
    }
  };

  const handleEventResize = async (resizeInfo: any) => {
    const event = resizeInfo.event;
    const newStart = event.start;
    if (!newStart) {
      resizeInfo.revert();
      return;
    }
    const newEnd =
      event.end || new Date(newStart.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours if no end

    const newStartISO = newStart.toISOString();
    const newEndISO = newEnd.toISOString();

    // Cancel any pending API call for this event
    const existingAbortController = abortControllersRef.current.get(event.id);
    if (existingAbortController) {
      existingAbortController.abort();
      abortControllersRef.current.delete(event.id);
    }

    // Generate a unique update ID for this resize
    const updateId = Date.now();
    pendingUpdateIdsRef.current.set(event.id, updateId);

    // Store the latest position for this event
    latestEventPositionsRef.current.set(event.id, {
      start: newStartISO,
      end: newEndISO,
    });

    // Calculate hours from duration (rounded to 30-minute increments)
    const durationMs = newEnd.getTime() - newStart.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    const roundedMinutes = Math.round(durationMinutes / 30) * 30;
    const durationHours = roundedMinutes / 60;
    const hours = Math.max(0.5, Math.min(5, durationHours)).toFixed(1);

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllersRef.current.set(event.id, abortController);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/jobs/${event.id}/availability`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          signal: abortController.signal,
          body: JSON.stringify({
            availabilityStartDateTime: newStartISO,
            availabilityEndDateTime: newEndISO,
            hours: hours,
          }),
        }
      );

      // Check if request was aborted or if a newer update started
      if (abortController.signal.aborted) {
        return;
      }

      // Verify this update is still current
      const stillCurrentUpdateId = pendingUpdateIdsRef.current.get(event.id);
      if (stillCurrentUpdateId !== updateId) {
        // A newer update has started, ignore this response
        return;
      }

      if (!response.ok) {
        // Revert the event size on error
        resizeInfo.revert();
        let errorMessage = 'Failed to update job availability';
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message || errorData.errorMessage || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        if (
          errorMessage &&
          errorMessage.trim() &&
          !abortController.signal.aborted
        ) {
          setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'error',
          });
        }
        abortControllersRef.current.delete(event.id);
        return;
      }

      // Verify this update is still current
      const finalUpdateId = pendingUpdateIdsRef.current.get(event.id);
      if (finalUpdateId !== updateId) {
        // A newer update has started, ignore this response
        abortControllersRef.current.delete(event.id);
        return;
      }

      // Verify this is still the latest position before showing success
      const currentLatestPosition = latestEventPositionsRef.current.get(
        event.id
      );
      if (
        currentLatestPosition &&
        currentLatestPosition.start === newStartISO &&
        currentLatestPosition.end === newEndISO &&
        !abortController.signal.aborted
      ) {
        // Don't update state - FullCalendar already has the event in the correct position
        // Only show success message
        setSnackbar({
          open: true,
          message: 'Job availability updated successfully',
          severity: 'success',
        });
      }
      abortControllersRef.current.delete(event.id);
    } catch (error: any) {
      // Don't show error if request was aborted
      if (error.name === 'AbortError' || abortController.signal.aborted) {
        abortControllersRef.current.delete(event.id);
        return;
      }
      // Revert the event size on error
      resizeInfo.revert();
      console.error('Error updating job availability:', error);
      const errorMessage =
        error?.message || 'Failed to update job availability';
      if (errorMessage && errorMessage.trim()) {
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      }
      abortControllersRef.current.delete(event.id);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateDuration = (start: Date, end: Date): string => {
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} minutes`;
    }
  };

  const handleCloseTimeDialog = () => {
    setShowTimeDialog(false);
    setSelectedTimeRange(null);
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const userIsAdmin = isAdmin();
    // Extract character name from title (format: "CharacterName - Bracket")
    const characterName =
      eventInfo.event.extendedProps?.characterName ||
      (eventInfo.event.title ? eventInfo.event.title.split(' - ')[0] : '');

    return (
      <Box
        sx={{
          padding: '2px 4px',
          fontSize: '0.85rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          backgroundColor: eventInfo.backgroundColor,
        }}
      >
        <strong>{eventInfo.timeText}</strong>
        {userIsAdmin && characterName && (
          <>
            <br />
            {characterName}
          </>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth='lg'>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
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
        <SchedulePaper elevation={3}>
          <Typography variant='h4' color='error' gutterBottom>
            Error
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {error}
          </Typography>
        </SchedulePaper>
      </Container>
    );
  }

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str: string | null | undefined): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const displayName = coachInfo?.name
    ? capitalizeFirstLetter(coachInfo.name)
    : coachInfo?.username
    ? capitalizeFirstLetter(coachInfo.username)
    : id || 'Coach';

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

      <SchedulePaper elevation={3}>
        <ScheduleTitle variant='h2' gutterBottom>
          {displayName}'s Schedule
        </ScheduleTitle>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
          View {displayName}'s coaching sessions and availability.
        </Typography>

        {/* Instruction Box */}
        {currentView === 'dayGridMonth' ? (
          <Alert
            severity='info'
            sx={{
              mb: 3,
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
              '& .MuiAlert-icon': {
                color: theme.palette.info.main,
              },
            }}
          >
            <Typography variant='body1' sx={{ fontWeight: 600, mb: 0.5 }}>
              📅 How to Book a Time
            </Typography>
            <Typography variant='body2'>
              Switch to <strong>Day</strong> or <strong>Week</strong> view using
              the buttons above, then <strong>click and drag</strong> on the
              calendar to select your desired time slot.
            </Typography>
          </Alert>
        ) : (
          <Alert
            severity='info'
            sx={{
              mb: 3,
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
              '& .MuiAlert-icon': {
                color: theme.palette.info.main,
              },
            }}
          >
            <Typography variant='body1' sx={{ fontWeight: 600, mb: 0.5 }}>
              🖱️ Click and Drag to Book
            </Typography>
            <Typography variant='body2'>
              <strong>Click and drag</strong> on the calendar below to select
              your desired time range. A dialog will appear to confirm your
              selection and proceed to booking.
            </Typography>
          </Alert>
        )}

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
            '& th[role="columnheader"], & th[aria-hidden="true"]': {
              backgroundColor: theme.palette.primary.main,
              color:
                theme.palette.primary.contrastText ||
                theme.palette.text.primary,
              fontWeight: 600,
            },
            '& .fc-event': {
              cursor:
                isAdmin() && currentView !== 'dayGridMonth'
                  ? 'move'
                  : 'pointer',
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
            '& .fc-timegrid-slot': {
              height: '2.5em',
            },
            '& .fc-select-highlight': {
              backgroundColor: alpha(
                theme.palette.success?.main || '#4caf50',
                0.2
              ),
              border: `2px solid ${alpha(
                theme.palette.success?.main || '#4caf50',
                0.5
              )}`,
            },
            '& .fc-highlight': {
              backgroundColor: alpha(
                theme.palette.success?.main || '#4caf50',
                0.15
              ),
            },
          }}
        >
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={currentView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            editable={
              isAdmin() &&
              (currentView === 'timeGridDay' || currentView === 'timeGridWeek')
            }
            eventStartEditable={
              isAdmin() &&
              (currentView === 'timeGridDay' || currentView === 'timeGridWeek')
            }
            eventDurationEditable={
              isAdmin() &&
              (currentView === 'timeGridDay' || currentView === 'timeGridWeek')
            }
            eventResizableFromStart={isAdmin()}
            selectable={
              currentView === 'timeGridDay' || currentView === 'timeGridWeek'
            }
            selectMirror={true}
            selectOverlap={false}
            selectConstraint={{
              start: '00:00',
              end: '24:00',
            }}
            dayMaxEvents={true}
            weekends={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            events={events}
            eventContent={renderEventContent}
            height='auto'
            slotMinTime='00:00:00'
            slotMaxTime='24:00:00'
            slotDuration='00:30:00'
            snapDuration='00:30:00'
            slotLabelInterval='01:00:00'
            allDaySlot={false}
            selectMinDistance={10}
            datesSet={handleViewChange}
          />
        </Box>
      </SchedulePaper>

      {/* Time Selection Dialog */}
      <Dialog
        open={showTimeDialog}
        onClose={handleCloseTimeDialog}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            Selected Time Range
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedTimeRange && (
            <Box sx={{ py: 2 }}>
              <Typography variant='body1' sx={{ mb: 2 }}>
                <strong>Date:</strong> {formatDate(selectedTimeRange.start)}
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                <strong>Start Time:</strong>{' '}
                {formatTime(selectedTimeRange.start)}
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                <strong>End Time:</strong> {formatTime(selectedTimeRange.end)}
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  mb: 2,
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                }}
              >
                <strong>Duration:</strong>{' '}
                {calculateDuration(
                  selectedTimeRange.start,
                  selectedTimeRange.end
                )}
              </Typography>
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <Typography variant='body2' color='text.secondary'>
                  💡 <strong>Tip:</strong> This time range has been selected and
                  will be used to coordinate with the coach.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTimeDialog} variant='outlined'>
            Close
          </Button>
          <Button
            onClick={() => {
              if (selectedTimeRange) {
                const startYear = selectedTimeRange.start.getFullYear();
                const startMonth = String(
                  selectedTimeRange.start.getMonth() + 1
                ).padStart(2, '0');
                const startDay = String(
                  selectedTimeRange.start.getDate()
                ).padStart(2, '0');
                const startHours = String(
                  selectedTimeRange.start.getHours()
                ).padStart(2, '0');
                const startMinutes = String(
                  selectedTimeRange.start.getMinutes()
                ).padStart(2, '0');
                const formattedStartDate = `${startYear}-${startMonth}-${startDay}T${startHours}:${startMinutes}`;

                const endYear = selectedTimeRange.end.getFullYear();
                const endMonth = String(
                  selectedTimeRange.end.getMonth() + 1
                ).padStart(2, '0');
                const endDay = String(selectedTimeRange.end.getDate()).padStart(
                  2,
                  '0'
                );
                const endHours = String(
                  selectedTimeRange.end.getHours()
                ).padStart(2, '0');
                const endMinutes = String(
                  selectedTimeRange.end.getMinutes()
                ).padStart(2, '0');
                const formattedEndDate = `${endYear}-${endMonth}-${endDay}T${endHours}:${endMinutes}`;

                // Calculate duration in hours and round to nearest integer
                const durationMs =
                  selectedTimeRange.end.getTime() -
                  selectedTimeRange.start.getTime();
                const durationHours = Math.round(durationMs / (1000 * 60 * 60));
                // Clamp between 1 and 5 hours (form validation limits)
                const hours = Math.max(1, Math.min(5, durationHours));

                navigate(
                  `${ROUTE_PATHS.booking}?date=${formattedStartDate}&endDate=${formattedEndDate}&hours=${hours}`
                );
              }
            }}
            variant='contained'
            sx={{
              background: `linear-gradient(135deg, ${
                theme.palette.primary.main
              } 0%, ${
                theme.palette.primary.dark || theme.palette.primary.main
              } 100%)`,
            }}
          >
            Book This Time
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={
          snackbar.open && !!snackbar.message && snackbar.message.trim() !== ''
        }
        autoHideDuration={6000}
        onClose={() =>
          setSnackbar({ open: false, message: '', severity: 'success' })
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() =>
            setSnackbar({ open: false, message: '', severity: 'success' })
          }
          severity={snackbar.severity || 'success'}
          variant='filled'
          sx={{ width: '100%', color: 'white' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
