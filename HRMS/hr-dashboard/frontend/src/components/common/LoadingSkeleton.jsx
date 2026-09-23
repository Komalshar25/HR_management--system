import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Paper from "@mui/material/Paper";

export const KpiSkeletonRow = ({ count = 4 }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 2 }}>
    {Array.from({ length: count }).map((_, i) => (
      <Paper key={i} sx={{ p: 2.5 }}>
        <Skeleton variant="rounded" width={40} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="50%" height={32} />
        <Skeleton variant="text" width="70%" />
      </Paper>
    ))}
  </Box>
);

export const CardSkeleton = ({ height = 320 }) => (
  <Paper sx={{ p: 3, height }}>
    <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
    <Skeleton variant="rounded" width="100%" height={height - 80} />
  </Paper>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <Paper sx={{ p: 3 }}>
    <Skeleton variant="text" width="25%" height={28} sx={{ mb: 2 }} />
    {Array.from({ length: rows }).map((_, r) => (
      <Box key={r} sx={{ display: "flex", gap: 2, mb: 1.5 }}>
        {Array.from({ length: cols }).map((__, c) => (
          <Skeleton key={c} variant="text" sx={{ flex: 1 }} height={28} />
        ))}
      </Box>
    ))}
  </Paper>
);
