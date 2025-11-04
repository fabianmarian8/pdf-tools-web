'use client';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient mesh pozadie */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
      
      {/* Animované bubliny */}
      <div className="absolute top-0 left-0 w-full h-full">
        {/* Veľká modrá bublina */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float-slow" />
        
        {/* Stredná fialová bublina */}
        <div className="absolute top-40 right-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-float-medium" />
        
        {/* Malá ružová bublina */}
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl animate-float-fast" />
        
        {/* Veľká zelená bublina */}
        <div className="absolute bottom-40 right-1/3 w-96 h-96 bg-green-400/15 rounded-full blur-3xl animate-float-slow-reverse" />
        
        {/* Stredná oranžová bublina */}
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-orange-400/15 rounded-full blur-3xl animate-float-medium-reverse" />
      </div>

      {/* Gradient overlay pre lepší kontrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/80" />
    </div>
  );
}
