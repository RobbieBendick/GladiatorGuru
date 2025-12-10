import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  alpha,
  styled,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  TextField,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText as MuiListItemText,
  IconButton,
  Avatar,
  Chip,
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
import { DateClickArg } from '@fullcalendar/interaction';
import {
  ArrowBack,
  Visibility,
  Delete,
  Cancel,
  CheckCircle,
  ChevronLeft,
  DragIndicator,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { API_BASE_URL } from '../../config/api';
import { isAdmin, getAuthToken, getUserId } from '../../config/auth';
import {
  formatTimeWithTimezone,
  getTimezoneAbbreviation,
  getIANATimezone,
  abbreviationToIANA,
  convertTimeBetweenTimezones,
} from '../../utils/timezone';
import { User, AvailabilitySlot, useUser } from '../../contexts/UserContext';
import { useCustomerDrawer } from '../../contexts/CustomerDrawerContext';
import {
  isTimeWithinAvailability,
  formatAvailabilityByDay,
} from '../../utils/availability';

// LocalStorage keys (matching booking form)
const SAVED_CHARACTERS_KEY = 'gladiatorGuru_savedCharacters';
const LAST_DISCORD_USERNAME_KEY = 'gladiatorGuru_lastDiscordUsername';

// Interface for saved character
interface SavedCharacter {
  characterName: string;
  characterRealm: string;
  characterClass?: string;
  characterSpec?: string;
  version?: string;
}

// Utility functions for localStorage
const getSavedCharacters = (): SavedCharacter[] => {
  try {
    const saved = localStorage.getItem(SAVED_CHARACTERS_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error loading saved characters:', error);
    return [];
  }
};

const getLastDiscordUsername = (): string => {
  try {
    return localStorage.getItem(LAST_DISCORD_USERNAME_KEY) || '';
  } catch (error) {
    console.error('Error loading last Discord username:', error);
    return '';
  }
};

const SchedulePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 1),
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor:
    theme.palette.mode === 'light'
      ? alpha(theme.palette.background.default, 0.8)
      : alpha(theme.palette.background.default, 0.5),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3, 2),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}));

const ScheduleTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  background: theme.palette.text.primary,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  [theme.breakpoints.up('sm')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '2.5rem',
  },
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
    coachIds?: string[];
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

interface Coach extends User {
  _id: string;
  coachAlias?: string;
}

interface Customer {
  discordUsername: string;
  characterName: string;
  characterRealm: string;
  lastBookingDate: Date;
  credit?: number; // Credit in minutes
}

