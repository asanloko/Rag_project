declare module 'pdf-parse' {
  interface PdfParseResult {
    text: string;
  }

  const pdfParse: (data: Buffer | Uint8Array) => Promise<PdfParseResult>;
  export default pdfParse;
}
