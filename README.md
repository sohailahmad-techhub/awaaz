# 🌍 ImpactChain (Awaaz)

**ImpactChain** is a decentralized-style community problem-solving platform designed to connect citizens, NGOs, and donors. It leverages AI for problem verification and blockchain-inspired transparency to ensure that every cent donated reaches its intended destination.

---

## 🚀 Key Features

-   **🤖 AI Problem Verification**: Automated verification of community-reported issues using AI (Gemini/OpenRouter) to ensure authenticity.
-   **🗺️ Interactive Problem Map**: A real-time map visualization of reported issues across different regions.
-   **🔗 Transparency Ledger**: A cryptographic-style ledger that tracks every transaction and milestone, ensuring 100% accountability.
-   **🤝 NGO Collaboration**: NGOs can "adopt" verified problems and create actionable projects.
-   **💳 Secure Funding**: Integrated Stripe payments for global donations.
-   **🖥️ Admin Dashboard**: Comprehensive management tool for moderating problem reports and system health.

---

## 🛠️ Technology Stack

### Frontend
-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Maps**: [React Leaflet](https://react-leaflet.js.org/)
-   **Icons**: [Lucide React](https://lucide.dev/)

### Backend
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/)
-   **Authentication**: JWT (JSON Web Tokens)
-   **AI Integration**: OpenRouter (Gemini Pro)

---

## 📦 Getting Started

### Prerequisites
-   Node.js (v20+ recommended)
-   MongoDB Atlas account
-   OpenRouter API Key (optional for AI verification)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/sohailahmad-techhub/awaaz.git
    cd awaaz
    ```

2.  **Setup the Backend**:
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` folder and add:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    PORT=5000
    OPENROUTER_API_KEY=your_key
    STRIPE_SECRET_KEY=your_key
    ```

3.  **Setup the Frontend**:
    ```bash
    cd ../frontend-next
    npm install
    ```

### Running Locally

1.  **Start Backend**:
    ```bash
    cd backend
    npm start
    ```

2.  **Start Frontend**:
    ```bash
    cd frontend-next
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) to see the application!

---

## 🛡️ Security & Stability
Recent updates include:
-   Standardized on **Next.js 15 stable** and **React 19 stable**.
-   Optimized Map rendering to reduce system overhead.
-   Validated MongoDB connection logic with robust DNS fallbacks.

---

## 📄 License
This project is licensed under the ISC License.

Developed for the **Hackathon 2026** by *Sohail Ahmad* & *Abbas Ahmad*.