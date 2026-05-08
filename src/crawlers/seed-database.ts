import { formatCrawlerReport, runCrawler } from "./run";

async function main() {
  loadDotenvIfAvailable();

  const report = await runCrawler({
    dryRun: false,
    logExhibitions: true
  });

  console.log(formatCrawlerReport(report));

  if (report.summary.failed > 0) {
    process.exitCode = 1;
  }
}

function loadDotenvIfAvailable() {
  if (typeof process.loadEnvFile === "function") {
    try {
      process.loadEnvFile(".env");
    } catch {
      // A local .env file is optional in CI and Vercel.
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
