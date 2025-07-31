# PromptHub

## Project Explanation
PromptHub is designed to be the central platform for anyone working with AI prompts—whether you’re a developer, researcher, or enthusiast. It streamlines the process of creating, organizing, sharing, and discovering prompts for AI models (like GPT, Stable Diffusion, etc.).

**Key Features:**
- **Prompt Management:** Save, categorize, and edit your favorite prompts in one place.
- **Community Sharing:** Share prompts with others and discover trending or high-quality prompts from the community.
- **Authentication & Security:** Secure user accounts and private prompt storage.
- **Advanced Search:** Quickly find prompts by tags, keywords, or popularity.
- **Modern UI:** Clean, responsive interface for a seamless experience.

PromptHub aims to boost productivity and collaboration for anyone working with generative AI by making prompt workflows easy, organized, and social.

---

## Directory Structure

```
Prompthub/
├── backend/    # Node.js Express backend with GraphQL, Prisma ORM, Redis
├── frontend/   # Next.js React frontend, Tailwind CSS, Apollo Client
├── .gitignore
└── README.md
```

## Tech Stack

### Frontend
- **Framework:** Next.js (React, TypeScript)
- **Styling:** Tailwind CSS, Radix UI, Framer Motion
- **GraphQL Client:** Apollo Client
- **OAuth:** Google
- **Other:** Cloudinary, lucide-react, sonner

### Backend
- **Framework:** Express.js (TypeScript)
- **GraphQL Server:** Apollo Server Express
- **ORM:** Prisma
- **Authentication:** JWT, bcryptjs, Google Auth
- **Database:** (configured via Prisma, see `backend/prisma`)
- **Cache:** Redis

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- Docker (optional, for containerized setup)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Prompthub
```

### 2. Environment Variables
- Copy `.env.example` (if available) in both `frontend` and `backend` to `.env` and fill in the required values (API keys, DB URL, etc).

### 3. Install Dependencies
#### Frontend
```bash
cd frontend
npm install
```
#### Backend
```bash
cd ../backend
npm install
```

### 4. Database Setup (Backend)
```bash
npx prisma migrate dev
```

### 5. Running Locally
#### Frontend
```bash
cd frontend
npm run dev
```
#### Backend
```bash
cd backend
npm run dev
```

### 6. Running with Docker
- There is a `Dockerfile` and `docker-compose.yml` in the `frontend` directory. You may need to add or adjust services for the backend.
- Example (from project root):
```bash
docker-compose up --build
```

---

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## License
This project is licensed under the MIT License. See the LICENSE file for details.

---

## Contact
For questions or support, please open an issue on GitHub.
