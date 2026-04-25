// AI bead generation: song info + lyrics → Claude metadata → fal.ai image →
// background-removed PNG. All API keys are injected server-side by beads-server.js;
// the browser only ever talks to /proxy/* on this same origin (via Vite dev proxy).

import type { EnhancedBeadOption } from '../components/EnhancedBeadGallery';

export interface GenerateBeadInput {
  songTitle: string;
  artist: string;
  fullLyrics: { time: number; text: string }[];
  moment: { text: string; time: number; index: number };
}

export interface GeneratedBead extends EnhancedBeadOption {
  imageUrl?: string;        // raw fal output (proxied for same-origin)
  processedUrl?: string;    // after background removal
  object?: string;          // short visual description Claude returns
  mood?: string;
  era?: string;
  genre?: string;
  emotion?: string;
  aesthetic?: string;
  artistTraits?: string[];
  beadType?: 'shape' | 'object';
  imagePrompt?: string;     // kept around for debugging / regen
}

const MODEL = 'claude-sonnet-4-5';
const SHAPE_ENUM = ['circle', 'square', 'heart', 'star', 'flower', 'clover'] as const;
const MATERIAL_ENUM = ['glossy', 'matte', 'metallic', 'iridescent'] as const;
const SIZE_ENUM = ['small', 'medium', 'large'] as const;

