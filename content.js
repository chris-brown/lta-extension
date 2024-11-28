// Function to parse CSV data into an array of objects
function parseCSV(csvData) {
  const lines = csvData.split("\n");
  const headers = lines[0].split(",");
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(",");
    if (currentLine.length !== headers.length) continue;

    const entry = {};
    for (let j = 0; j < headers.length; j++) {
      entry[headers[j]] = currentLine[j];
    }
    result.push(entry);
  }

  return result;
}

function fetchData(csvUrl) {
  return fetch(csvUrl)
    .then((response) => response.text())
    .then((csvData) => {
      console.log("parsing CSV data...");
      const parsedData = parseCSV(csvData);
      return parsedData;
    })
    .catch((error) => {
      console.error("Error fetching csv for u9:", error);
    });
}

function createCell(text, row) {
    const ratingCell = document.createElement("td");
    ratingCell.innerText = text;
    row.appendChild(ratingCell);
}

function whichAge() {
  const documentText = document.getElementById("content").textContent;
  const words = documentText.split(/\s+/);
  return [words.includes("9U"), words.includes("10U"), words.includes("11U")];
}

(async () => {
  const table = document.querySelector("table.ruler > tbody");
  const rows = table.querySelectorAll("tr");

  const [isu9, isu10, isu11] = whichAge();

  if (!isu9 && !isu10 && !isu11) return;

  const dataurl = isu9
    ? "https://ltascrape.blob.core.windows.net/files/u9.csv?sp=r&st=2023-09-19T07:21:48Z&se=2025-09-01T15:21:48Z&spr=https&sv=2022-11-02&sr=b&sig=z3nG7dlwk2upIbaIe1TxpHeP86tIFiSxA2jcHz%2BcU%2F8%3D"
    : isu10
    ? "https://ltascrape.blob.core.windows.net/files/u10.csv?sp=r&st=2023-09-19T07:23:24Z&se=2025-05-01T15:23:24Z&spr=https&sv=2022-11-02&sr=b&sig=BlG9ggI3GcIix8VvJOcekMORU%2FWZd8X50ZjbPieBAC4%3D"
    : "https://ltascrape.blob.core.windows.net/files/combined.csv?sp=r&st=2023-12-18T20:34:33Z&se=2026-09-01T03:34:33Z&spr=https&sv=2022-11-02&sr=b&sig=jz2qDF7yKg0QXRdqVVoBxpLwpbjnOntoiPFnHfLORWw%3D";

  const players = await fetchData(dataurl);

  const playerCellIndex = table.querySelector("td.elt1") ? 2 : 1;

  rows.forEach((row) => {
    const playerCell = row.querySelector(`td:nth-child(${playerCellIndex})`);

    if (playerCell) {
      const player = players.find((item) => item.player == playerCell.innerText);
      console.log(player, playerCell)
      createCell(player ? player?.form : "0", row);
      createCell(player ? player?.county : "", row);
    }
  });

  const unsortedRows = Array.from(rows);

  // sort rows
  unsortedRows.sort((a, b) => {
    let cellA, cellB;
    try {
      cellA = parseFloat(a.cells[playerCellIndex*2].innerText);
      cellB = parseFloat(b.cells[playerCellIndex*2].innerText);
    } catch {
      return -99;
    }
    return cellB - cellA;
  });

  table.innerHTML = "";
  unsortedRows.forEach((row) => {
    table.appendChild(row);
  });
})();
