import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Button,
  Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';

export default function Support() {
  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h4" align="center" mb={2}>
        🚀 Support Center
      </Typography>

      <Typography variant="subtitle1" align="center" mb={5} color="textSecondary">
        Here you can find help and guidelines for managing students, courses, assignments, exams and events.
        Quick tutorials, tips and navigation links are available to assist you.
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">👩‍🎓 Add a New Student</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography mb={1}>
            Follow these steps to add a new student:
          </Typography>
          <ol style={{ paddingLeft: '20px' }}>
            <li>Go to the <Link to="/students">Student Management</Link> page.</li>
            <li>Click on "Add Student".</li>
            <li>Fill in all the required fields.</li>
            <li>Click "Save" to add the student.</li>
          </ol>
          <Button variant="outlined" component={Link} to="/students" sx={{ mt: 2 }}>
            Go to Students
          </Button>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">✏️ Edit Student Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography mb={1}>
            To edit an existing student:
          </Typography>
          <ol style={{ paddingLeft: '20px' }}>
            <li>Visit the <Link to="/students">Students Page</Link>.</li>
            <li>Click the ✏️ edit icon next to the student you wish to update.</li>
            <li>Modify the fields and press "Save".</li>
          </ol>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">📚 Manage Courses</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography mb={1}>
            Organize your courses easily:
          </Typography>
          <ol style={{ paddingLeft: '20px' }}>
            <li>Navigate to the <Link to="/courses">Courses Page</Link>.</li>
            <li>Add, edit, or delete courses as needed.</li>
            <li>Link students to specific courses.</li>
          </ol>
          <Button variant="outlined" component={Link} to="/courses" sx={{ mt: 2 }}>
            Go to Courses
          </Button>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">📝 Assignments and Exams</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography mb={1}>
            Create tasks and exams linked to specific courses:
          </Typography>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Add assignments via the <Link to="/assignments">Assignments Page</Link>.</li>
            <li>Manage exams via the <Link to="/exams">Exams Page</Link>.</li>
          </ul>
          <Stack spacing={1} direction="row" mt={2}>
            <Button variant="outlined" component={Link} to="/assignments">
              Go to Assignments
            </Button>
            <Button variant="outlined" component={Link} to="/exams">
              Go to Exams
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">📅 Events and Announcements</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography mb={1}>
            You can create announcements and events:
          </Typography>
          <ol style={{ paddingLeft: '20px' }}>
            <li>Go to the <Link to="/events">Events Page</Link>.</li>
            <li>Add an event for all students, a degree program, a course, or specific students.</li>
          </ol>
          <Button variant="outlined" component={Link} to="/events" sx={{ mt: 2 }}>
            Go to Events
          </Button>
        </AccordionDetails>
      </Accordion>

    </Container>
  );
}
