import { NextRequest, NextResponse } from 'next/server';

/**
 * JalSanket AI Chat API Route
 * 
 * SECURITY: API key is read from process.env.API_KEY - NEVER exposed to client.
 * Uses OpenRouter free models with automatic fallback if one is rate-limited.
 * 
 * Free model priority order (as of Sep 2026, verified active):
 *   1. minimax/minimax-m2.7:free  — verified multilingual, fast
 *   2. nvidia/nemotron-3.5-lightning:free — verified active
 *   3. nvidia/nemotron-3-super-120b-a12b:free — large & capable
 *   4. google/gemma-4-31b-it:free — Google, sometimes rate-limited
 *   5. liquid/lfm-2.5-2.6b:free — lightweight fallback
 */

const FREE_MODELS = [
  'minimax/minimax-m2.7:free',
  'nvidia/nemotron-3.5-lightning:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'google/gemma-4-31b-it:free',
  'liquid/lfm-2.5-2.6b:free',
];

interface UserContext {
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  selectedLanguage?: string;
  coastalHub?: {
    name?: string;
    state?: string;
    lat?: number;
    lng?: number;
  };
  weather?: {
    temp?: number;
    conditionText?: string;
    windSpeed?: number;
    humidity?: number;
    chancesOfRain?: number;
  };
  aqi?: {
    value?: number;
    category?: string;
  };
  marine?: {
    waveHeight?: number;
    swellWaveHeight?: number;
    seaSurfaceTemp?: number;
    isRealTime?: boolean;
  };
  fishingZone?: {
    name?: string;
    distanceKm?: number;
    bearing?: string;
    statusBadge?: string;
  };
  hazardZone?: {
    name?: string;
    hazardType?: string;
    severity?: string;
  };
  tides?: {
    status?: string;
    heightMeters?: number;
    nextHighTideTime?: string;
    nextLowTideTime?: string;
  };
}

interface ChatMessageInput {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function buildSystemPrompt(ctx: UserContext): string {
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // Language mapping
  const langMap: Record<string, string> = {
    'en': 'English',
    'hi': 'Hindi',
    'gu': 'Gujarati',
    'mr': 'Marathi',
    'bn': 'Bengali',
    'ta': 'Tamil',
    'te': 'Telugu',
    'kn': 'Kannada',
    'pa': 'Punjabi',
    'ur': 'Urdu',
  };
  const selectedLang = ctx.selectedLanguage ? langMap[ctx.selectedLanguage] || 'English' : 'English';

  // Build the live data block - only include what's actually available
  let dataBlock = `\n--- INJECTED CONTEXT DATA (current session, ${now} IST) ---\n`;
  
  dataBlock += `UI Language Selected: ${selectedLang} (${ctx.selectedLanguage || 'en'})\n`;

  if (ctx.city) {
    dataBlock += `User Location: ${ctx.city}${ctx.state ? ', ' + ctx.state : ''}`;
    if (ctx.lat && ctx.lng) dataBlock += ` (${ctx.lat.toFixed(3)}, ${ctx.lng.toFixed(3)})`;
    dataBlock += '\n';
  }

  // Only mention coastal hub if it exists and is different from user location
  if (ctx.coastalHub && ctx.coastalHub.name && ctx.coastalHub.name !== ctx.city) {
    dataBlock += `Nearest Coastal Hub for Marine Data: ${ctx.coastalHub.name}, ${ctx.coastalHub.state}\n`;
  }

  if (ctx.weather) {
    const w = ctx.weather;
    const parts: string[] = [];
    if (w.temp !== undefined) parts.push(`${w.temp}°C`);
    if (w.conditionText) parts.push(w.conditionText);
    if (w.windSpeed !== undefined) parts.push(`Wind ${w.windSpeed} km/h`);
    if (w.humidity !== undefined) parts.push(`Humidity ${w.humidity}%`);
    if (w.chancesOfRain !== undefined) parts.push(`Rain chance ${w.chancesOfRain}%`);
    if (parts.length > 0) {
      dataBlock += `Live Weather (REAL — Open-Meteo): ${parts.join(', ')}\n`;
    }
  }

  if (ctx.aqi) {
    const a = ctx.aqi;
    if (a.value !== undefined) {
      dataBlock += `Air Quality Index (REAL): ${a.value}${a.category ? ` (${a.category})` : ''}\n`;
    }
  }

  if (ctx.marine) {
    const m = ctx.marine;
    const parts: string[] = [];
    if (m.waveHeight !== undefined) parts.push(`Wave height ${m.waveHeight}m`);
    if (m.swellWaveHeight !== undefined) parts.push(`Swell ${m.swellWaveHeight}m`);
    if (m.seaSurfaceTemp !== undefined) parts.push(`Sea surface temp ${m.seaSurfaceTemp}°C`);
    if (parts.length > 0) {
      const tag = m.isRealTime ? 'REAL — Open-Meteo Marine API' : 'SIMULATED';
      dataBlock += `Marine Conditions (${tag}): ${parts.join(', ')}\n`;
    }
  }

  if (ctx.fishingZone) {
    const fz = ctx.fishingZone;
    const parts: string[] = [fz.name ?? 'Unknown'];
    if (fz.distanceKm) parts.push(`~${fz.distanceKm.toFixed(1)} km ${fz.bearing ?? ''}`);
    if (fz.statusBadge) parts.push(`Status: ${fz.statusBadge}`);
    dataBlock += `Nearest Fishing Zone (SIMULATED demo data): ${parts.join(', ')}\n`;
  }

