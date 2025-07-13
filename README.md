# Face Login Prototype

This project is a prototype for a facial recognition login system. It uses Face API.js for in-browser face detection and recognition, and a PHP backend for user management.

## Features

- User registration with face capture
- User login with face recognition
- Session management
- File-based user storage (no database required)

## Project Structure

```
/face-login-prototype/
├── index.html       (Login page)
├── register.html    (Registration page)
├── dashboard.php    (User dashboard)
├── logout.php       (Logout script)
├── login.php        (Login handling script)
├── register.php     (Registration handling script)
├── users.php        (Script to fetch user data)
├── js/
│   └── face.js      (Face API integration)
├── users/           (Stores user data as JSON files)
├── face-api/        (Face API.js models)
└── README.md
```

## Setup

1. **Web Server:** You need a web server with PHP support (e.g., Apache, Nginx).
2. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```
3. **Place files:** Place the contents of this repository in the root directory of your web server.
4. **Permissions:** Ensure that the `users/` directory is writable by the web server.
   ```bash
   chmod -R 755 users/
   ```
5. **HTTPS:** For webcam access in modern browsers, you **must** serve the application over HTTPS. You can use a self-signed certificate for local development.

## Usage

### Registration

1. Open `https://your-domain.com/register.html` in your browser.
2. Fill in your name and email address.
3. Allow the browser to access your webcam.
4. Click the "Capture Face" button 5 times to capture your facial descriptors.
5. Click the "Register" button.

### Login

1. Open `https://your-domain.com/index.html` in your browser.
2. Allow the browser to access your webcam.
3. Click the "Login via Face" button.
4. If your face is recognized, you will be redirected to the dashboard.

### Logout

1. On the dashboard, click the "Logout" button.

## Security Considerations

- **HTTPS is mandatory** for webcam access and to protect data in transit.
- The `users/` directory should be protected from direct access.
- This is a prototype and does not include advanced security features like data encryption. Do not use in a production environment without further security enhancements.
