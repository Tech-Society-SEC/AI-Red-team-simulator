# Gemini-Powered Personalised Finance Assistant (Bank Add-On)

## Purpose

A lightweight assistant that lives inside a banking UI and helps each user understand and manage their money using their **own mock bank data** (accounts, transactions, cards). This project simulates all actions for demos, testing, and product validation, without real money movement or third-party bank APIs.

## Project Structure

- `supabase/`: Contains the SQL schema for the PostgreSQL database.
- `backend/`: FastAPI application for the API.
- `frontend/`: React application for the user interface.
- `requirements.txt`: Python dependencies for the backend.

## Setup Instructions

### 1. Database Setup (Supabase / PostgreSQL)

This project uses PostgreSQL as its database. You can set it up locally or use a service like Supabase.

1.  **Install PostgreSQL**: If you don't have PostgreSQL installed, follow the instructions for your operating system.
2.  **Create a database**: Create a new PostgreSQL database.
3.  **Apply Schema**: Use the `supabase/init.sql` file to set up the necessary tables.

    ```bash
    psql -U your_username -d your_database -f supabase/init.sql
    ```

4.  **Environment Variable**: Create a `.env` file in the `backend/` directory with your database connection string. If using Supabase, you can find this under your project settings -> Database -> Connection String. It will look similar to this:

    ```
    DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@dxwqixitgeurgajyqadq.supabase.co:5432/postgres"
    ```

    **Replace `[YOUR-PASSWORD]` with your actual Supabase database password.** The `dxwqixitgeurgajyqadq` part should match your Supabase project reference.

### 2. Backend Setup (Python FastAPI)

1.  **Navigate to the backend directory**:

    ```bash
    cd backend
    ```

2.  **Create a virtual environment** (optional but recommended):

    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependencies**:

    ```bash
    pip install -r ../requirements.txt
    ```

4.  **Run the backend server**:

    ```bash
    uvicorn main:app --reload
    ```

    The API will be available at `http://127.0.0.1:8000`.

### 3. Frontend Setup (React)

*(Requires npm to be installed)*

1.  **Navigate to the frontend directory**:

    ```bash
    cd frontend
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Run the frontend development server**:

    ```bash
    npm run dev
    ```

    The frontend application will be available at `http://localhost:5173` (or another port as specified by Vite).

## Features (MVP)

Refer to the `Finance AI Assistant — Feature List.pdf` for a detailed list of must-have features.
