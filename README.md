# CV/Resume Builder and Management System

## Overview

The CV/Resume Builder and Management System is a modern, fully responsive web application that allows users to create, update, and secure their professional resumes effortlessly. The system features a professional-grade CV editor with multiple sections, profile management, electronic signature support, and secure PDF generation. Built with a mobile-first approach, it works seamlessly across all devices including PDAs, smartphones, tablets, and desktops. The system also incorporates QR codes and barcodes for document verification and anti-forgery measures.

---

## Features

- **User Authentication**
  - Secure sign-up and login with email verification
  - OTP-based authentication for enhanced security
  - Password reset functionality
  - Professional profile management with edit mode

- **CV/Resume Creation & Editing**
  - Professional CV editor with 8 comprehensive sections:
    - Personal Information
    - Professional Summary
    - Work Experience
    - Education
    - Skills (with proficiency levels)
    - Projects
    - Certifications
    - Languages
  - Save multiple drafts and versions
  - Dedicated CV creation and management pages
  - Real-time preview and professional PDF rendering

- **Media Uploads**
  - Upload profile pictures with preview
  - Upload electronic signatures
  - Integrated signature pad for drawing signatures

- **Digital Signing & Handwritten Signatures**
  - Sign CVs using uploaded electronic signatures
  - Draw handwritten signatures using the integrated signature pad
  - Embed signatures in CVs for validation
  - Signature management through profile page

- **Document Security & Verification**
  - Generate and embed QR codes linked to document metadata
  - Generate barcodes for document identification
  - Embed digital signatures for validation
  - Watermarking and anti-forgery security features

- **Export & Download**
  - Generate professional PDF versions
  - Download finalized CVs

- **Version Control & History**
  - Track changes and revisions over time

- **Different Dashboards**
  - Modern user dashboard with CV overview and quick actions
  - Professional profile editor with view/edit modes
  - My CVs page for managing all resumes
  - Admin Dashboard with full privileges for user management and system control

- **Responsive Design**
  - Mobile-first approach for optimal experience
  - Fully responsive across all device sizes:
    - PDAs and small smartphones (< 480px)
    - Standard smartphones (480px - 767px)
    - Tablets (768px - 1023px)
    - Desktop and large screens (> 1024px)
  - Touch-optimized interface with proper touch targets
  - Landscape and portrait orientation support
  - Accessibility features and keyboard navigation
---

## Usage Workflow

1. **Register/Login:**
  - **Register:** Users sign up with email and password. After registration, an activation email is sent with a unique token. The user must activate their account via the email link before logging in.
  - **Login:** Users enter their credentials. Upon successful login, an OTP (One-Time Password) is sent to their registered email. The user must enter the OTP to complete authentication. This enhances security for every login attempt.
  - **Password Forget:** If a user forgets their password, they can request a password reset. A reset link or token is sent to their email, allowing them to securely set a new password.
  - **Activation Mail:** After registration, the system sends an activation email containing a secure token. The user must activate their account before accessing features.
  - **OTP at Login:** Every login triggers an OTP email. The OTP expires after a set time (e.g., 10 minutes) and must be entered to proceed. This prevents unauthorized access and adds an extra layer of security.
2. **Create or Update Profile:** Navigate to the profile page where you can:
   - Edit personal information (name, email, phone, location, occupation)
   - Add a professional bio
   - Upload profile picture
   - Upload or draw your signature using the signature pad
   - View account status and member information
3. **Build Your CV:** 
   - Click "Create CV" to start a new resume
   - Use the professional 8-section editor to input your information
   - Add multiple entries for experience, education, projects, etc.
   - Set skill proficiency levels and language fluency
   - Save drafts and return to edit anytime
4. **Manage Your CVs:** Access "My CVs" page to:
   - View all your created resumes in a card grid layout
   - Edit existing CVs
   - Preview CVs in professional format
   - Delete unwanted CVs
5. **Sign & Export:** 
   - Apply your signature to CVs
   - Generate secure PDF with embedded security features
   - Preview before downloading
6. **Verify & Share:** Use QR codes and barcodes for document validation.
7. **Download & Store:** Download the final CV/Resume in PDF format for submission or printing.
8. **User and Access Management:** Admin can Create, Read, Update, or Delete users. They can also activate or deactivate users.

---

## Technical Stack

- **Backend:** Node.js with Express.js
  - RESTful API architecture
  - JWT-based authentication
  - PostgreSQL database integration
  
- **Frontend:** Next.js (React Framework)
  - React 18+ with Hooks
  - CSS Modules for scoped styling
  - Responsive design with mobile-first approach
  - Axios for API communication
  
- **Database:** PostgreSQL
  - User management with secure authentication
  - CV storage with version control
  - Media file references (signatures, profile pictures)
  
- **Features & Libraries:**
  - PDF Generation: jsPDF, PDFKit, or similar
  - Signature handling and verification
  - QR & Barcode Generation: qrcode.js, JsBarcode
  - File uploads: Multer
  
- **Design Principles:**
  - Modern, clean, and professional UI/UX
  - Fully responsive (mobile, tablet, desktop)
  - Touch-optimized for mobile devices
  - Accessibility compliant (WCAG guidelines)
  - Dark mode support
  - Progressive enhancement
---

## Security Considerations

- Data encryption at rest and in transit
- Secure storage for signatures and certificates
- Authentication and authorization mechanisms
- Anti-forgery and watermarking techniques

---


## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd CV-Resume-Builder-and-Management-System
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up the database:**
   ```bash
   psql -U postgres -f database/init.sql
   ```

5. **Configure environment variables:**
   - Create `.env` files in both backend and frontend directories
   - Set database connection strings, JWT secrets, and API URLs

### Running the Application

**Development Mode:**
- Start backend: `cd backend && npm run dev`
- Start frontend: `cd frontend && npm run dev`
- Access the application at `http://localhost:3000`

**Production Mode:**
- Build frontend: `cd frontend && npm run build`
- Start frontend: `cd frontend && npm start`
- Start backend: `cd backend && npm start`

## Future Enhancements

- Payment version with different packages (Free, starter, Professional and Ultimate)
- Integration with professional networking platforms (LinkedIn)
- AI-powered resume optimization tips
- Video introduction embedding
- API for third-party integrations

---

## License

This project is open-source and available under the MIT License.

---

## Contact

For support or inquiries, please contact [munyeshyaka@hotmail.com, WhatsApp and Telegram: +250788620201].

# Watch both apps
pm2 monit

# View logs
pm2 logs