"use client"

import { Box, Container, Typography, Paper, Avatar, Chip, Grid, Button, CircularProgress, Alert, Card, CardContent, TextField, Slider, IconButton, Accordion, AccordionSummary, AccordionDetails } from "@mui/material"
import { Code, Storage, Cloud, Psychology, Logout, Business, WorkOutline, Edit, Add, Delete, Save, Cancel, ExpandMore } from "@mui/icons-material"
import { useRouter, useSearchParams } from "next/navigation"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"
import { useState, useEffect } from "react"
import { apiClient, getAvatarUrl, Employee, Skill } from "../../lib/api-client"

interface SkillEdit {
  id: number
  skill_name: string
  skill_level: number
  isNew?: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Skills editing state
  const [editingSkills, setEditingSkills] = useState<SkillEdit[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [nextSkillId, setNextSkillId] = useState(1000)

  useEffect(() => {
    const fetchEmployee = async () => {
      const email = searchParams.get('email')
      
      if (!email) {
        setError('No email provided. Please login again.')
        setLoading(false)
        return
      }

      try {
        const employeeData = await apiClient.getEmployeeByEmail(email)
        setEmployee(employeeData)
      } catch (err) {
        console.error('Failed to fetch employee:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch employee data')
      } finally {
        setLoading(false)
      }
    }

    fetchEmployee()
  }, [searchParams])

  // Initialize editing skills when employee data loads
  useEffect(() => {
    if (employee && !isEditing) {
      const skillsForEditing = employee.skills.map(skill => ({
        id: skill.id,
        skill_name: skill.skill_name,
        skill_level: skill.skill_level,
        isNew: false
      }))
      setEditingSkills(skillsForEditing)
      setNextSkillId(Math.max(...employee.skills.map(s => s.id), 0) + 1000)
    }
  }, [employee, isEditing])

  const handleLogout = () => {
    router.push("/")
  }

  // Skills management functions
  const startEditing = () => {
    setIsEditing(true)
    setError(null)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    if (employee) {
      const skillsForEditing = employee.skills.map(skill => ({
        id: skill.id,
        skill_name: skill.skill_name,
        skill_level: skill.skill_level,
        isNew: false
      }))
      setEditingSkills(skillsForEditing)
    }
  }

  const addSkill = () => {
    setEditingSkills(prev => [
      ...prev,
      { id: nextSkillId, skill_name: "", skill_level: 50, isNew: true }
    ])
    setNextSkillId(prev => prev + 1)
  }

  const removeSkill = (id: number) => {
    setEditingSkills(prev => prev.filter(skill => skill.id !== id))
  }

  const updateSkillName = (id: number, name: string) => {
    setEditingSkills(prev => prev.map(skill => 
      skill.id === id ? { ...skill, skill_name: name } : skill
    ))
  }

  const updateSkillLevel = (id: number, level: number) => {
    setEditingSkills(prev => prev.map(skill => 
      skill.id === id ? { ...skill, skill_level: level } : skill
    ))
  }

  const saveSkills = async () => {
    if (!employee) return

    setUpdateLoading(true)
    setError(null)

    try {
      // Validate skills
      const validSkills = editingSkills.filter(skill => skill.skill_name.trim() !== "")
      
      if (validSkills.length === 0) {
        setError("Please add at least one skill")
        setUpdateLoading(false)
        return
      }

      // Check for duplicates
      const skillNames = validSkills.map(skill => skill.skill_name.toLowerCase().trim())
      const uniqueSkills = new Set(skillNames)
      if (uniqueSkills.size !== skillNames.length) {
        setError("Please ensure all skill names are unique")
        setUpdateLoading(false)
        return
      }

      // Delete removed skills
      const currentSkillIds = employee.skills.map(s => s.id)
      const editingSkillIds = editingSkills.filter(s => !s.isNew).map(s => s.id)
      const skillsToDelete = currentSkillIds.filter(id => !editingSkillIds.includes(id))

      for (const skillId of skillsToDelete) {
        await apiClient.deleteSkill(skillId)
      }

      // Update existing skills
      for (const skill of validSkills.filter(s => !s.isNew)) {
        const originalSkill = employee.skills.find(s => s.id === skill.id)
        if (originalSkill && 
            (originalSkill.skill_name !== skill.skill_name || originalSkill.skill_level !== skill.skill_level)) {
          await apiClient.updateSkill(skill.id, {
            skill_name: skill.skill_name.trim(),
            skill_level: skill.skill_level
          })
        }
      }

      // Add new skills
      for (const skill of validSkills.filter(s => s.isNew)) {
        await apiClient.createSkill(employee.id, {
          skill_name: skill.skill_name.trim(),
          skill_level: skill.skill_level
        })
      }

      // Refresh employee data
      const email = searchParams.get('email')
      if (email) {
        const updatedEmployee = await apiClient.getEmployeeByEmail(email)
        setEmployee(updatedEmployee)
      }

      setIsEditing(false)
      
    } catch (err) {
      console.error('Failed to update skills:', err)
      setError(err instanceof Error ? err.message : 'Failed to update skills')
    } finally {
      setUpdateLoading(false)
    }
  }

  const skillsData = employee?.skills.map(skill => ({
    skill: skill.skill_name,
    level: skill.skill_level
  })) || []

  const getSpecializationChips = () => {
    const skills = employee?.skills || []
    const chipData = []

    skills.forEach(skill => {
      if (skill.skill_level >= 70) {
        const name = skill.skill_name.toLowerCase()
        let icon = <Code sx={{ color: "oklch(0.65 0.15 190) !important" }} />
        let label = skill.skill_name

        if (name.includes('sql') || name.includes('database')) {
          icon = <Storage sx={{ color: "oklch(0.65 0.15 190) !important" }} />
        } else if (name.includes('aws') || name.includes('cloud') || name.includes('azure')) {
          icon = <Cloud sx={{ color: "oklch(0.65 0.15 190) !important" }} />
        } else if (name.includes('ml') || name.includes('machine learning') || name.includes('ai')) {
          icon = <Psychology sx={{ color: "oklch(0.65 0.15 190) !important" }} />
        }

        chipData.push({ icon, label })
      }
    })

    if (chipData.length === 0) {
      chipData.push(
        { icon: <WorkOutline sx={{ color: "oklch(0.65 0.15 190) !important" }} />, label: employee?.position || 'Professional' },
        { icon: <Business sx={{ color: "oklch(0.65 0.15 190) !important" }} />, label: employee?.department || 'Team Member' }
      )
    }

    return chipData.slice(0, 4)
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "oklch(0.18 0.02 250)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "oklch(0.65 0.15 190)" }} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "oklch(0.18 0.02 250)",
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              backgroundColor: "oklch(0.22 0.02 250)",
              color: "oklch(0.95 0.01 250)",
              border: "1px solid oklch(0.32 0.02 250)",
            }}
          >
            {error}
          </Alert>
          <Button
            variant="outlined"
            onClick={() => router.push("/")}
            sx={{
              color: "oklch(0.65 0.15 190)",
              borderColor: "oklch(0.65 0.15 190)",
            }}
          >
            Back to Login
          </Button>
        </Container>
      </Box>
    )
  }

  if (!employee) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "oklch(0.18 0.02 250)",
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 2,
              backgroundColor: "oklch(0.22 0.02 250)",
              color: "oklch(0.95 0.01 250)",
              border: "1px solid oklch(0.32 0.02 250)",
            }}
          >
            Employee not found
          </Alert>
          <Button
            variant="outlined"
            onClick={() => router.push("/")}
            sx={{
              color: "oklch(0.65 0.15 190)",
              borderColor: "oklch(0.65 0.15 190)",
            }}
          >
            Back to Login
          </Button>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "oklch(0.18 0.02 250)",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        {/* Header with logout */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "oklch(0.95 0.01 250)",
            }}
          >
            Employee Profile
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{
              color: "oklch(0.65 0.15 190)",
              borderColor: "oklch(0.65 0.15 190)",
              "&:hover": {
                borderColor: "oklch(0.7 0.15 190)",
                backgroundColor: "oklch(0.22 0.02 250)",
              },
            }}
          >
            Logout
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* Profile Information Card */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={8}
              sx={{
                p: 4,
                backgroundColor: "oklch(0.22 0.02 250)",
                border: "1px solid oklch(0.32 0.02 250)",
                borderRadius: 3,
                height: "100%",
              }}
            >
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Avatar
                  src={getAvatarUrl(employee.seed)}
                  alt={employee.name}
                  sx={{
                    width: 120,
                    height: 120,
                    margin: "0 auto",
                    mb: 2,
                    border: "4px solid oklch(0.65 0.15 190)",
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "oklch(0.95 0.01 250)",
                    mb: 0.5,
                  }}
                >
                  {employee.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "oklch(0.65 0.15 190)",
                    fontWeight: 500,
                    mb: 2,
                  }}
                >
                  {employee.position}
                </Typography>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "oklch(0.65 0.01 250)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      fontWeight: 600,
                    }}
                  >
                    Email
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "oklch(0.95 0.01 250)",
                      mt: 0.5,
                    }}
                  >
                    {employee.email}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "oklch(0.65 0.01 250)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      fontWeight: 600,
                    }}
                  >
                    Department
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "oklch(0.95 0.01 250)",
                      mt: 0.5,
                    }}
                  >
                    {employee.department}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "oklch(0.65 0.01 250)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      fontWeight: 600,
                      mb: 1,
                      display: "block",
                    }}
                  >
                    Specializations
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {getSpecializationChips().map((chip, index) => (
                      <Chip
                        key={index}
                        icon={chip.icon}
                        label={chip.label}
                        sx={{
                          backgroundColor: "oklch(0.28 0.02 250)",
                          color: "oklch(0.95 0.01 250)",
                          border: "1px solid oklch(0.32 0.02 250)",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Skills Spider Chart Card */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={8}
              sx={{
                p: 4,
                backgroundColor: "oklch(0.22 0.02 250)",
                border: "1px solid oklch(0.32 0.02 250)",
                borderRadius: 3,
                height: "100%",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "oklch(0.95 0.01 250)",
                  mb: 1,
                }}
              >
                Technical Skills
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "oklch(0.65 0.01 250)",
                  mb: 4,
                }}
              >
                Proficiency levels across key technologies
              </Typography>

              <Box sx={{ width: "100%", height: 400 }}>
                {skillsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={skillsData}>
                      <PolarGrid stroke="oklch(0.32 0.02 250)" strokeWidth={1} />
                      <PolarAngleAxis
                        dataKey="skill"
                        tick={{
                          fill: "oklch(0.95 0.01 250)",
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{
                          fill: "oklch(0.65 0.01 250)",
                          fontSize: 12,
                        }}
                      />
                      <Radar
                        name="Skill Level"
                        dataKey="level"
                        stroke="oklch(0.65 0.15 190)"
                        fill="oklch(0.65 0.15 190)"
                        fillOpacity={0.5}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.18 0.02 250)",
                          border: "1px solid oklch(0.32 0.02 250)",
                          borderRadius: "8px",
                          color: "oklch(0.95 0.01 250)",
                        }}
                        labelStyle={{
                          color: "oklch(0.95 0.01 250)",
                          fontWeight: 600,
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "oklch(0.65 0.01 250)",
                        textAlign: "center",
                      }}
                    >
                      No Skills Data Available
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "oklch(0.55 0.01 250)",
                        textAlign: "center",
                      }}
                    >
                      Skills will appear here once they are added to the profile
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Skills Legend */}
              {skillsData.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    {skillsData.map((skill, index) => (
                      <Grid item xs={6} sm={4} key={index}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              backgroundColor: "oklch(0.65 0.15 190)",
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: "oklch(0.95 0.01 250)",
                              fontWeight: 500,
                            }}
                          >
                            {skill.skill}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "oklch(0.65 0.01 250)",
                              ml: "auto",
                            }}
                          >
                            {skill.level}%
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {skillsData.length === 0 && (
                <Box sx={{ mt: 3, textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "oklch(0.65 0.01 250)",
                      fontStyle: "italic",
                    }}
                  >
                    No skills recorded yet
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Skills Management Section */}
        <Box sx={{ mt: 4 }}>
          <Accordion 
            sx={{ 
              backgroundColor: "oklch(0.22 0.02 250)",
              border: "1px solid oklch(0.32 0.02 250)",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore sx={{ color: "oklch(0.65 0.15 190)" }} />}
              sx={{
                backgroundColor: "oklch(0.24 0.02 250)",
                "&:hover": {
                  backgroundColor: "oklch(0.26 0.02 250)",
                }
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                <Edit sx={{ color: "oklch(0.65 0.15 190)" }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "oklch(0.95 0.01 250)",
                  }}
                >
                  Manage Skills
                </Typography>
                {!isEditing && (
                  <Chip
                    label={`${employee?.skills.length || 0} skills`}
                    size="small"
                    sx={{
                      backgroundColor: "oklch(0.65 0.15 190)",
                      color: "oklch(0.98 0 0)",
                      ml: "auto",
                    }}
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 4 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "oklch(0.65 0.01 250)",
                  mb: 3,
                }}
              >
                Add, edit, or remove your professional skills and their proficiency levels.
              </Typography>

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

              {!isEditing ? (
                <Box sx={{ textAlign: "center" }}>
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={startEditing}
                    sx={{
                      backgroundColor: "oklch(0.65 0.15 190)",
                      color: "oklch(0.98 0 0)",
                      "&:hover": {
                        backgroundColor: "oklch(0.7 0.15 190)",
                      },
                    }}
                  >
                    Edit Skills
                  </Button>
                </Box>
              ) : (
                <Box>
                  {/* Skills Editing Interface */}
                  <Grid container spacing={2}>
                    {editingSkills.map((skill) => (
                      <Grid item xs={12} key={skill.id}>
                        <Card
                          sx={{
                            backgroundColor: "oklch(0.18 0.02 250)",
                            border: "1px solid oklch(0.32 0.02 250)",
                          }}
                        >
                          <CardContent>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} sm={5}>
                                <TextField
                                  fullWidth
                                  label="Skill Name"
                                  value={skill.skill_name}
                                  onChange={(e) => updateSkillName(skill.id, e.target.value)}
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
                              <Grid item xs={12} sm={6}>
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
                                    onChange={(_, value) => updateSkillLevel(skill.id, value as number)}
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
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Add Skill Button */}
                  <Box sx={{ mt: 3, mb: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={addSkill}
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
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={cancelEditing}
                      disabled={updateLoading}
                      sx={{
                        color: "oklch(0.65 0.01 250)",
                        borderColor: "oklch(0.65 0.01 250)",
                        "&:hover": {
                          borderColor: "oklch(0.75 0.01 250)",
                          backgroundColor: "oklch(0.22 0.02 250)",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={updateLoading ? <CircularProgress size={16} /> : <Save />}
                      onClick={saveSkills}
                      disabled={updateLoading}
                      sx={{
                        backgroundColor: "oklch(0.65 0.15 190)",
                        color: "oklch(0.98 0 0)",
                        "&:hover": {
                          backgroundColor: "oklch(0.7 0.15 190)",
                        },
                        "&:disabled": {
                          backgroundColor: "oklch(0.32 0.02 250)",
                          color: "oklch(0.65 0.01 250)",
                        },
                      }}
                    >
                      {updateLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>
    </Box>
  )
}
