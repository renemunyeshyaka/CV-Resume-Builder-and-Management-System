import React, { useState } from 'react';
import styles from '../styles/CVEditor.module.css';

export default function CVEditor({ onSave, initialData = null }) {
  const [formData, setFormData] = useState(initialData || {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: [{ company: '', position: '', duration: '', description: '' }],
    education: [{ institution: '', degree: '', field: '', year: '' }],
    skills: [{ skill: '', proficiency: 'Intermediate' }],
    projects: [{ title: '', description: '', link: '' }],
    certifications: [{ name: '', issuer: '', date: '' }],
    languages: [{ language: '', proficiency: 'Intermediate' }],
  });

  const [currentSection, setCurrentSection] = useState('personal');
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleArrayChange = (section, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (section) => {
    const templates = {
      experience: { company: '', position: '', duration: '', description: '' },
      education: { institution: '', degree: '', field: '', year: '' },
      skills: { skill: '', proficiency: 'Intermediate' },
      projects: { title: '', description: '', link: '' },
      certifications: { name: '', issuer: '', date: '' },
      languages: { language: '', proficiency: 'Intermediate' },
    };
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], templates[section]]
    }));
  };

  const removeArrayItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    return newErrors;
  };

  const handleSave = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(formData);
  };

  const sections = [
    { id: 'personal', label: '👤 Personal Info', icon: '👤' },
    { id: 'summary', label: '📝 Professional Summary', icon: '📝' },
    { id: 'experience', label: '💼 Experience', icon: '💼' },
    { id: 'education', label: '🎓 Education', icon: '🎓' },
    { id: 'skills', label: '🛠️ Skills', icon: '🛠️' },
    { id: 'projects', label: '🚀 Projects', icon: '🚀' },
    { id: 'certifications', label: '🏆 Certifications', icon: '🏆' },
    { id: 'languages', label: '🌍 Languages', icon: '🌍' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>CV Sections</h3>
        <div className={styles.sectionNav}>
          {sections.map(sec => (
            <button
              key={sec.id}
              className={`${styles.sectionBtn} ${currentSection === sec.id ? styles.active : ''}`}
              onClick={() => setCurrentSection(sec.id)}
            >
              {sec.icon} {sec.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.editorContainer}>
        {/* Personal Information */}
        {currentSection === 'personal' && (
          <div className={styles.section}>
            <h2>Personal Information</h2>
            <div className={styles.formGroup}>
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={errors.fullName ? styles.inputError : ''}
              />
              {errors.fullName && <span className={styles.error}>{errors.fullName}</span>}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className={errors.email ? styles.inputError : ''}
                />
                {errors.email && <span className={styles.error}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className={errors.phone ? styles.inputError : ''}
                />
                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, Country"
              />
            </div>
          </div>
        )}

        {/* Professional Summary */}
        {currentSection === 'summary' && (
          <div className={styles.section}>
            <h2>Professional Summary</h2>
            <div className={styles.formGroup}>
              <label>Summary</label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                placeholder="Write a brief professional summary about yourself..."
                rows={8}
              />
            </div>
          </div>
        )}

        {/* Experience */}
        {currentSection === 'experience' && (
          <div className={styles.section}>
            <h2>Work Experience</h2>
            {formData.experience.map((exp, idx) => (
              <div key={idx} className={styles.arrayItem}>
                <div className={styles.arrayHeader}>
                  <h4>Experience {idx + 1}</h4>
                  {formData.experience.length > 1 && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeArrayItem('experience', idx)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleArrayChange('experience', idx, 'company', e.target.value)}
                      placeholder="Company Name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Position</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => handleArrayChange('experience', idx, 'position', e.target.value)}
                      placeholder="Job Title"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Duration</label>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => handleArrayChange('experience', idx, 'duration', e.target.value)}
                    placeholder="e.g., Jan 2020 - Dec 2022"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => handleArrayChange('experience', idx, 'description', e.target.value)}
                    placeholder="Describe your responsibilities and achievements"
                    rows={4}
                  />
                </div>
              </div>
            ))}
            <button className={styles.addBtn} onClick={() => addArrayItem('experience')}>
              + Add Experience
            </button>
          </div>
        )}

        {/* Education */}
        {currentSection === 'education' && (
          <div className={styles.section}>
            <h2>Education</h2>
            {formData.education.map((edu, idx) => (
              <div key={idx} className={styles.arrayItem}>
                <div className={styles.arrayHeader}>
                  <h4>Education {idx + 1}</h4>
                  {formData.education.length > 1 && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeArrayItem('education', idx)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleArrayChange('education', idx, 'institution', e.target.value)}
                      placeholder="University Name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleArrayChange('education', idx, 'degree', e.target.value)}
                      placeholder="e.g., Bachelor's"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Field of Study</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => handleArrayChange('education', idx, 'field', e.target.value)}
                      placeholder="Major/Course"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Year</label>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => handleArrayChange('education', idx, 'year', e.target.value)}
                      placeholder="e.g., 2020"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button className={styles.addBtn} onClick={() => addArrayItem('education')}>
              + Add Education
            </button>
          </div>
        )}

        {/* Skills */}
        {currentSection === 'skills' && (
          <div className={styles.section}>
            <h2>Skills</h2>
            {formData.skills.map((skill, idx) => (
              <div key={idx} className={styles.arrayItem}>
                <div className={styles.arrayHeader}>
                  <h4>Skill {idx + 1}</h4>
                  {formData.skills.length > 1 && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeArrayItem('skills', idx)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Skill</label>
                    <input
                      type="text"
                      value={skill.skill}
                      onChange={(e) => handleArrayChange('skills', idx, 'skill', e.target.value)}
                      placeholder="e.g., JavaScript"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Proficiency</label>
                    <select
                      value={skill.proficiency}
                      onChange={(e) => handleArrayChange('skills', idx, 'proficiency', e.target.value)}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Expert</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button className={styles.addBtn} onClick={() => addArrayItem('skills')}>
              + Add Skill
            </button>
          </div>
        )}

        {/* Projects */}
        {currentSection === 'projects' && (
          <div className={styles.section}>
            <h2>Projects</h2>
            {formData.projects.map((project, idx) => (
              <div key={idx} className={styles.arrayItem}>
                <div className={styles.arrayHeader}>
                  <h4>Project {idx + 1}</h4>
                  {formData.projects.length > 1 && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeArrayItem('projects', idx)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Project Title</label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => handleArrayChange('projects', idx, 'title', e.target.value)}
                    placeholder="Project name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    value={project.description}
                    onChange={(e) => handleArrayChange('projects', idx, 'description', e.target.value)}
                    placeholder="Describe the project and your role"
                    rows={4}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Link (Optional)</label>
                  <input
                    type="url"
                    value={project.link}
                    onChange={(e) => handleArrayChange('projects', idx, 'link', e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>
            ))}
            <button className={styles.addBtn} onClick={() => addArrayItem('projects')}>
              + Add Project
            </button>
          </div>
        )}

        {/* Certifications */}
        {currentSection === 'certifications' && (
          <div className={styles.section}>
            <h2>Certifications</h2>
            {formData.certifications.map((cert, idx) => (
              <div key={idx} className={styles.arrayItem}>
                <div className={styles.arrayHeader}>
                  <h4>Certification {idx + 1}</h4>
                  {formData.certifications.length > 1 && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeArrayItem('certifications', idx)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Certification Name</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleArrayChange('certifications', idx, 'name', e.target.value)}
                      placeholder="e.g., AWS Solutions Architect"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Issuer</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleArrayChange('certifications', idx, 'issuer', e.target.value)}
                      placeholder="e.g., Amazon"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Date</label>
                  <input
                    type="text"
                    value={cert.date}
                    onChange={(e) => handleArrayChange('certifications', idx, 'date', e.target.value)}
                    placeholder="e.g., June 2023"
                  />
                </div>
              </div>
            ))}
            <button className={styles.addBtn} onClick={() => addArrayItem('certifications')}>
              + Add Certification
            </button>
          </div>
        )}

        {/* Languages */}
        {currentSection === 'languages' && (
          <div className={styles.section}>
            <h2>Languages</h2>
            {formData.languages.map((lang, idx) => (
              <div key={idx} className={styles.arrayItem}>
                <div className={styles.arrayHeader}>
                  <h4>Language {idx + 1}</h4>
                  {formData.languages.length > 1 && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeArrayItem('languages', idx)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Language</label>
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) => handleArrayChange('languages', idx, 'language', e.target.value)}
                      placeholder="e.g., English"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Proficiency</label>
                    <select
                      value={lang.proficiency}
                      onChange={(e) => handleArrayChange('languages', idx, 'proficiency', e.target.value)}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Fluent</option>
                      <option>Native</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button className={styles.addBtn} onClick={() => addArrayItem('languages')}>
              + Add Language
            </button>
          </div>
        )}

        <div className={styles.actionButtons}>
          <button className={styles.saveBtn} onClick={handleSave}>
            💾 Save CV
          </button>
        </div>
      </div>
    </div>
  );
}
