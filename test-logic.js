// Test trimester logic
console.log("🧪 Probando lógica de trimestres\n");

// Simulated trimester data based on user's image
const trimestres = [
  {
    id: 1,
    name: "Primer Trimestre",
    order: 1,
    startDate: new Date("2025-08-11"),
    endDate: new Date("2025-11-12"),
  },
  {
    id: 2,
    name: "Segundo Trimestre",
    order: 2,
    startDate: new Date("2025-11-13"),
    endDate: new Date("2026-03-06"),
  },
  {
    id: 3,
    name: "Tercer Trimestre",
    order: 3,
    startDate: new Date("2026-03-07"),
    endDate: new Date("2026-06-12"),
  },
];

console.log("📅 Configuración de trimestres simulada:");
trimestres.forEach((t) => {
  console.log(
    `   ${t.order}. ${t.name}: ${t.startDate.toISOString().split("T")[0]} a ${
      t.endDate.toISOString().split("T")[0]
    }`
  );
});

console.log("\n🧪 Probando fechas del CSV:\n");

const testDates = ["27/08/2025 10:28", "26/08/2025", "20/08/2025 9:17"];

testDates.forEach((dateStr) => {
  console.log(`📅 Fecha original: ${dateStr}`);

  // Parse as DD/MM/YYYY
  const datePart = dateStr.split(" ")[0];
  const [day, month, year] = datePart.split("/").map(Number);
  const parsedDate = new Date(year, month - 1, day);

  console.log(
    `   Parseado como DD/MM/YYYY: ${parsedDate.toISOString().split("T")[0]}`
  );
  console.log(
    `   Día ${day} de ${
      [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ][month - 1]
    } de ${year}`
  );

  // Find which trimester it belongs to
  const matchingTrimester = trimestres.find((t) => {
    return parsedDate >= t.startDate && parsedDate <= t.endDate;
  });

  if (matchingTrimester) {
    console.log(`   ✅ Pertenece a: ${matchingTrimester.name}`);
  } else {
    console.log(`   ❌ No pertenece a ningún trimestre configurado`);
    console.log(`   📊 Verificación por trimestre:`);
    trimestres.forEach((t) => {
      const afterStart = parsedDate >= t.startDate;
      const beforeEnd = parsedDate <= t.endDate;
      console.log(
        `      ${t.name}: inicio(${afterStart ? "✓" : "✗"}) fin(${
          beforeEnd ? "✓" : "✗"
        })`
      );
    });
  }

  console.log("");
});

console.log("💡 Conclusión:");
console.log("Si el segundo trimestre empieza el 13 de noviembre de 2025,");
console.log(
  "las fechas de agosto de 2025 deberían estar en el PRIMER trimestre,"
);
console.log("no en el segundo como mencionó el usuario.");
console.log("\n¿Hay algún malentendido sobre la configuración?");
