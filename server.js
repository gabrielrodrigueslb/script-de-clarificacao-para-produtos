import { preNormalizarProduto } from "./src/utils/normalizador-v25.js";

const exemplos = [
  "SH JOAO&MAR GLIC 400ML",
  "SAB LIQ JOAO&MAR GLIC 200ML",
  "SH TIO NACHO ANTIC 415ML",
  "AP NEB G-TECH INAL DOG 1UN",
  "HID FAC GARNIER HIAL PREEN 85G",
  "ESM COLOR CINT VESTE PRATA 8ML",
  "URNA ACRILICO SORTEIO CAIXA SU",
  "NOSEWASH LAV HEL KIT FR 240ML",
  "SAB LIQ DOVE ACN CON 547ML",
  "COND DOVE REP GL+FER 250ML"
];

for (const exemplo of exemplos) {
  console.log(`${exemplo} => ${preNormalizarProduto(exemplo)}`);
}
