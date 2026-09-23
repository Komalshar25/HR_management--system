import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import TablePagination from "@mui/material/TablePagination";
import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { TableSkeleton } from "./LoadingSkeleton";
import EmptyState from "./EmptyState";

// columns: [{ key, label, align?, render?(row) }]
// On phones each row becomes a card: first column is the title, the rest are label/value pairs.
const DataTable = ({
  columns,
  rows,
  loading,
  emptyTitle = "No data yet",
  emptyDescription,
  emptyIcon,
  getRowKey = (row) => row._id || row.id,
  onRowClick,
  paginate = false,
  pageSize = 20,
}) => {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down("sm"));
  const [page, setPage] = useState(0);
  const total = rows?.length || 0;

  useEffect(() => {
    if (page > 0 && page * pageSize >= total) setPage(0);
  }, [total, page, pageSize]);

  if (loading) return <TableSkeleton cols={columns.length} />;

  if (!rows || rows.length === 0) {
    return (
      <Paper>
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      </Paper>
    );
  }

  const cell = (col, row) => (col.render ? col.render(row) : row[col.key]);
  const visibleRows = paginate ? rows.slice(page * pageSize, page * pageSize + pageSize) : rows;
  const pager = paginate && total > pageSize && (
    <TablePagination
      component="div"
      count={total}
      page={page}
      onPageChange={(e, p) => setPage(p)}
      rowsPerPage={pageSize}
      rowsPerPageOptions={[]}
    />
  );

  if (isPhone) {
    const [titleCol, ...restCols] = columns;
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {visibleRows.map((row) => (
          <Paper
            key={getRowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            sx={{ p: 2, cursor: onRowClick ? "pointer" : "default", minWidth: 0 }}
          >
            <Box sx={{ mb: restCols.length ? 1.25 : 0, minWidth: 0 }}>{cell(titleCol, row)}</Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {restCols.map((col) => {
                const value = cell(col, row);
                if (value === undefined || value === null || value === "") return null;
                return (
                  <Box
                    key={col.key}
                    sx={{
                      display: "flex",
                      justifyContent: col.label ? "space-between" : "flex-end",
                      alignItems: "center",
                      gap: 2,
                      minWidth: 0,
                    }}
                  >
                    {col.label && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", flexShrink: 0 }}
                      >
                        {col.label}
                      </Typography>
                    )}
                    <Box sx={{ minWidth: 0, textAlign: "right", fontSize: "0.875rem", overflowWrap: "anywhere" }}>{value}</Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        ))}
        {pager}
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.key}
                align={col.align || "left"}
                sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.03em", borderBottom: "1px solid rgba(128,128,128,0.25)" }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.map((row) => (
            <TableRow
              key={getRowKey(row)}
              hover
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              sx={{
                cursor: onRowClick ? "pointer" : "default",
                transition: "background-color 150ms ease",
                "&:last-child td": { borderBottom: 0 },
              }}
            >
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align || "left"} sx={{ py: 1.25 }}>
                  {cell(col, row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pager}
    </TableContainer>
  );
};

export default DataTable;
