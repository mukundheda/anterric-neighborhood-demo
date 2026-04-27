module.exports = async (req, res) => {
  const { bbox } = req.query;
  if (!bbox) return res.status(400).json({ error: "Missing bbox parameter" });

  const query = '[out:json][timeout:25];(way["highway"~"^(motorway|trunk|primary|secondary)$"](' + bbox + '););out geom;';
  const body = "data=" + encodeURIComponent(query);
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "AugmentLoop-Demo/1.0 (neighborhood boundary tool)",
  };

  // Try primary, fall back to mirror
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const r = await fetch(url, {
        method: "POST",
        body: body,
        headers: headers,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (r.ok) {
        const data = await r.json();
        res.setHeader("Cache-Control", "s-maxage=3600");
        return res.json(data);
      }
    } catch (err) {
      // Try next endpoint
    }
  }

  return res.status(502).json({ error: "All Overpass endpoints failed" });
};
