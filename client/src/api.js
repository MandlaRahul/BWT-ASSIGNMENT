import { useState, useEffect, useCallback } from 'react';
const BASE = import.meta.env.VITE_API_URL || '/api';

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export function useFetch(path) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true); setErr('');
    return api(path).then(setData).catch(e => setErr(e.message)).finally(() => setLoading(false));
  }, [path]);
  useEffect(() => { load(); }, [load]);
  return { data, err, loading, reload: load };
}
