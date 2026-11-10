# MERN Stack Stock Analysis & Recommendation System

A complete Software Engineering (SWE) project that performs fundamental stock analysis and technical indicator evaluation. Combines core valuation ratios and historical price indicators (SMA, RSI, MACD) through a trained **Machine Learning classification model** to output **Buy / Hold / Avoid** recommendations, OCR chart processing, and similar stock suggestions.

---

## Table of Contents
1. [Project Intent & Motivation](#1-project-intent--motivation)
2. [Proof of Concept (POC)](#2-proof-of-concept-poc)
3. [What Has Been Done](#3-what-has-been-done)
4. [Expected Outputs & Outcomes](#4-expected-outputs--outcomes)
5. [Tech Stack](#5-tech-stack)
6. [Project Structure](#6-project-structure)
7. [Step-by-Step Setup & Run Guide](#7-step-by-step-setup--run-guide)
8. [Testing the Application Workflow](#8-testing-the-application-workflow)
9. [API Endpoints Reference](#9-api-endpoints-reference)

---

## 1. Project Intent & Motivation

### What I Intend to Show
Retail investors and students often face complicated balance sheets or unreliable social media stock tips. It is difficult to evaluate whether a stock is a good entry or a risky trap.

This project intends to show:
- How a **MERN stack software application** can provide disciplined, multi-parameter stock evaluation combining both **fundamental metrics** and **technical indicators**.
- How **machine learning decision models** evaluate diverse features (P/E, Industry P/E, P/B, ROE, Debt/Equity, RSI, Moving Averages, MACD) to classify recommendations into **Buy**, **Hold**, or **Avoid**.
- How user intent (**Planning to Buy** vs **Currently Own**) contextually shapes the recommendations (e.g. accumulating new positions vs trimming risky holdings).
- How **OCR (Optical Character Recognition)** can parse stock charts directly from uploaded images.

---

## 2. Proof of Concept (POC)

The Proof of Concept proves three core engineering requirements:

1. **Integrated Fundamental & Technical ML Classification:**  
   Combines fundamental balance sheet ratios (P/E, Industry P/E, P/B, ROE, Debt/Equity, EPS, Face Value) with technical indicators (SMA 20, SMA 50, RSI 14, MACD) to predict `BUY`, `HOLD`, or `AVOID` along with a model confidence score.
2. **Chart Optical Character Recognition (OCR):**  
   Users can upload chart screenshots (JPG, PNG). The backend processes the image buffer in RAM with `tesseract.js` without creating temporary files, extracting prices and key labels.
3. **Sector & Valuation Proximity Peer Matching:**  
   Calculates mathematical distance across benchmark peer companies within the same sector to recommend comparable alternative stocks.

---

## 3. What Has Been Done

- **Full-Stack Architecture:** 3-tier MERN architecture (React Vite frontend, Node/Express backend, MongoDB database).
- **Homepage User Input Section:** Implemented stock input options directly on the landing page as well as on a dedicated analysis page.
- **Investment Intent Feature:** Users can indicate whether they *Currently Own* or are *Planning to Buy* the stock.
- **Complete Metric Coverage:** Supports Market Capitalization, P/E Ratio, P/B Ratio, Return on Equity (ROE), Debt-to-Equity Ratio, Earnings Per Share (EPS), Book Value, **Face Value**, and **Industry P/E**.
- **Technical Indicators Engine:** Calculates 20-day & 50-day Simple Moving Averages (SMA), 14-period Relative Strength Index (RSI), MACD, and overall technical momentum (Bullish/Bearish/Neutral).
- **Secure Authentication:** User registration, password encryption with `bcryptjs`, and session protection with JSON Web Tokens (JWT).
- **Dynamic Weight Normalization:** Missing optional metrics are dynamically removed from denominators so incomplete inputs are never falsely penalized as zero.
- **User-Isolated Database Records:** Analysis history is linked to `userId`, allowing users to view and delete only their own records.

---

## 4. Expected Outputs & Outcomes

### User Inputs:
- **Investment Intent:** Planning to Buy / Currently Own.
- **Mandatory Fundamentals:** Stock Name/Ticker, Sector, P/E Ratio, P/B Ratio.
- **Additional Parameters:** Industry P/E, Market Cap ($B), ROE (%), Debt-to-Equity, EPS ($), Book Value ($), Face Value ($), Current Price ($), Dividend Yield (%).
- **Optional File:** Stock chart screenshot (JPG, JPEG, or PNG).

### System Outputs:
1. **Recommendation Classification:**
   - **`BUY`**: Strong fundamentals, attractive valuation, safe debt levels, and supportive technicals.
   - **`HOLD`**: Balanced valuation and average metrics; hold existing shares or wait for catalysts.
   - **`AVOID`**: Unfavorable valuation multiples, heavy debt, or overbought technical momentum.
2. **Model Confidence Score:** A confidence percentage (e.g. `85%`) based on available feature depth and indicator alignment.
3. **Technical Indicators Breakdown:** SMA 20, SMA 50, RSI (14), MACD, and overall Trend status.
4. **Contributing Strengths & Risks:** Granular factors driving the recommendation (e.g. low debt, discount to industry P/E, oversold RSI).
5. **OCR Extracted Content:** Text, labels, and numbers extracted from the uploaded chart image.
6. **Similar Sector Peers:** Top 3 comparable stocks with their sector, P/E, P/B, and comparative rationale.
7. **Saved History Dashboard:** Tabular history stored in MongoDB with View and Delete actions.

---

## 5. Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v6, Axios, Plain CSS |
| **Backend** | Node.js, Express.js, Multer (Memory Storage) |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs |
| **Image OCR** | Tesseract.js (Pure JavaScript Optical Character Recognition) |

---

## 6. Project Structure

```
SWE/
├── backend/
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   ├── models/
│   │   ├── User.js                  # User schema & password hashing
│   │   └── StockAnalysis.js         # Analysis record schema (fundamentals + technicals)
│   ├── routes/
│   │   ├── auth.js                  # /api/auth (register, login, me)
│   │   └── stocks.js                # /api/stocks (analyze, history, get, delete)
│   ├── services/
│   │   ├── recommendationEngine.js  # ML classification logic (BUY/HOLD/AVOID)
│   │   ├── technicalAnalysis.js     # SMA, RSI, MACD calculation service
│   │   ├── ocrService.js            # Tesseract OCR chart image processing
│   │   └── similarStocks.js         # Sector & metric proximity peer finder
│   ├── .env                         # Backend environment configuration
│   ├── package.json                 # Backend dependencies & scripts
│   └── server.js                    # Express application entry point
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Homepage with embedded user input section
│   │   │   ├── LoginPage.jsx        # Login form
│   │   │   ├── RegisterPage.jsx     # Registration form
│   │   │   ├── StockInputPage.jsx   # Dedicated stock analysis form & chart upload
│   │   │   ├── ResultsPage.jsx      # Recommendation, technicals, metrics & peers
│   │   │   └── HistoryPage.jsx      # Historical analyses table
│   │   ├── App.jsx                  # Main router & layout wrapper
│   │   ├── AuthContext.jsx          # React Context for auth state
│   │   ├── axios.js                 # Central Axios instance with JWT interceptor
│   │   ├── index.css                # Application stylesheet
│   │   └── main.jsx                 # Vite React entry point
│   ├── index.html                   # HTML template
│   ├── package.json                 # Frontend dependencies & scripts
│   └── vite.config.js               # Vite bundler configuration
│
├── SWE_PROJECT_GUIDE.md             # Detailed SWE architecture & viva guide
└── README.md                        # Master project documentation
```

---

## 7. Step-by-Step Setup & Run Guide

### Prerequisites
Make sure you have installed:
1. **Node.js** (v18 or higher): `node -v`
2. **npm**: `npm -v`
3. **MongoDB**: Running locally on `mongodb://127.0.0.1:27017` (or a MongoDB Atlas URI)
4. **Git**: `git -v`

---

### Step 1: Open or Clone the Repository
```bash
git clone <repository-url>
cd SWE
```
Or open the `SWE` folder directly in **VS Code**.

---

### Step 2: Configure Backend Environment Variables
Inside `backend/`, ensure `.env` contains:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/stock_analysis_db
JWT_SECRET=stock_secret_jwt_key_2026
```

---

### Step 3: Start the Backend Server
In your first VS Code terminal:
```bash
cd backend
npm install
npm run dev
```
Output:
```
Server running on port 5000
MongoDB connected successfully
```
> Backend runs on **`http://localhost:5000`**.

---

### Step 4: Start the Frontend Application
In a **second VS Code terminal**:
```bash
cd frontend
npm install
npm run dev
```
Output:
```
  VITE v5.4.x  ready in 200 ms

  ➜  Local:   http://localhost:5173/
```
> Frontend runs on **`http://localhost:5173`**.

---

## 8. Testing the Application Workflow

1. **Landing Page:** Open `http://localhost:5173`. You will see the introduction and the **Analyze a Stock** input section right on the homepage.
2. **Register/Login:** Click **"Sign In"** or **"Register"** to create a user session.
3. **Run an Analysis:**
   - Select Intent: `Planning to Buy` or `Currently Own`.
   - Enter fundamental inputs:
     - Stock Name: `Apple Inc. (AAPL)`
     - Sector: `Technology`
     - P/E Ratio: `28.5`
     - P/B Ratio: `42.1`
     - Industry P/E: `26.0`
     - ROE (%): `140`
     - Debt-to-Equity: `1.5`
     - Current Price ($): `185.50`
   - *(Optional)* Attach a chart screenshot.
   - Click **"Run Analysis (Buy / Hold / Avoid)"**.
4. **Inspect the Output:**
   - View the recommendation badge (`BUY`, `HOLD`, or `AVOID`) and confidence score.
   - Review calculated **Technical Indicators** (SMA 20, SMA 50, RSI 14, MACD, and Trend).
   - Check the contributing strengths and risk factors.
   - Review similar stocks in the Technology sector.
5. **Manage History:** Visit the **History** tab to review previous valuations or delete entries.

---

## 9. API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate & receive JWT | No |
| `GET` | `/api/auth/me` | Fetch logged-in user profile | Yes (Bearer Token) |

### Stock Operations (`/api/stocks`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/stocks/analyze` | Submit metrics & optional chart image | Yes (Bearer Token) |
| `GET` | `/api/stocks/history` | Retrieve user's previous analyses | Yes (Bearer Token) |
| `GET` | `/api/stocks/:id` | Fetch single analysis details | Yes (Bearer Token) |
| `DELETE` | `/api/stocks/:id` | Delete an analysis record | Yes (Bearer Token) |
