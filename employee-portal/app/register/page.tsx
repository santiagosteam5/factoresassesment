"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Box, Container, TextField, Button, Typography, Paper, InputAdornment, IconButton, Grid, Card, CardContent, Slider, Alert, CircularProgress, Chip, } from "@mui/material"
import { Visibility, VisibilityOff, Person, Lock, Email, Work, Business, Add, Delete, ArrowBack, } from "@mui/icons-material"
import { apiClient } from "../../lib/api-client"

interface SkillInput {
  id: number
  skill_name: string
  skill_level: number
}

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    position: "",
    department: "",
  })

  const [skills, setSkills] = useState<SkillInput[]>([
    { id: 1, skill_name: "", skill_level: 50 },
    { id: 2, skill_name: "", skill_level: 50 },
    { id: 3, skill_name: "", skill_level: 50 },
    { id: 4, skill_name: "", skill_level: 50 },
    { id: 5, skill_name: "", skill_level: 50 },
  ])

  const [nextSkillId, setNextSkillId] = useState(6)

  const generateSeed = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }))
    setError(null)
  }

  const handleSkillNameChange = (id: number, value: string) => {
    setSkills(prev =>
      prev.map(skill =>
        skill.id === id ? { ...skill, skill_name: value } : skill
      )
    )
  }

  const handleSkillLevelChange = (id: number, value: number) => {
    setSkills(prev =>
      prev.map(skill =>
        skill.id === id ? { ...skill, skill_level: value } : skill
      )
    )
  }

  const addSkill = () => {
    setSkills(prev => [
      ...prev,
      { id: nextSkillId, skill_name: "", skill_level: 50 },
    ])
    setNextSkillId(prev => prev + 1)
  }

  const removeSkill = (id: number) => {
    if (skills.length > 5) {
      setSkills(prev => prev.filter(skill => skill.id !== id))
    }
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Name is required"
    if (!formData.email.trim()) return "Email is required"
    if (!formData.password.trim()) return "Password is required"
    if (!formData.confirmPassword.trim()) return "Please confirm your password"
    if (!formData.position.trim()) return "Position is required"
    if (!formData.department.trim()) return "Department is required"

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailPattern.test(formData.email)) return "Please enter a valid email address"

    if (formData.password.length < 6) return "Password must be at least 6 characters"
    if (formData.password !== formData.confirmPassword) return "Passwords do not match"

    if (skills.length < 5) return "Please add at least 5 skills"
    
    const validSkills = skills.filter(skill => skill.skill_name.trim() !== "")
    if (validSkills.length < 5) return "Please provide names for at least 5 skills"

    const skillNames = validSkills.map(skill => skill.skill_name.toLowerCase().trim())
    const uniqueSkills = new Set(skillNames)
    if (uniqueSkills.size !== skillNames.length) return "Please ensure all skill names are unique"

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const validSkills = skills
        .filter(skill => skill.skill_name.trim() !== "")
        .map(skill => ({
          skill_name: skill.skill_name.trim(),
          skill_level: skill.skill_level,
        }))

      const employeeData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        position: formData.position.trim(),
        department: formData.department.trim(),
        seed: generateSeed(),
        skills: validSkills,
      }

      await apiClient.createEmployee(employeeData)

      setSuccess(true)
      
      setTimeout(() => {
        router.push(`/profile?email=${encodeURIComponent(employeeData.email)}`)
      }, 2000)

    } catch (err) {
      console.error('Registration failed:', err)
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
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
              textAlign: "center",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "oklch(0.95 0.01 250)",
                mb: 2,
              }}
            >
              Registration Successful!
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "oklch(0.65 0.01 250)",
                mb: 3,
              }}
            >
              Your account has been created successfully. Redirecting to your profile...
            </Typography>
            <CircularProgress sx={{ color: "oklch(0.65 0.15 190)" }} />
          </Paper>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 4,
        background: "linear-gradient(135deg, oklch(0.18 0.02 250) 0%, oklch(0.22 0.02 250) 100%)",
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={24}
          sx={{
            p: 6,
            borderRadius: 3,
            backgroundColor: "oklch(0.22 0.02 250)",
            border: "1px solid oklch(0.32 0.02 250)",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <IconButton
              onClick={() => router.push("/")}
              sx={{
                color: "oklch(0.65 0.15 190)",
                mr: 2,
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box sx={{ textAlign: "center", flex: 1 }}>
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
                Create Account
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "oklch(0.65 0.01 250)",
                  fontSize: "1rem",
                }}
              >
                Join our employee portal
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                backgroundColor: "oklch(0.18 0.02 250)",
                color: "oklch(0.95 0.01 250)",
                border: "1px solid oklch(0.65 0.15 190)",
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "oklch(0.95 0.01 250)",
                    mb: 2,
                  }}
                >
                  Personal Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: "oklch(0.65 0.15 190)" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
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
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: "oklch(0.65 0.15 190)" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
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
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange('password')}
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
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "oklch(0.65 0.15 190)" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
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
              </Grid>

              {/* Professional Information */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "oklch(0.95 0.01 250)",
                    mb: 2,
                    mt: 2,
                  }}
                >
                  Professional Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Position"
                  value={formData.position}
                  onChange={handleInputChange('position')}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Work sx={{ color: "oklch(0.65 0.15 190)" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
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
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={formData.department}
                  onChange={handleInputChange('department')}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business sx={{ color: "oklch(0.65 0.15 190)" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
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
              </Grid>

              {/* Skills Section */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, mt: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "oklch(0.95 0.01 250)",
                    }}
                  >
                    Skills (Minimum 5 required)
                  </Typography>
                  <Chip
                    label={`${skills.filter(s => s.skill_name.trim() !== "").length}/5 minimum`}
                    sx={{
                      backgroundColor: skills.filter(s => s.skill_name.trim() !== "").length >= 5 
                        ? "oklch(0.65 0.15 120)" 
                        : "oklch(0.65 0.15 190)",
                      color: "oklch(0.98 0 0)",
                    }}
                  />
                </Box>
              </Grid>

              {skills.map((skill) => (
                <Grid item xs={12} key={skill.id}>
                  <Card
                    sx={{
                      backgroundColor: "oklch(0.18 0.02 250)",
                      border: "1px solid oklch(0.32 0.02 250)",
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Skill Name"
                            value={skill.skill_name}
                            onChange={(e) => handleSkillNameChange(skill.id, e.target.value)}
                            placeholder="e.g., JavaScript, Python, Project Management"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "oklch(0.22 0.02 250)",
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
                        </Grid>
                        <Grid item xs={12} sm={5}>
                          <Box sx={{ px: 2 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "oklch(0.65 0.01 250)",
                                mb: 1,
                              }}
                            >
                              Skill Level: {skill.skill_level}%
                            </Typography>
                            <Slider
                              value={skill.skill_level}
                              onChange={(_, value) => handleSkillLevelChange(skill.id, value as number)}
                              min={0}
                              max={100}
                              step={5}
                              sx={{
                                color: "oklch(0.65 0.15 190)",
                                "& .MuiSlider-thumb": {
                                  backgroundColor: "oklch(0.65 0.15 190)",
                                },
                                "& .MuiSlider-track": {
                                  backgroundColor: "oklch(0.65 0.15 190)",
                                },
                                "& .MuiSlider-rail": {
                                  backgroundColor: "oklch(0.32 0.02 250)",
                                },
                              }}
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={1}>
                          {skills.length > 5 && (
                            <IconButton
                              onClick={() => removeSkill(skill.id)}
                              sx={{
                                color: "oklch(0.65 0.15 0)",
                                "&:hover": {
                                  backgroundColor: "oklch(0.28 0.02 250)",
                                },
                              }}
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={addSkill}
                  startIcon={<Add />}
                  sx={{
                    color: "oklch(0.65 0.15 190)",
                    borderColor: "oklch(0.65 0.15 190)",
                    "&:hover": {
                      borderColor: "oklch(0.7 0.15 190)",
                      backgroundColor: "oklch(0.22 0.02 250)",
                    },
                  }}
                >
                  Add Another Skill
                </Button>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
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
                      backgroundColor: "oklch(0.32 0.02 250)",
                      color: "oklch(0.65 0.01 250)",
                    },
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <CircularProgress size={20} sx={{ color: "oklch(0.98 0 0)" }} />
                      Creating Account...
                    </Box>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  )
}