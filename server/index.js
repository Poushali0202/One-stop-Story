import express from "express";
const app = express();

const PORT = process.env.PORT || 8787;
const HOST = process.env.HOST || "0.0.0.0";

app.get("/healthz", (_req, res) => res.send("ok"));
// …your routes…

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
