# ðŸ“š Codebase Summary & Reference Analysis

## 1. ðŸ” Analysis of `reference-repos/` Folder
**Status:** âŒ **EMPTY / NO CODE FOUND**
- **Location:** `C:\Users\vikas\Documents\Java_fresher\reference-repos`
- **Contents:**
  - `Java-React-FullStack/target/` (Empty build directory)
  - `parkinglot/target/` (Empty build directory)
- **Conclusion:** This folder contains no source code (`.java`, `.js`, etc.). It appears to be a leftover from a failed copy or build process. It provides no reference value.

---

## 2. ðŸ¢ Main Project Code Summary ("The Main Things")
Since the reference folder is empty, here is the summary of your **active** project code which is fully functional.

### A. Backend: `parkease-backend`
**Tech Stack:** Java 21, Spring Boot 3.4.0, H2 Database, Maven.

#### **Key Files & Logic:**
1.  **`src/main/resources/application.properties`**
    - **Config:** Runs on port `8081` (to avoid conflict).
    - **Database:** Uses In-Memory H2 DB (`jdbc:h2:mem:parking_db`).
    - **Security:** JWT Secret configured for authentication.

2.  **`src/main/java/com/parking/entity/`**
    - **`ParkingSlot.java`:** Defines the slot structure (ID, type, price, location).
    - **`Booking.java`:** Links Users, Vehicles, and Slots.
    - **`User.java`:** Handles authentication and roles (ADMIN, USER).

3.  **`src/main/java/com/parking/controller/`**
    - **`AuthController.java`:** Handles Login/Register and issues JWT tokens.
    - **`ParkingSlotController.java`:** API endpoints to get/add slots.

### B. Frontend: `parkease-frontend`
**Tech Stack:** React 18, Vite, Tailwind CSS, Axios, Lucide React.

#### **Key Files & Logic:**
1.  **`src/services/api.js`**
    - **Connection:** Configured to talk to Backend at `http://localhost:8081/api`.
    - **Interceptors:** Automatically adds JWT Token to every request.
    - **Retry Logic:** Handles server wake-up delays (useful for free cloud hosting).

2.  **`src/pages/ParkingSlots.jsx`**
    - **Current State:** Uses **Mock Data** (`localParkingData`) for the demo.
    - **Features:** Search, Filter by Distance/Price, Map View vs List View.

3.  **`src/context/AuthContext.jsx`**
    - **Logic:** Manages global login state. Persists user session in `localStorage`.

4.  **`src/components/Navbar.jsx`**
    - **Navigation:** Responsive menu with Login/Logout and Profile links.

---

## 3. ðŸš€ Quick Start Summary
To run the "Main Main Thing":

1.  **Backend:**
    ```powershell
    cd parkease-backend
    java -Dserver.port=8081 -jar target/parkease-backend-1.0.1.jar
    ```
2.  **Frontend:**
    ```powershell
    cd parkease-frontend
    npm run dev
    ```
3.  **Access:**
    - App: `http://localhost:5173`
    - API Docs: `http://localhost:8081/swagger-ui.html`
