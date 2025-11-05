import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4 drop-shadow-sm">
            PDF Tools
          </h1>
          <p className="text-xl text-gray-700">
            Bezplatné online nástroje na úpravu PDF súborov
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Merge PDFs */}
          <Link href="/merge" className="block group">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Spojiť PDF</h3>
              <p className="text-gray-600">Spojte viacero PDF súborov do jedného dokumentu</p>
            </div>
          </Link>

          {/* Split PDF */}
          <Link href="/split" className="block group">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Rozdeliť PDF</h3>
              <p className="text-gray-600">Rozdeľte PDF na samostatné stránky</p>
            </div>
          </Link>

          {/* Compress PDF */}
          <Link href="/compress" className="block group">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Komprimovať PDF</h3>
              <p className="text-gray-600">Znížte veľkosť PDF súboru</p>
            </div>
          </Link>

          {/* Convert to PDF */}
          <Link href="/convert" className="block group">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Konvertovať do PDF</h3>
              <p className="text-gray-600">Konvertujte obrázky (JPG, PNG) do PDF formátu</p>
            </div>
          </Link>

          {/* PDF to Images */}
          <Link href="/pdf-to-images" className="block group">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20">
              <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">PDF do obrázkov</h3>
              <p className="text-gray-600">Konvertujte PDF stránky na obrázky (JPG, PNG)</p>
            </div>
          </Link>

          {/* Rotate PDF */}
          <Link href="/rotate" className="block group">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Otočiť PDF</h3>
              <p className="text-gray-600">Otočte stránky PDF o 90, 180 alebo 270 stupňov</p>
            </div>
          </Link>

          {/* Organize PDF */}
          <Link href="/organize" className="block group">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Organizovať PDF</h3>
              <p className="text-gray-600">Preusporiadajte alebo odstráňte stránky pomocou drag & drop</p>
            </div>
          </Link>

          {/* Watermark */}
          <Link href="/watermark" className="block group">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Vodoznak</h3>
              <p className="text-gray-600">Pridajte textový vodoznak na všetky stránky PDF</p>
            </div>
          </Link>

          {/* Sign PDF */}
          <Link href="/sign" className="block group">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Podpísať PDF</h3>
              <p className="text-gray-600">Pridajte svoj podpis nakreslením alebo nahratím obrázka</p>
            </div>
          </Link>

          {/* Excel to PDF */}
          <Link href="/excel-to-pdf" className="block group">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Excel → PDF</h3>
              <p className="text-gray-600">Konvertujte Excel tabuľky (.xlsx, .xls) do PDF formátu</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
