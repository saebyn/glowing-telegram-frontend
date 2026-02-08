import AcUnitIcon from '@mui/icons-material/AcUnit';
import BlockIcon from '@mui/icons-material/Block';
import CloudIcon from '@mui/icons-material/Cloud';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { FunctionField, useGetOne } from 'react-admin';

interface StorageStatusFieldProps {
  label?: string;
}

interface S3Status {
  id: number;
  stream_id: number;
  storage_class: 'STANDARD' | 'GLACIER' | 'DEEP_ARCHIVE' | 'MISSING';
  size_bytes: number;
  retrieval_cost_usd: number | null;
  retrieval_time_hours: number | null;
  retrieval_tier: string | null;
  compute_cost_usd: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}

function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

interface StorageChipProps {
  status: S3Status;
}

function StorageChip({ status }: StorageChipProps) {
  const storageClassConfig = {
    STANDARD: {
      icon: <CloudIcon />,
      color: 'success' as const,
      label: '☁️ STANDARD',
    },
    GLACIER: {
      icon: <AcUnitIcon />,
      color: 'warning' as const,
      label: '❄️ GLACIER',
    },
    DEEP_ARCHIVE: {
      icon: <AcUnitIcon />,
      color: 'info' as const,
      label: '❄️ DEEP ARCHIVE',
    },
    MISSING: {
      icon: <BlockIcon />,
      color: 'error' as const,
      label: '⛔️ MISSING',
    },
  };

  const config = storageClassConfig[status.storage_class];

  // For STANDARD storage, show simple chip without tooltip
  if (status.storage_class === 'STANDARD') {
    return (
      <Chip
        icon={config.icon}
        label={`${config.label} (${formatBytes(status.size_bytes)})`}
        color={config.color}
        size="small"
      />
    );
  }

  // For non-STANDARD storage, show chip with detailed tooltip
  const tooltipContent = (
    <Box sx={{ p: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
        {config.label}
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        Size: {formatBytes(status.size_bytes)}
      </Typography>
      {status.retrieval_cost_usd !== null && (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Retrieval Cost: {formatCost(status.retrieval_cost_usd)}
        </Typography>
      )}
      {status.retrieval_time_hours !== null && (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Retrieval Time: ~{status.retrieval_time_hours}h (
          {status.retrieval_tier})
        </Typography>
      )}
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        Compute Cost: {formatCost(status.compute_cost_usd)}
      </Typography>
      {status.retrieval_cost_usd !== null && (
        <Typography
          variant="body2"
          sx={{ mt: 1, fontStyle: 'italic', color: 'warning.light' }}
        >
          ⚠️ Ingestion will incur additional cost and delay
        </Typography>
      )}
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} arrow>
      <Chip
        icon={config.icon}
        label={`${config.label} (${formatBytes(status.size_bytes)})`}
        color={config.color}
        size="small"
      />
    </Tooltip>
  );
}

export default function StorageStatusField({ label }: StorageStatusFieldProps) {
  return (
    <FunctionField
      label={label}
      sortable={false}
      render={(record) => {
        if (!record?.id) return null;

        // Use a nested component to handle the data fetching
        return <StorageStatusFieldContent streamId={record.id} />;
      }}
    />
  );
}

interface StorageStatusFieldContentProps {
  streamId: number;
}

function StorageStatusFieldContent({
  streamId,
}: StorageStatusFieldContentProps) {
  const { data, isLoading, error } = useGetOne<S3Status>(
    'stream_s3_status',
    { id: streamId },
    { retry: false },
  );

  if (isLoading) {
    return (
      <Chip
        label="Loading..."
        size="small"
        variant="outlined"
        color="default"
      />
    );
  }

  if (error || !data) {
    return (
      <Chip
        icon={<BlockIcon />}
        label="⛔️ MISSING"
        color="error"
        size="small"
      />
    );
  }

  return <StorageChip status={data} />;
}
