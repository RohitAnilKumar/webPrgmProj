/* ===== Login Handler ===== */
function handle_login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value;

    clearErrors();

    let hasError = false;

    if (!email) {
        showError('email', 'Please enter your email address.');
        hasError = true;
    }
    if (!pass) {
        showError('password', 'Please enter your password.');
        hasError = true;
    }

    if (hasError) return;

    // Admin login
    if (email === 'admin@admin.com' && pass === 'admin') {
        sessionStorage.setItem('currentUser', JSON.stringify({ username: 'Admin', email: email, role: 'admin' }));
        window.location.href = 'admin.html';
        return;
    }

    // Student login — validate against registered users
    var users = JSON.parse(localStorage.getItem('users') || '[]');
    var user = users.find(function (u) { return u.email === email && u.password === pass; });

    if (user) {
        sessionStorage.setItem('currentUser', JSON.stringify({ username: user.username, email: user.email, role: 'student' }));
        window.location.href = 'student.html';
    } else {
        showError('email', 'Invalid email or password. Please try again.');
    }
}

/* ===== Signup Handler ===== */
function handle_signup(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value;

    clearErrors();

    let hasError = false;

    if (!username || username.length < 3) {
        showError('username', 'Username must be at least 3 characters.');
        hasError = true;
    }
    if (!email) {
        showError('email', 'Please enter a valid email address.');
        hasError = true;
    }
    if (!pass || pass.length < 6) {
        showError('password', 'Password must be at least 6 characters.');
        hasError = true;
    }

    if (hasError) return;

    // Check if email already exists
    var users = JSON.parse(localStorage.getItem('users') || '[]');
    var exists = users.find(function (u) { return u.email === email; });
    if (exists) {
        showError('email', 'An account with this email already exists.');
        return;
    }

    // Save user to localStorage
    users.push({ username: username, email: email, password: pass });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Account created successfully! Redirecting to login...');
    window.location.href = 'login.html';
}

/* ===== Form Validation Helpers ===== */
function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    input.classList.add('input-error');
    const errorEl = document.getElementById(fieldId + '-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }
}

function clearErrors() {
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('visible');
        el.textContent = '';
    });
}

/* ===== Quiz Timer ===== */
let timerInterval = null;
let timeLeft = 300; // 5 minutes
const totalTime = 300;

function startTimer() {
    const timerEl = document.getElementById('timer');
    const canvas = document.getElementById('timer-canvas');
    if (!timerEl || !canvas) return;

    updateTimerDisplay(timerEl);
    drawClock(canvas, timeLeft, totalTime);

    timerInterval = setInterval(function () {
        timeLeft--;
        updateTimerDisplay(timerEl);
        drawClock(canvas, timeLeft, totalTime);

        if (timeLeft <= 60) {
            timerEl.classList.add('timer-warning');
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('Time is up! Submitting your quiz automatically.');
            scoreQuiz();
        }
    }, 1000);
}

