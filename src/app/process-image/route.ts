import { NextRequest, NextResponse } from 'next/server';

interface PlantData {
  common_name?: string;
  scientific_name?: string;
  trivia?: string[];
  health_status?: string;
  care_instructions?: string[];
}

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

    const prompt = "Analyze this plant image and provide details including its common name, scientific name, trivia, health status, and care instructions, do mention if plant is healthy or not. if the image is not related to plan, reply by sayin not a valid plant image. also return the response in json format and dont include json in the response. Remove any asterisk from response data";
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

    // Extract the inner JSON string
    let jsonString = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    jsonString = jsonString.replace(/```json\n/g, '').replace(/```/g, ''); // Remove code block markdown

    console.log("Extracted JSON:", jsonString);
    // Parse the inner JSON string
    let plantData: PlantData = {};

    try {
      // Check if jsonString is defined and not null before parsing
      if (jsonString) {
        plantData = JSON.parse(jsonString.trim()); // Parse inner JSON
      } else {
        console.warn("jsonString is undefined or null. Check Gemini API response.");
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return NextResponse.json({ error: "Failed to parse Gemini API response" }, { status: 500 });
    }

    // Remove asterisks from string data
    if (plantData.common_name) plantData.common_name = plantData.common_name.replace(/\*/g, '').trim();
    if (plantData.scientific_name) plantData.scientific_name = plantData.scientific_name.replace(/\*/g, '').trim();
    if (plantData.health_status) plantData.health_status = plantData.health_status.replace(/\*/g, '').trim();

    return NextResponse.json(plantData, { status: 200 });
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(e.message || "Failed to parse response from server.");
    } else {
      console.error("Failed to parse Gemini response");
    }
    return NextResponse.json({
      common_name: "Error parsing details.",
      scientific_name: "Not found",
      trivia: "Not found",
      health_status: "Not found",
      care_instructions: "Not found"
    }, { status: 200 });
  }
} 
