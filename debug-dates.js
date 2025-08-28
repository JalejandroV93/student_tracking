// Simple test script

// Simulate the date parsing logic
function parseDate(dateStr) {
  console.log(`Parseando: ${dateStr}`);

  // Check if it has time component
  const parts = dateStr.split(" ");
  const datePart = parts[0];
  console.log(`Parte de fecha: ${datePart}`);

  // Split by /
  const dateParts = datePart.split("/");
  console.log(`Partes: [${dateParts.join(", ")}]`);

  if (dateParts.length === 3) {
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);

    console.log(`Interpretado como: día=${day}, mes=${month}, año=${year}`);

    // Try DD/MM/YYYY format
    const dateDD_MM = new Date(year, month - 1, day);
    console.log(`Como DD/MM/YYYY: ${dateDD_MM.toISOString()}`);
    console.log(
      `Mes real: ${dateDD_MM.getMonth() + 1} (${dateDD_MM.toLocaleString("es", {
        month: "long",
      })})`
    );

    // Try MM/DD/YYYY format
    if (day <= 12 && month <= 31) {
      const dateMM_DD = new Date(year, day - 1, month);
      console.log(`Como MM/DD/YYYY: ${dateMM_DD.toISOString()}`);
      console.log(
        `Mes real: ${dateMM_DD.getMonth() + 1} (${dateMM_DD.toLocaleString(
          "es",
          { month: "long" }
        )})`
      );
    }
  }

  console.log("---");
}

// Test the example dates
const testDates = ["27/08/2025 10:28", "26/08/2025", "20/08/2025 9:17"];

testDates.forEach(parseDate);

console.log("\nSegún la configuración mencionada:");
console.log("Segundo Trimestre: 2025-11-13 a 2026-03-06");
console.log(
  "Las fechas de agosto (08) deberían estar en el primer trimestre, no el segundo."
);
console.log("¿Hay algún malentendido sobre qué trimestre debería ser?");