function updateTimerDisplay(timerEl) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerEl.textContent = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function drawClock(canvas, remaining, total) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 6;
    const fraction = remaining / total;

    ctx.clearRect(0, 0, w, h);

    // Background circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f1f3f5';
    ctx.fill();

    // Outer ring (track)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Countdown arc (fills clockwise from top)
    var arcColor;
    if (fraction > 0.5) {
        arcColor = '#4361ee';
    } else if (fraction > 0.2) {
        arcColor = '#f4a261';
    } else {
        arcColor = '#e63946';
    }

    var startAngle = -Math.PI / 2;
    var endAngle = startAngle + (Math.PI * 2 * fraction);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = arcColor;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Inner circle (white face)
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 12, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Tick marks for minutes (12 ticks like a real clock)
    for (var i = 0; i < 12; i++) {
        var angle = (Math.PI * 2 / 12) * i - Math.PI / 2;
        var innerR = radius - 20;
        var outerR = radius - 14;

        if (i % 3 === 0) {
            // Major ticks (at 12, 3, 6, 9)
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#343a40';
            innerR = radius - 24;
        } else {
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#adb5bd';
        }

        var x1 = cx + Math.cos(angle) * innerR;
        var y1 = cy + Math.sin(angle) * innerR;
        var x2 = cx + Math.cos(angle) * outerR;
        var y2 = cy + Math.sin(angle) * outerR;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = arcColor;
    ctx.fill();

    // Minute hand (pointing based on minutes remaining)
    var minutes = Math.floor(remaining / 60);
    var seconds = remaining % 60;
    var minuteAngle = (Math.PI * 2 / 5) * minutes - Math.PI / 2; // 5-minute scale
    var minuteHandLen = radius - 30;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(minuteAngle) * minuteHandLen, cy + Math.sin(minuteAngle) * minuteHandLen);
    ctx.strokeStyle = '#343a40';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Second hand
    var secondAngle = (Math.PI * 2 / 60) * seconds - Math.PI / 2;
    var secondHandLen = radius - 20;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(secondAngle) * secondHandLen, cy + Math.sin(secondAngle) * secondHandLen);
    ctx.strokeStyle = arcColor;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Center cap (over hands)
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = arcColor;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
}

/* ===== Quiz Submission ===== */
function submit_quiz(event) {
    event.preventDefault();

    if (!confirm('Are you sure you want to submit the quiz?')) return;

    clearInterval(timerInterval);
    scoreQuiz();
}

