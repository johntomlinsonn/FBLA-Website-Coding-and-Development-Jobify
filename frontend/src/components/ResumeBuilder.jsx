import React, { useState } from "react";
import { Box, Button, Stepper, Step, StepLabel, TextField, Typography, Paper, Grid, Chip, IconButton } from "@mui/material";
import { jsPDF } from "jspdf";
import DeleteIcon from "@mui/icons-material/Delete";
import { profileAPI } from '../services/api';

const steps = ["Personal Info", "Education", "Experience", "Skills", "Summary", "Preview & Export"];

const initialData = {
  personal: { name: "", email: "", phone: "", address: "" },
  education: [{ school: "", degree: "", year: "" }],
  experience: [{ company: "", title: "", start: "", end: "", description: "" }],
  skills: [],
  summary: "",
};

export default function ResumeBuilderWizard({ onClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState(initialData);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Handlers for each step
  const handleChange = (section, field, value, idx = 0) => {
    if (Array.isArray(data[section])) {
      const arr = [...data[section]];
      arr[idx][field] = value;
      setData({ ...data, [section]: arr });
    } else {
      setData({ ...data, [section]: { ...data[section], [field]: value } });
    }
  };

  const handleAdd = (section) => {
    if (section === "education") {
      setData({ ...data, education: [...data.education, { school: "", degree: "", year: "" }] });
    } else if (section === "experience") {
      setData({ ...data, experience: [...data.experience, { company: "", title: "", start: "", end: "", description: "" }] });
    }
  };

  const handleRemove = (section, idx) => {
    const arr = [...data[section]];
    arr.splice(idx, 1);
    setData({ ...data, [section]: arr });
  };

  const handleSkillAdd = () => {
    if (skillInput.trim() && !data.skills.includes(skillInput.trim())) {
      setData({ ...data, skills: [...data.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const handleSkillDelete = (skill) => {
    setData({ ...data, skills: data.skills.filter((s) => s !== skill) });
  };

  // Save Resume to Profile
  const handleSaveResume = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError("");
    try {
      const doc = new jsPDF();
      let y = 10;
      doc.setFontSize(18);
      doc.text(data.personal.name, 10, y);
      doc.setFontSize(12);
      y += 8;
      doc.text(`${data.personal.email} | ${data.personal.phone} | ${data.personal.address}`, 10, y);
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Summary", 10, y);
      doc.setFont("helvetica", "normal");
      y += 7;
      doc.text(data.summary, 10, y, { maxWidth: 190 });
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Education", 10, y);
      doc.setFont("helvetica", "normal");
      y += 7;
      data.education.forEach((edu) => {
        doc.text(`${edu.degree} - ${edu.school} (${edu.year})`, 10, y);
        y += 7;
      });
      y += 3;
      doc.setFont("helvetica", "bold");
      doc.text("Experience", 10, y);
      doc.setFont("helvetica", "normal");
      y += 7;
      data.experience.forEach((exp) => {
        doc.text(`${exp.title} at ${exp.company} (${exp.start} - ${exp.end})`, 10, y);
        y += 6;
        doc.text(exp.description, 12, y, { maxWidth: 180 });
        y += 8;
      });
      y += 3;
      doc.setFont("helvetica", "bold");
      doc.text("Skills", 10, y);
      doc.setFont("helvetica", "normal");
      y += 7;
      doc.text(data.skills.join(", "), 10, y);
      // Get PDF as Blob
      const pdfBlob = doc.output('blob');
      // Create a File from the Blob
      const pdfFile = new File([pdfBlob], 'resume.pdf', { type: 'application/pdf' });
      // Prepare FormData
      const formData = new FormData();
      formData.append('resume', pdfFile);
      // Upload to profile
      await profileAPI.update(formData);
      setSaveSuccess(true);
      setSaving(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Give user a moment to see the success message
      if (onClose) onClose();
    } catch (err) {
      setSaveError('Failed to save resume. Please try again.');
      setSaving(false);
    }
  };

  // Step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Full Name" value={data.personal.name} onChange={e => handleChange("personal", "name", e.target.value)} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" value={data.personal.email} onChange={e => handleChange("personal", "email", e.target.value)} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone" value={data.personal.phone} onChange={e => handleChange("personal", "phone", e.target.value)} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Address" value={data.personal.address} onChange={e => handleChange("personal", "address", e.target.value)} fullWidth />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <>
            {data.education.map((edu, idx) => (
              <Box key={idx} sx={{ mb: 2, p: 2, border: "1px solid #eee", borderRadius: 2, background: "#FFF7ED" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={5}>
                    <TextField label="School" value={edu.school} onChange={e => handleChange("education", "school", e.target.value, idx)} fullWidth required />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label="Degree" value={edu.degree} onChange={e => handleChange("education", "degree", e.target.value, idx)} fullWidth required />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField label="Year" value={edu.year} onChange={e => handleChange("education", "year", e.target.value, idx)} fullWidth required />
                  </Grid>
                  <Grid item xs={12}>
                    {data.education.length > 1 && (
                      <IconButton onClick={() => handleRemove("education", idx)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button onClick={() => handleAdd("education")} variant="outlined" sx={{ mt: 1 }}>Add Education</Button>
          </>
        );
      case 2:
        return (
          <>
            {data.experience.map((exp, idx) => (
              <Box key={idx} sx={{ mb: 2, p: 2, border: "1px solid #eee", borderRadius: 2, background: "#FFF7ED" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField label="Company" value={exp.company} onChange={e => handleChange("experience", "company", e.target.value, idx)} fullWidth required />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label="Title" value={exp.title} onChange={e => handleChange("experience", "title", e.target.value, idx)} fullWidth required />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField label="Start" value={exp.start} onChange={e => handleChange("experience", "start", e.target.value, idx)} fullWidth required />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField label="End" value={exp.end} onChange={e => handleChange("experience", "end", e.target.value, idx)} fullWidth required />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Description" value={exp.description} onChange={e => handleChange("experience", "description", e.target.value, idx)} fullWidth multiline minRows={2} />
                  </Grid>
                  <Grid item xs={12}>
                    {data.experience.length > 1 && (
                      <IconButton onClick={() => handleRemove("experience", idx)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button onClick={() => handleAdd("experience")} variant="outlined" sx={{ mt: 1 }}>Add Experience</Button>
          </>
        );
      case 3:
        return (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {data.skills.map(skill => (
                <Chip key={skill} label={skill} onDelete={() => handleSkillDelete(skill)} color="primary" />
              ))}
            </Box>
            <TextField
              label="Add Skill"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSkillAdd(); } }}
              sx={{ mr: 1 }}
            />
            <Button onClick={handleSkillAdd} variant="contained" sx={{ mt: 1 }}>Add</Button>
          </Box>
        );
      case 4:
        return (
          <TextField
            label="Professional Summary"
            value={data.summary}
            onChange={e => setData({ ...data, summary: e.target.value })}
            fullWidth
            multiline
            minRows={4}
            placeholder="A brief summary about yourself, your goals, and what makes you a great candidate."
          />
        );
      case 5:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Live Resume Preview</Typography>
            <Paper sx={{ p: 3, background: "#fff", border: "1px solid #eee", borderRadius: 2, mb: 2 }}>
              <Typography variant="h4" sx={{ color: "#FF9100", fontWeight: 700 }}>{data.personal.name}</Typography>
              <Typography variant="body1" sx={{ color: "#333" }}>
                {data.personal.email} | {data.personal.phone} | {data.personal.address}
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>Summary</Typography>
              <Typography variant="body2">{data.summary}</Typography>
              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>Education</Typography>
              {data.education.map((edu, idx) => (
                <Typography key={idx} variant="body2">{edu.degree} - {edu.school} ({edu.year})</Typography>
              ))}
              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>Experience</Typography>
              {data.experience.map((exp, idx) => (
                <Box key={idx} sx={{ mb: 1 }}>
                  <Typography variant="body2">{exp.title} at {exp.company} ({exp.start} - {exp.end})</Typography>
                  <Typography variant="body2" sx={{ ml: 2 }}>{exp.description}</Typography>
                </Box>
              ))}
              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>Skills</Typography>
              <Typography variant="body2">{data.skills.join(", ")}</Typography>
            </Paper>
            {saveSuccess && <Typography color="success.main" sx={{ mb: 2 }}>Resume saved to your profile!</Typography>}
            {saveError && <Typography color="error.main" sx={{ mb: 2 }}>{saveError}</Typography>}
            <Button onClick={handleSaveResume} variant="contained" color="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Resume to Profile'}
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ maxWidth: 700, mx: 'auto', p: 4, borderRadius: 4, boxShadow: 3, background: '#fff' }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mb: 3 }}>{getStepContent(activeStep)}</Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((prev) => prev - 1)}
        >
          Back
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setActiveStep((prev) => prev + 1)}
          >
            Next
          </Button>
        ) : (
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Close
          </Button>
        )}
      </Box>
    </Paper>
  );
}
