import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { base64Data, fileName } = await request.json();

    if (!base64Data) {
      return NextResponse.json(
        { error: 'Chýbajúce dáta súboru' },
        { status: 400 }
      );
    }

    // PDF.co API kľúč z environment variables
    const apiKey = process.env.PDFCO_API_KEY;

    if (!apiKey) {
      console.error('PDFCO_API_KEY nie je nastavený v .env.local');
      return NextResponse.json(
        { error: 'Chyba konfigurácie servera' },
        { status: 500 }
      );
    }

    // Krok 1: Upload súboru do PDF.co
    const uploadResponse = await fetch('https://api.pdf.co/v1/file/upload/base64', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fileName,
        file: base64Data,
      }),
    });

    const uploadResult = await uploadResponse.json();

    if (!uploadResult.url) {
      throw new Error(uploadResult.message || 'Chyba pri nahrávaní súboru');
    }

    // Krok 2: Konverzia Excel → PDF s landscape orientáciou
    const profileSettings = {
      // Zachovať pôvodné mierky tabuľky a zabrániť zmenšeniu obsahu
      FitToPage: false,
      AutoFitColumns: false,
      AutoFitRows: false,
      Scale: 100,
      PageSize: 'A4',
      Margins: {
        Top: 10,
        Bottom: 10,
        Left: 10,
        Right: 10,
      },
    };

    const convertResponse = await fetch('https://api.pdf.co/v1/xls/convert/to/pdf?portrait=false', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: uploadResult.url, // Čistá URL bez dodatočných parametrov
        name: fileName.replace(/\.(xlsx|xls|xlsm)$/i, '.pdf'),
        async: false, // Synchronous processing
        // Nastavenia pre lepší výstup
        profiles: JSON.stringify(profileSettings),
      }),
    });

    const convertResult = await convertResponse.json();

    if (!convertResult.url) {
      throw new Error(convertResult.message || 'Chyba pri konverzii');
    }

    // Krok 3: Stiahnutie PDF súboru
    const pdfResponse = await fetch(convertResult.url);
    
    if (!pdfResponse.ok) {
      throw new Error('Chyba pri sťahovaní PDF');
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    // Návrat PDF súboru
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName.replace(/\.(xlsx|xls|xlsm)$/i, '.pdf')}"`,
      },
    });

  } catch (error) {
    console.error('Chyba pri konverzii Excel na PDF:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Neznáma chyba pri konverzii',
      },
      { status: 500 }
    );
  }
}
