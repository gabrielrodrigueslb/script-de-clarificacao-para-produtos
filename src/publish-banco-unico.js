try { await import("dotenv/config"); } catch {}
import fs from "fs/promises";
import path from "path";
import { BancoUnicoClient } from "./services/banco-unico.client.js";
import { Alpha7ProductsClient } from "./services/alpha7-products.client.js";
import { MercadologicalClassifierService } from "./services/mercadological-classifier.service.js";
import { MercadologicalTreeService } from "./services/mercadological-tree.service.js";
import { TrierProductsClient } from "./services/trier-products.client.js";
import { isValidEan, normalizeEan } from "./utils/ean.js";
import { normalizarNomeComIA, normalizarNomeLocal } from "./utils/openaiNormalizer.js";
import { chunk, pickFirstString } from "./utils/text.js";

function printUsage() {
  console.log(`
Uso:
  npm run publish:banco-unico -- [opcoes]

Opcoes:
  --input=PATH          Arquivo de entrada. Default: ./src/data/catalogo-produtos-corrigido.json
  --source=file|api|alpha7 Origem dos produtos. Default: file.
  --source-api-url=URL  Endpoint paginado da API de produtos da Trier.
  --source-token=VAL    Token Bearer da API de origem.
  --source-page-size=N  Quantidade por pagina na API de origem. Default: 999.
  --source-ativo=BOOL   Filtro ativo da API de origem. Default: true.
  --source-integracao-ecommerce=BOOL Filtro integracaoEcommerce da API de origem. Default: true.
  --source-processa-custo-medio=BOOL Filtro processaCustoMedio da API de origem. Default: false.
  --alpha7-host=VAL     Host do Postgres Alpha 7.
  --alpha7-port=N       Porta do Postgres Alpha 7. Default: 5432.
  --alpha7-database=VAL Database do Postgres Alpha 7.
  --alpha7-user=VAL     Usuario do Postgres Alpha 7.
  --alpha7-password=VAL Senha do Postgres Alpha 7.
  --alpha7-schema=VAL   Schema do Postgres Alpha 7. Default: public.
  --taxonomy=PATH       CSV da arvore mercadologica.
  --output=PATH         JSON de saida preparado para o Banco Unico.
  --cache=PATH          Cache local de classificacao.
  --limit=N             Limita quantos itens processar.
  --offset=N            Pula os primeiros N itens validos.
  --batch-size=N        Quantos produtos publicar por lote. Default: 50.
  --classify-concurrency=N  Quantos produtos classificar em paralelo. Default: 5.
  --publish-concurrency=N   Quantos lotes publicar em paralelo. Default: 1.
  --existing-check-batch-size=N  Quantos EANs consultar por lote no Banco Unico. Default: 100.
  --existing-check-concurrency=N Quantos lotes de consulta rodar em paralelo. Default: 2.
  --base-url=URL        Base URL do Banco Unico.
  --authorization=VAL   Header Authorization.
  --classify-only       Classifica e gera saida, sem publicar.
  --dry-run             Nao publica; imprime resumo.
  --disable-normalize-ai Nao usa IA na clarificacao do nome, mesmo com USAR_IA=true.
  --disable-ai          Nao chama OpenAI; usa apenas heuristica.
  --force-taxonomy-ai   Obriga a classificacao mercadologica a usar IA quando houver candidatos.
  --force-reclassify    Ignora o cache existente.
  --ignore-existing-check Nao consulta o Banco Unico antes de classificar/publicar.
  --help                Mostra esta ajuda.
`);
}

function parseBooleanFlag(value, flagName) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  throw new Error(`${flagName} precisa ser true ou false.`);
}

