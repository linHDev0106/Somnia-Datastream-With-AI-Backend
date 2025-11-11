# 🧠 Somnia Datastream with AI Backend

This backend project connects **Somnia Data Stream** with **OpenAI GPT-4.1-mini**, allowing you to record player data (wallet address + score) in real time and automatically analyze performance with artificial intelligence.

---

## 🚀 Overview

Somnia Data Stream provides a transparent and verifiable on-chain data storage system.  
This backend is used to:

1. Record player wallet addresses and scores on-chain.  
2. Retrieve all data from the Publisher.  
3. Send the data to an AI Agent for both global and per-player analysis.

The AI Agent acts as a **virtual coach**, evaluating progress trends and providing motivational feedback.

---

## 🧩 Tech Stack

- **Node.js + Express.js**  
- **Somnia Data Streams SDK (`@somnia-chain/streams`)**  
- **Viem** (blockchain client)  
- **OpenAI GPT-4.1-mini**  
- **dotenv** (environment variable management)

---

## 📁 Project Structure

```
📦 Somnia-Datastream-with-AI-Backend
 ┣ 📂 routes
 ┃ ┗ 📜 streams.js     ← Main routes (schema, publish, data)
 ┣ 📜 agent.js          ← AI data analysis logic
 ┣ 📜 dream-chain.js    ← Somnia Dream Chain configuration
 ┣ 📜 Server.js         ← Express server entry point
 ┣ 📜 .env              ← Environment variables (excluded from Git)
 ┣ 📜 .gitignore
 ┣ 📜 package.json
```

---

## ⚙️ Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/linHDev0106/Somnia-Datastream-with-AI-Backend.git
cd Somnia-Datastream-with-AI-Backend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create a `.env` file

```bash
PRIVATE_KEY=0xyourPrivateKeyHere
PUBLISHER_WALLET=0xYourPublisherWallet
OPENAI_API_KEY=sk-your-openai-key
```

---

## 🧠 API Endpoints

### **GET `/api/schema`**

Returns the current Schema ID used on Somnia.

**Example Response:**

```json
{ "schemaId": "0x4f2c1234abcd..." }
```

---

### **POST `/api/publish`**

Publishes player data (wallet + score) to Somnia Data Stream.

**Request Body (JSON):**

```json
{
  "player": "0xA24d7ECD79B25CE6C66f1234567890abcdef1234",
  "score": 250
}
```

**Example Response:**

```json
{
  "success": true,
  "txHash": "0x4e3c9fabcd..."
}
```

---

### **GET `/api/data?wallet=<wallet_address>`**

Returns all player data from the Data Stream and the AI analysis result.

**Example URL:**

```
http://localhost:3000/api/data?wallet=0xA24d7ECD79B25CE6C66f1234567890abcdef1234
```

**Example Response:**

```json
{
  "totalEntries": 5,
  "data": [
    { "player": "0xA24d7E...", "score": 120 },
    { "player": "0xB31a7E...", "score": 240 },
    { "player": "0xA24d7E...", "score": 390 }
  ],
  "aiSummary": "🏆 Overview: Most players are improving their scores.\n👤 Player 0xA24d7E...: You're in the top 20% and showing great progress!"
}
```

---

## 🧩 How It Works

### 🔹 Step 1 – Register Schema

When the server starts, it will:

- Automatically create or reuse the schema `address player, uint256 score`
- Register this schema to the Somnia Stream (if not yet registered)

### 🔹 Step 2 – Record Player Data

Every time a game session ends, the client (Unity/WebGL) calls `/api/publish` to save the player’s wallet and score on-chain.

### 🔹 Step 3 – AI Data Analysis

When calling `/api/data`:

1. The backend retrieves all records from the Somnia Stream.  
2. Sends all data along with the requested wallet to `agent.js`.  
3. The AI analyzes both the **overall dataset** and the **specific player**.  
4. Returns a summary and motivational message from the AI.

---

## 🧠 AI Agent (agent.js)

The AI uses **OpenAI GPT-4.1-mini** to analyze on-chain gameplay data.

```js
const response = await client.responses.create({
  model: "gpt-4.1-mini",
  input: `
You are an AI coach analyzing game performance data.
Evaluate global trends and compare the current player with others.
Return the result under 150 words, well-structured and encouraging.
`,
});
```

**Example Output:**

```
🏆 Overview: Players are steadily improving, with fierce competition at the top.
👤 Player 0xA24d7E...: You’re progressing rapidly — keep it up!
```

---

## 🧪 Testing with Postman

### **1️⃣ Submit Player Score**

**POST** → `http://localhost:3000/api/publish`

```json
{
  "player": "0xA24d7ECD79B25CE6C66f1234567890abcdef1234",
  "score": 450
}
```

### **2️⃣ Retrieve Data + AI Analysis**

**GET** →  
`http://localhost:3000/api/data?wallet=0xA24d7ECD79B25CE6C66f1234567890abcdef1234`

---

## 💡 Future Development

- Add `/api/analyze` endpoint to test AI independently.  
- Store AI feedback history per player.  
- Create a dashboard showing score trends and AI insights.

---

## 👤 Author

**linHDev0106**  
🎮 Game & Web3 Developer | AI + Blockchain Integration  
💻 [GitHub @linHDev0106](https://github.com/linHDev0106)

---

## 🪄 License

This project is released under the **MIT License**.
