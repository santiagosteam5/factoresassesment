"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Box, Container, TextField, Button, Typography, Paper, InputAdornment, IconButton, Alert } from "@mui/material"
import { Visibility, VisibilityOff, Person, Lock } from "@mui/icons-material"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/employees/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Login successful - redirect to profile with user data
        router.push(`/profile?email=${encodeURIComponent(email)}`)
      } else {
        // Login failed - show error message
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, oklch(0.18 0.02 250) 0%, oklch(0.22 0.02 250) 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 6,
            borderRadius: 3,
            backgroundColor: "oklch(0.22 0.02 250)",
            border: "1px solid oklch(0.32 0.02 250)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "oklch(0.95 0.01 250)",
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "oklch(0.65 0.01 250)",
                fontSize: "1rem",
              }}
            >
              Sign in to access your employee portal
            </Typography>
          </Box>

          <form onSubmit={handleLogin}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  backgroundColor: "oklch(0.35 0.08 10)",
                  color: "oklch(0.95 0.01 250)",
                  "& .MuiAlert-icon": {
                    color: "oklch(0.7 0.15 10)",
                  },
                }}
              >
                {error}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "oklch(0.65 0.15 190)" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "oklch(0.18 0.02 250)",
                  "& fieldset": {
                    borderColor: "oklch(0.32 0.02 250)",
                  },
                  "&:hover fieldset": {
                    borderColor: "oklch(0.65 0.15 190)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "oklch(0.65 0.15 190)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "oklch(0.65 0.01 250)",
                },
                "& .MuiInputBase-input": {
                  color: "oklch(0.95 0.01 250)",
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "oklch(0.65 0.15 190)" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "oklch(0.65 0.01 250)" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "oklch(0.18 0.02 250)",
                  "& fieldset": {
                    borderColor: "oklch(0.32 0.02 250)",
                  },
                  "&:hover fieldset": {
                    borderColor: "oklch(0.65 0.15 190)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "oklch(0.65 0.15 190)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "oklch(0.65 0.01 250)",
                },
                "& .MuiInputBase-input": {
                  color: "oklch(0.95 0.01 250)",
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !email || !password}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                backgroundColor: "oklch(0.65 0.15 190)",
                color: "oklch(0.98 0 0)",
                "&:hover": {
                  backgroundColor: "oklch(0.7 0.15 190)",
                },
                "&:disabled": {
                  backgroundColor: "oklch(0.35 0.05 190)",
                  color: "oklch(0.65 0.01 250)",
                },
                borderRadius: 2,
                mb: 3,
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {/* Register Link */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: "oklch(0.65 0.01 250)",
                mb: 1,
              }}
            >
              No account yet?
            </Typography>
            <Button
              variant="text"
              onClick={() => router.push("/register")}
              sx={{
                color: "oklch(0.65 0.15 190)",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "oklch(0.28 0.02 250)",
                },
              }}
            >
              Create one here
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
