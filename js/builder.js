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
        // This function is perfect for converting work descriptions into bullet points
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => `<li>${line.replace(/•|\*|-/g, '').trim()}</li>`) // Convert each line to a list item
            .join('');
    }

    generateResumeHTML() {
        const { personal, summary, experience, education, skills } = this.formData;

        // --- Start of modified HTML generation ---
        let html = `
            <div class="resume-header">
                <div class="resume-name">${personal.fullName || 'Your Name'}</div>
                <div class="resume-contact">
                    ${personal.email ? `<div>${personal.email}</div>` : ''}
                    ${personal.phone ? `<div>${personal.phone}</div>` : ''}
                    ${personal.location ? `<div>${personal.location}</div>` : ''}
                    ${personal.website ? `<div><a href="${personal.website}">${personal.website}</a></div>` : ''}
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

        // Work Experience (with bullet points)
        if (experience.length > 0 && experience.some(exp => exp.title || exp.company)) {
            html += `<div class="resume-section">
                        <div class="section-title">Work Experience</div>`;
            experience.forEach(exp => {
                if (exp.title || exp.company) {
                    html += `
                        <div class="job-item">
                            <div class="job-title-container">
                                <div class="job-title">${exp.title}</div>
                                <div class="job-duration">${exp.startDate} - ${exp.endDate}</div>
                            </div>
                            <div class="job-company">${exp.company}</div>
                            ${exp.description ? `<ul class="job-description">${this.formatDescription(exp.description)}</ul>` : ''}
                        </div>
                    `;
                }
            });
            html += '</div>';
        }

        // Education (improved layout)
        if (education.length > 0 && education.some(edu => edu.degree || edu.school)) {
            html += `<div class="resume-section">
                        <div class="section-title">Education</div>`;
            education.forEach(edu => {
                if (edu.degree || edu.school) {
                    html += `
                        <div class="edu-item">
                            <div class="edu-degree">${edu.degree}, ${edu.school}</div>
                            <div class="edu-year">${edu.year}</div>
                        </div>
                    `;
                }
            });
            html += '</div>';
        }

        // Skills (as a bulleted list)
        if (skills.length > 0) {
            html += `
                <div class="resume-section">
                    <div class="section-title">Skills</div>
                    <ul class="skills-list">
                        ${skills.map(skill => `<li>${skill}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        html += '</div>';
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

        let yPosition = 0;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 40;
        const usableWidth = pageWidth - (margin * 2);
        const maxYPosition = pageHeight - 40;

        // Helper function to get template colors
        const getPDFColor = (type = 'primary') => {
            switch (this.currentTemplate) {
                case 'modern': return type === 'primary' ? [102, 126, 234] : [255, 255, 255];
                case 'professional': return type === 'primary' ? [44, 62, 80] : [255, 255, 255];
                case 'ats': return [0, 0, 0];
                case 'wave': return type === 'primary' ? [9, 132, 227] : [255, 255, 255];
                case 'creative': return type === 'primary' ? [39, 174, 96] : [255, 255, 255];
                case 'minimal': return [0, 0, 0];
                default: return [44, 62, 80];
            }
        };
        
        const setFontByTemplate = (style = 'normal') => {
             switch (this.currentTemplate) {
                case 'professional':
                    pdf.setFont('times', style);
                    break;
                case 'ats':
                     pdf.setFont('helvetica', style);
                     break;
                default:
                    pdf.setFont('helvetica', style);
            }
        }


        // Helper function to check if we need a new page
        const checkPageBreak = (spaceNeeded = 30) => {
            if (yPosition + spaceNeeded > maxYPosition) {
                pdf.addPage();
                yPosition = 40;
                return true;
            }
            return false;
        };

        // --- PDF HEADER ---
        const primaryColor = getPDFColor('primary');
        const secondaryColor = getPDFColor('secondary');

        if (['modern', 'professional', 'wave', 'creative'].includes(this.currentTemplate)) {
            pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.rect(0, 0, pageWidth, 120, 'F');
            
            pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            setFontByTemplate('bold');
            pdf.setFontSize(26);
            pdf.text(personal.fullName || 'Your Name', pageWidth / 2, 60, { align: 'center' });

            setFontByTemplate('normal');
            pdf.setFontSize(10);
            const contactInfo = [personal.email, personal.phone, personal.location, personal.website].filter(Boolean).join(' | ');
            pdf.text(contactInfo, pageWidth / 2, 85, { align: 'center' });
            yPosition = 150;
        } else { // ATS and Minimal
            yPosition = 60;
            setFontByTemplate('bold');
            pdf.setFontSize(24);
            pdf.setTextColor(0,0,0);
            pdf.text(personal.fullName || 'Your Name', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 25;

            setFontByTemplate('normal');
            pdf.setFontSize(10);
            const contactInfo = [personal.email, personal.phone, personal.location, personal.website].filter(Boolean).join(' | ');
            pdf.text(contactInfo, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 20;

            pdf.setDrawColor(180, 180, 180);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 30;
        }


        // --- PDF BODY ---
        
        const addSection = (title, contentFn) => {
            checkPageBreak(50);
            setFontByTemplate('bold');
            pdf.setFontSize(14);
            pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.text(title.toUpperCase(), margin, yPosition);
            yPosition += 8;

            pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.setLineWidth(1.5);
            pdf.line(margin, yPosition, margin + 80, yPosition);
            yPosition += 20;
            
            contentFn();
            
            yPosition += 25; // Spacing after section
        }

        // Professional Summary
        if (summary) {
            addSection('Professional Summary', () => {
                checkPageBreak(pdf.splitTextToSize(summary, usableWidth).length * 12);
                setFontByTemplate('normal');
                pdf.setFontSize(10);
                pdf.setTextColor(50, 50, 50);
                const lines = pdf.splitTextToSize(summary, usableWidth);
                pdf.text(lines, margin, yPosition);
                yPosition += lines.length * 12;
            });
        }
        
        // Work Experience
        if (experience.length > 0 && experience.some(e => e.title)) {
            addSection('Work Experience', () => {
                experience.forEach(exp => {
                    checkPageBreak(60);
                    setFontByTemplate('bold');
                    pdf.setFontSize(11);
                    pdf.setTextColor(0,0,0);
                    pdf.text(exp.title, margin, yPosition);
                    
                    setFontByTemplate('normal');
                    pdf.setFontSize(10);
                    const dateText = `${exp.startDate || ''}${exp.startDate && exp.endDate ? ' - ' : ''}${exp.endDate || ''}`;
                    pdf.text(dateText, pageWidth - margin, yPosition, { align: 'right' });
                    yPosition += 15;

                    setFontByTemplate('bold');
                    pdf.setTextColor(80, 80, 80);
                    pdf.text(exp.company, margin, yPosition);
                    yPosition += 15;

                    if(exp.description){
                        checkPageBreak(pdf.splitTextToSize(exp.description, usableWidth).length * 12);
                        setFontByTemplate('normal');
                        pdf.setFontSize(10);
                        pdf.setTextColor(50, 50, 50);
                        const descLines = pdf.splitTextToSize(exp.description, usableWidth);
                        pdf.text(descLines, margin, yPosition);
                        yPosition += descLines.length * 12 + 10;
                    }
                });
            });
        }

        // Education
        if (education.length > 0 && education.some(e => e.degree)) {
            addSection('Education', () => {
                 education.forEach(edu => {
                    checkPageBreak(40);
                    setFontByTemplate('bold');
                    pdf.setFontSize(11);
                    pdf.setTextColor(0,0,0);
                    pdf.text(edu.degree, margin, yPosition);

                    setFontByTemplate('normal');
                    pdf.setFontSize(10);
                    pdf.text(edu.year || '', pageWidth - margin, yPosition, { align: 'right' });
                    yPosition += 15;

                    setFontByTemplate('normal');
                    pdf.setTextColor(80, 80, 80);
                    pdf.text(edu.school, margin, yPosition);
                    yPosition += 15;
                 });
            });
        }

        // Skills
        if (skills.length > 0) {
            addSection('Skills', () => {
                checkPageBreak(40);
                setFontByTemplate('normal');
                pdf.setFontSize(10);
                pdf.setTextColor(50, 50, 50);
                const skillsText = skills.join(', ');
                const lines = pdf.splitTextToSize(skillsText, usableWidth);
                pdf.text(lines, margin, yPosition);
                yPosition += lines.length * 12;
            });
        }

        // Generate filename
        const fullName = personal.fullName || 'Resume';
        const filename = `${fullName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase()}_resume.pdf`;
        
        pdf.save(filename);

    } catch (error) {
        console.error('Error generating PDF:', error);
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
