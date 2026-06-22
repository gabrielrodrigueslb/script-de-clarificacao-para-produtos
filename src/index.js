try { await import("dotenv/config"); } catch {}
import fs from "fs/promises";
import path from "path";
import { normalizarNomeLocal, normalizarNomeComIA } from "./utils/openaiNormalizer.js";
import { MercadologicalClassifierService } from "./services/mercadological-classifier.service.js";
import { MercadologicalTreeService } from "./services/mercadological-tree.service.js";

const USAR_IA = process.env.USAR_IA === "true";
const CLASSIFICAR_MERCADOLOGIA = process.env.CLASSIFICAR_MERCADOLOGIA !== "false";
const ARVORE_OBRIGATORIA = process.env.ARVORE_OBRIGATORIA !== "false";
const FALHAR_SEM_ARVORE = process.env.FALHAR_SEM_ARVORE === "true";
const DESABILITAR_IA_MERCADOLOGICA = process.env.MERCADOLOGICAL_DISABLE_AI === "true" || process.env.USAR_IA_MERCADOLOGICA === "false";
const FORCAR_IA_MERCADOLOGICA = process.env.MERCADOLOGICAL_FORCE_AI === "true";

const ENTRADA = process.env.ARQUIVO_ENTRADA || "./src/data/catalogo-produtos.json";
const SAIDA = process.env.ARQUIVO_SAIDA || "./src/data/catalogo-normalizado.json";
const ARVORE_CSV = process.env.MERCADOLOGICAL_TREE_CSV_PATH || "./src/data/levantamento_arvore_mercadologica.csv";

function isCompleteTaxonomy(taxonomy) {
  return Boolean(
    taxonomy &&
    taxonomy.departamento &&
    taxonomy.categoria &&
    taxonomy.subcategoria &&
    taxonomy.segmento &&
    taxonomy.subsegmento
  );
}

function mergeAlerts(...alertLists) {
  return alertLists
    .flat()
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index);
}

async function buildClassifier() {
  if (!CLASSIFICAR_MERCADOLOGIA) {
    return null;
  }

  const csvPath = path.resolve(process.cwd(), ARVORE_CSV);
  const treeService = new MercadologicalTreeService({ csvPath });

  if (!treeService.isConfigured()) {
    const msg = `Arvore mercadologica nao encontrada em: ${csvPath}`;
    if (ARVORE_OBRIGATORIA) {
      throw new Error(msg);
    }
    console.warn(`[AVISO] ${msg}. A classificacao mercadologica ficara desabilitada.`);
    return null;
  }

  return new MercadologicalClassifierService({ treeService });
}

async function classificarMercadologia(classifier, produtoNormalizado) {
  if (!classifier) {
    return {
      taxonomy: null,
      metadata: {
        source: "disabled",
        confidence: 0,
        rationale: "Classificacao mercadologica desabilitada.",
      },
    };
  }

  return classifier.classifyProduct(produtoNormalizado, {
    disableAi: DESABILITAR_IA_MERCADOLOGICA,
    forceAi: FORCAR_IA_MERCADOLOGICA,
  });
}

async function main() {
  const conteudo = await fs.readFile(ENTRADA, "utf8");
  const produtos = JSON.parse(conteudo.replace(/^\uFEFF/, ""));
  const classifier = await buildClassifier();

  const resultado = [];
  const resumo = {
    total: produtos.length,
    normalizados: 0,
    comArvoreMercadologica: 0,
    semArvoreMercadologica: 0,
    erros: 0,
  };

  for (let i = 0; i < produtos.length; i++) {
    const produto = produtos[i];

    try {
      const normalizado = USAR_IA
        ? await normalizarNomeComIA(produto)
        : normalizarNomeLocal(produto);

      const classificationResult = await classificarMercadologia(classifier, normalizado);
      const taxonomy = classificationResult?.taxonomy || null;
      const completeTaxonomy = isCompleteTaxonomy(taxonomy);
      const alertas = mergeAlerts(
        normalizado.alertas || [],
        completeTaxonomy ? [] : ["SEM_ARVORE_MERCADOLOGICA"],
      );

      const itemFinal = {
        id_produto: produto.id_produto ?? i,
        ...normalizado,
        departamento: taxonomy?.departamento || null,
        categoria: taxonomy?.categoria || null,
        subcategoria: taxonomy?.subcategoria || null,
        segmento: taxonomy?.segmento || null,
        subsegmento: taxonomy?.subsegmento || null,
        arvoreMercadologica: taxonomy,
        classificacaoMercadologica: classificationResult?.metadata || null,
        alertas,
        precisaRevisao: Boolean(normalizado.precisaRevisao || !completeTaxonomy),
      };

      resultado.push(itemFinal);
      resumo.normalizados += 1;

      if (completeTaxonomy) {
        resumo.comArvoreMercadologica += 1;
        console.log(`[${i + 1}/${produtos.length}] OK ${itemFinal.codigoBarras || "-"} ${itemFinal.nomeNormalizadoFinal}`);
      } else {
        resumo.semArvoreMercadologica += 1;
        const msg = `[${i + 1}/${produtos.length}] SEM_ARVORE ${itemFinal.codigoBarras || "-"} ${itemFinal.nomeNormalizadoFinal}`;
        console.warn(msg);
      }
    } catch (erro) {
      resumo.erros += 1;
      console.error(`[${i + 1}/${produtos.length}] ERRO:`, produto.nome || produto.nomeOriginal, erro.message);
      resultado.push({
        id_produto: produto.id_produto ?? i,
        nomeOriginal: produto.nome || produto.nomeOriginal,
        nomeNormalizadoFinal: produto.nome || produto.nomeOriginal,
        confianca: "baixa",
        precisaRevisao: true,
        alertas: ["ERRO_NORMALIZACAO", "SEM_ARVORE_MERCADOLOGICA"],
        erro: erro.message,
        codigoBarras: produto.codigoBarras ?? null,
        nomeLaboratorio: produto.nomeLaboratorio ?? null,
        nomePrincipioAtivo: produto.nomePrincipioAtivo ?? null,
        departamento: null,
        categoria: null,
        subcategoria: null,
        segmento: null,
        subsegmento: null,
        arvoreMercadologica: null,
        classificacaoMercadologica: null,
      });
    }
  }

  await fs.writeFile(SAIDA, JSON.stringify({ resumo, produtos: resultado }, null, 2), "utf8");
  console.log(`\nArquivo gerado em: ${SAIDA}`);
  console.log(JSON.stringify(resumo, null, 2));

  if (FALHAR_SEM_ARVORE && resumo.semArvoreMercadologica > 0) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
