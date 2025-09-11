/**
 * Resume Builder JavaScript
 * Handles all functionality including live preview, template switching, and PDF generation
 */

class ResumeBuilder {
    constructor() {
        this.currentTemplate = 'modern';
        this.formData = {
            personal: {},
            summary: '',
            experience: [{}],
            education: [{}],
            skills: []
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.updatePreview();
    }

    bindEvents() {
        // Template switching
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTemplate(e.target.dataset.template);
            });
        });

        // Form inputs
        this.bindFormInputs();

        // Dynamic field management
        document.getElementById('addExperience').addEventListener('click', () => {
            this.addExperienceField();
        });

        document.getElementById('addEducation').addEventListener('click', () => {
            this.addEducationField();
        });

        // PDF download
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadPDF();
        });

        // Real-time preview updates
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('form-input') ||
                e.target.classList.contains('form-textarea')) {
                this.updatePreview();
            }
        });
    }

    bindFormInputs() {
        // Personal details
        ['fullName', 'email', 'phone', 'location', 'website'].forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                input.addEventListener('input', () => this.updatePreview());
            }
        });

        // Summary
        const summaryInput = document.getElementById('summary');
        if (summaryInput) {
            summaryInput.addEventListener('input', () => this.updatePreview());
        }

        // Skills
        const skillsInput = document.getElementById('skills');
        if (skillsInput) {
            skillsInput.addEventListener('input', () => this.updatePreview());
        }
    }

    switchTemplate(templateName) {
        // Update active button
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-template="${templateName}"]`).classList.add('active');

        // Update template
        this.currentTemplate = templateName;
        const preview = document.getElementById('resumePreview');
        preview.className = `resume-preview ${templateName}`;

        this.updatePreview();
    }

    collectFormData() {
        // Personal details
        this.formData.personal = {
            fullName: document.getElementById('fullName')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            location: document.getElementById('location')?.value || '',
            website: document.getElementById('website')?.value || ''
        };

        // Summary
        this.formData.summary = document.getElementById('summary')?.value || '';

        // Experience
        this.formData.experience = [];
        document.querySelectorAll('.experience-item').forEach(item => {
            const exp = {
                title: item.querySelector('.exp-title')?.value || '',
                company: item.querySelector('.exp-company')?.value || '',
                startDate: item.querySelector('.exp-start')?.value || '',
                endDate: item.querySelector('.exp-end')?.value || '',
                description: item.querySelector('.exp-description')?.value || ''
            };

            if (exp.title || exp.company) {
                this.formData.experience.push(exp);
            }
        });

        // Education
        this.formData.education = [];
        document.querySelectorAll('.education-item').forEach(item => {
            const edu = {
                degree: item.querySelector('.edu-degree')?.value || '',
                school: item.querySelector('.edu-school')?.value || '',
                year: item.querySelector('.edu-year')?.value || '',
                gpa: item.querySelector('.edu-gpa')?.value || ''
            };

            if (edu.degree || edu.school) {
                this.formData.education.push(edu);
            }
        });

        // Skills
        const skillsValue = document.getElementById('skills')?.value || '';
        this.formData.skills = skillsValue
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);
    }

    updatePreview() {
        this.collectFormData();
        const preview = document.getElementById('resumePreview');
        const previewContent = preview.querySelector('.preview-content');

        // Check if we have any data to show
        const hasData = this.formData.personal.fullName ||
            this.formData.summary ||
            this.formData.experience.length > 0 ||
            this.formData.education.length > 0 ||
            this.formData.skills.length > 0;

        if (!hasData) {
            previewContent.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-file-alt"></i>
                    <p>Start filling out your information to see your resume preview</p>
                </div>
            `;
            return;
        }

        // Generate resume HTML based on current template
        const resumeHTML = this.generateResumeHTML();
        previewContent.innerHTML = resumeHTML;
    }

    formatDescription(text) {
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.startsWith('•') || line.startsWith('*') || line.startsWith('-')
                ? `<div style="margin-left: 15px; margin-bottom: 3px;">• ${line.substring(1).trim()}</div>`
                : `<div style="margin-bottom: 5px;">${line}</div>`
            )
            .join('');
    }

    generateResumeHTML() {
        const { personal, summary, experience, education, skills } = this.formData;

        let html = `
            <div class="resume-header">
                <div class="resume-name">${personal.fullName || 'Your Name'}</div>
                <div class="resume-contact">
                    ${personal.email ? `<div><i class="fas fa-envelope"></i> ${personal.email}</div>` : ''}
                    ${personal.phone ? `<div><i class="fas fa-phone"></i> ${personal.phone}</div>` : ''}
                    ${personal.location ? `<div><i class="fas fa-map-marker-alt"></i> ${personal.location}</div>` : ''}
                    ${personal.website ? `<div><i class="fas fa-link"></i> ${personal.website}</div>` : ''}
                </div>
            </div>
            <div class="resume-body">
        `;

        // Professional Summary
        if (summary) {
            html += `
                <div class="resume-section">
                    <div class="section-title">Professional Summary</div>
                    <div class="summary-text">${summary}</div>
                </div>
            `;
        }

        // Work Experience
        if (experience.length > 0 && experience.some(exp => exp.title || exp.company)) {
            html += `
                <div class="resume-section">
                    <div class="section-title">Work Experience</div>
            `;

            experience.forEach(exp => {
                if (exp.title || exp.company) {
                    html += `
                        <div class="job-item">
                            ${exp.title ? `<div class="job-title">${exp.title}</div>` : ''}
                            ${exp.company ? `<div class="job-company">${exp.company}</div>` : ''}
                            ${exp.startDate || exp.endDate ? `<div class="job-duration">${exp.startDate}${exp.startDate && exp.endDate ? ' - ' : ''}${exp.endDate}</div>` : ''}
                            ${exp.description ? `<div class="job-description">${this.formatDescription(exp.description)}</div>` : ''}
                        </div>
                    `;
                }
            });

            html += '</div>';
        }

        // Education
        if (education.length > 0 && education.some(edu => edu.degree || edu.school)) {
            html += `
                <div class="resume-section">
                    <div class="section-title">Education</div>
            `;

            education.forEach(edu => {
                if (edu.degree || edu.school) {
                    html += `
                        <div class="edu-item">
                            ${edu.degree ? `<div class="edu-degree">${edu.degree}</div>` : ''}
                            ${edu.school ? `<div class="edu-school">${edu.school}</div>` : ''}
                            <div class="edu-details">
                                ${edu.year ? `<span class="edu-year">${edu.year}</span>` : ''}
                                ${edu.gpa ? `<span class="edu-gpa">GPA: ${edu.gpa}</span>` : ''}
                            </div>
                        </div>
                    `;
                }
            });

            html += '</div>';
        }

        // Skills
        // Inside the generateResumeHTML() method, find the Skills section
        // ...
        // Skills
        if (skills.length > 0) {
            html += `
        <div class="resume-section">
            <div class="section-title">Skills</div>
            <div class="skills-list">
    `;

            // Update this line to include 'creative' and 'minimal'
            if (this.currentTemplate === 'modern' || this.currentTemplate === 'wave' || this.currentTemplate === 'creative') {
                skills.forEach(skill => {
                    html += `<span class="skill-tag">${skill}</span>`;
                });
            } else {
                skills.forEach((skill, index) => {
                    html += `<span class="skill-item">${skill}${index < skills.length - 1 ? ', ' : ''}</span>`;
                });
            }

            html += `
            </div>
        </div>
    `;
        }

        html += '</div>'; // Close resume-body

        return html;
    }

    addExperienceField() {
        const container = document.getElementById('experienceContainer');
        const newItem = document.createElement('div');
        newItem.className = 'experience-item';
        newItem.innerHTML = `
            <button type="button" class="remove-item" onclick="this.parentElement.remove(); window.resumeBuilder.updatePreview();">
                <i class="fas fa-times"></i>
            </button>
            <div class="form-row">
                <input type="text" placeholder="Job Title" class="form-input exp-title">
                <input type="text" placeholder="Company Name" class="form-input exp-company">
            </div>
            <div class="form-row">
                <input type="text" placeholder="Start Date (e.g., Jan 2020)" class="form-input exp-start">
                <input type="text" placeholder="End Date (or Present)" class="form-input exp-end">
            </div>
            <div class="form-row">
                <textarea placeholder="Describe your responsibilities and achievements..." class="form-textarea exp-description" rows="3"></textarea>
            </div>
        `;

        container.appendChild(newItem);

        // Bind events to new inputs
        newItem.querySelectorAll('.form-input, .form-textarea').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });
    }

    addEducationField() {
        const container = document.getElementById('educationContainer');
        const newItem = document.createElement('div');
        newItem.className = 'education-item';
        newItem.innerHTML = `
            <button type="button" class="remove-item" onclick="this.parentElement.remove(); window.resumeBuilder.updatePreview();">
                <i class="fas fa-times"></i>
            </button>
            <div class="form-row">
                <input type="text" placeholder="Degree/Certification" class="form-input edu-degree">
                <input type="text" placeholder="Institution Name" class="form-input edu-school">
            </div>
            <div class="form-row">
                <input type="text" placeholder="Graduation Year" class="form-input edu-year">
                <input type="text" placeholder="GPA (Optional)" class="form-input edu-gpa">
            </div>
        `;

        container.appendChild(newItem);

        // Bind events to new inputs
        newItem.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });
    }

    async downloadPDF() {
        const downloadBtn = document.getElementById('downloadBtn');
        const originalText = downloadBtn.innerHTML;

        // Show loading state
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        downloadBtn.disabled = true;

        try {
            // Ensure form data is collected properly
            this.collectFormData();

            // Safe destructuring with fallbacks
            const personal = this.formData.personal || {};
            const summary = this.formData.summary || '';
            const experience = this.formData.experience || [];
            const education = this.formData.education || [];
            const skills = this.formData.skills || [];

            // Create PDF with native text rendering
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4',
                compress: true
            });

            let yPosition = 50;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 50;
            const usableWidth = pageWidth - (margin * 2);
            const maxYPosition = pageHeight - 50;

            // Helper function to get template colors
            const getPDFColor = () => {
                switch (this.currentTemplate) {
                    case 'modern': return [102, 126, 234];
                    case 'professional': return [44, 62, 80];
                    case 'ats': return [0, 0, 0];
                    case 'wave': return [9, 132, 227];
                    case 'creative': return [39, 174, 96]; // A green color to match the "Creative" design
                    case 'minimal': return [0, 0, 0];
                    default: return [102, 126, 234];
                }
            };

            const getPDFHeaderColor = () => {
                switch (this.currentTemplate) {
                    case 'modern': return [102, 126, 234];
                    case 'wave': return [116, 185, 255];
                    case 'creative': return [39, 174, 96]; // A green color to match the "Creative" design
                    case 'minimal': return [248, 250, 252];
                    default: return [102, 126, 234];
                }
            };

            // Helper function to check if we need a new page
            const checkPageBreak = (spaceNeeded = 30) => {
                if (yPosition + spaceNeeded > maxYPosition) {
                    pdf.addPage();
                    yPosition = 50;
                    return true;
                }
                return false;
            };

            // Helper function to add wrapped text
            const addWrappedText = (text, fontSize, fontStyle = 'normal', maxWidth = usableWidth) => {
                pdf.setFontSize(fontSize);
                pdf.setFont('helvetica', fontStyle);

                const lines = pdf.splitTextToSize(text, maxWidth);
                const lineHeight = fontSize * 1.2;

                checkPageBreak(lines.length * lineHeight);

                lines.forEach(line => {
                    pdf.text(line, margin, yPosition);
                    yPosition += lineHeight;
                });

                return yPosition;
            };

            // Add Header
            if (this.currentTemplate === 'modern' || this.currentTemplate === 'wave') {
                const headerColor = getPDFHeaderColor();
                pdf.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
                pdf.rect(0, 0, pageWidth, 150, 'F');
            }

            // Name - Fixed the error line
            pdf.setFontSize(28);
            pdf.setFont('helvetica', 'bold');

            if (this.currentTemplate === 'ats') {
                pdf.setTextColor(0, 0, 0);
            } else {
                pdf.setTextColor(255, 255, 255);
            }

            // Safe name handling - THIS IS THE FIX
            const fullName = personal.fullName || '';
            const name = fullName.trim() || 'Your Name';
            const nameWidth = pdf.getTextWidth(name);
            const centerX = (pageWidth - nameWidth) / 2;
            pdf.text(name, centerX, 80);

            // Contact info
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');

            const contacts = [
                personal.email,
                personal.phone,
                personal.location,
                personal.website
            ].filter(contact => contact && contact.trim());

            if (contacts.length > 0) {
                const contactLine = contacts.join(' | ');
                const contactWidth = pdf.getTextWidth(contactLine);
                const contactX = (pageWidth - contactWidth) / 2;
                pdf.text(contactLine, contactX, 110);
            }

            // Add line separator for ATS template
            if (this.currentTemplate === 'ats') {
                pdf.setDrawColor(0, 0, 0);
                pdf.setLineWidth(2);
                pdf.line(margin, 130, pageWidth - margin, 130);
            }

            yPosition = 180; // After header

            // Professional Summary
            if (summary && summary.trim()) {
                checkPageBreak(60);
                yPosition += 20;

                const sectionColor = getPDFColor();
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(sectionColor[0], sectionColor[1], sectionColor[2]);
                pdf.text('PROFESSIONAL SUMMARY', margin, yPosition);

                pdf.setDrawColor(sectionColor[0], sectionColor[1], sectionColor[2]);
                pdf.setLineWidth(2);
                pdf.line(margin, yPosition + 5, margin + 200, yPosition + 5);

                yPosition += 25;

                pdf.setTextColor(60, 60, 60);
                addWrappedText(summary, 11, 'normal');
                yPosition += 10;
            }

            // Work Experience
            if (experience && experience.length > 0 && experience.some(exp => exp.title || exp.company)) {
                checkPageBreak(60);
                yPosition += 20;

                const sectionColor = getPDFColor();
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(sectionColor[0], sectionColor[1], sectionColor[2]);
                pdf.text('WORK EXPERIENCE', margin, yPosition);

                pdf.setDrawColor(sectionColor[0], sectionColor[1], sectionColor[2]);
                pdf.setLineWidth(2);
                pdf.line(margin, yPosition + 5, margin + 200, yPosition + 5);

                yPosition += 25;

                experience.forEach((exp, index) => {
                    if (exp && (exp.title || exp.company)) {
                        checkPageBreak(80);

                        if (exp.title) {
                            pdf.setFontSize(13);
                            pdf.setFont('helvetica', 'bold');
                            pdf.setTextColor(40, 40, 40);
                            pdf.text(exp.title, margin, yPosition);
                            yPosition += 18;
                        }

                        if (exp.company || exp.startDate || exp.endDate) {
                            let companyLine = '';
                            if (exp.company) companyLine += exp.company;
                            if (exp.startDate || exp.endDate) {
                                if (companyLine) companyLine += ' | ';
                                companyLine += `${exp.startDate || ''}${exp.startDate && exp.endDate ? ' - ' : ''}${exp.endDate || ''}`;
                            }

                            pdf.setFontSize(11);
                            pdf.setFont('helvetica', 'normal');
                            const sectionColor = getPDFColor();
                            pdf.setTextColor(sectionColor[0], sectionColor[1], sectionColor[2]);
                            pdf.text(companyLine, margin, yPosition);
                            yPosition += 18;
                        }

                        if (exp.description) {
                            pdf.setTextColor(80, 80, 80);
                            const descLines = exp.description.split('\n').filter(line => line.trim());

                            descLines.forEach(line => {
                                const trimmedLine = line.trim();
                                if (trimmedLine.startsWith('•') || trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
                                    checkPageBreak(15);
                                    pdf.text('•', margin, yPosition);

                                    pdf.setFontSize(10);
                                    const bulletText = trimmedLine.substring(1).trim();
                                    const lines = pdf.splitTextToSize(bulletText, usableWidth - 15);
                                    lines.forEach(line => {
                                        pdf.text(line, margin + 15, yPosition);
                                        yPosition += 12;
                                    });
                                } else {
                                    addWrappedText(trimmedLine, 10, 'normal');
                                }
                            });
                        }

                        if (index < experience.length - 1) yPosition += 15;
                    }
                });

                yPosition += 10;
            }

            // Education
            if (education && education.length > 0 && education.some(edu => edu.degree || edu.school)) {
                checkPageBreak(60);
                yPosition += 20;

                const sectionColor = getPDFColor();
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(sectionColor[0], sectionColor[1], sectionColor[2]);
                pdf.text('EDUCATION', margin, yPosition);

                pdf.setDrawColor(sectionColor[0], sectionColor[1], sectionColor[2]);
                pdf.setLineWidth(2);
                pdf.line(margin, yPosition + 5, margin + 200, yPosition + 5);

                yPosition += 25;

                education.forEach((edu, index) => {
                    if (edu && (edu.degree || edu.school)) {
                        checkPageBreak(50);

                        if (edu.degree) {
                            pdf.setFontSize(12);
                            pdf.setFont('helvetica', 'bold');
                            pdf.setTextColor(40, 40, 40);
                            pdf.text(edu.degree, margin, yPosition);
                            yPosition += 16;
                        }

                        let schoolLine = '';
                        if (edu.school) schoolLine += edu.school;
                        if (edu.year) {
                            if (schoolLine) schoolLine += ' | ';
                            schoolLine += edu.year;
                        }
                        if (edu.gpa) {
                            if (schoolLine) schoolLine += ' | ';
                            schoolLine += `GPA: ${edu.gpa}`;
                        }

                        if (schoolLine) {
                            pdf.setFontSize(11);
                            pdf.setFont('helvetica', 'normal');
                            const sectionColor = getPDFColor();
                            pdf.setTextColor(sectionColor[0], sectionColor[1], sectionColor[2]);
                            pdf.text(schoolLine, margin, yPosition);
                            yPosition += 16;
                        }

                        if (index < education.length - 1) yPosition += 10;
                    }
                });

                yPosition += 10;
            }

            // Skills
            if (skills && skills.length > 0) {
                checkPageBreak(60);
                yPosition += 20;

                const sectionColor = getPDFColor();
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(sectionColor[0], sectionColor[1], sectionColor[2]);
                pdf.text('SKILLS', margin, yPosition);

                pdf.setDrawColor(sectionColor[0], sectionColor[1], sectionColor[2]);
                pdf.setLineWidth(2);
                pdf.line(margin, yPosition + 5, margin + 200, yPosition + 5);

                yPosition += 25;

                const skillsText = skills.join(' • ');
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(80, 80, 80);
                addWrappedText(skillsText, 11, 'normal');
            }

            // Generate filename - Fixed this too
            const fileName = fullName.trim() || 'Resume';
            const filename = `${fileName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase()}_resume.pdf`;

            pdf.save(filename);

        } catch (error) {
            console.error('Error generating PDF:', error);
            console.log('Form data:', this.formData); // Debug line
            alert('There was an error generating the PDF. Please try again.');
        } finally {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }
    }

}

