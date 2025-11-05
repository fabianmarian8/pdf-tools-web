'use client';

import { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';

type SignatureMode = 'draw' | 'upload';

export default function SignPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<SignatureMode>('draw');
  const [signatureImage, setSignatureImage] = useState<string>('');
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [signatureSize, setSignatureSize] = useState(150);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && mode === 'draw') {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
      }
    }
  }, [mode]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdfDoc.getPageCount());
      setPageNumber(1);
    } catch (error) {
      console.error('Chyba pri načítaní PDF:', error);
      alert('Chyba pri načítaní PDF súboru');
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveCanvasAsImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    setSignatureImage(dataUrl);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSignatureImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const addSignatureToPDF = async () => {
    if (!file) {
      alert('Prosím nahrajte PDF súbor');
      return;
    }

    let imgData = signatureImage;
    
    if (mode === 'draw' && !signatureImage) {
      saveCanvasAsImage();
      imgData = canvasRef.current?.toDataURL('image/png') || '';
    }

    if (!imgData) {
      alert('Prosím vytvorte alebo nahrajte podpis');
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Konvertujeme base64 na embedovaný obrázok
      const pngImageBytes = await fetch(imgData).then((res) => res.arrayBuffer());
      const pngImage = await pdfDoc.embedPng(pngImageBytes);

      const page = pdfDoc.getPage(pageNumber - 1);
      const { width, height } = page.getSize();

      // Umiestnime podpis v pravom dolnom rohu
      const signatureWidth = signatureSize;
      const signatureHeight = (pngImage.height / pngImage.width) * signatureWidth;

      page.drawImage(pngImage, {
        x: width - signatureWidth - 50,
        y: 50,
        width: signatureWidth,
        height: signatureHeight,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'podpisane-pdf.pdf';
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Chyba pri pridávaní podpisu:', error);
      alert('Chyba pri pridávaní podpisu do PDF');
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">Podpísať PDF</h1>
          <p className="text-gray-700">Pridajte svoj podpis do PDF dokumentu</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="space-y-6">
              {/* Upload PDF */}
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
                  <p className="mt-2 text-sm text-gray-600">
                    {file.name} • {totalPages} {totalPages === 1 ? 'stránka' : totalPages < 5 ? 'stránky' : 'strán'}
                  </p>
                )}
              </div>

              {/* Režim podpisu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spôsob podpisu
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMode('draw')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      mode === 'draw'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    ✍️ Nakresliť podpis
                  </button>
                  <button
                    onClick={() => setMode('upload')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      mode === 'upload'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    📤 Nahrať obrázok
                  </button>
                </div>
              </div>

              {/* Draw signature */}
              {mode === 'draw' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nakreslite svoj podpis
                  </label>
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="w-full cursor-crosshair"
                    />
                  </div>
                  <button
                    onClick={clearCanvas}
                    className="mt-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Vymazať podpis
                  </button>
                </div>
              )}

              {/* Upload signature */}
              {mode === 'upload' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nahrajte obrázok podpisu (PNG, JPG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {signatureImage && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <img 
                        src={signatureImage} 
                        alt="Podpis" 
                        className="max-h-32 mx-auto"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Číslo stránky */}
              {totalPages > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stránka na podpísanie: {pageNumber} z {totalPages}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max={totalPages}
                    value={pageNumber}
                    onChange={(e) => setPageNumber(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              {/* Veľkosť podpisu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Veľkosť podpisu: {signatureSize}px
                </label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={signatureSize}
                  onChange={(e) => setSignatureSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Tlačidlo */}
              <button
                onClick={addSignatureToPDF}
                disabled={!file || isProcessing}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isProcessing ? 'Pridávam podpis...' : 'Podpísať a stiahnuť PDF'}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 bg-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50">
            <h3 className="font-semibold text-gray-900 mb-2">ℹ️ Informácie</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Podpis bude umiestnený v pravom dolnom rohu vybranej stránky</li>
              <li>• Môžete si vybrať medzi nakreslením podpisu alebo nahratím obrázka</li>
              <li>• Podpis sa pridá len na jednu vybranú stránku</li>
              <li>• Pre transparentný podpis použite PNG obrázok</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
