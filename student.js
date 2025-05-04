document.addEventListener('DOMContentLoaded', () => {
    const studentNameSpan = document.getElementById('studentName');
    const assignmentsListDiv = document.getElementById('assignmentsList');
    const submitAssignmentSection = document.getElementById('submitAssignmentSection');
    const submitAssignmentForm = document.getElementById('submitAssignmentForm');
    const currentAssignmentTitleSpan = document.getElementById('currentAssignmentTitle');
    const submissionContentInput = document.getElementById('submissionContent');
    const cancelSubmitBtn = document.getElementById('cancelSubmitBtn');
    const gradesListDiv = document.getElementById('gradesList');

    const username = localStorage.getItem('username');
    if (!username) {
        alert('No student logged in. Redirecting to login.');
        window.location.href = 'index.html';
        return;
    }
    studentNameSpan.textContent = username;

    let assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    let submissions = JSON.parse(localStorage.getItem('submissions') || '[]');

    let currentAssignment = null;

    function renderAssignments() {
        if (assignments.length === 0) {
            assignmentsListDiv.innerHTML = '<p>No assignments available.</p>';
            return;
        }
        assignmentsListDiv.innerHTML = '';
        assignments.forEach((assignment, index) => {
            const div = document.createElement('div');
            div.className = 'assignment-item';
            div.innerHTML = `
                <strong>${assignment.title}</strong> - ${assignment.subject} - Due: ${assignment.deadline}
                <button data-index="${index}" class="submitBtn">Submit</button>
                <button data-index="${index}" class="deleteAssignmentBtn">Delete</button>
            `;
            assignmentsListDiv.appendChild(div);
        });
    }

    function renderGrades() {
        const studentSubmissions = submissions.filter(sub => sub.studentName === username);
        if (studentSubmissions.length === 0) {
            gradesListDiv.innerHTML = '<p>No grades available yet.</p>';
            return;
        }
        gradesListDiv.innerHTML = '';
        studentSubmissions.forEach((sub, index) => {
            const div = document.createElement('div');
            div.className = 'grade-item';
            div.innerHTML = `
                <p><strong>Assignment:</strong> ${sub.assignmentTitle}</p>
                <p><strong>Grade:</strong> ${sub.grade || 'Not graded yet'}</p>
                <button data-index="${index}" class="deleteSubmissionBtn">Delete</button>
                <hr/>
            `;
            gradesListDiv.appendChild(div);
        });
    }

    assignmentsListDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('submitBtn')) {
            const index = e.target.getAttribute('data-index');
            currentAssignment = assignments[index];
            currentAssignmentTitleSpan.textContent = currentAssignment.title;
            // Clear the file input value
            const fileInput = document.getElementById('submissionFile');
            if (fileInput) {
                fileInput.value = '';
            }
            submitAssignmentSection.style.display = 'block';
            window.scrollTo(0, document.body.scrollHeight);
        } else if (e.target.classList.contains('deleteAssignmentBtn')) {
            const index = e.target.getAttribute('data-index');
            if (confirm('Are you sure you want to delete this assignment? This will also delete related submissions.')) {
                // Remove assignment
                const assignmentTitle = assignments[index].title;
                assignments.splice(index, 1);
                localStorage.setItem('assignments', JSON.stringify(assignments));
                // Remove related submissions
                submissions = submissions.filter(sub => sub.assignmentTitle !== assignmentTitle);
                localStorage.setItem('submissions', JSON.stringify(submissions));
                renderAssignments();
                renderGrades();
            }
        }
    });

    submitAssignmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('submissionFile');
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a file to submit.');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
            const fileData = event.target.result; // base64 encoded file data
            // Check if submission already exists for this assignment and student
            const existingIndex = submissions.findIndex(sub => sub.assignmentTitle === currentAssignment.title && sub.studentName === username);
            if (existingIndex !== -1) {
                submissions[existingIndex].fileName = file.name;
                submissions[existingIndex].fileData = fileData;
                submissions[existingIndex].grade = null; // reset grade on resubmission
                delete submissions[existingIndex].content; // remove old content if any
            } else {
                submissions.push({
                    assignmentTitle: currentAssignment.title,
                    studentName: username,
                    fileName: file.name,
                    fileData: fileData,
                    grade: null
                });
            }
            localStorage.setItem('submissions', JSON.stringify(submissions));
            alert('Submission saved.');
            submitAssignmentSection.style.display = 'none';
            renderGrades();
        };
        reader.readAsDataURL(file);
    });

    cancelSubmitBtn.addEventListener('click', () => {
        submitAssignmentSection.style.display = 'none';
    });

    gradesListDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('deleteSubmissionBtn')) {
            const index = e.target.getAttribute('data-index');
            if (confirm('Are you sure you want to delete this submission?')) {
                submissions.splice(index, 1);
                localStorage.setItem('submissions', JSON.stringify(submissions));
                renderGrades();
            }
        }
    });

    renderAssignments();
    renderGrades();
});
