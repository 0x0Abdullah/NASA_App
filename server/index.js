import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, writeFile } from "node:fs/promises";
import { stories, timeline, stats, gallery } from "./data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// ---- API routes ----
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "nasa-abandoned-not-forgotten", time: new Date().toISOString() });
});

app.get("/api/stories", (req, res) => {
  const { destination } = req.query;
  if (!destination) return res.json(stories);
  const filtered = stories.filter(
    (s) => s.destination.toLowerCase() === String(destination).toLowerCase()
  );
  res.json(filtered);
});

app.get("/api/stories/:id", (req, res) => {
  const story = stories.find((s) => s.id === req.params.id);
  if (!story) return res.status(404).json({ error: `Story '${req.params.id}' not found` });
  res.json(story);
});

app.get("/api/timeline", (_req, res) => res.json(timeline));
app.get("/api/stats", (_req, res) => res.json(stats));
app.get("/api/gallery", (_req, res) => res.json(gallery));

// ---- newsletter (footer) ----
const subscribersFile = path.join(__dirname, "subscribers.json");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

app.post("/api/subscribe", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  try {
    const raw = await readFile(subscribersFile, "utf8").catch(() => "[]");
    const list = JSON.parse(raw);
    if (list.some((s) => s.email === email)) {
      return res.json({ ok: true, message: "You're already on the list — see you at the next transmission." });
    }
    list.push({ email, at: new Date().toISOString() });
    await writeFile(subscribersFile, JSON.stringify(list, null, 2));
    res.json({ ok: true, message: "You're on the list. New stories will find you." });
  } catch (err) {
    console.error("subscribe failed:", err.message);
    res.status(500).json({ error: "Could not save your subscription — try again later." });
  }
});

// ---- Serve built client in production ----
const dist = path.join(__dirname, "..", "client", "dist");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(dist));
  app.get(/.*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.listen(PORT, () => {
  console.log(`✦ NASA stories API running on http://localhost:${PORT}`);
  console.log(`  → Try: http://localhost:${PORT}/api/stories?destination=moon`);
});
