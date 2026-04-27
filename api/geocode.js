export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing q parameter" });

  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q, format: "json", limit: "1", countrycodes: "us",
  })}`;

  const r = await fetch(url, {
    headers: { "User-Agent": "AugmentLoop-Demo/1.0" },
  });
  const data = await r.json();
  res.setHeader("Cache-Control", "s-maxage=86400");
  res.json(data);
}
