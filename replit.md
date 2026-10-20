# Fellowship Hub - Christian Community Platform

## Overview

Fellowship Hub is a full-stack web application designed to serve as a comprehensive Christian community platform. The application provides a space for believers to access teachings, participate in discipleship courses, engage in real-time voice and text communication, and share prayer requests. It combines traditional sermon delivery with modern community features to foster spiritual growth and fellowship among users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing with protected routes for authenticated areas
- **State Management**: TanStack Query for server state management and data fetching
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy using session-based authentication
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Password Security**: Node.js crypto module with scrypt for hashing
- **API Design**: RESTful endpoints with consistent error handling

### Data Storage Solutions
- **Database**: PostgreSQL as the primary database
- **ORM**: Drizzle ORM for type-safe database interactions
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Database Structure**: Includes tables for users, teachings, courses, lessons, voice channels, messages, prayer requests, and community help projects

### Authentication and Authorization
- **Strategy**: Session-based authentication with Passport.js
- **Password Handling**: Secure password hashing using scrypt with salt
- **Session Management**: Persistent sessions stored in PostgreSQL
- **Route Protection**: Client-side protected routes with authentication context
- **User Roles**: Admin flag support for elevated permissions

### Real-time Communication Features
- **Voice Channels**: Discord-style voice channel system with:
  - Participant list with avatars showing user initials
  - Self-mute functionality for users
  - Moderator controls to mute/unmute others
  - Real-time participant updates via polling (3-second intervals)
  - Visual indicators for mute status (MicOff icon for self-mute, Hash icon for moderator mute)
  - Crown icon for channel moderators and creators
  - Color-coded circular avatars based on user ID
- **Text Messaging**: Real-time messaging system with channel-based organization
- **Live Updates**: Periodic polling for voice channel participant updates

### Content Management System
- **Teachings**: Video and audio sermon management with view tracking
- **Courses**: Structured learning paths with lessons and progress tracking
- **Lesson Content Types**: Support for multiple content formats:
  - Video lessons with standard HTML5 video player
  - Audio lessons with audio player controls
  - YouTube video embedding with iframe integration
  - Text-based lessons with formatted HTML content (sanitized with DOMPurify)
  - Mixed content lessons combining media and documents
  - Document lessons (PDF, text files, and other formats)
- **Media Support**: Video player with custom controls and fullscreen support
- **Content Organization**: Public/private content visibility controls
- **Security**: HTML sanitization using DOMPurify with strict configuration to prevent XSS attacks

### Community Help Projects
- **Project Management**: Full CRUD operations for community outreach initiatives
- **Project Categories**: Support for multiple outreach types:
  - Feeding programs (food banks, meal services)
  - Homeless outreach (shelters, care packages)
  - Children's needs (school supplies, coats)
  - Automotive assistance (free oil changes, repairs)
  - Housing support (home repairs for seniors)
  - Other community services
- **Project Tracking**: Each project includes:
  - Fundraising goals with progress tracking (goal vs. raised amount)
  - Volunteer capacity tracking (needed vs. signed up)
  - Location and schedule information
  - Contact person details (name and email)
  - Project status (active, completed, cancelled)
- **Public Access**: Projects page at /projects with category filtering
- **Admin Controls**: Authenticated admin users can create, update, and delete projects
- **Home Page Integration**: Preview section showcasing featured project categories with "View All Projects" CTA

### About Page
- **Purpose Section**: Outlines Fellowship Hub's mission and goals with link to community projects
- **Beliefs Section**: Presents core Christian beliefs and links to teachings library
- **Contact Section**: Provides contact information (email and phone) and quick navigation to:
  - Discipleship Courses
  - Fellowship community
  - Community Projects
  - Teachings & Sermons
- **Call to Action**: Encourages visitors to join the community with registration link
- **Public Access**: About page at /about accessible from main navigation

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI and Styling
- **Radix UI**: Comprehensive component library for accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component system built on Radix UI
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the full stack
- **Replit Plugins**: Development environment integration (cartographer, dev-banner, runtime error overlay)

### Runtime Dependencies
- **TanStack Query**: Data fetching and state management
- **Wouter**: Lightweight client-side routing
- **React Hook Form**: Form handling with validation
- **date-fns**: Date manipulation and formatting
- **WebSocket (ws)**: Real-time communication support for voice channels

### Authentication Libraries
- **Passport.js**: Authentication middleware
- **passport-local**: Local username/password authentication strategy

### Content and Media
- **Video/Audio Support**: Custom video player implementation with standard HTML5 video APIs
- **File Handling**: Support for video, audio, and thumbnail URLs for teaching content
- **DOMPurify**: HTML sanitization library for secure rendering of rich text content with XSS prevention