function parseArgs(argv) {
  const options = {
    input: "./src/data/catalogo-produtos-corrigido.json",
    source: process.env.PRODUTOS_SOURCE_MODE || "file",
    sourceApiUrl: process.env.TRIER_PRODUTOS_API_URL || "https://api-sgf-gateway.triersistemas.com.br/sgfpod1/rest/integracao/produto/obter-todos-v1",
    sourceToken: process.env.TRIER_PRODUTOS_API_TOKEN || "",
    sourcePageSize: Math.max(1, Number(process.env.TRIER_PRODUTOS_PAGE_SIZE || 999)),
    sourceAtivo: process.env.TRIER_PRODUTOS_ATIVO ?? "true",
    sourceIntegracaoEcommerce: process.env.TRIER_PRODUTOS_INTEGRACAO_ECOMMERCE ?? "true",
    sourceProcessaCustoMedio: process.env.TRIER_PRODUTOS_PROCESSA_CUSTO_MEDIO ?? "false",
    alpha7Host: process.env.ALPHA7_DB_HOST || "",
    alpha7Port: Math.max(1, Number(process.env.ALPHA7_DB_PORT || 5432)),
    alpha7Database: process.env.ALPHA7_DB_DATABASE || "",
    alpha7User: process.env.ALPHA7_DB_USER || "",
    alpha7Password: process.env.ALPHA7_DB_PASSWORD || "",
    alpha7Schema: process.env.ALPHA7_DB_SCHEMA || "public",
    taxonomy: process.env.MERCADOLOGICAL_TREE_CSV_PATH || "./src/data/levantamento_arvore_mercadologica.csv",
    output: "./src/data/catalogo-produtos-banco-unico.json",
    cache: "./src/data/catalogo-produtos-banco-unico.cache.json",
    limit: null,
    offset: 0,
    batchSize: 50,
    classifyConcurrency: Math.max(1, Number(process.env.CLASSIFY_CONCURRENCY || 5)),
    publishConcurrency: Math.max(1, Number(process.env.PUBLISH_CONCURRENCY || 1)),
    existingCheckBatchSize: Math.max(1, Number(process.env.EXISTING_CHECK_BATCH_SIZE || 100)),
    existingCheckConcurrency: Math.max(1, Number(process.env.EXISTING_CHECK_CONCURRENCY || 2)),
    baseUrl: process.env.BANCO_UNICO_BASE_URL || "https://unicocontato.tech/banco-unico",
    authorization: process.env.BANCO_UNICO_AUTHORIZATION || "",
    classifyOnly: false,
    dryRun: false,
    disableNormalizeAi: false,
    disableAi: false,
    forceTaxonomyAi: process.env.MERCADOLOGICAL_FORCE_AI === "true",
    forceReclassify: false,
    ignoreExistingCheck: false,
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--help") options.help = true;
    else if (arg === "--classify-only") options.classifyOnly = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--disable-normalize-ai") options.disableNormalizeAi = true;
    else if (arg === "--disable-ai") options.disableAi = true;
    else if (arg === "--force-taxonomy-ai") options.forceTaxonomyAi = true;
    else if (arg === "--force-reclassify") options.forceReclassify = true;
    else if (arg === "--ignore-existing-check") options.ignoreExistingCheck = true;
    else if (arg.startsWith("--input=")) options.input = arg.slice("--input=".length);
    else if (arg.startsWith("--source=")) options.source = arg.slice("--source=".length);
    else if (arg.startsWith("--source-api-url=")) options.sourceApiUrl = arg.slice("--source-api-url=".length);
    else if (arg.startsWith("--source-token=")) options.sourceToken = arg.slice("--source-token=".length);
    else if (arg.startsWith("--source-page-size=")) options.sourcePageSize = Number(arg.slice("--source-page-size=".length));
    else if (arg.startsWith("--source-ativo=")) options.sourceAtivo = arg.slice("--source-ativo=".length);
    else if (arg.startsWith("--source-integracao-ecommerce=")) options.sourceIntegracaoEcommerce = arg.slice("--source-integracao-ecommerce=".length);
    else if (arg.startsWith("--source-processa-custo-medio=")) options.sourceProcessaCustoMedio = arg.slice("--source-processa-custo-medio=".length);
    else if (arg.startsWith("--alpha7-host=")) options.alpha7Host = arg.slice("--alpha7-host=".length);
    else if (arg.startsWith("--alpha7-port=")) options.alpha7Port = Number(arg.slice("--alpha7-port=".length));
    else if (arg.startsWith("--alpha7-database=")) options.alpha7Database = arg.slice("--alpha7-database=".length);
    else if (arg.startsWith("--alpha7-user=")) options.alpha7User = arg.slice("--alpha7-user=".length);
    else if (arg.startsWith("--alpha7-password=")) options.alpha7Password = arg.slice("--alpha7-password=".length);
    else if (arg.startsWith("--alpha7-schema=")) options.alpha7Schema = arg.slice("--alpha7-schema=".length);
    else if (arg.startsWith("--taxonomy=")) options.taxonomy = arg.slice("--taxonomy=".length);
    else if (arg.startsWith("--output=")) options.output = arg.slice("--output=".length);
    else if (arg.startsWith("--cache=")) options.cache = arg.slice("--cache=".length);
    else if (arg.startsWith("--limit=")) options.limit = Number(arg.slice("--limit=".length));
    else if (arg.startsWith("--offset=")) options.offset = Number(arg.slice("--offset=".length));
    else if (arg.startsWith("--batch-size=")) options.batchSize = Number(arg.slice("--batch-size=".length));
    else if (arg.startsWith("--classify-concurrency=")) options.classifyConcurrency = Number(arg.slice("--classify-concurrency=".length));
    else if (arg.startsWith("--publish-concurrency=")) options.publishConcurrency = Number(arg.slice("--publish-concurrency=".length));
    else if (arg.startsWith("--existing-check-batch-size=")) options.existingCheckBatchSize = Number(arg.slice("--existing-check-batch-size=".length));
    else if (arg.startsWith("--existing-check-concurrency=")) options.existingCheckConcurrency = Number(arg.slice("--existing-check-concurrency=".length));
    else if (arg.startsWith("--base-url=")) options.baseUrl = arg.slice("--base-url=".length);
    else if (arg.startsWith("--authorization=")) options.authorization = arg.slice("--authorization=".length);
  }

  if (!["file", "api", "alpha7"].includes(options.source)) {
    throw new Error("--source precisa ser file, api ou alpha7.");
  }

  if (!Number.isInteger(options.sourcePageSize) || options.sourcePageSize <= 0) {
    throw new Error("--source-page-size precisa ser inteiro maior que zero.");
  }

  if (!Number.isInteger(options.alpha7Port) || options.alpha7Port <= 0) {
    throw new Error("--alpha7-port precisa ser inteiro maior que zero.");
  }

  options.sourceAtivo = parseBooleanFlag(options.sourceAtivo, "--source-ativo");
  options.sourceIntegracaoEcommerce = parseBooleanFlag(options.sourceIntegracaoEcommerce, "--source-integracao-ecommerce");
  options.sourceProcessaCustoMedio = parseBooleanFlag(options.sourceProcessaCustoMedio, "--source-processa-custo-medio");

  if (!Number.isInteger(options.offset) || options.offset < 0) {
    throw new Error("--offset precisa ser inteiro maior ou igual a zero.");
  }

  if (!Number.isInteger(options.batchSize) || options.batchSize <= 0) {
    throw new Error("--batch-size precisa ser inteiro maior que zero.");
  }

  if (!Number.isInteger(options.classifyConcurrency) || options.classifyConcurrency <= 0) {
    throw new Error("--classify-concurrency precisa ser inteiro maior que zero.");
  }

  if (!Number.isInteger(options.publishConcurrency) || options.publishConcurrency <= 0) {
    throw new Error("--publish-concurrency precisa ser inteiro maior que zero.");
  }

  if (!Number.isInteger(options.existingCheckBatchSize) || options.existingCheckBatchSize <= 0) {
    throw new Error("--existing-check-batch-size precisa ser inteiro maior que zero.");
  }

  if (!Number.isInteger(options.existingCheckConcurrency) || options.existingCheckConcurrency <= 0) {
    throw new Error("--existing-check-concurrency precisa ser inteiro maior que zero.");
  }

  if (options.limit !== null && (!Number.isInteger(options.limit) || options.limit <= 0)) {
    throw new Error("--limit precisa ser inteiro maior que zero.");
  }

  return options;
}

