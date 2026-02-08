# Todo App Backend - FastAPI + MCP

## Overview
This is the backend API for the Todo App, built with FastAPI, SQLModel, and Neon Serverless PostgreSQL. It implements Phase II (Full-Stack MVP) and Phase III (AI Chatbot) requirements.

## Technology Stack
- **Framework:** FastAPI
- **ORM:** SQLModel
- **Database:** Neon Serverless PostgreSQL
- **Authentication:** Better Auth with JWT
- **AI Integration:** OpenAI Agents SDK + MCP (Model Context Protocol)
- **AI Models:** OpenRouter (GPT-4o-mini) with Google Gemini 2.0 Flash fallback

## Features

### Phase II: Full-Stack MVP
- ✅ RESTful API with FastAPI
- ✅ User authentication (signup/login) with Better Auth + JWT
- ✅ Task CRUD operations (Create, Read, Update, Delete)
- ✅ Task completion toggle
- ✅ Priorities (High, Medium, Low)
- ✅ Tags/Categories
- ✅ Search functionality
- ✅ Filtering by priority and tags
- ✅ Sorting by created_at, priority, etc.

### Phase III: AI Chatbot
- ✅ Stateless chat endpoint (`POST /api/chat`)
- ✅ OpenAI Agents SDK integration
- ✅ MCP Tools for task management
- ✅ Conversation persistence to database
- ✅ Dual-model fallback system (OpenRouter → Gemini)

## Project Structure
```
api/
├── api/
│   └── v1/
│       ├── api.py              # FastAPI app entry point
│       └── endpoints/          # API route handlers
│           ├── auth.py         # Authentication endpoints
│           ├── tasks.py        # Task CRUD endpoints
│           ├── chat.py         # AI chatbot endpoint
│           ├── conversations.py # Conversation management
│           ├── events.py       # Dapr event handlers
│           └── cron.py         # Scheduled tasks
├── models/                     # SQLModel database models
│   ├── user.py
│   ├── task.py
│   ├── conversation.py
│   └── chat_message.py
├── services/                   # Business logic layer
│   ├── task_service.py
│   ├── chat_service.py
│   └── conversation_service.py
├── repositories/               # Data access layer
│   ├── task_repository.py
│   └── chat_repository.py
├── consumers/                  # Event consumers
│   ├── recurring_consumer.py
│   └── notification_consumer.py
├── core/                       # Core configuration
│   ├── config.py               # Settings management
│   └── security.py             # JWT authentication
└── database/
    └── session.py              # Database connection
```

## Setup Instructions

### Prerequisites
- Python 3.13+
- Neon PostgreSQL account (free tier available)
- OpenRouter API key
- Google API key (for Gemini fallback)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd todo-hackathon/api
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   
   Create `.env` file in the `api` directory:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_M7QirkT8XaPF@ep-jolly-water-ai385sfa-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   JWT_ALGORITHM=HS256
   JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
   BETTER_AUTH_SECRET=<your-secret-key>
   BETTER_AUTH_URL=http://localhost:3000
   GOOGLE_API_KEY=<your-google-api-key>
   OPENROUTER_API_KEY=<your-openrouter-api-key>
   FORCE_USE_BACKUP=False
   ```

5. **Run the server**
   ```bash
   python -m uvicorn api.api.v1.api:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and receive JWT token

### Tasks
- `GET /api/tasks` - List all tasks (with filtering, search, sorting)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/{id}` - Get task details
- `PUT /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task
- `PATCH /api/tasks/{id}/complete` - Toggle task completion

### AI Chatbot
- `POST /api/chat` - Send message to AI chatbot
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/history` - Clear chat history

### Conversations
- `GET /api/conversations` - List all conversations
- `POST /api/conversations` - Create new conversation
- `PUT /api/conversations/{id}` - Rename conversation
- `DELETE /api/conversations/{id}` - Delete conversation

## MCP Tools

The AI chatbot uses the following MCP tools to manage tasks:

| Tool | Description | Parameters |
|------|-------------|------------|
| `add_task` | Create a new task | `title`, `priority`, `category` |
| `list_tasks` | List all tasks | `status` (optional) |
| `complete_task` | Mark task as complete | `task_id` |
| `delete_task` | Delete a task | `task_id` |
| `update_task` | Update task details | `task_id`, `title`, `description` |
| `search_tasks` | Search tasks by keyword | `query` |
| `get_task_analytics` | Get task statistics | None |
| `clear_completed` | Delete all completed tasks | None |

## Database Models

### User
- `id` (string, primary key)
- `email` (string, unique)
- `name` (string)
- `hashed_password` (string)
- `created_at` (datetime)

### Task
- `id` (integer, primary key)
- `user_id` (string, foreign key)
- `description` (string)
- `completed` (boolean)
- `category` (string)
- `priority` (string: high/medium/low)
- `tags` (JSON array)
- `created_at` (datetime)
- `updated_at` (datetime)

### Conversation
- `id` (integer, primary key)
- `user_id` (string, foreign key)
- `session_id` (string, UUID)
- `title` (string)
- `created_at` (datetime)
- `updated_at` (datetime)

### ChatMessage
- `id` (integer, primary key)
- `user_id` (string, foreign key)
- `conversation_id` (integer, foreign key)
- `role` (string: user/assistant)
- `content` (text)
- `source` (string)
- `timestamp` (datetime)

## AI Architecture

### Stateless Chat Endpoint
The chat endpoint is designed to be stateless:
1. Receive user message
2. Fetch conversation history from database
3. Build message array for AI agent
4. Store user message in database
5. Run AI agent with MCP tools
6. Store assistant response in database
7. Return response to client

### Dual-Model Fallback
- **Primary:** OpenRouter (GPT-4o-mini) via OpenAI SDK
- **Fallback:** Google Gemini 2.0 Flash (direct HTTP calls)
- Automatic fallback on primary model failure

## Development

### Running Tests
```bash
pytest
```

### Code Style
```bash
black .
flake8 .
```

### Database Migrations
The app uses SQLModel's automatic table creation. For production, consider using Alembic for migrations.

## Deployment

### Vercel Serverless
The backend can be deployed to Vercel as serverless functions. Configure `vercel.json` to route API requests.

### Docker
```bash
docker build -t todo-backend .
docker run -p 8000:8000 --env-file .env todo-backend
```

### Environment Variables for Production
Ensure all sensitive values are set as environment variables:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `GOOGLE_API_KEY`
- `OPENROUTER_API_KEY`

## Security

- JWT tokens for authentication
- Shared `BETTER_AUTH_SECRET` between frontend and backend
- User-scoped data access (all queries filtered by user_id)
- Secure database connections with SSL

## Troubleshooting

### Import Errors
All imports use absolute paths (e.g., `from api.models.task import Task`). If you encounter import errors, ensure you're running from the project root.

### Database Connection Issues
Verify your `DATABASE_URL` is correct and includes `sslmode=require&channel_binding=require` for Neon PostgreSQL.

### AI Model Errors
If OpenRouter fails, the system automatically falls back to Google Gemini. Check both API keys if chatbot isn't responding.

## License
MIT

## Contributors
Raif Tayyab Memon