export function CoachSchedule() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [coachInfo, setCoachInfo] = useState<Coach | null>(null);
  const [coachAvailability, setCoachAvailability] = useState<
    AvailabilitySlot[] | undefined
  >(undefined);
  const [coachTimezone, setCoachTimezone] = useState<string | undefined>(
    undefined
  );
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
  const [snackbarKey, setSnackbarKey] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [canCreateEvents, setCanCreateEvents] = useState(false);
  const [adminFormData, setAdminFormData] = useState<{
    characterName: string;
    characterRealm: string;
    discordUsername: string;
  }>({ characterName: '', characterRealm: '', discordUsername: '' });
  const [quickBookingFormData, setQuickBookingFormData] = useState<{
    characterName: string;
    characterRealm: string;
    discordUsername: string;
  }>({
    characterName: '',
    characterRealm: '',
    discordUsername: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Initialize currentView from localStorage or default based on screen size
  const [currentView, setCurrentView] = useState<string>(() => {
    const cachedView = localStorage.getItem('coachScheduleView');
    if (cachedView) return cachedView;
    // Default to day view on mobile, week view on larger screens
    return 'timeGridWeek';
  });
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  // Track abort controllers per event
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  // Track the latest event positions to prevent stale updates
  const latestEventPositionsRef = useRef<
    Map<string, { start: string; end: string }>
  >(new Map());
  // Track pending update IDs per event to prevent stale updates
  const pendingUpdateIdsRef = useRef<Map<string, number>>(new Map());
  // Customer drawer state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const { drawerOpen, setDrawerOpen } = useCustomerDrawer();
  const [draggedCustomer, setDraggedCustomer] = useState<Customer | null>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  // Customer context menu state
  const [customerContextMenu, setCustomerContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Helper function to show snackbar with proper key update for remounting
  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'success'
  ) => {
    // Increment key to force remount when message changes
    setSnackbarKey(prev => prev + 1);
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    fetchCoachSchedule();
    // Check if user is admin or the coach whose schedule it is
    const userIsAdmin = isAdmin();
    const userId = getUserId();
    const userIsCoach = userId && id && userId === id;

    // Enable admin mode (quick booking) for admins and the coach whose schedule it is
    setIsAdminMode(userIsAdmin || !!userIsCoach);

    // Check if user can create events (admin or the coach whose schedule it is)
    const userCanCreateEvents = userIsAdmin || !!userIsCoach;
    setCanCreateEvents(!!userCanCreateEvents);

    // Fetch customers if user can create events
    if (userCanCreateEvents) {
      fetchCustomers();
    }
  }, [id]);

  // Cache currentView to localStorage whenever it changes
  useEffect(() => {
    if (currentView) {
      localStorage.setItem('coachScheduleView', currentView);
    }
  }, [currentView]);

  // Pre-fill quick booking form with most recently used character and Discord username
  useEffect(() => {
    if (showTimeDialog && !isAdminMode) {
      const savedCharacters = getSavedCharacters();
      // Prefer user's Discord username from profile if logged in, otherwise use localStorage
      const lastDiscordUsername =
        user?.discordUsername || getLastDiscordUsername();

      // Get the most recent character (first in array)
      const mostRecentCharacter =
        savedCharacters.length > 0 ? savedCharacters[0] : null;

      setQuickBookingFormData(prev => ({
        characterName: mostRecentCharacter?.characterName || prev.characterName,
        characterRealm:
          mostRecentCharacter?.characterRealm || prev.characterRealm,
        discordUsername: lastDiscordUsername || prev.discordUsername,
      }));
    }
  }, [showTimeDialog, isAdminMode, user?.discordUsername]);

  // Attach drop handler to document to catch drops anywhere on the calendar
  useEffect(() => {
    if (!canCreateEvents) return;

    const container = calendarContainerRef.current;
    if (!container) return;

    const handleDrop = (e: DragEvent) => {
      // Only handle if we're dragging a customer
      if (!draggedCustomer) return;

      // Check if drop is within the calendar container
      const containerRect = container.getBoundingClientRect();
      if (
        e.clientX < containerRect.left ||
        e.clientX > containerRect.right ||
        e.clientY < containerRect.top ||
        e.clientY > containerRect.bottom
      ) {
        setDraggedCustomer(null);
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      // Get the calendar element - try timegrid first, then daygrid
      let calendarEl = container.querySelector(
        '.fc-timegrid-body'
      ) as HTMLElement;

      // If not in timegrid view, try daygrid
      if (!calendarEl) {
        calendarEl = container.querySelector('.fc-daygrid-body') as HTMLElement;
      }

      if (!calendarEl) {
        setDraggedCustomer(null);
        return;
      }

      // Try to use FullCalendar's API first - most reliable
      const calendarApi = (window as any).calendarApi;
      if (calendarApi) {
        try {
          const point = { x: e.clientX, y: e.clientY };
          const date = calendarApi.dateFromPoint(point);
          if (date) {
            handleCustomerDrop(draggedCustomer, date);
            return;
          }
        } catch (err) {
          console.error('Error getting date from point:', err);
        }
      }

      // Fallback: Manual calculation from DOM
      const rect = calendarEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find which column (day) was dropped on
      const cols = Array.from(
        calendarEl.querySelectorAll('.fc-timegrid-col, .fc-daygrid-day')
      ) as HTMLElement[];

      if (cols.length === 0) {
        setDraggedCustomer(null);
        return;
      }

      let targetCol: HTMLElement | null = null;
      let minDistance = Infinity;

      cols.forEach((col: HTMLElement) => {
        const colRect = col.getBoundingClientRect();
        const colLeft = colRect.left - rect.left;
        const colRight = colRect.right - rect.left;

        if (x >= colLeft && x <= colRight) {
          const distance = Math.abs(x - (colLeft + colRight) / 2);
          if (distance < minDistance) {
            minDistance = distance;
            targetCol = col;
          }
        }
      });

      if (!targetCol) {
        setDraggedCustomer(null);
        return;
      }

      const targetColElement = targetCol as HTMLElement;
      let dateStr = targetColElement.getAttribute('data-date');

      if (!dateStr) {
        const calendarApi = (window as any).calendarApi;
        if (calendarApi) {
          try {
            const view = calendarApi.view;
            const activeStart = view.activeStart;
            const dayIndex = cols.indexOf(targetColElement);
            if (dayIndex >= 0) {
              const dropDate = new Date(activeStart);
              dropDate.setDate(activeStart.getDate() + dayIndex);
              dateStr = dropDate.toISOString().split('T')[0];
            }
          } catch (err) {
            console.error('Error getting date from view:', err);
          }
        }
      }

      if (!dateStr) {
        setDraggedCustomer(null);
        return;
      }

      // Find which time slot was dropped on (for timegrid view)
      const slots = Array.from(
        targetColElement.querySelectorAll('.fc-timegrid-slot')
      ) as HTMLElement[];

      let dropDate: Date;

      if (slots.length > 0) {
        // Timegrid view - calculate exact time from slot position
        let targetSlot: HTMLElement | null = null;
        let minSlotDistance = Infinity;

        slots.forEach((slot: HTMLElement) => {
          const slotRect = slot.getBoundingClientRect();
          const slotTop = slotRect.top - rect.top;
          const slotBottom = slotRect.bottom - rect.top;

          if (y >= slotTop && y <= slotBottom) {
            const distance = Math.abs(y - (slotTop + slotBottom) / 2);
            if (distance < minSlotDistance) {
              minSlotDistance = distance;
              targetSlot = slot;
            }
          }
        });

        if (targetSlot) {
          // Calculate exact time from slot position
          const slotIndex = slots.indexOf(targetSlot);
          if (slotIndex >= 0) {
            const slotRect = (
              targetSlot as HTMLElement
            ).getBoundingClientRect();
            const slotHeight = slotRect.height;
            const slotTop = slotRect.top - rect.top;
            const slotOffset = y - slotTop;
            const slotRatio = slotOffset / slotHeight;

            // Assuming 30-minute slots starting from 00:00
            const slotDuration = 30; // minutes
            const totalMinutes =
              slotIndex * slotDuration + slotRatio * slotDuration;
            const hours = Math.floor(totalMinutes / 60);
            const minutes = Math.floor((totalMinutes % 60) / 30) * 30; // Round to nearest 30 minutes

            // Create date in local timezone properly
            const [year, month, day] = dateStr.split('-').map(Number);
            dropDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
            handleCustomerDrop(draggedCustomer, dropDate);
            return;
          }
        }
      }

      // Daygrid view or fallback - use middle of day (noon)
      const [year, month, day] = dateStr.split('-').map(Number);
      dropDate = new Date(year, month - 1, day, 12, 0, 0, 0);
      handleCustomerDrop(draggedCustomer, dropDate);
    };

    const handleDragOver = (e: DragEvent) => {
      if (draggedCustomer) {
        // Check if over calendar container
        const containerRect = container.getBoundingClientRect();
        if (
          e.clientX >= containerRect.left &&
          e.clientX <= containerRect.right &&
          e.clientY >= containerRect.top &&
          e.clientY <= containerRect.bottom
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
          }
        }
      }
    };

    // Use capture phase and attach to document to catch all drops
    document.addEventListener('drop', handleDrop, true);
    document.addEventListener('dragover', handleDragOver, true);

    return () => {
      document.removeEventListener('drop', handleDrop, true);
      document.removeEventListener('dragover', handleDragOver, true);
    };
  }, [draggedCustomer, canCreateEvents]);

  const fetchCoachSchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        setError('Coach ID is required');
        setLoading(false);
        return;
      }

      // Fetch coach info by ID (public endpoint)
      try {
        const coachResponse = await fetch(`${API_BASE_URL}/api/users/${id}`, {
          credentials: 'include',
        });

        if (coachResponse.ok) {
          const coachData = await coachResponse.json();
          const coach = Array.isArray(coachData.data)
            ? coachData.data[0]
            : coachData.data;
          if (coach) {
            setCoachInfo(coach);
            // Set coach availability and timezone if available
            if (coach.availability) {
              setCoachAvailability(coach.availability);
            }
            if (coach.timezone) {
              setCoachTimezone(coach.timezone);
            }
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
              coachIds: job.coachIds || [],
            },
          };
        });

      setEvents(calendarEvents);
    } catch (err: any) {
      console.error('Error fetching coach jobs:', err);
      setError(err.message || 'Failed to load jobs');
    }
  };

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const token = getAuthToken();
      if (!token) {
        setCustomersLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const customersData = data.data || [];
        // Convert lastBookingDate strings to Date objects
        const customers = customersData.map((customer: any) => ({
          ...customer,
          lastBookingDate: new Date(customer.lastBookingDate),
        }));
        setCustomers(customers);
      } else {
        console.error('Failed to fetch customers:', response.status);
      }
    } catch (err: any) {
      console.error('Error fetching customers:', err);
    } finally {
      setCustomersLoading(false);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    // Allow everyone to select times for booking (removed permission check)

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
      showSnackbar(
        'Maximum selection time is 5 hours. Please select a shorter time range.',
        'error'
      );
      selectInfo.view.calendar.unselect();
      return;
    }

    // Check if the selected time is within coach's availability
    // Note: Availability times are in the coach's timezone
    // The booking time (start/end) is in the user's local timezone
    // For proper validation, we'd need to convert to coach's timezone, but for now
    // we compare directly (works correctly if both are in same timezone or user books in coach's timezone)
    if (
      coachAvailability &&
      coachAvailability.length > 0 &&
      !isTimeWithinAvailability(start, end, coachAvailability)
    ) {
      const timezoneNote = coachTimezone
        ? ` (availability is in ${coachTimezone})`
        : '';
      showSnackbar(
        `This time slot is outside of the coach's availability${timezoneNote}. Please select a time within their available hours.`,
        'error'
      );
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
    const userId = getUserId();
    const userIsAdmin = isAdmin();

    // Check if user has permission to view this specific job
    // User must be admin OR assigned to this job
    const jobCoachIds = event.extendedProps?.coachIds || [];
    const userIsAssigned =
      userId &&
      jobCoachIds.some(
        (coachId: string) => coachId.toString() === userId.toString()
      );

    // Only allow navigation if user has permission (admin or assigned to this job)
    if (!userIsAdmin && !userIsAssigned) {
      // Silently prevent navigation - don't show error message
      return;
    }

    // Left click - navigate to job details
    navigate(`/job/${event.id}`);
  };

  // Store event listeners for cleanup
  const eventListenersRef = useRef<Map<string, EventListener>>(new Map());

  const handleEventDidMount = (arg: any) => {
    // Add context menu listener to event element
    const eventElement = arg.el;
    const eventId = arg.event.id;

    // Remove existing listener if any
    const existingListener = eventListenersRef.current.get(eventId);
    if (existingListener) {
      eventElement.removeEventListener('contextmenu', existingListener);
    }

    const handleContextMenu = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();

      const userId = getUserId();
      const userIsAdmin = isAdmin();

      // Find the event in our events array
      const calendarEvent = events.find(e => e.id === eventId);
      if (!calendarEvent) return;

      // Check if user has permission to interact with this job
      const jobCoachIds = calendarEvent.extendedProps?.coachIds || [];
      const userIsAssigned =
        userId &&
        jobCoachIds.some(
          (coachId: string) => coachId.toString() === userId.toString()
        );

      // Only show context menu if user has permission (admin or assigned to this job)
      if (!userIsAdmin && !userIsAssigned) {
        return;
      }

      setSelectedEvent(calendarEvent);
      setContextMenu({
        mouseX: mouseEvent.clientX,
        mouseY: mouseEvent.clientY,
      });
    };

    eventElement.addEventListener('contextmenu', handleContextMenu);
    eventListenersRef.current.set(eventId, handleContextMenu);
  };

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      eventListenersRef.current.forEach((listener, eventId) => {
        // Find and remove listener from DOM if element still exists
        const eventElements = document.querySelectorAll(
          `[data-event-id="${eventId}"]`
        );
        eventElements.forEach(el => {
          el.removeEventListener('contextmenu', listener);
        });
      });
      eventListenersRef.current.clear();
    };
  }, []);

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setSelectedEvent(null);
  };

  const handleViewDetails = () => {
    if (selectedEvent) {
      navigate(`/job/${selectedEvent.id}`);
    }
    handleCloseContextMenu();
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedEvent) return;

    try {
      setUpdatingJobId(selectedEvent.id);
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/api/admin/jobs/${selectedEvent.id}/status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        showSnackbar('Unauthorized to update job status', 'error');
        return;
      }

      if (response.ok) {
        showSnackbar(`Job status updated to ${newStatus}`, 'success');
        // Refresh the schedule
        await fetchCoachSchedule();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showSnackbar(
          errorData.message || 'Failed to update job status',
          'error'
        );
      }
    } catch (error: any) {
      console.error('Error updating job status:', error);
      showSnackbar('Failed to update job status', 'error');
    } finally {
      setUpdatingJobId(null);
      handleCloseContextMenu();
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedEvent) return;

    if (
      !window.confirm(
        'Are you sure you want to delete this job? This action cannot be undone.'
      )
    ) {
      handleCloseContextMenu();
      return;
    }

    try {
      setUpdatingJobId(selectedEvent.id);
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/api/admin/jobs/${selectedEvent.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (response.status === 401 || response.status === 403) {
        showSnackbar('Unauthorized to delete job', 'error');
        return;
      }

      if (response.ok) {
        showSnackbar('Job deleted successfully', 'success');
        // Refresh the schedule
        await fetchCoachSchedule();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showSnackbar(errorData.message || 'Failed to delete job', 'error');
      }
    } catch (error: any) {
      console.error('Error deleting job:', error);
      showSnackbar('Failed to delete job', 'error');
    } finally {
      setUpdatingJobId(null);
      handleCloseContextMenu();
    }
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
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/api/admin/jobs/${event.id}/availability`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
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
          showSnackbar(errorMessage, 'error');
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
        showSnackbar('Job availability updated successfully', 'success');
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
        showSnackbar(errorMessage, 'error');
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
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/api/admin/jobs/${event.id}/availability`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
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
          showSnackbar(errorMessage, 'error');
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
        showSnackbar('Job availability updated successfully', 'success');
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
        showSnackbar(errorMessage, 'error');
      }
      abortControllersRef.current.delete(event.id);
    }
  };

  const formatTime = (date: Date): string => {
    return formatTimeWithTimezone(date, {
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

  // Format credit from minutes to readable format (e.g., "4h 30m")
  const formatCredit = (minutes: number | undefined): string => {
    if (minutes === undefined || minutes === null || minutes === 0) {
      return '0m';
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes}m`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const handleCloseTimeDialog = () => {
    setShowTimeDialog(false);
    setSelectedTimeRange(null);
    setAdminFormData({
      characterName: '',
      characterRealm: '',
      discordUsername: '',
    });
    setQuickBookingFormData({
      characterName: '',
      characterRealm: '',
      discordUsername: '',
    });
  };

  const handleAdminSubmit = async () => {
    if (!selectedTimeRange || !id) return;

    if (
      !adminFormData.characterName ||
      !adminFormData.characterRealm ||
      !adminFormData.discordUsername
    ) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getAuthToken();

      const startISO = selectedTimeRange.start.toISOString();
      const endISO = selectedTimeRange.end.toISOString();
      const durationMs =
        selectedTimeRange.end.getTime() - selectedTimeRange.start.getTime();
      const durationHours = Math.round(durationMs / (1000 * 60 * 60));
      const hours = Math.max(1, Math.min(5, durationHours));

      const response = await fetch(`${API_BASE_URL}/api/admin/jobs`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          characterName: adminFormData.characterName,
          characterRealm: adminFormData.characterRealm,
          discordUsername: adminFormData.discordUsername,
          availabilityStartDateTime: startISO,
          availabilityEndDateTime: endISO,
          hours: hours.toString(),
          coachIds: [id],
          status: 'accepted',
        }),
      });

      if (response.ok) {
        await response.json();
        showSnackbar('Booking created successfully', 'success');
        handleCloseTimeDialog();
        // Refresh the calendar
        await fetchCoachSchedule();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showSnackbar(errorData.message || 'Failed to create booking', 'error');
      }
    } catch (err: any) {
      console.error('Error creating booking:', err);
      showSnackbar('Failed to create booking', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickBookingSubmit = async () => {
    if (!selectedTimeRange || !id) return;

    if (
      !quickBookingFormData.characterName ||
      !quickBookingFormData.characterRealm ||
      !quickBookingFormData.discordUsername
    ) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getAuthToken();

      // The selected time is in the user's local timezone
      // Convert to ISO string (UTC) - this preserves the actual moment in time
      const startISO = selectedTimeRange.start.toISOString();
      const endISO = selectedTimeRange.end.toISOString();
      const durationMs =
        selectedTimeRange.end.getTime() - selectedTimeRange.start.getTime();
      const durationHours = Math.round(durationMs / (1000 * 60 * 60));
      const hours = Math.max(1, Math.min(5, durationHours));

      // Submit to public booking endpoint
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          characterName: quickBookingFormData.characterName.trim(),
          characterRealm: quickBookingFormData.characterRealm.trim(),
          version: 'MOP', // Default to MOP for quick bookings
          discordUsername: quickBookingFormData.discordUsername.trim(),
          availabilityStartDateTime: startISO,
          availabilityEndDateTime: endISO,
          hours: hours.toString(),
          bracket: '',
          characterClass: '',
          characterSpec: '',
          goal: '',
        }),
      });

      if (response.ok) {
        await response.json();
        showSnackbar('Booking request submitted successfully!', 'success');
        handleCloseTimeDialog();
        // Refresh the calendar after a short delay
        setTimeout(() => {
          fetchCoachSchedule();
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showSnackbar(
          errorData.message || 'Failed to submit booking request',
          'error'
        );
      }
    } catch (err: any) {
      console.error('Error submitting booking:', err);
      showSnackbar('Failed to submit booking request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
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
        {canCreateEvents && characterName && (
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

  const displayName = coachInfo?.coachAlias
    ? coachInfo.coachAlias
    : coachInfo?.username
    ? capitalizeFirstLetter(coachInfo.username)
    : id || 'Coach';

  // Convert availability slots to FullCalendar businessHours format
  // Converts times from coach's timezone to user's local timezone
  // Always return businessHours for visual styling (shows unavailable times)
  // Constraints are handled separately via selectConstraint and eventConstraint
  const getBusinessHours = () => {
    if (!coachAvailability || coachAvailability.length === 0) {
      return undefined; // No visual styling if no availability set
    }

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

    // Group availability by day of week and convert times to user's timezone
    const businessHoursByDay: {
      [key: number]: Array<{ startTime: string; endTime: string }>;
    } = {};

    coachAvailability.forEach(slot => {
      if (!businessHoursByDay[slot.dayOfWeek]) {
        businessHoursByDay[slot.dayOfWeek] = [];
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

      businessHoursByDay[slot.dayOfWeek].push({
        startTime: startTime,
        endTime: endTime,
      });
    });

    // Convert to FullCalendar businessHours format
    const businessHours: any[] = [];
    Object.keys(businessHoursByDay).forEach(dayOfWeek => {
      const day = Number(dayOfWeek);
      businessHoursByDay[day].forEach(timeSlot => {
        businessHours.push({
          daysOfWeek: [day],
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
        });
      });
    });

    return businessHours.length > 0 ? businessHours : undefined;
  };

  // Get select constraint - use businessHours to restrict selection to available times
  // Admins and schedule owners can select/drag anywhere (no restrictions)
  const getSelectConstraint = () => {
    // Allow admins and schedule owners to select/drag anywhere
    if (isAdminMode) {
      return {
        start: '00:00',
        end: '24:00',
      };
    }

    if (!coachAvailability || coachAvailability.length === 0) {
      // No availability restrictions - allow all times
      return {
        start: '00:00',
        end: '24:00',
      };
    }
    // Restrict selection to business hours (availability) for regular users
    return 'businessHours';
  };

  // Get event constraint - restricts where existing events can be dragged
  // Admins and schedule owners can drag events anywhere (no restrictions)
  const getEventConstraint = () => {
    // Allow admins and schedule owners to drag events anywhere
    if (isAdminMode) {
      return {
        start: '00:00',
        end: '24:00',
      };
    }

    if (!coachAvailability || coachAvailability.length === 0) {
      // No availability restrictions - allow all times
      return {
        start: '00:00',
        end: '24:00',
      };
    }
    // Restrict event dragging to business hours (availability) for regular users
    return 'businessHours';
  };

  // Get valid range - prevent selection of past dates (allow 2 days ago and future)
  // Admins and schedule owners can drag to any date, including past dates
  const getValidRange = () => {
    // Allow admins and schedule owners to drag to any date (no restrictions)
    if (isAdminMode) {
      return undefined; // No date restrictions for admins/owners
    }

    // Regular users: prevent selection of past dates (allow 2 days ago and future)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2); // 2 days ago
    twoDaysAgo.setHours(0, 0, 0, 0);
    return {
      start: twoDaysAgo.toISOString().split('T')[0], // 2 days ago onwards
    };
  };

  // Handle customer drop on calendar - create booking directly
  const handleCustomerDrop = async (customer: Customer, date: Date) => {
    if (!id) return;

    // Default to 1 hour duration
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    console.log('Creating booking:', {
      customer: customer.discordUsername,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startLocal: startDate.toString(),
      endLocal: endDate.toString(),
    });

    try {
      setIsSubmitting(true);
      const token = getAuthToken();

      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();

      // Create booking directly
      const response = await fetch(`${API_BASE_URL}/api/admin/jobs`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          characterName: customer.characterName,
          characterRealm: customer.characterRealm,
          discordUsername: customer.discordUsername,
          availabilityStartDateTime: startISO,
          availabilityEndDateTime: endISO,
          hours: '1',
          coachIds: [id],
          status: 'accepted',
          version: 'MOP', // Default version
          bracket: '',
          characterClass: '',
          characterSpec: '',
          goal: '',
        }),
      });

      if (response.ok) {
        await response.json().catch(() => ({}));
        showSnackbar('Booking created successfully', 'success');
        setDrawerOpen(false);
        // Refresh the calendar - add small delay to ensure backend has processed
        setTimeout(async () => {
          await fetchCoachSchedule();
          // Force calendar to refresh events
          const calendarApi = (window as any).calendarApi;
          if (calendarApi) {
            try {
              calendarApi.refetchEvents();
            } catch (err) {
              console.error('Error refreshing calendar:', err);
            }
          }
        }, 500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showSnackbar(errorData.message || 'Failed to create booking', 'error');
      }
    } catch (err: any) {
      console.error('Error creating booking:', err);
      showSnackbar('Failed to create booking', 'error');
    } finally {
      setIsSubmitting(false);
      setDraggedCustomer(null);
    }
  };

  // Handle date click - if customer is being dragged, create booking (fallback)
  const handleDateClick = (clickInfo: DateClickArg) => {
    if (draggedCustomer && canCreateEvents) {
      handleCustomerDrop(draggedCustomer, clickInfo.date);
    }
  };

  const drawerWidth = 320;

  return (
    <Container maxWidth='lg'>
      {/* Customer Drawer */}
      {canCreateEvents && (
        <Drawer
          anchor='right'
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor:
                theme.palette.mode === 'light'
                  ? theme.palette.background.paper
                  : alpha(theme.palette.background.paper, 0.95),
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            }}
          >
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              Recent Customers
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)} size='small'>
              <ChevronLeft />
            </IconButton>
          </Box>
          <Box sx={{ overflow: 'auto', flex: 1 }}>
            {customersLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 4,
                }}
              >
                <CircularProgress />
              </Box>
            ) : customers.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant='body2' color='text.secondary'>
                  No customers yet
                </Typography>
              </Box>
            ) : (
              <List>
                {customers.map((customer, index) => (
                  <ListItem
                    key={`${customer.discordUsername}-${index}`}
                    disablePadding
                    sx={{
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.1
                      )}`,
                    }}
                  >
                    <ListItemButton
                      sx={{
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.08
                          ),
                        },
                      }}
                      draggable
                      onDragStart={e => {
                        setDraggedCustomer(customer);
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData(
                          'text/plain',
                          JSON.stringify(customer)
                        );
                        // Add visual feedback
                        if (e.dataTransfer) {
                          e.dataTransfer.effectAllowed = 'move';
                        }
                      }}
                      onDragEnd={() => {
                        // Don't clear here - let the drop handler do it
                      }}
                      onContextMenu={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedCustomer(customer);
                        setCustomerContextMenu({
                          mouseX: e.clientX + 2,
                          mouseY: e.clientY - 6,
                        });
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          mr: 2,
                          bgcolor: theme.palette.primary.main,
                          fontSize: '0.875rem',
                        }}
                      >
                        {customer.discordUsername.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <MuiListItemText
                          primary={
                            <Typography
                              variant='body1'
                              sx={{
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {customer.discordUsername}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                                sx={{
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {customer.characterName} -{' '}
                                {customer.characterRealm}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  gap: 0.5,
                                  mt: 0.5,
                                  flexWrap: 'wrap',
                                }}
                              >
                                <Chip
                                  label={`Last: ${new Date(
                                    customer.lastBookingDate
                                  ).toLocaleDateString()}`}
                                  size='small'
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                  }}
                                />
                                <Chip
                                  label={`Credit: ${formatCredit(
                                    customer.credit
                                  )}`}
                                  size='small'
                                  color={
                                    (customer.credit || 0) > 0
                                      ? 'success'
                                      : 'default'
                                  }
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                  }}
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </Box>
                      <DragIndicator
                        sx={{
                          color: 'text.secondary',
                          opacity: 0.5,
                          ml: 1,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Drawer>
      )}

      {/* Customer Context Menu */}
      <Menu
        open={customerContextMenu !== null}
        onClose={() => {
          setCustomerContextMenu(null);
          setSelectedCustomer(null);
        }}
        anchorReference='anchorPosition'
        anchorPosition={
          customerContextMenu !== null
            ? {
                top: customerContextMenu.mouseY,
                left: customerContextMenu.mouseX,
              }
            : undefined
        }
        PaperProps={{
          sx: {
            minWidth: 200,
            borderRadius: 2,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedCustomer) {
              navigate(
                `/admin/customers/${encodeURIComponent(
                  selectedCustomer.discordUsername
                )}`
              );
            }
            setCustomerContextMenu(null);
            setSelectedCustomer(null);
          }}
        >
          <ListItemIcon>
            <Visibility fontSize='small' />
          </ListItemIcon>
          <ListItemText>View Customer</ListItemText>
        </MenuItem>
      </Menu>

      <SchedulePaper elevation={3}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <ScheduleTitle variant='h2' gutterBottom sx={{ mb: 0 }}>
            {displayName}'s Schedule
          </ScheduleTitle>
        </Box>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{
            mb: { xs: 2, md: 3 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          View {displayName}'s coaching sessions and availability.
        </Typography>

        {/* Availability Display */}
        {coachAvailability && coachAvailability.length > 0 && (
          <Alert
            severity='info'
            sx={{
              mb: { xs: 2, md: 3 },
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
              '& .MuiAlert-icon': {
                color: theme.palette.info.main,
              },
              '& .MuiAlert-message': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
              },
            }}
          >
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}
            >
              <Typography variant='body1' sx={{ fontWeight: 600 }}>
                ⏰ Available Hours
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
                pl: 0.5,
              }}
            >
              {formatAvailabilityByDay(coachAvailability, coachTimezone).map(
                (dayInfo, index) => (
                  <Typography key={index} variant='body2' component='div'>
                    <Box component='span' sx={{ fontWeight: 600, mr: 1 }}>
                      {dayInfo.dayName}:
                    </Box>
                    <Box component='span' color='text.secondary'>
                      {dayInfo.slots.join(', ')}
                    </Box>
                  </Typography>
                )
              )}
            </Box>
          </Alert>
        )}

        {/* Instruction Box - Show for everyone */}
        {currentView === 'dayGridMonth' ? (
          <Alert
            severity='info'
            sx={{
              mb: { xs: 2, md: 3 },
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
              '& .MuiAlert-icon': {
                color: theme.palette.info.main,
              },
              '& .MuiAlert-message': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
              },
            }}
          >
            <Typography
              variant='body1'
              sx={{
                fontWeight: 600,
                mb: 0.5,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              📅 How to Book a Time
            </Typography>
            <Typography
              variant='body2'
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              Switch to <strong>Day</strong> or <strong>Week</strong> view using
              the buttons above, then <strong>click and drag</strong> on the
              calendar to select your desired time slot.
            </Typography>
          </Alert>
        ) : (
          <Alert
            severity='info'
            sx={{
              mb: { xs: 2, md: 3 },
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
              '& .MuiAlert-icon': {
                color: theme.palette.info.main,
              },
              '& .MuiAlert-message': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
              },
            }}
          >
            <Typography
              variant='body1'
              sx={{
                fontWeight: 600,
                mb: 0.5,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              🖱️ Click and Drag to Book
            </Typography>
            <Typography
              variant='body2'
              sx={{
                mb: 1,
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
              }}
            >
              <strong>Click and drag</strong> on the calendar below to select
              your desired time range. A dialog will appear to confirm your
              selection and proceed to booking.
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{
                display: 'block',
                fontStyle: 'italic',
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
              }}
            >
              📍 All times are shown in your local timezone (
              {getTimezoneAbbreviation()})
            </Typography>
          </Alert>
        )}

        <Box
          ref={calendarContainerRef}
          sx={{
            overflowX: 'auto',
            overflowY: 'visible',
            width: '100%',
            '& .fc': {
              fontFamily: theme.typography.fontFamily,
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
              '& .fc-col-header-cell': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                padding: { xs: '4px 2px', sm: '8px 4px' },
              },
              '& .fc-timegrid-slot-label': {
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
              },
            },
            '& .fc-header-toolbar': {
              marginBottom: { xs: theme.spacing(1.5), md: theme.spacing(3) },
              flexWrap: 'wrap',
              gap: { xs: 0.5, sm: 1 },
              '& .fc-toolbar-chunk': {
                display: 'flex',
                flexWrap: 'wrap',
                gap: { xs: 0.25, sm: 0.5 },
              },
            },
            '& .fc-button': {
              backgroundColor: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              padding: { xs: '4px 8px', sm: '6px 12px' },
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
              '&.fc-non-business': {
                backgroundColor: alpha(theme.palette.grey[500], 0.05),
                opacity: 0.6,
              },
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
                canCreateEvents && currentView !== 'dayGridMonth'
                  ? 'move'
                  : canCreateEvents
                  ? 'pointer'
                  : 'default',
              border: 'none',
              borderRadius: theme.shape.borderRadius,
              touchAction: 'none',
              WebkitTouchCallout: 'none',
              userSelect: 'none',
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
              height: { xs: '2em', sm: '2.5em' },
              touchAction: 'pan-y',
            },
            // Highlight available business hours (background events)
            '& .fc-bg-event': {
              backgroundColor: alpha(
                theme.palette.success?.main || '#4caf50',
                0.15
              ),
              border: `1px solid ${alpha(
                theme.palette.success?.main || '#4caf50',
                0.2
              )}`,
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
            // Mobile touch support
            '& .fc-timegrid-body': {
              touchAction: 'pan-y',
            },
            '& .fc-timegrid-col': {
              touchAction: 'pan-y',
            },
            '& .fc-scrollgrid': {
              touchAction: 'pan-y',
            },
            '& .fc-scroller': {
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
            },
            // Drop zone styling when dragging customer
            ...(draggedCustomer && {
              '& .fc-timegrid-col': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                cursor: 'pointer',
              },
            }),
          }}
        >
          <FullCalendar
            ref={calendarRef => {
              if (calendarRef) {
                (window as any).calendarApi = calendarRef.getApi();
              }
            }}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={currentView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'timeGridWeek,timeGridDay',
            }}
            editable={
              canCreateEvents &&
              (currentView === 'timeGridDay' || currentView === 'timeGridWeek')
            }
            eventStartEditable={
              canCreateEvents &&
              (currentView === 'timeGridDay' || currentView === 'timeGridWeek')
            }
            eventDurationEditable={
              canCreateEvents &&
              (currentView === 'timeGridDay' || currentView === 'timeGridWeek')
            }
            eventResizableFromStart={canCreateEvents}
            selectable={
              currentView === 'timeGridDay' || currentView === 'timeGridWeek'
            }
            selectMirror={true}
            selectOverlap={false}
            businessHours={getBusinessHours()}
            selectConstraint={getSelectConstraint()}
            eventConstraint={getEventConstraint()}
            validRange={getValidRange()}
            dayMaxEvents={true}
            weekends={true}
            select={handleDateSelect}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventDidMount={handleEventDidMount}
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
            selectMinDistance={0}
            longPressDelay={200}
            selectLongPressDelay={200}
            datesSet={handleViewChange}
            nowIndicator={true}
          />
        </Box>
      </SchedulePaper>

      {/* Time Selection Dialog */}
      <Dialog
        open={showTimeDialog}
        onClose={handleCloseTimeDialog}
        maxWidth='sm'
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 0, sm: 'auto' },
            maxHeight: { xs: '100vh', sm: '90vh' },
          },
        }}
      >
        <DialogTitle>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            Selected Time Range
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          {selectedTimeRange && (
            <Box sx={{ py: { xs: 1, sm: 2 } }}>
              <Typography
                variant='body1'
                sx={{
                  mb: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                <strong>Date:</strong> {formatDate(selectedTimeRange.start)}
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  mb: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                <strong>Start Time:</strong>{' '}
                {formatTime(selectedTimeRange.start)}
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  mb: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                <strong>End Time:</strong> {formatTime(selectedTimeRange.end)}
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  mb: { xs: 1.5, sm: 2 },
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: { xs: '0.95rem', sm: '1.1rem' },
                }}
              >
                <strong>Duration:</strong>{' '}
                {calculateDuration(
                  selectedTimeRange.start,
                  selectedTimeRange.end
                )}
              </Typography>
              {!isAdminMode && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 2,
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                  }}
                >
                  <Typography variant='body2' color='text.secondary'>
                    💡 <strong>Tip:</strong> This time range has been selected
                    and will be used to coordinate with the coach.
                  </Typography>
                </Box>
              )}

              {isAdminMode ? (
                <>
                  <Divider sx={{ my: { xs: 2, sm: 3 } }} />
                  <Typography
                    variant='h6'
                    sx={{
                      mb: { xs: 1.5, sm: 2 },
                      fontWeight: 600,
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                    }}
                  >
                    Quick Add Booking
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{
                      mb: { xs: 1.5, sm: 2 },
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    }}
                  >
                    Fill in the essential information to quickly create a
                    booking.
                  </Typography>
                  <TextField
                    fullWidth
                    label='Character Name'
                    value={adminFormData.characterName}
                    onChange={e =>
                      setAdminFormData({
                        ...adminFormData,
                        characterName: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                    required
                    InputLabelProps={{
                      required: true,
                      sx: {
                        '& .MuiInputLabel-asterisk': {
                          color: 'error.main',
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label='Character Realm'
                    value={adminFormData.characterRealm}
                    onChange={e =>
                      setAdminFormData({
                        ...adminFormData,
                        characterRealm: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                    required
                    InputLabelProps={{
                      required: true,
                      sx: {
                        '& .MuiInputLabel-asterisk': {
                          color: 'error.main',
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label='Discord Username'
                    value={adminFormData.discordUsername}
                    onChange={e =>
                      setAdminFormData({
                        ...adminFormData,
                        discordUsername: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                    required
                    InputLabelProps={{
                      required: true,
                      sx: {
                        '& .MuiInputLabel-asterisk': {
                          color: 'error.main',
                        },
                      },
                    }}
                  />
                </>
              ) : (
                <>
                  <Divider sx={{ my: { xs: 2, sm: 3 } }} />
                  <Typography
                    variant='h6'
                    sx={{
                      mb: { xs: 1.5, sm: 2 },
                      fontWeight: 600,
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                    }}
                  >
                    Quick Booking
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{
                      mb: { xs: 1.5, sm: 2 },
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    }}
                  >
                    Fill in the essential information to submit your booking
                    request. Times are shown in your local timezone (
                    {getTimezoneAbbreviation()}).
                  </Typography>
                  <TextField
                    fullWidth
                    label='Character Name'
                    value={quickBookingFormData.characterName}
                    onChange={e =>
                      setQuickBookingFormData({
                        ...quickBookingFormData,
                        characterName: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                    required
                    InputLabelProps={{
                      required: true,
                      sx: {
                        '& .MuiInputLabel-asterisk': {
                          color: 'error.main',
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label='Character Realm'
                    value={quickBookingFormData.characterRealm}
                    onChange={e =>
                      setQuickBookingFormData({
                        ...quickBookingFormData,
                        characterRealm: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                    required
                    InputLabelProps={{
                      required: true,
                      sx: {
                        '& .MuiInputLabel-asterisk': {
                          color: 'error.main',
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label='Discord Username'
                    value={quickBookingFormData.discordUsername}
                    onChange={e =>
                      setQuickBookingFormData({
                        ...quickBookingFormData,
                        discordUsername: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                    required
                    InputLabelProps={{
                      required: true,
                      sx: {
                        '& .MuiInputLabel-asterisk': {
                          color: 'error.main',
                        },
                      },
                    }}
                  />
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseTimeDialog}
            variant='outlined'
            disabled={isSubmitting}
          >
            Close
          </Button>
          {isAdminMode ? (
            <Button
              onClick={handleAdminSubmit}
              variant='contained'
              disabled={isSubmitting}
              sx={{
                background: `linear-gradient(135deg, ${
                  theme.palette.primary.main
                } 0%, ${
                  theme.palette.primary.dark || theme.palette.primary.main
                } 100%)`,
              }}
            >
              {isSubmitting ? 'Creating...' : 'Quick Add Booking'}
            </Button>
          ) : (
            <Button
              onClick={handleQuickBookingSubmit}
              variant='contained'
              disabled={isSubmitting}
              sx={{
                background: `linear-gradient(135deg, ${
                  theme.palette.primary.main
                } 0%, ${
                  theme.palette.primary.dark || theme.palette.primary.main
                } 100%)`,
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference='anchorPosition'
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        PaperProps={{
          sx: {
            minWidth: 200,
            borderRadius: 2,
          },
        }}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <Visibility fontSize='small' />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        {canCreateEvents && (
          <>
            <Divider />
            {isAdmin() && (
              <>
                <MenuItem
                  onClick={() =>
                    selectedEvent &&
                    handleUpdateStatus(
                      selectedEvent.extendedProps?.status === 'accepted'
                        ? 'approved'
                        : 'accepted'
                    )
                  }
                  disabled={updatingJobId === selectedEvent?.id}
                >
                  <ListItemIcon>
                    <CheckCircle fontSize='small' />
                  </ListItemIcon>
                  <ListItemText>
                    {selectedEvent?.extendedProps?.status === 'accepted'
                      ? 'Approve'
                      : 'Accept'}
                  </ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => handleUpdateStatus('completed')}
                  disabled={updatingJobId === selectedEvent?.id}
                >
                  <ListItemIcon>
                    <CheckCircle fontSize='small' color='success' />
                  </ListItemIcon>
                  <ListItemText>Mark as Completed</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => handleUpdateStatus('cancelled')}
                  disabled={updatingJobId === selectedEvent?.id}
                >
                  <ListItemIcon>
                    <Cancel fontSize='small' color='warning' />
                  </ListItemIcon>
                  <ListItemText>Cancel Job</ListItemText>
                </MenuItem>
                <Divider />
              </>
            )}
            <MenuItem
              onClick={handleDeleteJob}
              disabled={updatingJobId === selectedEvent?.id}
              sx={{
                color: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.light',
                  color: 'error.contrastText',
                },
              }}
            >
              <ListItemIcon>
                <Delete fontSize='small' sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText>Delete Job</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Snackbar */}
      <Snackbar
        key={snackbarKey}
        open={
          snackbar.open && !!snackbar.message && snackbar.message.trim() !== ''
        }
        autoHideDuration={6000}
        onClose={() => {
          // Only close the snackbar, keep the message until animation completes
          setSnackbar(prev => ({ ...prev, open: false }));
          // Clear the message after the close animation completes (typically ~300ms)
          setTimeout(() => {
            setSnackbar({ open: false, message: '', severity: 'success' });
          }, 300);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => {
            // Only close the snackbar, keep the message until animation completes
            setSnackbar(prev => ({ ...prev, open: false }));
            // Clear the message after the close animation completes (typically ~300ms)
            setTimeout(() => {
              setSnackbar({ open: false, message: '', severity: 'success' });
            }, 300);
          }}
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
