import { formatCrawlerReport, runCrawler } from "./run";

async function main() {
  loadDotenvIfAvailable();

  const report = await runCrawler(getCliOptions(process.argv.slice(2)));

  console.log(formatCrawlerReport(report));

  if (report.summary.failed > 0) {
    process.exitCode = 1;
  }
}

function getCliOptions(args: string[]) {
  const adapterArg = args.find((arg) => arg.startsWith("--adapter="));

  return {
    dryRun: args.includes("--dry-run"),
    logExhibitions: args.includes("--dry-run"),
    adapterKey: adapterArg?.split("=")[1]
  };
}

function loadDotenvIfAvailable() {
  if (typeof process.loadEnvFile === "function") {
    try {
      process.loadEnvFile(".env");
    } catch {
      // A local .env file is optional for dry runs and CI.
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

