import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import { MoreVertical, MapPin, CalendarClock } from "lucide-react";
import EmptyState from "../common/EmptyState";
import { formatTime, formatHoursShort } from "../../utils/format";
import { buildRecentLedger } from "../../utils/attendanceStats";

const STATUS_STYLE = {
  Present: { bg: "rgba(22,163,74,0.14)", color: "#16a34a" },
  Working: { bg: "rgba(37,99,235,0.14)", color: "#2563eb" },
  Late: { bg: "rgba(217,119,6,0.15)", color: "#d97706" },
  Absent: { bg: "rgba(220,38,38,0.14)", color: "#dc2626" },
  Leave: { bg: "rgba(37,99,235,0.14)", color: "#2563eb" },
};

const StatusDot = ({ status }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Absent;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        bgcolor: s.bg,
        color: s.color,
        px: 1.25,
        py: 0.4,
        borderRadius: "20px",
        fontSize: "0.75rem",
        fontWeight: 700,
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: s.color }} />
      {status}
    </Box>
  );
};

const RecentAttendanceTable = ({ records, leaves }) => {
  const [expanded, setExpanded] = useState(false);
  const [menuRow, setMenuRow] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [detailRow, setDetailRow] = useState(null);

  const ledger = useMemo(
    () => buildRecentLedger(records, leaves, new Date(), expanded ? 20 : 5),
    [records, leaves, expanded]
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Recent Attendance</Typography>
        <Button size="small" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Show Less" : "View All"}
        </Button>
      </Box>

      {ledger.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No attendance history yet" description="Records will appear here once you start clocking in." />
      ) : (
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["Date", "Check In", "Check Out", "Working Hours", "Status", "Location", ""].map((h) => (
                  <TableCell
                    key={h}
                    sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.03em", borderBottom: "1px solid rgba(128,128,128,0.25)" }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {ledger.map((row) => (
                <TableRow key={row.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                  <TableCell sx={{ py: 1.25 }}>
                    {new Date(row.date).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell>{formatTime(row.checkIn)}</TableCell>
                  <TableCell>{row.checkOut ? formatTime(row.checkOut) : "--:--"}</TableCell>
                  <TableCell>{row.hoursWorked ? formatHoursShort(row.hoursWorked) : "0h 00m"}</TableCell>
                  <TableCell><StatusDot status={row.status} /></TableCell>
                  <TableCell>
                    {row.status === "Absent" ? (
                      "—"
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                        <MapPin size={13} /> Office
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setMenuAnchor(e.currentTarget);
                        setMenuRow(row);
                      }}
                    >
                      <MoreVertical size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem
          onClick={() => {
            setDetailRow(menuRow);
            setMenuAnchor(null);
          }}
        >
          View Details
        </MenuItem>
      </Menu>

      <Dialog open={!!detailRow} onClose={() => setDetailRow(null)} maxWidth="xs" fullWidth>
        {detailRow && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>
              {new Date(detailRow.date).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <StatusDot status={detailRow.status} />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Check In</Typography>
                <Typography variant="body2" fontWeight={600}>{formatTime(detailRow.checkIn)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Check Out</Typography>
                <Typography variant="body2" fontWeight={600}>{detailRow.checkOut ? formatTime(detailRow.checkOut) : "--:--"}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Working Hours</Typography>
                <Typography variant="body2" fontWeight={600}>{formatHoursShort(detailRow.hoursWorked)}</Typography>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default RecentAttendanceTable;
