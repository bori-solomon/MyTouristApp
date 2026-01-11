# My Tourist App

A personal travel management application integrated with Google Drive.

## Getting Started

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm (comes with Node.js)
-   Google Cloud Project with the Drive API enabled

### Installation

1.  Clone the repository or open the project folder.
2.  Install dependencies:

```powershell
npm install
```

### Configuration

Ensure you have a `.env.local` file in the root directory with your Google OAuth credentials:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_DRIVE_ROOT_FOLDER=My Tourist App
```

### Running the App

To start the development server:

```powershell
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) with your browser.

## Features

-   **Google Drive Integration**: All destination folders and files are synced with your Drive.
-   **Trip Planning**: Create detailed itineraries with dates, locations, notes, and links.
-   **Document Management**: Organize visa docs, tickets, and bookings.
-   **Multi-language Support**: Available in English, Russian, Ukrainian, and Japanese.