function buildPrompt(input: GenerateBeadInput): string {
  const { songTitle, artist, fullLyrics, moment } = input;
  const totalLines = fullLyrics.length;
  const positionPct = totalLines ? Math.round((moment.index / Math.max(totalLines - 1, 1)) * 100) : 0;
  const positionWord = positionPct < 25 ? 'opening' : positionPct < 60 ? 'middle' : positionPct < 85 ? 'late' : 'outro';

  // Show 3 lines before + 3 after for local context (bounded to fit in prompt)
  const ctxStart = Math.max(0, moment.index - 3);
  const ctxEnd = Math.min(totalLines, moment.index + 4);
  const contextLines = fullLyrics.slice(ctxStart, ctxEnd).map((ln, i) => {
    const realIdx = ctxStart + i;
    const marker = realIdx === moment.index ? '→ ' : '  ';
    return `${marker}[${Math.floor(ln.time)}s] ${ln.text}`;
  }).join('\n');

  return `You are designing a single bead that captures one specific moment of a song. The bead is part of a music charm bracelet.

BEAD MATERIAL — match to song's cultural context (use this to choose what the bead is MADE OF + what to describe in imagePrompt; then pick the closest enum value for the "material" field):
Nigerian Highlife/Jùjú → bright enamel brass disc, copper lost-wax oval
Contemporary Nigerian pop (Burna Boy, Wizkid, Tems, Davido) → warm amber glass, yellow ankara ceramic
Amapiano/South African → matte speckled clay disc, brushed silver oval
Afroswing/UK Afro (J Hus, Skepta, Little Simz) → dark indigo resin sphere, matte gunmetal cube
Ghanaian Highlife → kente-patterned enamel disc, brass oval
Mbalax/Senegalese → bright indigo-gold ceramic disc
Soukous/Congolese → deep green glass sphere, copper-veined resin
East African → amber resin oval, turquoise sphere, carved bone cylinder
North African → hammered brass hexagon, turquoise faience disc
Caribbean/Haitian → deep cobalt sequin-enamel disc, iron-cross ceramic
Trinidad/Carnival → iridescent glass disc, red-gold-black striped sphere
Cuba/Afro-Cuban → cowrie-shell bead, deep mahogany sphere
Brazil/Candomblé → yellow-gold sphere (Oxum), white porcelain (Oxalá), deep blue (Yemanjá)
Harlem Renaissance → art deco jet-black resin with gold foil
Delta Blues → unglazed red clay sphere, cracked terracotta barrel
Civil Rights/Soul → polished obsidian oval, matte black-and-gold ceramic
Hip-Hop/NYC → matte rubber cube, spray-paint-texture sphere, chrome disc
Afrofuturism → iridescent holographic disc, mirror chrome sphere
Yoruba/Ifá → green-white-red glass sphere, cowrie-patterned ceramic
Gospel/Black church → deep burgundy glass sphere, pearl-white ceramic
Rastafari → carved red-gold-green striped wood barrel
Pop → glossy candy-colored sphere, holographic acrylic disc
Folk/acoustic → rough wooden oval, speckled stone cylinder
Electronic → mirror chrome sphere, neon resin cube
R&B → rose quartz sphere, dusty rose ceramic disc
Dark/indie → oxidized pewter oval, matte charcoal ceramic

OBJECT vs SHAPE:
Use OBJECT when the artist has an iconic visual symbol OR this moment's lyric carries strong specific imagery (a bird, a key, a cherry, a car).
Use SHAPE when the moment is mood/feeling-based with no strong visual.
Set the "beadType" field to either "object" or "shape" based on this choice. The "object" string field should describe what the bead actually depicts.

KNOWN ARTIST ICONS (prefer these as the bead's "object" when applicable):
Beyoncé → honey jar/crown | Jay-Z → crown/chess | Kendrick → crown of thorns/butterfly | Frank Ocean → blonde rose | SZA → butterfly | Tyler → rose | Drake → OVO owl | Erykah Badu → ankh | Janelle Monáe → android heart | Bob Marley → red-gold-green lion | Fela Kuti → saxophone | Nina Simone → piano key | Miles Davis → trumpet | Billie Holiday → gardenia | Prince → purple symbol | Michael Jackson → white glove | Stevie Wonder → harmonica | Whitney → microphone | Rihanna → umbrella | Taylor Swift → cowboy hat | Harry Styles → watermelon | Billie Eilish → spider | Lana Del Rey → cherry/moon | Phoebe Bridgers → skeleton | Charli XCX → green apple | Sabrina Carpenter → espresso cup | Chappell Roan → drag crown | Hozier → wooden cross | Bon Iver → pine tree | Tame Impala → swirling eye | Olivia Rodrigo → broken guitar pick

SONG: "${songTitle}" — ${artist}
TOTAL LYRIC LINES: ${totalLines}

LOCAL LYRIC CONTEXT (the marked → line is THIS bead's moment, line ${moment.index + 1} of ${totalLines}, ${positionWord} of song):
${contextLines}

Design rules:
- The bead must evoke this single lyric MOMENT, not the whole song. Specific imagery, color, and texture all anchor to this line + its immediate context.
- The OVERALL song's genre / era / cultural context still drives the BEAD MATERIAL choice (use the table above) — pick the material from the table row that best matches this artist's tradition, even if the moment is just a few words.
- Pick the JSON "shape" from this enum: ${SHAPE_ENUM.join(' | ')}. This is the SVG fallback shape used when the AI image fails to load. Map naturally: heart for love, star for awe, square for groove/structure, clover for luck/wish, flower for tenderness, circle as neutral default. If beadType="object", still pick the closest-matching shape from the enum.
- Pick the JSON "material" from this enum: ${MATERIAL_ENUM.join(' | ')}. This is the closest enum that matches whatever rich material you described in the imagePrompt. Map: enamel/glass/ceramic/holographic → glossy or iridescent; brass/copper/chrome/silver/gunmetal → metallic; clay/wood/stone/rubber/concrete → matte; iridescent/holographic/oil-slick → iridescent.
- Pick "size" from: ${SIZE_ENUM.join(' | ')}. Use "large" sparingly — only for genuinely climactic moments (drop, key chorus, emotional peak); "small" for soft asides / outro fade; "medium" otherwise.
- "color" must be a hex code that matches the bead's dominant tone.
- "imagePrompt": macro photo of a single bead, floating in pure white empty space. ABSOLUTELY NO shadow of any kind — no drop shadow, no cast shadow, no contact shadow, no ambient occlusion, no soft shadow under the bead, no darker patch beneath it. No finger, no hand, no surface, no table, no reflection, no pedestal, no ground plane. The bead must look like it is suspended in mid-air against a flat #ffffff white void with only soft even lighting on the bead itself. Centered. Small hole through bead for stringing. 1–2 sentences on shape, material, color, finish — pull the actual material vocabulary from the BEAD MATERIAL table row; if it's an OBJECT bead, describe the depicted object precisely. End the imagePrompt with the literal phrase: "shadowless, no cast shadow, no drop shadow, isolated on pure white background, studio cutout style".

Return ONLY raw JSON, no markdown, no commentary:
{
  "beadType": "shape|object",
  "shape": "${SHAPE_ENUM.join('|')}",
  "color": "#xxxxxx",
  "material": "${MATERIAL_ENUM.join('|')}",
  "size": "${SIZE_ENUM.join('|')}",
  "object": "5-8 word description of what the bead depicts",
  "mood": "1-3 word emotion this moment captures",
  "genre": "primary genre (1-3 words)",
  "emotion": "dominant emotion of the song overall",
  "era": "decade or scene (e.g. 'late-2010s synth-pop')",
  "aesthetic": "2-4 word visual aesthetic",
  "artistTraits": ["trait1", "trait2", "trait3"],
  "imagePrompt": "see rules above"
}`;
}

