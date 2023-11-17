const fs = require("fs").promises;
const axios = require("axios");

async function fetchAndWriteJson(filePath) {
  try {
    const response = await axios.get("http://localhost:3000/resorts");
    const data = response.data;

    const jsonString = JSON.stringify(data, null, 2);

    await fs.writeFile(filePath, jsonString, "utf8");
    console.log("File has been saved/updated.");
  } catch (err) {
    console.error("An error occurred:", err);
  }
}

fetchAndWriteJson("static/updatedEurope.json");
