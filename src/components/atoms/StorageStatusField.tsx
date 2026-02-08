import AcUnitIcon from '@mui/icons-material/AcUnit';
import BlockIcon from '@mui/icons-material/Block';
import CloudIcon from '@mui/icons-material/Cloud';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import type React from 'react';
import { FunctionField, useGetOne } from 'react-admin';

interface StorageStatusFieldProps {
  label?: string;
}

interface S3Status {
  exists: boolean;
  storage_class?: string | null;
  size_bytes?: number | null;
  retrieval_required: boolean;
  estimated_retrieval_cost_usd?: number | null;
  estimated_retrieval_time_hours?: number | null;
  retrieval_tier?: string | null;
  estimated_compute_cost_usd?: number | null;
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
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

function getStorageClass(status: S3Status): string {
  // If stream doesn't exist in S3, return MISSING
  if (!status.exists) {
    return 'MISSING';
  }
  // Use the storage class from the API, or default to STANDARD
  return status.storage_class?.toUpperCase() || 'STANDARD';
}

function getChipLabel(
  storageClass: string,
  sizeBytes: number | null | undefined,
): string {
  const storageClassLabels: Record<string, string> = {
    STANDARD: '☁️ STANDARD',
    GLACIER: '❄️ GLACIER',
    DEEP_ARCHIVE: '❄️ DEEP ARCHIVE',
    GLACIER_IR: '❄️ GLACIER IR',
    INTELLIGENT_TIERING: '☁️ INTELLIGENT',
    MISSING: '⛔️ MISSING',
  };
  const label = storageClassLabels[storageClass] || `☁️ ${storageClass}`;
  const size = sizeBytes ? formatBytes(sizeBytes) : 'Unknown size';
  return `${label} (${size})`;
}

function StorageChip({ status }: StorageChipProps) {
  const storageClass = getStorageClass(status);

  const storageClassConfig: Record<
    string,
    {
      icon: React.ReactElement;
      color: 'success' | 'warning' | 'info' | 'error' | 'default';
    }
  > = {
    STANDARD: {
      icon: <CloudIcon />,
      color: 'success',
    },
    GLACIER: {
      icon: <AcUnitIcon />,
      color: 'warning',
    },
    GLACIER_IR: {
      icon: <AcUnitIcon />,
      color: 'warning',
    },
    DEEP_ARCHIVE: {
      icon: <AcUnitIcon />,
      color: 'info',
    },
    INTELLIGENT_TIERING: {
      icon: <CloudIcon />,
      color: 'default',
    },
    MISSING: {
      icon: <BlockIcon />,
      color: 'error',
    },
  };

  const config = storageClassConfig[storageClass] || {
    icon: <CloudIcon />,
    color: 'default' as const,
  };

  const label = getChipLabel(storageClass, status.size_bytes);

  // For STANDARD storage or when no retrieval is required, show simple chip without tooltip
  if (!status.retrieval_required) {
    return (
      <Chip
        icon={config.icon}
        label={label}
        color={config.color}
        size="small"
      />
    );
  }

  // For storage requiring retrieval, show chip with detailed tooltip
  const storageClassLabels: Record<string, string> = {
    STANDARD: '☁️ STANDARD',
    GLACIER: '❄️ GLACIER',
    DEEP_ARCHIVE: '❄️ DEEP ARCHIVE',
    GLACIER_IR: '❄️ GLACIER IR',
    INTELLIGENT_TIERING: '☁️ INTELLIGENT',
    MISSING: '⛔️ MISSING',
  };

  const tooltipContent = (
    <Box sx={{ p: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
        {storageClassLabels[storageClass] || storageClass}
      </Typography>
      {status.size_bytes && (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Size: {formatBytes(status.size_bytes)}
        </Typography>
      )}
      {status.estimated_retrieval_cost_usd !== null &&
        status.estimated_retrieval_cost_usd !== undefined && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Retrieval Cost: {formatCost(status.estimated_retrieval_cost_usd)}
          </Typography>
        )}
      {status.estimated_retrieval_time_hours !== null &&
        status.estimated_retrieval_time_hours !== undefined && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Retrieval Time: ~{status.estimated_retrieval_time_hours}h
            {status.retrieval_tier && ` (${status.retrieval_tier})`}
          </Typography>
        )}
      {status.estimated_compute_cost_usd !== null &&
        status.estimated_compute_cost_usd !== undefined && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Compute Cost: {formatCost(status.estimated_compute_cost_usd)}
          </Typography>
        )}
      {status.retrieval_required && (
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
        label={label}
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
  const { data, isLoading, error } = useGetOne(
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

  return <StorageChip status={data as S3Status} />;
}
