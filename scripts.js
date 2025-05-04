document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const role = document.getElementById('roleSelect').value;
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!role || !username || !email) {
        alert('Please select a role, enter your name, and email.');
        return;
    }

    // Save user info in localStorage
    localStorage.setItem('userRole', role);
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);

    // Redirect based on role
    if (role === 'teacher') {
        window.location.href = 'teacher.html';
    } else if (role === 'student') {
        window.location.href = 'student.html';
    }
});
