const express = require("express");
const router = express.Router();
const { SDK, SchemaEncoder, zeroBytes32 } = require("@somnia-chain/streams");
const { createPublicClient, createWalletClient, http, toHex } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { waitForTransactionReceipt } = require("viem/actions");
const { dreamChain } = require("../dream-chain");
const { analyzePlayerPerformance } = require("../agent");
require("dotenv").config();

// Create SDK clients
const publicClient = createPublicClient({
  chain: dreamChain,
  transport: http(),
});

const walletClient = createWalletClient({
  account: privateKeyToAccount(process.env.PRIVATE_KEY),
  chain: dreamChain,
  transport: http(),
});

const sdk = new SDK({ public: publicClient, wallet: walletClient });

const playerSchema = `address player, uint256 score`;
const encoder = new SchemaEncoder(playerSchema);

let schemaId;

(async () => {
  schemaId = await sdk.streams.computeSchemaId(playerSchema);
  console.log("📘 Schema ID:", schemaId);

  try {
    const txHash = await sdk.streams.registerDataSchemas(
      [
        {
          id: "player_score_only",
          schema: playerSchema,
          parentSchemaId: zeroBytes32,
        },
      ],
      true
    );

    if (txHash) {
      await waitForTransactionReceipt(publicClient, { hash: txHash });
      console.log(`✅ Schema registered: ${txHash}`);
    } else {
      console.log("ℹ️ Schema already registered — no action required.");
    }
  } catch (err) {
    console.warn("⚠️ Schema may already exist:", err.message);
  }
})();

router.get("/schema", (req, res) => {
  res.json({ schemaId });
});

router.post("/publish", async (req, res) => {
  try {
    const { player, score } = req.body;

    if (!player || score == null) {
      return res.status(400).json({ error: "Missing player or score" });
    }

    const data = encoder.encodeData([
      { name: "player", value: player, type: "address" },
      { name: "score", value: BigInt(score), type: "uint256" },
    ]);

    const dataStreams = [
      { id: toHex(`player-${Date.now()}`, { size: 32 }), schemaId, data },
    ];

    const tx = await sdk.streams.set(dataStreams);

    console.log(`✅ Published: ${player} | Score ${score} | Tx ${tx}`);

    res.json({ success: true, txHash: tx });
  } catch (err) {
    console.error("❌ Publish error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/data", async (req, res) => {
  try {
    const publisher = process.env.PUBLISHER_WALLET;
    const allData = await sdk.streams.getAllPublisherDataForSchema(
      schemaId,
      publisher
    );

    const formatted = allData.map((item) => {
      let player = "",
        score = 0;
      for (const field of item) {
        const val = field.value?.value ?? field.value;
        if (field.name === "player") player = val;
        if (field.name === "score") score = Number(val);
      }
      return { player, score };
    });

    // 🔴 Lấy ví người gọi từ query (?wallet=0x...)
    const callerWallet = req.query.wallet;
    if (!callerWallet) {
      return res
        .status(400)
        .json({ error: "Missing wallet address in query (?wallet=...)" });
    }

    // 🔴 Gọi AI agent để phân tích toàn bộ + cá nhân
    const aiSummary = await analyzePlayerPerformance(callerWallet, formatted);

    // 🔴 Trả về toàn bộ data + tóm tắt phân tích từ AI
    res.json({
      totalEntries: formatted.length,
      data: formatted,
      aiSummary,
    });
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
