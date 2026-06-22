# Normalizador Farma Completo

Projeto para:
- normalizar nome de produto
- enriquecer principio ativo e fabricante
- classificar na arvore mercadologica
- consultar EANs ja existentes no Banco Unico
- publicar apenas os produtos novos

O projeto tem dois fluxos principais:
- `src/index.js`: normaliza um arquivo local e grava um JSON final
- `src/publish-banco-unico.js`: busca produtos de arquivo, API Trier ou Alpha 7, classifica, consulta o Banco Unico e publica

## Scripts disponiveis

```bash
npm run test
npm run normalizar
npm run publish:banco-unico
npm run publish:banco-unico:api
npm run publish:banco-unico:alpha7
npm run validar:arvore -- <arquivo>
```

## Estrutura resumida

- [src/index.js](C:/Users/Gabriel/Downloads/normalizador-farma-completo-v25/src/index.js): fluxo simples de normalizacao + arvore
- [src/publish-banco-unico.js](C:/Users/Gabriel/Downloads/normalizador-farma-completo-v25/src/publish-banco-unico.js): fluxo completo para Banco Unico
- [src/services/trier-products.client.js](C:/Users/Gabriel/Downloads/normalizador-farma-completo-v25/src/services/trier-products.client.js): cliente da API Trier
- [src/services/alpha7-products.client.js](C:/Users/Gabriel/Downloads/normalizador-farma-completo-v25/src/services/alpha7-products.client.js): cliente Postgres do Alpha 7
- [src/services/mercadological-tree.service.js](C:/Users/Gabriel/Downloads/normalizador-farma-completo-v25/src/services/mercadological-tree.service.js): leitura e score da arvore
- [src/services/mercadological-classifier.service.js](C:/Users/Gabriel/Downloads/normalizador-farma-completo-v25/src/services/mercadological-classifier.service.js): decisao heuristica/IA da classificacao
- [src/services/banco-unico.client.js](C:/Users/Gabriel/Downloads/normalizador-farma-completo-v25/src/services/banco-unico.client.js): consulta e publicacao no Banco Unico
- [src/utils/normalizador-v25.js](C:/Users/Gabriel/Downloads/normalizador-farma-completo-v25/src/utils/normalizador-v25.js): normalizacao local
- [src/utils/openaiNormalizer.js](C:/Users/Gabriel/Downloads/normalizador-farma-completo-v25/src/utils/openaiNormalizer.js): normalizacao com IA
- [src/data/levantamento_arvore_mercadologica.csv](C:/Users/Gabriel/Downloads/normalizador-farma-completo-v25/src/data/levantamento_arvore_mercadologica.csv): arvore mercadologica

## Requisitos

- Node.js com suporte a ESM
- `npm install`
- arquivo `.env` configurado

## Variaveis de ambiente

### Normalizacao

```env
USAR_IA=false
OPENAI_API_KEY=
```

- `USAR_IA=true`: usa OpenAI para clarificar o nome do produto
- `USAR_IA=false`: usa apenas o normalizador local

### Arvore mercadologica

```env
CLASSIFICAR_MERCADOLOGIA=true
ARVORE_OBRIGATORIA=true
FALHAR_SEM_ARVORE=false
ALLOW_WEAK_MERCADOLOGICAL_FALLBACK=false
MERCADOLOGICAL_TREE_CSV_PATH=./src/data/levantamento_arvore_mercadologica.csv
MERCADOLOGICAL_DISABLE_AI=false
MERCADOLOGICAL_FORCE_AI=true
MERCADOLOGICAL_AI_MODEL=gpt-4.1-mini
MERCADOLOGICAL_AI_CANDIDATE_LIMIT=25
MERCADOLOGICAL_AI_MIN_CONFIDENCE=0.65
```

