function limpar(texto) {
  return String(texto || "").replace(/\s+/g, " ").trim();
}

const EXACT_NAME_OVERRIDES = new Map([
  ["3014260318321", "Escova Dental Oral-B Advantage Artica Macia 35 1 Unidade"],
  ["3014260318345", "Escova Dental Oral-B Advantage Artica Macia 1 Unidade"],
  ["353885003315", "Monitor de Glicemia One Touch Ultra Mini Kit 1 Unidade"],
  ["7896000650757", "Escova Dental Kuka Massageador Silicone Transparente 1 Unidade"],
  ["4005808803132", "Hidratante Nivea Body Lotion Express 200 mL"],
  ["7506195131640", "Creme Dental Oral-B Complete Limpeza Profunda 70 g"],
  ["7896075709343", "Espatula de Cuticula Rosa Merheje Basic"],
  ["7899026419025", "Esmalte Colorama Nutri Base Pro Fortalecimento 8 mL"],
  ["7896512941923", "Sabonete Liquido Granado Bebe Camomila 250 mL"],
  ["7891040029556", "Protetor Ocular Nexcare Infantil 20 Unidades"],
  ["7501065922755", "Absorvente Always Ultrafino Seca com Abas 8 Unidades"],
  ["7896007540624", "Absorvente Intimus Tripla Protecao Seca sem Abas 8 Unidades"],
  ["7891528045504", "Creme Dental Sorriso Tripla Refrescancia 90 g"],
  ["7898008554068", "Sabonete Liquido Folha Nativa Lavanda de Provence 500 mL"],
  ["7896540789412", "Estetoscopio Rappaport Preto ER100"],
  ["7898587764971", "Creme de Tratamento Elseve Reparacao Total 5 Extra Profundo 300 g"],
  ["7891182016810", "Tintura Soft Color 366 Bordeaux Profundo"],
  ["7899468504778", "Multifibras Pro Sabor Natural 500 g"],
  ["7898934930028", "Escova Dental Green Galaxy Adulto Media"],
  ["7898934930103", "Escova Dental Green Splash Adulto Macia 1 Unidade"],
  ["7896094999329", "Vitasay Imune D Tripla Acao 10 Comprimidos"],
  ["7899706197649", "Shampoo Elseve Cachos dos Sonhos 400 mL"],
  ["7896314708236", "Saco para Lixo Bag Roll 100 Litros Preto 25 Unidades"],
  ["7897424089451", "Marcador Pincel Atomico Pilot 1100-M Preto"],
  ["7898934930899", "Escova Dental Green Enjoy Adulto Macia 1 Unidade"],
  ["7898934930165", "Escova Dental Green Cool Adulto Macia 1 Unidade"],
  ["7896020680413", "Copo Termico Mor Preto 360 mL"],
  ["7896637022736", "Azulfin 500 mg 30 Comprimidos Revestidos"],
  ["7898157722707", "Equipo Macro com Injetor Lateral 1 Unidade"],
  ["7898184183885", "Protetor de Mamilo Fly Silicone"],
  ["7898157726767", "Scalp Labor Import 23G 1 Unidade"],
  ["7898075311526", "Magnazia Suspensao Oral 240 mL"],
  ["7898422491024", "Shampoo Natura Ekos Castanha Refil"],
  ["7896641800757", "Eparema 12 Flaconetes 10 mL"],
  ["7896096907605", "Removedor de Esmalte Oleo de Banana Maru 40 mL"],
  ["7898008550374", "Condicionador Folha Nativa Ceramidas 1,99 L"],
  ["7898162880003", "Fralda Sapeka P 10 Unidades"],
  ["7891024027134", "Kit Creme Dental Sorriso Dentes Brancos Leve 15 Pague 12 90 g"],
  ["7891055325834", "Escova Dental Condor Antibac Maxil Extra Macia"],
  ["7891055325803", "Escova Dental Condor Antibac Maxil Macia"],
  ["7891055325810", "Escova Dental Condor Antibac Maxil Media"],
  ["3360372058861", "Giorgio Armani Acqua Di Gio Eau de Toilette 50 mL"],
  ["7894164001187", "Fluxoliv 100 mg 45 Comprimidos"],
  ["7896641805653", "Neosaldina 4 Drageas"],
  ["7896714215426", "Magnostase 2 mg 4 Comprimidos"],
  ["7896360000957", "Rubralong 30 Comprimidos"],
  ["8411061607169", "Carolina Herrera CH Eau de Toilette 50 mL"],
  ["7897517930103", "Dosador de Acetona Vertix 180 mL"],
  ["7898916841779", "Ampola Capilar Relvazon Ceramidas 10 mL"],
  ["7898916841731", "Ampola Capilar Relvazon Vitamina E 10 mL"],
  ["7898142861701", "Chocolate ao Leite com Cereal Crocante Tortuguita 100 g"],
  ["7895296278010", "Onimorf 50 mg/mL Esmalte 2,5 mL + 10 Espatulas + 30 Lixas + 30 Compressas"]
]);

function protegerPontosNumericos(texto) {
  return texto.replace(/(\d)\.(\d)/g, "$1__PONTO__$2");
}

function restaurarPontosNumericos(texto) {
  return texto.replace(/__PONTO__/g, ".");
}