function scoreQuiz() {
    var questions = document.querySelectorAll('#quiz-form .question');
    let score = 0;
    const totalQuestions = questions.length;

    questions.forEach(function (questionDiv, i) {
        var qName = 'q' + (i + 1);
        var correctAnswer = questionDiv.getAttribute('data-correct');
        const selected = document.querySelector('input[name="' + qName + '"]:checked');
        const options = questionDiv.querySelectorAll('.option');

        if (selected && selected.value === correctAnswer) {
            score++;
            questionDiv.classList.add('correct');
        } else {
            questionDiv.classList.add('wrong');
        }

        // Highlight correct and wrong options
        options.forEach(function (option) {
            const radio = option.querySelector('input[type="radio"]');
            if (radio.value === correctAnswer) {
                option.classList.add('correct-answer');
            } else if (selected && radio.value === selected.value && radio.value !== correctAnswer) {
                option.classList.add('wrong-answer');
            }
            radio.disabled = true;
        });
    });

    // Disable submit button
    const submitBtn = document.querySelector('#quiz-form button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // Show results
    const resultsDiv = document.getElementById('quiz-results');
    if (resultsDiv) {
        const percentage = Math.round((score / totalQuestions) * 100);
        let message = '';
        if (percentage === 100) message = 'Perfect score! Excellent work! ';
        else if (percentage >= 66) message = 'Great job! Keep it up! ';
        else if (percentage >= 33) message = 'Good effort! Review the highlighted answers. ';
        else message = 'Keep studying! You\'ll do better next time. ';

        resultsDiv.innerHTML =
            '<h3>Quiz Results</h3>' +
            '<div class="score-display">' + score + ' / ' + totalQuestions + '</div>' +
            '<p class="score-message">' + message + '</p>' +
            '<div style="display: flex; justify-content: center; gap: 12px; margin-top: 16px;">' +
            '   <button class="btn-secondary" onclick="showCertificateModal(\'' + document.title.split(' —')[0].replace(/'/g, "\\'") + '\', ' + percentage + ')">View Certificate</button>' +
            '   <a href="student.html" class="btn-primary">Back to Dashboard</a>' +
            '</div>';
        resultsDiv.classList.add('visible');
    }

    // Save result to localStorage (per-user)
    var quizId = document.body.getAttribute('data-quiz-id');
    var userEmail = getCurrentUserEmail();
    if (quizId && userEmail) {
        var results = JSON.parse(localStorage.getItem('quizResults') || '{}');
        if (!results[userEmail]) results[userEmail] = {};
        results[userEmail][quizId] = { score: score, total: totalQuestions };
        localStorage.setItem('quizResults', JSON.stringify(results));
    }
}

/* ===== Add Question (Create Quiz) ===== */
function add_question() {
    const container = document.getElementById('questions-container');
    const questionCount = container.querySelectorAll('.question-block').length + 1;
    const prefix = 'q' + questionCount;

    const block = document.createElement('div');
    block.className = 'question-block';
    block.innerHTML =
        '<h4>Question ' + questionCount + '</h4>' +
        '<div class="form-group">' +
        '    <label for="' + prefix + '-text">Question Text</label>' +
        '    <input type="text" id="' + prefix + '-text" name="' + prefix + '-text" required>' +
        '</div>' +
        '<div class="form-group">' +
        '    <label>Options</label>' +
        '    <input type="text" name="' + prefix + '-op1" placeholder="Option 1" required>' +
        '    <input type="text" name="' + prefix + '-op2" placeholder="Option 2" required>' +
        '    <input type="text" name="' + prefix + '-op3" placeholder="Option 3" required>' +
        '    <input type="text" name="' + prefix + '-op4" placeholder="Option 4" required>' +
        '</div>' +
        '<div class="form-group">' +
        '    <label for="' + prefix + '-correct">Correct Answer</label>' +
        '    <input type="text" id="' + prefix + '-correct" name="' + prefix + '-correct" placeholder="Enter the correct option text" required>' +
        '</div>';
    container.appendChild(block);
    block.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ===== Create Quiz Handler ===== */
function create_quiz(event) {
    event.preventDefault();

    var title = document.getElementById('quiz-title').value.trim();
    if (!title) {
        alert('Please enter a quiz title.');
        document.getElementById('quiz-title').focus();
        return;
    }

    var blocks = document.querySelectorAll('#questions-container .question-block');
    if (blocks.length === 0) {
        alert('Please add at least one question.');
        return;
    }

    var questions = [];
    var valid = true;

    blocks.forEach(function (block, index) {
        var prefix = 'q' + (index + 1);
        var textInput = block.querySelector('input[name="' + prefix + '-text"]');
        var op1 = block.querySelector('input[name="' + prefix + '-op1"]');
        var op2 = block.querySelector('input[name="' + prefix + '-op2"]');
        var op3 = block.querySelector('input[name="' + prefix + '-op3"]');
        var op4 = block.querySelector('input[name="' + prefix + '-op4"]');
        var correctInput = block.querySelector('input[name="' + prefix + '-correct"]');

        if (!textInput || !textInput.value.trim()) {
            alert('Please fill in the text for Question ' + (index + 1) + '.');
            valid = false;
            return;
        }
        if (!op1 || !op1.value.trim() || !op2 || !op2.value.trim() ||
            !op3 || !op3.value.trim() || !op4 || !op4.value.trim()) {
            alert('Please fill in all 4 options for Question ' + (index + 1) + '.');
            valid = false;
            return;
        }
        if (!correctInput || !correctInput.value.trim()) {
            alert('Please specify the correct answer for Question ' + (index + 1) + '.');
            valid = false;
            return;
        }

        questions.push({
            text: textInput.value.trim(),
            options: [op1.value.trim(), op2.value.trim(), op3.value.trim(), op4.value.trim()],
            correct: correctInput.value.trim()
        });
    });

    if (!valid) return;

    // Save to localStorage
    var quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    var newQuiz = {
        id: 'quiz_' + Date.now(),
        title: title,
        questions: questions,
        status: 'Active',
        createdAt: new Date().toISOString()
    };
    quizzes.push(newQuiz);
    localStorage.setItem('quizzes', JSON.stringify(quizzes));

    alert('Quiz "' + title + '" created successfully with ' + questions.length + ' question(s)!');
    window.location.href = 'admin.html';
}

/* ===== Load Admin Quizzes ===== */
function loadAdminQuizzes() {
    var tbody = document.querySelector('.table tbody');
    if (!tbody) return;
    // Only run on admin page
    if (!document.querySelector('title') || document.querySelector('title').textContent.indexOf('Admin') === -1) return;

    var quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    quizzes.forEach(function (quiz) {
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td><strong>' + quiz.title + '</strong></td>' +
            '<td><span class="badge badge-active">' + quiz.status + '</span></td>' +
            '<td><a href="#" class="btn-secondary" style="padding: 6px 14px; font-size: 0.85rem;" onclick="viewScores(\'' + quiz.id + '\', \'' + quiz.title.replace(/'/g, "\\'") + '\')">View Scores</a> ' +
            '<button class="btn-danger" style="padding: 6px 14px; font-size: 0.85rem;" onclick="deleteQuiz(\'' + quiz.id + '\')">Delete</button></td>';
        tbody.appendChild(tr);
    });
}

/* ===== Delete Quiz ===== */
function deleteQuiz(quizId) {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    var quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    quizzes = quizzes.filter(function (q) { return q.id !== quizId; });
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    location.reload();
}

/* ===== View Scores ===== */
function viewScores(quizId, quizTitle) {
    var results = JSON.parse(localStorage.getItem('quizResults') || '{}');
    var users = JSON.parse(localStorage.getItem('users') || '[]');

    // Build score entries from all users who have results for this quiz
    var scoreEntries = [];
    for (var email in results) {
        if (results[email] && results[email][quizId]) {
            var r = results[email][quizId];
            // Find username for this email
            var user = users.find(function (u) { return u.email === email; });
            var name = user ? user.username : email;
            scoreEntries.push({ name: name, score: r.score, total: r.total });
        }
    }

    // Build modal content
    var modal = document.getElementById('scores-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'scores-modal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    var tableHtml = '';
    if (scoreEntries.length > 0) {
        tableHtml = '<table class="table" style="margin-top: 16px; text-align: left;">' +
            '<thead><tr><th>Student</th><th>Score</th><th>Percentage</th></tr></thead><tbody>';
        scoreEntries.forEach(function (entry) {
            var pct = Math.round((entry.score / entry.total) * 100);
            var badgeClass = pct >= 66 ? 'badge-active' : pct >= 33 ? 'badge-draft' : 'badge-not-attempted';
            tableHtml += '<tr>' +
                '<td><strong>' + entry.name + '</strong></td>' +
                '<td>' + entry.score + ' / ' + entry.total + '</td>' +
                '<td><span class="badge ' + badgeClass + '">' + pct + '%</span></td>' +
                '</tr>';
        });
        tableHtml += '</tbody></table>';
    } else {
        tableHtml = '<p style="color: var(--text-light); margin-top: 16px;">No students have attempted this quiz yet.</p>';
    }

    modal.innerHTML =
        '<div class="proctor-content">' +
        '  <h3>📊 Scores: ' + (quizTitle || quizId) + '</h3>' +
        tableHtml +
        '  <button class="btn-primary" style="margin-top: 20px;" onclick="closeScoresModal()">Close</button>' +
        '</div>';
    modal.classList.add('visible');
}

function closeScoresModal() {
    var modal = document.getElementById('scores-modal');
    if (modal) modal.classList.remove('visible');
}

/* ===== Certificate Logic ===== */
function showCertificateModal(quizTitle, percentage) {
    var modal = document.getElementById('certificate-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'certificate-modal';
        modal.className = 'modal-overlay';

        modal.innerHTML =
            '<div class="proctor-content" style="max-width: 850px; padding: 30px;">' +
            '  <canvas id="cert-canvas" width="800" height="550" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);"></canvas>' +
            '  <div style="margin-top: 24px; display: flex; gap: 12px; justify-content: center;">' +
            '      <button class="btn-primary" onclick="downloadCertificate()">Download PNG</button>' +
            '      <button class="btn-secondary" onclick="closeCertificateModal()">Close</button>' +
            '  </div>' +
            '</div>';

        document.body.appendChild(modal);
    }

    modal.classList.add('visible');

    // Draw certificate
    var canvas = document.getElementById('cert-canvas');
    var currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    var name = currentUser.username || 'Student';
    drawCertificate(canvas, name, quizTitle, percentage, new Date().toLocaleDateString());
}

function closeCertificateModal() {
    var modal = document.getElementById('certificate-modal');
    if (modal) modal.classList.remove('visible');
}

function downloadCertificate() {
    var canvas = document.getElementById('cert-canvas');
    var link = document.createElement('a');
    link.download = 'QuizHub-Certificate.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function drawCertificate(canvas, name, quizTitle, percentage, date) {
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;

    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, w, h);

    // Outer border
    ctx.strokeStyle = '#4361ee'; // Primary color
    ctx.lineWidth = 15;
    ctx.strokeRect(15, 15, w - 30, h - 30);

    // Inner border
    ctx.strokeStyle = '#3f37c9';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    // Corner accents
    var drawCorner = function (x, y) {
        ctx.fillStyle = '#f72585'; // Accent color
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fill();
    };
    drawCorner(40, 40);
    drawCorner(w - 40, 40);
    drawCorner(40, h - 40);
    drawCorner(w - 40, h - 40);

    // Heading
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF COMPLETION', w / 2, 120);

    // Subheading
    ctx.fillStyle = '#6c757d';
    ctx.font = 'italic 24px Arial, sans-serif';
    ctx.fillText('This is to certify that', w / 2, 180);

    // Name
    ctx.fillStyle = '#4361ee';
    ctx.font = 'bold 54px Arial, sans-serif';
    ctx.fillText(name, w / 2, 250);

    // Decorative line under name
    ctx.beginPath();
    ctx.moveTo(w / 2 - 200, 270);
    ctx.lineTo(w / 2 + 200, 270);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Quiz description
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '22px Arial, sans-serif';
    ctx.fillText('has successfully completed the assessment for:', w / 2, 320);

    ctx.fillStyle = '#f72585';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillText(quizTitle, w / 2, 370);

    // Score
    ctx.fillStyle = '#6c757d';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText('with a score of ' + percentage + '%', w / 2, 420);

    // Date & Signature
    ctx.font = '20px Arial, sans-serif';
    ctx.fillStyle = '#1a1a2e';

    // Line for date
    ctx.beginPath();
    ctx.moveTo(150, 480);
    ctx.lineTo(300, 480);
    ctx.stroke();
    ctx.fillText(date, 225, 470);
    ctx.fillText('Date', 225, 510);

    // Line for signature
    ctx.beginPath();
    ctx.moveTo(w - 300, 480);
    ctx.lineTo(w - 150, 480);
    ctx.stroke();

    ctx.font = 'italic 26px "Brush Script MT", cursive';
    ctx.fillText('QuizHub Admin', w - 225, 470);
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText('Authorized Signature', w - 225, 510);
}

/* ===== Leaderboard ===== */
function populateLeaderboard() {
    const tbody = document.querySelector('#leaderboard tbody');
    if (!tbody) return;

    const players = [
        { rank: 1, name: 'Arjun Mehta', score: 950 },
        { rank: 2, name: 'Priya Sharma', score: 920 },
        { rank: 3, name: 'Rahul Gupta', score: 890 },
        { rank: 4, name: 'Sneha Patel', score: 870 },
        { rank: 5, name: 'Vikram Singh', score: 845 }
    ];

    const medals = ['🥇', '🥈', '🥉', '', ''];

    tbody.innerHTML = '';
    players.forEach(function (player, i) {
        const tr = document.createElement('tr');
        tr.innerHTML =
            '<td>' + (medals[i] ? medals[i] + ' ' : '') + player.rank + '</td>' +
            '<td><strong>' + player.name + '</strong></td>' +
            '<td>' + player.score + '</td>';
        tbody.appendChild(tr);
    });
}

/* ===== Logout ===== */
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

/* ===== Get Current User Email ===== */
function getCurrentUserEmail() {
    var currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    return currentUser ? currentUser.email : null;
}

/* ===== Display Welcome Message ===== */
function displayWelcomeMessage() {
    var welcomeEl = document.getElementById('welcome-message');
    if (!welcomeEl) return;

    var currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.username) {
        welcomeEl.textContent = 'Welcome, ' + currentUser.username + '! Choose a quiz below to get started.';
    }
}

/* ===== Update Student Dashboard ===== */
function updateStudentDashboard() {
    var rows = document.querySelectorAll('tr[data-quiz]');
    if (rows.length === 0) return;

    var userEmail = getCurrentUserEmail();
    if (!userEmail) return;
    var allResults = JSON.parse(localStorage.getItem('quizResults') || '{}');
    var results = allResults[userEmail] || {};

    rows.forEach(function (row) {
        var quizId = row.getAttribute('data-quiz');
        if (results[quizId]) {
            var r = results[quizId];
            var statusCell = row.querySelector('.quiz-status');
            if (statusCell) {
                statusCell.innerHTML = '<span class="badge badge-active">Completed (' + r.score + '/' + r.total + ')</span>';
            }
            var actionCell = row.querySelector('.quiz-action');
            if (actionCell) {
                var link = actionCell.querySelector('a');
                if (link) {
                    link.textContent = 'Retake Quiz';
                    link.classList.remove('btn-primary');
                    link.classList.add('btn-secondary');
                }
            }
        }
    });
}

/* ===== Load Student Quizzes (from admin-created) ===== */
function loadStudentQuizzes() {
    var tbody = document.querySelector('.table tbody');
    if (!tbody) return;
    // Only run on student page
    if (!document.querySelector('title') || document.querySelector('title').textContent.indexOf('Student') === -1) return;

    var quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    var userEmail = getCurrentUserEmail();
    var allResults = JSON.parse(localStorage.getItem('quizResults') || '{}');
    var results = userEmail ? (allResults[userEmail] || {}) : {};

    quizzes.forEach(function (quiz) {
        var tr = document.createElement('tr');
        tr.setAttribute('data-quiz', quiz.id);

        var statusHtml, actionHtml;
        if (results[quiz.id]) {
            var r = results[quiz.id];
            statusHtml = '<span class="badge badge-active">Completed (' + r.score + '/' + r.total + ')</span>';
            actionHtml = '<a href="take_quiz.html?id=' + quiz.id + '" class="btn-secondary" style="padding: 8px 18px; font-size: 0.85rem;">Retake Quiz</a>';
        } else {
            statusHtml = '<span class="badge badge-not-attempted">Not Attempted</span>';
            actionHtml = '<a href="take_quiz.html?id=' + quiz.id + '" class="btn-primary" style="padding: 8px 18px; font-size: 0.85rem;">Take Quiz</a>';
        }

        tr.innerHTML =
            '<td><strong>' + quiz.title + '</strong></td>' +
            '<td class="quiz-status">' + statusHtml + '</td>' +
            '<td class="quiz-action">' + actionHtml + '</td>';
        tbody.appendChild(tr);
    });
}

/* ===== Fullscreen Proctoring ===== */
var fullscreenViolations = 0;
var maxViolations = 3;
var quizSubmitted = false;
var timerPaused = false;

function enterFullscreen() {
    var el = document.documentElement;
    if (el.requestFullscreen) {
        el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
    }
}

function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}

function initProctoring() {
    var overlay = document.getElementById('proctor-overlay');
    if (!overlay) return;

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenExit);
    document.addEventListener('webkitfullscreenchange', handleFullscreenExit);

    // Show start prompt
    overlay.innerHTML =
        '<div class="proctor-content">' +
        '  <div class="proctor-icon">🔒</div>' +
        '  <h3>Proctored Quiz Mode</h3>' +
        '  <p>This quiz will run in fullscreen mode. Exiting fullscreen will pause the timer and count as a violation.</p>' +
        '  <p class="proctor-warning-text">⚠️ After <strong>3 violations</strong>, your quiz will be auto-submitted.</p>' +
        '  <button class="btn-primary" onclick="startQuizFullscreen()">Start Quiz in Fullscreen</button>' +
        '</div>';
    overlay.classList.add('visible');
}

function startQuizFullscreen() {
    enterFullscreen();
    var overlay = document.getElementById('proctor-overlay');
    if (overlay) overlay.classList.remove('visible');
    startTimer();
}

function handleFullscreenExit() {
    if (quizSubmitted) return;
    if (!document.getElementById('timer-canvas')) return;

    if (!isFullscreen()) {
        fullscreenViolations++;
        pauseTimer();

        if (fullscreenViolations >= maxViolations) {
            showProctorWarning(true);
            setTimeout(function () {
                quizSubmitted = true;
                var overlay = document.getElementById('proctor-overlay');
                if (overlay) overlay.classList.remove('visible');
                autoSubmitQuiz();
            }, 2000);
        } else {
            showProctorWarning(false);
        }
    }
}

/* ===== Auto-Submit (bridge for proctoring) ===== */
function autoSubmitQuiz() {
    clearInterval(timerInterval);
    // Check if this is a dynamic quiz page (take_quiz.html)
    if (document.getElementById('dynamic-questions') && typeof submitDynamicQuiz === 'function') {
        submitDynamicQuiz(null);
    } else {
        scoreQuiz();
    }
}

function pauseTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerPaused = true;
    }
}

