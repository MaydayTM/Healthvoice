import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

interface RequestBody {
  transcript: string;
  clarification?: {
    field: string;
    answer: string;
  };
}

interface ExtractedItem {
  category: "voeding" | "supplement" | "beweging" | "slaap" | "welzijn" | "overig";
  subcategory: string | null;
  content: Record<string, unknown>;
  confidence: number;
  original_text: string;
}

interface ExtractionResult {
  items: ExtractedItem[];
  needs_clarification: {
    field: string;
    question: string;
  } | null;
}

const SYSTEM_PROMPT = `Je bent een health log parser voor de HealthVoice app. Je taak is om gestructureerde data te extraheren uit natuurlijke spraak in het Nederlands.

CATEGORIEËN:
- voeding: eten, drinken, maaltijden (ontbijt, lunch, diner, snacks)
- supplement: vitamines, mineralen, supplementen, medicatie
- beweging: sport, training, wandelen, fietsen, fysieke activiteit
- slaap: slaapkwaliteit, duur, rust, dutjes
- welzijn: energie niveau, stemming/mood, stress, symptomen, gevoelens
- overig: alles wat niet in bovenstaande categorieën past

CONTENT STRUCTUUR PER CATEGORIE:

voeding:
{
  "items": ["string array van gegeten items"],
  "meal_type": "ontbijt" | "lunch" | "diner" | "snack" | "drank" | null,
  "quantity": "string beschrijving van hoeveelheid" | null,
  "calories": number | null
}

supplement:
{
  "name": "naam van supplement",
  "dosage": "string dosering" | null,
  "unit": "mg" | "mcg" | "IU" | "ml" | "stuks" | null,
  "quantity": number | null
}

beweging:
{
  "activity": "naam van activiteit",
  "duration_minutes": number | null,
  "intensity": "licht" | "matig" | "intens" | null,
  "distance_km": number | null
}

slaap:
{
  "duration_hours": number | null,
  "quality": "slecht" | "matig" | "goed" | "uitstekend" | null,
  "notes": "string" | null
}

welzijn:
{
  "type": "energie" | "mood" | "stress" | "symptoom" | "algemeen",
  "level": number (1-10) | null,
  "description": "string beschrijving"
}

overig:
{
  "description": "string beschrijving"
}

OUTPUT FORMAT (JSON):
{
  "items": [
    {
      "category": "een van de 6 categorieën",
      "subcategory": "string of null voor meer specifieke indeling",
      "content": { category-specifieke velden zoals hierboven },
      "confidence": 0.0-1.0,
      "original_text": "relevant deel van de input"
    }
  ],
  "needs_clarification": null | {
    "field": "welk veld onduidelijk is",
    "question": "vraag om aan gebruiker te stellen"
  }
}

BELANGRIJKE REGELS:
1. Extraheer ALLE items uit de input - één zin kan meerdere logs bevatten
2. Geef een confidence score per item (0.0-1.0):
   - 0.9-1.0: Heel duidelijk, alle details aanwezig
   - 0.7-0.9: Redelijk duidelijk, sommige aannames
   - 0.5-0.7: Onduidelijk, vraag mogelijk om verduidelijking
   - <0.5: Erg onduidelijk, vraag om verduidelijking
3. Vraag ALLEEN om verduidelijking als echt nodig (confidence < 0.7)
4. Neem NOOIT dosering aan als niet genoemd
5. Interpreteer NIET, extraheer alleen feiten
6. Wees genereus met categorisatie - bij twijfel kies de meest logische categorie
7. Tijdsaanduidingen zoals "vanmorgen" of "net" zijn informatief maar hoeven niet geëxtraheerd
8. Return ALTIJD valide JSON`;

async function callClaude(transcript: string, clarification?: { field: string; answer: string }): Promise<ExtractionResult> {
  let userMessage = transcript;

  if (clarification) {
    userMessage = `Originele input: "${transcript}"

De gebruiker heeft de volgende verduidelijking gegeven:
Veld: ${clarification.field}
Antwoord: ${clarification.answer}

Verwerk de input opnieuw met deze extra informatie.`;
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Claude API error:", error);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.content[0].text;

  // Parse the JSON response
  try {
    // Find JSON in the response (it might be wrapped in markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]) as ExtractionResult;

    // Validate structure
    if (!Array.isArray(parsed.items)) {
      parsed.items = [];
    }

    return parsed;
  } catch (parseError) {
    console.error("Error parsing Claude response:", parseError);
    console.error("Raw response:", content);

    // Return a fallback response
    return {
      items: [
        {
          category: "overig",
          subcategory: null,
          content: { description: transcript },
          confidence: 0.3,
          original_text: transcript,
        },
      ],
      needs_clarification: null,
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body: RequestBody = await req.json();

    if (!body.transcript || body.transcript.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Transcript is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const startTime = Date.now();
    const result = await callClaude(body.transcript, body.clarification);
    const processingTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        ...result,
        processing_time_ms: processingTime,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
