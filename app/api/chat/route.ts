import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

export const runtime = 'nodejs';

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
    const relevant = chunks.filter((chunk) => chunk.toLowerCase().includes(question.toLowerCase()));

    const answer = relevant.length > 0
      ? relevant.slice(0, 3).join('\n\n')
      : `I could not find a direct match in the document. Here is a short excerpt:\n\n${chunks[0] || 'No content available.'}`;

    return NextResponse.json({ answer });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ answer: 'Failed to process the document.' }, { status: 500 });
  }
}