async function readJson(filePath, fallback) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content.replace(/^\uFEFF/, ""));
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== undefined) {
      return fallback;
    }

    throw error;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function normalizeLoadedProducts(products) {
  if (Array.isArray(products)) {
    return products;
  }

  if (Array.isArray(products?.products)) {
    return products.products;
  }

  if (Array.isArray(products?.produtos)) {
    return products.produtos;
  }

  return [];
}

async function loadSourceProducts(options, inputPath) {
  if (options.source === "api") {
    const client = new TrierProductsClient({
      baseUrl: options.sourceApiUrl,
      token: options.sourceToken,
      pageSize: options.sourcePageSize,
      ativo: options.sourceAtivo,
      integracaoEcommerce: options.sourceIntegracaoEcommerce,
      processaCustoMedio: options.sourceProcessaCustoMedio,
    });

    const products = await client.fetchAllProducts();
    return {
      products,
      sourceLabel: client.baseUrl,
      sourceProviderLabel: "Trier",
    };
  }

  if (options.source === "alpha7") {
    const client = new Alpha7ProductsClient({
      host: options.alpha7Host,
      port: options.alpha7Port,
      database: options.alpha7Database,
      user: options.alpha7User,
      password: options.alpha7Password,
      schema: options.alpha7Schema,
      pageSize: options.sourcePageSize,
    });

    const products = await client.fetchAllProducts();
    return {
      products,
      sourceLabel: client.describeSource(),
      sourceProviderLabel: "Alpha 7",
    };
  }

  const loaded = await readJson(inputPath);
  return {
    products: normalizeLoadedProducts(loaded),
    sourceLabel: inputPath,
    sourceProviderLabel: "Arquivo local",
  };
}

