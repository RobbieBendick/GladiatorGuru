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
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { API_BASE_URL } from '../../config/api';
import {
  Class,
  getAvailableVersions,
  getClassesForVersion,
  getSpecsForClass,
  getClassColor,
  WowVersion,
} from '../../constants/wow-classes';

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
const getVersionDisplayName = (version: WowVersion): string => {
  const versionNames: Record<WowVersion, string> = {
    TBC: 'Burning Crusade',
    MOP: 'Mists of Pandaria',
  };
  return versionNames[version] || version;
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
  const [formData, setFormData] = useState<BookingFormData>({
    characterName: '',
    characterRealm: '',
    version: '',
    bracket: '',
    hours: '',
    characterClass: '',
    characterSpec: '',
    availabilityDate: '',
    availabilityStartTime: '',
    availabilityEndTime: '',
    discordUsername: '',
    goal: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof BookingFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate min and max dates for date input
  const getMinDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
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

  const minDate = getMinDate();
  const maxDate = getMaxDate();

  // Handle date pre-fill from calendar
  useEffect(() => {
    const dateParam = searchParams.get('date');
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

        // Extract date, start time, and calculate end time (2 hours later)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        const startHours = String(date.getHours()).padStart(2, '0');
        const startMinutes = String(date.getMinutes()).padStart(2, '0');
        const startTime = `${startHours}:${startMinutes}`;

        const endDate = new Date(date);
        endDate.setHours(endDate.getHours() + 2);
        const endHours = String(endDate.getHours()).padStart(2, '0');
        const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
        const endTime = `${endHours}:${endMinutes}`;

        setFormData(prev => ({
          ...prev,
          availabilityDate: formattedDate,
          availabilityStartTime: startTime,
          availabilityEndTime: endTime,
        }));
      } catch (error) {
        console.error('Error parsing date parameter:', error);
      }
    }
  }, [searchParams]);

  const theme = useTheme();
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
  const calculateTotalPrice = (): number => {
    if (!formData.bracket || !formData.hours) return 0;

    // Extract number of coaches from bracket (e.g., "2v2-1" = 1 coach, "3v3-2" = 2 coaches)
    const coachesMatch = formData.bracket.match(/-(\d+)$/);
    const coaches = coachesMatch ? parseInt(coachesMatch[1], 10) : 0;
    const hours = parseInt(formData.hours, 10) || 0;

    const pricePerHour = 30;
    return pricePerHour * coaches * hours;
  };

  // Calculate price for a specific number of hours
  const calculatePriceForHours = (hours: number): number => {
    // Default to 1 coach if no bracket is selected
    let coaches = 1;
    if (formData.bracket) {
      const coachesMatch = formData.bracket.match(/-(\d+)$/);
      coaches = coachesMatch ? parseInt(coachesMatch[1], 10) : 1;
    }
    const pricePerHour = 30;
    return pricePerHour * coaches * hours;
  };

  const totalPrice = calculateTotalPrice();

  // MenuProps for select dropdowns with grey background in light mode
  const getMenuProps = () => ({
    PaperProps: {
      sx: {
        backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : undefined,
      },
    },
  });

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
            const newEndTotalMinutes = startTotalMinutes + 120; // Add 2 hours
            const newEndHours = Math.floor(newEndTotalMinutes / 60) % 24;
            const newEndMins = newEndTotalMinutes % 60;
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
      const selectedDate = new Date(formData.availabilityDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const twoMonthsLater = new Date(now);
      twoMonthsLater.setMonth(now.getMonth() + 2);

      if (selectedDate < now) {
        newErrors.availabilityDate = 'Date cannot be in the past';
      } else if (selectedDate > twoMonthsLater) {
        newErrors.availabilityDate =
          'Date cannot be more than 2 months in advance';
      } else if (
        selectedDate.getTime() === now.getTime() &&
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
      const [startHours, startMinutes] = formData.availabilityStartTime
        .split(':')
        .map(Number);
      const [endHours, endMinutes] = formData.availabilityEndTime
        .split(':')
        .map(Number);

      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

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
      const availabilityStartDateTime = `${formData.availabilityDate}T${formData.availabilityStartTime}`;
      const availabilityEndDateTime = `${formData.availabilityDate}T${formData.availabilityEndTime}`;

      const submitData = {
        characterName: formData.characterName,
        characterRealm: formData.characterRealm,
        version: formData.version,
        bracket: formData.bracket,
        hours: formData.hours,
        characterClass: formData.characterClass,
        characterSpec: formData.characterSpec,
        availabilityStartDateTime,
        availabilityEndDateTime,
        discordUsername: formData.discordUsername,
        goal: formData.goal,
      };

      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit booking request');
      }

      // Navigate to success page
      navigate(ROUTE_PATHS.bookingSuccess);
    } catch (error) {
      console.error('Error submitting booking:', error);
      setErrors({
        ...errors,
        // Set a general error message
      });
      alert('Failed to submit booking request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth='md'>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(ROUTE_PATHS.home)}
          sx={{ mb: 2 }}
        >
          Back to Home
        </Button>
      </Box>

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
        <Typography variant='body1' color='text.secondary' sx={{ mb: 1 }}>
          Fill out the form below to request a coaching session. We'll contact
          you via Discord to confirm details.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={0.5}>
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
                  <StyledMenuItem key={version} value={version}>
                    <img
                      src={getVersionImagePath(version)}
                      alt={getVersionDisplayName(version)}
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <Typography>{getVersionDisplayName(version)}</Typography>
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
                  mt: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                ⚔️ Character Information
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label='Character Name'
                    value={formData.characterName}
                    onChange={handleChange('characterName')}
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
                    onChange={handleChange('characterRealm')}
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
                  mb: 1,
                  mt: '15px',
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
                  sx={{ mb: 1 }}
                >
                  Pick any day you're available
                </Typography>
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
                <Grid container spacing={2} alignItems='center'>
                  <Grid item xs={12} sm={4}>
                    <StyledTextField
                      fullWidth
                      type='time'
                      label='From'
                      value={formData.availabilityStartTime}
                      onChange={handleChange('availabilityStartTime')}
                      error={!!errors.availabilityStartTime}
                      helperText={errors.availabilityStartTime}
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm='auto'>
                    <Typography
                      variant='body1'
                      sx={{
                        textAlign: 'center',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        height: '100%',
                      }}
                    >
                      to
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StyledTextField
                      fullWidth
                      type='time'
                      label='To'
                      value={formData.availabilityEndTime}
                      onChange={handleChange('availabilityEndTime')}
                      error={!!errors.availabilityEndTime}
                      helperText={errors.availabilityEndTime}
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
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
                  mt: '15px',
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
                {[1, 2, 3, 4].map(hours => {
                  const isSelected = formData.hours === String(hours);
                  const price = calculatePriceForHours(hours);
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
                      <Typography sx={{ flex: 1, textAlign: 'left' }}>
                        {hours} Hour Session
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                        }}
                      >
                        ${price}
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
                  {formData.bracket
                    ? 'Choose your session length'
                    : 'Choose your session length (prices defaulted to 1 coach)'}
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
                  mt: '15px',
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
            <Grid item xs={12}>
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
                <MenuItem value='2v2-1'>2v2 (1 coach)</MenuItem>
                <MenuItem value='3v3-1'>3v3 (1 coach)</MenuItem>
                <MenuItem value='3v3-2'>3v3 (2 coaches)</MenuItem>
              </StyledTextField>
            </Grid>

            {/* Goal */}
            <Grid item xs={12}>
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
                  'What is your goal for this session? (e.g., Gladiator, 2200 elite set, etc.)'
                }
                placeholder='e.g., Gladiator, 2200 elite set, etc.'
                multiline
                rows={3}
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
    </Container>
  );
}
