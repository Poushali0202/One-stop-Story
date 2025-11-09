import Constants from 'expo-constants';
const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || (Constants.expoConfig?.extra?.apiBaseUrl) || 'http://127.0.0.1:8787';
export async function api(path, opts={}) {
  const url = `${baseURL}${path}`;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) }, ...opts });
  if (!res.ok) { const t = await res.text(); throw new Error(`API ${res.status}: ${t}`); }
  const ct = res.headers.get('content-type')||'';
  if (ct.includes('application/json')) return await res.json();
  return await res.text();
}
export async function upload(path, formData, timeoutMs = 60000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const res = await fetch(`${baseURL}${path}`, {
    method: "POST",
    body: formData,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`API ${res.status}: ${t}`);
  }
  return res.json();
}

