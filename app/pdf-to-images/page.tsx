'use client';

import { useState } from 'react';
import Link from 'next/link';

// Dynamic import pre pdfjs-dist aby sa načítal len v browseri
let pdfjsLib: any = null;

if (typeof window !== 'undefined') {
  import('pdfjs-dist').then((pdfjs) => {
    pdfjsLib = pdfjs;
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  });
}

type ImageFormat = 'png' | 'jpeg';

export default function PdfToImagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [format, setFormat] = useState<ImageFormat>('png');
  const [quality, setQuality] = useState(0.95);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const pdfFile = e.target.files[0];
      if (pdfFile.type === 'application/pdf') {
        setFile(pdfFile);
      } else {
        alert('Prosím vyberte PDF súbor');
      }
    }
  };

  const convertToImages = async () => {
    if (!file) {
      alert('Prosím nahrajte PDF súbor');
      return;
    }

    if (!pdfjsLib) {
      alert('PDF knižnica sa ešte načítava, prosím skúste znova o chvíľu');
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const numPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) continue;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `stranka-${pageNum}.${format}`;
            link.click();
            URL.revokeObjectURL(url);
          }
        }, `image/${format}`, quality);

        // Malá pauza medzi sťahovaním súborov
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      alert(`Hotovo! Stiahnutých ${numPages} obrázkov.`);
    } catch (error) {
      console.error('Chyba pri konverzii:', error);
      alert('Chyba pri konverzii PDF na obrázky');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-red-600 hover:text-red-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Späť na hlavnú stránku
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">PDF do obrázkov</h1>
          <p className="text-gray-600">Konvertujte stránky PDF na JPG alebo PNG obrázky</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vyberte PDF súbor
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
              />
            </div>

            {file && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {file.name}
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formát obrázka
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="png"
                    checked={format === 'png'}
                    onChange={(e) => setFormat(e.target.value as ImageFormat)}
                    className="mr-2"
                  />
                  PNG (vyššia kvalita)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="jpeg"
                    checked={format === 'jpeg'}
                    onChange={(e) => setFormat(e.target.value as ImageFormat)}
                    className="mr-2"
                  />
                  JPEG (menšia veľkosť)
                </label>
              </div>
            </div>

            {format === 'jpeg' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kvalita JPEG: {Math.round(quality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            <button
              onClick={convertToImages}
              disabled={!file || isProcessing}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Konvertujem...' : 'Konvertovať na obrázky'}
            </button>
          </div>

          <div className="mt-8 bg-red-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Ako to funguje?</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. Vyberte PDF súbor</li>
              <li>2. Zvoľte formát obrázka (PNG alebo JPEG)</li>
              <li>3. Pre JPEG môžete nastaviť kvalitu kompresie</li>
              <li>4. Kliknite na tlačidlo "Konvertovať na obrázky"</li>
              <li>5. Každá stránka PDF sa stiahne ako samostatný obrázok</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
