# PDF Tools Web

Bezplatné online nástroje na úpravu PDF súborov. Jednoduchá webová aplikácia podobná iLovePDF.

## ✨ Funkcie

- 📄 **Spojiť PDF** - Spojte viacero PDF súborov do jedného
- ✂️ **Rozdeliť PDF** - Rozdeľte PDF na samostatné stránky
- 🗜️ **Komprimovať PDF** - Znížte veľkosť súboru
- 🔄 **Konvertovať** - Konverzia obrázkov do PDF a naopak
- 🔁 **Otočiť PDF** - Otočte stránky podľa potreby

## 🛠️ Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Typová bezpečnosť
- **Tailwind CSS** - Styling
- **pdf-lib** - PDF manipulácia
- **Vercel** - Hosting a serverless functions

## 🚀 Začíname

```bash
# Inštalácia závislostí
npm install

# Spustenie dev servera
npm run dev

# Build pre produkciu
npm run build
```

Otvorte [http://localhost:3000](http://localhost:3000) vo vašom prehliadači.

## 📦 Vercel Deployment

Projekt je pripravený na automatický deployment cez Vercel:

1. Push na GitHub
2. Prepojte repository s Vercel
3. Vercel automaticky deployuje každý push

### Limity

- Maximálna veľkosť súboru: **10MB**
- Serverless functions: zadarmo do určitého limitu
- Súbory sa spracovávajú dočasne (nie sú uložené)

## 🔒 Bezpečnosť

- Žiadne súbory nie sú uložené na serveri
- Spracovanie v RAM/tmp priečinku
- Automatické mazanie po spracovaní

## 📝 License

MIT
