import { CheckCircle, CloudOff, ErrorOutline, Sync } from '@mui/icons-material';
import { Chip } from '@mui/material';
import type { ReactElement } from 'react';
import type { ConnectionStatus } from '@/hooks/useWebsocket';
import { useWebsocket } from '@/hooks/useWebsocket';

const statusConfig: Record<
  ConnectionStatus,
  {
    label: string;
    color: 'success' | 'error' | 'warning' | 'default';
    icon: ReactElement;
  }
> = {
  connected: {
    label: 'Connected',
    color: 'success',
    icon: <CheckCircle />,
  },
  connecting: {
    label: 'Connecting...',
    color: 'default',
    icon: <Sync />,
  },
  reconnecting: {
    label: 'Reconnecting...',
    color: 'warning',
    icon: <Sync />,
  },
  disconnected: {
    label: 'Disconnected',
    color: 'error',
    icon: <CloudOff />,
  },
  error: {
    label: 'Error',
    color: 'error',
    icon: <ErrorOutline />,
  },
};

export const WebSocketStatusIndicator = () => {
  const websocket = useWebsocket();

  // If WebSocket is not available (e.g., not wrapped in provider), don't show anything
  if (!websocket) {
    return null;
  }

  const config = statusConfig[websocket.status];

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size="small"
      variant="outlined"
      sx={{
        marginRight: 1,
        '& .MuiChip-icon': {
          animation:
            websocket.status === 'connecting' ||
            websocket.status === 'reconnecting'
              ? 'spin 2s linear infinite'
              : 'none',
        },
        '@keyframes spin': {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
      }}
    />
  );
};
