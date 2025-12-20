import { CheckCircle, CloudOff, ErrorOutline, Sync } from '@mui/icons-material';
import { Chip } from '@mui/material';
import type { ConnectionStatus } from '@/hooks/useWebsocket';
import { useWebsocket } from '@/hooks/useWebsocket';

const getStatusConfig = (status: ConnectionStatus) => {
  switch (status) {
    case 'connected':
      return {
        label: 'Connected',
        color: 'success' as const,
        icon: <CheckCircle />,
      };
    case 'connecting':
      return {
        label: 'Connecting...',
        color: 'default' as const,
        icon: <Sync />,
      };
    case 'reconnecting':
      return {
        label: 'Reconnecting...',
        color: 'warning' as const,
        icon: <Sync />,
      };
    case 'disconnected':
      return {
        label: 'Disconnected',
        color: 'error' as const,
        icon: <CloudOff />,
      };
    case 'error':
      return {
        label: 'Error',
        color: 'error' as const,
        icon: <ErrorOutline />,
      };
  }
};

export const WebSocketStatusIndicator = () => {
  const websocket = useWebsocket();

  // If WebSocket is not available (e.g., not wrapped in provider), don't show anything
  if (!websocket) {
    return null;
  }

  const config = getStatusConfig(websocket.status);

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size="small"
      variant="outlined"
      role="status"
      aria-live="polite"
      aria-label={`WebSocket connection status: ${config.label}`}
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
