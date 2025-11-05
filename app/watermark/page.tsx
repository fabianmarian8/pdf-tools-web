'use client';

import { useState } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [opacity, setOpacity] = useState(0.3);
  const [fontSize, setFontSize] = useState(48);
  const [rotation, setRotation] = useState(45);
  const [position, setPosition] = useState<'center' | 'top' | 'bottom'>('center');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const addWatermark = async () => {
    if (!file || !watermarkText.trim()) {
      alert('Prosím nahrajte PDF súbor a zadajte text vodoznaku');
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);
        
        let x = (width - textWidth) / 2;
        let y = height / 2;

        // Pozícia vodoznaku
        if (position === 'top') {
          y = height - fontSize - 50;
        } else if (position === 'bottom') {
          y = fontSize + 50;
        }

        page.drawText(watermarkText, {
          x: x,
          y: y,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.5),
          opacity: opacity,
          rotate: degrees(rotation),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const pdfArrayBuffer = new Uint8Array(pdfBytes).buffer;
      const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pdf-s-vodoznakom.pdf';
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Chyba pri pridávaní vodoznaku:', error);
      alert('Chyba pri pridávaní vodoznaku do PDF');
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">Pridať vodoznak do PDF</h1>
          <p className="text-gray-700">Pridajte textový vodoznak na všetky stránky PDF súboru</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="space-y-6">
              {/* Upload súboru */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vyberte PDF súbor
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {file && (
                  <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {file.name}
                  </p>
                )}
              </div>

              {/* Text vodoznaku */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text vodoznaku
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Zadajte text vodoznaku..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Veľkosť písma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Veľkosť písma: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="120"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Priehľadnosť */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priehľadnosť: {Math.round(opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Rotácia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rotácia: {rotation}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Pozícia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pozícia vodoznaku
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setPosition('top')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      position === 'top'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Hore
                  </button>
                  <button
                    onClick={() => setPosition('center')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      position === 'center'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Stred
                  </button>
                  <button
                    onClick={() => setPosition('bottom')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      position === 'bottom'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Dole
                  </button>
                </div>
              </div>

              {/* Tlačidlo */}
              <button
                onClick={addWatermark}
                disabled={!file || !watermarkText.trim() || isProcessing}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isProcessing ? 'Pridávam vodoznak...' : 'Pridať vodoznak a stiahnuť'}
              </button>
            </div>
          </div>

          {/* Tip */}
          <div className="mt-8 bg-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50">
            <h3 className="font-semibold text-gray-900 mb-2">💡 Tipy pre vodoznak</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Použite rotáciu 45° pre diagonálny vodoznak naprieč stránkou</li>
              <li>• Nižšia priehľadnosť (20-40%) je vhodná pre nenápadný vodoznak</li>
              <li>• Vyššia priehľadnosť (60-80%) pre výraznejší vodoznak</li>
              <li>• Vodoznak sa pridá na všetky stránky PDF súboru</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
