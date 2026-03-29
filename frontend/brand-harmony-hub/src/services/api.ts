const API_BASE = 'http://localhost:8000/api/v1';

const FALLBACK_BRANDS = [
  { brand_id: 'tech_company', brand_name: 'TechVision AI', tone: 'Professional', samples: 0, consistency_score: 0, top_keywords: [] },
  { brand_id: 'creative_agency', brand_name: 'Spark Creative', tone: 'Casual', samples: 0, consistency_score: 0, top_keywords: [] },
  { brand_id: 'corporate_firm', brand_name: 'Meridian Corp', tone: 'Formal', samples: 0, consistency_score: 0, top_keywords: [] },
];

async function fetchWithFallback<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    if (fallback !== undefined) return fallback;
    throw new Error('API unavailable');
  }
}

export async function getHealth() {
  return fetchWithFallback<{ status: string; available_brands: string[]; ollama_status?: string }>(
    '/health', undefined, { status: 'offline', available_brands: [], ollama_status: 'unknown' }
  );
}

export async function getBrands() {
  const data = await fetchWithFallback<{ brands: typeof FALLBACK_BRANDS }>('/brands', undefined, { brands: FALLBACK_BRANDS });
  return data.brands;
}

export async function analyzeBrand(files: File[], brandName?: string) {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));
  if (brandName) formData.append('brand_name', brandName);
  const res = await fetch(`${API_BASE}/analyze-brand`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Analysis failed');
  return res.json();
}

export async function analyzeBrandFromText(content: string, brandName?: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const file = new File([blob], 'brand-content.txt', { type: 'text/plain' });
  return analyzeBrand([file], brandName || 'Uploaded Brand');
}

export async function generateContent(params: { brand_id: string; topic: string; platform: string; tone_slider: number }) {
  const res = await fetch(`${API_BASE}/generate-high-score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Generation failed: HTTP ${res.status}`);
  return res.json();
}

export async function checkConsistency(params: { content: string; brand_id: string; platform: string }) {
  const res = await fetch(`${API_BASE}/check-consistency`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Consistency check failed: HTTP ${res.status}`);
  return res.json();
}

export async function getBrandDashboard(brandId: string) {
  const res = await fetch(`${API_BASE}/brand-dashboard/${brandId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Dashboard fetch failed: HTTP ${res.status}`);
  return res.json();
}

export async function getBrandDrift(brandId: string) {
  return fetchWithFallback<{ drift_detected: boolean; drift_score: number; alert_level: string; recommendations: string[] }>(
    `/brand-drift-alert/${brandId}`,
    undefined,
    { drift_detected: false, drift_score: 0, alert_level: 'low', recommendations: [] }
  );
}

export async function multiPlatformAdapt(params: { content: string; brand_id: string; platforms?: string[] }) {
  const res = await fetch(`${API_BASE}/multi-platform-adapt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Platform adaptation failed: HTTP ${res.status}`);
  return res.json();
}
