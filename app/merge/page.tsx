'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      alert('Prosím nahrajte aspoň 2 PDF súbory');
      return;
    }

    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const byteArray = Uint8Array.from(mergedPdfBytes);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'spojene-pdf.pdf';
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Chyba pri spájaní PDF:', error);
      alert('Chyba pri spájaní PDF súborov');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Späť na hlavnú stránku
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">Spojiť PDF súbory</h1>
          <p className="text-gray-700">Vyberte viacero PDF súborov a spojte ich do jedného dokumentu</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vyberte PDF súbory (min. 2)
              </label>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Vybrané súbory ({files.length}):
                </h3>
                <ul className="space-y-1">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={mergePDFs}
              disabled={files.length < 2 || isProcessing}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isProcessing ? 'Spájam PDF...' : 'Spojiť PDF súbory'}
            </button>
          </div>

          <div className="mt-8 bg-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50">
            <h3 className="font-semibold text-gray-900 mb-2">Ako to funguje?</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. Vyberte minimálne 2 PDF súbory</li>
              <li>2. Súbory budú spojené v poradí, v akom boli vybrané</li>
              <li>3. Kliknite na tlačidlo "Spojiť PDF súbory"</li>
              <li>4. Spojený PDF súbor sa automaticky stiahne</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
