'use client';

import { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import Link from 'next/link';

export default function RotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState<number>(90);
  const [pageCount, setPageCount] = useState<number>(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
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

  const rotatePDF = async () => {
    if (!file) {
      alert('Prosím nahrajte PDF súbor');
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPages();

      // Otočiť všetky stránky
      pages.forEach(page => {
        page.setRotation(degrees(rotation));
      });

      const pdfBytes = await pdf.save();
      const byteArray = Uint8Array.from(pdfBytes);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `otocene-${rotation}-stupnov.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Chyba pri otáčaní PDF:', error);
      alert('Chyba pri otáčaní PDF súboru');
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Otočiť PDF</h1>
          <p className="text-gray-600">Otočte všetky stránky PDF o požadovaný uhol</p>
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
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>

            {file && pageCount > 0 && (
              <div className="mb-6">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{file.name}</span> - {pageCount} strán
                  </p>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vyberte uhol otočenia
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setRotation(90)}
                    className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                      rotation === 90
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    90°
                  </button>
                  <button
                    onClick={() => setRotation(180)}
                    className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                      rotation === 180
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    180°
                  </button>
                  <button
                    onClick={() => setRotation(270)}
                    className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                      rotation === 270
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    270°
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={rotatePDF}
              disabled={!file || isProcessing}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Otáčam PDF...' : `Otočiť o ${rotation}°`}
            </button>
          </div>

          <div className="mt-8 bg-indigo-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Ako to funguje?</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. Vyberte PDF súbor, ktorý chcete otočiť</li>
              <li>2. Zvoľte uhol otočenia (90°, 180° alebo 270°)</li>
              <li>3. Kliknite na tlačidlo "Otočiť"</li>
              <li>4. Otočený PDF súbor sa automaticky stiahne</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