function buildCacheKey(product) {
  return [
    normalizeEan(product.codigoBarras || product.ean) || "",
    pickFirstString(product.nomeNormalizadoFinal, product.nomeOriginal, product.nome),
    pickFirstString(product.nomePrincipioAtivo),
  ].join("::");
}

function buildDetalhes(product, options = {}) {
  const provider = options.sourceProviderLabel || "Origem desconhecida";
  const iaNaClarificacao = !options.disableNormalizeAi && process.env.USAR_IA === "true";
  const origemClarificacao = iaNaClarificacao ? "clarificado por ia" : "clarificado localmente";
  const detalhesBase = `${origemClarificacao} - ${provider}`;
  const nomeOriginal = pickFirstString(product.nomeOriginal, product.nome);
  const nomeFinal = pickFirstString(product.nomeNormalizadoFinal);

  if (nomeOriginal && nomeFinal && nomeOriginal.trim() !== nomeFinal.trim()) {
    return `${detalhesBase} | original: ${nomeOriginal}`;
  }

  return detalhesBase;
}

function buildPayload(product, classification, options = {}) {
  return {
    descricaoProduto: product.nomeNormalizadoFinal,
    ean: normalizeEan(product.codigoBarras || product.ean),
    detalhes: buildDetalhes(product, options),
    ...(pickFirstString(product.nomePrincipioAtivo) ? { principioAtivo: pickFirstString(product.nomePrincipioAtivo) } : {}),
    ...(pickFirstString(product.nomeLaboratorio) ? { fabricante: pickFirstString(product.nomeLaboratorio) } : {}),
    ...classification,
  };
}

function isCompleteTaxonomy(taxonomy) {
  return Boolean(
    taxonomy
    && taxonomy.departamento
    && taxonomy.categoria
    && taxonomy.subcategoria
    && taxonomy.segmento
    && taxonomy.subsegmento,
  );
}

function buildProductRef(product) {
  return {
    id_produto: Number.isInteger(product?.id_produto) ? product.id_produto : null,
    ean: normalizeEan(product?.codigoBarras || product?.ean),
    nomeNormalizadoFinal: pickFirstString(product?.nomeNormalizadoFinal, product?.nomeOriginal, product?.nome),
  };
}

