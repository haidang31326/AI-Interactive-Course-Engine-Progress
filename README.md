# AI Interactive Course Engine 🚀

A cutting-edge, AI-powered interactive learning platform built for the **Hackathon 2026**. This platform instantly transforms static PDF documents into rich, gamified, and interactive courses using Google's Gemini AI.

## 🌟 Key Features

### 1. Instant AI Course Generation
- Upload any PDF document (educational material, books, guides).
- The system uses **Google Gemini AI** to extract and synthesize the content.
- Automatically generates a structured course with Chapters, Theory Lessons, and Interactive Quizzes.

### 2. Gamified Interactive Learning
The generated courses are not just walls of text. AI automatically embeds interactive blocks to test knowledge:
- 📖 **Theory:** Clean, markdown-formatted reading material.
- ✏️ **Fill in the Blanks:** Fuzzy-matching inputs to test memory recall.
- 🤔 **Scenarios:** Multiple-choice situational questions.
- 💻 **Code Editor:** Live coding environments to practice syntax (triggers automatically for tech topics).
- 🧩 **Drag & Drop:** Categorization exercises for vocabulary and concepts.

### 3. AI Tutor & Smart Notebook
- **Contextual AI Tutor:** Highlight any confusing text in the lesson and ask the AI Tutor for an explanation directly.
- **Smart Notebook:** Save AI's explanations and your personal highlights directly to a persistent Notebook with a single click.

### 4. Enterprise-Grade Stability & Content Moderation
- **Content Moderation:** Built-in AI guardrails automatically reject harmful, inappropriate, or non-educational content before it hits the database.
- **Load Tested:** The backend Spring Boot architecture successfully handles 600+ RPS (Requests Per Second) and manages Database transactions securely (preventing deadlocks on course cloning).

### 5. Focus Tools (Pomodoro)
- Built-in floating **Pomodoro Timer** to keep learners focused on their studies.

---

## 🛠️ Technology Stack

- **Frontend:** React, TypeScript, TailwindCSS, Framer Motion (for micro-animations and fluid UX).
- **Backend:** Java 21, Spring Boot 3, Spring Data JPA, Hibernate.
- **Database:** MySQL.
- **AI Integration:** Google Gemini REST API.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- Java 21
- Maven
- MySQL Database
- Google Gemini API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure your environment variables in `.env` or `application.properties`:
   ```properties
   GEMINI_API_KEY=your_api_key_here
   SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/course_engine
   SPRING_DATASOURCE_USERNAME=root
   SPRING_DATASOURCE_PASSWORD=yourpassword
   ```
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📊 Stress Test Results (Chaos Engineering)
As part of our robustness preparation, the system underwent advanced load testing:
- **Database Resilience:** Tested with 50 concurrent virtual users triggering complex `@Transactional` clone operations simultaneously. Zero data corruption.
- **API Rate Limiting:** Gemini API rate limits are gracefully caught and handled via robust Exception Handling, ensuring the frontend never crashes when encountering `429 Too Many Requests`.

---

*Made with ❤️ for Hackathon 2026. Education should be interactive!*
