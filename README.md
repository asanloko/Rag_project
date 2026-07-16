# RAG Chat Assistant

This is a lightweight chat assistant built with Next.js that answers questions from the PDF file in this folder.

## Features
- Simple chat UI
- PDF-based retrieval using the document in the project root
- Deployable to Vercel

## Run locally
1. Install Node.js and npm.
2. Run `npm install`
3. Run `npm run dev`
4. Open `http://localhost:3000`

## Enable local Llama 2 reasoning
This app can use a local Ollama-backed Llama 2 model for better reasoning.

1. Install Ollama from https://ollama.com/
2. Pull a Llama 2 model locally, for example:
   - `ollama pull llama2`
3. Start Ollama.
4. Set these environment variables before running the app:
   - `OLLAMA_MODEL=llama2`
   - `OLLAMA_HOST=http://127.0.0.1:11434`

You can also place model files in the `models/` folder if you want to keep local assets together.

## Deploy to Vercel
1. Push this folder to GitHub.
2. Import the repository into Vercel.
3. Vercel will detect Next.js automatically.
4. Make sure the PDF file is included in the repository root.