async function normalizeProduct(product, options) {
  const existingNormalizedName = String(product?.nomeNormalizadoFinal || "").trim();
  const shouldRenormalizeExistingName = /\b(?:DEP|ENX\s+B|S\/PERF|FRES\s+MIN|U\s+SHEER|ST\s+M|ESFOL|SENSIT|BRANQ|FRD|CHICLE|FORTIF\/|AMONIA|LOCAO|ATAD|LENCO\s+UMD|UMD\s+FRESHQ|PAP\s+FRESHQ|GELEGELE|NATURELIF|LEITE\s+COND|UNIDADES\s+C[ÁA]PS|CX\s+C\/)\b/i.test(existingNormalizedName);

  if (existingNormalizedName && !shouldRenormalizeExistingName) {
    return {
      ...product,
      nomeOriginal: pickFirstString(product.nomeOriginal, product.nome),
      nomeNormalizadoFinal: existingNormalizedName,
    };
  }

  const shouldUseAiNormalization = !options.disableNormalizeAi && process.env.USAR_IA === "true";
  const normalized = shouldUseAiNormalization
    ? await normalizarNomeComIA(product)
    : normalizarNomeLocal(product);

  return {
    ...product,
    ...normalized,
  };
}

function percentage(part, total) {
  if (!total) {
    return 0;
  }

  return Number(((part / total) * 100).toFixed(2));
}

function buildSummary({
  validProductsCount,
  invalidEanCount,
  sampledProductsCount,
  selectedProductsCount,
  skippedExistingCount,
  preparedCount,
  skippedCount,
  erroredCount,
  publishedCount,
}) {
  return {
    totalCatalogoValido: validProductsCount,
    totalEansInvalidos: invalidEanCount,
    totalAmostraSolicitada: sampledProductsCount,
    totalNovosProcessados: selectedProductsCount,
    totalExistentesNoBanco: skippedExistingCount,
    percentualExistentesNoBanco: percentage(skippedExistingCount, sampledProductsCount),
    totalPreparados: preparedCount,
    totalPulados: skippedCount,
    totalErros: erroredCount,
    percentualErros: percentage(erroredCount, sampledProductsCount),
    totalSubidos: publishedCount,
    percentualSubidos: percentage(publishedCount, sampledProductsCount),
  };
}

async function mapWithConcurrency(items, concurrency, iteratee) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= items.length) {
        return;
      }

      results[currentIndex] = await iteratee(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );

  await Promise.all(workers);
  return results;
}

async function lookupExistingEans(products, client, options) {
  const eans = [...new Set(
    products
      .map((product) => normalizeEan(product.codigoBarras || product.ean))
      .filter(Boolean),
  )];

  const batches = chunk(eans, options.existingCheckBatchSize);
  const foundBatches = await mapWithConcurrency(
    batches,
    options.existingCheckConcurrency,
    async (batch, index) => {
      console.log(`Consultando EANs existentes ${index + 1}/${batches.length} (${batch.length} EANs)...`);
      return client.searchProductsByEans(batch);
    },
  );

  const existingEans = new Set();
  for (const batchResults of foundBatches) {
    for (const item of batchResults || []) {
      const ean = String(item?.ean || "").trim();
      if (ean) {
        existingEans.add(ean);
      }
    }
  }

  return existingEans;
}

