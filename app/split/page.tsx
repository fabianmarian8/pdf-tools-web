'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import Link from 'next/link';

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Zistiť počet strán
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        setPageCount(pdf.getPageCount());
      } catch (error) {
        console.error('Chyba pri načítaní PDF:', error);
        alert('Chyba pri načítaní PDF súboru');
      }
    }
  };

  const splitPDF = async () => {
    if (!file) {
      alert('Prosím nahrajte PDF súbor');
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();

      // Vytvoriť samostatné PDF pre každú stránku
      for (let i = 0; i < totalPages; i++) {
        const singlePagePdf = await PDFDocument.create();
        const [copiedPage] = await singlePagePdf.copyPages(pdf, [i]);
        singlePagePdf.addPage(copiedPage);

        const pdfBytes = await singlePagePdf.save();
        const byteArray = Uint8Array.from(pdfBytes);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `stranka-${i + 1}.pdf`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        // Malé oneskorenie medzi sťahovaním
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      alert(`Úspešne rozdelené na ${totalPages} súborov!`);
    } catch (error) {
      console.error('Chyba pri rozdeľovaní PDF:', error);
      alert('Chyba pri rozdeľovaní PDF súboru');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Späť na hlavnú stránku
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Rozdeliť PDF súbor</h1>
          <p className="text-gray-600">Rozdeľte PDF na samostatné stránky</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vyberte PDF súbor
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
              />
            </div>

            {file && pageCount > 0 && (
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{file.name}</span> - {pageCount} strán
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Vytvorí sa {pageCount} samostatných PDF súborov
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={splitPDF}
              disabled={!file || isProcessing}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Rozdeľujem PDF...' : 'Rozdeliť PDF'}
            </button>
          </div>

          <div className="mt-8 bg-green-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Ako to funguje?</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. Vyberte PDF súbor, ktorý chcete rozdeliť</li>
              <li>2. Aplikácia automaticky zistí počet strán</li>
              <li>3. Kliknite na tlačidlo "Rozdeliť PDF"</li>
              <li>4. Každá stránka sa stiahne ako samostatný PDF súbor</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
