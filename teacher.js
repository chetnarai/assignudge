document.addEventListener('DOMContentLoaded', () => {
    const teacherNameSpan = document.getElementById('teacherName');
    const uploadForm = document.getElementById('uploadAssignmentForm');
    const assignmentsListDiv = document.getElementById('assignmentsList');
    const submissionsListDiv = document.getElementById('submissionsList');

    const username = localStorage.getItem('username');
    if (!username) {
        alert('No teacher logged in. Redirecting to login.');
        window.location.href = 'index.html';
        return;
    }
    teacherNameSpan.textContent = username;

    // Load assignments from localStorage
    let assignments = JSON.parse(localStorage.getItem('assignments') || '[]');

    function saveAssignments() {
        localStorage.setItem('assignments', JSON.stringify(assignments));
    }

    function renderAssignments() {
        if (assignments.length === 0) {
            assignmentsListDiv.innerHTML = '<p>No assignments uploaded yet.</p>';
            return;
        }
        assignmentsListDiv.innerHTML = '';
        assignments.forEach((assignment, index) => {
            const div = document.createElement('div');
            div.className = 'assignment-item';
            div.innerHTML = `
                <strong>${assignment.title}</strong> - ${assignment.subject} - Due: ${assignment.deadline}
                <button data-index="${index}" class="viewSubmissionsBtn">View Submissions</button>
                <button data-index="${index}" class="deleteAssignmentBtn">Delete</button>
            `;
            assignmentsListDiv.appendChild(div);
        });
    }

    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const subject = document.getElementById('subjectSelect').value;
        const title = document.getElementById('assignmentTitle').value.trim();
        const deadline = document.getElementById('deadline').value;
        const fileInput = document.getElementById('assignmentFile');
        const file = fileInput.files[0];

        if (!subject || !title || !deadline || !file) {
            alert('Please fill all fields and select a file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const fileData = event.target.result; // base64 encoded file data
            assignments.push({ subject, title, deadline, fileName: file.name, fileData });
            saveAssignments();
            renderAssignments();
            uploadForm.reset();
        };
        reader.readAsDataURL(file);
    });

    // Load submissions from localStorage
    let submissions = JSON.parse(localStorage.getItem('submissions') || '[]');

    function saveSubmissions() {
        localStorage.setItem('submissions', JSON.stringify(submissions));
    }

    function renderSubmissions(assignmentIndex) {
        submissionsListDiv.innerHTML = '';
        const assignment = assignments[assignmentIndex];
        if (!assignment) {
            submissionsListDiv.innerHTML = '<p>Invalid assignment selected.</p>';
            return;
        }
        const filteredSubs = submissions.filter(sub => sub.assignmentTitle === assignment.title);
        if (filteredSubs.length === 0) {
            submissionsListDiv.innerHTML = '<p>No submissions for this assignment yet.</p>';
            return;
        }
        filteredSubs.forEach((sub, idx) => {
            const div = document.createElement('div');
            div.className = 'submission-item';
            let submissionDisplay = '';
            if (sub.fileName && sub.fileData) {
                submissionDisplay = `<a href="${sub.fileData}" download="${sub.fileName}">${sub.fileName}</a>`;
            } else {
                submissionDisplay = sub.content || 'No submission content';
            }
            div.innerHTML = `
                <p><strong>Student:</strong> ${sub.studentName}</p>
                <p><strong>Submission:</strong> ${submissionDisplay}</p>
                <p><strong>Grade:</strong> ${sub.grade || 'Not graded'}</p>
                <button data-submission-index="${idx}" class="deleteSubmissionBtn">Delete</button>
                <label>
                    Grade:
                    <input type="text" data-submission-index="${idx}" class="gradeInput" value="${sub.grade || ''}" />
                </label>
                <button data-submission-index="${idx}" class="saveGradeBtn">Save Grade</button>
                <hr/>
            `;
            submissionsListDiv.appendChild(div);
        });

        // Add event listeners for grading
        const saveGradeButtons = document.querySelectorAll('.saveGradeBtn');
        saveGradeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const idx = button.getAttribute('data-submission-index');
                const gradeInput = document.querySelector(`.gradeInput[data-submission-index="${idx}"]`);
                submissions[idx].grade = gradeInput.value.trim();
                saveSubmissions();
                alert('Grade saved.');
                renderSubmissions(assignmentIndex);
            });
        });
    }

    // Event delegation for view submissions buttons
    assignmentsListDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('viewSubmissionsBtn')) {
            const index = e.target.getAttribute('data-index');
            renderSubmissions(index);
            // Scroll to student submissions section
            const submissionsSection = document.getElementById('submissionsSection');
            if (submissionsSection) {
                submissionsSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (e.target.classList.contains('deleteAssignmentBtn')) {
            const index = e.target.getAttribute('data-index');
            if (confirm('Are you sure you want to delete this assignment? This will also delete related submissions.')) {
                const assignmentTitle = assignments[index].title;
                assignments.splice(index, 1);
                saveAssignments();
                submissions = submissions.filter(sub => sub.assignmentTitle !== assignmentTitle);
                saveSubmissions();
                renderAssignments();
                renderSubmissions(-1);
            }
        }
    });

    renderAssignments();
});
