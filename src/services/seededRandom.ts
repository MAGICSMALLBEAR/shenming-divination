// 種子亂數 — 讓抽籤結果可以由使用者搖籤筒的操作資料決定，而非單純的系統亂數
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ShakeTelemetrySample {
  t: number; // 距離搖籤開始的毫秒數
  effort: number; // 該次取樣的施力/晃動量
}

// 把搖籤過程的操作序列雜湊成一個整數種子。
// 同一段真實手勢幾乎不可能重現，但雜湊分佈仍均勻，不影響籤詩抽選的公平性。
export function hashShakeTelemetry(samples: ShakeTelemetrySample[]): number {
  let h = 2166136261;
  for (const sample of samples) {
    h ^= Math.round(sample.t);
    h = Math.imul(h, 16777619);
    h ^= Math.round(sample.effort * 1000);
    h = Math.imul(h, 16777619);
  }
  h ^= samples.length;
  h = Math.imul(h, 16777619);
  h ^= Date.now() & 0xffff;
  return h >>> 0;
}
