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

    // CloudConvert API kľúč z environment variables
    const apiKey = process.env.CLOUDCONVERT_API_KEY;

    if (!apiKey) {
      console.error('CLOUDCONVERT_API_KEY nie je nastavený v .env.local');
      return NextResponse.json(
        { error: 'Chyba konfigurácie servera' },
        { status: 500 }
      );
    }

    // Zistenie vstupného formátu
    const inputFormat = fileName.match(/\.(xlsx|xls|xlsm)$/i)?.[1].toLowerCase() || 'xlsx';

    // Krok 1: Vytvorenie jobu s taskmi (import, convert, export)
    const createJobResponse = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks: {
          'import-my-file': {
            operation: 'import/upload'
          },
          'convert-my-file': {
            operation: 'convert',
            input: 'import-my-file',
            output_format: 'pdf',
            input_format: inputFormat,
            // Nastavenia pre lepšiu kvalitu výstupu
            engine: 'office',
            engine_version: 'latest',
            page_orientation: 'landscape',
            fit_to_page_width: true,
          },
          'export-my-file': {
            operation: 'export/url',
            input: 'convert-my-file'
          }
        }
      }),
    });

    if (!createJobResponse.ok) {
      const errorData = await createJobResponse.json();
      throw new Error(errorData.message || 'Chyba pri vytváraní konverznej úlohy');
    }

    const jobData = await createJobResponse.json();
    const uploadTask = jobData.data.tasks.find((task: any) => task.name === 'import-my-file');

    if (!uploadTask || !uploadTask.result?.form) {
      throw new Error('Nepodarilo sa získať upload URL');
    }

    // Krok 2: Upload súboru
    const formData = new FormData();

    // Pridanie všetkých potrebných polí z upload form
    Object.entries(uploadTask.result.form.parameters).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    // Konverzia base64 na blob a pridanie súboru
    const binaryData = Buffer.from(base64Data, 'base64');
    const blob = new Blob([binaryData]);
    formData.append('file', blob, fileName);

    const uploadResponse = await fetch(uploadTask.result.form.url, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Chyba pri nahrávaní súboru');
    }

    // Krok 3: Čakanie na dokončenie jobu (polling)
    let jobCompleted = false;
    let attempts = 0;
    const maxAttempts = 60; // Max 60 sekúnd (60 x 1 sekunda)
    let finalJobData;

    while (!jobCompleted && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Čakanie 1 sekundu

      const statusResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobData.data.id}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!statusResponse.ok) {
        throw new Error('Chyba pri kontrole stavu konverzie');
      }

      finalJobData = await statusResponse.json();
      const status = finalJobData.data.status;

      if (status === 'finished') {
        jobCompleted = true;
      } else if (status === 'error') {
        throw new Error('Konverzia zlyhala');
      }

      attempts++;
    }

    if (!jobCompleted) {
      throw new Error('Časový limit konverzie vypršal');
    }

    // Krok 4: Získanie URL exportovaného súboru
    const exportTask = finalJobData.data.tasks.find((task: any) => task.name === 'export-my-file');

    if (!exportTask || !exportTask.result?.files?.[0]?.url) {
      throw new Error('Nepodarilo sa získať URL konvertovaného súboru');
    }

    const pdfUrl = exportTask.result.files[0].url;

    // Krok 5: Stiahnutie PDF súboru
    const pdfResponse = await fetch(pdfUrl);

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
