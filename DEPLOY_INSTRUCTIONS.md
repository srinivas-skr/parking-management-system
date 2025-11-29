# Deployment Instructions for Render

## Prerequisites
- A [Render](https://render.com) account.
- This project pushed to a GitHub/GitLab repository.

## Option 1: Automatic Deployment (Recommended)
This project includes a `render.yaml` Blueprint file which automates the setup of the Backend and Database.

1.  **Push your code** to your Git repository.
2.  Go to the [Render Dashboard](https://dashboard.render.com/).
3.  Click **New +** and select **Blueprint**.
4.  Connect your repository.
5.  Render will detect `parkease-backend/render.yaml`.
6.  Click **Apply**.
    *   This will create a **PostgreSQL Database**.
    *   This will create a **Web Service** (Backend) and automatically link it to the database.
7.  Wait for the deployment to finish.

## Option 2: Manual Deployment (If Blueprint fails)

### 1. Create Database
1.  Click **New +** -> **PostgreSQL**.
2.  Name: `parking-db`
3.  Region: `Singapore` (or nearest to you).
4.  Click **Create Database**.
5.  Copy the **Internal Database URL**.

### 2. Deploy Backend
1.  Click **New +** -> **Web Service**.
2.  Connect your repo.
3.  **Root Directory**: `parkease-backend`
4.  **Runtime**: `Docker`
5.  **Environment Variables**:
    *   `DATABASE_URL`: (Paste the Internal Database URL from step 1)
    *   `JWT_SECRET`: (Generate a strong secret or use the default from application.properties)
    *   `PORT`: `8080` (Render sets this automatically, but good to know)
6.  Click **Create Web Service**.

## Deploy Frontend (Static Site)

1.  Click **New +** -> **Static Site**.
2.  Connect your repo.
3.  **Root Directory**: `parkease-frontend`
4.  **Build Command**: `npm install && npm run build`
5.  **Publish Directory**: `dist`
6.  **Environment Variables**:
    *   `VITE_API_URL`: (Paste the URL of your deployed Backend, e.g., `https://parking-backend.onrender.com/api`)
7.  Click **Create Static Site**.

## Verification
1.  Open the Frontend URL.
2.  Try to **Login** (Use the "Demo Login" button).
3.  If login works, the Frontend is successfully talking to the Backend, and the Backend is talking to the Database.
