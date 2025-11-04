#!/bin/bash

# Aktualizácia Compress page
sed -i '' "s|'use client';|'use client';\n\nimport AnimatedBackground from '@/components/AnimatedBackground';|" app/compress/page.tsx
sed -i '' "s|bg-gradient-to-b from-blue-50 to-white|relative overflow-hidden|" app/compress/page.tsx
sed -i '' "s|<main className=\"min-h-screen relative overflow-hidden\">|<main className=\"min-h-screen relative overflow-hidden\">\n      <AnimatedBackground />\n      |" app/compress/page.tsx
sed -i '' "s|container mx-auto px-4 py-16\">|container mx-auto px-4 py-16 relative z-10\">|" app/compress/page.tsx
sed -i '' "s|bg-white rounded-lg shadow-lg|bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20|g" app/compress/page.tsx
sed -i '' "s|bg-purple-50 rounded-lg|bg-purple-50/80 backdrop-blur-sm rounded-2xl border border-purple-100/50|" app/compress/page.tsx
sed -i '' "s|bg-purple-600|bg-gradient-to-r from-purple-500 to-purple-600|" app/compress/page.tsx
sed -i '' "s|hover:bg-purple-700|hover:from-purple-600 hover:to-purple-700|" app/compress/page.tsx
sed -i '' "s|disabled:bg-gray-300|disabled:from-gray-300 disabled:to-gray-300|" app/compress/page.tsx
sed -i '' "s|rounded-lg font-semibold|rounded-xl font-semibold shadow-lg hover:shadow-xl|" app/compress/page.tsx

echo "Compress page updated"
