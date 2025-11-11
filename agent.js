import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 🔴 Phân tích tổng thể và cá nhân của người chơi trong game
 * @param {string} walletAddress - Địa chỉ ví của người gọi (người chơi hiện tại)
 * @param {Array<{player: string, score: number}>} allData - 🔴 Toàn bộ dữ liệu điểm của mọi người chơi
 * @returns {Promise<string>} - 🔴 Tóm tắt phân tích tổng thể + nhận xét riêng cho người chơi
 */
export async function analyzePlayerPerformance(walletAddress, allData) {
  // 🔴 Tổng hợp dữ liệu toàn bộ người chơi
  const summaryAll = allData
    .map((entry) => `${entry.player}: ${entry.score}`)
    .join("\n");

  // 🔴 Lọc dữ liệu của người gọi (địa chỉ ví cụ thể)
  const personalData = allData
    .filter((entry) => entry.player === walletAddress)
    .map((entry, index) => `#${index + 1}: ${entry.score}`)
    .join("\n");

  const prompt = `
You are a motivational game data analyst AI for a blockchain game.

Here is the complete game performance data from all players:
${summaryAll}

🔴 The player currently requesting analysis has wallet address: ${walletAddress}

Their individual score history:
${personalData || "No record found for this player yet."}

Analyze:
1. 🔴 Overall performance trend among all players (e.g., who is improving, average competitiveness, any noticeable outliers)
2. 🔴 The individual player’s performance compared to others
3. 🔴 Give a short, friendly motivational summary (under 150 words)

Respond in a clear and structured summary style.
`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  // 🔴 Trả về phần nội dung chính từ AI
  return response.output[0].content[0].text;
}
