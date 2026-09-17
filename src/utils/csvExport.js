/**
 * CSV Export Utility
 * Converts a dataset (array of objects) to a downloadable CSV file
 */

/**
 * Convert an array of objects to CSV string
 * @param {Object[]} data - Array of row objects
 * @param {string[]} columns - Optional subset of columns to export
 * @returns {string} CSV formatted string
 */
export const toCSV = (data, columns = null) => {
  if (!data || data.length === 0) return "";

  const keys = columns || Object.keys(data[0]);
  const header = keys.join(",");

  const rows = data.map((row) =>
    keys
      .map((key) => {
        const val = row[key] ?? "";
        // Wrap in quotes if contains comma, newline, or quote
        const str = String(val).replace(/"/g, '""');
        return /[",\n]/.test(str) ? `"${str}"` : str;
      })
      .join(",")
  );

  return [header, ...rows].join("\n");
};

/**
 * Download a CSV file to the user's browser
 * @param {Object[]} data - Array of row objects
 * @param {string} filename - Output filename (without .csv)
 * @param {string[]} columns - Optional column subset
 */
export const downloadCSV = (data, filename, columns = null) => {
  const csv = toCSV(data, columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
