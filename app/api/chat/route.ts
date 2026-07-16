import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

export const runtime = 'nodejs';

type OllamaResponse = {
  response?: string;
  done?: boolean;
  error?: string;
};

async function generateWithLocalModel(question: string, context: string) {
  const model = process.env.OLLAMA_MODEL || 'llama2';
  const host = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
  const endpoint = `${host.replace(/\/$/, '')}/api/generate`;

  const prompt = `You are a helpful assistant powered by Llama 2. Use the provided context to answer the user question. If the context is insufficient, say so clearly. Do not invent facts.\n\nContext:\n${context}\n\nQuestion: ${question}\n\nAnswer:`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as OllamaResponse;
    const answer = data.response?.trim();
    return answer && answer.length > 0 ? answer : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ answer: 'Please provide a question.' }, { status: 400 });
    }

    const pdfPath = path.join(process.cwd(), 'Annual-Report-2025.pdf');

    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json({ answer: 'PDF file not found. Place Annual-Report-2025.pdf in the project root.' }, { status: 404 });
    }

    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    const chunks = text.split(/\n{2,}/).filter(Boolean);
    const normalizedQuestion = question.toLowerCase();
    const relevant = chunks.filter((chunk) => chunk.toLowerCase().includes(normalizedQuestion));
    const context = relevant.slice(0, 6).join('\n\n');

    const fallbackAnswer = relevant.length > 0
      ? relevant.slice(0, 3).join('\n\n')
      : `I could not find a direct match in the document. Here is a short excerpt:\n\n${chunks[0] || 'No content available.'}`;

    const modelAnswer = await generateWithLocalModel(question, context || chunks.slice(0, 3).join('\n\n'));

    return NextResponse.json({
      answer: modelAnswer || fallbackAnswer,
      mode: modelAnswer ? 'local-llama' : 'retrieval',
      model: process.env.OLLAMA_MODEL || 'llama2',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ answer: 'Failed to process the document.' }, { status: 500 });
  }
}
