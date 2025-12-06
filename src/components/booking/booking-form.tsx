import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Paper,
  alpha,
  styled,
  InputAdornment,
  useTheme,
  CircularProgress,
  FormHelperText,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Send, Delete } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { API_BASE_URL } from '../../config/api';
import { getAuthToken } from '../../config/auth';
import { useUser } from '../../contexts/UserContext';
import {
  Class,
  getAvailableVersions,
  getClassesForVersion,
  getSpecsForClass,
  getClassColor,
  WowVersion,
} from '../../constants/wow-classes';

// LocalStorage keys
const SAVED_CHARACTERS_KEY = 'gladiatorGuru_savedCharacters';
const LAST_DISCORD_USERNAME_KEY = 'gladiatorGuru_lastDiscordUsername';
const LAST_SELECTED_CHARACTER_KEY = 'gladiatorGuru_lastSelectedCharacter';

// Interface for saved character
interface SavedCharacter {
  characterName: string;
  characterRealm: string;
  characterClass?: string;
  characterSpec?: string;
  version?: WowVersion;
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

const saveCharacter = (character: SavedCharacter): void => {
  try {
    const saved = getSavedCharacters();
    // Check if character already exists (case-insensitive)
    const exists = saved.some(
      c =>
        c.characterName.toLowerCase() ===
          character.characterName.toLowerCase() &&
        c.characterRealm.toLowerCase() ===
          character.characterRealm.toLowerCase()
    );
    if (!exists) {
      // Add new character to the beginning of the array
      const updated = [character, ...saved];
      // Limit to last 10 characters
      const limited = updated.slice(0, 10);
      localStorage.setItem(SAVED_CHARACTERS_KEY, JSON.stringify(limited));
    }
  } catch (error) {
    console.error('Error saving character:', error);
  }
};

const deleteCharacter = (index: number): void => {
  try {
    const saved = getSavedCharacters();
    const updated = saved.filter((_, i) => i !== index);
    localStorage.setItem(SAVED_CHARACTERS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting character:', error);
  }
};

// Utility functions for last selected character
const getLastSelectedCharacter = (): SavedCharacter | null => {
  try {
    const saved = localStorage.getItem(LAST_SELECTED_CHARACTER_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.error('Error loading last selected character:', error);
    return null;
  }
};

const setLastSelectedCharacter = (character: SavedCharacter): void => {
  try {
    localStorage.setItem(
      LAST_SELECTED_CHARACTER_KEY,
      JSON.stringify(character)
    );
  } catch (error) {
    console.error('Error saving last selected character:', error);
  }
};

// Utility functions for Discord username
const getLastDiscordUsername = (): string => {
  try {
    return localStorage.getItem(LAST_DISCORD_USERNAME_KEY) || '';
  } catch (error) {
    console.error('Error loading last Discord username:', error);
    return '';
  }
};

const saveLastDiscordUsername = (username: string): void => {
  try {
    if (username.trim()) {
      localStorage.setItem(LAST_DISCORD_USERNAME_KEY, username.trim());
    }
  } catch (error) {
    console.error('Error saving Discord username:', error);
  }
};

// Helper function to normalize class names to match file names
const normalizeClassName = (className: string): string => {
  return className.toLowerCase().replace(/\s+/g, '');
};

// Helper function to normalize spec names to match file names
const normalizeSpecName = (specName: string): string => {
  const normalized = specName.toLowerCase().replace(/\s+/g, '');
  // Handle special cases where file names differ from spec names
  const specNameMap: Record<string, string> = {
    marksmanship: 'marksman', // File is marksman.png
    beastmastery: 'beastmastery', // File is beastmastery.png
    feralcombat: 'feral', // MOP uses "Feral Combat" but file is feral.png
  };
  return specNameMap[normalized] || normalized;
};

// Helper function to capitalize first letter
const capitalizeFirst = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Get class image path
const getClassImagePath = (className: string): string => {
  const normalized = normalizeClassName(className);
  return `/class/64/${normalized}.png`;
};

// Get spec image path
const getSpecImagePath = (className: string, specName: string): string => {
  const normalizedClass = normalizeClassName(className);
  const normalizedSpec = normalizeSpecName(specName);
  return `/spec/${normalizedClass}/${normalizedSpec}.png`;
};

// Get version image path
const getVersionImagePath = (version: WowVersion): string => {
  const normalized = version.toLowerCase();
  return `/wow-versions/${normalized}.png`;
};

// Get version display name
const getVersionDisplayName = (
  version: WowVersion,
  includeComingSoon: boolean = false
): string => {
  const versionNames: Record<WowVersion, string> = {
    TBC: 'Burning Crusade',
    MOP: 'Mists of Pandaria',
  };
  const baseName = versionNames[version] || version;
  if (version === 'TBC' && includeComingSoon) {
    return `${baseName} (Coming soon)`;
  }
  return baseName;
};

// Discord logo path
const DISCORD_LOGO_PATH = '/discord.png';

// Styled MenuItem with image
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  '& img': {
    width: 32,
    height: 32,
    objectFit: 'contain',
  },
}));

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  paddingBottom: '10px',
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor:
    theme.palette.mode === 'light'
      ? alpha(theme.palette.background.default, 0.8)
      : alpha(theme.palette.background.default, 0.5),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

