# ParkEase - Smart Parking Management System

A modern parking management system built with React 18, Vite, and Tailwind CSS.

## Features

- User authentication with JWT
- Browse available parking slots
- Vehicle management
- Book parking slots with date/time selection
- View booking history
- Real-time slot availability
- Responsive design with glassmorphism effects

## Tech Stack

- **Frontend**: React 18, JavaScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Create a \`.env\` file in the root directory:

\`\`\`
VITE_API_URL=https://parking-management-system-hs2i.onrender.com/api
\`\`\`

4. Start the development server:

\`\`\`bash
npm run dev
\`\`\`

5. Open your browser and navigate to \`http://localhost:3000\`

## Project Structure

\`\`\`
src/
├── components/        # Reusable UI components
│   ├── ui/           # shadcn/ui components
│   ├── Navbar.jsx
│   ├── StatsCard.jsx
│   └── SlotCard.jsx
├── context/          # React Context providers
│   └── AuthContext.jsx
├── pages/            # Page components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Vehicles.jsx
│   ├── Bookings.jsx
│   └── BookSlot.jsx
├── routes/           # Route protection
│   └── ProtectedRoute.jsx
├── services/         # API services
│   └── api.js
├── App.jsx           # Main app component
├── main.jsx          # Entry point
└── index.css         # Global styles
\`\`\`

## API Integration

The app connects to a Spring Boot backend API. All API calls are made through the axios instance configured in \`src/services/api.js\` with automatic JWT token injection.

## Building for Production

\`\`\`bash
npm run build
\`\`\`

The build output will be in the \`dist/\` directory.

## License

MIT
