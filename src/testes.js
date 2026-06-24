import { preNormalizarProduto } from "./utils/normalizador-v25.js";

const exemplos = [
  "WHEY SH.MASS 800 CHOC.BAD BOY",
  "TOTELLE CICLO 1MG+0,250MG 28DR",
  "SUMAX 10MG SPR 2DOS 0,2ML",
  "TIRA LEITE BOMB.PROLACTA PROMI",
  "TESOURA MUND FLEX CURV FIN 1UN",
  "CLOR.METFORMINA 500MG/30CPR GE",
  "ADOC.LINEA CULINARIO 70G /",
  "CRE.FRUCTIS TR.CHOQUE CAB.SECO",
  "PROT MAMILO LILLO SIL 4311 1UN",
  "JOELHEIRA NEOP.PAT.C/REF.C/SUP",
  "ESC.D.REACH CONTROL 40 G MAC /",
  "CURAT.BAND-AID BOB ESPONJA C/2",
  "FISIOGEL A.I CR ALIV CALM 30G",
  "CETOC+BETAM POM DERM 30G",
  "LOC.HID.G.DOUR.PROT.LEITE 500M",
  "Desinf Urca Floral",
  "Enx B Action Superman 250 mL",
  "Enxagua B Action Hortela Maxpro 1L",
  "Valda Past Diet 24 g",
  "Col J&J 200 mL Crescid/Meninas",
  "Col J&J 200 mL Crescid/Meninos",
  "Col J&J 200 mL Refresc/Brisa",
  "Col J&J 200 mL Refresc/Suavidad",
  "Col Johnson Equilibrio 200 mL",
  "Cor&ton 7.44 Ruivo Acobreado",
  "Fr Cremer Short Jumb M 18 Unidades",
  "Bz Sundown FPS 6 105 g Oleo Gol",
  "Di Mag 260 mg c/60 caps",
  "Sabao em po OMO Puro Cuidado 8",
  "Hidr Argan e Sebo de Carn 240 g",
  "Col La Piel Cristal Himal 200 mL",
  "Sandalia Havaianas Baby D Cl Az Wt 20",
  "Sabonete Liquido Gliceri Chei Bebe 500 mL",
  "La Piel Hid Crista Himal 400 mL",
  "Clean & Clear Morning Energ Hi",
  "Perfume La Rive Black Creek Prov",
];

for (const exemplo of exemplos) {
  console.log(`${exemplo}\n-> ${preNormalizarProduto(exemplo)}\n`);
}
