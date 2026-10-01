/* INSAPT — comptes du Portail Chaîne d'Approvisionnement (SCM) et de l'ERP Achats.
   Mots de passe stockés sous forme d'empreinte SHA-256 (jamais en clair).
   profiles = profils ERP autorisés (séparation des tâches) ; final = approbation finale : "all" (DG, tout montant) ou "lt10" (DGA / SG par délégation, < 10 M FCFA — Manuel §4.6.2).
   Contrôle côté navigateur uniquement : à remplacer par une authentification serveur en production. */
window.SCM_ACCOUNTS = [
 {
  "u": "insaptscm",
  "h": "6dee99145aa184654ca43e38a02f4d49c61d36cdf58ba84ad35dbbfed97c3fe4",
  "name": "Responsable SCM (compte principal)",
  "fn": "Administration du portail",
  "profiles": [
   "requester",
   "approval",
   "passation",
   "finance",
   "reception"
  ],
  "final": "",
  "admin": true
 },
 {
  "u": "dg.insapt",
  "h": "21bc5edf0899b5fefc82e660ac97dffff40aa935c10a207089f449fa895b48f7",
  "name": "Pr Ali Mahamat Moussa",
  "fn": "Directeur Général",
  "profiles": [
   "approval",
   "requester"
  ],
  "final": "all",
  "admin": false
 },
 {
  "u": "dga.insapt",
  "h": "295770ffd7caa9c48a608e43b46b4d1085ed54434e5aa67eb5e6a9546eda15b8",
  "name": "Dr Djekoundade Antoinette",
  "fn": "Directrice Générale Adjointe",
  "profiles": [
   "approval",
   "requester"
  ],
  "final": "lt10",
  "admin": false
 },
 {
  "u": "sg.insapt",
  "h": "62d4de24227b86297a6c249b86fdb076e44f417f38ebbc0ad6e301aa07b91c95",
  "name": "M. Mingar Tomasbe Arnaud",
  "fn": "Secrétaire Général — Président de la CPM",
  "profiles": [
   "approval",
   "passation",
   "requester"
  ],
  "final": "lt10",
  "admin": false
 },
 {
  "u": "spm.insapt",
  "h": "6d7663fc84d076983a41a72e2e026a0c15b75d421486419e4f91daf698d49330",
  "name": "Spécialiste en Passation des Marchés",
  "fn": "Service de Passation des Marchés",
  "profiles": [
   "passation",
   "requester"
  ],
  "final": "",
  "admin": false
 },
 {
  "u": "ac.insapt",
  "h": "278a21c3bec823b763fc7bb5cb7451aace2c3ace2972401ac515c8b40820a5ff",
  "name": "Agent Comptable",
  "fn": "Agence Comptable",
  "profiles": [
   "finance",
   "requester"
  ],
  "final": "",
  "admin": false
 },
 {
  "u": "fin.insapt",
  "h": "2a96fea0823f69141e4686489bfa4869e3a3604350a23ec23daad54613611eaa",
  "name": "Responsable Budget & Finances",
  "fn": "Service Financier",
  "profiles": [
   "finance",
   "requester"
  ],
  "final": "",
  "admin": false
 },
 {
  "u": "de.insapt",
  "h": "7b679e9ad64071193e4e8b886f36f5e9193ff1f6893a054774fd0821584958e4",
  "name": "Dr Mahamat Fayiz Abakar",
  "fn": "Directeur des Études",
  "profiles": [
   "requester",
   "approval"
  ],
  "final": "",
  "admin": false
 },
 {
  "u": "dcsa.insapt",
  "h": "54d8f00ae9fae9838fab189c8e91f58e1ecf538793ca1974a6ff0c4359a32dd8",
  "name": "Mme Mariam Issaka Daoud",
  "fn": "Directrice Communication, Statistiques & Archives",
  "profiles": [
   "requester",
   "approval"
  ],
  "final": "",
  "admin": false
 },
 {
  "u": "lnsp.insapt",
  "h": "0ce00805e87b252894df04879e815116609684bd69a981c56414fa624f6f6d0f",
  "name": "Chef de Service LaBiEp / LNSP",
  "fn": "Laboratoire National",
  "profiles": [
   "requester",
   "approval"
  ],
  "final": "",
  "admin": false
 },
 {
  "u": "mag.insapt",
  "h": "0bf2e40080eaed632af70b3354c08bbc1266fe5948c68c6567e268234fd14f0f",
  "name": "Magasinier — Réception",
  "fn": "Magasin central",
  "profiles": [
   "reception",
   "requester"
  ],
  "final": "",
  "admin": false
 }
];
/* SHA-256 (synchrone, fonctionne aussi hors HTTPS) */
window.scmSha256 = function (ascii) {
  function r(v, a) { return (v >>> a) | (v << (32 - a)); }
  var mp = Math.pow, mw = mp(2, 32), i, j, res = "", words = [], al = 0;
  var s = unescape(encodeURIComponent(ascii)), bl = s.length * 8;
  var h = [], k = [], pc = 0, ic = {};
  for (var c = 2; pc < 64; c++) { if (!ic[c]) { for (i = 0; i < 313; i += c) ic[i] = c;
    if (pc < 8) h[pc] = (mp(c, .5) * mw) | 0; k[pc++] = (mp(c, 1 / 3) * mw) | 0; } }
  s += "\x80"; while (s.length % 64 - 56) s += "\x00";
  for (i = 0; i < s.length; i++) { j = s.charCodeAt(i); words[i >> 2] |= j << ((3 - i) % 4) * 8; }
  words[words.length] = (bl / mw) | 0; words[words.length] = bl;
  for (j = 0; j < words.length;) {
    var w = words.slice(j, j += 16), oh = h; h = h.slice(0, 8);
    for (i = 0; i < 64; i++) {
      var w15 = w[i - 15], w2 = w[i - 2], a = h[0], e = h[4];
      var t1 = h[7] + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & h[5]) ^ ((~e) & h[6])) + k[i] +
        (w[i] = (i < 16) ? w[i] : (w[i - 16] + (r(w15, 7) ^ r(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (r(w2, 17) ^ r(w2, 19) ^ (w2 >>> 10))) | 0);
      var t2 = (r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & h[1]) ^ (a & h[2]) ^ (h[1] & h[2]));
      h = [(t1 + t2) | 0].concat(h); h[4] = (h[4] + t1) | 0;
    }
    for (i = 0; i < 8; i++) h[i] = (h[i] + oh[i]) | 0;
  }
  for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { var b = (h[i] >> (j * 8)) & 255; res += ((b < 16) ? 0 : "") + b.toString(16); }
  return res;
};
window.scmFindAccount = function (u, p) {
  u = String(u || "").trim().toLowerCase();
  var hh = window.scmSha256(String(p || ""));
  return (window.SCM_ACCOUNTS || []).filter(function (a) { return a.u === u && a.h === hh; })[0] || null;
};
