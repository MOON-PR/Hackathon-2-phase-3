# Todo App Frontend - Next.js + Better Auth

## Overview
This is the frontend application for the Todo App, built with Next.js 16, TypeScript, and Tailwind CSS. It implements a modern, responsive UI with Better Auth authentication and an AI-powered chatbot interface.

## Technology Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Better Auth with JWT
- **UI Components:** OpenAI ChatKit (for chatbot)
- **State Management:** React Query
- **API Client:** Fetch API with custom service layer

## Features

### Phase II: Full-Stack MVP
- ✅ User authentication (signup/login)
- ✅ Task management dashboard
- ✅ Task CRUD operations
- ✅ Task completion toggle
- ✅ Priorities and categories
- ✅ Search and filter functionality
- ✅ Responsive design

### Phase III: AI Chatbot
- ✅ AI-powered chatbot interface
- ✅ Natural language task management
- ✅ Slash commands (`/add`, `/list`, `/delete`, etc.)
- ✅ Conversation history with session isolation
- ✅ Real-time chat updates
- ✅ Configurable chatbot visibility toggle

## Project Structure
```
web-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Homepage
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page
│   │   └── dashboard/          # Dashboard (protected)
│   │       ├── page.tsx        # Main dashboard
│   │       └── layout.tsx      # Dashboard layout with chatbot
│   ├── components/             # React components
│   │   ├── ChatWindow.tsx      # AI chatbot interface
│   │   ├── TaskList.tsx        # Task list component
│   │   └── ...
│   ├── services/               # API service layer
│   │   ├── authService.ts      # Authentication API calls
│   │   ├── taskService.ts      # Task API calls
│   │   └── chatService.ts      # Chat API calls
│   ├── lib/                    # Utility functions
│   │   └── better-auth.ts      # Better Auth configuration
│   └── styles/
│       └── globals.css         # Global styles
├── public/                     # Static assets
└── package.json
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd todo-hackathon/web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` file in the `web-app` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
   BETTER_AUTH_SECRET=<your-secret-key>
   NEXT_PUBLIC_SHOW_CHATBOT=true
   ```

   **Environment Variables:**
   - `NEXT_PUBLIC_API_URL` - Backend API URL
   - `NEXT_PUBLIC_BETTER_AUTH_URL` - Frontend URL for Better Auth
   - `BETTER_AUTH_SECRET` - Shared secret with backend (must match backend)
   - `NEXT_PUBLIC_SHOW_CHATBOT` - Toggle chatbot visibility (`true`/`false`)

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## Authentication

### Better Auth Setup
Better Auth is configured to use JWT tokens for authentication:

1. **Signup:** Users create an account at `/signup`
2. **Login:** Users authenticate at `/login` and receive a JWT token
3. **Token Storage:** JWT is stored in HTTP-only cookies
4. **Protected Routes:** Dashboard requires valid JWT token

### API Integration
All API calls include the JWT token in the `Authorization` header:
```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Chatbot Features

### Slash Commands
The chatbot supports the following slash commands:

| Command | Description | Example |
|---------|-------------|---------|
| `/add` | Create a new task | `/add Buy groceries` |
| `/list` | List all tasks | `/list` or `/list pending` |
| `/delete` | Delete a task | `/delete 5` |
| `/complete` | Mark task as complete | `/complete 3` |
| `/update` | Update a task | `/update 2 New title` |
| `/search` | Search tasks | `/search meeting` |

### Natural Language
The chatbot also understands natural language:
- "Add a task to call mom"
- "Show me all my pending tasks"
- "Mark task 5 as done"
- "Delete the meeting task"

### Chatbot Toggle
The chatbot can be hidden/shown using the `NEXT_PUBLIC_SHOW_CHATBOT` environment variable:
- Set to `true` to show chatbot
- Set to `false` to hide chatbot

## Services Layer

### authService.ts
Handles authentication operations:
- `signup(email, password, name)` - Create new account
- `login(email, password)` - Authenticate user
- `logout()` - Clear session
- `isAuthenticated()` - Check auth status

### taskService.ts
Handles task operations:
- `getTasks(filters)` - Fetch tasks with filtering
- `createTask(task)` - Create new task
- `updateTask(id, updates)` - Update task
- `deleteTask(id)` - Delete task
- `toggleComplete(id)` - Toggle completion status

### chatService.ts
Handles chatbot operations:
- `sendMessage(message, conversationId)` - Send message to AI
- `getHistory(conversationId)` - Fetch chat history
- `clearHistory()` - Clear all messages

## Styling

### Tailwind CSS
The app uses Tailwind CSS for styling with a custom cyberpunk theme:
- Dark mode by default
- Cyan and orange accent colors
- Glassmorphism effects
- Smooth animations

### Custom Classes
- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.cyber-card` - Card with cyberpunk styling

## Development

### Running Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

### Lint Code
```bash
npm run lint
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
Set these in your Vercel project settings:
- `NEXT_PUBLIC_API_URL` - Your production backend URL
- `NEXT_PUBLIC_BETTER_AUTH_URL` - Your production frontend URL
- `BETTER_AUTH_SECRET` - Same secret as backend
- `NEXT_PUBLIC_SHOW_CHATBOT` - `true` or `false`

### Build Output
```bash
npm run build
npm start
```

## Features Walkthrough

### 1. Homepage
- Hero section with project branding
- Phase completion status
- Feature highlights
- Login/Signup CTAs

### 2. Authentication
- Signup with email, password, and name
- Login with email and password
- JWT token management
- Protected routes

### 3. Dashboard
- Task list with filtering and search
- Add new tasks
- Update task details
- Delete tasks
- Mark tasks as complete
- Priority and category management

### 4. AI Chatbot
- Floating chat window
- Natural language processing
- Slash command support
- Conversation history
- Session isolation
- Real-time responses

## Troubleshooting

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Ensure backend is running on the specified port
- Check CORS configuration in backend

### Authentication Errors
- Verify `BETTER_AUTH_SECRET` matches backend
- Clear browser cookies and try again
- Check JWT token expiration settings

### Chatbot Not Responding
- Verify backend AI endpoints are working
- Check OpenRouter and Google API keys in backend
- Review browser console for errors

### Build Errors
- Clear `.next` directory: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run type-check`

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance
- Server-side rendering (SSR) for initial page load
- Client-side navigation for instant transitions
- Optimized images with Next.js Image component
- Code splitting for faster load times

## Security
- JWT token authentication
- HTTP-only cookies
- CSRF protection
- XSS prevention
- Secure API communication

## License
MIT

## Contributors
Raif Tayyab Memon
