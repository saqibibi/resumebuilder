/**
 * Resume Builder JavaScript
 * Handles all functionality including live preview, template switching, and PDF generation
 */
// --- Top of js/builder.js ---

// Initialize Supabase client using Vercel environment variables
const SUPABASE_URL = window.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class ResumeBuilder {
    constructor() {
        this.currentTemplate = 'ats';
        this.formData = {
            personal: {},
            summary: '',
            experience: [{}],
            education: [{}],
            skills: []
        };
        this.currentUser = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.updatePreview();
        this.handleAuth();
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

        document.getElementById('saveResumeBtn').addEventListener('click', () => { // <<< ADD THESE LINES
            this.saveResumeDraft();
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
        // Education
        if (education.length > 0 && education.some(edu => edu.degree || edu.school)) {
            html += `<div class="resume-section">
                        <div class="section-title">Education</div>`;
            education.forEach(edu => {
                if (edu.degree || edu.school) {
                    html += `
                        <div class="edu-item edu-item-spacing">  <div class="edu-degree">${edu.degree}${edu.school ? ` | ${edu.school}` : ''}</div>
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

    // NEW downloadPDF() function for js/builder.js

    async downloadPDF() {
        const downloadBtn = document.getElementById('downloadBtn');
        const originalText = downloadBtn ? downloadBtn.innerHTML : '';

        if (downloadBtn) {
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving & Generating...';
            downloadBtn.disabled = true;
        }

        try {
            // collect latest form data
            this.collectFormData();

            // Attempt to save to API but don't block PDF generation on failure
            try {
                const dataToSend = this.formData;
                const apiResponse = await fetch('/api/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataToSend),
                });

                const result = await apiResponse.json().catch(() => ({}));
                if (!result.success) {
                    console.warn('API Save Failed, continuing with PDF download:', result.message || result);
                }
            } catch (apiError) {
                console.error('Network or API deployment error, continuing with PDF download:', apiError);
            }

            // Begin PDF generation
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4',
                compress: true
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 40;
            const usableWidth = pageWidth - (margin * 2);
            const maxYPosition = pageHeight - 40;
            let yPosition = 60;

            const setFontByTemplate = (style = 'normal') => {
                // Use ATS-safe font variants
                try {
                    pdf.setFont('helvetica', style);
                } catch (e) {
                    // fallback if style not supported
                    pdf.setFont('helvetica');
                }
            };

            const checkPageBreak = (spaceNeeded = 30) => {
                if (yPosition + spaceNeeded > maxYPosition) {
                    pdf.addPage();
                    yPosition = 40;
                    return true;
                }
                return false;
            };

            // Header
            setFontByTemplate('bold');
            pdf.setFontSize(24);
            pdf.setTextColor(0, 0, 0);
            pdf.text(this.formData.personal.fullName || 'Your Name', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 25;

            setFontByTemplate('normal');
            pdf.setFontSize(10);
            const contactInfo = [this.formData.personal.email, this.formData.personal.phone, this.formData.personal.location, this.formData.personal.website].filter(Boolean).join(' | ');
            if (contactInfo) {
                pdf.text(contactInfo, pageWidth / 2, yPosition, { align: 'center' });
            }
            yPosition += 20;

            pdf.setDrawColor(180, 180, 180);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 30;

            const addSection = (title, contentFn) => {
                checkPageBreak(50);
                setFontByTemplate('bold');
                pdf.setFontSize(14);
                pdf.setTextColor(0, 0, 0);
                pdf.text(title.toUpperCase(), margin, yPosition);
                yPosition += 8;

                const textWidth = pdf.getTextWidth(title.toUpperCase());
                pdf.setDrawColor(0, 0, 0);
                pdf.setLineWidth(1);
                pdf.line(margin, yPosition, margin + textWidth, yPosition);
                yPosition += 20;

                setFontByTemplate('normal');
                contentFn();
                yPosition += 25;
            };

            // Professional Summary
            if (this.formData.summary) {
                addSection('Professional Summary', () => {
                    const lines = pdf.splitTextToSize(this.formData.summary, usableWidth);
                    checkPageBreak(lines.length * 12);
                    setFontByTemplate('normal');
                    pdf.setFontSize(10);
                    pdf.setTextColor(50, 50, 50);
                    pdf.text(lines, margin, yPosition);
                    yPosition += lines.length * 12;
                });
            }

            // Work Experience
            if (this.formData.experience && this.formData.experience.length > 0 && this.formData.experience.some(e => e.title || e.company)) {
                addSection('Work Experience', () => {
                    this.formData.experience.forEach(exp => {
                        if (!(exp.title || exp.company || exp.description)) return;
                        checkPageBreak(60);

                        setFontByTemplate('bold');
                        pdf.setFontSize(11);
                        pdf.setTextColor(0, 0, 0);
                        const titleCompany = `${exp.title || ''}${exp.company ? ` | ${exp.company}` : ''}`;
                        pdf.text(titleCompany, margin, yPosition);

                        setFontByTemplate('normal');
                        pdf.setFontSize(10);
                        const dateText = `${exp.startDate || ''}${exp.startDate && exp.endDate ? ' - ' : ''}${exp.endDate || ''}`;
                        if (dateText.trim()) {
                            pdf.text(dateText, pageWidth - margin, yPosition, { align: 'right' });
                        }
                        yPosition += 15;

                        if (exp.description) {
                            const list = exp.description
                                .split('\n')
                                .map(line => line.trim())
                                .filter(line => line.length > 0);

                            list.forEach(item => {
                                const itemLines = pdf.splitTextToSize(`• ${item}`, usableWidth);
                                checkPageBreak(itemLines.length * 12);
                                pdf.setFontSize(10);
                                pdf.setTextColor(50, 50, 50);
                                pdf.text(itemLines, margin, yPosition);
                                yPosition += itemLines.length * 12;
                            });
                            yPosition += 10;
                        }
                    });
                });
            }

            // Education
            // Education
            if (this.formData.education && this.formData.education.length > 0 && this.formData.education.some(e => e.degree || e.school)) {
                addSection('Education', () => {
                    this.formData.education.forEach(edu => {
                        if (!(edu.degree || edu.school)) return;
                        checkPageBreak(40);

                        setFontByTemplate('bold');
                        pdf.setFontSize(11);
                        pdf.setTextColor(0, 0, 0);
                        pdf.text(edu.degree || '', margin, yPosition);

                        setFontByTemplate('normal');
                        pdf.setFontSize(10);
                        if (edu.year) {
                            pdf.text(edu.year, pageWidth - margin, yPosition, { align: 'right' });
                        }
                        yPosition += 15;

                        setFontByTemplate('normal');
                        pdf.setFontSize(10);
                        pdf.setTextColor(80, 80, 80);
                        if (edu.school) {
                            const schoolLines = pdf.splitTextToSize(edu.school, usableWidth);
                            pdf.text(schoolLines, margin, yPosition);
                            yPosition += schoolLines.length * 12;
                        }
                        
                        // ✅ CRITICAL FIX: Ensure spacing is executed cleanly after each entry
                        yPosition += 15; 
                    });
                });
            }

            // Skills
            if (this.formData.skills && this.formData.skills.length > 0) {
                addSection('Skills', () => {
                    checkPageBreak(40);
                    setFontByTemplate('normal');
                    pdf.setFontSize(10);
                    pdf.setTextColor(50, 50, 50);

                    this.formData.skills.forEach(skill => {
                        const lines = pdf.splitTextToSize(`• ${skill}`, usableWidth);
                        checkPageBreak(lines.length * 12);
                        pdf.text(lines, margin, yPosition);
                        yPosition += lines.length * 12;
                    });
                });
            }

            // Save file
            const fullName = (this.formData.personal.fullName || 'Resume').trim();
            const filename = `${fullName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase()}_resume.pdf`;
            pdf.save(filename);

        } catch (error) {
            console.error('Fatal error during PDF generation:', error);
        } finally {
            if (downloadBtn) {
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            }
        }
    }

    // --- AUTHENTICATION / UI MANAGEMENT ---
    async handleAuth() {
        const { data: { user } } = await supabase.auth.getUser();
        this.currentUser = user;
        const authButton = document.getElementById('authButton');
        const authText = document.getElementById('authText');
        const saveButton = document.getElementById('saveResumeBtn');

        if (user) {
            authButton.innerHTML = 'Logout';
            authButton.onclick = async () => {
                await supabase.auth.signOut();
                this.handleAuth();
                alert('You have been logged out.');
            };
            authText.innerHTML = `Signed in as: <strong>${user.email}</strong>`;
            saveButton.style.display = 'inline-flex';
            this.loadResumeDraft(); 
        } else {
            authButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login / Sign Up';
            authButton.onclick = () => {
                alert('For this prototype, please sign up/log in using a dedicated Supabase page. This button only logs out once you are logged in.');
            };
            authButton.classList.remove('active');
            authText.innerHTML = 'Log in to save your draft.';
            saveButton.style.display = 'none';
            this.populateForm({ personal: {}, experience: [], education: [], skills: [] }); 
        }
    }

    // --- SAVE LOGIC (Saves to Supabase RLS protected table) ---
    async saveResumeDraft() {
        if (!this.currentUser) {
            alert('Please log in to save your resume.');
            return;
        }

        const saveBtn = document.getElementById('saveResumeBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;
        
        this.collectFormData();
        
        try {
            // Check if user already has a resume (for UPDATE operation)
            const { data: existingResume } = await supabase
                .from('resumes')
                .select('id')
                .eq('user_id', this.currentUser.id)
                .limit(1);
            
            const resumeDataToSave = {
                user_id: this.currentUser.id, 
                data_json: this.formData,
            };
            
            let saveError;
            
            if (existingResume && existingResume.length > 0) {
                // UPDATE existing record
                const { error } = await supabase
                    .from('resumes')
                    .update(resumeDataToSave)
                    .eq('id', existingResume[0].id);
                saveError = error;
                if (!saveError) alert('Draft updated successfully!');
            } else {
                // INSERT new record
                const { error } = await supabase
                    .from('resumes')
                    .insert([resumeDataToSave]);
                saveError = error;
                if (!saveError) alert('Draft saved successfully!');
            }
            
            if (saveError) throw saveError;

        } catch (error) {
            console.error('Database Save Error:', error);
            alert('Error saving draft. Check Supabase RLS policies or console.');
        } finally {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    }
    
    // --- LOAD LOGIC (Loads from Supabase RLS protected table) ---
    async loadResumeDraft() {
        if (!this.currentUser) return;

        try {
            const { data } = await supabase
                .from('resumes')
                .select('data_json')
                .eq('user_id', this.currentUser.id)
                .limit(1);
            
            if (data && data.length > 0) {
                const savedData = data[0].data_json;
                this.populateForm(savedData);
                this.updatePreview(); 
            }

        } catch (error) {
            console.error('Database Load Error:', error);
        }
    }
    
    // --- POPULATE HELPER (Fills the form fields from JSON data) ---
    populateForm(data) {
        if (!data) return;

        // 1. Static Fields
        document.getElementById('fullName').value = data.personal.fullName || '';
        document.getElementById('email').value = data.personal.email || '';
        document.getElementById('phone').value = data.personal.phone || '';
        document.getElementById('location').value = data.personal.location || '';
        document.getElementById('website').value = data.personal.website || '';
        document.getElementById('summary').value = data.summary || '';
        document.getElementById('skills').value = (data.skills || []).join(', ');

        // 2. Clear and Repopulate Dynamic Fields
        document.getElementById('experienceContainer').innerHTML = ''; 
        document.getElementById('educationContainer').innerHTML = '';
        
        // Repopulate Experience
        (data.experience || []).forEach(exp => {
            this.addExperienceField();
            const items = document.querySelectorAll('.experience-item');
            const item = items[items.length - 1];
            item.querySelector('.exp-title').value = exp.title || '';
            item.querySelector('.exp-company').value = exp.company || '';
            item.querySelector('.exp-start').value = exp.startDate || '';
            item.querySelector('.exp-end').value = exp.endDate || '';
            item.querySelector('.exp-description').value = exp.description || '';
        });
        
        // Repopulate Education
        (data.education || []).forEach(edu => {
            this.addEducationField();
            const items = document.querySelectorAll('.education-item');
            const item = items[items.length - 1];
            item.querySelector('.edu-degree').value = edu.degree || '';
            item.querySelector('.edu-school').value = edu.school || '';
            item.querySelector('.edu-year').value = edu.year || '';
            item.querySelector('.edu-gpa').value = edu.gpa || '';
        });
        
        // Ensure one blank field exists for user input if the loaded data was empty
        if ((data.experience || []).length === 0) this.addExperienceField();
        if ((data.education || []).length === 0) this.addEducationField();

        this.updatePreview(); 
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
