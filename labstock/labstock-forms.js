/* INSAPT Lab Stock — Formulaires électroniques LaBiEp
   Formulaires du Manuel de Passation (Annexe Q : SOP R-1 à R-4 ; Annexe P : PON 05).
   Saisie, enregistrement (brouillon / finalisé), impression PDF, synchronisation additive (feuille ERP, coll « lsform »). */
(function () {
"use strict";
var LS_KEY = "insapt.labstock.forms", LS_DIRTY = "insapt.labstock.forms.dirty";
var SIG = function (roles) { return { t: "S", roles: roles }; };
var FORMS = [
 { code: "5.A", sop: "PON 05", title: "Bon de réception / Goods Received Note (GRN)", sub: "Enregistrement initial de la livraison",
   b: [{ t: "H", f: ["GRN N°", "Date de réception:date", "Fournisseur", "Bon de livraison (BL) N°", "Contrat / BC N°", "Lieu de réception"] },
       { t: "G", cols: ["Désignation", "Qté commandée", "Unité", "Qté livrée", "Qté acceptée", "N° de lot"], rows: 8 },
       { t: "C", opts: ["Livraison conforme en quantité", "Écart constaté (préciser ci-dessous)"], one: true },
       { t: "X", l: "Observations" }, SIG(["Gestionnaire de magasin / stock", "Transporteur / fournisseur (accusé)"])] },
 { code: "5.B", sop: "PON 05", title: "Procès-verbal d'inspection et de réception (PVIR)", sub: "Validation qualité et décision d'acceptation",
   b: [{ t: "H", f: ["PVIR N°", "Date d'inspection:date", "GRN N° associé", "Contrat / BC N°", "Fournisseur", "Lieu"] },
       { t: "T", l: "A. Inspection quantitative" }, { t: "C", opts: ["Quantités conformes au BC/contrat et au GRN", "Écart constaté"] }, { t: "X", l: "Précision de l'écart", s: 1 },
       { t: "T", l: "B. Inspection qualitative" },
       { t: "C", opts: ["Conformité aux spécifications techniques du contrat", "Certificats de conformité / notices / garanties présents", "Pour équipements : test de fonctionnement satisfaisant", "Pour réactifs : péremption ≥ 12 mois et certificats d'analyse présents", "Pour réactifs : chaîne du froid vérifiée (Annexe 5.E)"] },
       { t: "T", l: "C. Décision" },
       { t: "C", opts: ["ACCEPTATION TOTALE", "ACCEPTATION PARTIELLE — Rapport de non-conformité joint (5.C)", "REJET TOTAL — Rapport de non-conformité joint (5.C)"], one: true },
       { t: "H", f: ["Quantité acceptée (si partielle)"] }, { t: "X", l: "Réserves / observations" },
       SIG(["Gestionnaire de magasin", "Responsable technique", "Représentant fournisseur (si présent)"])] },
 { code: "5.C", sop: "PON 05", title: "Rapport de non-conformité", sub: "Documentation des écarts à la réception",
   b: [{ t: "H", f: ["Rapport N°", "Date:date", "PVIR N° associé", "Fournisseur"] },
       { t: "T", l: "Type de non-conformité" },
       { t: "C", opts: ["Quantité", "Qualité / spécifications", "Date de péremption insuffisante", "Rupture chaîne du froid", "Documentation manquante", "Autre"] },
       { t: "X", l: "Description détaillée" },
       { t: "H", f: ["Quantité concernée", "Action proposée (reprise / remplacement / avoir / pénalité)", "Date de notification au fournisseur:date", "Date limite de résolution:date", "Statut de résolution"] },
       SIG(["Responsable technique", "Responsable Qualité LNSP (si réactifs)", "Service Passation des Marchés"])] },
 { code: "R-1.A", sop: "SOP R-1", title: "Formulaire de spécification de réactif", sub: "Élaboration des spécifications techniques",
   b: [{ t: "H", f: ["Unité demandeuse", "Date:date", "Demandeur", "Réf. spécification N°"] },
       { t: "H", one: 1, f: ["Dénomination commune du réactif", "Nom commercial (si connu)", "Format de conditionnement / unité", "Quantité requise (annuelle estimée)", "Conditions de stockage requises (température, lumière, humidité)", "Durée de péremption minimale acceptée à réception", "Normes de qualité requises (ISO, CE, OMS, pharmacopée)", "Compatibilité avec équipement existant", "Critères de certification du fabricant exigés"] },
       { t: "T", l: "Validation" }, { t: "C", opts: ["Validé par le Référent Qualité / LaBiEp", "Approuvé par le Directeur du LNSP"] },
       SIG(["Chef d'unité technique", "Référent Qualité / LaBiEp", "Directeur du LNSP"])] },
 { code: "R-1.B", sop: "SOP R-1", title: "Demande de réquisition de réactif", sub: "Déclenchement de commande au point de commande", pre: "reorder",
   b: [{ t: "H", f: ["Demande N°", "Date:date", "Unité demandeuse", "Demandeur"] },
       { t: "G", cols: ["Réactif", "Stock actuel", "Point de commande", "Qté demandée", "Motif (réorder / nouveau besoin)", "Urgence (Oui/Non)"], rows: 8 },
       { t: "N", x: "Si « Urgence : Oui », appliquer simultanément le chapitre Achats d'urgence du Manuel et la procédure correspondante." },
       SIG(["Gestionnaire de stock LNSP", "Directeur du LNSP (priorité / criticité)", "Service Passation des Marchés (réception)"])] },
 { code: "R-1.C", sop: "SOP R-1", title: "Analyse coût-bénéfice réactifs / fournisseurs", sub: "Comparatif structuré entre alternatives",
   b: [{ t: "H", f: ["Réactif / besoin concerné", "Date de l'analyse:date", "Réalisée par"] },
       { t: "G", cols: ["Critère", "Option A", "Option B", "Option C"], fixed: ["Fournisseur", "Prix unitaire (FCFA)", "Coût total de possession (transport, douane, pertes)", "Durée de validité restante à la livraison", "Score de performance fournisseur", "Délai de livraison", "Compatibilité technique", "Risque de rupture d'approvisionnement"] },
       { t: "X", l: "Option recommandée et justification" }, SIG(["Chef d'unité technique", "Service Passation des Marchés"])] },
 { code: "R-1.D", sop: "SOP R-1", title: "Liste de contrôle de pré-qualification fournisseur — réactifs", sub: "Critères spécifiques aux fournisseurs de réactifs",
   b: [{ t: "H", f: ["Fournisseur évalué", "Date d'évaluation:date"] },
       { t: "G", cols: ["Critère spécifique réactifs", "Conforme (Oui/Non)", "Référence / validité"], fixed: ["Certification ISO 9001", "ISO 13485 ou marquage CE (DIV)", "Préqualification OMS (le cas échéant)", "Autorisation de mise sur le marché / d'importation", "Maîtrise documentée de la chaîne du froid", "Engagement de Certificat d'Analyse (CoA) par lot", "Références auprès de laboratoires de santé publique", "Politique de rappel de produit documentée", "Fiches de données de sécurité (FDS) disponibles"] },
       { t: "C", opts: ["Fournisseur qualifié — inscription au répertoire, catégorie Réactifs", "Rejet — motif détaillé requis"], one: true },
       { t: "X", l: "Motif / observations", s: 1 }, SIG(["Responsable Qualité LNSP", "Service Passation des Marchés"])] },
 { code: "R-2.A", sop: "SOP R-2", title: "Fiche de suivi de température (quotidienne)", sub: "Relevés journaliers avec seuils d'alarme",
   b: [{ t: "H", f: ["Équipement N° / désignation", "Mois / année", "Plage requise (°C)", "Seuils d'alarme (min / max)"] },
       { t: "G", cols: ["Jour", "Temp. matin (°C)", "Heure", "Temp. soir (°C)", "Heure", "Conforme (Oui/Non)", "Initiales agent"], rows: 31, num: 1 },
       { t: "N", x: "Tout relevé « Non conforme » déclenche immédiatement le Formulaire d'investigation d'excursion de température (R-2.B)." }] },
 { code: "R-2.B", sop: "SOP R-2", title: "Formulaire d'investigation d'excursion de température", sub: "Documentation de l'incident et décision de disposition",
   b: [{ t: "H", f: ["Rapport N°", "Équipement concerné", "Date / heure de détection:datetime-local", "Détecté par", "Température observée (°C)", "Plage requise (°C)", "Durée estimée de l'excursion"] },
       { t: "X", l: "Cause apparente (coupure électrique, panne, porte ouverte, etc.)", s: 1 },
       { t: "T", l: "Mesures immédiates" }, { t: "C", opts: ["Transfert des produits critiques vers équipement de secours", "Alimentation de secours activée"] },
       { t: "T", l: "Évaluation d'impact (Responsable Qualité)" },
       { t: "G", cols: ["Réactif / lot concerné", "Quantité", "Impact évalué", "Stabilité fabricant vérifiée (Oui/Non)"], rows: 5 },
       { t: "T", l: "Décision de disposition" },
       { t: "C", opts: ["Maintien en stock — impact négligeable confirmé", "Mise en quarantaine — évaluation complémentaire requise", "Élimination — non-conformité confirmée (Certificat R-3.B)"], one: true },
       SIG(["Gestionnaire de stock (constat)", "Responsable Qualité LNSP (décision)", "Directeur du LNSP (validation)"])] },
 { code: "R-2.C", sop: "SOP R-2", title: "Registre de maintenance des équipements froid", sub: "Suivi des opérations de maintenance",
   b: [{ t: "G", cols: ["Équipement", "Date", "Type (préventive / corrective)", "Action effectuée", "Responsable / prestataire", "Prochaine échéance"], rows: 10 }] },
 { code: "R-2.D", sop: "SOP R-2", title: "Registre de test du système d'alimentation de secours", sub: "Suivi mensuel / trimestriel générateur et onduleur",
   b: [{ t: "G", cols: ["Date du test", "Type (fonctionnel / charge complète)", "Résultat (Conforme / Non)", "Temps de basculement (min)", "Responsable"], rows: 10 },
       { t: "N", x: "Le temps de basculement ne doit pas excéder 15 minutes. Tout résultat « Non conforme » déclenche une intervention immédiate du Service Maintenance." }] },
 { code: "R-3.A", sop: "SOP R-3", title: "Fiche d'inventaire PPSO/FEFO par lot", sub: "Suivi par numéro de lot et date de péremption", pre: "inventory",
   b: [{ t: "H", f: ["Réactif", "Type d'inventaire (rotatif / complet)", "Date de l'inventaire:date", "Réalisé par"] },
       { t: "G", cols: ["N° de lot", "Date réception", "Date péremption", "Stock théorique", "Stock physique", "Écart (%)", "Observations"], rows: 10, ecart: [3, 4, 5] },
       { t: "N", x: "Tout écart supérieur à 2 % entre stock physique et stock théorique est signalé au Directeur du LNSP et fait l'objet d'une investigation." },
       SIG(["Gestionnaire de stock", "Agent indépendant (séparation des tâches)", "Responsable Qualité LNSP"])] },
 { code: "R-3.B", sop: "SOP R-3", title: "Certificat de destruction de réactif", sub: "Attestation de mise au rebut conforme", pre: "expired",
   b: [{ t: "H", f: ["Certificat N°", "Date de destruction:date"] },
       { t: "G", cols: ["Réactif / lot", "Quantité", "Date péremption", "Motif (péremption / non-conformité)"], rows: 10 },
       { t: "H", one: 1, f: ["Méthode d'élimination utilisée", "Filière / prestataire d'élimination", "Réf. formulaire d'investigation (si excursion chaîne du froid)"] },
       SIG(["Responsable Qualité LNSP", "Témoin indépendant", "Directeur du LNSP (validation)"])] },
 { code: "R-3.C", sop: "SOP R-3", title: "Rapport mensuel consommation vs. péremption", sub: "KPI de gestion des stocks",
   b: [{ t: "H", f: ["Mois / année", "Préparé par"] },
       { t: "G", cols: ["Catégorie de réactif", "Stock début mois", "Qté consommée", "Qté périmée / détruite", "Taux de perte (%)"], fixed: ["Réactifs de diagnostic / épidémique", "Milieux de culture / microbiologie", "Réactifs de biologie moléculaire (PCR)", "Consommables courants", "Réactifs chimiques / toxicologie", "TOTAL GÉNÉRAL"], rate: [1, 3, 4] },
       { t: "N", x: "KPI cible : taux de perte par péremption < 3 % par catégorie. Tout dépassement déclenche une analyse des causes profondes (R-3.D)." },
       SIG(["Gestionnaire de stock LNSP", "Responsable Qualité LNSP"])] },
 { code: "R-3.D", sop: "SOP R-3", title: "Fiche d'analyse des causes profondes (pertes par péremption)", sub: "Causes et actions correctives",
   b: [{ t: "H", f: ["Réactif(s) concerné(s)", "Quantité / valeur perdue (FCFA)", "Période concernée", "Date de l'analyse:date"] },
       { t: "T", l: "Causes identifiées" },
       { t: "C", opts: ["Consommation insuffisante par rapport aux prévisions", "Surstockage / commande excessive", "Problème de qualité détecté tardivement", "Changement de protocole technique", "Autre"] },
       { t: "X", l: "Description détaillée" },
       { t: "G", cols: ["Action corrective", "Responsable", "Échéance"], rows: 5 },
       SIG(["Responsable Qualité LNSP", "Directeur du LNSP", "Service Passation des Marchés (ajustement PPM)"])] },
 { code: "R-3.E", sop: "SOP R-3", title: "Fiche de mouvement de stock (bin card)", sub: "Entrées et sorties par réactif et par lot", pre: "bincard",
   b: [{ t: "H", f: ["Réactif / analyte", "N° de catalogue / référence", "Unité de mesure", "Emplacement / zone de stockage", "Stock minimum", "Température de stockage requise", "Conditionnement"] },
       { t: "N", x: "RÈGLE FEFO : sortir en premier le lot dont la date de péremption est la plus proche." },
       { t: "G", cols: ["Date", "N° lot", "Date péremption", "Entrées", "Sorties", "Solde", "Source / destination", "Visa agent"], rows: 15 },
       SIG(["Gestionnaire de stock", "Responsable Qualité LNSP", "Superviseur / Directeur LNSP"])] },
 { code: "R-3.F", sop: "SOP R-3", title: "Bon de sortie de réactifs (bon d'utilisation)", sub: "À remplir avant chaque prélèvement",
   b: [{ t: "H", f: ["Bon de sortie N°", "Date:date", "Heure:time", "Unité / service demandeur", "Responsable de l'unité"] },
       { t: "X", l: "Objet / utilisation (type d'analyses, campagne, urgence)", s: 1 },
       { t: "G", cols: ["Désignation du réactif / consommable", "N° de lot (FEFO)", "Péremption", "Qté demandée", "Qté délivrée", "Observations"], rows: 6 },
       { t: "C", opts: ["Déclaration FEFO : je certifie que les lots prélevés sont ceux dont la péremption est la plus proche", "Non-respect FEFO (justification en observations)"], one: true },
       SIG(["Technicien préleveur", "Gestionnaire de stock", "Responsable Qualité LNSP"])] },
 { code: "R-4.A", sop: "SOP R-4", title: "Demande de distribution de réactifs", sub: "Commande interne du site partenaire",
   b: [{ t: "H", f: ["Demande N°", "Date:date", "Site / laboratoire demandeur", "Contact"] },
       { t: "G", cols: ["Réactif demandé", "Quantité", "Consommation mensuelle moyenne", "Stock actuel du site", "Urgence (Oui/Non)"], rows: 6 },
       { t: "T", l: "Décision d'allocation (réservé au LNSP)" },
       { t: "C", opts: ["Allocation totale", "Allocation partielle", "Refus"], one: true }, { t: "X", l: "Motif", s: 1 },
       SIG(["Site partenaire (demandeur)", "Directeur du LNSP (approbation)"])] },
 { code: "R-4.B", sop: "SOP R-4", title: "Bordereau de colisage & liste de contrôle chaîne du froid", sub: "Contenu et validation de l'emballage isotherme",
   b: [{ t: "H", f: ["Expédition N°", "Date d'expédition:date", "Destination (site)", "Réf. demande N° (R-4.A)"] },
       { t: "G", cols: ["Réactif", "N° de lot", "Quantité", "Date péremption", "Plage temp. requise"], rows: 6 },
       { t: "T", l: "Validation chaîne du froid (avant expédition)" },
       { t: "C", opts: ["Emballage isotherme qualifié pour la durée de trajet", "Moyens réfrigérants adaptés", "Enregistreur de température (datalogger) installé", "Durée de transport compatible avec la tenue en température", "Étiquetage complet (contenu, lots, destination, pictogrammes)"] },
       { t: "H", f: ["Moyens réfrigérants (type / quantité)", "Transporteur", "Durée de trajet estimée"] },
       SIG(["Gestionnaire de stock (préparation)", "Responsable Qualité LNSP (validation emballage)"])] },
 { code: "R-4.C", sop: "SOP R-4", title: "Fiche de réception et confirmation (site partenaire)", sub: "Vérification par le site receveur",
   b: [{ t: "H", f: ["Expédition N° (réf. R-4.B)", "Date de réception:date", "Site receveur", "Reçu par"] },
       { t: "T", l: "Contrôle à la réception" },
       { t: "C", opts: ["Colis intact, sans dommage apparent", "Datalogger / indicateur lu et conforme", "Quantités conformes au bordereau", "Dates de péremption vérifiées et acceptables", "Stockage approprié mis en place immédiatement"] },
       { t: "H", f: ["Température relevée à l'ouverture (°C)"] }, { t: "X", l: "Anomalie constatée (si applicable)", s: 1 },
       { t: "C", opts: ["RÉCEPTION CONFORME", "ANOMALIE SIGNALÉE — notification immédiate au LNSP"], one: true },
       { t: "N", x: "La fiche signée est retournée au LNSP dans un délai de 72 heures suivant la réception." },
       SIG(["Responsable site partenaire"])] },
 { code: "R-4.D", sop: "SOP R-4", title: "Registre de distribution et suivi des expéditions", sub: "Statut de chaque envoi du LNSP vers les sites",
   b: [{ t: "G", cols: ["Date expédition", "Site destinataire", "Contenu (réf.)", "Transporteur", "Statut (Préparé / Expédié / En transit / Reçu / Anomalie)", "Date confirmation réception"], rows: 10 }] }
];
var BYCODE = {}; FORMS.forEach(function (f) { BYCODE[f.code] = f; });

/* ---------- stockage ---------- */
function loadAll() { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; } }
function saveAll(m) { try { localStorage.setItem(LS_KEY, JSON.stringify(m)); } catch (e) { A().toast("Stockage local plein", "err"); } }
function dirty() { try { return JSON.parse(localStorage.getItem(LS_DIRTY)) || {}; } catch (e) { return {}; } }
function setDirty(d) { try { localStorage.setItem(LS_DIRTY, JSON.stringify(d)); } catch (e) {} }
function A() { return window.LS_API; }
function esc(s) { return A().esc(s); }

/* Synchronisation additive : rien n'est jamais supprimé côté serveur ; la version la plus récente l'emporte. */
function push() {
  var api = A(), d = dirty(), m = loadAll(), ids = Object.keys(d);
  if (!ids.length || !api.online()) return Promise.resolve(0);
  var recs = ids.filter(function (id) { return m[id]; }).map(function (id) { return { coll: "lsform", id: id, updated: m[id].updated, data: m[id] }; });
  return api.gs("erp_bulk", { recs: recs }).then(function (j) {
    if (!j || !j.ok) throw new Error("refus");
    (j.stale || []).forEach(function (s) { if (s.coll === "lsform" && s.data) m[s.id] = s.data; });
    saveAll(m); setDirty({}); return recs.length;
  }).catch(function () { return 0; });
}
function pull() {
  var api = A(); if (!api.online()) return Promise.resolve(0);
  return api.gs("erp_list", null).then(function (j) {
    if (!j || !j.ok) return 0;
    var m = loadAll(), d = dirty(), n = 0;
    (j.records || []).forEach(function (x) {
      if (x.coll !== "lsform" || !x.data) return;
      var cur = m[x.id];
      if (!cur || (!d[x.id] && (x.updated || "") > (cur.updated || ""))) { m[x.id] = x.data; n++; }
    });
    saveAll(m); return n;
  }).catch(function () { return 0; });
}

/* ---------- rendu ---------- */
var CUR = null; /* {id, code, data, status} */
function render(el) {
  el = el || document.getElementById("v-forms");
  if (CUR) return renderForm(el);
  var m = loadAll(), list = Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return (b.updated || "").localeCompare(a.updated || ""); });
  var groups = {};
  FORMS.forEach(function (f) { (groups[f.sop] = groups[f.sop] || []).push(f); });
  var h = '<div class="note"><b>Formulaires électroniques du LaBiEp</b>Formulaires officiels du Manuel de Passation des Marchés (Annexe Q — SOP R-1 à R-4 ; Annexe P — PON 05). ' +
    "Chaque formulaire se remplit à l'écran, s'enregistre en brouillon puis se finalise ; il peut être imprimé ou enregistré en PDF. " +
    "Les formulaires enregistrés sont conservés sur ce poste et synchronisés avec la base INSAPT (sans jamais effacer de données).</div>";
  h += '<div class="card"><div class="card-h"><h3>Nouveau formulaire<small>Cliquez sur un formulaire pour le remplir</small></h3></div><div class="card-b">';
  Object.keys(groups).forEach(function (g) {
    var lbl = { "PON 05": "Réception (PON 05)", "SOP R-1": "Besoins et réquisition (SOP R-1)", "SOP R-2": "Chaîne du froid (SOP R-2)", "SOP R-3": "Gestion des stocks FEFO (SOP R-3)", "SOP R-4": "Distribution aux sites (SOP R-4)" }[g] || g;
    h += '<div class="frm-grp"><h4>' + esc(lbl) + '</h4><div class="frm-grid">' + groups[g].map(function (f) {
      return '<button class="frm-tile" data-new="' + esc(f.code) + '"><b>' + esc(f.code) + "</b><span>" + esc(f.title) + "</span>" + (f.pre ? '<em>Pré-remplissage depuis le stock</em>' : "") + "</button>";
    }).join("") + "</div></div>";
  });
  h += "</div></div>";
  h += '<div class="card"><div class="card-h"><h3>Formulaires enregistrés<small>' + list.length + " formulaire(s)</small></h3>" +
    '<input id="frmQ" placeholder="Rechercher…" style="max-width:220px"><button class="btn btn-ghost btn-sm" id="frmSync">⟳ Synchroniser</button></div><div class="card-b flush" id="frmList"></div></div>';
  el.innerHTML = h;
  var drawList = function () {
    var q = (document.getElementById("frmQ").value || "").toLowerCase();
    var L = list.filter(function (r) { return !q || [r.code, r.title, r.ref, r.by, r.status].join(" ").toLowerCase().indexOf(q) >= 0; });
    document.getElementById("frmList").innerHTML = L.length ? '<div class="tbl-scroll"><table class="tbl"><thead><tr><th>Formulaire</th><th>Référence</th><th>Statut</th><th>Rempli par</th><th>Mis à jour</th><th></th></tr></thead><tbody>' +
      L.map(function (r) {
        return '<tr class="row-click" data-open="' + esc(r.id) + '"><td class="t-name">' + esc(r.code) + " — " + esc(r.title) + '</td><td class="mono">' + esc(r.ref || "—") + "</td><td>" +
          (r.status === "final" ? '<span class="pill ok">Finalisé</span>' : '<span class="pill nodate">Brouillon</span>') + "</td><td>" + esc(r.by || "—") + '</td><td class="mono">' + esc((r.updated || "").replace("T", " ").slice(0, 16)) +
          '</td><td style="white-space:nowrap"><button class="btn btn-ghost btn-xs" data-open="' + esc(r.id) + '">Ouvrir</button> <button class="btn btn-ghost btn-xs" data-print="' + esc(r.id) + '">PDF</button></td></tr>';
      }).join("") + "</tbody></table></div>" : '<div class="empty"><span class="ic">🗂</span><b>Aucun formulaire enregistré</b>Choisissez un formulaire ci-dessus pour commencer.</div>';
    Array.prototype.forEach.call(document.querySelectorAll("#frmList [data-open]"), function (b) {
      b.onclick = function (e) { if (e.target.closest("[data-print]")) return; var r = loadAll()[b.dataset.open]; if (r) { CUR = JSON.parse(JSON.stringify(r)); render(el); } };
    });
    Array.prototype.forEach.call(document.querySelectorAll("#frmList [data-print]"), function (b) {
      b.onclick = function (e) { e.stopPropagation(); var r = loadAll()[b.dataset.print]; if (r) printForm(r); };
    });
  };
  drawList();
  document.getElementById("frmQ").oninput = drawList;
  document.getElementById("frmSync").onclick = function () {
    push().then(pull).then(function (n) { A().toast(A().online() ? "Formulaires synchronisés" : "Hors ligne — synchronisation au retour de la connexion", A().online() ? "ok" : ""); CUR = null; render(el); });
  };
  Array.prototype.forEach.call(el.querySelectorAll("[data-new]"), function (b) {
    b.onclick = function () {
      var f = BYCODE[b.dataset.new], u = A().user() || {};
      CUR = { id: "F" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase(), code: f.code, title: f.title, data: {}, status: "draft",
        by: u.name || u.user || "", created: new Date().toISOString(), ref: "" };
      render(el);
    };
  });
}
function inp(k, type, val, ro) {
  return '<input data-k="' + k + '"' + (type ? ' type="' + type + '"' : "") + ' value="' + esc(val == null ? "" : val) + '"' + (ro ? " disabled" : "") + ">";
}
function body(f, D, ro) {
  var h = "";
  f.b.forEach(function (b, i) {
    if (b.t === "H") {
      h += '<div class="frm-h' + (b.one ? " one" : "") + '">' + b.f.map(function (x, j) {
        var p = x.split(":"), k = "h" + i + "_" + j;
        return '<label><span>' + esc(p[0]) + "</span>" + inp(k, p[1] || "", D[k], ro) + "</label>";
      }).join("") + "</div>";
    } else if (b.t === "T") h += "<h4 class='frm-t'>" + esc(b.l) + "</h4>";
    else if (b.t === "N") h += '<div class="frm-n">' + esc(b.x) + "</div>";
    else if (b.t === "X") h += '<label class="frm-x"><span>' + esc(b.l) + '</span><textarea data-k="x' + i + '" rows="' + (b.s ? 2 : 4) + '"' + (ro ? " disabled" : "") + ">" + esc(D["x" + i] || "") + "</textarea></label>";
    else if (b.t === "C") {
      h += '<div class="frm-c">' + b.opts.map(function (o, j) {
        var k = "c" + i + "_" + j;
        return '<label><input type="checkbox" data-k="' + k + '"' + (b.one ? ' data-one="c' + i + '"' : "") + (D[k] ? " checked" : "") + (ro ? " disabled" : "") + "> " + esc(o) + "</label>";
      }).join("") + "</div>";
    } else if (b.t === "G") {
      var n = b.fixed ? b.fixed.length : (D["g" + i + "_n"] || b.rows);
      h += '<div class="tbl-scroll"><table class="tbl frm-g"><thead><tr><th>N°</th>' + b.cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>";
      for (var r = 0; r < n; r++) {
        h += "<tr><td class='mono'>" + (r + 1) + "</td>" + b.cols.map(function (c, ci) {
          var k = "g" + i + "_" + r + "_" + ci;
          if (b.fixed && ci === 0) return "<td><b>" + esc(b.fixed[r]) + "</b></td>";
          return "<td>" + inp(k, "", D[k], ro) + "</td>";
        }).join("") + "</tr>";
      }
      h += "</tbody></table></div>";
      if (!b.fixed && !ro) h += '<button type="button" class="btn btn-ghost btn-xs" data-addrow="' + i + '">+ Ajouter une ligne</button>';
    } else if (b.t === "S") {
      h += '<div class="frm-s">' + b.roles.map(function (role, j) {
        var k = "s" + i + "_" + j;
        return '<div><b>' + esc(role) + "</b><label><span>Nom</span>" + inp(k + "_n", "", D[k + "_n"], ro) + "</label><label><span>Date</span>" + inp(k + "_d", "date", D[k + "_d"], ro) + "</label>" +
          '<label class="frm-sig"><input type="checkbox" data-k="' + k + '_v"' + (D[k + "_v"] ? " checked" : "") + (ro ? " disabled" : "") + "> Visa électronique</label>" +
          (D[k + "_v"] && D[k + "_vt"] ? '<small>Visé le ' + esc(D[k + "_vt"].replace("T", " ").slice(0, 16)) + (D[k + "_vu"] ? " par le compte " + esc(D[k + "_vu"]) : "") + "</small>" : "") + "</div>";
      }).join("") + "</div>";
    }
  });
  return h;
}
function collect(el) {
  var D = CUR.data;
  Array.prototype.forEach.call(el.querySelectorAll("[data-k]"), function (e) {
    var k = e.dataset.k;
    if (e.type === "checkbox") {
      var was = !!D[k]; D[k] = e.checked;
      if (/_v$/.test(k)) { var b = k.slice(0, -2); if (e.checked && !was) { D[b + "_vt"] = new Date().toISOString(); D[b + "_vu"] = (A().user() || {}).user || ""; } if (!e.checked) { delete D[b + "_vt"]; delete D[b + "_vu"]; } }
    } else D[k] = e.value;
  });
  var f = BYCODE[CUR.code];
  if (f.b[0] && f.b[0].t === "H") CUR.ref = D.h0_0 || "";
}
function renderForm(el) {
  var f = BYCODE[CUR.code], ro = CUR.status === "final";
  var h = '<div class="frm-bar"><button class="btn btn-ghost btn-sm" id="frmBack">← Tous les formulaires</button><span class="spacer"></span>' +
    (f.pre && !ro ? '<button class="btn btn-ghost btn-sm" id="frmPre">⤓ Pré-remplir depuis le stock</button>' : "") +
    '<button class="btn btn-ghost btn-sm" id="frmPrint">🖨 Imprimer / PDF</button>' +
    (ro ? '<button class="btn btn-ghost btn-sm" id="frmCopy">Dupliquer</button>' : '<button class="btn btn-ghost btn-sm" id="frmSave">Enregistrer le brouillon</button><button class="btn btn-sm" id="frmFinal">Finaliser</button>') + "</div>";
  h += '<div class="card frm"><div class="frm-head"><div><small>INSTITUT NATIONAL DE SANTÉ PUBLIQUE DU TCHAD · LNSP / LaBiEp</small><h3>' + esc(f.title.toUpperCase()) + "</h3><p>" + esc(f.sop) + " — " + esc(f.sub) + "</p></div><div class='frm-code'>Form. " + esc(f.code) +
    "<small>" + (ro ? "Finalisé" : "Brouillon") + "</small></div></div><div class='card-b'>" + body(f, CUR.data, ro) +
    '<div class="frm-foot">Réf. Formulaire : Form. ' + esc(f.code) + " | INSAPT – LNSP – Gestion des Réactifs | Version 1 · Rempli par : " + esc(CUR.by || "—") + "</div></div></div>";
  el.innerHTML = h;
  var $ = function (s) { return el.querySelector(s); };
  Array.prototype.forEach.call(el.querySelectorAll("[data-one]"), function (c) {
    c.addEventListener("change", function () { if (c.checked) Array.prototype.forEach.call(el.querySelectorAll('[data-one="' + c.dataset.one + '"]'), function (o) { if (o !== c) o.checked = false; }); });
  });
  Array.prototype.forEach.call(el.querySelectorAll("[data-addrow]"), function (b) {
    b.onclick = function () { collect(el); var i = b.dataset.addrow, bl = f.b[i]; CUR.data["g" + i + "_n"] = (CUR.data["g" + i + "_n"] || bl.rows) + 1; renderForm(el); };
  });
  wireCalc(el, f);
  $("#frmBack").onclick = function () { if (!ro) { collect(el); if (Object.keys(CUR.data).length) store("draft", true); } CUR = null; render(el); };
  $("#frmPrint").onclick = function () { if (!ro) collect(el); printForm(CUR); };
  if ($("#frmPre")) $("#frmPre").onclick = function () { collect(el); prefill(f); renderForm(el); };
  if ($("#frmSave")) $("#frmSave").onclick = function () { collect(el); store("draft"); A().toast("Brouillon enregistré", "ok"); renderForm(el); };
  if ($("#frmFinal")) $("#frmFinal").onclick = function () {
    collect(el);
    if (!confirm("Finaliser ce formulaire ? Il ne pourra plus être modifié (une copie reste possible).")) return;
    store("final"); A().toast("Formulaire finalisé et enregistré", "ok"); renderForm(el);
  };
  if ($("#frmCopy")) $("#frmCopy").onclick = function () {
    var u = A().user() || {};
    CUR = { id: "F" + Date.now().toString(36).toUpperCase(), code: CUR.code, title: CUR.title, data: JSON.parse(JSON.stringify(CUR.data)), status: "draft", by: u.name || u.user || "", created: new Date().toISOString(), ref: "" };
    Object.keys(CUR.data).forEach(function (k) { if (/^s\d+_\d+_v/.test(k)) delete CUR.data[k]; });
    renderForm(el);
  };
}
function store(status, quiet) {
  CUR.status = status; CUR.updated = new Date().toISOString();
  if (status === "final") CUR.finalized = CUR.updated;
  var m = loadAll(); m[CUR.id] = JSON.parse(JSON.stringify(CUR)); saveAll(m);
  var d = dirty(); d[CUR.id] = 1; setDirty(d);
  A().audit && A().audit("form", CUR.code + " " + (status === "final" ? "finalisé" : "brouillon") + " — " + (CUR.ref || CUR.id));
  push();
}
/* Calculs automatiques : écart (%) R-3.A, taux de perte R-3.C */
function wireCalc(el, f) {
  f.b.forEach(function (b, i) {
    if (!b.ecart && !b.rate) return;
    var go = function () {
      var n = b.fixed ? b.fixed.length : (CUR.data["g" + i + "_n"] || b.rows);
      for (var r = 0; r < n; r++) {
        var g = function (c) { var e = el.querySelector('[data-k="g' + i + "_" + r + "_" + c + '"]'); return e; };
        if (b.ecart) {
          var th = parseFloat((g(b.ecart[0]) || {}).value), ph = parseFloat((g(b.ecart[1]) || {}).value), out = g(b.ecart[2]);
          if (out && !isNaN(th) && th > 0 && !isNaN(ph)) out.value = ((ph - th) / th * 100).toFixed(1);
        }
        if (b.rate) {
          var st = parseFloat((g(b.rate[0]) || {}).value), lo = parseFloat((g(b.rate[1]) || {}).value), o2 = g(b.rate[2]);
          if (o2 && !isNaN(st) && st > 0 && !isNaN(lo)) o2.value = (lo / st * 100).toFixed(1);
        }
      }
    };
    Array.prototype.forEach.call(el.querySelectorAll('[data-k^="g' + i + '_"]'), function (e) { e.addEventListener("input", go); });
  });
}
/* Pré-remplissage depuis Lab Stock (données en lecture seule — rien n'est modifié dans le stock). */
function prefill(f) {
  var api = A(), DB = api.db(), D = CUR.data, gi = f.b.findIndex(function (b) { return b.t === "G"; });
  var fill = function (rows, map) {
    CUR.data["g" + gi + "_n"] = Math.max(f.b[gi].rows, rows.length);
    rows.forEach(function (r, ri) { map(r).forEach(function (v, ci) { D["g" + gi + "_" + ri + "_" + ci] = v == null ? "" : String(v); }); });
  };
  if (f.pre === "reorder") {
    var low = DB.filter(function (r) { return r.min_level != null && r.min_level !== "" && (Number(r.qty_remaining) || 0) <= Number(r.min_level); });
    if (!low.length) { api.toast("Aucun article sous son seuil minimum", ""); return; }
    fill(low, function (r) { return [r.name + (r.lot ? " (lot " + r.lot + ")" : ""), r.qty_remaining, r.min_level, "", "réorder", ""]; });
  } else if (f.pre === "expired") {
    var ex = DB.filter(function (r) { return api.band(r) === "exp" && (Number(r.qty_remaining) || 0) > 0; });
    if (!ex.length) { api.toast("Aucun lot périmé en stock", ""); return; }
    fill(ex, function (r) { return [r.name + " / " + (r.lot || "—"), (r.qty_remaining || "") + " " + (r.unit || ""), r.date_expiry, "Péremption"]; });
  } else if (f.pre === "inventory" || f.pre === "bincard") {
    var name = prompt("Désignation du réactif (ou partie du nom) :", D.h0_0 || ""); if (!name) return;
    var q = name.toLowerCase(), lots = DB.filter(function (r) { return String(r.name || "").toLowerCase().indexOf(q) >= 0; });
    if (!lots.length) { api.toast("Aucun lot trouvé pour « " + name + " »", "err"); return; }
    lots.sort(function (a, b) { return String(a.date_expiry || "9").localeCompare(String(b.date_expiry || "9")); });
    D.h0_0 = lots[0].name;
    if (f.pre === "inventory") {
      D.h0_2 = D.h0_2 || new Date().toISOString().slice(0, 10); D.h0_3 = D.h0_3 || ((api.user() || {}).name || "");
      fill(lots, function (r) { return [r.lot || "—", r.date_reception, r.date_expiry, r.qty_remaining, "", "", r.location]; });
    } else {
      D.h0_1 = lots[0].catalog_ref || ""; D.h0_2 = lots[0].unit || ""; D.h0_3 = lots[0].location || ""; D.h0_4 = lots[0].min_level == null ? "" : lots[0].min_level; D.h0_5 = lots[0].temperature || "";
      var ids = {}; lots.forEach(function (r) { ids[r.id] = r; });
      var mv = api.moves().filter(function (m) { return ids[m.id] && (m.kind === "in" || m.kind === "out" || m.kind === "scrap"); }).slice().reverse();
      if (!mv.length) { api.toast("Aucun mouvement enregistré pour ce réactif — en-tête pré-rempli", ""); return; }
      fill(mv, function (m) { var r = ids[m.id] || {}; return [(m.ts || "").slice(0, 10), m.lot || r.lot || "", r.date_expiry || "", m.kind === "in" ? m.qty : "", m.kind !== "in" ? m.qty : "", "", m.note || "", m.who || ""]; });
    }
  }
  api.toast("Pré-remplissage effectué — vérifiez et complétez", "ok");
}
/* Impression / PDF : document propre, prêt à imprimer ou à enregistrer en PDF. */
function printForm(rec) {
  var f = BYCODE[rec.code], D = rec.data || {};
  var v = function (k) { return esc(D[k] || ""); };
  var h = "";
  f.b.forEach(function (b, i) {
    if (b.t === "H") h += '<table class="kv">' + b.f.map(function (x, j) { return "<tr><th>" + esc(x.split(":")[0]) + "</th><td>" + v("h" + i + "_" + j) + "</td></tr>"; }).join("") + "</table>";
    else if (b.t === "T") h += "<h4>" + esc(b.l) + "</h4>";
    else if (b.t === "N") h += '<p class="n">' + esc(b.x) + "</p>";
    else if (b.t === "X") h += '<div class="x"><b>' + esc(b.l) + "</b><div>" + v("x" + i).replace(/\n/g, "<br>") + "</div></div>";
    else if (b.t === "C") h += '<div class="c">' + b.opts.map(function (o, j) { return "<span>" + (D["c" + i + "_" + j] ? "☒" : "☐") + " " + esc(o) + "</span>"; }).join("") + "</div>";
    else if (b.t === "G") {
      var n = b.fixed ? b.fixed.length : (D["g" + i + "_n"] || b.rows);
      h += '<table class="g"><tr><th>N°</th>' + b.cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr>";
      for (var r = 0; r < n; r++) h += "<tr><td>" + (r + 1) + "</td>" + b.cols.map(function (c, ci) { return "<td>" + (b.fixed && ci === 0 ? "<b>" + esc(b.fixed[r]) + "</b>" : v("g" + i + "_" + r + "_" + ci)) + "</td>"; }).join("") + "</tr>";
      h += "</table>";
    } else if (b.t === "S") h += '<table class="s"><tr>' + b.roles.map(function (r) { return "<th>" + esc(r) + "</th>"; }).join("") + "</tr><tr>" +
      b.roles.map(function (r, j) { var k = "s" + i + "_" + j; return "<td>Nom : " + v(k + "_n") + "<br>Date : " + v(k + "_d") + "<br>" + (D[k + "_v"] ? "Visa électronique ✔ " + esc((D[k + "_vt"] || "").replace("T", " ").slice(0, 16)) : "Signature :<br><br>") + "</td>"; }).join("") + "</tr></table>";
  });
  var w = window.open("", "_blank");
  if (!w) { A().toast("Autorisez les fenêtres pop-up pour imprimer", "err"); return; }
  w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Form. ' + esc(f.code) + " — " + esc(f.title) + '</title><style>' +
    "body{font:11px Arial,sans-serif;color:#111;margin:18mm 14mm}h1{font-size:15px;margin:2px 0;color:#002664}h4{margin:12px 0 4px;color:#002664;font-size:12px}.top{display:flex;justify-content:space-between;border-bottom:2px solid #FECB00;padding-bottom:6px;margin-bottom:10px}.top small{color:#555}" +
    ".code{border:1px solid #002664;padding:6px 10px;text-align:center;font-weight:bold;color:#002664}table{width:100%;border-collapse:collapse;margin:6px 0}th,td{border:1px solid #888;padding:4px 5px;text-align:left;vertical-align:top}th{background:#eef2f8}" +
    ".kv th{width:38%}.g td{height:16px}.c span{display:inline-block;margin:2px 14px 2px 0}.x div{border:1px solid #888;min-height:34px;padding:4px;margin-top:2px}.n{font-style:italic;color:#444}.s td{height:70px;width:33%}.f{margin-top:12px;font-size:9px;color:#555;border-top:1px solid #ccc;padding-top:4px}@page{size:A4;margin:0}" +
    '</style></head><body><div class="top"><div><small>RÉPUBLIQUE DU TCHAD — INSTITUT NATIONAL DE SANTÉ PUBLIQUE DU TCHAD (INSAPT) · LNSP / LaBiEp</small><h1>' + esc(f.title.toUpperCase()) + "</h1><small>" + esc(f.sop) + " — " + esc(f.sub) + '</small></div><div class="code">Form. ' + esc(f.code) + "<br><small>" + (rec.status === "final" ? "Finalisé" : "Brouillon") + "</small></div></div>" + h +
    '<div class="f">Réf. Formulaire : Form. ' + esc(f.code) + " | INSAPT – LNSP – Gestion des Réactifs | Version 1 · Rempli par : " + esc(rec.by || "—") + " · Imprimé le " + new Date().toLocaleString("fr") + " · Lab Stock LaBiEp</div>" +
    "<script>setTimeout(function(){window.print()},300)<\/script></body></html>");
  w.document.close();
}
window.LSForms = { render: function (el) { render(el); pull().then(function (n) { if (n && !CUR) render(el); }); push(); }, FORMS: FORMS, _printForm: printForm };
})();