function titleCase(texto) {
  const manter = new Set(["mg", "mL", "mg/mL", "mg/g", "mcg", "g", "kg", "UI", "MFP", "A.I.", "OX"]);
  const minusculas = new Set(["de", "do", "da", "dos", "das", "e", "com", "para"]);

  return limpar(texto)
    .split(" ")
    .map((p, i) => {
      if (manter.has(p)) return p;
      if (/^\d/.test(p)) return p;
      if (p.includes("/") || p.includes("+")) return p;
      const lower = p.toLowerCase();
      if (i > 0 && minusculas.has(lower)) return lower;
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/\bMl\b/g, "mL")
    .replace(/\bMg\b/g, "mg")
    .replace(/\bMcg\b/g, "mcg")
    .replace(/\bKg\b/g, "kg")
    .replace(/\bG\b/g, "g")
    .replace(/\bAçucar\b/g, "Açúcar")
    .replace(/\bAcucar\b/g, "Açúcar")
    .replace(/\bRapida\b/g, "Rápida")
    .replace(/\bForca\b/g, "Força")
    .replace(/\bSensivel\b/g, "Sensível")
    .replace(/\bRecarregavel\b/g, "Recarregável")
    .replace(/\bLiquido\b/g, "Líquido")
    .replace(/\bSodico\b/g, "Sódico")
    .replace(/\bDermatologico\b/g, "Dermatológico")
    .replace(/\bDermatologica\b/g, "Dermatológica")
    .replace(/\bDrageas\b/g, "Drágeas")
    .replace(/\bCapsulas\b/g, "Cápsulas")
    .replace(/\bCapsula\b/g, "Cápsula")
    .replace(/\bPessego\b/g, "Pêssego")
    .replace(/\bMaca\b/g, "Maçã")
    .replace(/\bPiui\b/g, "Piuí")
    .replace(/\bImedia\b/g, "Imédia");
}

function contextoSuplemento(original) {
  const t = String(original || "").toUpperCase();
  if (/\b(CR|CRE|MASC)\.?\s*CAP\b/.test(t)) return false;
  return ["WHEY", "SH.MASS", "MASS SH", "MALTODEXTRIN", "BARRA PROT", "BAD BOY", "BEST WHEY", "NUTRI WHEY", "TOP WHEY"].some(p => t.includes(p));
}

function contextoFralda(original) {
  const t = String(original || '').toUpperCase();
  const comecaComoFralda = /^(FR|FD|FDR)[.\s]/.test(t) || /\b(FR|FD|FDR)\b/.test(t) || t.startsWith('FD.') || t.startsWith('FDR.');
  if (!comecaComoFralda) return false;

  return [
    'HUGGIES', 'PAMPERS', 'SMILINGUIDO', 'VIC BABY', 'CLASSIC BABY',
    'DIGUIFRAL', 'ANJINHOS', 'BIGFRAL', 'BIOFRAL', 'BABYSEC',
    'BEBE FELIZ', 'BEBÊ FELIZ', 'POM POM', 'POMPOM', 'TENA', 'MILI',
    'MAMY POKO', 'MAMYPOKO', 'SAPEKA', 'PERSONAL BABY', 'CAPRICHO BABY',
    'CREMER BABY', 'NATURAL BABY', 'TURMA DA MONICA', 'JUMBINHO',
    'BABY', 'FD.INF', 'GERIATR', 'GERI'
  ].some((p) => t.includes(p));
}

function normalizarUnidadesEQuantidades(texto) {
  let s = texto;

  // Dosagem composta com três números e unidade final: 300+35+50MG
  s = s.replace(/(\d+(?:,\d+)?)\+(\d+(?:,\d+)?)\+(\d+(?:,\d+)?)\s*MG\b/gi, '$1 mg + $2 mg + $3 mg');

  // Dosagem composta com segunda parte em concentração: 3MG+3MG/ML
  s = s.replace(/(\d+(?:,\d+)?)MG\+(\d+(?:,\d+)?)\s*MG\/ML\b/gi, '$1 mg + $2 mg/mL');

  // Dosagem composta com unidades nos dois lados: 1MG+0,250MG
  s = s.replace(/(\d+(?:,\d+)?)(MG|MCG|G|ML|UI)\+(\d+(?:,\d+)?)(MG|MCG|G|ML|UI)/gi, (_, a, ua, b, ub) => {
    const mapa = { MG: "mg", MCG: "mcg", G: "g", ML: "mL", UI: "UI" };
    return `${a} ${mapa[ua.toUpperCase()]} + ${b} ${mapa[ub.toUpperCase()]}`;
  });

  // Dosagem composta com unidade implícita: 500+125MG
  s = s.replace(/(\d+(?:,\d+)?)\+(\d+(?:,\d+)?)(MG|MCG|G|ML|UI)/gi, (_, a, b, u) => {
    const mapa = { MG: "mg", MCG: "mcg", G: "g", ML: "mL", UI: "UI" };
    const unidade = mapa[u.toUpperCase()];
    return `${a} ${unidade} + ${b} ${unidade}`;
  });

  s = s
    .replace(/(\d+(?:,\d+)?)MG\/ML/gi, "$1 mg/mL")
    .replace(/(\d+(?:,\d+)?)MG\/G/gi, "$1 mg/g")
    .replace(/C\/(\d+(?:,\d+)?)\s*ML\b/gi, "$1 mL")
    .replace(/C\/(\d+(?:,\d+)?)\s*KG\b/gi, "$1 kg")
    .replace(/C\/(\d+(?:,\d+)?)\s*GR\b/gi, "$1 g")
    .replace(/C\/(\d+(?:,\d+)?)\s*G\b/gi, "$1 g")
    .replace(/C\/(\d+(?:,\d+)?)\s*MG\b/gi, "$1 mg")
    .replace(/C\/(\d+(?:,\d+)?)\s*MCG\b/gi, "$1 mcg")
    .replace(/(\d+(?:,\d+)?)MG\b/gi, "$1 mg")
    .replace(/(\d+(?:,\d+)?)MCG\b/gi, "$1 mcg")
    .replace(/(\d+(?:,\d+)?)ML\b/gi, "$1 mL")
    .replace(/(\d+(?:,\d+)?)KG\b/gi, "$1 kg")
    .replace(/(\d+(?:,\d+)?)GR\b/gi, "$1 g")
    .replace(/(\d+(?:,\d+)?)G\b/g, "$1 g")
    .replace(/(\d+(?:,\d+)?)K\b/gi, "$1 kg")
    .replace(/\b(\d+)\s*FPS\b/gi, "FPS $1")
    .replace(/\bFPS\s*(\d+)\b/gi, "FPS $1")
    .replace(/\b(\d+)CPR?\b/gi, "$1 Comprimidos")
    .replace(/\b(\d+)COMP\b/gi, "$1 Comprimidos")
    .replace(/\b(\d+)CAPS?\b/gi, "$1 Cápsulas")
    .replace(/\b(\d+)DRG\b|\b(\d+)DR\b/gi, (_, a, b) => `${a || b} Drágeas`)
    .replace(/\b(\d+)DOS\b/gi, "$1 Doses")
    .replace(/\b(\d+)UN\b/gi, "$1 Unidades")
    .replace(/C\/(\d+)\+(\d+)/gi, "$1 + $2 Unidades")
    .replace(/C\/(\d+)/gi, "$1 Unidades")
    .replace(/S\/AB/gi, "Sem Abas")
    .replace(/C\/AB/gi, "Com Abas")
    .replace(/C\/REF/gi, "Com Reforço")
    .replace(/C\/SUP/gi, "Com Suporte")
    .replace(/P\/MAQUIAG/gi, "Para Maquiagem")
    .replace(/P\//gi, "Para ");

  return s;
}

function aplicarContextos(entrada) {
  const registro = typeof entrada === "object" && entrada !== null ? entrada : null;
  const textoOriginal = registro ? (registro.nome || registro.nomeOriginal || "") : entrada;
  const original = String(textoOriginal || "").toUpperCase();
  const grupoOrigem = String(registro?.produtoOrigem?.nomeGrupo || "");
  const ehFarmaco = /\b(ETICOS|SIMILAR|GENERICO|GENERICO)\b/i.test(grupoOrigem) || Boolean(registro?.nomePrincipioAtivo);
  let s = protegerPontosNumericos(original);

  // ponto vira separador, mas códigos tipo 8.3 ficam preservados
  s = s.replace(/[.]+/g, " ");
  s = restaurarPontosNumericos(s);

  if (contextoSuplemento(original)) {
    s = s
      .replace(/SH\s*MASS/gi, "Shake Mass")
      .replace(/MASS\s*SH/gi, "Mass Shake")
      .replace(/\bSH\b/gi, "Shake")
      .replace(/\bPROT\b/gi, "Protein")
      .replace(/\bPO\b/gi, "Pó")
      .replace(/\bBAU\b|\bBAUN\b|\bBAUNIL\b/gi, "Baunilha")
      .replace(/\bCHOC\b/gi, "Chocolate")
      .replace(/\bMOR\b|\bMORANG\b/gi, "Morango")
      .replace(/\bPESS\b/gi, "Pêssego")
      .replace(/BAN\/MA/gi, "Banana/Maçã")
      .replace(/\bBAN\b/gi, "Banana")
      .replace(/\bBAD BO\b|\bBAD BOY\b/gi, "Bad Boy")
      .replace(/\bATLHETIC\b|\bATLHET\b|\bATL\b/gi, "Atlhetica")
      .replace(/\bMALTODEXTRIN\b/gi, "Maltodextrina")
      .replace(/COOK&CR|CO\/CR/gi, "Cookies & Cream")
      .replace(/DOC LEIT/gi, "Doce de Leite")
      .replace(/\b(300|450|500|800|850|900|907|930)\b(?!\s*(g|mL|kg))/gi, "$1 g");
  }

  // Categorias e contextos gerais
  s = s
    .replace(/\bABS\b/gi, "Absorvente")
    .replace(/\bSH\b/gi, "Shampoo")
    .replace(/\bCOND\b/gi, "Condicionador")
    .replace(/\bSAB LIQ\b/gi, "Sabonete Líquido")
    .replace(/\bSAB\b/gi, "Sabonete")
    .replace(/\bDESOD\b|\bDES\b/gi, "Desodorante")
    .replace(/\bCR DENT\b/gi, "Creme Dental")
    .replace(/\bCR D\b|\bCRD\b/gi, "Creme Dental")
    .replace(/\bCR\b|\bCRE\b/gi, "Creme")
    .replace(/\bLOC\b/gi, "Loção")
    .replace(/\bENX BUC\b/gi, "Enxaguante Bucal")
    .replace(/\bESC DENT\b|\bESC D\b/gi, "Escova Dental")
    .replace(/\bCURAT\b|\bCUR\b/gi, "Curativo")
    .replace(/\bLENCOS\b/gi, "Lenços")
    .replace(/\bLENC\b/gi, "Lenço")
    .replace(/\bUMED\b|\bUME\b/gi, "Umedecidos")
    .replace(/\bTIN\b|\bTINT\b/gi, "Tintura")
    .replace(/\bALIS\b/gi, "Alisante")
    .replace(/\bDESCOL\b/gi, "Descolorante")
    .replace(/\bPOM DERM\b/gi, "Pomada Dermatológica")
    .replace(/\bPOM\b/gi, "Pomada")
    .replace(/\bCR DERM\b/gi, "Creme Dermatológico")
    .replace(/\bSPR\b/gi, "Spray")
    .replace(/\bGTS\b/gi, "Gotas")
    .replace(/\bXPE\b/gi, "Xarope")
    .replace(/\bSUSP\b/gi, "Suspensão")
    .replace(/\bGE\b/gi, "Genérico");

  // Marcas/linhas e abreviações contextuais recorrentes
  s = s
    .replace(/\bGILL\b|\bGIL\b/gi, "Gillette")
    .replace(/\bJOHNSONS\b/gi, "Johnson's")
    .replace(/\bMUND\b/gi, "Mundial")
    .replace(/\bCOLG\b/gi, "Colgate")
    .replace(/\bPALM\b/gi, "Palmolive")
    .replace(/\bPHYTOERV\b/gi, "Phytoervas")
    .replace(/\bPROMI\b|\bPROMIL\b/gi, "Promillus")
    .replace(/\bSORR\b/gi, "Sorriso")
    .replace(/\bFRESHM\b/gi, "Fresh Mint")
    .replace(/\bLV\b/gi, "Leve")
    .replace(/\bEXT\b/gi, "Extrato")
    .replace(/\bALG\b/gi, "Algas")
    .replace(/\bADOC\b/gi, "Adoçante")
    .replace(/\bCULINARIO\b/gi, "Culinário")
    .replace(/\bBOMB\b/gi, "Bomba")
    .replace(/\bTIRA LEITE\b/gi, "Tira-Leite")
    .replace(/\bCURV\b/gi, "Curva")
    .replace(/\bFIN\b/gi, "Fina")
    .replace(/\bRET\b/gi, "Reta")
    .replace(/\bNEOP\b/gi, "Neoprene")
    .replace(/\bMAC\b/gi, "Macia")
    .replace(/\bBAND AID\b/gi, "Band-Aid")
    .replace(/\bSIL\b/gi, "Silicone")
    .replace(/\bLAV\b/gi, "Lavável")
    .replace(/\bFUR\b/gi, "Furos")
    .replace(/\bSOD\b/gi, "Sódico")
    .replace(/\bCLOR\b/gi, "Cloridrato de")
    .replace(/\bFISIOGEL A I\b/gi, "Fisiogel A.I.")
    .replace(/\bALIV CALM\b/gi, "Alívio Calmante")
    .replace(/\bCETOC\+BETAM\b/gi, "Cetoconazol + Betametasona")
    .replace(/\bBETAM\+GENT\b/gi, "Betametasona + Gentamicina")
    .replace(/\bG DOUR\b/gi, "Gota Dourada")
    .replace(/\bPROT LEITE\b/gi, "Proteínas do Leite")
    .replace(/\bTR CHOQUE\b/gi, "Tratamento de Choque")
    .replace(/\bCAB SECO\b/gi, "Cabelos Secos")
    .replace(/\bCAB COLO\b/gi, "Cabelos Coloridos")
    .replace(/\bLONG STR\b/gi, "Long & Strong")
    .replace(/\bPROT MAMILO\b/gi, "Protetor de Mamilo")
    .replace(/\bPROT SEIOS\b/gi, "Protetor de Seios")
    .replace(/\bFIOR\b/gi, "Fiorucci")
    .replace(/\bAE\b/gi, "Aerossol")
    .replace(/\bECHA\b/gi, "Echarpe")
    .replace(/\bIMEDIA\b/gi, "Imédia")
    .replace(/\bALIC CUT\b/gi, "Alicate Cutícula")
    .replace(/\bINTERCAMB\b/gi, "Intercambiável");

  // Alguns contextos que dependem da frase inteira
  if (original.includes("BARRA CER")) s = s.replace(/BARRA CER/gi, "Barra de Cereal").replace(/\bCERAMIDAS\b/gi, "Cereal");
  if (original.includes("PROTEX") && /\bREF\b/.test(original)) s = s.replace(/\bREF\b|\bREFORÇO\b/gi, "Refil");
  if (original.includes("SAB PROTEX COMP 12")) s = s.replace(/COMP 12|COMPRIMIDO 12/gi, "Complete 12");
  if (/\b(CR|CRE|MASC)\s*CAP\b/.test(original)) s = s.replace(/\bCAP\b/gi, "Capilar").replace(/\bCÁPSULA\b/gi, "Capilar");
  if (original.includes("JOELHEIRA") || original.includes("NEOP")) {
    s = s
      .replace(/\bPAT\b/gi, "Patelar")
      .replace(/\bPATELAR\b/gi, "Patelar");
  }
  if (original.includes("ESC.D") && /40\s*G\s*MAC/.test(original)) s = s.replace(/40\s*g\s*Macia/gi, "40 Grande Macia");
  if (original.startsWith("COL.")) s = s.replace(/^COL\b/gi, "Colônia").replace(/\bPIUI\b/gi, "Piuí");
  if (original.startsWith("MAM KUKA")) s = s.replace(/\bRED\b/gi, "Redonda").replace(/\bCOL\b/gi, "Colorida").replace(/\bPL\b/gi, "Plástico");
  if (original.includes("PALM.NATURALS")) s = s.replace(/\bSECO\b/gi, "Cabelos Secos");

  if (/\bPALMOLIVE\b/i.test(original) && /\bILUM PR\b/i.test(original)) {
    s = s
      .replace(/\bNAT\b/gi, "Naturals")
      .replace(/\bILUM\s+PR\b/gi, "Iluminador Pretos");
  }

  if (ehFarmaco || /\b(?:XPE|XP|SOL|SUSP|GTS|SUP|CPR|CP|CPS|DRG|ENV|FLAC|FLACONETES)\b|\d+(?:,\d+)?(?:MG|ML|G)\b/i.test(original)) {
    s = s
      .replace(/\bXP\b/gi, "Xarope")
      .replace(/\bSOL\s+EXP\b/gi, "Solucao Expectorante")
      .replace(/\bXarope\s+EXP\s+ADT\b/gi, "Xarope Expectorante Adulto")
      .replace(/\bXarope\s+EXP\s+PED\b/gi, "Xarope Expectorante Pediatrico")
      .replace(/\bEXP\s+ADT\b/gi, "Expectorante Adulto")
      .replace(/\bEXP\s+INF\b/gi, "Expectorante Infantil")
      .replace(/\bEXP\s+PED\b/gi, "Expectorante Pediatrico")
      .replace(/\bADT\b/gi, "Adulto")
      .replace(/\bPED\b/gi, "Pediatrico")
      .replace(/\bINF\b/gi, "Infantil");
  }

  if (/\bLUBR/i.test(original) && /\bINTIM\b/i.test(original)) {
    s = s.replace(/\bINTIM\b/gi, "Intimo");
  }

  if (/\bSULFADIAZINA\b/i.test(original) && /\bPR\s+10MG\/G\b/i.test(original)) {
    s = s.replace(/\bPR\b/gi, "Prata");
  }

  if (/\bTRESEMME\b/i.test(original) && /\bHID PR\b/i.test(original)) {
    s = s.replace(/\bHID\s+PR\b/gi, "Hidratacao Profunda");
  }

  if (/\bBIO EXTRAT|HASKELL|SFERA|DOVE\b/i.test(original) && /\bPOS (?:PR|PROG)\b/i.test(original)) {
    s = s.replace(/\bPOS\s+(?:PR|PROG)\b/gi, "Pos Progressiva");
  }

  if (/\bHASKELL\b/i.test(original) && /\bPOS PROGR(?:ES)?\b/i.test(original)) {
    s = s.replace(/\bPOS\s+PROGR(?:ES)?\b/gi, "Pos Progressiva");
  }

  if (/\bORAL-B\b/i.test(original) && /\bT12 PR\b/i.test(original)) {
    s = s.replace(/\bT12\s+PR\b/gi, "Total 12 Pro-Saude");
  }

  if (/\bCOLGATE\b/i.test(original) && /\bT12 PR\b/i.test(original)) {
    s = s.replace(/\bT12\s+PR\b/gi, "Total 12 Pro-Saude");
  }

  if (/\bCEPACOL\b/i.test(original) && /\bPL ADV\b/i.test(original)) {
    s = s.replace(/\bPL\s+ADV\b/gi, "Plus Advanced");
  }

  if (/\bLISTERINE\b/i.test(original) && /\bWH PR\b/i.test(original)) {
    s = s.replace(/\bWH\s+PR\b/gi, "Whitening Pre-Escovacao");
  }

  if (/^\s*PR\b/i.test(original) && /\bJONTEX\b/i.test(original)) {
    s = s.replace(/^\s*PR\b/gi, "Preservativo");
  }

  if (/^\s*SB\b/i.test(original) && /\b(?:PROTEX|GRANADO)\b/i.test(original)) {
    s = s.replace(/^\s*SB\b/gi, "Sabonete");
  }

  if (/\bLIQ BEBE\b/i.test(original) && /\bGRANADO\b/i.test(original)) {
    s = s.replace(/\bLIQ\s+BEBE\b/gi, "Liquido Bebe");
  }

  if (/\bACTIVE\b|\bLOREAL\b|\bPAYOT\b|\bNUPILL\b|\bREVITALIFT\b|\bTENYS\b/i.test(original) && /\bANTIR\b/i.test(original)) {
    s = s.replace(/\bANTIR\b/gi, "Antirrugas");
  }




  if (contextoFralda(original)) {
    // Protege marcas antes de aliases genéricos: POM POM não é Pomada Pomada.
    s = s
      .replace(/\bPOM\s+POM\b/gi, 'Pom Pom')
      .replace(/\bPOMPOM\b/gi, 'Pom Pom')
      .replace(/^\s*FDR\b[.\s]*/gi, 'Fralda ')
      .replace(/^\s*FD\b[.\s]*/gi, 'Fralda ')
      .replace(/^\s*FR\b[.\s]*/gi, 'Fralda ')
      .replace(/\bFR\b/gi, 'Fralda')
      .replace(/\b(\d+)PX(\d+)FD\b/gi, '$1 Pacotes x $2 Fraldas')
      .replace(/\b(\d+)FD\b/gi, '$1 Fraldas')
      .replace(/\b(\d+)\s+Fardo\b/gi, '$1 Fraldas')
      .replace(/^\s*Fardo\b/gi, 'Fralda')
      .replace(/^\s*Frasco\b/gi, 'Fralda')
      .replace(/\bPomada\s+Pomada\b/gi, 'Pom Pom')
      .replace(/\bSUP\s+SEC\b/gi, 'Supersec')
      .replace(/\bSuporte\s+Secagem\b/gi, 'Supersec')
      .replace(/\bTot\s+Conforto\b/gi, 'Total Confort')
      .replace(/\bTrip\s+Pr\b/gi, 'Tripla Proteção')
      .replace(/\bConforto\s+Notur\b/gi, 'Conforto Noturno')
      .replace(/\bDia\s+Noi\b/gi, 'Dia e Noite')
      .replace(/\bSUP\s+CAR\b/gi, 'Supreme Care')
      .replace(/\bSuporte\s+Car\b/gi, 'Supreme Care')
      .replace(/\bVeste\s+Facial\b/gi, 'Veste Fácil')
      .replace(/\bRoup\b/gi, 'Roupinha')
      .replace(/\bU\s+Secagem\b/gi, 'Ultra Sec')
      .replace(/\bJumbi\b/gi, 'Jumbo');
  }

  if (/\bALWAYS\b/i.test(original) && /\bSUP PR SEC\b/i.test(original)) {
    s = s.replace(/\bSUP\s+PR\s+SEC\b/gi, "Super Protecao Seca");
  }

  if (/\bALWAYS\b/i.test(original) && /\bSUP PR SUA\b/i.test(original)) {
    s = s.replace(/\bSUP\s+PR\s+SUA\b/gi, "Super Protecao Suave");
  }

  if (/^\s*ABS\b/i.test(original) && /\bALW\b/i.test(original)) {
    s = s.replace(/\bALW\b/gi, "Always");
  }

  if (/^\s*ABS\b/i.test(original) && /\bINTIM\b/i.test(original)) {
    s = s
      .replace(/\bINTIM\b/gi, "Intimus")
      .replace(/\bS\/A\b/gi, "Sem Abas")
      .replace(/\bC\/A\b/gi, "Com Abas");
  }

  if (/\bINTIM(?:US)?\b/i.test(original) && /\bTRI PR\b/i.test(original)) {
    s = s.replace(/\bTRI\s+PR\b/gi, "Tripla Protecao");
  }

  if (/\b(?:ALW|ALWAYS)\b/i.test(original) && /\bPROT TOTAL\b/i.test(original)) {
    s = s.replace(/\bPROT\s+TOTAL\b/gi, "Protecao Total");
  }

  if (/\b(?:SANCARE|NEXCARE|3M)\b/i.test(original) && /\bPROT OCULAR\b/i.test(original)) {
    s = s.replace(/\bPROT\s+OCULAR\b/gi, "Protetor Ocular");
  }

  if (/\bINTIMUS\b/i.test(original) && /\bPROT EX PR AB\b/i.test(original)) {
    s = s.replace(/\bPROT\s+EX\s+PR\s+AB\b/gi, "Extra Protecao Abas");
  }

  if (/\bHUGGIES\b/i.test(original) && /\bTRIP PR\b/i.test(original)) {
    s = s.replace(/\bTRIP\s+PR\b/gi, "Tripla Protecao");
  }

  if (/\bHUGGIES\b/i.test(original) && /\bTRI PR\b/i.test(original)) {
    s = s.replace(/\bTRI\s+PR\b/gi, "Tripla Protecao");
  }



  if (original.startsWith('ESM ') || original.startsWith('ESM.')) {
    s = s.replace(/^\s*ESM\b/gi, 'Esmalte');
  }

  if (original.startsWith('MASC CAP') || original.includes(' MASC CAP ')) {
    s = s
      .replace(/^\s*MASC\s+CAP\b/gi, 'Máscara Capilar')
      .replace(/\bMasc\s+Capilar\b/gi, 'Máscara Capilar');
  }

  if (original.startsWith('CR PENT') || original.includes(' CR PENT ')) {
    s = s
      .replace(/^\s*CR\s+PENT\b/gi, 'Creme para Pentear')
      .replace(/\bCreme\s+Pent\b/gi, 'Creme para Pentear')
      .replace(/\bCreme\s+Pentear\b/gi, 'Creme para Pentear');
  }

  if (original.includes('MARU') && (original.includes('BAS CAS CAV') || original.includes('BAS.CAS.CAV'))) {
    s = s
      .replace(/\bBAS\b/gi, 'Base')
      .replace(/\bCAS\s+CAV\b/gi, 'Casco de Cavalo')
      .replace(/\bCastanho\s+Cav\b/gi, 'Casco de Cavalo');
  }

  if (original.includes('SFERA') && original.includes('DESM FIOS')) {
    s = s
      .replace(/\bDesm\s+Fios\b/gi, 'Desmaia Fios')
      .replace(/\bMascara\s+Capsula\b/gi, 'Máscara Capilar')
      .replace(/\bMáscara\s+Cápsula\b/gi, 'Máscara Capilar')
      .replace(/\bCreme\s+Pentear\b/gi, 'Creme para Pentear');
  }

  if (original.startsWith('TERM.CLIN') || original.startsWith('TERM CLIN')) {
    s = s
      .replace(/^\s*Term\s+Clin\b/gi, 'Termômetro Clínico')
      .replace(/\bBd\b/g, 'BD');
  }

  if (original.startsWith('DILTOR CD')) {
    s = s.replace(/\bCd\b/g, 'CD');
  }

  if (original.startsWith('POLIPRED COL')) {
    s = s.replace(/\bCol\b/gi, 'Colírio');
  }



  if (original.includes('JOAO&MAR') || original.includes('JOAO MAR')) {
    s = s
      .replace(/\bJoao\s+E\s+Mar\b/gi, 'João e Maria')
      .replace(/\bJOAO\s+MAR\b/gi, 'João e Maria')
      .replace(/\bGlic\b/gi, 'Glicerina');
  }

  if (original.includes('TIO NACHO') && original.includes('ANTIC')) {
    s = s.replace(/\bAntic\b/gi, 'Antiqueda');
  }

  if (original.startsWith('AP NEB') || original.includes(' G-TECH INAL')) {
    s = s
      .replace(/^\s*Ap\s+Neb\b/gi, 'Aparelho Nebulizador')
      .replace(/\bG\s+Tech\b/gi, 'G-Tech')
      .replace(/\bInal\b/gi, 'Inalador');
  }

  if (original.includes('GARNIER') && original.includes('HIAL PREEN')) {
    s = s
      .replace(/\bHial\s+Preen\b/gi, 'Hialurônico Preenchedor')
      .replace(/\bHID\s+FAC\b/gi, 'Hidratante Facial');
  }

  if (original.includes('ESM COLOR CINT')) {
    s = s
      .replace(/\bColor\b/gi, 'Colorama')
      .replace(/\bCint\b/gi, 'Cintilante');
  }

  if (original.includes('URNA ACRILICO')) {
    s = s
      .replace(/\bAcrilico\b/gi, 'Acrílica')
      .replace(/\bCaixa\s+Su\b/gi, 'Caixa Sugestão');
  }

  if (original.includes('NOSEWASH')) {
    s = s
      .replace(/\bNosewash\b/gi, 'NoseWash')
      .replace(/\bLavavel\s+Hel\b/gi, 'Lavagem Nasal')
      .replace(/\bLav\s+Hel\b/gi, 'Lavagem Nasal');
  }

  if (/\bR-ON\b/i.test(original)) {
    s = s.replace(/\bR-ON\b/gi, 'Roll-on');
  }

  if (/\bCONTOURE\b/i.test(original) && /\bR-ON\b/i.test(original)) {
    s = s
      .replace(/\bCLASSIFR\b/gi, 'Classic Fresh')
      .replace(/\bBOUQUETFR\b/gi, 'Bouquet Fresh')
      .replace(/\bLAVANDAFR\b/gi, 'Lavanda Fresh');
  }

  if (original.includes('DOVE')) {
    s = s
      .replace(/\bAcn\s+Con\b/gi, 'Acne Control')
      .replace(/\bGl\s+Fer\b/gi, 'GL + FER')
      .replace(/\bGL\s+FER\b/gi, 'GL + FER');
  }

  if (/\bGO FR\b/i.test(original) && /\bDOVE\b/i.test(original)) {
    s = s
      .replace(/\bGO\s+FR\b/gi, 'Go Fresh')
      .replace(/\bRO\/VE\b/gi, 'Roma e Verbena')
      .replace(/\bROM\s+VERB\b/gi, 'Roma e Verbena');
  }


  if (original.startsWith('OLEO CAP') || original.includes(' OLEO CAP ')) {
    s = s
      .replace(/Oleo\s+Cap/gi, 'Óleo Capilar')
      .replace(/Óleo\s+Cap/gi, 'Óleo Capilar');
  }

  if (original.includes('DOCTOR DUCK')) {
    s = s
      .replace(/\bInf\b/gi, 'Infantil')
      .replace(/\bINF\b/gi, 'Infantil');
  }

  if (original.includes('PANTENE')) {
    s = s
      .replace(/\bCOR\s+RAD\b|\bCor\s+Rad\b/gi, 'Cor Radiante')
      .replace(/\bHIDRAT\b|\bHidrat\b/gi, 'Hidratação')
      .replace(/\bCUID\s+CLAS\b|\bCuid\s+Clas\b|\bCuid\s+Classico\b/gi, 'Cuidado Clássico')
      .replace(/\bCUID\s+CL\b|\bCuid\s+Cl\b/gi, 'Cuidado Clássico')
      .replace(/\bLIS\s+SEDOS\b|\bLis\s+Sedos\b|\bLiso\s+Sedos\b/gi, 'Liso e Sedoso')
      .replace(/\bCAC\s+DEFIN\b|\bCac\s+Defin\b|\bCachos\s+Defin\b/gi, 'Cachos Definidos')
      .replace(/\b2X1\b|\b2\s+X\s+1\b/gi, '2 em 1')
      .replace(/\bREST\s+PROFUNDA\b|\bRest\s+Profunda\b/gi, 'Restauração Profunda')
      .replace(/\bLIS\s+EXT\b|\bLis\s+Ext\b|\bLis\s+Extrato\b|\bLiso\s+Ext\b/gi, 'Liso Extremo');
  }

  if (/\bSILICON\b/i.test(original) && /\bSIL&/i.test(original)) {
    s = s
      .replace(/\bSIL&VIT\b/gi, 'Silicone e Vitamina')
      .replace(/\bSIL&TUTAN\b/gi, 'Silicone e Tutano')
      .replace(/\bSIL&COLAG\b/gi, 'Silicone e Colageno')
      .replace(/\bSIL&KARIT\b/gi, 'Silicone e Karite')
      .replace(/\bSIL&QUERA\b/gi, 'Silicone e Queratina')
      .replace(/\bSIL&SILIC\b/gi, 'Silicone e Silicone');
  }

  if (/\bSILICON PLANT\b/i.test(original)) {
    s = s
      .replace(/\bCUPUACU&PROT\b/gi, 'Cupuacu e Proteinas')
      .replace(/\bCUP&PROT\b/gi, 'Cupuacu e Proteinas')
      .replace(/\bPENTCUP&PROT\b/gi, 'Pentear Cupuacu e Proteinas');
  }

  if (/\bKUKA\b/i.test(original) && /\bMASS SIL\b/i.test(original)) {
    s = s
      .replace(/\bMASS\s+SIL\b/gi, 'Massageador Silicone')
      .replace(/\bSIL\s+TR\b/gi, 'Silicone Transparente');
  }

  if (/\bLILLO|NEW BABY|NEOPAN|MURANO\b/i.test(original) && /\bSIL\b/i.test(original)) {
    s = s
      .replace(/\bBICO\s+SIL\b/gi, 'Bico Silicone')
      .replace(/\bC\/BICO\s+SIL\b/gi, 'Com Bico Silicone')
      .replace(/\bDEC\s+SIL\b/gi, 'Decorada Silicone')
      .replace(/\bSIL\s+ORT\b/gi, 'Silicone Ortodontico')
      .replace(/\bORTO\s+SIL\b/gi, 'Ortodontico Silicone')
      .replace(/\bSIL\s+MASS\b/gi, 'Silicone Massageador');
  }

  if (original.includes('ALIC.CUT') || original.includes('ALIC CUT')) {
    s = s
      .replace(/\bAlicate\s+Cutícula\b/gi, 'Alicate de Cutícula')
      .replace(/\bCom\s+1\b/gi, '1 Unidade');
  }


  if (original.includes('MANT.KARITE') || original.includes('MANT KARITE') || original.includes('MANT.KAR') || original.includes('MANT KAR')) {
    s = s
      .replace(/\bMANT\s+KARITE\b/gi, 'Manteiga de Karité')
      .replace(/\bMANT\s+KAR\b/gi, 'Manteiga de Karité')
      .replace(/\bMant\s+Karite\b/gi, 'Manteiga de Karité')
      .replace(/\bMant\s+Kar\b/gi, 'Manteiga de Karité');
  }

  if (original.includes('KARITE')) {
    s = s.replace(/\bKARITE\b/gi, 'Karité').replace(/\bKarite\b/gi, 'Karité');
  }

  if (original.includes('MARU')) {
    s = s
      .replace(/\bTRAT\b/gi, 'Tratamento')
      .replace(/\bTrat\b/gi, 'Tratamento')
      .replace(/\bBAS\b/gi, 'Base')
      .replace(/\bBas\b/gi, 'Base')
      .replace(/\bEND\b/gi, 'Endurecedor')
      .replace(/\bEnd\b/gi, 'Endurecedor')
      .replace(/\bFOR\b/gi, 'Fortalecedora')
      .replace(/\bCas\s+Cav\b/gi, 'Casco de Cavalo')
      .replace(/\bCASTANHO\s+CAV\b/gi, 'Casco de Cavalo')
      .replace(/\bCastanho\s+Cav\b/gi, 'Casco de Cavalo')
      .replace(/\bCAS\b/gi, 'Casco')
      .replace(/\bCastanho\b/gi, 'Casco');
  }

  if (original.includes('G.DOUR') || original.includes('G DOUR')) {
    s = s
      .replace(/\bG\s+Dour\b/gi, 'Gota Dourada')
      .replace(/\bTR\s+Fruit\b/gi, 'Tropical Fruit')
      .replace(/\bTropic\s+Fruit\b/gi, 'Tropical Fruit')
      .replace(/\bCresp\b/gi, 'Crespos');
  }

  if (original.includes('PROT.LEITE') || original.includes('PROT LEITE')) {
    s = s.replace(/\bProt\s+Leite\b/gi, 'Proteínas do Leite');
  }

  if (original.startsWith('ROC ')) {
    s = s
      .replace(/\bROC\b/gi, 'RoC')
      .replace(/\bMINENSOL\b/gi, 'Minesol')
      .replace(/\bBLOQ\b/gi, 'Bloqueador')
      .replace(/\bFP(\d+)\b/gi, 'FPS $1')
      .replace(/\bFPS(\d+)\b/gi, 'FPS $1')
      .replace(/\bCR\b/gi, 'Creme')
      .replace(/\bRETIN OX\b/gi, 'Retin-OX')
      .replace(/\bA WRINKLE\b/gi, 'Anti-Wrinkle');
  }

  if (/^\s*PROT\b/i.test(original) || /\bPROT\s+SOL(?:AR)?\b/i.test(original) || /\b(?:MINESOL|NIVEA|SUNDOWN|EPISOL|ANASOL|FILTRUM|HELIODERM|SUNMAX|COPPERTONE|CENOURA|BRONZE|LOREAL PARIS SOLAR|RED APPLE|NEUTROGENA|LA ROCHE|NEOSTRATA|SUNLESS|AUSTRALIA|CICATRICURE)\b/i.test(original)) {
    s = s
      .replace(/\bPROT\s+SOL\b/gi, 'Protetor Solar')
      .replace(/\bPROT\s+SOLAR\b/gi, 'Protetor Solar')
      .replace(/\bPROT\b/gi, 'Protetor')
      .replace(/\bF(\d+)\b/gi, 'FPS $1')
      .replace(/\bFP(\d+)\b/gi, 'FPS $1')
      .replace(/\bPR&PI\b/gi, 'Praia e Piscina')
      .replace(/\bTQ\s+SEC\b/gi, 'Toque Seco')
      .replace(/\bINV\s+PR\s+SPR\b/gi, 'Invisible Spray')
      .replace(/\bINVIS\b/gi, 'Invisible')
      .replace(/\bINV\b/gi, 'Invisible')
      .replace(/\bP&H\b/gi, 'Protect & Hidrata')
      .replace(/\bP&B\b/gi, 'Protect & Bronze')
      .replace(/\bACT\s+UN\b/gi, 'Actif Unify')
      .replace(/\bLIG\s+FEEL\b/gi, 'Light Feeling')
      .replace(/\bOIL\s+CON\b/gi, 'Oil Control')
      .replace(/\bSEC\b/gi, 'Seco')
      .replace(/\bSPO\b/gi, 'Sport')
      .replace(/\bSENSIT\b/gi, 'Sensitive')
      .replace(/\bKID\b/gi, 'Kids')
      .replace(/\bWAT\b/gi, 'Water')
      .replace(/\bUL\s+SEC\b/gi, 'Ultra Seco')
      .replace(/\bFAC\b/gi, 'Facial')
      .replace(/\bPOS\s+SOL\b/gi, 'Pos Sol')
      .replace(/\bLOT\s+EXP(?:R)?\b/gi, 'Lotion Express');
  }

  if (/\bLOREAL\b/i.test(original) && /\bEXP\b/i.test(original)) {
    s = s
      .replace(/\bEXP\b/gi, 'Expertise')
      .replace(/\bAER\b/gi, 'Aerossol')
      .replace(/\bBB\s+C\b/gi, 'BB Cream');
  }

  if (/\bPANTENE|ELSEVE|MONANGE|TRESEMME|SALON|CAREFREE|INTIMUS|ALWAYS|GARNIER\b/i.test(original)) {
    s = s
      .replace(/\bPROT\b/gi, 'Protecao')
      .replace(/\bNAT\s+PROT\b/gi, 'Natural Protect')
      .replace(/\bBIO\s+PROT\b/gi, 'Bio Protect')
      .replace(/\bPROT\s+COR\b/gi, 'Protecao da Cor')
      .replace(/\bPROT\s+TERM(?:ICA)?\b/gi, 'Protecao Termica')
      .replace(/\bWH\s+PROT\b/gi, 'White Protect')
      .replace(/\bPROT\s+FRES\b/gi, 'Protecao Frescor')
      .replace(/\bEVOL\s+PROT\b/gi, 'Evolucao Protect');
  }

  if (/\bREXONA\b/i.test(original) && /\bNAT PROT\b/i.test(original)) {
    s = s.replace(/\bNAT\s+PROT\b/gi, 'Natural Protect');
  }

  if (original.includes('VIT.NIELY') || original.includes('VIT NIELY')) {
    s = s
      .replace(/\bVIT\b/gi, 'Vitamina')
      .replace(/\bANTI CASPA\b/gi, 'Anticaspa')
      .replace(/\bMANT KARITE\b/gi, 'Manteiga de Karité')
      .replace(/\bKARITE\b/gi, 'Karité');
  }

  if (/\bSPRAYZIIN|APIS FRESH\b/i.test(original) && /\bMEL\/PR\//i.test(original)) {
    s = s
      .replace(/\bMEL\/PR\/AGR\b/gi, 'Mel e Propolis e Agriao')
      .replace(/\bMEL\/PR\/ROM\b/gi, 'Mel e Propolis e Roma')
      .replace(/\bMEL\/PR\/GEN\b/gi, 'Mel e Propolis e Gengibre')
      .replace(/\bMEL\/PR\/GE\b/gi, 'Mel e Propolis e Gengibre')
      .replace(/\bMEL\/PR\/ME\b/gi, 'Mel e Propolis e Menta');
  }

  if (/\bAPIDOL\b/i.test(original) && /\bPR\/MEN\/ME\b/i.test(original)) {
    s = s.replace(/\bPR\/MEN\/ME\b/gi, 'Propolis Menta e Mel');
  }

  if (/\bMEL\/PR\/MAL\b/i.test(original)) {
    s = s.replace(/\bMEL\/PR\/MAL\b/gi, 'Mel e Propolis e Malva');
  }

  s = normalizarUnidadesEQuantidades(s);
  s = titleCase(s);

  s = s
    .replace(/(\d{2,4})M\b/g, '$1 mL')
    .replace(/\s*\/\s*$/g, '')
    .replace(/1 Unidades/g, '1 Unidade')
    .replace(/\b(\d+)\s+Cpr\b/g, '$1 Comprimidos')
    .replace(/\b(\d+)\s+Comp\b/g, '$1 Comprimidos')
    .replace(/\b(\d+)\s+Cps\b/g, '$1 CÃ¡psulas')
    .replace(/\b(\d+)\s+Caps\b/g, '$1 CÃ¡psulas')
    .replace(/\bShp\b/g, 'Shampoo')
    .replace(/Band-aid/g, 'Band-Aid')
    .replace(/\bRoc\b/g, 'RoC')
    .replace(/\bFps\b/g, 'FPS')
    .replace(/\bFPS(\d+)\b/g, 'FPS $1')
    .replace(/\bXg\b/g, 'XG')
    .replace(/\bXxg\b/g, 'XXG')
    .replace(/\bEg\b/g, 'EG')
    .replace(/\bRn\b/g, 'RN')
    .replace(/\bRecem-nascido\b/g, 'Recém-Nascido')
    .replace(/\bTira-leite\b/g, 'Tira-Leite')
    .replace(/\bCd\b/g, 'CD')
    .replace(/\bBd\b/g, 'BD')
    .replace(/\bBas\b/g, 'Base')
    .replace(/\bKarite\b/g, 'Karité')
    .replace(/\bClassico\b/g, 'Clássico')
    .replace(/\bEsm\b/g, 'Esmalte')
    .replace(/\bMasc\b/g, 'Máscara')
    .replace(/\bCuid Clas\b/g, 'Cuidado Clássico')
    .replace(/\bLis Sedos\b/g, 'Liso e Sedoso')
    .replace(/\bCac Defin\b/g, 'Cachos Definidos')
    .replace(/\bLis Extrato\b/g, 'Liso Extremo')
    .replace(/\b2X1\b/g, '2 em 1')
    .replace(/\b2 Em 1\b/g, '2 em 1')
    .replace(/Pacotes X/g, 'Pacotes x')
    .replace(/__MARCA_POMPOM__/g, 'Pom Pom')
    .replace(/\bPomada\s+Pomada\b/g, 'Pom Pom')
    .replace(/\bKg\b/g, 'kg')
    .replace(/\bUnidade Unidade\b/g, 'Unidade')
    .replace(/\b(\d+) Unidade Unidade\b/g, '$1 Unidade')
    .replace(/\bBand Aid\b/g, 'Band-Aid')
    .replace(/\bBand-aid\b/g, 'Band-Aid')
    .replace(/\bPomada Dermatológico\b/g, 'Pomada Dermatológica')
    .replace(/\bColirio\b/g, 'Colírio')
    .replace(/João&mar/gi, 'João e Maria')
    .replace(/Joao&mar/gi, 'João e Maria')
    .replace(/\bJoao\b/g, 'João')
    .replace(/\bg-tech\b/gi, 'G-Tech')
    .replace(/\bNosewash\b/g, 'NoseWash')
    .replace(/\bLavável\s+Hel\b/g, 'Lavagem Nasal')
    .replace(/\bLavavel\s+Hel\b/g, 'Lavagem Nasal')
    .replace(/\bKit\s+Fr\b/g, 'Kit Frasco')
    .replace(/\bFr\s+(\d+ mL)\b/g, 'Frasco $1')
    .replace(/\bOleo Cap\b/g, 'Óleo Capilar')
    .replace(/\bRep\s+GL\s+FER\b/gi, 'Reparador GL + FER')
    .replace(/\bReparador\s+GL\s+FER\b/gi, 'Reparador GL + FER')
    .replace(/\bRep\s+Gl\s+Fer\b/g, 'Reparador GL + FER')
    .replace(/\bRep\s+Gl\s+\+\s+Fer\b/g, 'Reparador GL + FER')
    .replace(/\bReparador\s+Gl\s+Fer\b/g, 'Reparador GL + FER')
    .replace(/\bNas\s+Ped\b/g, 'Nasal Pediátrico')
    .replace(/\bGotas\s+Nasal\b/g, 'Gotas Nasais')
    .replace(/\bVit\s+Skafe\b/g, 'Vitamina Skafe')
    .replace(/(\d+ mL)\/(\d+)(?!\s*mL)\b/g, '$1 $2 Unidades')
    .replace(/\bGotas Nasais Pediátrico\b/g, 'Gotas Nasais Pediátricas')
    .replace(/\+HIDRO\b/g, 'Hidro')
    .replace(/\+([A-Za-zÁÉÍÓÚÂÊÔÃÕÇáéíóúâêôãõç])/g, ' $1')
    .replace(/\bSens Pr\b/g, 'Sensitive Protect')
    .replace(/\bStr Pr\b/g, 'Stress Protect')
    .replace(/\bStress Pr\b/g, 'Stress Protect')
    .replace(/\bProt Term\b/g, 'Protecao Termica')
    .replace(/\bProt Ter\b/g, 'Protecao Termica')
    .replace(/\bProtecao Term\b/g, 'Protecao Termica')
    .replace(/\bNatural Prot\b/g, 'Natural Protect')
    .replace(/\bWh Protecao\b/g, 'White Protect')
    .replace(/\bWhite Pr\b/g, 'Whitening Pre-Escovacao')
    .replace(/\bWh Pr\b/g, 'Whitening Pre-Escovacao')
    .replace(/\bPos Pr\b/g, 'Pos Progressiva')
    .replace(/\bPos Prog\b/g, 'Pos Progressiva')
    .replace(/\bIluminador Pr\b/g, 'Iluminador Pretos')
    .replace(/\bSulfadiazina Pr\b/g, 'Sulfadiazina Prata')
    .replace(/\b1 Comprimidos\b/g, '1 Comprimido')
    .replace(/\b1 CÃ¡psulas\b/g, '1 CÃ¡psula')
    .replace(/\bAct Unidade\b/g, 'Actif Unify')
    .replace(/\bOil Con\b/g, 'Oil Control')
    .replace(/\bLig Feel\b/g, 'Light Feeling')
    .replace(/\bTq Secagem\b/g, 'Toque Seco')
    .replace(/\bInv Pr Spray\b/g, 'Invisible Spray')
    .replace(/\bInvisible Pr Spray\b/g, 'Invisible Spray')
    .replace(/\bInvis\b/g, 'Invisible')
    .replace(/\bAntir\b/g, 'Antirrugas');

  if (contextoFralda(original)) {
    s = s
      .replace(/\bPacotao\b/g, 'Pacotão')
      .replace(/\bAd\b/g, 'Adulto')
      .replace(/\bRn\b/g, 'RN')
      .replace(/\bXg\b/g, 'XG')
      .replace(/\bXxg\b/g, 'XXG')
      .replace(/\bEg\b/g, 'EG')
      .replace(/\bp\b/g, 'P')
      .replace(/\bm\b/g, 'M')
      .replace(/\bg\b/g, 'G');
  }

  if (original.includes('DOVE') && original.includes('GL+FER')) {
    s = s
      .replace(/\bOleo Cap\b/g, 'Óleo Capilar')
    .replace(/\bRep\s+GL\s+FER\b/gi, 'Reparador GL + FER')
      .replace(/\bReparador\s+GL\s+FER\b/gi, 'Reparador GL + FER');
  }

  const codigoBarras = registro?.codigoBarras ?? null;
  const codigoNormalizado = codigoBarras == null ? null : String(codigoBarras).trim();
  if (codigoNormalizado && EXACT_NAME_OVERRIDES.has(codigoNormalizado)) {
    s = EXACT_NAME_OVERRIDES.get(codigoNormalizado);
  }

  return limpar(s);
}

export function preNormalizarProduto(produto) {
  return aplicarContextos(produto);
}
