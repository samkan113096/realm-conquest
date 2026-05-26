/**
 * Chain Loot server — landing site + signer API
 * Port 3001: HTML site at /, API at /api/*
 */

const express = require("express");
const path = require("path");
const { ethers } = require("ethers");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.SIGNER_PORT || 3001;
const SITE_DIR = path.join(__dirname, "..", "site");
const PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY
  || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const wallet = new ethers.Wallet(PRIVATE_KEY);
const MIN_SCORES = { 0: 100, 1: 500, 2: 1000 };

// ── API routes (JSON) ──
app.get("/api/health", (_, res) => {
  res.json({
    ok: true,
    signer: wallet.address,
    service: "Chain Loot",
    game: "Zombie Siege",
    dapp: "http://localhost:5173",
  });
});

app.post("/api/sign-claim", async (req, res) => {
  try {
    const { player, gameId, score, nonce } = req.body;
    if (!player || gameId === undefined || !score) {
      return res.status(400).json({ error: "Missing player, gameId, or score" });
    }
    const minScore = MIN_SCORES[gameId] ?? 100;
    if (score < minScore) {
      return res.status(400).json({ error: `Minimum score ${minScore} required` });
    }
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const claimNonce = nonce ?? Date.now();
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "uint8", "uint256", "uint256", "uint256"],
      [player, gameId, score, claimNonce, deadline]
    );
    const hash = ethers.keccak256(encoded);
    const signature = await wallet.signMessage(ethers.getBytes(hash));
    res.json({ player, gameId, score, nonce: claimNonce, deadline, signature, signer: wallet.address });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy API paths (dApp compatibility)
app.get("/health", (_, res) => {
  res.sendFile(path.join(SITE_DIR, "health.html"));
});

app.post("/sign-claim", async (req, res) => {
  req.url = "/api/sign-claim";
  req.baseUrl = "";
  return app._router.handle(req, res, () => {});
});

// ── HTML pages ──
app.get("/health.html", (_, res) => res.sendFile(path.join(SITE_DIR, "health.html")));

app.get(["/blog", "/blog/"], (_, res) => {
  res.sendFile(path.join(SITE_DIR, "blog", "index.html"));
});

// Static site
app.use(express.static(SITE_DIR, { index: "index.html", extensions: ["html"] }));

app.listen(PORT, () => {
  console.log(`Chain Loot site + API → http://localhost:${PORT}`);
  console.log(`  Landing page:  http://localhost:${PORT}/`);
  console.log(`  Status page:   http://localhost:${PORT}/health`);
  console.log(`  dApp:          http://localhost:5173`);
  console.log(`  Signer:        ${wallet.address}`);
});
