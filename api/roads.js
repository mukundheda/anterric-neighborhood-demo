module.exports = async (req, res) => {
  const { bbox } = req.query;
  if (!bbox) return res.status(400).json({ error: "Missing bbox parameter" });

  try {
    const query = '[out:json][timeout:25];(way["highway"~"^(motorway|trunk|primary|secondary)$"](' + bbox + '););out geom;';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const r = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: "data=" + encodeURIComponent(query),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: "Overpass returned " + r.status, detail: text.substring(0, 200) });
    }

    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=3600");
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
};
