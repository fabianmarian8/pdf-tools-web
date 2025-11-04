'use client';

import { useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function ConvertPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) {
      setFiles([]);
      return;
    }

    const validFiles = Array.from(selectedFiles).filter((file) =>
      ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type),
    );

    if (validFiles.length !== selectedFiles.length) {
      alert('Niektoré súbory neboli obrázky vo formáte JPG alebo PNG a neboli pridané.');
    }

    setFiles(validFiles);
  };

  const convertToPDF = async () => {
    if (files.length === 0) {
      alert('Prosím vyberte aspoň jeden obrázok.');
      return;
    }

    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();

        let image;
        if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          image = await pdfDoc.embedJpg(arrayBuffer);
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const byteArray = Uint8Array.from(pdfBytes);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'konvertovane-obrazky.pdf';
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Chyba pri konverzii:', error);
      alert('Chyba pri konverzii obrázkov do PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="mb-8">
          <Link href="/" className="text-orange-600 hover:text-orange-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Späť na hlavnú stránku
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">Konvertovať do PDF</h1>
          <p className="text-gray-700">Konvertujte JPG a PNG obrázky do PDF formátu</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vyberte obrázky (JPG, PNG)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
              />
            </div>

            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Vybrané obrázky ({files.length}):
                </h3>
                <ul className="space-y-1 max-h-48 overflow-y-auto">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={convertToPDF}
              disabled={files.length === 0 || isProcessing}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isProcessing ? 'Konvertujem...' : 'Konvertovať do PDF'}
            </button>
          </div>

          <div className="mt-8 bg-orange-50/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-100/50">
            <h3 className="font-semibold text-gray-900 mb-2">Ako to funguje?</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. Vyberte jeden alebo viac obrázkov (JPG alebo PNG)</li>
              <li>2. Obrázky budú pridané do PDF v poradí výberu</li>
              <li>3. Každý obrázok bude na samostatnej stránke</li>
              <li>4. Kliknite na tlačidlo "Konvertovať do PDF"</li>
              <li>5. PDF súbor sa automaticky stiahne</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
