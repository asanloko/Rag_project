import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

export const runtime = 'nodejs';

async function generateWithGroq(question: string, context: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY in environment');
  }

  const host = process.env.GROQ_API_HOST || 'https://api.groq.com/v1';
  const model = process.env.GROQ_API_MODEL || 'mixtral-8x7b-32768';
  const endpoint = `${host.replace(/\/$/, '')}/chat/completions`;

  const prompt = `You are a helpful assistant for a document Q&A system. Use the provided context to answer the user question. If the context is insufficient, say so clearly. Do not invent facts.

Context:
${context}

Question: ${question}

Answer:`;

  console.log('Calling Groq API at:', endpoint);
  console.log('Using model:', model);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 512,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error('Groq API error response:', body);
    throw new Error(`Groq API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  console.log('Groq API response received');
  
  const answer = data.choices?.[0]?.message?.content?.trim();

  return answer && answer.length > 0 ? answer : null;
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

    let modelAnswer: string | null = null;
    try {
      modelAnswer = await generateWithGroq(question, context || chunks.slice(0, 3).join('\n\n'));
    } catch (error) {
      console.error('Groq API failed:', error);
    }

    const responsePayload: any = {
      answer: modelAnswer || fallbackAnswer,
      mode: modelAnswer ? 'groq-api' : 'retrieval',
    };

    if (modelAnswer) {
      responsePayload.model = process.env.GROQ_API_MODEL || 'mixtral-8x7b-32768';
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ answer: 'Failed to process the document.' }, { status: 500 });
  }
}