- `CLASSIFICAR_MERCADOLOGIA=false`: desliga a classificacao da arvore
- `ARVORE_OBRIGATORIA=true`: se o CSV da arvore nao existir, o processo falha
- `FALHAR_SEM_ARVORE=true`: o processo termina com erro se qualquer produto ficar sem classificacao
- `ALLOW_WEAK_MERCADOLOGICAL_FALLBACK=true`: permite pegar o melhor candidato mesmo sem seguranca. Nao recomendado
- `MERCADOLOGICAL_DISABLE_AI=true`: desliga a IA na classificacao mercadologica
- `MERCADOLOGICAL_FORCE_AI=true`: obriga a classificacao mercadologica a passar pela IA sempre que houver candidatos

### API Trier

```env
PRODUTOS_SOURCE_MODE=api
TRIER_PRODUTOS_API_URL=https://api-sgf-gateway.triersistemas.com.br/sgfpod1/rest/integracao/produto/obter-todos-v1
TRIER_PRODUTOS_API_TOKEN=
TRIER_PRODUTOS_PAGE_SIZE=999
TRIER_PRODUTOS_ATIVO=true
TRIER_PRODUTOS_INTEGRACAO_ECOMMERCE=true
TRIER_PRODUTOS_PROCESSA_CUSTO_MEDIO=false
TRIER_PRODUTOS_TIMEOUT_MS=30000
```

Observacao:
- o script recebe o token puro e monta `Bearer ...` automaticamente

### Alpha 7

```env
PRODUTOS_SOURCE_MODE=alpha7
ALPHA7_DB_HOST=
ALPHA7_DB_PORT=5432
ALPHA7_DB_DATABASE=
ALPHA7_DB_USER=
ALPHA7_DB_PASSWORD=
ALPHA7_DB_SCHEMA=public
ALPHA7_PAGE_SIZE=100
```

Observacoes:
- esse modo consulta `schema.embalagem`
- a busca traz `codigobarras` como EAN e `descricao` como nome
- a pagina usa `limit/offset` internamente ate consumir toda a base

### Banco Unico

```env
BANCO_UNICO_BASE_URL=https://unicocontato.tech/banco-unico
BANCO_UNICO_AUTHORIZATION=
CLASSIFY_CONCURRENCY=5
PUBLISH_CONCURRENCY=1
EXISTING_CHECK_BATCH_SIZE=100
EXISTING_CHECK_CONCURRENCY=2
```

## Fluxo 1: normalizar arquivo local

Esse fluxo usa [src/index.js](C:/Users/Gabriel/Downloads/normalizador-farma-completo-v25/src/index.js).

Entrada padrao:
- `./src/data/catalogo-produtos.json`

Saida padrao:
- `./src/data/catalogo-normalizado.json`

Rodar:

```bash
npm run normalizar
```

Variaveis usadas nesse fluxo:

```env
ARQUIVO_ENTRADA=./src/data/catalogo-produtos.json
ARQUIVO_SAIDA=./src/data/catalogo-normalizado.json
```

O que ele faz:
1. le o arquivo de entrada
2. normaliza o nome
3. classifica na arvore mercadologica
4. grava o JSON final com alertas e status de revisao

Campos importantes do resultado:
- `nomeNormalizadoFinal`
- `departamento`
- `categoria`
- `subcategoria`
- `segmento`
- `subsegmento`
- `arvoreMercadologica`
- `classificacaoMercadologica`
- `alertas`
- `precisaRevisao`

## Fluxo 2: publicar no Banco Unico

Esse fluxo usa [src/publish-banco-unico.js](C:/Users/Gabriel/Downloads/normalizador-farma-completo-v25/src/publish-banco-unico.js).

Ele pode usar tres origens:
- `file`: um JSON local
- `api`: API paginada da Trier
- `alpha7`: banco Postgres do cliente no padrao Alpha 7

O fluxo completo e:
1. carregar produtos
2. validar EAN
3. consultar no Banco Unico quais EANs ja existem
4. normalizar nomes
5. classificar na arvore mercadologica
6. montar payload final
7. publicar em lotes
8. salvar progresso em JSON e cache

## Comandos mais usados

### 1. Publicar usando API Trier

```bash
npm run publish:banco-unico:api
```

