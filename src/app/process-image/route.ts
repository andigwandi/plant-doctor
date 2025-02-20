import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Convert Uint8Array to Base64
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const imageBase64 = btoa(binary);

    const prompt = "Analyze this plant image and provide details including its common name, scientific name, trivia, health status, and care instructions if it's not healthy. if the image is not related to plan, reply by sayin not a valid plant image.";
    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: file.type, // Use the correct MIME type of the image
              data: imageBase64,
            },
          },
        ],
      }],
    };

    const END_POINT = process.env.GEMINI_API_ENDPOINT;
    if (!END_POINT) {
      throw new Error('Missing Gemini API endpoint');
    }
    const response = await fetch(END_POINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gemini API Error:", response.status, response.statusText, errorBody);
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    try {
      // PARSING STARTS HERE
      const plantInfo: { [key: string]: string } = {};
      const lines = responseText.split('\n');

      for (let line of lines) {
        if (line.includes('*')) {
          line = line.replace('*', '');
        }
        if (line.includes(':')) {
          const [key, value] = line.split(':').map((s: string) => s.trim());

          plantInfo[key] = value;
        }
      }

      return NextResponse.json(plantInfo, { status: 200 });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e.message || "Failed to parse response from server.");
      } else {
        console.error("Failed to parse Gemini response:", responseText);
      }
      return NextResponse.json({
        common_name: "Error parsing details.",
        scientific_name: "Not found",
        trivia: "Not found",
        health_status: "Not found",
        care_instructions: "Not found"
      }, { status: 200 });
    }
  } catch (error: unknown) {
    console.error('Error processing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    interface CustomError extends Error {
      status?: number;
    }

    const status = error instanceof Error && 'status' in error ? (error as CustomError).status : 500;
    return NextResponse.json({ error: errorMessage }, { status });
  }
}