function pickFalImageUrl(d: any): string | null {
  if (!d || typeof d !== 'object') return null;
  const a = d.images;
  const first = Array.isArray(a) ? a[0] : null;
  const cand =
    (typeof first === 'string' ? first : first?.url) ||
    d.image?.url ||
    d.data?.images?.[0]?.url ||
    d.output?.images?.[0]?.url;
  const s = cand != null ? String(cand).trim() : '';
  return s || null;
}

function imageProxyUrl(remote: string): string {
  if (!remote) return remote;
  if (remote.startsWith('data:')) return remote;
  return `/proxy/image?url=${encodeURIComponent(remote)}`;
}

function clampEnum<T extends readonly string[]>(val: any, allowed: T, fallback: T[number]): T[number] {
  return (typeof val === 'string' && (allowed as readonly string[]).includes(val)) ? val as T[number] : fallback;
}

// Claude sometimes returns JSON with trailing commas, smart quotes, or
// truncates mid-object when max_tokens is hit. This parser strips fenced
// markdown, repairs the most common defects, and closes unbalanced braces
// before JSON.parse.
function repairJson(s: string): string {
  return s
    // smart quotes → straight quotes
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    // strip trailing commas before } or ]
    .replace(/,\s*([}\]])/g, '$1');
}
function parseLooseJson(raw: string): any {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const first = cleaned.indexOf('{'), last = cleaned.lastIndexOf('}');
  if (first === -1) throw new Error(`Claude returned no JSON object: ${raw.slice(0, 200)}`);
  let candidate = repairJson(cleaned.slice(first, last + 1));
  try { return JSON.parse(candidate); } catch (e) {
    // Try closing missing braces (common when max_tokens cut the response)
    const opens = (candidate.match(/\{/g) || []).length - (candidate.match(/\}/g) || []).length;
    if (opens > 0) {
      const padded = candidate + '}'.repeat(opens);
      try { return JSON.parse(padded); } catch (_) { /* fall through */ }
    }
    throw new Error(`Claude returned malformed JSON: ${(e as Error).message}\n--- raw response ---\n${raw.slice(0, 600)}`);
  }
}