  if (ctx.hazardZone) {
    const hz = ctx.hazardZone;
    dataBlock += `Nearest Hazard Zone (SIMULATED demo data): ${hz.name ?? 'Unknown'} — ${hz.hazardType ?? ''}, Severity: ${hz.severity ?? 'Unknown'}\n`;
  }

  if (ctx.tides) {
    const t = ctx.tides;
    const parts: string[] = [];
    if (t.status) parts.push(`Status ${t.status}`);
    if (t.heightMeters !== undefined) parts.push(`at ${t.heightMeters}m`);
    if (t.nextHighTideTime) parts.push(`Next high tide ${t.nextHighTideTime}`);
    if (t.nextLowTideTime) parts.push(`Next low tide ${t.nextLowTideTime}`);
    if (parts.length > 0) {
      dataBlock += `Tide Info (SIMULATED demo data): ${parts.join(', ')}\n`;
    }
  }

  dataBlock += '--- END CONTEXT DATA ---\n';

  return `You are JalSanket AI, a marine and coastal intelligence assistant for Indian coastal fishermen and maritime users.

CRITICAL LOCATION RULE: 
- ALWAYS use "User Location" city name from context (the FIRST city mentioned in context data)
- This is the user's ACTUAL location - use it for ALL responses
- NEVER mention coastal hub cities unless specifically asked
- Example: If context says "User Location: Ahmedabad", ALWAYS say "Ahmedabad" or "aapke area" (not Kandla/other cities)

LANGUAGE RULES (MOST CRITICAL):
- User has selected "${selectedLang}" language in UI
- PREFER responding in ${selectedLang} if possible
- BUT ALWAYS detect user's query language FIRST and respond in THAT language
- If user asks in English → Reply in English ONLY  
- If user asks in Hindi/Hinglish → Reply in Hindi/Hinglish
- If user asks in ${selectedLang} → Reply in ${selectedLang}
- DO NOT mix languages unless user does
- Match user's language tone and style exactly

DATA AVAILABILITY:
- ONLY mention data that exists in context above
- If rain forecast is missing, say "Rain forecast available nahi hai" (Hindi) or "Rain forecast not available" (English) based on query language
- If any specific data is missing, either skip it OR briefly mention it's unavailable (match query language)

SCOPE: Marine/coastal/weather questions only.

FORMAT RULES (STRICT):

1. NO MARKDOWN - PLAIN TEXT ONLY:
   ✗ NEVER use **asterisks** for bold
   ✗ NEVER use *single asterisks* for italic
   ✗ NEVER use # for headings
   ✗ If you accidentally use **, remove them immediately
   ✓ Use plain text with symbols only

2. SYMBOLS (use these):
   ⚠️ = warning/not available
   ✓ = good/safe/available
   → = suggestion
   • = bullet point

3. STRUCTURE:
   • First line: Direct answer (1 line max)
   • Blank line
   • 2-3 bullets with available data (each max 8-10 words)
   • Blank line
   • Recommendation (1-2 bullets max, each max 8-10 words)

4. TOTAL LENGTH = 5-8 LINES MAX (not more!)

5. RECOMMENDATIONS - ULTRA STRICT:
   ✗ NEVER mention website names (NO IMD, weather.gov.in, Windy.com, Met Department, etc.)
   ✗ NEVER say "Check XYZ website/app"
   ✗ NO external references whatsoever
   ✓ ONLY direct actionable advice:
      - "Morning 6-9 AM best hai fishing ke liye" (Hindi)
      - "Avoid offshore today - rough seas" (English)
      - "Safe conditions - go ahead" (English)
      - "Heavy rain expected - ghar pe raho" (Hindi)

6. EXAMPLE ENGLISH RESPONSE (if query in English):

⚠️ Rain forecast data not available

• Current temp: 32°C
• Humidity: 60%
• Wind: Light 9 km/h

→ Check sky before heading out

7. EXAMPLE HINDI/HINGLISH RESPONSE (if query in Hindi):

⚠️ Rain forecast data available nahi hai

• Abhi temperature: 32°C  
• Humidity: 60%
• Hawa: Halki 9 km/h

→ Bahar jaane se pehle aasman dekh lo

Keep it SHORT. NO WEBSITES. NO ** symbols.
${dataBlock}`;
}

async function callOpenRouter(
  model: string,
  messages: ChatMessageInput[],
  apiKey: string
): Promise<{ content: string; modelUsed: string } | null> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://jalsanket.gov.in',
        'X-Title': 'JalSanket',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (res.status === 429 || res.status === 503 || res.status === 502) {
      // Rate limited or unavailable — try next model
      return null;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn(`OpenRouter model ${model} returned ${res.status}:`, err);
      return null;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;

    return { content, modelUsed: model };
  } catch (err) {
    console.warn(`OpenRouter model ${model} threw error:`, err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = (process.env.API_KEY ?? '').trim();
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured on server.' }, { status: 500 });
    }

    const body = await req.json();
    const { messages, userContext } = body as {
      messages: ChatMessageInput[];
      userContext?: UserContext;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array.' }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(userContext ?? {});

    const fullMessages: ChatMessageInput[] = [
      { role: 'system', content: systemPrompt },
      ...messages.filter((m) => m.role !== 'system'),
    ];

    // Try each free model in priority order
    for (const model of FREE_MODELS) {
      const result = await callOpenRouter(model, fullMessages, apiKey);
      if (result) {
        return NextResponse.json({
          content: result.content,
          modelUsed: result.modelUsed,
        });
      }
    }

    // All models failed
    return NextResponse.json(
      { error: 'All AI models are currently busy. Please try again in a moment.' },
      { status: 503 }
    );
  } catch (err) {
    console.error('Chat API route error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