### 2. Publicar usando API Trier e forcar IA na arvore

```bash
npm run publish:banco-unico:api -- --force-taxonomy-ai --force-reclassify
```

Use esse modo quando:
- a heuristica da arvore estiver errando
- voce quiser reprocessar classificacoes antigas do cache

### 3. Rodar sem publicar, apenas preparando JSON

```bash
npm run publish:banco-unico:api -- --classify-only
```

### 4. Rodar em dry-run

```bash
npm run publish:banco-unico:api -- --dry-run
```

Diferença:
- `--classify-only`: gera o JSON preparado e para
- `--dry-run`: processa tudo, mostra o resumo, mas nao publica

### 5. Rodar a partir de arquivo local

```bash
npm run publish:banco-unico -- --source=file --input=./src/data/catalogo-produtos-corrigido.json
```

### 6. Publicar usando Alpha 7

```bash
npm run publish:banco-unico:alpha7
```

### 7. Publicar usando Alpha 7 com credenciais na linha de comando

```bash
npm run publish:banco-unico -- --source=alpha7 --alpha7-host=HOST --alpha7-database=DATABASE --alpha7-user=USER --alpha7-password=SENHA --alpha7-schema=public
```

### 8. Processar apenas uma amostra

```bash
npm run publish:banco-unico:api -- --limit=100
```

### 9. Continuar a partir de um offset

```bash
npm run publish:banco-unico:api -- --offset=500 --limit=200
```

### 10. Desligar IA da clarificacao do nome, mas manter IA da arvore

```bash
npm run publish:banco-unico:api -- --disable-normalize-ai --force-taxonomy-ai
```

### 11. Rodar sem IA nenhuma

```bash
npm run publish:banco-unico:api -- --disable-ai --disable-normalize-ai
```

## Flags do script de publicacao

```bash
--input=PATH
--source=file|api|alpha7
--source-api-url=URL
--source-token=VAL
--source-page-size=N
--source-ativo=true|false
--source-integracao-ecommerce=true|false
--source-processa-custo-medio=true|false
--alpha7-host=VAL
--alpha7-port=N
--alpha7-database=VAL
--alpha7-user=VAL
--alpha7-password=VAL
--alpha7-schema=VAL
--taxonomy=PATH
--output=PATH
--cache=PATH
--limit=N
--offset=N
--batch-size=N
--classify-concurrency=N
--publish-concurrency=N
--existing-check-batch-size=N
--existing-check-concurrency=N
--base-url=URL
--authorization=VAL
--classify-only
--dry-run
--disable-normalize-ai
--disable-ai
--force-taxonomy-ai
--force-reclassify
--ignore-existing-check
--help
```

## O que cada flag importante faz

- `--batch-size`: tamanho do lote de subida
- `--classify-concurrency`: quantos produtos classificar em paralelo
- `--publish-concurrency`: quantos lotes subir em paralelo
- `--existing-check-batch-size`: tamanho do lote de consulta de EANs no Banco Unico
- `--existing-check-concurrency`: paralelismo da consulta de EANs
- `--force-reclassify`: ignora o cache salvo
- `--ignore-existing-check`: nao consulta o Banco Unico antes. Nao recomendado
- `--disable-ai`: desliga IA da classificacao mercadologica
- `--force-taxonomy-ai`: evita fechamento heuristico e tenta decidir a arvore pela IA

## Cache e arquivos gerados

Arquivos padrao:
- saida preparada: [src/data/catalogo-produtos-banco-unico.json](C:/Users/Gabriel/Downloads/normalizador-farma-completo-v25/src/data/catalogo-produtos-banco-unico.json)
- cache de classificacao: [src/data/catalogo-produtos-banco-unico.cache.json](C:/Users/Gabriel/Downloads/normalizador-farma-completo-v25/src/data/catalogo-produtos-banco-unico.cache.json)

O cache guarda o resultado da classificacao por chave:
- EAN
- nome normalizado
- principio ativo