async function callClaude(prompt: string): Promise<any> {
  const r = await fetch('/proxy/anthropic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`Claude ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const d = await r.json();
  const raw: string = d.content?.[0]?.text ?? '';
  return parseLooseJson(raw);
}

async function callFal(imagePrompt: string): Promise<string> {
  const r = await fetch('/proxy/fal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: imagePrompt,
      image_size: 'square_hd',
      num_inference_steps: 8,
      num_images: 1,
      enable_safety_checker: false,
    }),
  });
  if (!r.ok) throw new Error(`fal.ai ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const d = await r.json();
  const url = pickFalImageUrl(d);
  if (!url) throw new Error(`fal.ai returned no image URL: ${JSON.stringify(d).slice(0, 200)}`);
  return url;
}

// ── background removal (canvas-based, ported from beads.html) ─────────────
// Sample background color from the four 16×16 corner blocks. We take the per-corner
// mean, sort the four corners by brightness, and return the average of the middle
// two — i.e. a coordinate-wise median over corners. This is robust to a single
// corner being polluted by a bead that drifted into that corner (the polluted
// corner is an outlier and gets excluded). The previous implementation averaged
// every edge pixel, which silently mixed bead colors into the bg estimate whenever
// the bead touched an edge — that was the root cause of the half-erased bead bug.
function sampleEdgeBg(d: Uint8ClampedArray, sz: number): [number, number, number] {
  const cornerSize = 16;
  const corners: [number, number][] = [
    [0, 0],
    [sz - cornerSize, 0],
    [0, sz - cornerSize],
    [sz - cornerSize, sz - cornerSize],
  ];
  const means: [number, number, number][] = corners.map(([x0, y0]) => {
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = y0; y < y0 + cornerSize; y++) {
      for (let x = x0; x < x0 + cornerSize; x++) {
        const i = (y * sz + x) * 4;
        r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
      }
    }
    return [r / n, g / n, b / n];
  });
  means.sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]));
  const m1 = means[1], m2 = means[2];
  return [(m1[0] + m2[0]) / 2, (m1[1] + m2[1]) / 2, (m1[2] + m2[2]) / 2];
}

// Render the original image onto an opaque white canvas — used as the fallback
// when the bg-removal pipeline ate too much of the bead.
function renderOriginalOnWhite(img: HTMLImageElement, sz: number): string {
  const orig = document.createElement('canvas');
  orig.width = sz; orig.height = sz;
  const octx = orig.getContext('2d')!;
  octx.fillStyle = '#ffffff';
  octx.fillRect(0, 0, sz, sz);
  octx.drawImage(img, 0, 0, sz, sz);
  return orig.toDataURL('image/png');
}

function removeBackgroundCanvas(img: HTMLImageElement): string {
  const sz = 512;
  const c = document.createElement('canvas');
  c.width = sz; c.height = sz;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0, sz, sz);
  const data = ctx.getImageData(0, 0, sz, sz);
  const d = data.data;
  const [bgR, bgG, bgB] = sampleEdgeBg(d, sz);

  // Pre-pass: count pixels that are CLEARLY foreground (well separated from the
  // sampled bg color). We compare this against the surviving alpha pixel count
  // below — if the removal ate more than half of the clearly-foreground pixels,
  // edge sampling likely ingested bead pixels and we should bail out.
  let foregroundCount = 0;
  for (let i = 0; i < d.length; i += 4) {
    const dist = Math.sqrt((d[i] - bgR) ** 2 + (d[i + 1] - bgG) ** 2 + (d[i + 2] - bgB) ** 2);
    if (dist > 80) foregroundCount++;
  }

  for (let i = 0; i < d.length; i += 4) {
    const dist = Math.sqrt((d[i] - bgR) ** 2 + (d[i + 1] - bgG) ** 2 + (d[i + 2] - bgB) ** 2);
    if (dist < 52) d[i + 3] = Math.min(d[i + 3], Math.round(255 * Math.min(1, dist / 30)));
  }
  for (let y = Math.floor(sz * 0.55); y < sz; y++) {
    for (let x = 0; x < sz; x++) {
      const i = (y * sz + x) * 4;
      const sat = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]);
      if (d[i] > 210 && d[i + 1] > 210 && d[i + 2] > 200 && sat < 35) d[i + 3] = 0;
    }
  }
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] < 60) d[i + 3] = 0;

  // Quality check: count surviving foreground pixels. If we've nuked >50% of the
  // pixels that were clearly bead, the edge sample was contaminated — fall back
  // to the original image on a white canvas so the user at least sees a full bead.
  let keptCount = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 60) keptCount++;
  if (foregroundCount > 2000 && keptCount < foregroundCount * 0.5) {
    return renderOriginalOnWhite(img, sz);
  }

  ctx.putImageData(data, 0, 0);

  let minX = sz, minY = sz, maxX = 0, maxY = 0;
  for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++) {
    if (d[(y * sz + x) * 4 + 3] > 60) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  const cw = maxX - minX, ch = maxY - minY;
  if (cw < 10 || ch < 10) return c.toDataURL('image/png');
  const pad = Math.round(Math.max(cw, ch) * 0.08);
  const x0 = Math.max(0, minX - pad), y0 = Math.max(0, minY - pad);
  const x1 = Math.min(sz, maxX + pad), y1 = Math.min(sz, maxY + pad);

  const out = document.createElement('canvas');
  out.width = sz; out.height = sz;
  const octx = out.getContext('2d')!;
  octx.clearRect(0, 0, sz, sz);
  octx.drawImage(c, x0, y0, x1 - x0, y1 - y0, 0, 0, sz, sz);
  return out.toDataURL('image/png');
}

async function processImage(proxiedUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try { resolve(removeBackgroundCanvas(img)); }
      catch (e) { console.warn('bg removal failed; using original', e); resolve(proxiedUrl); }
    };
    img.onerror = () => { console.warn('image load failed; using original', proxiedUrl); resolve(proxiedUrl); };
    img.src = proxiedUrl;
  });
}

// ── public API ────────────────────────────────────────────────────────────
export async function generateBead(input: GenerateBeadInput): Promise<GeneratedBead> {
  const concept = await callClaude(buildPrompt(input));

  const shape    = clampEnum(concept.shape,    SHAPE_ENUM,    'circle');
  const material = clampEnum(concept.material, MATERIAL_ENUM, 'glossy');
  const size     = clampEnum(concept.size,     SIZE_ENUM,     'medium');
  const color    = (typeof concept.color === 'string' && /^#[0-9a-f]{6}$/i.test(concept.color)) ? concept.color : '#ff6b9d';

  const rawImageUrl = await callFal(concept.imagePrompt);
  const imageUrl = imageProxyUrl(rawImageUrl);
  const processedUrl = await processImage(imageUrl);

  return {
    id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'shaped',
    shape, color, material, size,
    imageUrl,
    processedUrl,
    object: concept.object,
    mood: concept.mood,
    era: concept.era,
    genre: concept.genre,
    emotion: concept.emotion,
    aesthetic: concept.aesthetic,
    artistTraits: Array.isArray(concept.artistTraits) ? concept.artistTraits.slice(0, 5) : undefined,
    beadType: concept.beadType === 'object' ? 'object' : 'shape',
    imagePrompt: concept.imagePrompt,
  };
}
