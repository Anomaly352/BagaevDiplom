export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const token = process.env.DADATA_TOKEN;
  if (!token) {
    response.status(500).json({ error: "DADATA_TOKEN is not configured" });
    return;
  }

  try {
    const dadataResponse = await fetch(
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Token ${token}`
        },
        body: JSON.stringify(request.body)
      }
    );

    const data = await dadataResponse.json();
    response.status(dadataResponse.status).json(data);
  } catch (error) {
    response.status(500).json({ error: error.message || "DaData request failed" });
  }
}
