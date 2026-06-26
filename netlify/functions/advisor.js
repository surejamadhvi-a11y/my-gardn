export const handler = async function (event) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const CORS = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

  try {
    // Netlify sometimes base64-encodes the body
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;

    const { messages, plants, model } = JSON.parse(rawBody);

    if (!messages || !Array.isArray(messages)) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "messages array required" }) };
    }

    let systemPrompt;
    if (plants && plants.length > 0) {
      const plantList = plants.map(p => `${p.name} (${p.growthStage})`).join(", ");
      systemPrompt = `You are a plant care assistant in the My Gardn app. The user is currently growing: ${plantList}. Give advice specific to their actual plants when relevant.`;
    } else {
      systemPrompt = "You are a helpful plant care assistant in the My Gardn app. Give practical, friendly advice about plant care, gardening, and growing.";
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    const data = await anthropicRes.json();

    // Forward the exact status from Anthropic so the frontend can detect errors
    return {
      statusCode: anthropicRes.status,
      headers: CORS,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("Advisor function error:", err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
