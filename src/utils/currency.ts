const API_KEY = "6dfc5c1f56057fb5bebe5749";
const CACHE_DURATION = 12 * 60 * 60 * 1000;

export async function fetchExchangeRate(
  base: "PHP",
  target: "USD" | "PHP"
): Promise<number> {
  if (base === target) return 1;

  const cacheKey = `exchangeRate-${base}-${target}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { rate, timestamp } = JSON.parse(cached);
      const isFresh = Date.now() - timestamp < CACHE_DURATION;
      if (isFresh && typeof rate === "number") {
        return rate;
      }
    } catch {
      localStorage.removeItem(cacheKey); // corrupted cache
    }
  }

  const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${base}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || !data.conversion_rates?.[target]) {
    throw new Error("Failed to fetch exchange rate.");
  }

  const rate = data.conversion_rates[target];
  localStorage.setItem(
    cacheKey,
    JSON.stringify({ rate, timestamp: Date.now() })
  );

  return rate;
}