async function persistProgressOutput({
  outputPath,
  inputPath,
  taxonomyPath,
  validProductsCount,
  invalidEanProducts,
  sampledProductsCount,
  selectedProductsCount,
  skippedExistingProducts,
  preparedProducts,
  skippedProducts,
  erroredProducts,
  publishErrors,
  publishedCount,
}) {
  const totalErrors = erroredProducts.length + publishErrors.length;
  const summary = buildSummary({
    validProductsCount,
    invalidEanCount: invalidEanProducts.length,
    sampledProductsCount,
    selectedProductsCount,
    skippedExistingCount: skippedExistingProducts.length,
    preparedCount: preparedProducts.length,
    skippedCount: skippedProducts.length,
    erroredCount: totalErrors,
    publishedCount,
  });

  await writeJson(outputPath, {
    generatedAt: new Date().toISOString(),
    source: inputPath,
    taxonomy: taxonomyPath,
    summary,
    totalEansInvalidos: invalidEanProducts.length,
    totalSelecionados: selectedProductsCount,
    totalExistentesNoBanco: skippedExistingProducts.length,
    totalPreparados: preparedProducts.length,
    totalPulados: skippedProducts.length,
    totalErros: totalErrors,
    totalSubidos: publishedCount,
    products: preparedProducts,
    skipped: skippedProducts,
    invalidEans: invalidEanProducts,
    skippedExisting: skippedExistingProducts,
    errors: erroredProducts,
    publishErrors,
  });

  return summary;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const inputPath = path.resolve(process.cwd(), options.input);
  const taxonomyPath = path.resolve(process.cwd(), options.taxonomy);
  const outputPath = path.resolve(process.cwd(), options.output);
  const cachePath = path.resolve(process.cwd(), options.cache);

  const treeService = new MercadologicalTreeService({ csvPath: taxonomyPath });
  if (!treeService.isConfigured()) {
    throw new Error(`Arvore mercadologica nao encontrada em: ${taxonomyPath}`);
  }

  const classifier = new MercadologicalClassifierService({ treeService });
  const bancoUnicoClient = new BancoUnicoClient({
    baseUrl: options.baseUrl,
    authorization: options.authorization,
  });
  const cache = options.forceReclassify ? {} : await readJson(cachePath, {});
  const { products: allProducts, sourceLabel, sourceProviderLabel } = await loadSourceProducts(options, inputPath);
  const invalidEanProducts = [];
  const validProducts = [];

  for (const product of allProducts) {
    const ean = normalizeEan(product.codigoBarras || product.ean);
    const name = pickFirstString(product.nomeNormalizadoFinal, product.nomeOriginal, product.nome);

    if (!name) {
      continue;
    }

    if (!isValidEan(ean)) {
      invalidEanProducts.push({
        ...buildProductRef(product),
        ean,
        nomeOriginal: pickFirstString(product.nomeOriginal, product.nome),
        principioAtivo: pickFirstString(product.nomePrincipioAtivo),
        fabricante: pickFirstString(product.nomeLaboratorio),
        skippedReason: "invalid_ean",
        payload: null,
      });
      continue;
    }

    validProducts.push({
      ...product,
      codigoBarras: ean,
    });
  }

  const slicedProducts = validProducts.slice(
    options.offset,
    options.limit ? options.offset + options.limit : undefined,
  );

  const existingEans = options.ignoreExistingCheck
    ? new Set()
    : await lookupExistingEans(slicedProducts, bancoUnicoClient, options);

  const selectedProducts = slicedProducts.filter((product) => {
    const ean = normalizeEan(product.codigoBarras || product.ean);
    return !existingEans.has(ean);
  });

  const skippedExistingProducts = slicedProducts
    .filter((product) => existingEans.has(normalizeEan(product.codigoBarras || product.ean)))
    .map((product) => ({
      ...buildProductRef(product),
      ean: normalizeEan(product.codigoBarras || product.ean),
      principioAtivo: pickFirstString(product.nomePrincipioAtivo),
      fabricante: pickFirstString(product.nomeLaboratorio),
      skippedReason: "already_exists_in_banco_unico",
      payload: null,
    }));

  const preparedProducts = [];
  const skippedProducts = [];
  const erroredProducts = [];
  const pendingPublishProducts = [];
  const publishErrors = [];
  let publishedCount = 0;

  async function flushPendingPublications({ force = false } = {}) {
    if (options.classifyOnly || options.dryRun) {
      return;
    }

    const publishableCount = force
      ? pendingPublishProducts.length
      : pendingPublishProducts.length - (pendingPublishProducts.length % options.batchSize);

    if (publishableCount <= 0) {
      return;
    }

    const itemsToPublish = pendingPublishProducts.splice(0, publishableCount);
    const batches = chunk(itemsToPublish, options.batchSize);

    await mapWithConcurrency(
      batches,
      options.publishConcurrency,
      async (batch, index) => {
        console.log(`Publicando lote ${index + 1}/${batches.length} com ${batch.length} produtos...`);
        try {
          await bancoUnicoClient.publishProducts(batch.map((item) => item.payload));
          publishedCount += batch.length;
        } catch (error) {
          for (const item of batch) {
            publishErrors.push({
              id_produto: item.id_produto,
              ean: item.ean,
              nomeNormalizadoFinal: item.nomeNormalizadoFinal,
              errorStage: "publish",
              errorMessage: error.message,
            });
          }
        }
      },
    );
  }

  const selectedChunks = chunk(selectedProducts, Math.max(options.classifyConcurrency * 5, 25));
  let processedCount = 0;

  for (const productChunk of selectedChunks) {
    const chunkResults = await mapWithConcurrency(
      productChunk,
      options.classifyConcurrency,
      async (product, chunkIndex) => {
        const globalIndex = processedCount + chunkIndex;
        try {
          const normalizedProduct = await normalizeProduct(product, options);
          const cacheKey = buildCacheKey(normalizedProduct);
          let classificationResult = cache[cacheKey];
          const cacheFoiHeuristico = classificationResult?.metadata?.source === "heuristic";
          const precisaReclassificarComIa = options.forceTaxonomyAi && cacheFoiHeuristico;

          if (!classificationResult || precisaReclassificarComIa) {
            classificationResult = await classifier.classifyProduct(normalizedProduct, {
              disableAi: options.disableAi,
              forceAi: options.forceTaxonomyAi,
            });
            cache[cacheKey] = classificationResult;
          }

          const taxonomy = classificationResult?.taxonomy || null;
          const completeTaxonomy = isCompleteTaxonomy(taxonomy);

          const itemOutput = {
            ...buildProductRef(normalizedProduct),
            ean: normalizeEan(normalizedProduct.codigoBarras || normalizedProduct.ean),
            principioAtivo: pickFirstString(normalizedProduct.nomePrincipioAtivo),
            fabricante: pickFirstString(normalizedProduct.nomeLaboratorio),
            nomeOriginal: pickFirstString(normalizedProduct.nomeOriginal, normalizedProduct.nome),
            confiancaNormalizacao: normalizedProduct.confianca || null,
            precisaRevisaoNormalizacao: Boolean(normalizedProduct.precisaRevisao),
            taxonomy,
            metadata: classificationResult?.metadata || null,
            payload: completeTaxonomy ? buildPayload(normalizedProduct, taxonomy, {
              ...options,
              sourceProviderLabel,
            }) : null,
          };

          console.log(`[${globalIndex + 1}/${selectedProducts.length}] ${completeTaxonomy ? "OK" : "SKIP"} ${itemOutput.ean} ${itemOutput.nomeNormalizadoFinal}`);
          return { status: completeTaxonomy ? "prepared" : "skipped", itemOutput };
        } catch (error) {
          const itemOutput = {
            ...buildProductRef(product),
            principioAtivo: pickFirstString(product.nomePrincipioAtivo),
            fabricante: pickFirstString(product.nomeLaboratorio),
            errorStage: "classification",
            errorMessage: error.message,
            payload: null,
          };
          console.log(`[${globalIndex + 1}/${selectedProducts.length}] ERROR ${itemOutput.ean || "-"} ${itemOutput.nomeNormalizadoFinal}`);
          return { status: "error", itemOutput };
        }
      },
    );

    for (const result of chunkResults) {
      if (result.status === "prepared") {
        preparedProducts.push(result.itemOutput);
        pendingPublishProducts.push(result.itemOutput);
      } else if (result.status === "skipped") {
        skippedProducts.push(result.itemOutput);
      } else {
        erroredProducts.push(result.itemOutput);
      }
    }

    processedCount += productChunk.length;
    await writeJson(cachePath, cache);
    await flushPendingPublications();
    await persistProgressOutput({
      outputPath,
      inputPath: sourceLabel,
      taxonomyPath,
      validProductsCount: validProducts.length,
      invalidEanProducts,
      sampledProductsCount: slicedProducts.length,
      selectedProductsCount: selectedProducts.length,
      skippedExistingProducts,
      preparedProducts,
      skippedProducts,
      erroredProducts,
      publishErrors,
      publishedCount,
    });
  }

  await writeJson(cachePath, cache);
  await flushPendingPublications({ force: true });

  const progressSummary = await persistProgressOutput({
    outputPath,
    inputPath: sourceLabel,
    taxonomyPath,
    validProductsCount: validProducts.length,
    invalidEanProducts,
    sampledProductsCount: slicedProducts.length,
    selectedProductsCount: selectedProducts.length,
    skippedExistingProducts,
    preparedProducts,
    skippedProducts,
    erroredProducts,
    publishErrors,
    publishedCount,
  });

  console.log(JSON.stringify({
    inputPath: sourceLabel,
    taxonomyPath,
    outputPath,
    totalCatalogoValido: validProducts.length,
    totalEansInvalidos: invalidEanProducts.length,
    totalAmostraSolicitada: slicedProducts.length,
    totalSelecionados: selectedProducts.length,
    totalExistentesNoBanco: skippedExistingProducts.length,
    totalPreparados: preparedProducts.length,
    totalPulados: skippedProducts.length,
    totalErros: erroredProducts.length,
    aiHabilitada: !options.disableAi && Boolean(process.env.OPENAI_API_KEY),
    forcaIaNaArvore: options.forceTaxonomyAi,
    classifyConcurrency: options.classifyConcurrency,
    publishConcurrency: options.publishConcurrency,
    existingCheckBatchSize: options.existingCheckBatchSize,
    existingCheckConcurrency: options.existingCheckConcurrency,
    sourceMode: options.source,
    sourceIntegracaoEcommerce: options.sourceIntegracaoEcommerce,
    usaIaNaClarificacao: !options.disableNormalizeAi && process.env.USAR_IA === "true",
    mode: options.classifyOnly ? "classify-only" : options.dryRun ? "dry-run" : "publish",
  }, null, 2));

  if (options.classifyOnly || options.dryRun) {
    console.log(JSON.stringify({
      resumo_final: progressSummary,
      ids_com_erro: erroredProducts.map((item) => ({
        id_produto: item.id_produto,
        ean: item.ean,
        errorStage: item.errorStage,
      })),
    }, null, 2));
    return;
  }

  const totalErrors = erroredProducts.length + publishErrors.length;
  const finalSummary = buildSummary({
    validProductsCount: validProducts.length,
    invalidEanCount: invalidEanProducts.length,
    sampledProductsCount: slicedProducts.length,
    selectedProductsCount: selectedProducts.length,
    skippedExistingCount: skippedExistingProducts.length,
    preparedCount: preparedProducts.length,
    skippedCount: skippedProducts.length,
    erroredCount: totalErrors,
    publishedCount,
  });

  await persistProgressOutput({
    outputPath,
    inputPath: sourceLabel,
    taxonomyPath,
    validProductsCount: validProducts.length,
    invalidEanProducts,
    sampledProductsCount: slicedProducts.length,
    selectedProductsCount: selectedProducts.length,
    skippedExistingProducts,
    preparedProducts,
    skippedProducts,
    erroredProducts,
    publishErrors,
    publishedCount,
  });

  console.log(JSON.stringify({
    resumo_final: finalSummary,
    ids_com_erro: [...erroredProducts, ...publishErrors].map((item) => ({
      id_produto: item.id_produto,
      ean: item.ean,
      errorStage: item.errorStage,
    })),
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  if (error.details) {
    console.error(JSON.stringify(error.details, null, 2));
  }
  process.exitCode = 1;
});
