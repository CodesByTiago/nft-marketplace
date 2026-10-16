// Auditoria Lighthouse: build otimizado + preview com mocks ligados, 3 medições por página/perfil (mediana).
// Uso: npm run lighthouse   (relatórios HTML/JSON em lighthouse/reports)
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";

const PORT = 4173;
const BASE = `http://127.0.0.1:${PORT}`;
const RUNS = 3;
const pages = { inicio: "/", detalhe: "/nft/emerald-ape-042" };
const profiles = { mobile: undefined, desktop: desktopConfig };
const targets = { performance: 90, accessibility: 95, "best-practices": 95, seo: 90 };
const out = new URL("./reports/", import.meta.url);
mkdirSync(out, { recursive: true });

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const run = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn(npm, args, { stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`npm ${args.join(" ")} falhou`))));
  });

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {
      // servidor ainda subindo
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("preview não respondeu");
}

await run(["run", "build"]);
const preview = spawn(npm, ["run", "preview", "--", "--host", "127.0.0.1", "--port", String(PORT), "--strictPort"], {
  stdio: "ignore",
  shell: process.platform === "win32",
});
const chrome = await launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
const summary = [];

try {
  await waitForServer();
  for (const [pageName, path] of Object.entries(pages)) {
    for (const [profile, config] of Object.entries(profiles)) {
      const results = [];
      for (let index = 0; index < RUNS; index += 1) {
        const flags = { port: chrome.port, output: ["json", "html"], logLevel: "error" };
        results.push(await lighthouse(`${BASE}${path}`, flags, config));
      }
      const performance = (result) => result.lhr.categories.performance.score;
      const chosen = [...results].sort((a, b) => performance(a) - performance(b))[Math.floor(RUNS / 2)];
      const name = `${pageName}-${profile}`;
      writeFileSync(new URL(`${name}.json`, out), chosen.report[0]);
      writeFileSync(new URL(`${name}.html`, out), chosen.report[1]);
      const audit = (id) => results.map((result) => result.lhr.audits[id].numericValue);
      const row = {
        pagina: pageName,
        perfil: profile,
        lcpMs: Math.round(median(audit("largest-contentful-paint"))),
        cls: Number(median(audit("cumulative-layout-shift")).toFixed(3)),
        tbtMs: Math.round(median(audit("total-blocking-time"))),
      };
      for (const id of Object.keys(targets)) {
        row[id] = Math.round(median(results.map((result) => result.lhr.categories[id].score)) * 100);
      }
      row.lighthouse = chosen.lhr.lighthouseVersion;
      summary.push(row);
      console.log(row);
    }
  }
  writeFileSync(new URL("summary.json", out), JSON.stringify({ metas: targets, runs: RUNS, summary }, null, 2));
  const below = summary.flatMap((row) => Object.entries(targets).filter(([id, min]) => row[id] < min));
  if (below.length) console.warn(`${below.length} categoria(s) abaixo da meta. Ver lighthouse/reports/summary.json.`);
} finally {
  await chrome.kill();
  preview.kill();
}
