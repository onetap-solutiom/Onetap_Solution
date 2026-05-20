<div align="center">
  <img src="./public/assets/images/logo.png" alt="OneTap Solution Logo" width="180" />
  
  <h1>OneTap Solution 🚀</h1>
  <p><b>Premium Digital Services & Portfolio Platform</b></p>
  
  <p>
    <img src="https://img.shields.io/badge/License-MIT-04C244?style=for-the-badge" alt="License" />
    <img src="https://img.shields.io/badge/Version-1.0.0-04C244?style=for-the-badge" alt="Version" />
    <img src="https://img.shields.io/badge/React-18.0-04C244?style=for-the-badge&logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/Flask-3.0-04C244?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
  </p>
  <br>
</div>

**OneTap Solution** is a premium, high-fidelity web platform designed to elevate digital service agencies. It features a stunning, glassmorphic public-facing portfolio and a secure, comprehensive Administrative Dashboard for managing content, projects, and client interactions in real-time.

---

## 🌟 Key Features

### Public Frontend
- **Modern UI/UX**: Premium dark-mode aesthetic utilizing glassmorphism, dynamic micro-animations, and fully responsive layouts.
- **Dynamic Content**: Real-time fetching of Services, Portfolios, Testimonials, and News directly from a robust Python/PostgreSQL (Supabase) backend.
- **Interactive Elements**: Auto-playing carousels, animated page transitions, and engaging call-to-action sections.

### Admin Dashboard (`/admin`)
- **Content Management System (CMS)**: Intuitive interface for managing Services, Projects, Testimonials, and News articles.
- **Seamless Media Handling**: Built-in support for high-quality image uploads and processing.
- **Secure Architecture**: Role-Based Access Control (RBAC) with secure session handling and password hashing.
- **Real-Time Synchronization**: Instant data propagation between the admin panel and the public interface.

---

## 🛠 Tech Stack

### Frontend Architecture
- **Framework**: React 18 (Bootstrapped with Vite)
- **Styling**: Tailwind CSS combined with custom CSS
- **Routing**: React Router DOM
- **UI Components**: Lucide React & FontAwesome icons

### Backend Architecture
- **Server**: Python / Flask
- **ORM & Database**: SQLAlchemy connecting to PostgreSQL (via psycopg2)
- **Security**: Werkzeug Security for advanced cryptographic hashing

---

## 🛡 Security Best Practices

Security is a core focus of the OneTap Solution architecture. Contributors and deployers must adhere to the following protocols:

- **Environment Variables**: Sensitive configurations (such as database credentials and API secret keys) **MUST** be stored in `.env` files. Ensure your `.env` is listed in your `.gitignore` and never committed to version control.
- **Password Hashing**: User and admin passwords are cryptographically hashed using `Werkzeug Security` before database insertion. Plaintext passwords are never stored.
- **CORS Protection**: The backend API enforces Cross-Origin Resource Sharing (CORS) policies to prevent unauthorized domains from interacting with the endpoints.
- **Payload Validation**: All form inputs and API requests are strictly sanitized and validated to prevent SQL Injection and Cross-Site Scripting (XSS).
- **Production Mode**: Always ensure `FLASK_DEBUG=0` is set when deploying to a live production environment.

---

## ⚙️ Local Development Setup

### 1. Database Configuration (Supabase / PostgreSQL)
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Copy the queries from [database/schema.sql](file:///d:/OTS/OTS/database/schema.sql) and [database/triggers.sql](file:///d:/OTS/OTS/database/triggers.sql) and execute them in the **SQL Editor** of the Supabase dashboard.
3. If you want to load mock data, copy the queries from [database/seed.sql](file:///d:/OTS/OTS/database/seed.sql) and run them in the SQL Editor.

### 2. Backend Initialization (Flask)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Set up a Python virtual environment:
   ```bash
   python -m venv venv
   ```
   - Windows: `venv\Scripts\activate`
   - Unix/macOS: `source venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables. Create a `.env` file in the `backend` directory and add your credentials:
   ```env
   FLASK_ENV=development
   FLASK_DEBUG=1
   SECRET_KEY=<generate_a_secure_random_string_here>
   DB_HOST=<your_supabase_host>
   DB_USER=postgres
   DB_PASSWORD=<your_supabase_db_password>
   DB_NAME=postgres
   DB_PORT=5432
   ```
5. Launch the backend server (default port 5000):
   ```bash
   python app.py
   ```

### 3. Frontend Initialization (React/Vite)
1. In a new terminal, navigate to the project root.
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🔐 Administrative Access

To initialize the Super Admin account for your local environment, run the provided seeding script:
```bash
cd backend
python scripts/seed_admin.py
```

*Note: For security reasons, default administrative credentials are not documented publicly. Please refer to the terminal output of the script to get your initial, generated login details. You must change your password immediately upon your first login.*

---

## 🤝 Contributing

We welcome contributions! If you'd like to contribute:
1. Fork the repository.
2. Create a new secure feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please ensure your code adheres to our security standards and formatting guidelines.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

<br>

<div align="center">
  <b>Created with 💚 & ☕ by the <strong>OneTap Solution Team</strong></b>
  <br>
  <i>Empowering businesses through digital innovation.</i>
</div>