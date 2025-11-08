import XLSX from "xlsx";
import database from "../db.js";

async function importCards(path) {
  const wb = XLSX.readFile(path);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  for (const row of rows) {
    await database.add_card(row.Kanji, row.Meaning, row.Reading, "");
    console.log(`Added ${row.Kanji}`);
  }

  if (database.close) await database.close(); // optional, depends on your setup
  console.log("Import complete.");
  process.exit(0); // force exit if you still have lingering handles
}

importCards(process.argv[2]);
