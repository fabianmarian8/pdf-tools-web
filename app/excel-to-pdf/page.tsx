'use client';

import { useState } from 'react';
import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function ExcelToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Kontrola či je Excel súbor
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel.sheet.macroEnabled.12'
      ];
      
      if (!validTypes.includes(selectedFile.type) && 
          !selectedFile.name.match(/\.(xlsx|xls|xlsm)$/i)) {
        setError('Prosím nahrajte Excel súbor (.xlsx, .xls, .xlsm)');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const convertToPdf = async () => {
    if (!file) {
      setError('Prosím nahrajte Excel súbor');
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError('');

    try {
      // Krok 1: Konvertuj súbor na Base64
      setProgress(20);
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;
      setProgress(40);

      // Krok 2: Volanie PDF.co API
      const response = await fetch('/api/excel-to-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Data,
          fileName: file.name,
        }),
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Chyba pri konverzii');
      }

      // Krok 3: Stiahnutie PDF
      const blob = await response.blob();
      setProgress(90);

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace(/\.(xlsx|xls|xlsm)$/i, '.pdf');
      link.click();
      
      URL.revokeObjectURL(url);
      setProgress(100);

      // Reset po úspešnej konverzii
      setTimeout(() => {
        setFile(null);
        setProgress(0);
        setIsProcessing(false);
      }, 1000);

    } catch (error) {
      console.error('Chyba pri konverzii:', error);
      setError(error instanceof Error ? error.message : 'Chyba pri konverzii Excel na PDF');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Späť na hlavnú stránku
            </Link>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Excel → PDF
            </h1>
            <p className="text-gray-600">
              Konvertujte Excel tabuľky na PDF súbory
            </p>
          </div>

          {/* Upload Area */}
          <div className="mb-6">
            <label className="block w-full">
              <div className={`
                border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                transition-all duration-200
                ${file 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-purple-300 hover:border-purple-400 hover:bg-purple-50'
                }
              `}>
                <input
                  type="file"
                  accept=".xlsx,.xls,.xlsm,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isProcessing}
                />
                
                <div className="space-y-4">
                  {file ? (
                    <>
                      <div className="text-6xl">📊</div>
                      <div>
                        <p className="text-xl font-semibold text-gray-700">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl">📁</div>
                      <div>
                        <p className="text-xl font-semibold text-gray-700">
                          Kliknite alebo presuňte Excel súbor
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Podporované formáty: .xlsx, .xls, .xlsm
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Progress Bar */}
          {isProcessing && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Konverzia prebieha...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Convert Button */}
          <button
            onClick={convertToPdf}
            disabled={!file || isProcessing}
            className={`
              w-full py-4 px-6 rounded-xl font-semibold text-white
              transition-all duration-200 transform
              ${!file || isProcessing
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
              }
            `}
          >
            {isProcessing ? 'Konvertujem...' : 'Konvertovať na PDF'}
          </button>

          {/* Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informácie</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Konverzia prebieha bezpečne cez PDF.co API</li>
              <li>• Zachováva formátovanie a štýly</li>
              <li>• Podporuje viacero listov (sheets)</li>
              <li>• Maximálna veľkosť: 50 MB</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
