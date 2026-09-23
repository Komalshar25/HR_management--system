import React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    "Real-time Attendance Tracking",
    "Automated Leave Management",
    "Performance Reviews & Goals",
    "Role-based Access Control",
    "Secure Cloud Storage",
    "Intuitive Dashboard Experience",
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fbff" }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 16 } }}>
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "3.5rem", md: "5rem" },
                fontWeight: 800,
                lineHeight: 1.1,
                mb: 4,
                background: "linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              HR Management System
            </Typography>

            <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: "600px" }}>
              The modern HR management platform that empowers your workforce with seamless attendance, leave, and performance tracking.
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 6, maxWidth: "550px" }}>
              Streamline HR processes, boost productivity, and gain real-time insights — all in one secure, easy-to-use system.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/login")}
                sx={{
                  px: 5,
                  py: 1.8,
                  fontSize: "1.1rem",
                  bgcolor: "#1e293b",
                  "&:hover": { bgcolor: "#0f172a" },
                }}
              >
                Get Started
                <ArrowForwardIcon sx={{ ml: 1 }} />
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/login")}
                sx={{
                  px: 5,
                  py: 1.8,
                  fontSize: "1.1rem",
                  borderColor: "#1e293b",
                  color: "#1e293b",
                }}
              >
                Sign In
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={10}
              sx={{
                p: 5,
                borderRadius: 4,
                bgcolor: "white",
                boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
              }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Key Features
              </Typography>
              <List>
                {features.map((feature, index) => (
                  <ListItem key={index} disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={feature}
                      primaryTypographyProps={{ variant: "body1", fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 3 }} />
              <Typography variant="body2" color="text.secondary">
                Trusted by growing teams for simplified HR operations.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: "#1e293b", color: "white", py: 4, mt: "auto" }}>
        <Container maxWidth="lg">
          <Typography align="center" variant="body2">
            © 2025 HR Management System. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;