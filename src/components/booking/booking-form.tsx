import { useState } from 'react';
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
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
  // Style calendar icon for datetime-local inputs to match text.primary color
  '& input[type="datetime-local"]::-webkit-calendar-picker-indicator': {
    filter: `brightness(0) saturate(100%) invert(${
      theme.palette.mode === 'dark' ? '1' : '0'
    })`,
    cursor: 'pointer',
    opacity: 0.7,
  },
  '& input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover': {
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
  availabilityDateTime: string;
  discordUsername: string;
  goal: string;
}

export function BookingForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BookingFormData>({
    characterName: '',
    characterRealm: '',
    version: '',
    bracket: '',
    hours: '',
    characterClass: '',
    characterSpec: '',
    availabilityDateTime: '',
    discordUsername: '',
    goal: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof BookingFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate min and max dates for datetime input
  const getMinDateTime = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getMaxDateTime = (): string => {
    const now = new Date();
    const twoMonthsLater = new Date(now);
    twoMonthsLater.setMonth(now.getMonth() + 2);
    const year = twoMonthsLater.getFullYear();
    const month = String(twoMonthsLater.getMonth() + 1).padStart(2, '0');
    const day = String(twoMonthsLater.getDate()).padStart(2, '0');
    const hours = String(twoMonthsLater.getHours()).padStart(2, '0');
    const minutes = String(twoMonthsLater.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const minDateTime = getMinDateTime();
  const maxDateTime = getMaxDateTime();

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

    if (!formData.bracket) {
      newErrors.bracket = 'Bracket is required';
    }

    if (!formData.hours) {
      newErrors.hours = 'Hours is required';
    }

    if (!formData.characterClass) {
      newErrors.characterClass = 'Character class is required';
    }

    if (!formData.characterSpec) {
      newErrors.characterSpec = 'Character spec is required';
    }

    if (!formData.availabilityDateTime) {
      newErrors.availabilityDateTime =
        'Date and time of availability is required';
    } else {
      const selectedDate = new Date(formData.availabilityDateTime);
      const now = new Date();
      const twoMonthsLater = new Date(now);
      twoMonthsLater.setMonth(now.getMonth() + 2);

      if (selectedDate < now) {
        newErrors.availabilityDateTime = 'Date and time cannot be in the past';
      } else if (selectedDate > twoMonthsLater) {
        newErrors.availabilityDateTime =
          'Date and time cannot be more than 2 months in advance';
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
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
        <FormTitle variant='h2' gutterBottom>
          Book a Coach
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
        <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
          Fill out the form below to request a boost. We'll contact you via
          Discord to confirm details.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Version */}
            <Grid item xs={12}>
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

            {/* Bracket */}
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                select
                label='Bracket'
                value={formData.bracket}
                onChange={handleChange('bracket')}
                error={!!errors.bracket}
                helperText={errors.bracket}
                required
                SelectProps={{
                  MenuProps: getMenuProps(),
                }}
              >
                <MenuItem value='2v2-1'>2v2 (1 coach)</MenuItem>
                <MenuItem value='3v3-1'>3v3 (1 coach)</MenuItem>
                <MenuItem value='3v3-2'>3v3 (2 coaches)</MenuItem>
              </StyledTextField>
            </Grid>

            {/* Hours */}
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                select
                label='Amount of Hours'
                value={formData.hours}
                onChange={handleChange('hours')}
                error={!!errors.hours}
                helperText={errors.hours}
                required
                SelectProps={{
                  MenuProps: getMenuProps(),
                }}
              >
                <MenuItem value='1'>1 hour</MenuItem>
                <MenuItem value='2'>2 hours</MenuItem>
                <MenuItem value='3'>3 hours</MenuItem>
                <MenuItem value='4'>4 hours</MenuItem>
                <MenuItem value='5'>5 hours</MenuItem>
                <MenuItem value='6'>6 hours</MenuItem>
              </StyledTextField>
            </Grid>

            {/* Character Name */}
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

            {/* Character Realm */}
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

            {/* Character Class */}
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                select
                label='Character Class'
                value={formData.characterClass}
                onChange={handleChange('characterClass')}
                error={!!errors.characterClass}
                helperText={errors.characterClass}
                required
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
                <FormHelperText error sx={{ pl: '5px' }}>
                  Select a version first
                </FormHelperText>
              )}
            </Grid>

            {/* Character Spec */}
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                select
                label='Character Spec'
                value={formData.characterSpec}
                onChange={handleChange('characterSpec')}
                error={!!errors.characterSpec}
                helperText={errors.characterSpec}
                required
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
                <FormHelperText error sx={{ pl: '5px' }}>
                  Select a class first
                </FormHelperText>
              )}
            </Grid>

            {/* Date/Time of Availability */}
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                type='datetime-local'
                label='Date/Time of Next Availability'
                value={formData.availabilityDateTime}
                onChange={handleChange('availabilityDateTime')}
                error={!!errors.availabilityDateTime}
                helperText={
                  errors.availabilityDateTime ||
                  'Select when you are first available to play.'
                }
                required
                inputProps={{
                  min: minDateTime,
                  max: maxDateTime,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Discord Username */}
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label='Discord Username'
                value={formData.discordUsername}
                onChange={handleChange('discordUsername')}
                error={!!errors.discordUsername}
                helperText={errors.discordUsername}
                required
                placeholder='Discord username (found in bottom-left corner of Discord)'
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

            {/* Goal */}
            <Grid item xs={12}>
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
