# QuizHub 

QuizHub is a modern, responsive, and feature-rich online quiz platform built as a student web programming project. It allows students to take quizzes across various categories while providing an administrative dashboard for creating and managing custom quizzes.

## Features

### For Students
* **User Authentication**: Secure signup and login system (stored via LocalStorage/SessionStorage).
* **Student Dashboard**: Personalized welcome message and a list of available/completed quizzes.
* **Dynamic & Static Quizzes**: Take predefined quizzes (e.g., Technology, Science, General Knowledge) or dynamically generated quizzes created by the admin.
* **Proctoring System**: 
  * Quizzes enforce **Fullscreen mode** to prevent cheating.
  * Leaving fullscreen triggers a warning modal.
  * Violating the fullscreen rule 3 times will permanently terminate and **auto-submit** the quiz.
* **Instant Results**: Detailed score feedback with highlighted correct and incorrect answers upon submission.

### For Admins
* **Admin Dashboard**: Manage and track all quizzes.
* **Create Quizzes**: A built-in builder to create custom quizzes with custom questions, options, and designated correct answers.
* **View Scores**: An intuitive modal overlay that tracks and displays every student's score, percentage, and completion status for any given quiz.

### UI / UX features
* **Modern Design**: Premium aesthetics using CSS Variables, smooth gradients, and glassmorphism elements.
* **Responsive Layout**: Fully optimized and readable on mobile, tablet, and desktop screens.
* **Interactive Elements**: Micro-animations on hover, dynamic timer warnings (pulsing effect), and color-coded status badges.

##  Built With

* **HTML5**: Semantic tags and clean structure.
* **CSS3**: Custom vanilla CSS implementation (flexbox, grid, animations, custom variables). No external frameworks.
* **Vanilla JavaScript**: DOM manipulation, event listeners, dynamic HTML generation.
* **Web Storage API**:
  * `localStorage` as a mock database for persisting users, admin-created quizzes, and student quiz scores.
  * `sessionStorage` for managing active user sessions across page loads.

##  How to Run locally

Since QuizHub is built entirely with client-side technologies, there is no need for a complex backend or database setup.

1. Clone or download this repository to your local machine.
2. Open the folder containing the project.
3. Simply double-click on `index.html` to open it in your web browser.
4. **Logins for testing**:
   * Admin Account: `admin@admin.com` / `admin`
   * Or create a new free student account via the Sign Up page!
   
> **Note on Proctoring:** The fullscreen proctoring logic requires the site to be interacted with first. Browsers block programmatic fullscreen requests without user interaction.

##  File Structure

* `index.html` - The main landing page.
* `login.html` & `signup.html` - Authentication pages.
* `admin.html` - Admin dashboard.
* `student.html` - Student dashboard.
* `create_quiz.html` - The admin tool for creating new quizzes.
* `take_quiz.html` - Dynamically loads admin-created quizzes.
* `technology_quiz.html`, `science_quiz.html`, `gk_quiz.html` - Pre-built static quizzes.
* `style.css` - Global stylesheet governing the design system.
* `index.js` - Global JavaScript handling all logic, routing, auth, proctoring, and storage.

---

*Built as a Student Project - 2026*
