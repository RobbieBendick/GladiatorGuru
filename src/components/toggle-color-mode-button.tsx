import { IconButton, Tooltip } from '@mui/material';
import Brightness2Icon from '@mui/icons-material/Brightness2';
import { useContext } from 'react';
import { LightMode } from '@mui/icons-material';
import { ColorModeContext } from '@/app';

export const ToggleColorModeButton = ({ color }: { color?: string }) => {
  const { toggleColorMode, mode } = useContext(ColorModeContext);

  const handleToggleColorMode = () => {
    toggleColorMode();
  };

  return (
    <Tooltip
      title={`Toggle ${mode === 'light' ? 'Dark' : 'Light'} Mode`}
      placement='bottom'
      sx={{ marginLeft: '7px' }}
    >
      <IconButton color='inherit' onClick={handleToggleColorMode}>
        {mode === 'light' ? (
          <Brightness2Icon
            style={{ color: color ? color.toString() : 'inherit' }}
          />
        ) : (
          <LightMode />
        )}
      </IconButton>
    </Tooltip>
  );
};