// Initialize the resume builder when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.resumeBuilder = new ResumeBuilder();
});

// Add some sample data for demonstration (optional)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (document.getElementById('fullName').value === '') {
            // Add sample data to help users get started
            document.getElementById('fullName').value = 'John Doe';
            document.getElementById('email').value = 'john.doe@email.com';
            document.getElementById('phone').value = '(555) 123-4567';
            document.getElementById('location').value = 'New York, NY';
            document.getElementById('summary').value = 'Experienced professional with a proven track record in project management and team leadership. Passionate about delivering high-quality results and driving innovation in fast-paced environments.';

            const firstExpTitle = document.querySelector('.exp-title');
            const firstExpCompany = document.querySelector('.exp-company');
            const firstExpStart = document.querySelector('.exp-start');
            const firstExpEnd = document.querySelector('.exp-end');
            const firstExpDesc = document.querySelector('.exp-description');

            if (firstExpTitle) firstExpTitle.value = 'Senior Project Manager';
            if (firstExpCompany) firstExpCompany.value = 'Tech Solutions Inc.';
            if (firstExpStart) firstExpStart.value = 'Jan 2020';
            if (firstExpEnd) firstExpEnd.value = 'Present';
            if (firstExpDesc) firstExpDesc.value = 'Led cross-functional teams to deliver complex software projects on time and within budget. Managed stakeholder relationships and improved team productivity by 30%.';

            const firstEduDegree = document.querySelector('.edu-degree');
            const firstEduSchool = document.querySelector('.edu-school');
            const firstEduYear = document.querySelector('.edu-year');

            if (firstEduDegree) firstEduDegree.value = 'Bachelor of Science in Business Administration';
            if (firstEduSchool) firstEduSchool.value = 'University of California, Los Angeles';
            if (firstEduYear) firstEduYear.value = '2018';

            document.getElementById('skills').value = 'Project Management, Team Leadership, Agile Methodology, Risk Assessment, Strategic Planning, Data Analysis, Communication, Problem Solving';

            // Trigger preview update
            window.resumeBuilder.updatePreview();
        }
    }, 1000);
});