function resumeQuiz() {
    enterFullscreen();
    var overlay = document.getElementById('proctor-overlay');
    if (overlay) overlay.classList.remove('visible');

    if (timerPaused && timeLeft > 0) {
        timerPaused = false;
        var timerEl = document.getElementById('timer');
        var canvas = document.getElementById('timer-canvas');
        timerInterval = setInterval(function () {
            timeLeft--;
            updateTimerDisplay(timerEl);
            drawClock(canvas, timeLeft, totalTime);
            if (timeLeft <= 60) timerEl.classList.add('timer-warning');
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert('Time is up! Submitting your quiz automatically.');
                scoreQuiz();
            }
        }, 1000);
    }
}

function showProctorWarning(isFinal) {
    var overlay = document.getElementById('proctor-overlay');
    if (!overlay) return;

    if (isFinal) {
        overlay.innerHTML =
            '<div class="proctor-content proctor-final">' +
            '  <div class="proctor-icon">🚫</div>' +
            '  <h3>Quiz Terminated</h3>' +
            '  <p>You exited fullscreen <strong>' + fullscreenViolations + '</strong> times.</p>' +
            '  <p>Your quiz is being auto-submitted now.</p>' +
            '</div>';
    } else {
        var remaining = maxViolations - fullscreenViolations;
        overlay.innerHTML =
            '<div class="proctor-content">' +
            '  <div class="proctor-icon">⚠️</div>' +
            '  <h3>Warning: Fullscreen Exited</h3>' +
            '  <p>This is <strong>violation #' + fullscreenViolations + '</strong> of ' + maxViolations + '.</p>' +
            '  <p>Timer is <strong>paused</strong>. You have <strong>' + remaining + '</strong> warning(s) left before auto-submit.</p>' +
            '  <button class="btn-primary" onclick="resumeQuiz()">Return to Fullscreen & Resume</button>' +
            '</div>';
    }
    overlay.classList.add('visible');
}

/* ===== Init on Page Load ===== */
document.addEventListener('DOMContentLoaded', function () {
    populateLeaderboard();

    // Start proctored quiz if on quiz page
    if (document.getElementById('timer-canvas')) {
        initProctoring();
    }

    updateStudentDashboard();
    loadAdminQuizzes();
    loadStudentQuizzes();
    displayWelcomeMessage();
});