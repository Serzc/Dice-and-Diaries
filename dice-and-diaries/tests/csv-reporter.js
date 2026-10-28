import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export default class CsvReporter {
  constructor(options = {}) {
    this.outputFile = options.outputFile ?? "test-results/playwright-results.csv";
    this.rows = [];
  }

  onTestEnd(test, result) {
    const title = test.titlePath().filter(Boolean).join(" > ");
    const requirementId = title.match(/\[([^\]]+)\]/)?.[1] ?? "";
    this.rows.push([
      requirementId,
      title,
      result.status,
      result.duration,
      result.errors.map((error) => error.message).join("\n"),
    ]);
  }

  async onEnd() {
    const header = ["Requirement ID", "Test case", "Result", "Duration (ms)", "Details"];
    const csv = [header, ...this.rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    await mkdir(dirname(this.outputFile), { recursive: true });
    await writeFile(this.outputFile, `\uFEFF${csv}\r\n`, "utf8");
  }
}
