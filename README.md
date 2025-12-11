# Emotional Disaster Productions

A browser-based Digital Audio Workstation (DAW) inspired by Ableton Live. Create projects, arrange audio clips on a timeline, and mix your tracks with a professional interface.

## Tech Stack

### Frontend
- Next.js 16 with App Router
- React + TypeScript
- Tailwind CSS v4
- Web Audio API for playback

### Backend
- API Routes (Next.js)
- PostgreSQL + Prisma ORM
- JWT Authentication
- Local file storage for audio files

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

\`\`\`env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/emotional_disaster"

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-change-this"

# File Upload Configuration
UPLOADS_DIR="./uploads"
BASE_FILE_URL="http://localhost:3000"
\`\`\`

### 3. Setup Database

Run Prisma migrations to create the database schema:

\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

Generate Prisma Client:

\`\`\`bash
npx prisma generate
\`\`\`

### 4. Create Uploads Directory

\`\`\`bash
mkdir uploads
\`\`\`

### 5. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

The app will be available at `http://localhost:3000`

## Database Schema

- **User**: Authentication and user management
- **Project**: DAW projects with BPM and time signature
- **Track**: Audio/MIDI tracks within projects
- **Clip**: Audio clips arranged on tracks
- **AudioFile**: Uploaded audio file metadata

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tracks
- `POST /api/projects/:projectId/tracks` - Create track
- `PUT /api/tracks/:id` - Update track
- `DELETE /api/tracks/:id` - Delete track

### Clips
- `POST /api/tracks/:trackId/clips` - Create clip
- `PUT /api/clips/:id` - Update clip
- `DELETE /api/clips/:id` - Delete clip

### Audio Files
- `POST /api/projects/:projectId/audio-files` - Upload audio
- `GET /api/audio-files/:id/stream` - Stream audio file

## Project Structure

\`\`\`
/app                    # Next.js app directory
  /api                  # API routes
  /auth                 # Authentication pages
  /app                  # Main application pages
  /dashboard            # Project dashboard
  /projects             # Project workspace
/components             # React components
  /ui                   # shadcn/ui components
  /auth                 # Auth-related components
  /project              # Project workspace components
/lib                    # Utility libraries
  /audio                # Web Audio engine
  /db                   # Database utilities
/prisma                 # Prisma schema and migrations
/uploads                # Audio file storage (local)
\`\`\`

## Features

### Current Version
- User authentication (register/login)
- Project management (create, edit, delete)
- Track creation with volume, pan, mute, solo
- Audio file upload and storage
- Timeline view with clip arrangement
- Basic mixer interface
- Web Audio playback engine

### Future Enhancements
- Real-time collaborative editing
- Advanced audio effects and plugins
- MIDI support and virtual instruments
- Waveform visualization
- Export and rendering
- Cloud storage integration

## Development Commands

\`\`\`bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma Studio (database GUI)
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
\`\`\`

## License

MIT