// Styled TextField with red required asterisk
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-asterisk': {
    color: theme.palette.error.main,
  },
  // Style calendar/time icons for date, time, and datetime-local inputs to match text.primary color
  '& input[type="date"]::-webkit-calendar-picker-indicator, & input[type="time"]::-webkit-calendar-picker-indicator, & input[type="datetime-local"]::-webkit-calendar-picker-indicator':
    {
      filter: `brightness(0) saturate(100%) invert(${
        theme.palette.mode === 'dark' ? '1' : '0'
      })`,
      cursor: 'pointer',
      opacity: 0.7,
    },
  '& input[type="date"]::-webkit-calendar-picker-indicator:hover, & input[type="time"]::-webkit-calendar-picker-indicator:hover, & input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover':
    {
      opacity: 1,
    },
  // Style date picker dropdown to match select menu style
  '& input[type="date"]': {
    '&::-webkit-datetime-edit': {
      color: theme.palette.text.primary,
    },
    '&::-webkit-datetime-edit-fields-wrapper': {
      color: theme.palette.text.primary,
    },
    '&::-webkit-datetime-edit-text': {
      color: theme.palette.text.secondary,
    },
    '&::-webkit-datetime-edit-year-field': {
      color: theme.palette.text.primary,
    },
    '&::-webkit-datetime-edit-month-field': {
      color: theme.palette.text.primary,
    },
    '&::-webkit-datetime-edit-day-field': {
      color: theme.palette.text.primary,
    },
  },
  // Style time picker dropdown to match select menu style
  '& input[type="time"]': {
    '&::-webkit-datetime-edit': {
      color: theme.palette.text.primary,
    },
    '&::-webkit-datetime-edit-fields-wrapper': {
      color: theme.palette.text.primary,
    },
    '&::-webkit-datetime-edit-text': {
      color: theme.palette.text.secondary,
    },
    '&::-webkit-datetime-edit-hour-field': {
      color: theme.palette.text.primary,
    },
    '&::-webkit-datetime-edit-minute-field': {
      color: theme.palette.text.primary,
    },
    '&::-webkit-datetime-edit-ampm-field': {
      color: theme.palette.text.primary,
    },
  },
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  background: theme.palette.text.primary,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${
    theme.palette.primary.dark || theme.palette.primary.main
  } 100%)`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
}));

interface BookingFormData {
  characterName: string;
  characterRealm: string;
  version: WowVersion | '';
  bracket: string;
  coaches: string;
  hours: string;
  characterClass: string;
  characterSpec: string;
  availabilityDate: string;
  availabilityStartTime: string;
  availabilityEndTime: string;
  discordUsername: string;
  goal: string;
}

export function BookingForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const [formData, setFormData] = useState<BookingFormData>({
    characterName: '',
    characterRealm: '',
    version: 'MOP',
    bracket: '',
    coaches: '1',
    hours: '1',
    characterClass: '',
    characterSpec: '',
    availabilityDate: '',
    availabilityStartTime: '',
    availabilityEndTime: '',
    discordUsername: user?.discordUsername || '',
    goal: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof BookingFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<{
    index: number;
    character: SavedCharacter;
  } | null>(null);

  // Calculate min and max dates for date input
  const getMinDate = (): string => {
    // Create a date at local midnight to ensure we get today's date correctly
    const now = new Date();
    // Create a new date at local midnight (00:00:00) to avoid any timezone issues
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    // Return in YYYY-MM-DD format which the date input expects
    return `${year}-${month}-${day}`;
  };

  const getMaxDate = (): string => {
    const now = new Date();
    const twoMonthsLater = new Date(now);
    twoMonthsLater.setMonth(now.getMonth() + 2);
    const year = twoMonthsLater.getFullYear();
    const month = String(twoMonthsLater.getMonth() + 1).padStart(2, '0');
    const day = String(twoMonthsLater.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Use state to ensure minDate is always current
  const [minDate, setMinDate] = useState(getMinDate());
  const maxDate = getMaxDate();

  // Update minDate if the date changes (e.g., at midnight)
  useEffect(() => {
    const updateMinDate = () => {
      setMinDate(getMinDate());
    };

    // Update immediately
    updateMinDate();

    // Set up interval to check every minute (in case date changes)
    const interval = setInterval(updateMinDate, 60000);

    return () => clearInterval(interval);
  }, []);

  // Load saved characters from localStorage and default to last selected
  useEffect(() => {
    const saved = getSavedCharacters();
    setSavedCharacters(saved);

    // Try to find and use the last selected character
    // This runs on mount, and fetchLastBooking (if user is logged in) will run after
    // and can override if the user has previous bookings
    if (saved.length > 0) {
      const lastSelected = getLastSelectedCharacter();
      let characterToUse: SavedCharacter | null = null;
      let characterIndex = 0;

      if (lastSelected) {
        // Try to find the last selected character in the saved list
        const foundIndex = saved.findIndex(
          c =>
            c.characterName.toLowerCase() ===
              lastSelected.characterName.toLowerCase() &&
            c.characterRealm.toLowerCase() ===
              lastSelected.characterRealm.toLowerCase()
        );
        if (foundIndex !== -1) {
          characterToUse = saved[foundIndex];
          characterIndex = foundIndex;
        }
      }

      // If no last selected character found, use the first one (most recent)
      if (!characterToUse) {
        characterToUse = saved[0];
        characterIndex = 0;
      }

      setSelectedCharacterId(String(characterIndex));
      setFormData(prev => {
        // Only set if fields are still empty (initial state)
        if (!prev.characterName && !prev.characterRealm) {
          return {
            ...prev,
            characterName: characterToUse!.characterName,
            characterRealm: characterToUse!.characterRealm,
            characterClass: characterToUse!.characterClass || '',
            characterSpec: characterToUse!.characterSpec || '',
            version: characterToUse!.version || prev.version,
          };
        }
        return prev;
      });
    }

    // Load last Discord username if user is not logged in
    // (Logged-in users get it from their profile)
    if (!user) {
      const lastDiscordUsername = getLastDiscordUsername();
      if (lastDiscordUsername) {
        setFormData(prev => {
          // Only set if field is still empty (initial state)
          if (!prev.discordUsername) {
            return {
              ...prev,
              discordUsername: lastDiscordUsername,
            };
          }
          return prev;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Handle delete confirmation
  const handleDeleteClick = (
    e: React.MouseEvent,
    index: number,
    character: SavedCharacter
  ) => {
    e.stopPropagation(); // Prevent selecting the character when clicking delete
    setCharacterToDelete({ index, character });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (characterToDelete) {
      deleteCharacter(characterToDelete.index);
      const updated = getSavedCharacters();
      setSavedCharacters(updated);
      // Clear selected character if it was deleted
      if (selectedCharacterId === `${characterToDelete.index}`) {
        setSelectedCharacterId('');
        setFormData(prev => ({
          ...prev,
          characterName: '',
          characterRealm: '',
          characterClass: '',
          characterSpec: '',
        }));
      } else if (parseInt(selectedCharacterId) > characterToDelete.index) {
        // Adjust selected index if a character before it was deleted
        setSelectedCharacterId(String(parseInt(selectedCharacterId) - 1));
      }
      setDeleteDialogOpen(false);
      setCharacterToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCharacterToDelete(null);
  };

  // Pre-fill Discord username when user data is available
  useEffect(() => {
    if (user?.discordUsername && !formData.discordUsername) {
      setFormData(prev => ({
        ...prev,
        discordUsername: user.discordUsername || '',
      }));
    }
  }, [user?.discordUsername, formData.discordUsername]);

  // Fetch and pre-fill last booking details
  useEffect(() => {
    const fetchLastBooking = async () => {
      if (!user) return;

      try {
        const token = getAuthToken();
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) return;

        const data = await response.json();
        const bookings = data.data || [];

        // Get the most recent booking
        if (bookings.length > 0) {
          const lastBooking = bookings[0]; // Already sorted by createdAt desc

          // Only pre-fill if fields are currently empty (or default for version)
          setFormData(prev => ({
            ...prev,
            characterName:
              prev.characterName || lastBooking.characterName || '',
            characterRealm:
              prev.characterRealm || lastBooking.characterRealm || '',
            characterClass:
              prev.characterClass || lastBooking.characterClass || '',
            characterSpec:
              prev.characterSpec || lastBooking.characterSpec || '',
            // Pre-fill version if it's still the default or if last booking has a version
            version: lastBooking.version
              ? (lastBooking.version as WowVersion)
              : prev.version,
          }));
        }
      } catch (error) {
        console.error('Error fetching last booking:', error);
        // Silently fail - don't block form usage
      }
    };

    fetchLastBooking();
  }, [user]);

  // Handle date pre-fill from calendar
  useEffect(() => {
    const dateParam = searchParams.get('date');
    const endDateParam = searchParams.get('endDate');
    const hoursParam = searchParams.get('hours');

    if (dateParam) {
      try {
        let date: Date;
        // If dateParam is already in YYYY-MM-DDTHH:mm format, parse it
        if (
          dateParam.includes('T') &&
          dateParam.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
        ) {
          date = new Date(dateParam);
        } else {
          date = new Date(dateParam);
        }

        // Extract date and start time
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        const startHours = String(date.getHours()).padStart(2, '0');
        const startMinutes = String(date.getMinutes()).padStart(2, '0');
        let startTime = `${startHours}:${startMinutes}`;

        // Use endDate from URL if provided, otherwise calculate 2 hours later
        let endTime: string;
        if (endDateParam) {
          let endDate: Date;
          if (
            endDateParam.includes('T') &&
            endDateParam.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
          ) {
            endDate = new Date(endDateParam);
          } else {
            endDate = new Date(endDateParam);
          }
          const endHours = String(endDate.getHours()).padStart(2, '0');
          const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
          endTime = `${endHours}:${endMinutes}`;
        } else {
          // Fallback: calculate end time as 2 hours later
          const calculatedEndDate = new Date(date);
          calculatedEndDate.setHours(calculatedEndDate.getHours() + 2);
          const endHours = String(calculatedEndDate.getHours()).padStart(
            2,
            '0'
          );
          const endMinutes = String(calculatedEndDate.getMinutes()).padStart(
            2,
            '0'
          );
          endTime = `${endHours}:${endMinutes}`;
        }

        // Round times to 15-minute intervals
        const roundTo15Minutes = (timeString: string): string => {
          if (!timeString) return timeString;
          const [hours, minutes] = timeString.split(':').map(Number);
          const totalMinutes = hours * 60 + minutes;
          const roundedMinutes = Math.round(totalMinutes / 15) * 15;
          const roundedHours = Math.floor(roundedMinutes / 60) % 24;
          const roundedMins = roundedMinutes % 60;
          return `${String(roundedHours).padStart(2, '0')}:${String(
            roundedMins
          ).padStart(2, '0')}`;
        };

        startTime = roundTo15Minutes(startTime);
        endTime = roundTo15Minutes(endTime);

        // Use hours from URL if provided and valid (1-5), otherwise leave empty
        const hours =
          hoursParam && ['1', '2', '3', '4', '5'].includes(hoursParam)
            ? hoursParam
            : '';

        setFormData(prev => ({
          ...prev,
          availabilityDate: formattedDate,
          availabilityStartTime: startTime,
          availabilityEndTime: endTime,
          hours: hours,
        }));
      } catch (error) {
        console.error('Error parsing date parameter:', error);
      }
    }
  }, [searchParams]);

  const theme = useTheme();

  // Inject styles for date and time picker dropdowns to match select menu style
  useEffect(() => {
    const styleId = 'date-time-picker-dropdown-styles';
    let existingStyle = document.getElementById(
      styleId
    ) as HTMLStyleElement | null;

    const primaryColor = theme.palette.primary.main;

    if (existingStyle) {
      // Update existing styles if theme changed
      existingStyle.textContent = `
        /* Global accent color for all form controls including date and time pickers */
        :root {
          accent-color: ${primaryColor};
        }
        
        /* Style date picker dropdown to match select menu */
        input[type="date"]::-webkit-calendar-picker-indicator {
          background-color: transparent;
          cursor: pointer;
        }
        
        /* Style the date picker popup/dropdown */
        input[type="date"]::-webkit-datetime-edit {
          color: ${theme.palette.text.primary};
        }
        
        input[type="date"]::-webkit-datetime-edit-fields-wrapper {
          background-color: transparent;
        }
        
        input[type="date"]::-webkit-datetime-edit-year-field:focus,
        input[type="date"]::-webkit-datetime-edit-month-field:focus,
        input[type="date"]::-webkit-datetime-edit-day-field:focus {
          background-color: ${alpha(primaryColor, 0.1)};
          color: ${primaryColor};
        }
        
        /* Set color scheme and accent color for date picker popup - affects native popup background and selected items */
        input[type="date"],
        input[type="date"]:focus,
        input[type="date"]:active {
          color-scheme: ${theme.palette.mode};
          accent-color: ${primaryColor};
        }
        
        /* Style time picker dropdown to match select menu */
        input[type="time"]::-webkit-calendar-picker-indicator {
          background-color: transparent;
          cursor: pointer;
        }
        
        /* Style the time picker popup/dropdown */
        input[type="time"]::-webkit-datetime-edit {
          color: ${theme.palette.text.primary};
        }
        
        input[type="time"]::-webkit-datetime-edit-fields-wrapper {
          background-color: transparent;
        }
        
        input[type="time"]::-webkit-datetime-edit-hour-field:focus,
        input[type="time"]::-webkit-datetime-edit-minute-field:focus {
          background-color: ${alpha(primaryColor, 0.1)};
          color: ${primaryColor};
        }
        
        /* Set color scheme and accent color for time picker popup - affects native popup background and selected items */
        input[type="time"],
        input[type="time"]:focus,
        input[type="time"]:active {
          color-scheme: ${theme.palette.mode};
          accent-color: ${primaryColor};
        }
        
        /* Apply accent color to body and html for global propagation */
        html, body {
          accent-color: ${primaryColor};
        }
      `;
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Global accent color for all form controls including date and time pickers */
      :root {
        accent-color: ${primaryColor};
      }
      
      /* Style date picker dropdown to match select menu */
      input[type="date"]::-webkit-calendar-picker-indicator {
        background-color: transparent;
        cursor: pointer;
      }
      
      /* Style the date picker popup/dropdown */
      input[type="date"]::-webkit-datetime-edit {
        color: ${theme.palette.text.primary};
      }
      
      input[type="date"]::-webkit-datetime-edit-fields-wrapper {
        background-color: transparent;
      }
      
      input[type="date"]::-webkit-datetime-edit-year-field:focus,
      input[type="date"]::-webkit-datetime-edit-month-field:focus,
      input[type="date"]::-webkit-datetime-edit-day-field:focus {
        background-color: ${alpha(primaryColor, 0.1)};
        color: ${primaryColor};
      }
      
      /* Set color scheme and accent color for date picker popup - affects native popup background and selected items */
      input[type="date"],
      input[type="date"]:focus,
      input[type="date"]:active {
        color-scheme: ${theme.palette.mode};
        accent-color: ${primaryColor};
      }
      
      /* Style time picker dropdown to match select menu */
      input[type="time"]::-webkit-calendar-picker-indicator {
        background-color: transparent;
        cursor: pointer;
      }
      
      /* Style the time picker popup/dropdown */
      input[type="time"]::-webkit-datetime-edit {
        color: ${theme.palette.text.primary};
      }
      
      input[type="time"]::-webkit-datetime-edit-fields-wrapper {
        background-color: transparent;
      }
      
      input[type="time"]::-webkit-datetime-edit-hour-field:focus,
      input[type="time"]::-webkit-datetime-edit-minute-field:focus {
        background-color: ${alpha(primaryColor, 0.1)};
        color: ${primaryColor};
      }
      
      /* Set color scheme and accent color for time picker popup - affects native popup background and selected items */
      input[type="time"],
      input[type="time"]:focus,
      input[type="time"]:active {
        color-scheme: ${theme.palette.mode};
        accent-color: ${primaryColor};
      }
      
      /* Apply accent color to body and html for global propagation */
      html, body {
        accent-color: ${primaryColor};
      }
    `;
    document.head.appendChild(style);

    // Also set accent-color directly on document elements
    document.documentElement.style.setProperty('accent-color', primaryColor);
    document.body.style.setProperty('accent-color', primaryColor);

    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
      // Clean up inline styles
      document.documentElement.style.removeProperty('accent-color');
      document.body.style.removeProperty('accent-color');
    };
  }, [theme]);
  const versions = getAvailableVersions();
  const availableClasses = formData.version
    ? getClassesForVersion(formData.version)
    : [];
  const availableSpecs =
    formData.version && formData.characterClass
      ? getSpecsForClass(formData.version, formData.characterClass)
      : [];

  // Adjust class color for better readability in light mode
  const getReadableClassColor = (className: string): string => {
    const baseColor = getClassColor(className);

    // In light mode, darken bright colors for better readability
    if (theme.palette.mode === 'light') {
      // Bright colors that need adjustment
      const brightColors: Record<string, string> = {
        Priest: '#000000', // White -> Black
        Rogue: '#B8860B', // Yellow -> Dark Goldenrod
        Paladin: '#C2185B', // Light Pink -> Darker Pink
        Monk: '#00CC7A', // Bright Green -> Darker Green
      };

      if (brightColors[className]) {
        return brightColors[className];
      }

      // For other bright colors, darken them slightly
      const hex = baseColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // If color is too bright (average RGB > 200), darken it
      const avg = (r + g + b) / 3;
      if (avg > 200) {
        const darkenFactor = 0.4;
        const newR = Math.floor(r * darkenFactor);
        const newG = Math.floor(g * darkenFactor);
        const newB = Math.floor(b * darkenFactor);
        return `#${newR.toString(16).padStart(2, '0')}${newG
          .toString(16)
          .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
      }
    }

    return baseColor;
  };

  // Calculate total price
  // Get discount for hours
  const getDiscount = (hours: number): number => {
    if (hours === 3) return 0.1; // 10% discount for 3 hours
    if (hours === 4) return 0.1; // 10% discount for 4 hours
    if (hours === 5) return 0.15; // 15% discount for 5 hours
    return 0;
  };

  const calculateTotalPrice = (): number => {
    if (!formData.hours) return 0;

    const coaches = parseInt(formData.coaches, 10) || 1;
    const hours = parseInt(formData.hours, 10) || 0;

    const pricePerHour = 30;
    const basePrice = pricePerHour * coaches * hours;
    const discount = getDiscount(hours);
    return basePrice * (1 - discount);
  };

  // Calculate price for a specific number of hours
  const calculatePriceForHours = (hours: number): number => {
    const coaches = parseInt(formData.coaches, 10) || 1;
    const pricePerHour = 30;
    const basePrice = pricePerHour * coaches * hours;
    const discount = getDiscount(hours);
    return basePrice * (1 - discount);
  };

  const totalPrice = calculateTotalPrice();

  // MenuProps for select dropdowns with white background in light mode
  const getMenuProps = () => ({
    PaperProps: {
      sx: {
        backgroundColor:
          theme.palette.mode === 'light'
            ? theme.palette.background.paper
            : undefined,
      },
    },
  });

  // Helper function to round time to 15-minute intervals
  const roundTo15Minutes = (timeString: string): string => {
    if (!timeString) return timeString;
    const [hours, minutes] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const roundedMinutes = Math.round(totalMinutes / 15) * 15;
    const roundedHours = Math.floor(roundedMinutes / 60) % 24;
    const roundedMins = roundedMinutes % 60;
    return `${String(roundedHours).padStart(2, '0')}:${String(
      roundedMins
    ).padStart(2, '0')}`;
  };

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1));

  // Generate minute options (only 15-minute intervals)
  const minuteOptions = ['00', '15', '30', '45'];

  // AM/PM options
  const amPmOptions = ['AM', 'PM'];

  // Helper to convert 24-hour format to 12-hour format with AM/PM
  const convert24To12 = (
    timeString: string
  ): { hour: string; minute: string; amPm: string } => {
    if (!timeString || !timeString.includes(':'))
      return { hour: '', minute: '00', amPm: 'AM' };
    const [hours, minutes] = timeString.split(':').map(Number);
    const minValue = minutes || 0;
    const roundedMin = Math.round(minValue / 15) * 15;

    let hour12 = hours % 12;
    if (hour12 === 0) hour12 = 12;
    const amPm = hours < 12 ? 'AM' : 'PM';

    return {
      hour: String(hour12),
      minute: String(roundedMin).padStart(2, '0'),
      amPm: amPm,
    };
  };

  // Helper to convert 12-hour format with AM/PM to 24-hour format
  const convert12To24 = (
    hour: string,
    minute: string,
    amPm: string
  ): string => {
    if (!hour) return '';
    let hour24 = parseInt(hour, 10);

    if (amPm === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (amPm === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    return `${String(hour24).padStart(2, '0')}:${minute.padStart(2, '0')}`;
  };

  // Helper to parse time string into hours, minutes, and AM/PM (for 12-hour display)
  const parseTime = (
    timeString: string
  ): { hour: string; minute: string; amPm: string } => {
    return convert24To12(timeString);
  };

  // Helper to combine hour, minute, and AM/PM into 24-hour time string (for storage)
  const combineTime = (hour: string, minute: string, amPm: string): string => {
    return convert12To24(hour, minute, amPm);
  };

  // Handle time field changes for custom time picker
  const handleTimeChange =
    (field: 'availabilityStartTime' | 'availabilityEndTime') =>
    (type: 'hour' | 'minute' | 'amPm') =>
    (event: any) => {
      const currentTime = formData[field];
      const { hour, minute, amPm } = parseTime(currentTime || '00:00');

      let newValue: string;
      if (type === 'hour') {
        newValue = combineTime(
          event.target.value,
          minute || '00',
          amPm || 'AM'
        );
      } else if (type === 'minute') {
        newValue = combineTime(hour || '1', event.target.value, amPm || 'AM');
      } else {
        // amPm
        newValue = combineTime(hour || '1', minute || '00', event.target.value);
      }

      setFormData(prev => {
        const newData = { ...prev, [field]: newValue };

        // If start time changes and end time is before or equal to start, update end time
        if (
          field === 'availabilityStartTime' &&
          newValue &&
          newData.availabilityDate
        ) {
          const [startHours, startMinutes] = newValue.split(':').map(Number);
          const [endHours, endMinutes] = (
            newData.availabilityEndTime || '00:00'
          )
            .split(':')
            .map(Number);

          const startTotalMinutes = startHours * 60 + startMinutes;
          const endTotalMinutes = endHours * 60 + endMinutes;

          if (
            !newData.availabilityEndTime ||
            endTotalMinutes <= startTotalMinutes
          ) {
            const newEndTotalMinutes = startTotalMinutes + 120; // Add 2 hours
            const roundedEndMinutes = Math.round(newEndTotalMinutes / 15) * 15;
            const newEndHours = Math.floor(roundedEndMinutes / 60) % 24;
            const newEndMins = roundedEndMinutes % 60;
            newData.availabilityEndTime = `${String(newEndHours).padStart(
              2,
              '0'
            )}:${String(newEndMins).padStart(2, '0')}`;
          }
        }

        return newData;
      });

      // Clear error for this field
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

  const handleChange =
    (field: keyof BookingFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setFormData(prev => {
        const newData = { ...prev, [field]: value };

        // Reset dependent fields when version or class changes
        if (field === 'version') {
          newData.characterClass = '';
          newData.characterSpec = '';
        } else if (field === 'characterClass') {
          newData.characterSpec = '';
        } else if (field === 'bracket') {
          // If bracket is 2v2, limit coaches to 1
          if (value === '2v2' && newData.coaches === '2') {
            newData.coaches = '1';
          }
        }

        // If start time changes and end time is before or equal to start, update end time
        if (
          field === 'availabilityStartTime' &&
          value &&
          newData.availabilityDate
        ) {
          const [startHours, startMinutes] = value.split(':').map(Number);
          const [endHours, endMinutes] = (
            newData.availabilityEndTime || '00:00'
          )
            .split(':')
            .map(Number);

          const startTotalMinutes = startHours * 60 + startMinutes;
          const endTotalMinutes = endHours * 60 + endMinutes;

          if (
            !newData.availabilityEndTime ||
            endTotalMinutes <= startTotalMinutes
          ) {
            const newEndTotalMinutes = startTotalMinutes + 120; // Add 2 hours (already a multiple of 15)
            // Round to 15-minute intervals just to be safe
            const roundedEndMinutes = Math.round(newEndTotalMinutes / 15) * 15;
            const newEndHours = Math.floor(roundedEndMinutes / 60) % 24;
            const newEndMins = roundedEndMinutes % 60;
            newData.availabilityEndTime = `${String(newEndHours).padStart(
              2,
              '0'
            )}:${String(newEndMins).padStart(2, '0')}`;
          } else {
            // Round existing end time to 15-minute intervals
            newData.availabilityEndTime = roundTo15Minutes(
              newData.availabilityEndTime
            );
          }
        }

        return newData;
      });

      // Clear error for this field
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BookingFormData, string>> = {};

    if (!formData.characterName.trim()) {
      newErrors.characterName = 'Character name is required';
    }

    if (!formData.characterRealm.trim()) {
      newErrors.characterRealm = 'Character realm is required';
    }

    if (!formData.version) {
      newErrors.version = 'Version is required';
    }

    if (!formData.hours) {
      newErrors.hours = 'Hours is required';
    }

    if (!formData.availabilityDate) {
      newErrors.availabilityDate = 'Date is required';
    } else {
      // Parse date string (YYYY-MM-DD) in local timezone to avoid UTC conversion issues
      const [year, month, day] = formData.availabilityDate
        .split('-')
        .map(Number);
      const selectedDate = new Date(year, month - 1, day);

      // Get today's date at local midnight
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Calculate two months from today
      const twoMonthsLater = new Date(today);
      twoMonthsLater.setMonth(today.getMonth() + 2);

      if (selectedDate < today) {
        newErrors.availabilityDate = 'Date cannot be in the past';
      } else if (selectedDate > twoMonthsLater) {
        newErrors.availabilityDate =
          'Date cannot be more than 2 months in advance';
      } else if (
        selectedDate.getTime() === today.getTime() &&
        formData.availabilityStartTime
      ) {
        // If date is today, check if start time is in the past
        const [startHours, startMinutes] = formData.availabilityStartTime
          .split(':')
          .map(Number);
        const currentHours = new Date().getHours();
        const currentMinutes = new Date().getMinutes();
        const startTotalMinutes = startHours * 60 + startMinutes;
        const currentTotalMinutes = currentHours * 60 + currentMinutes;

        if (startTotalMinutes < currentTotalMinutes) {
          newErrors.availabilityStartTime = 'Start time cannot be in the past';
        }
      }
    }

    if (!formData.availabilityStartTime) {
      newErrors.availabilityStartTime = 'Start time is required';
    }

    if (!formData.availabilityEndTime) {
      newErrors.availabilityEndTime = 'End time is required';
    } else if (formData.availabilityStartTime) {
      // Check if end time is after start time
      // If end time is less than start time, it's assumed to be the next day (e.g., 11pm to 1am)
      const [startHours, startMinutes] = formData.availabilityStartTime
        .split(':')
        .map(Number);
      const [endHours, endMinutes] = formData.availabilityEndTime
        .split(':')
        .map(Number);

      const startTotalMinutes = startHours * 60 + startMinutes;
      let endTotalMinutes = endHours * 60 + endMinutes;

      // If end time is less than start time, assume it's the next day
      if (endTotalMinutes <= startTotalMinutes) {
        endTotalMinutes += 24 * 60; // Add 24 hours
      }

      // End time should be at least some minutes after start time
      // (Allow same time or very close times to be caught by minimum duration check)
      if (endTotalMinutes <= startTotalMinutes) {
        newErrors.availabilityEndTime = 'End time must be after start time';
      }
    }

    if (!formData.discordUsername.trim()) {
      newErrors.discordUsername = 'Discord username is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and times into datetime strings
      // Parse the local date and time, then convert to ISO string (UTC)
      // This ensures the time is stored in UTC but represents the user's local time
      const startTime = formData.availabilityStartTime.includes(':')
        ? formData.availabilityStartTime
        : `${formData.availabilityStartTime}:00`;
      const endTime = formData.availabilityEndTime.includes(':')
        ? formData.availabilityEndTime
        : `${formData.availabilityEndTime}:00`;

      // Create Date objects from local date/time (this interprets as local timezone)
      const [year, month, day] = formData.availabilityDate
        .split('-')
        .map(Number);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      // Create Date objects in local timezone, then convert to ISO string (UTC)
      const startDateLocal = new Date(
        year,
        month - 1,
        day,
        startHours,
        startMinutes
      );

      // If end time is less than start time, assume it's the next day
      let endDateLocal = new Date(year, month - 1, day, endHours, endMinutes);
      if (endDateLocal <= startDateLocal) {
        // Add one day to end date
        endDateLocal = new Date(endDateLocal);
        endDateLocal.setDate(endDateLocal.getDate() + 1);
      }

      // Convert to ISO string (UTC) - this preserves the actual moment in time
      const availabilityStartDateTime = startDateLocal.toISOString();
      const availabilityEndDateTime = endDateLocal.toISOString();

      // Combine bracket and coaches into the format the backend expects (e.g., "3v3-2")
      const bracketValue =
        formData.bracket && formData.coaches
          ? `${formData.bracket}-${formData.coaches}`
          : formData.bracket || '';

      const submitData = {
        characterName: formData.characterName.trim(),
        characterRealm: formData.characterRealm.trim(),
        version: formData.version,
        bracket: bracketValue,
        hours: formData.hours,
        characterClass: formData.characterClass,
        characterSpec: formData.characterSpec,
        availabilityStartDateTime,
        availabilityEndDateTime,
        discordUsername: formData.discordUsername.trim(),
        goal: formData.goal?.trim() || '',
      };

      console.log('Submitting data:', submitData);

      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Include auth token if available (for linking booking to user)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${API_BASE_URL}/api/jobs`;
      console.log('Making request to:', url);
      console.log('API_BASE_URL:', API_BASE_URL);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      console.log('Response status:', response.status, response.statusText);
      console.log('Response URL:', response.url);

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to submit booking request';
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.errorMessage || errorData.message || errorMessage;
          console.error('API Error:', errorData);
        } catch (e) {
          console.error(
            'Failed to parse error response. Status:',
            response.status,
            response.statusText
          );
          // Try to get response text
          try {
            const errorText = await response.text();
            console.error('Error response text:', errorText);
            if (errorText) {
              errorMessage = errorText;
            }
          } catch (textError) {
            console.error('Could not read error response text');
          }
        }
        throw new Error(errorMessage);
      }

      // Save character to localStorage
      saveCharacter({
        characterName: formData.characterName.trim(),
        characterRealm: formData.characterRealm.trim(),
        characterClass: formData.characterClass || undefined,
        characterSpec: formData.characterSpec || undefined,
        version: formData.version || undefined,
      });

      // Save Discord username to localStorage
      saveLastDiscordUsername(formData.discordUsername);

      // Navigate to success page
      navigate(ROUTE_PATHS.bookingSuccess);
    } catch (error: any) {
      console.error('Error submitting booking:', error);
      const errorMessage =
        error.message || 'Failed to submit booking request. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth='md' sx={{ pb: 4 }}>
      <FormPaper elevation={3}>
        <FormTitle
          variant='h2'
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          Book your Coaching Session
        </FormTitle>
        <Box sx={{ mb: 2 }}>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 700,
              fontSize: '1.25rem',
              color: 'primary.main',
              mb: 0.5,
            }}
          >
            $30/hr per coach
          </Typography>
          {totalPrice > 0 && (
            <Typography
              variant='h5'
              sx={{
                fontWeight: 700,
                fontSize: '1.5rem',
                color: 'primary.main',
              }}
            >
              Total: ${totalPrice}
            </Typography>
          )}
        </Box>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
          Fill out the form below to request a coaching session. We'll contact
          you via Discord to confirm details.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid
            container
            spacing={2}
            sx={{
              '& > .MuiGrid-item': {
                paddingTop: 0,
              },
            }}
          >
            {/* Game Version */}
            <Grid item xs={12}>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                🎮 Game Version
              </Typography>
              <StyledTextField
                fullWidth
                select
                label='Game Version'
                value={formData.version}
                onChange={handleChange('version')}
                error={!!errors.version}
                helperText={errors.version}
                required
                SelectProps={{
                  native: false,
                  MenuProps: getMenuProps(),
                  renderValue: value => {
                    if (!value) return '';
                    const version = value as WowVersion;
                    return (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <img
                          src={getVersionImagePath(version)}
                          alt={getVersionDisplayName(version)}
                          style={{
                            width: 24,
                            height: 24,
                            objectFit: 'contain',
                          }}
                          onError={e => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <Typography>
                          {getVersionDisplayName(version)}
                        </Typography>
                      </Box>
                    );
                  },
                }}
              >
                {versions.map((version: WowVersion) => (
                  <StyledMenuItem
                    key={version}
                    value={version}
                    disabled={version === 'TBC'}
                    sx={
                      version === 'TBC'
                        ? {
                            opacity: 0.5,
                            cursor: 'not-allowed',
                            '&.Mui-disabled': {
                              opacity: 0.5,
                            },
                          }
                        : {}
                    }
                  >
                    <img
                      src={getVersionImagePath(version)}
                      alt={getVersionDisplayName(version)}
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <Typography>
                      {getVersionDisplayName(version, true)}
                    </Typography>
                  </StyledMenuItem>
                ))}
              </StyledTextField>
            </Grid>

            {/* Character Information */}
            <Grid item xs={12}>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  mb: 1,
                  mt: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                ⚔️ Character Information
              </Typography>
            </Grid>
            {/* Saved Characters Dropdown */}
            {savedCharacters.length > 0 && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Select
                    value={selectedCharacterId}
                    onChange={e => {
                      const id = e.target.value;
                      setSelectedCharacterId(id);
                      if (id && id !== '') {
                        const index = parseInt(id, 10);
                        const character = savedCharacters[index];
                        if (character) {
                          // Save as last selected character
                          setLastSelectedCharacter(character);
                          setFormData(prev => ({
                            ...prev,
                            characterName: character.characterName,
                            characterRealm: character.characterRealm,
                            characterClass: character.characterClass || '',
                            characterSpec: character.characterSpec || '',
                            version: (character.version ||
                              prev.version) as WowVersion,
                          }));
                          // Clear errors for these fields
                          setErrors(prev => ({
                            ...prev,
                            characterName: undefined,
                            characterRealm: undefined,
                            characterClass: undefined,
                            characterSpec: undefined,
                            version: undefined,
                          }));
                        }
                      } else {
                        // Clear form when "empty" is selected
                        setFormData(prev => ({
                          ...prev,
                          characterName: '',
                          characterRealm: '',
                          characterClass: '',
                          characterSpec: '',
                        }));
                      }
                    }}
                    displayEmpty
                    MenuProps={getMenuProps()}
                    sx={{
                      backgroundColor:
                        theme.palette.mode === 'light'
                          ? theme.palette.background.paper
                          : undefined,
                    }}
                    renderValue={value => {
                      if (!value || value === '') return '';
                      const index = parseInt(value, 10);
                      if (
                        isNaN(index) ||
                        index < 0 ||
                        index >= savedCharacters.length
                      )
                        return '';
                      const character = savedCharacters[index];
                      if (!character) return '';
                      const classColor = character.characterClass
                        ? getReadableClassColor(character.characterClass)
                        : undefined;
                      return (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {character.characterClass && (
                            <>
                              <img
                                src={getClassImagePath(
                                  character.characterClass
                                )}
                                alt={character.characterClass}
                                style={{
                                  width: 28,
                                  height: 28,
                                  objectFit: 'contain',
                                }}
                                onError={e => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              {character.characterSpec && (
                                <img
                                  src={getSpecImagePath(
                                    character.characterClass,
                                    character.characterSpec
                                  )}
                                  alt={character.characterSpec}
                                  style={{
                                    width: 28,
                                    height: 28,
                                    objectFit: 'contain',
                                  }}
                                  onError={e => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                            </>
                          )}
                          <Typography
                            sx={{
                              color: classColor || 'text.primary',
                              fontWeight: 500,
                            }}
                          >
                            {capitalizeFirst(character.characterName)} -{' '}
                            {capitalizeFirst(character.characterRealm)}
                          </Typography>
                        </Box>
                      );
                    }}
                  >
                    {savedCharacters.map((character, index) => {
                      const classColor = character.characterClass
                        ? getReadableClassColor(character.characterClass)
                        : undefined;
                      return (
                        <MenuItem
                          key={index}
                          value={`${index}`}
                          onClick={() => {
                            // Always repopulate the form when a character is clicked,
                            // even if it's the same one that's already selected
                            setSelectedCharacterId(`${index}`);
                            // Save as last selected character
                            setLastSelectedCharacter(character);
                            setFormData(prev => ({
                              ...prev,
                              characterName: character.characterName,
                              characterRealm: character.characterRealm,
                              characterClass: character.characterClass || '',
                              characterSpec: character.characterSpec || '',
                              version: (character.version ||
                                prev.version) as WowVersion,
                            }));
                            // Clear errors for these fields
                            setErrors(prev => ({
                              ...prev,
                              characterName: undefined,
                              characterRealm: undefined,
                              characterClass: undefined,
                              characterSpec: undefined,
                              version: undefined,
                            }));
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            py: 1.5,
                            '&:hover': {
                              backgroundColor: classColor
                                ? alpha(classColor, 0.1)
                                : undefined,
                            },
                          }}
                        >
                          {character.characterClass && (
                            <>
                              <img
                                src={getClassImagePath(
                                  character.characterClass
                                )}
                                alt={character.characterClass}
                                style={{
                                  width: 32,
                                  height: 32,
                                  objectFit: 'contain',
                                }}
                                onError={e => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              {character.characterSpec && (
                                <img
                                  src={getSpecImagePath(
                                    character.characterClass,
                                    character.characterSpec
                                  )}
                                  alt={character.characterSpec}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    objectFit: 'contain',
                                  }}
                                  onError={e => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                            </>
                          )}
                          <Box
                            sx={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                            <Typography
                              sx={{
                                color: classColor || 'text.primary',
                                fontWeight: 600,
                              }}
                            >
                              {capitalizeFirst(character.characterName)} -{' '}
                              {capitalizeFirst(character.characterRealm)}
                            </Typography>
                            {character.characterClass && (
                              <Typography
                                variant='caption'
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {character.characterClass}
                                {character.characterSpec &&
                                  ` - ${character.characterSpec}`}
                              </Typography>
                            )}
                          </Box>
                          <IconButton
                            size='small'
                            onClick={e =>
                              handleDeleteClick(e, index, character)
                            }
                            sx={{
                              color: 'error.main',
                              '&:hover': {
                                backgroundColor: alpha(
                                  theme.palette.error.main,
                                  0.1
                                ),
                              },
                            }}
                          >
                            <Delete fontSize='small' />
                          </IconButton>
                        </MenuItem>
                      );
                    })}
                  </Select>
                  <FormHelperText sx={{ mb: 2 }}>
                    Select a character you've used before, or enter a new one
                    below
                  </FormHelperText>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sx={{ pt: savedCharacters.length > 0 ? 1 : 0 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label='Character Name'
                    value={formData.characterName}
                    onChange={e => {
                      handleChange('characterName')(
                        e as React.ChangeEvent<HTMLInputElement>
                      );
                      // Clear selected character when user types manually
                      if (selectedCharacterId) {
                        setSelectedCharacterId('');
                      }
                    }}
                    error={!!errors.characterName}
                    helperText={errors.characterName}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label='Character Realm'
                    value={formData.characterRealm}
                    onChange={e => {
                      handleChange('characterRealm')(
                        e as React.ChangeEvent<HTMLInputElement>
                      );
                      // Clear selected character when user types manually
                      if (selectedCharacterId) {
                        setSelectedCharacterId('');
                      }
                    }}
                    error={!!errors.characterRealm}
                    helperText={errors.characterRealm}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Discord Username */}
            <Grid item xs={12}>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  mb: 2,
                  mt: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                💬 Discord Username
              </Typography>
              <StyledTextField
                fullWidth
                label='Discord Username'
                value={formData.discordUsername}
                onChange={handleChange('discordUsername')}
                error={!!errors.discordUsername}
                helperText={errors.discordUsername}
                required
                placeholder='Discord username'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <img
                        src={DISCORD_LOGO_PATH}
                        alt='Discord'
                        style={{
                          width: 24,
                          height: 24,
                          objectFit: 'contain',
                        }}
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
              {!errors.discordUsername && (
                <Box
                  sx={{
                    mt: 1,
                    ml: 0,
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <img
                    src={
                      theme.palette.mode === 'light'
                        ? '/discord-username-light.png'
                        : '/discord-username-dark.png'
                    }
                    alt='Discord username location guide'
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      maxHeight: 100,
                      objectFit: 'contain',
                    }}
                    onError={e => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </Box>
              )}
            </Grid>

            {/* When do you want coaching? */}
            <Grid item xs={12}>
              <Box>
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    mb: 1,
                    mt: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  📅 When do you want coaching?
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 2 }}
                >
                  Pick any day you're available
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <StyledTextField
                    fullWidth
                    type='date'
                    label='Date'
                    value={formData.availabilityDate}
                    onChange={handleChange('availabilityDate')}
                    error={!!errors.availabilityDate}
                    helperText={
                      errors.availabilityDate ||
                      'Choose a date for your coaching session'
                    }
                    required
                    inputProps={{
                      min: minDate,
                      max: maxDate,
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    FormHelperTextProps={{
                      sx: { marginLeft: 0 },
                    }}
                  />
                  <Button
                    variant='text'
                    onClick={() => {
                      const today = getMinDate();
                      handleChange('availabilityDate')({
                        target: { value: today },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    sx={{
                      mt: 1,
                      textTransform: 'none',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    Today
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* What times are you available that day? */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    mb: 1,
                    mt: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  ⏰ What times are you available that day?
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 2 }}
                >
                  Tell us your general availability - we'll schedule within this
                  window.
                </Typography>
                <Grid container spacing={2} alignItems='flex-start'>
                  <Grid item xs={12} sm={5}>
                    <InputLabel
                      required
                      sx={{
                        mb: 1,
                        '& .MuiInputLabel-asterisk': {
                          color: 'error.main',
                        },
                      }}
                    >
                      From
                    </InputLabel>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <FormControl
                          fullWidth
                          error={!!errors.availabilityStartTime}
                        >
                          <Select
                            value={
                              parseTime(formData.availabilityStartTime).hour ||
                              ''
                            }
                            onChange={handleTimeChange('availabilityStartTime')(
                              'hour'
                            )}
                            displayEmpty
                            MenuProps={getMenuProps()}
                            sx={{
                              backgroundColor:
                                theme.palette.mode === 'light'
                                  ? theme.palette.background.paper
                                  : undefined,
                            }}
                          >
                            <MenuItem value='' disabled>
                              Hour
                            </MenuItem>
                            {hourOptions.map(hour => (
                              <MenuItem key={hour} value={hour}>
                                {hour}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4}>
                        <FormControl
                          fullWidth
                          error={!!errors.availabilityStartTime}
                        >
                          <Select
                            value={
                              parseTime(formData.availabilityStartTime)
                                .minute || '00'
                            }
                            onChange={handleTimeChange('availabilityStartTime')(
                              'minute'
                            )}
                            MenuProps={getMenuProps()}
                            sx={{
                              backgroundColor:
                                theme.palette.mode === 'light'
                                  ? theme.palette.background.paper
                                  : undefined,
                            }}
                          >
                            {minuteOptions.map(minute => (
                              <MenuItem key={minute} value={minute}>
                                {minute}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4}>
                        <FormControl
                          fullWidth
                          error={!!errors.availabilityStartTime}
                        >
                          <Select
                            value={
                              parseTime(formData.availabilityStartTime).amPm ||
                              'AM'
                            }
                            onChange={handleTimeChange('availabilityStartTime')(
                              'amPm'
                            )}
                            MenuProps={getMenuProps()}
                            sx={{
                              backgroundColor:
                                theme.palette.mode === 'light'
                                  ? theme.palette.background.paper
                                  : undefined,
                            }}
                          >
                            {amPmOptions.map(amPm => (
                              <MenuItem key={amPm} value={amPm}>
                                {amPm}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    {errors.availabilityStartTime && (
                      <FormHelperText error sx={{ mt: 0.5 }}>
                        {errors.availabilityStartTime}
                      </FormHelperText>
                    )}
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={1}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant='body1'
                      sx={{
                        textAlign: 'center',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        mt: 4,
                      }}
                    >
                      to
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <InputLabel
                      required
                      sx={{
                        mb: 1,
                        '& .MuiInputLabel-asterisk': {
                          color: 'error.main',
                        },
                      }}
                    >
                      To
                    </InputLabel>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <FormControl
                          fullWidth
                          error={!!errors.availabilityEndTime}
                        >
                          <Select
                            value={
                              parseTime(formData.availabilityEndTime).hour || ''
                            }
                            onChange={handleTimeChange('availabilityEndTime')(
                              'hour'
                            )}
                            displayEmpty
                            MenuProps={getMenuProps()}
                            sx={{
                              backgroundColor:
                                theme.palette.mode === 'light'
                                  ? theme.palette.background.paper
                                  : undefined,
                            }}
                          >
                            <MenuItem value='' disabled>
                              Hour
                            </MenuItem>
                            {hourOptions.map(hour => (
                              <MenuItem key={hour} value={hour}>
                                {hour}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4}>
                        <FormControl
                          fullWidth
                          error={!!errors.availabilityEndTime}
                        >
                          <Select
                            value={
                              parseTime(formData.availabilityEndTime).minute ||
                              '00'
                            }
                            onChange={handleTimeChange('availabilityEndTime')(
                              'minute'
                            )}
                            MenuProps={getMenuProps()}
                            sx={{
                              backgroundColor:
                                theme.palette.mode === 'light'
                                  ? theme.palette.background.paper
                                  : undefined,
                            }}
                          >
                            {minuteOptions.map(minute => (
                              <MenuItem key={minute} value={minute}>
                                {minute}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4}>
                        <FormControl
                          fullWidth
                          error={!!errors.availabilityEndTime}
                        >
                          <Select
                            value={
                              parseTime(formData.availabilityEndTime).amPm ||
                              'AM'
                            }
                            onChange={handleTimeChange('availabilityEndTime')(
                              'amPm'
                            )}
                            MenuProps={getMenuProps()}
                            sx={{
                              backgroundColor:
                                theme.palette.mode === 'light'
                                  ? theme.palette.background.paper
                                  : undefined,
                            }}
                          >
                            {amPmOptions.map(amPm => (
                              <MenuItem key={amPm} value={amPm}>
                                {amPm}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    {errors.availabilityEndTime && (
                      <FormHelperText error sx={{ mt: 0.5 }}>
                        {errors.availabilityEndTime}
                      </FormHelperText>
                    )}
                  </Grid>
                </Grid>
                {!errors.availabilityStartTime &&
                  !errors.availabilityEndTime && (
                    <FormHelperText sx={{ mt: 1, alignSelf: 'flex-start' }}>
                      Example: If you're free 12:00 PM - 5:00 PM, enter those
                      times.
                    </FormHelperText>
                  )}
              </Box>
            </Grid>

            {/* How many hours do you want? */}
            <Grid item xs={12} sm={6}>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  mb: 1,
                  mt: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                ⏱️ How many hours do you want?
              </Typography>
              <ToggleButtonGroup
                orientation='vertical'
                value={formData.hours}
                exclusive
                onChange={(_, newValue) => {
                  if (newValue !== null) {
                    handleChange('hours')({
                      target: { value: newValue },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }
                }}
                fullWidth
                sx={{
                  '& .MuiToggleButtonGroup-grouped': {
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                    padding: theme.spacing(1.5, 2),
                    justifyContent: 'space-between',
                    textTransform: 'none',
                    '&:not(:first-of-type)': {
                      marginTop: 1,
                      borderTop: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.3
                      )}`,
                    },
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      borderColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      },
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                  },
                }}
              >
                {[1, 2, 3, 4, 5].map(hours => {
                  const isSelected = formData.hours === String(hours);
                  const price = calculatePriceForHours(hours);
                  const discount = getDiscount(hours);
                  const hasDiscount = discount > 0;
                  return (
                    <ToggleButton
                      key={hours}
                      value={String(hours)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          border: `2px solid ${
                            isSelected
                              ? theme.palette.primary.main
                              : alpha(theme.palette.text.secondary, 0.5)
                          }`,
                          backgroundColor: isSelected
                            ? theme.palette.primary.main
                            : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor:
                                theme.palette.primary.contrastText,
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ flex: 1, textAlign: 'left' }}>
                        <Typography>
                          {hours} Hour Session
                          {hasDiscount && (
                            <Typography
                              component='span'
                              sx={{
                                ml: 1,
                                fontSize: '0.875rem',
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                              }}
                            >
                              ({Math.round(discount * 100)}% discount)
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                        }}
                      >
                        ${Math.round(price)}
                      </Typography>
                    </ToggleButton>
                  );
                })}
              </ToggleButtonGroup>
              {errors.hours && (
                <FormHelperText error sx={{ mt: 1 }}>
                  {errors.hours}
                </FormHelperText>
              )}
              {!errors.hours && (
                <FormHelperText sx={{ mt: 1 }}>
                  Choose your session length
                </FormHelperText>
              )}
            </Grid>

            {/* Character Class & Spec */}
            <Grid item xs={12}>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  mb: 1,
                  mt: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                🛡️ Character Class & Spec (Optional)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                select
                label='Character Class (Optional)'
                value={formData.characterClass}
                onChange={handleChange('characterClass')}
                error={!!errors.characterClass}
                helperText={errors.characterClass}
                disabled={!formData.version}
                SelectProps={{
                  native: false,
                  MenuProps: getMenuProps(),
                  renderValue: value => {
                    if (!value) return '';
                    const className = value as string;
                    return (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <img
                          src={getClassImagePath(className)}
                          alt={className}
                          style={{
                            width: 24,
                            height: 24,
                            objectFit: 'contain',
                          }}
                          onError={e => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <Typography
                          sx={{ color: getReadableClassColor(className) }}
                        >
                          {className}
                        </Typography>
                      </Box>
                    );
                  },
                }}
              >
                {!formData.version ? (
                  <MenuItem value='' disabled>
                    Select a version first
                  </MenuItem>
                ) : (
                  availableClasses.map((classData: Class) => (
                    <StyledMenuItem key={classData.name} value={classData.name}>
                      <img
                        src={getClassImagePath(classData.name)}
                        alt={classData.name}
                        onError={e => {
                          // Fallback if image doesn't exist
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <Typography
                        sx={{ color: getReadableClassColor(classData.name) }}
                      >
                        {classData.name}
                      </Typography>
                    </StyledMenuItem>
                  ))
                )}
              </StyledTextField>
              {!formData.version && !errors.characterClass && (
                <FormHelperText sx={{ pl: '5px' }}>
                  Select a version first
                </FormHelperText>
              )}
            </Grid>

            {/* Character Spec */}
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                select
                label='Character Spec (Optional)'
                value={formData.characterSpec}
                onChange={handleChange('characterSpec')}
                error={!!errors.characterSpec}
                helperText={errors.characterSpec}
                disabled={!formData.characterClass}
                SelectProps={{
                  native: false,
                  MenuProps: getMenuProps(),
                  renderValue: value => {
                    if (!value || !formData.characterClass) return '';
                    return (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <img
                          src={getSpecImagePath(
                            formData.characterClass,
                            value as string
                          )}
                          alt={value as string}
                          style={{
                            width: 24,
                            height: 24,
                            objectFit: 'contain',
                          }}
                          onError={e => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <Typography>{value as string}</Typography>
                      </Box>
                    );
                  },
                }}
              >
                {!formData.characterClass ? (
                  <MenuItem value='' disabled>
                    Select a class first
                  </MenuItem>
                ) : (
                  availableSpecs.map((spec: string) => (
                    <StyledMenuItem key={spec} value={spec}>
                      <img
                        src={getSpecImagePath(formData.characterClass, spec)}
                        alt={spec}
                        onError={e => {
                          // Fallback if image doesn't exist
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <Typography>{spec}</Typography>
                    </StyledMenuItem>
                  ))
                )}
              </StyledTextField>
              {!formData.characterClass && !errors.characterSpec && (
                <FormHelperText sx={{ pl: '5px' }}>
                  Select a class first
                </FormHelperText>
              )}
            </Grid>

            {/* Bracket */}
            <Grid item xs={12} sm={6}>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  mb: 1,
                  mt: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                🏆 Bracket (Optional)
              </Typography>
              <StyledTextField
                fullWidth
                select
                label='Bracket (Optional)'
                value={formData.bracket}
                onChange={handleChange('bracket')}
                error={!!errors.bracket}
                helperText={errors.bracket}
                SelectProps={{
                  MenuProps: getMenuProps(),
                }}
              >
                <MenuItem value='2v2'>2v2</MenuItem>
                <MenuItem value='3v3'>3v3</MenuItem>
              </StyledTextField>
            </Grid>

            {/* Number of Coaches */}
            <Grid item xs={12} sm={6}>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  mb: 1,
                  mt: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                👥 Number of Coaches (Optional)
              </Typography>
              <StyledTextField
                fullWidth
                select
                label='Number of Coaches (Optional)'
                value={formData.coaches}
                onChange={handleChange('coaches')}
                error={!!errors.coaches}
                helperText={errors.coaches}
                SelectProps={{
                  MenuProps: getMenuProps(),
                }}
              >
                <MenuItem value='1'>1 Coach</MenuItem>
                <MenuItem value='2' disabled={formData.bracket === '2v2'}>
                  2 Coaches{' '}
                  {formData.bracket === '2v2' && '(Not available for 2v2)'}
                </MenuItem>
              </StyledTextField>
              <FormHelperText sx={{ mt: 1, color: 'text.secondary' }}>
                E.g., 2 coaches means 2 rank one players will play alongside you
                and mentor you in 3v3
              </FormHelperText>
            </Grid>

            {/* Goal */}
            <Grid item xs={12}>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  mb: 1,
                  mt: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                🎯 Goal (Optional)
              </Typography>
              <StyledTextField
                fullWidth
                label='Goal (Optional)'
                value={formData.goal}
                onChange={handleChange('goal')}
                error={!!errors.goal}
                helperText={
                  errors.goal ||
                  "Enter your goal or any additional notes. Use this space for objectives, questions, preferences, or anything else you'd like your coach to know."
                }
                placeholder='e.g., Gladiator, 2200 elite set, etc.'
                multiline
                rows={3}
                FormHelperTextProps={{
                  sx: { marginLeft: 0 },
                }}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <SubmitButton
                  type='submit'
                  variant='contained'
                  size='large'
                  endIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color='inherit' />
                    ) : (
                      <Send />
                    )
                  }
                  disabled={isSubmitting}
                  sx={{
                    '& .button-text-full': {
                      display: { xs: 'none', lg: 'inline' },
                    },
                    '& .button-text-short': {
                      display: { xs: 'inline', lg: 'none' },
                    },
                  }}
                >
                  {isSubmitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <span className='button-text-short'>Submit</span>
                      <span className='button-text-full'>
                        Submit Booking Request
                      </span>
                    </>
                  )}
                </SubmitButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormPaper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
      >
        <DialogTitle id='delete-dialog-title'>Delete Character?</DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-dialog-description'>
            Are you sure you want to delete{' '}
            {characterToDelete
              ? `${capitalizeFirst(
                  characterToDelete.character.characterName
                )}-${capitalizeFirst(
                  characterToDelete.character.characterRealm
                )}`
              : 'this character'}
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color='inherit'>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color='error'
            variant='contained'
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
