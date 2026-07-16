# RAG Chat Assistant

This is a lightweight chat assistant built with Next.js that answers questions from the PDF file in this folder.

## Features
- Simple chat UI
- PDF-based retrieval using the document in the project root
- Deployable to Vercel

## Run locally
1. Install Node.js and npm.
2. Run `npm install`
3. In a new terminal, set the environment variables and run the app:
   - PowerShell:
     - `$env:GROQ_API_KEY="your_api_key"`
     - `$env:GROQ_API_HOST="https://api.groq.com/v1"`
     - `$env:GROQ_API_MODEL="groq-sonic"`
     - `npm run dev`
   - Git Bash:
     - `export GROQ_API_KEY=your_api_key`
     - `export GROQ_API_HOST=https://api.groq.com/v1`
     - `export GROQ_API_MODEL=groq-sonic`
     - `npm run dev`
4. Open `http://localhost:3000`

## Enable Groq API reasoning
This app now uses a remote Groq API for reasoning. Make sure you set `GROQ_API_KEY` before starting the app.

## Deploy to Vercel
1. Push this folder to GitHub.
2. Import the repository into Vercel.
3. Vercel will detect Next.js automatically.
4. Make sure the PDF file is included in the repository root.
