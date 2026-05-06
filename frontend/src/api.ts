export interface Block {
  id: string;
  name: string;
  rgb: [number, number, number];
  lab: [number, number, number];
  hex: string;
}

const API_BASE = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:8016`;

export const fetchBlocks = async (): Promise<Block[]> => {
  const res = await fetch(`${API_BASE}/api/blocks`);
  if (!res.ok) throw new Error('Failed to fetch blocks');
  return res.json();
};

export const fetchGradient = async (startId: string, endId: string, steps: number = 5): Promise<Block[]> => {
  const res = await fetch(`${API_BASE}/api/gradient?start_id=${startId}&end_id=${endId}&steps=${steps}`);
  if (!res.ok) throw new Error('Failed to fetch gradient');
  return res.json();
};
