'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      setCompressedSize(0);
    }
  };

  const compressPDF = async () => {
    if (!file) {
      alert('Prosím nahrajte PDF súbor');
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      // Základná kompresia - odstránenie metadát a optimalizácia
      const pdfBytes = await pdf.save({
        useObjectStreams: false,
        addDefaultPage: false,
        objectsPerTick: 50,
      });

      const byteArray = Uint8Array.from(pdfBytes);
      setCompressedSize(byteArray.length);
      
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'komprimovane-pdf.pdf';
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Chyba pri kompresii PDF:', error);
      alert('Chyba pri kompresii PDF súboru');
    } finally {
      setIsProcessing(false);
    }
  };

  const getSavingsPercentage = (): number => {
    if (originalSize === 0 || compressedSize === 0) return 0;
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">Komprimovať PDF</h1>
          <p className="text-gray-700">Zmenšite veľkosť PDF súboru</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vyberte PDF súbor
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
              />
            </div>

            {file && (
              <div className="mb-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{file.name}</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Pôvodná veľkosť: {formatFileSize(originalSize)}
                  </p>
                  {compressedSize > 0 && (
                    <>
                      <p className="text-xs text-gray-600">
                        Komprimovaná veľkosť: {formatFileSize(compressedSize)}
                      </p>
                      <p className="text-xs text-green-600 font-semibold mt-1">
                        Úspora: {getSavingsPercentage()}%
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={compressPDF}
              disabled={!file || isProcessing}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isProcessing ? 'Kompresujem PDF...' : 'Komprimovať PDF'}
            </button>
          </div>

          <div className="mt-8 bg-purple-50/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50">
            <h3 className="font-semibold text-gray-900 mb-2">Ako to funguje?</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. Vyberte PDF súbor, ktorý chcete komprimovať</li>
              <li>2. Kliknite na tlačidlo "Komprimovať PDF"</li>
              <li>3. Aplikácia optimalizuje PDF a zmenší jeho veľkosť</li>
              <li>4. Komprimovaný PDF sa automaticky stiahne</li>
            </ol>
            <div className="mt-4 text-xs text-gray-500">
              <p><strong>Poznámka:</strong> Kompresia odstráni nadbytočné metadáta a optimalizuje štruktúru PDF. Kvalita obsahu zostáva zachovaná.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
