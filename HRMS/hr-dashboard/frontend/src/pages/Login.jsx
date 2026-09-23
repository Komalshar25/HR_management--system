import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/common/ThemeToggle";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      } else {
        await login({
          email: formData.email,
          password: formData.password,
        });
      }

      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("Auth error:", err);
      setError(err.response?.data?.message || err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        px: 2,
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
      }}
    >
      <ThemeToggle sx={{ position: "absolute", top: 16, right: 16, color: "#fff" }} />
      <Paper
        elevation={16}
        sx={{
          p: { xs: 4, sm: 6 },
          borderRadius: 4,
          width: "100%",
          maxWidth: 420,
          bgcolor: "background.paper",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, color: "text.primary" }}
        >
          {isSignup ? "Create Account" : "Sign In"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {isSignup && (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 4,
              py: 1.8,
              fontSize: "1.1rem",
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            {loading ? (
              <CircularProgress size={28} color="inherit" />
            ) : isSignup ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </Button>

          <Typography align="center" sx={{ mt: 3 }}>
            {isSignup ? "Already have an account?" : "New to HR Management System?"}{" "}
            <Link
              component="button"
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
                setFormData({ name: "", email: "", password: "" });
              }}
              sx={{ fontWeight: 600, color: "text.primary", cursor: "pointer" }}
            >
              {isSignup ? "Sign In" : "Create Account"}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;