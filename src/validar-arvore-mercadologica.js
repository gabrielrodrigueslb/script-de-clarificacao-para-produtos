try { await import("dotenv/config"); } catch {}
import fs from "fs/promises";

const input = process.argv[2] || process.env.ARQUIVO_SAIDA || "./src/data/catalogo-normalizado.json";

function complete(item) {
  return Boolean(item.departamento && item.categoria && item.subcategoria && item.segmento && item.subsegmento);
}

const data = JSON.parse((await fs.readFile(input, "utf8")).replace(/^\uFEFF/, ""));
const produtos = Array.isArray(data) ? data : data.produtos || [];
const semArvore = produtos.filter((item) => !complete(item));

console.log(JSON.stringify({
  arquivo: input,
  total: produtos.length,
  comArvoreMercadologica: produtos.length - semArvore.length,
  semArvoreMercadologica: semArvore.length,
  exemplosSemArvore: semArvore.slice(0, 20).map((item) => ({
    id_produto: item.id_produto,
    codigoBarras: item.codigoBarras,
    nomeNormalizadoFinal: item.nomeNormalizadoFinal,
    alertas: item.alertas,
  })),
}, null, 2));

if (semArvore.length && process.argv.includes("--strict")) {
  process.exitCode = 2;
}
