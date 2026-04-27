export default async function handler(req, res) {
  const { bbox } = req.query;
  if (!bbox) return res.status(400).json({ error: "Missing bbox parameter" });

  const query = `[out:json][timeout:30];(way["highway"~"^(motorway|trunk|primary|secondary)$"](${bbox}););out geom;`;

  const r = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: "data=" + encodeURIComponent(query),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const data = await r.json();
  res.setHeader("Cache-Control", "s-maxage=3600");
  res.json(data);
}
