import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../styles/CVEditor.module.css';

export default function CVEditor({ onSave, initialData = null }) {
  const { t } = useTranslation();
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
    if (!formData.fullName.trim()) newErrors.fullName = t('cvEditor.validation.fullNameRequired');
    if (!formData.email.trim()) {
      newErrors.email = t('cvEditor.validation.emailRequired');
    } else if (!formData.email.includes('@')) {
      newErrors.email = t('cvEditor.validation.emailInvalid');
    }
    if (!formData.phone.trim()) newErrors.phone = t('cvEditor.validation.phoneRequired');
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
    { id: 'personal', label: t('cvEditor.sections.personal'), icon: '👤' },
    { id: 'summary', label: t('cvEditor.sections.summary'), icon: '📝' },
    { id: 'experience', label: t('cvEditor.sections.experience'), icon: '💼' },
    { id: 'education', label: t('cvEditor.sections.education'), icon: '🎓' },
    { id: 'skills', label: t('cvEditor.sections.skills'), icon: '🛠️' },
    { id: 'projects', label: t('cvEditor.sections.projects'), icon: '🚀' },
    { id: 'certifications', label: t('cvEditor.sections.certifications'), icon: '🏆' },
    { id: 'languages', label: t('cvEditor.sections.languages'), icon: '🌍' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>{t('cvEditor.sidebarTitle')}</h3>
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
            <h2>{t('cvEditor.headings.personalInfo')}</h2>
            <div className={styles.formGroup}>
              <label>{t('cvEditor.fields.fullName')}</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder={t('cvEditor.placeholders.fullName')}
                className={errors.fullName ? styles.inputError : ''}
              />
              {errors.fullName && <span className={styles.error}>{errors.fullName}</span>}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>{t('cvEditor.fields.email')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('cvEditor.placeholders.email')}
                  className={errors.email ? styles.inputError : ''}
                />
                {errors.email && <span className={styles.error}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>{t('cvEditor.fields.phone')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t('cvEditor.placeholders.phone')}
                  className={errors.phone ? styles.inputError : ''}
                />
                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>{t('cvEditor.fields.location')}</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder={t('cvEditor.placeholders.location')}
              />
            </div>
          </div>
        )}

        {/* Professional Summary */}
        {currentSection === 'summary' && (
          <div className={styles.section}>
            <h2>{t('cvEditor.headings.professionalSummary')}</h2>
            <div className={styles.formGroup}>
              <label>{t('cvEditor.fields.summary')}</label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                placeholder={t('cvEditor.placeholders.summary')}
                rows={8}
              />
            </div>
          </div>
        )}

        {/* Experience */}
        {currentSection === 'experience' && (
          <div className={styles.section}>
            <h2>{t('cvEditor.headings.workExperience')}</h2>
            {formData.experience.map((exp, idx) => (
              <div key={idx} className={styles.arrayItem}>
                <div className={styles.arrayHeader}>
                  <h4>{t('cvEditor.items.experience', { index: idx + 1 })}</h4>
                  {formData.experience.length > 1 && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeArrayItem('experience', idx)}
                    >
                      {t('cvEditor.actions.remove')}
                    </button>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t('cvEditor.fields.company')}</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleArrayChange('experience', idx, 'company', e.target.value)}
                      placeholder={t('cvEditor.placeholders.company')}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('cvEditor.fields.position')}</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => handleArrayChange('experience', idx, 'position', e.target.value)}
                      placeholder={t('cvEditor.placeholders.position')}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>{t('cvEditor.fields.duration')}</label>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => handleArrayChange('experience', idx, 'duration', e.target.value)}
                    placeholder={t('cvEditor.placeholders.duration')}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t('cvEditor.fields.description')}</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => handleArrayChange('experience', idx, 'description', e.target.value)}
                    placeholder={t('cvEditor.placeholders.description')}
                    rows={4}
                  />
                </div>
              </div>
            ))}
            <button className={styles.addBtn} onClick={() => addArrayItem('experience')}>
              {t('cvEditor.actions.addExperience')}
            </button>
          </div>
        )}

        {/* Education */}
        {currentSection === 'education' && (
          <div className={styles.section}>
            <h2>{t('cvEditor.headings.education')}</h2>
            {formData.education.map((edu, idx) => (
              <div key={idx} className={styles.arrayItem}>
                <div className={styles.arrayHeader}>
                  <h4>{t('cvEditor.items.education', { index: idx + 1 })}</h4>
                  {formData.education.length > 1 && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeArrayItem('education', idx)}
                    >
                      {t('cvEditor.actions.remove')}
                    </button>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t('cvEditor.fields.institution')}</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleArrayChange('education', idx, 'institution', e.target.value)}
                      placeholder={t('cvEditor.placeholders.institution')}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('cvEditor.fields.degree')}</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleArrayChange('education', idx, 'degree', e.target.value)}
                      placeholder={t('cvEditor.placeholders.degree')}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t('cvEditor.fields.fieldOfStudy')}</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => handleArrayChange('education', idx, 'field', e.target.value)}
                      placeholder={t('cvEditor.placeholders.fieldOfStudy')}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('cvEditor.fields.year')}</label>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => handleArrayChange('education', idx, 'year', e.target.value)}
                      placeholder={t('cvEditor.placeholders.year')}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button className={styles.addBtn} onClick={() => addArrayItem('education')}>
              {t('cvEditor.actions.addEducation')}
            </button>
          </div>
        )}

        {/* Skills */}
        {currentSection === 'skills' && (
          <div className={styles.section}>
            <h2>{t('cvEditor.headings.skills')}</h2>
            {formData.skills.map((skill, idx) => (
              <div key={idx} className={styles.arrayItem}>
                <div className={styles.arrayHeader}>
                  <h4>{t('cvEditor.items.skill', { index: idx + 1 })}</h4>
                  {formData.skills.length > 1 && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeArrayItem('skills', idx)}
                    >
                      {t('cvEditor.actions.remove')}
                    </button>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t('cvEditor.fields.skill')}</label>
                    <input
                      type="text"
                      value={skill.skill}
                      onChange={(e) => handleArrayChange('skills', idx, 'skill', e.target.value)}
                      placeholder={t('cvEditor.placeholders.skill')}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('cvEditor.fields.proficiency')}</label>
                    <select
                      value={skill.proficiency}
                      onChange={(e) => handleArrayChange('skills', idx, 'proficiency', e.target.value)}
                    >
                      <option value="Beginner">{t('cvEditor.proficiency.beginner')}</option>
                      <option value="Intermediate">{t('cvEditor.proficiency.intermediate')}</option>
                      <option value="Advanced">{t('cvEditor.proficiency.advanced')}</option>
                      <option value="Expert">{t('cvEditor.proficiency.expert')}</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button className={styles.addBtn} onClick={() => addArrayItem('skills')}>
              {t('cvEditor.actions.addSkill')}
            </button>
          </div>
        )}

        {/* Projects */}
        {currentSection === 'projects' && (
          <div className={styles.section}>
            <h2>{t('cvEditor.headings.projects')}</h2>
            {formData.projects.map((project, idx) => (
              <div key={idx} className={styles.arrayItem}>
                <div className={styles.arrayHeader}>
                  <h4>{t('cvEditor.items.project', { index: idx + 1 })}</h4>
                  {formData.projects.length > 1 && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeArrayItem('projects', idx)}
                    >
                      {t('cvEditor.actions.remove')}
                    </button>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>{t('cvEditor.fields.projectTitle')}</label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => handleArrayChange('projects', idx, 'title', e.target.value)}
                    placeholder={t('cvEditor.placeholders.projectTitle')}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t('cvEditor.fields.description')}</label>
                  <textarea
                    value={project.description}
                    onChange={(e) => handleArrayChange('projects', idx, 'description', e.target.value)}
                    placeholder={t('cvEditor.placeholders.projectDescription')}
                    rows={4}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t('cvEditor.fields.linkOptional')}</label>
                  <input
                    type="url"
                    value={project.link}
                    onChange={(e) => handleArrayChange('projects', idx, 'link', e.target.value)}
                    placeholder={t('cvEditor.placeholders.projectLink')}
                  />
                </div>
              </div>
            ))}
            <button className={styles.addBtn} onClick={() => addArrayItem('projects')}>
              {t('cvEditor.actions.addProject')}
            </button>
          </div>
        )}

        {/* Certifications */}
        {currentSection === 'certifications' && (
          <div className={styles.section}>
            <h2>{t('cvEditor.headings.certifications')}</h2>
            {formData.certifications.map((cert, idx) => (
              <div key={idx} className={styles.arrayItem}>
                <div className={styles.arrayHeader}>
                  <h4>{t('cvEditor.items.certification', { index: idx + 1 })}</h4>
                  {formData.certifications.length > 1 && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeArrayItem('certifications', idx)}
                    >
                      {t('cvEditor.actions.remove')}
                    </button>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t('cvEditor.fields.certificationName')}</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleArrayChange('certifications', idx, 'name', e.target.value)}
                      placeholder={t('cvEditor.placeholders.certificationName')}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('cvEditor.fields.issuer')}</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleArrayChange('certifications', idx, 'issuer', e.target.value)}
                      placeholder={t('cvEditor.placeholders.issuer')}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>{t('cvEditor.fields.date')}</label>
                  <input
                    type="text"
                    value={cert.date}
                    onChange={(e) => handleArrayChange('certifications', idx, 'date', e.target.value)}
                    placeholder={t('cvEditor.placeholders.date')}
                  />
                </div>
              </div>
            ))}
            <button className={styles.addBtn} onClick={() => addArrayItem('certifications')}>
              {t('cvEditor.actions.addCertification')}
            </button>
          </div>
        )}

        {/* Languages */}
        {currentSection === 'languages' && (
          <div className={styles.section}>
            <h2>{t('cvEditor.headings.languages')}</h2>
            {formData.languages.map((lang, idx) => (
              <div key={idx} className={styles.arrayItem}>
                <div className={styles.arrayHeader}>
                  <h4>{t('cvEditor.items.language', { index: idx + 1 })}</h4>
                  {formData.languages.length > 1 && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeArrayItem('languages', idx)}
                    >
                      {t('cvEditor.actions.remove')}
                    </button>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t('cvEditor.fields.language')}</label>
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) => handleArrayChange('languages', idx, 'language', e.target.value)}
                      placeholder={t('cvEditor.placeholders.language')}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('cvEditor.fields.proficiency')}</label>
                    <select
                      value={lang.proficiency}
                      onChange={(e) => handleArrayChange('languages', idx, 'proficiency', e.target.value)}
                    >
                      <option value="Beginner">{t('cvEditor.proficiency.beginner')}</option>
                      <option value="Intermediate">{t('cvEditor.proficiency.intermediate')}</option>
                      <option value="Advanced">{t('cvEditor.proficiency.advanced')}</option>
                      <option value="Fluent">{t('cvEditor.proficiency.fluent')}</option>
                      <option value="Native">{t('cvEditor.proficiency.native')}</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button className={styles.addBtn} onClick={() => addArrayItem('languages')}>
              {t('cvEditor.actions.addLanguage')}
            </button>
          </div>
        )}

        <div className={styles.actionButtons}>
          <button className={styles.saveBtn} onClick={handleSave}>
            {t('cvEditor.actions.saveCv')}
          </button>
        </div>
      </div>
    </div>
  );
}