Quando usar `--force-reclassify`:
- depois de mudar regra de normalizacao
- depois de mudar regra/IA da arvore
- quando quiser ignorar classificacoes antigas salvas

## Como funciona a arvore mercadologica

Resumo do fluxo:
1. o produto vira sinais de busca
2. a arvore em CSV e pontuada inteira
3. os melhores candidatos sao separados
4. a classificacao final pode vir de heuristica ou IA
5. se nao houver seguranca suficiente, o campo fica `null`

Com `MERCADOLOGICAL_FORCE_AI=true` ou `--force-taxonomy-ai`:
- a heuristica deixa de fechar sozinha
- a IA escolhe entre os candidatos da arvore
- se a IA nao atingir a confianca minima, o produto fica sem arvore

Importante:
- a IA nao inventa categoria fora da arvore
- ela escolhe apenas entre os candidatos ranqueados

## Como funciona a publicacao no Banco Unico

O payload enviado fica neste formato:

```json
{
  "descricaoProduto": "nome normalizado",
  "ean": "7891234567890",
  "principioAtivo": "principio ativo",
  "fabricante": "fabricante",
  "departamento": "departamento",
  "categoria": "categoria",
  "subcategoria": "subcategoria",
  "segmento": "segmento",
  "subsegmento": "subsegmento"
}
```

Regras importantes:
- so publica se o EAN for valido
- so publica se o EAN ainda nao existir no Banco Unico
- so publica se a arvore estiver completa

## Resumo do JSON de saida

O JSON final salvo pelo fluxo de publicacao inclui:
- `summary`
- `products`: produtos preparados e classificados
- `skipped`: pulados por falta de arvore ou outra condicao
- `invalidEans`: EAN invalido
- `skippedExisting`: EANs ja existentes no Banco Unico
- `errors`: erros de classificacao/normalizacao
- `publishErrors`: falhas na subida

## Validar a arvore do resultado

```bash
npm run validar:arvore -- ./src/data/catalogo-normalizado.json
```

Para falhar se houver qualquer item sem arvore:

```bash
npm run validar:arvore -- ./src/data/catalogo-normalizado.json --strict
```

## Receitas prontas

### Subir cliente Trier hoje com IA na arvore

```bash
npm run publish:banco-unico:api -- --force-taxonomy-ai --force-reclassify
```

### Testar apenas 100 produtos

```bash
npm run publish:banco-unico:api -- --force-taxonomy-ai --force-reclassify --limit=100
```

### Gerar JSON para revisar antes da subida

```bash
npm run publish:banco-unico:api -- --force-taxonomy-ai --force-reclassify --classify-only
```

### Rodar usando um arquivo local ja preparado

```bash
npm run publish:banco-unico -- --source=file --input=./src/data/catalogo-produtos-corrigido.json --force-taxonomy-ai --force-reclassify
```

## Diagnostico rapido

### O script nao classificou nada na arvore

Verifique:
- se o CSV existe no caminho de `MERCADOLOGICAL_TREE_CSV_PATH`
- se `CLASSIFICAR_MERCADOLOGIA=true`
- se `MERCADOLOGICAL_DISABLE_AI` nao esta bloqueando a IA quando voce quer forcar IA

### O script esta reaproveitando classificacao antiga

Use:

```bash
--force-reclassify
```

### O script nao publica nada

Verifique:
- se os produtos ficaram em `skippedExisting`
- se ficaram sem arvore completa
- se houve erro em `publishErrors`
- se voce rodou com `--classify-only` ou `--dry-run`

### O script chama IA demais

Opcoes:
- `USAR_IA=false` para desligar clarificacao do nome
- manter apenas `--force-taxonomy-ai` se o foco for arvore
- usar `--limit` para amostras menores

## Observacao importante

Para o seu caso atual, o modo mais seguro e:

```bash
npm run publish:banco-unico:api -- --force-taxonomy-ai --force-reclassify
```

Porque ele:
- consulta produtos direto da Trier
- ignora cache heuristico antigo
- passa a classificacao mercadologica pela IA
- publica apenas EANs novos com arvore completa
