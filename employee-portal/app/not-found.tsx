"use client"

import { Box, Container, Typography, Button } from "@mui/material"
import { ErrorOutline, Home } from "@mui/icons-material"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "oklch(0.18 0.02 250)",
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center" }}>
          <ErrorOutline
            sx={{
              fontSize: 120,
              color: "oklch(0.65 0.15 190)",
              mb: 2,
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: "6rem",
              fontWeight: 700,
              color: "oklch(0.95 0.01 250)",
              mb: 2,
              lineHeight: 1,
            }}
          >
            404
          </Typography>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "oklch(0.95 0.01 250)",
              mb: 2,
            }}
          >
            Page Not Found
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "oklch(0.65 0.01 250)",
              mb: 4,
              fontSize: "1.1rem",
              lineHeight: 1.6,
            }}
          >
            {"Oops! The page you're looking for doesn't exist. It might have been moved or deleted."}
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<Home />}
            onClick={() => router.push("/")}
            sx={{
              py: 1.5,
              px: 4,
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: "oklch(0.65 0.15 190)",
              color: "oklch(0.98 0 0)",
              "&:hover": {
                backgroundColor: "oklch(0.7 0.15 190)",
              },
              borderRadius: 2,
            }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  )
}
