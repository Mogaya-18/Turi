# Startup, Login, and Registration Guide

## 1. Startup
1. Open your terminal in the root directory of the project.
2. Navigate to the client directory and start the development server:
   ```bash
   cd client
   npm run dev
   ```
3. Once the local host URL is displayed in the terminal:
   * Click the URL to open the preview interface directly within VS Code, **OR**
   * Copy the URL and paste it into your browser (e.g., `http://localhost:5173`).

---

## 2. Login
1. Once the application is launched, you will land on the Login page.
2. Enter your **Email** and **Password** using the test credentials shared in the group chat. 
   > **Note:** Credentials are omitted from this document to prevent password leaks.
3. Upon successfully submitting your credentials, you will receive a success popup and be automatically redirected to your designated portal based on your role (**Patient**, **Doctor**, or **Admin**).

---

## 3. Registration

> ⚠️ **IMPORTANT:** You **MUST** use a valid, active email address during registration to receive the account confirmation email sent to your inbox.

1. Navigate to the Registration page.
2. Fill in the required fields (Full Name, Email, Password, Phone Number, Role).
3. **Employee Code Field:**
   * This field remains disabled for **Patient** signups.
   * Selecting **Doctor** or **Admin** will enable the **Employee Code** input field.
   * Enter a valid employee code (refer to the shared group document for active codes).
4. Click **Register**.
5. Once submitted, check your inbox to confirm your email address.
6. You will be redirected back to the **Login** page where you can sign in with your newly registered credentials.