import { getAllDatapoints, createChartsFromImportedDatapoints } from "../render/chart-manager.js";


const csvExportBtn = document.getElementById("csvExport");
const csvImportBtn = document.getElementById("csvImport");
const fileInput = document.getElementById("csvFileInput");

csvExportBtn.addEventListener("click", () => exportCSV());

csvImportBtn.addEventListener("click", () => {
    fileInput.value = "";
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
        await importCSV(reader.result);
    };

    reader.readAsText(file);
});


function generateCSV() {
    let csv = "chart,time,value\n";

    const datapoints = getAllDatapoints();

    for (const key in datapoints) {
        for (const point of datapoints[key]) {
            csv += `${key},${point.time},${point.value}\n`;
        }
    }

    return csv;
}

function exportCSV() {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.csv";
    link.click();
    URL.revokeObjectURL(url);
}

async function importCSV(csvText) {
    const lines = csvText.trim().split("\n");
    lines.shift(); // remove header

    const importedDatapoints = {};

    for (const line of lines) {
        const [key, time, value] = line.split(",");
        if (!key || value === undefined) continue;

        if (!importedDatapoints[key]) importedDatapoints[key] = [];
        importedDatapoints[key].push({
            time,
            value: parseFloat(value)
        });
    }

    await createChartsFromImportedDatapoints(importedDatapoints);
}