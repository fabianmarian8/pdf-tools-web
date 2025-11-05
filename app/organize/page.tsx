'use client';

import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';

interface PagePreview {
  index: number;
  imageUrl: string;
  originalIndex: number;
}

export default function OrganizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfjsLibRef = useRef<typeof import('pdfjs-dist') | null>(null);

  const loadPdfjs = async (): Promise<typeof import('pdfjs-dist')> => {
    if (!pdfjsLibRef.current) {
      const pdfjsLib = await import('pdfjs-dist');
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      }
      pdfjsLibRef.current = pdfjsLib;
    }
    return pdfjsLibRef.current!;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsGeneratingPreviews(true);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfjs = await loadPdfjs();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      
      const pagePromises: Promise<PagePreview>[] = [];
      
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        pagePromises.push(
          (async () => {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 0.5 });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Canvas context not available');
            
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            await page.render({
              canvasContext: context,
              viewport: viewport,
              canvas,
            }).promise;
            
            return {
              index: i - 1,
              imageUrl: canvas.toDataURL(),
              originalIndex: i - 1,
            };
          })()
        );
      }
      
      const generatedPages = await Promise.all(pagePromises);
      setPages(generatedPages);
    } catch (error) {
      console.error('Chyba pri generovaní náhľadov:', error);
      alert('Chyba pri načítaní PDF súboru');
    } finally {
      setIsGeneratingPreviews(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newPages = [...pages];
    const draggedPage = newPages[draggedIndex];
    newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedPage);
    
    // Aktualizujeme indexy
    const updatedPages = newPages.map((page, idx) => ({
      ...page,
      index: idx,
    }));
    
    setPages(updatedPages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const deletePage = (index: number) => {
    const newPages = pages.filter((_, idx) => idx !== index);
    // Aktualizujeme indexy
    const updatedPages = newPages.map((page, idx) => ({
      ...page,
      index: idx,
    }));
    setPages(updatedPages);
  };

  const savePDF = async () => {
    if (!file || pages.length === 0) return;

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      // Skopírujeme stránky v novom poradí
      for (const page of pages) {
        const [copiedPage] = await newPdf.copyPages(originalPdf, [page.originalIndex]);
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const pdfArrayBuffer = new Uint8Array(pdfBytes).buffer;
      const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'organizovane-pdf.pdf';
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Chyba pri ukladaní PDF:', error);
      alert('Chyba pri vytváraní nového PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">Organizovať PDF</h1>
          <p className="text-gray-700">Preusporiadajte, alebo odstráňte stránky z PDF súboru</p>
        </div>

        <div className="max-w-6xl mx-auto">
          {pages.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vyberte PDF súbor
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              {isGeneratingPreviews && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Generujem náhľady strán...</p>
                </div>
              )}

              <div className="mt-8 bg-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50">
                <h3 className="font-semibold text-gray-900 mb-2">Ako to funguje?</h3>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li>1. Nahrajte PDF súbor</li>
                  <li>2. Zobrazia sa náhľady všetkých strán</li>
                  <li>3. Preusporiadajte stránky pomocou drag & drop</li>
                  <li>4. Odstráňte neželané stránky kliknutím na ikonu koša</li>
                  <li>5. Stiahnite nový organizovaný PDF</li>
                </ol>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {file?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {pages.length} {pages.length === 1 ? 'stránka' : pages.length < 5 ? 'stránky' : 'strán'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={resetAll}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Nahrať iný súbor
                    </button>
                    <button
                      onClick={savePDF}
                      disabled={isProcessing || pages.length === 0}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                      {isProcessing ? 'Ukladám...' : 'Stiahnuť PDF'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pages.map((page, index) => (
                    <div
                      key={page.originalIndex}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`relative group cursor-move bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 ${
                        draggedIndex === index ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg z-10">
                        {index + 1}
                      </div>
                      
                      <button
                        onClick={() => deletePage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
                        title="Odstrániť stránku"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      <img
                        src={page.imageUrl}
                        alt={`Stránka ${index + 1}`}
                        className="w-full h-auto rounded-lg border-2 border-gray-200"
                      />
                      
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 rounded-lg pointer-events-none transition-colors"></div>
                    </div>
                  ))}
                </div>

                {pages.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    Všetky stránky boli odstránené. Nahrajte nový súbor.
                  </div>
                )}
              </div>

              <div className="mt-6 bg-blue-50/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-100/50">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <strong>Tip:</strong> Uchopte a pretiahnite stránky pre zmenu poradia. Kliknite na ikonu koša pre odstránenie stránky.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
