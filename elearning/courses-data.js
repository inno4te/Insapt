/* ============================================================
   INSAPT Academy — catalogue des cours, leçons et banques de QCM
   Contenu fondé sur : Manuel de Passation des Marchés INSAPT (Version 1, septembre 2026)
   et Code des Marchés Publics (Décret N°2130/PR/2020, ARMP).
   Les leçons des niveaux de certification proviennent de
   manual-modules.js (chapitres réels du manuel).
   ============================================================ */
(function () {
  const M = () => window.MANUAL_MODULES || {};

  // helper to pull a manual chapter as a lesson body
  const ch = n => (M()[String(n)] || { title: "Chapitre " + n, html: "<p class='m-p'>Contenu indisponible.</p>" });

  // ---------- Question bank (QCM) ----------
  // q: question, o: options, a: index of correct, lvl: tags for exam pools
  const QB = [
    // Seuils & assujettissement (Code, art. 9-17)
    { q: "Selon l'article 9 du Code (Décret N°2130/PR/2020), en dessous de quel montant TTC un marché de TRAVAUX n'est-il pas soumis au Code ?", o: ["20 000 000 FCFA", "30 000 000 FCFA", "50 000 000 FCFA", "100 000 000 FCFA"], a: 2, lvl: ["code", "l1", "l4"] },
    { q: "Le seuil d'assujettissement au Code pour les marchés de FOURNITURES et SERVICES est de :", o: ["10 000 000 FCFA", "30 000 000 FCFA", "50 000 000 FCFA", "20 000 000 FCFA"], a: 1, lvl: ["code", "l1", "l4"] },
    { q: "Pour les PRESTATIONS INTELLECTUELLES, le seuil d'assujettissement au Code est de :", o: ["20 000 000 FCFA", "30 000 000 FCFA", "40 000 000 FCFA", "15 000 000 FCFA"], a: 0, lvl: ["code", "l4"] },
    { q: "Un marché de travaux est passé par appel d'offres NATIONAL lorsque son montant TTC est inférieur ou égal à :", o: ["1 milliard FCFA", "2 milliards FCFA", "500 millions FCFA", "5 milliards FCFA"], a: 1, lvl: ["code", "l2", "l4"] },
    { q: "Au-delà de quel montant un marché de FOURNITURES passe-t-il en appel d'offres INTERNATIONAL ?", o: ["400 millions FCFA", "2 milliards FCFA", "1 milliard FCFA", "500 millions FCFA"], a: 2, lvl: ["code", "l2", "l4"] },
    { q: "Les contrats d'un montant inférieur à 10 000 000 FCFA sont passés par :", o: ["Appel d'offres restreint", "Gré à gré", "Consultation directe", "Appel d'offres ouvert"], a: 2, lvl: ["code", "gen", "l1", "l4"] },
    { q: "Le fractionnement d'un marché pour se situer sous les seuils est :", o: ["Autorisé avec justification", "Toléré en cas d'urgence", "Strictement interdit", "Autorisé une fois par an"], a: 2, lvl: ["code", "gen", "l1", "l4"] },

    // Principes (art. 3)
    { q: "Lequel de ces principes N'EST PAS un principe fondamental de la commande publique énoncé par le Code ?", o: ["Liberté d'accès", "Égalité de traitement des candidats", "Transparence des procédures", "Préférence systématique au moins-disant étranger"], a: 3, lvl: ["gen", "code", "l1", "l4"] },
    { q: "Un marché public peut commencer à être exécuté :", o: ["Dès l'attribution provisoire", "Dès la signature", "Seulement après sa notification", "Dès l'avis de la CPM"], a: 2, lvl: ["code", "gen", "l2", "l4"] },

    // Modes de passation (art. 76, 84, 90, 100-101)
    { q: "Quel est le mode de passation de DROIT COMMUN des marchés publics ?", o: ["Le gré à gré", "L'appel d'offres ouvert", "L'appel d'offres restreint", "La demande de cotation"], a: 1, lvl: ["gen", "code", "l2", "l4"] },
    { q: "L'avis d'appel d'offres ouvert doit être publié au moins combien de jours avant la date limite de dépôt des offres ?", o: ["15 jours", "21 jours", "30 jours", "45 jours"], a: 2, lvl: ["code", "l2", "l4", "sop"] },
    { q: "En appel d'offres restreint, le nombre minimum de candidats consultés pour garantir une concurrence réelle est de :", o: ["2", "3", "5", "7"], a: 1, lvl: ["code", "sop", "l2", "l4"] },
    { q: "Lequel de ces cas NE justifie PAS un marché de gré à gré selon l'article 101 ?", o: ["Brevet ou droits exclusifs détenus par un seul prestataire", "Urgence impérieuse résultant d'une force majeure", "Volonté de gagner du temps sur un marché ordinaire", "Remplacement en extrême urgence d'un titulaire défaillant"], a: 2, lvl: ["code", "l2", "l4", "gen"] },
    { q: "Le recours au gré à gré nécessite :", o: ["Un simple avis interne", "L'autorisation préalable du Ministre en charge des marchés publics", "L'accord du fournisseur", "Une publication de 15 jours"], a: 1, lvl: ["code", "l2", "l4"] },
    { q: "Un appel d'offres est déclaré infructueux :", o: ["Si plus de 10 offres sont reçues", "En l'absence d'offres jugées conformes", "Si le budget est dépassé de 5 %", "Si un candidat se désiste"], a: 1, lvl: ["code", "sop", "l2", "l4"] },

    // Préférences & sous-traitance (art. 77, 80, 81)
    { q: "La marge de préférence NATIONALE applicable en appel d'offres international est au maximum de :", o: ["5 %", "10 %", "15 %", "25 %"], a: 2, lvl: ["code", "l3", "l4"] },
    { q: "La préférence accordée aux entreprises de femmes d'affaires tchadiennes est de :", o: ["5 %", "10 %", "15 %", "20 %"], a: 1, lvl: ["code", "l3", "l4"] },
    { q: "La sous-traitance est interdite au-delà de quel pourcentage de la valeur globale du marché ?", o: ["20 %", "25 %", "30 %", "50 %"], a: 2, lvl: ["code", "l3", "l4", "gen"] },

    // Organes (art. 27-65)
    { q: "Quel organe assure le contrôle A PRIORI des procédures de passation ?", o: ["L'ARMP", "La DGCMP (organe de contrôle)", "La Cour Suprême", "Le Trésor Public"], a: 1, lvl: ["code", "gen", "l1", "l4"] },
    { q: "Quel organe assure la RÉGULATION du système des marchés publics au Tchad ?", o: ["La DGCMP", "L'ARMP", "Le Ministère de la Santé", "La Banque Mondiale"], a: 1, lvl: ["code", "gen", "l1", "l4"] },
    { q: "L'organe de contrôle dispose de combien de jours ouvrables pour émettre son avis sur un dossier complet, faute de quoi l'avis est réputé favorable ?", o: ["3 jours", "7 jours", "14 jours", "21 jours"], a: 1, lvl: ["code", "l2", "l4", "sop"] },
    { q: "La CPM (Commission de Passation des Marchés) doit se prononcer sur un dossier dans un délai maximal de :", o: ["7 jours", "15 jours", "21 jours", "30 jours"], a: 2, lvl: ["code", "sop", "l2", "l4"] },
    { q: "Après la fin des travaux d'ouverture/évaluation, la documentation complète doit être transmise à l'ARMP pour archivage dans un délai maximum de :", o: ["24 heures", "48 heures", "72 heures", "7 jours"], a: 2, lvl: ["code", "sop", "l3", "l4"] },
    { q: "L'audit annuel indépendant commandé par l'ARMP couvre obligatoirement :", o: ["Tous les marchés supérieurs à 300 millions FCFA", "Uniquement les marchés de gré à gré", "Les marchés inférieurs à 10 millions seulement", "Aucun marché public"], a: 0, lvl: ["code", "l3", "l4"] },
    { q: "Nul ne peut être à la fois membre d'une CPM et appartenir à :", o: ["Une entreprise privée", "La DGCMP ou l'ARMP", "Un ministère", "Une université"], a: 1, lvl: ["code", "l3", "l4", "gen"] },
    { q: "Dans un établissement public comme l'INSAPT, les marchés sont passés par :", o: ["Le Ministre de tutelle", "Le Directeur Général", "Le comptable public", "Le Conseil Scientifique"], a: 1, lvl: ["gen", "code", "l1", "l4"] },

    // PPM & besoins (art. 70-73)
    { q: "Tout marché doit avoir été préalablement inscrit :", o: ["Au Journal Officiel", "Au Plan de Passation des Marchés (PPM)", "Au registre du commerce", "Au budget de l'ARMP"], a: 1, lvl: ["gen", "code", "sop", "l1", "l4"] },
    { q: "Avant tout appel à la concurrence, le maître d'ouvrage doit :", o: ["Choisir le fournisseur", "Déterminer la nature et l'étendue des besoins", "Signer le contrat", "Payer une avance"], a: 1, lvl: ["gen", "l1", "l4"] },
    { q: "L'allotissement consiste à :", o: ["Fractionner illégalement un marché", "Répartir les prestations en lots pouvant donner lieu à des marchés distincts", "Annuler un appel d'offres", "Regrouper tous les achats de l'année"], a: 1, lvl: ["code", "gen", "l1", "l4"] },

    // Évaluation & attribution (art. 43, 82)
    { q: "Les offres sont évaluées sur la base :", o: ["Des critères annoncés dans le DAO uniquement", "De critères choisis après l'ouverture", "De la réputation du candidat", "Du choix personnel du Président de la CPM"], a: 0, lvl: ["gen", "code", "sop", "l2", "l4"] },
    { q: "La sous-commission d'analyse dispose de combien de jours au maximum pour l'évaluation des offres ?", o: ["7 jours", "10 jours", "15 jours", "30 jours"], a: 2, lvl: ["code", "sop", "l2", "l4"] },
    { q: "L'appel d'offres se conclut :", o: ["Après négociation des prix", "Sans négociation, sur critères objectifs", "Par tirage au sort", "Par enchères inversées obligatoires"], a: 1, lvl: ["code", "gen", "l2", "l4"] },

    // Exécution, garanties, paiement
    { q: "Quelle garantie couvre le remboursement de l'avance de démarrage ?", o: ["La caution de soumission", "La garantie de bonne exécution", "La caution de restitution d'avances", "La retenue de garantie"], a: 2, lvl: ["code", "l3", "l4", "sop"] },
    { q: "Le retard de paiement imputable à l'administration ouvre droit pour le titulaire à :", o: ["Rien", "Des intérêts moratoires", "Une résiliation automatique", "Un nouveau marché"], a: 1, lvl: ["code", "l3", "l4"] },
    { q: "Un avenant ne doit jamais :", o: ["Être écrit", "Bouleverser l'économie du marché", "Être soumis à l'avis de la CPM", "Être approuvé"], a: 1, lvl: ["code", "gen", "l3", "l4"] },
    { q: "La réception des prestations conditionne :", o: ["Le lancement de l'appel d'offres", "La libération des garanties et le paiement du solde", "L'inscription au PPM", "La publication de l'avis"], a: 1, lvl: ["code", "l3", "l4", "sop"] },

    // Éthique & COI (manuel ch.16 + code art. 7, 25-26)
    { q: "Un conflit d'intérêts (COI) survient lorsque :", o: ["Deux fournisseurs déposent la même offre", "Les intérêts personnels d'un agent peuvent influencer ses décisions professionnelles d'achat", "Le budget est insuffisant", "Le délai de livraison est dépassé"], a: 1, lvl: ["gen", "l1", "l3", "l4"] },
    { q: "Face à un conflit d'intérêts potentiel, un agent impliqué dans une procédure doit :", o: ["Le garder pour lui", "Le déclarer par écrit et se récuser de la procédure", "Continuer en étant prudent", "Démissionner immédiatement"], a: 1, lvl: ["gen", "l1", "l3", "l4"] },
    { q: "Les membres du gouvernement et les élus peuvent-ils soumissionner aux marchés publics ?", o: ["Oui, librement", "Oui, avec autorisation", "Non, ils ne sont pas admis à concourir", "Seulement pour les petits marchés"], a: 2, lvl: ["code", "gen", "l1", "l4"] },
    { q: "Un candidat qui accorde un avantage à un intermédiaire doit :", o: ["Le dissimuler", "En informer par écrit le maître d'ouvrage sous peine de rejet de son offre", "Le déclarer aux impôts uniquement", "Le mentionner oralement"], a: 1, lvl: ["code", "l3", "l4"] },
    { q: "Le mécanisme de signalement (lanceurs d'alerte) du manuel INSAPT vise à :", o: ["Punir les fournisseurs", "Permettre de signaler en confiance les irrégularités avec protection contre les représailles", "Remplacer les audits", "Publier les salaires"], a: 1, lvl: ["gen", "l4", "sop"] },

    // Recours & sanctions
    { q: "Un soumissionnaire s'estimant lésé peut saisir en dernier ressort non juridictionnel :", o: ["Le Comité de Règlement des Différends (CRD) de l'ARMP", "La police", "Le fournisseur concurrent", "La presse"], a: 0, lvl: ["code", "l3", "l4", "gen"] },
    { q: "Les personnes ayant violé la réglementation des marchés peuvent être :", o: ["Exclues de la commande publique, liste publiée au Journal des marchés", "Promues", "Exemptées d'impôts", "Nommées à la CPM"], a: 0, lvl: ["code", "l3", "l4"] },

    // Manuel INSAPT — processus, CPA, RFQ/RFP/RFI, réactifs, KPIs
    { q: "Dans le manuel INSAPT, la règle des « trois devis » s'applique principalement :", o: ["Aux marchés de gré à gré", "Aux demandes de cotation (RFQ) sous seuil", "Aux appels d'offres internationaux", "Aux dons"], a: 1, lvl: ["gen", "sop", "l1", "l4"] },
    { q: "Le canal CPA (Centrale Pharmaceutique d'Achats) concerne en priorité :", o: ["Les véhicules", "Les produits pharmaceutiques et intrants de santé", "Le mobilier de bureau", "Les billets d'avion"], a: 1, lvl: ["gen", "l1", "l4", "sop"] },
    { q: "Un RFI (Request For Information) sert à :", o: ["Attribuer un marché", "Recueillir de l'information sur le marché et les capacités des fournisseurs, sans engagement", "Payer une facture", "Résilier un contrat"], a: 1, lvl: ["sop", "l4", "gen"] },
    { q: "La différence essentielle entre RFQ et RFP est :", o: ["Aucune", "La RFQ vise surtout le prix sur un besoin bien spécifié ; la RFP sollicite des propositions techniques et financières évaluées sur plusieurs critères", "La RFP est réservée aux travaux", "La RFQ est toujours internationale"], a: 1, lvl: ["sop", "l4"] },
    { q: "Pour les réactifs de laboratoire, le manuel INSAPT recommande notamment :", o: ["De ne jamais suivre les dates de péremption", "La gestion des stocks avec suivi des péremptions, chaîne du froid et quantification basée sur la consommation", "D'acheter uniquement en urgence", "De stocker sans registre"], a: 1, lvl: ["sop", "l3", "l4"] },
    { q: "Les achats d'urgence selon le manuel :", o: ["Dispensent de toute documentation", "Suivent une procédure accélérée mais documentée et régularisée a posteriori", "Sont interdits", "Ne concernent que la papeterie"], a: 1, lvl: ["gen", "sop", "l2", "l4"] },
    { q: "Le suivi de la performance des fournisseurs sert à :", o: ["Choisir ses amis", "Documenter la qualité, les délais et la conformité pour éclairer les décisions futures", "Fixer les impôts", "Remplacer les garanties"], a: 1, lvl: ["gen", "l2", "l4", "sop"] },
    { q: "Un KPI pertinent pour la fonction achats est :", o: ["La couleur des dossiers", "Le délai moyen de passation du besoin à la notification", "Le nombre de réunions annulées", "La taille du bureau"], a: 1, lvl: ["sop", "l3", "l4"] },
    { q: "La Vendor Master List (répertoire des fournisseurs) permet :", o: ["De payer sans facture", "De tenir un référentiel à jour des fournisseurs qualifiés, leurs documents et performances", "D'éviter les appels d'offres", "De partager les mots de passe"], a: 1, lvl: ["sop", "l4"] },
    { q: "Une clause contractuelle type de « pénalités de retard » a pour objet :", o: ["De récompenser le retard", "De prévoir une sanction financière proportionnée en cas de dépassement des délais contractuels", "D'annuler la garantie", "D'augmenter le prix"], a: 1, lvl: ["l3", "l4", "sop"] },
    { q: "Dans la gouvernance INSAPT, la séparation des fonctions signifie :", o: ["Une seule personne fait tout", "Demandeur, acheteur, réceptionnaire et payeur sont des rôles distincts", "Le DG signe les chèques et réceptionne seul", "Les fournisseurs évaluent les offres"], a: 1, lvl: ["gen", "l1", "l4"] },
    { q: "La pré-sélection (pré-qualification) des candidats vise à :", o: ["Éliminer la concurrence", "Vérifier en amont les capacités techniques, financières et juridiques des candidats", "Choisir le moins cher sans analyse", "Retarder la procédure"], a: 1, lvl: ["gen", "l1", "l4"] },
    { q: "Le DAO (Dossier d'Appel d'Offres) contient notamment :", o: ["Les instructions aux soumissionnaires, spécifications, critères d'évaluation et projet de marché", "Les fiches de paie", "Le règlement intérieur du personnel", "Les comptes personnels du DG"], a: 0, lvl: ["gen", "code", "sop", "l1", "l4"] },
    { q: "Pour les prestations intellectuelles, les offres sont ouvertes :", o: ["En une seule fois", "En deux temps : offres techniques d'abord, puis offres financières des seuls qualifiés", "Financières d'abord", "Jamais"], a: 1, lvl: ["code", "sop", "l2", "l4"] },
    { q: "La méthode de sélection « qualité-coût » (SFQC) combine :", o: ["Uniquement le prix", "La note technique et la note financière pondérées", "Le hasard", "L'ancienneté du cabinet"], a: 1, lvl: ["code", "sop", "l2", "l4"] },
    { q: "Le délai minimum de réception des soumissions pour une délégation de service public est de :", o: ["15 jours", "30 jours", "45 jours", "60 jours"], a: 2, lvl: ["code", "l3", "l4"] },
    { q: "Les avis, résultats, marchés et avenants signés doivent être transmis à l'ARMP dans les :", o: ["24 heures", "48 heures", "5 jours", "30 jours"], a: 1, lvl: ["code", "sop", "l3", "l4"] },
    { q: "Le principe « service fait » signifie que :", o: ["On paie avant la livraison", "Le paiement intervient après constatation de l'exécution conforme des prestations", "On ne paie jamais", "Le service est gratuit"], a: 1, lvl: ["gen", "l3", "l4"] },
    { q: "La dématérialisation des marchés publics encouragée par le Code inclut :", o: ["La destruction des archives", "L'échange et la conservation d'informations par moyens électroniques", "L'abandon des contrôles", "L'interdiction d'internet"], a: 1, lvl: ["code", "l4"] }
  ];

  // ---------- Lesson builder helpers ----------
  // Deep-lesson builder (400-600 words each)
  const D = o => {
    let out = "";
    if (o.obj) out += `<div style="background:var(--navy-050);border-left:3px solid var(--tchad-gold);padding:10px 14px;margin-bottom:14px;border-radius:0 6px 6px 0"><b>Objectifs :</b> ${o.obj}</div>`;
    (o.sections||[]).forEach(s=>{
      out += `<h3 class="m-h2">${s.h}</h3>`;
      (s.p||[]).forEach(p=>{ out+=`<p class="m-p">${p}</p>`; });
      if(s.ul) out+=`<ul class="m-ul">${s.ul.map(x=>`<li>${x}</li>`).join("")}</ul>`;
    });
    if(o.ex) out+=`<h3 class="m-h2">📋 Cas pratique</h3><div style="background:var(--wash);border:1px solid var(--line);padding:12px 16px;border-radius:8px;margin-bottom:14px"><p class="m-p" style="margin:0">${o.ex}</p></div>`;
    if(o.traps&&o.traps.length) out+=`<h3 class="m-h2">⚠ Pièges à éviter</h3><ul class="m-ul">${o.traps.map(x=>`<li>${x}</li>`).join("")}</ul>`;
    if(o.key&&o.key.length) out+=`<h3 class="m-h2">✓ À retenir</h3><ul class="m-ul">${o.key.map(x=>`<li>${x}</li>`).join("")}</ul>`;
    if(o.src) out+=`<p class="m-p" style="margin-top:14px;font-size:12px;color:var(--slate)"><b>Sources :</b> ${o.src}</p>`;
    return out;
  };
  const L = (title, paras, points) =>
    `<h3 class="m-h2">${title}</h3>` +
    paras.map(p => `<p class="m-p">${p}</p>`).join("") +
    (points ? `<ul class="m-ul">${points.map(x => `<li>${x}</li>`).join("")}</ul>` : "");


  // ---------- COURSES ----------
  window.EL_COURSES = [
    /* 1 ▸ GENERAL — 10 modules */
    {
      id: "gen", icon: "◆", color: "#052a5e",
      exam: { pool: ["gen"], n: 20, minutes: 30 },
      name: { fr: "Cours Généraux de Passation des Marchés", en: "General Procurement Courses", ar: "دورات عامة في المشتريات" },
      desc: { fr: "10 modules d'introduction aux principes des achats publics à l'INSAPT : processus, COI, pré-sélection, planification…", en: "10 introductory modules on public procurement principles at INSAPT: process, COI, pre-selection, planning…", ar: "١٠ وحدات تمهيدية في مبادئ المشتريات العمومية بالمعهد" },
      modules: [
        { t:{fr:"Introduction à la commande publique",en:"Introduction to public procurement",ar:"مدخل إلى الشراء العمومي"},
          html:D({obj:"Expliquer pourquoi les achats publics obéissent à des règles strictes, situer le cadre applicable à l'INSAPT et énoncer les quatre principes cardinaux.",
            sections:[
              {h:"Pourquoi des règles d'achat public ?",p:[
                "La commande publique mobilise des fonds publics — impôts, subventions de l'État, contributions des partenaires techniques et financiers — que l'INSAPT gère en fiduciaire de la Nation. Chaque franc dépensé pour un réactif, une prestation ou un équipement doit produire le maximum de valeur pour la santé des populations tchadiennes. Cette exigence de bon usage justifie un cadre juridique dense et contraignant.",
                "Une deuxième raison est démocratique : fournisseurs, contribuables et citoyens ont le droit de savoir comment l'argent public est dépensé et de concourir à égalité de chances. Un achat public opaque nourrit la défiance et décourage les entreprises sérieuses. À l'inverse, un processus transparent attire des offres compétitives, fait baisser les prix et renforce la légitimité de l'institution."]},
              {h:"Le cadre applicable à l'INSAPT",p:[
                "Trois strates de règles s'appliquent dans cet ordre de préséance : (1) le <b>Code des Marchés Publics du Tchad</b> (Décret N°2130/PR/2020) ; (2) les <b>accords de financement</b> des bailleurs (OMS, Fonds Mondial, UNICEF…) qui, en vertu de l'art. 8 du Code, priment sur les dispositions contraires ; (3) le <b>Manuel de Politiques et Procédures</b> de l'INSAPT, qui décline le Code en procédures opérationnelles.",
                "En pratique : avant tout lancement, identifier la source de financement, vérifier l'existence de règles bailleur, et n'écarter le Code que sur les points réellement contradictoires. Sur tout le reste, le Code demeure le fil rouge."]},
              {h:"Les quatre principes cardinaux (art. 3)",ul:[
                "<b>Liberté d'accès</b> : toute entreprise qualifiée peut concourir sans discrimination arbitraire.",
                "<b>Égalité de traitement</b> : mêmes informations, mêmes délais, mêmes critères pour tous.",
                "<b>Transparence</b> : publicité des avis, ouverture en séance, publication des résultats et voies de recours.",
                "<b>Économie et efficacité</b> : meilleur rapport qualité-prix — jamais au détriment des trois autres principes."]},
              {h:"Qui est concerné à l'INSAPT ?",p:[
                "L'article 4 du Code inclut les établissements publics comme l'INSAPT. Les marchés sont passés sous l'autorité du Directeur Général (art. 28). Chaque agent intervenant dans le processus — du service demandeur à l'agent comptable — est soumis aux règles d'éthique des articles 25-26 et aux sanctions du Titre VI. La cellule de passation coordonne et documente chaque procédure."]}
            ],
            ex:"Un fournisseur apprend qu'un DAO INSAPT circule chez un concurrent trois jours avant sa publication officielle. Deux principes sont violés : égalité de traitement (avantage temporel) et transparence (processus non loyal). Résultat : risque d'annulation de la procédure, recours devant le CRD de l'ARMP, et sanctions personnelles pour l'agent responsable de la fuite.",
            traps:[
              "Confondre 'moins cher' et 'meilleur' : le Code vise l'offre la mieux-disante, qui intègre qualité, délais et coûts d'exploitation.",
              "Croire que les règles ne s'appliquent pas quand un bailleur finance : elles s'appliquent sur tout ce que l'accord ne contredit pas.",
              "Assimiler 'transparence' à 'publier après coup' : elle commence à la planification."],
            key:[
              "Chaque achat INSAPT est traçable, documenté et défendable.",
              "Un marché n'est exécutoire qu'après notification écrite au titulaire (art. 3).",
              "Non-respect des règles : sanctions administratives, civiles et pénales pour l'agent ET l'Institut."],
            src:"Code, art. 3, 4, 8, 28 ; Manuel INSAPT, ch. 1-2."})},

        { t:{fr:"Le processus de passation de A à Z",en:"The procurement process end-to-end",ar:"عملية الشراء من البداية إلى النهاية"},
          html:D({obj:"Décrire les six étapes du cycle achat INSAPT, les livrables clés et les points de contrôle critiques.",
            sections:[
              {h:"Une chaîne, pas une suite de tâches",p:[
                "Un marché public est un cycle qui commence par l'expression du besoin et se termine par l'archivage de la clôture. À l'INSAPT, ce cycle mobilise plusieurs services (demandeur, cellule de passation, agence comptable, réceptionnaire) et plusieurs organes externes (DGCMP, ARMP). La qualité finale dépend de chaque maillon : un besoin mal exprimé produit un DAO ambigu → des offres incomparables → des recours et avenants coûteux."]},
              {h:"Étape 1 — Réquisition et planification",p:[
                "Le service demandeur rédige une réquisition écrite : quantités, spécifications fonctionnelles, délai souhaité, imputation budgétaire. La cellule de passation vérifie l'inscription au Plan de Passation des Marchés (PPM) et la disponibilité des crédits. <b>Sans PPM et sans crédits confirmés, le marché est nul (art. 71).</b>"]},
              {h:"Étape 2 — Prospection et sourcing",p:[
                "Étude de marché documentée : catalogues, manifestations d'intérêt, consultation de la Vendor Master List. Objectifs : estimer le prix, identifier au moins trois fournisseurs qualifiés, détecter les monopoles."]},
              {h:"Étapes 3 et 4 — Mise en concurrence et évaluation",p:[
                "Selon seuil et nature : AOO (≥ 30 jours de publicité), RFQ (< seuil, ≥ 3 cotations simultanées), ou gré à gré exceptionnel (autorisation Ministère). Ouverture CPM → PV séance tenante → évaluation ≤ 15 jours → rapport d'analyse → avis DGCMP (7 jours) → publication → standstill → signature."]},
              {h:"Étapes 5 et 6 — Exécution, paiement et archivage",p:[
                "Notification → garanties → exécution suivie → réception (PV) → paiement au service fait dans les délais (intérêts moratoires si retard administration). Archivage ARMP : marchés signés sous 48 h, dossiers de procédure sous 72 h (art. 37)."]}
            ],
            ex:"CVS : 200 tests rapides de paludisme, 12 M FCFA (fournitures < 30 M). Étape 1 : réquisition + PPM OK. Étape 2 : 3 fournisseurs préqualifiés VML. Étape 3 : RFQ simultanée mêmes specs. Étape 4 : tableau comparatif, moins-disant conforme. Étape 5 : bon de commande, réception contrôle péremption. Étape 6 : paiement J+20. Durée totale : 3 semaines si dossier complet.",
            traps:[
              "Invoquer l'urgence pour un besoin prévisible.",
              "Confondre attribution (proposition) et notification (acte déclencheur).",
              "Négliger l'archivage : sans dossier complet, l'agent est présumé fautif en audit."],
            key:[
              "Six étapes : besoin → sourcing → concurrence → attribution → exécution → paiement/archivage.",
              "Chaque étape produit des documents datés et signés.",
              "Délais ARMP : 48 h (marchés), 72 h (dossiers)."],
            src:"Code, art. 37, 71, 82-84 ; Manuel INSAPT, ch. 2, ch. 12."})},

        { t:{fr:"Conflits d'intérêts (COI)",en:"Conflicts of interest (COI)",ar:"تضارب المصالح"},
          html:D({obj:"Définir le COI, reconnaître ses trois formes, maîtriser la procédure de déclaration/récusation et connaître les conséquences du silence.",
            sections:[
              {h:"Définition et trois formes",p:[
                "Un conflit d'intérêts existe dès qu'un agent se trouve dans une situation où ses intérêts personnels, familiaux, financiers ou associatifs peuvent influencer — ou <i>paraître</i> influencer — ses décisions professionnelles. <b>L'apparence même du conflit suffit (art. 7 et 25).</b>"],
               ul:[
                "<b>Réel</b> : votre frère est représentant du soumissionnaire A ; vous siégez à la CPM.",
                "<b>Potentiel</b> : votre ancien employeur postule ; vous l'avez quitté depuis moins de deux ans.",
                "<b>Apparent</b> : vous avez dîné avec le DG d'un candidat la veille — aucune intention mauvaise, mais la neutralité paraît compromise."]},
              {h:"Procédure INSAPT en trois temps",p:[
                "<b>1. Déclarer</b> : en début de chaque procédure, chaque membre CPM signe une déclaration d'absence de COI couvrant lui-même et ses proches. Si un COI survient en cours de route : déclaration immédiate.",
                "<b>2. Se récuser</b> : sortir de la salle, ne pas consulter les documents, ne pas voter. Consigner au PV.",
                "<b>3. Remplacer</b> : le Président désigne un remplaçant. À défaut de quorum, la séance est reportée."]},
              {h:"Cadeaux et hospitalité",p:[
                "Politique INSAPT (ch. 16) : refus par défaut de tout cadeau d'un candidat actif. Cadeaux symboliques hors procédure : déclarés à la hiérarchie. Invitations à événements payés par un fournisseur : autorisation écrite préalable. Mécénat d'un candidat à l'Institut : conflit d'intérêts présumé pour les procédures suivantes."]}
            ],
            ex:"Vous êtes secrétaire CPM. Un candidat vous envoie une invitation personnelle à son mariage. Bonne pratique : (1) ne pas répondre à titre personnel ; (2) informer par écrit le Président CPM ; (3) le Président consigne au dossier et propose votre récusation préventive. Ce n'est pas une preuve de corruption — mais y aller aurait créé un conflit apparent susceptible d'annuler la procédure sur recours.",
            traps:[
              "Croire qu'un conflit apparent 'qu'on peut expliquer' n'est pas un problème : c'en est un.",
              "Déclarer tardivement : plus tardif, plus suspect.",
              "Récuser oralement sans consigner au PV : sans trace, la récusation ne protège personne."],
            key:[
              "Réel, potentiel, apparent : les trois obligent à déclarer.",
              "Silence sur un COI = faute passible de sanctions.",
              "Déclarer tôt, se récuser proprement, consigner par écrit."],
            src:"Code, art. 7, 25, 26 ; Manuel INSAPT, ch. 16."})},

        { t:{fr:"Pré-sélection et qualification des candidats",en:"Pre-selection and qualification of bidders",ar:"التأهيل المسبق للمرشحين"},
          html:D({obj:"Distinguer pré-qualification et qualification post-offre, identifier les pièces à exiger, appliquer des critères homogènes.",
            sections:[
              {h:"Pourquoi qualifier ?",p:[
                "Un marché mal attribué à un titulaire incapable coûte plus cher qu'un marché non conclu : retards, malfaçons, contentieux, ré-attributions. La qualification protège l'INSAPT contre trois risques : capacité juridique douteuse (sociétés écrans, liquidation), capacité technique insuffisante, capacité financière fragile (trésorerie ne tenant pas jusqu'au premier paiement)."]},
              {h:"Deux modes selon la procédure",p:[
                "<b>Pré-qualification</b> : en amont pour les marchés complexes et obligatoire pour les DSP (art. 107). Liste restreinte de candidats retenus, invités à soumissionner.",
                "<b>Qualification post-offre</b> : mode par défaut en AOO. Tous peuvent soumissionner ; les pièces sont examinées après l'ouverture."]},
              {h:"Check-list des pièces à exiger",ul:[
                "<b>Juridique</b> : registre du commerce, statuts, mandat du signataire, NIF.",
                "<b>Fiscal/social</b> : attestations d'être en règle.",
                "<b>Technique</b> : références similaires (nature, montant, MO, attestations de bonne exécution), CV clés, moyens.",
                "<b>Financier</b> : CA 3 exercices, bilans, attestation bancaire.",
                "<b>Intégrité</b> : déclaration sur l'honneur d'absence d'exclusion.",
                "<b>Spécifique travaux</b> : certificat de qualification (art. 7)."]},
              {h:"Critères : proportionnés et non discriminatoires (art. 82)",p:[
                "Tout critère appliqué en évaluation sans avoir été annoncé dans le DAO est un motif d'annulation. Les critères doivent être vérifiables et proportionnés : exiger 10 ans d'expérience pour un besoin banal exclut abusivement les PME."]}
            ],
            ex:"AOO fourniture d'ordinateurs. DAO exige '5 marchés similaires réalisés au Tchad'. Un fabricant régional très solide, sans historique tchadien, propose 20 % moins cher et conforme techniquement. Écarté sur le critère géographique. Recours CRD : critère non justifié par la nature du besoin → risque d'annulation.",
            traps:[
              "Aligner les critères sur les qualités d'un fournisseur préféré : discrimination.",
              "Confondre pré-qualification (avant) et évaluation technique (après).",
              "Accepter des attestations expirées.",
              "Exiger des traductions certifiées sans délai raisonnable."],
            key:[
              "Critères dans le DAO, proportionnés, vérifiables.",
              "Qualification sur pièces valides à la date d'ouverture.",
              "Doute → demande d'éclaircissement écrite, jamais arbitraire."],
            src:"Code, art. 7, 82, 95-97, 107 ; Manuel INSAPT, ch. 6-7."})},

        { t:{fr:"Détermination des besoins & planification (PPM)",en:"Needs assessment & planning (PPM)",ar:"تحديد الاحتياجات والتخطيط"},
          html:D({obj:"Rédiger un besoin qui produit des offres comparables, construire un PPM conforme à l'art. 71 et arbitrer l'allotissement.",
            sections:[
              {h:"L'article 71 : pas d'achat hors plan",p:[
                "Chaque année, à la préparation du budget, l'INSAPT établit un PPM annuel : liste prévisionnelle de tous les marchés (objet, mode, calendrier, estimation, source de financement), conforme au modèle-type de l'ARMP, cohérent avec les crédits, révisable et publié. Sanction : un marché non inscrit au PPM est <b>nul</b>. L'audit ARMP la relève systématiquement."]},
              {h:"Exprimer le besoin correctement",p:[
                "Un besoin bien exprimé décrit un <b>résultat attendu</b>, pas une marque. Trois angles :"],
               ul:[
                "<b>Fonctionnel</b> : performance minimale attendue ('microscope à ×1000 en immersion pour diagnostic parasitologique').",
                "<b>Technique</b> : normes, tolérances, compatibilités ('conforme ISO 9345, compatible objectifs existants').",
                "<b>Contextuel</b> : conditions d'utilisation, maintenance, formation ('SAV disponible à N'Djaména')."],
               p:["L'estimation du coût est <b>documentée par écrit</b> par étude de marché ou historique. Une estimation dans la tête du chef de service n'est pas une estimation."]},
              {h:"Allotissement (art. 72) vs fractionnement interdit (art. 14)",p:[
                "L'allotissement répartit un besoin global en lots distincts : ouvrir la concurrence aux PME, spécialiser techniquement, sécuriser la fourniture. <b>Allotir ≠ fractionner</b> : le fractionnement vise à descendre sous un seuil pour éviter une procédure — infraction sanctionnée. L'allotissement porte sur un marché restant au-dessus des seuils."]}
            ],
            ex:"Réhabilitation LNSP : 60 M mobilier + 180 M matériel d'analyse + 40 M installation = 280 M FCFA. Solution : un DAO, trois lots. Lot 1 = mobilier, Lot 2 = matériel, Lot 3 = installation. Un candidat peut soumissionner à tous les lots. Concurrence maximale, gestion simplifiée.",
            traps:[
              "Spécifications orientées vers une marque : discrimination.",
              "Sous-estimer pour rester sous seuil : fractionnement déguisé.",
              "PPM publié et jamais mis à jour.",
              "Urgence par défaut de planification : n'est pas une urgence légitime."],
            key:[
              "Pas de PPM → pas de marché.",
              "Besoin = résultat attendu, pas une marque.",
              "Estimation écrite, sourcée, versée au dossier.",
              "Allotir ≠ fractionner."],
            src:"Code, art. 14, 71, 72 ; Manuel INSAPT, ch. 5."})},

        { t:{fr:"Éthique, fraude et corruption",en:"Ethics, fraud and corruption",ar:"الأخلاقيات ومكافحة الفساد"},
          html:D({obj:"Distinguer les quatre pratiques prohibées, comprendre le régime de sanctions et maîtriser le mécanisme de signalement INSAPT.",
            sections:[
              {h:"Quatre pratiques prohibées (art. 25-26)",ul:[
                "<b>Corruption</b> : offrir, donner, recevoir ou solliciter quoi que ce soit de valeur pour influencer une décision publique.",
                "<b>Fraude</b> : falsifier des faits, documents ou déclarations (faux certificat, fausse référence, surfacturation).",
                "<b>Collusion</b> : entente entre soumissionnaires ou avec des agents pour truquer la concurrence (offres de couverture, partage de marchés).",
                "<b>Pratiques coercitives</b> : menacer ou nuire pour influencer une participation ou un témoignage."]},
              {h:"Le régime de sanctions (Titre VI ch. 4)",p:[
                "<b>Administratif</b> : exclusion temporaire ou définitive, publiée au Journal Officiel des marchés. Un fournisseur exclu ne peut soumissionner nulle part.",
                "<b>Pénal</b> : corruption, faux et usage de faux, détournement — peines d'emprisonnement, amendes, confiscation."]},
              {h:"Mécanisme de signalement INSAPT (ch. 16, annexe T)",p:[
                "Tout agent, fournisseur ou partenaire peut signaler via des canaux dédiés (boîte confidentielle, courrier sous pli fermé). Le signalement est enregistré, instruit et suivi. Le lanceur d'alerte de <b>bonne foi</b> est protégé contre toute représaille. Les signalements malveillants sont eux-mêmes sanctionnés."]},
              {h:"Zone grise : cadeaux et hospitalité",p:[
                "Règle INSAPT : refus par défaut de tout cadeau d'un candidat actif. Cadeaux symboliques hors procédure : déclarés à la hiérarchie. Invitations à événements payés par fournisseurs : autorisation écrite préalable."]}
            ],
            ex:"Trois soumissions à un RFQ portent des typographies quasi identiques, prix ordonnés régulièrement (10 000 / 11 000 / 12 000 FCFA/unité). Indice fort de collusion par offres de couverture. Bonne pratique : ne pas attribuer, alerter le Président CPM par écrit, saisir l'ARMP, relancer avec vivier élargi. Fermer les yeux = faute personnelle.",
            traps:[
              "Croire qu'un 'petit cadeau' est anodin : la fréquence et le contexte le transforment en corruption.",
              "Signaler par la rumeur : les canaux formels protègent.",
              "Utiliser le mécanisme pour régler des comptes : signalement malveillant = sanction."],
            key:[
              "Corruption, fraude, collusion, coercition : tolérance zéro.",
              "Double sanction : administrative (exclusion, liste publique) + pénale.",
              "Signalement de bonne foi = protection garantie."],
            src:"Code, art. 25-26, Titre VI ch. 4 ; Manuel INSAPT, ch. 16, annexe T."})},

        { t:{fr:"Le Dossier d'Appel d'Offres (DAO)",en:"The bidding documents (DAO)",ar:"ملف طلب العروض"},
          html:D({obj:"Assembler un DAO complet, rédiger des critères défendables, gérer les Q&R et addenda, éviter les vices de fond.",
            sections:[
              {h:"Les huit composantes du DAO",ul:[
                "<b>1. Avis d'appel d'offres</b> : objet, délai, lieu de dépôt.",
                "<b>2. IAS (Instructions aux soumissionnaires)</b> : langue, monnaie, mode de dépôt, durée de validité, règles Q&R.",
                "<b>3. CCAP</b> : clauses administratives particulières — délais, pénalités, paiement, litiges.",
                "<b>4. CCTP + spécifications</b> : résultats attendus, normes, compatibilités — le cœur du besoin.",
                "<b>5. Bordereau des prix</b> : format commun garantissant la comparabilité.",
                "<b>6. Critères d'évaluation</b> : hiérarchisés, mesurables, monétisés autant que possible (art. 82).",
                "<b>7. Projet de marché</b> : le contrat que signera l'attributaire.",
                "<b>8. Formulaires</b> : soumission, déclarations, cautions."]},
              {h:"Rédiger des critères défendables (art. 82)",p:[
                "Fournitures/travaux simples : moins-disant conforme (prix + conditions éliminatoires claires).",
                "Fournitures complexes/travaux : prix + coût d'exploitation + délai + SAV, pondérations annoncées.",
                "Prestations intellectuelles : SFQC, typiquement 70/30 ou 80/20 technique/prix.",
                "<b>Jamais</b> : critères vagues, critères inventés après ouverture."]},
              {h:"Questions des candidats et addenda",p:[
                "Q&R écrites diffusées à <b>tous</b> les acquéreurs du DAO simultanément. Une réponse modifiant le DAO devient un addendum numéroté. Tout addendum important prolonge le délai de soumission."]},
              {h:"Documents-types ARMP",p:[
                "L'ARMP publie des DAO-types par nature de marché. Leur usage n'est pas une option : ils garantissent la conformité formelle."]}
            ],
            ex:"DAO pour système d'information de laboratoire. Erreur fréquente : CCTP copiant les caractéristiques du logiciel d'un fournisseur préféré → tous les autres disqualifiés. Meilleure pratique : décrire les fonctionnalités attendues (gestion échantillons, traçabilité, conformité ISO), les volumes et interfaces. La compétition redevient loyale ; les prix baissent de 20-30 %.",
            traps:[
              "Copier-coller un DAO ancien sans relecture.",
              "Omettre le projet de marché : candidats soumissionnent 'à l'aveugle'.",
              "Addendum tardif sans prolongation du délai.",
              "Méthode d'attribution vague : annulation CRD."],
            key:[
              "Un DAO complet = 8 composantes.",
              "Critères objectifs, mesurables, annoncés — jamais ajoutés après ouverture.",
              "Q&R diffusées à tous ; addendum = prolongation du délai."],
            src:"Code, art. 12, 82, 83 ; Manuel INSAPT, ch. 7, ch. 19."})},

        { t:{fr:"Ouverture des plis et évaluation des offres",en:"Bid opening and evaluation",ar:"فتح العروض وتقييمها"},
          html:D({obj:"Conduire une ouverture régulière, évaluer sans dérive, produire un rapport défendable, respecter les délais ARMP.",
            sections:[
              {h:"Protocole d'ouverture (art. 43)",p:[
                "L'ouverture se tient à l'heure, la date et le lieu annoncés — jamais avant, jamais après. Présents : membres CPM, un représentant par soumissionnaire. Le Président vérifie plis fermés/cachetés, les ouvre un par un, donne lecture publique (nom, montant, délai, garantie). PV signé <b>séance tenante</b> : gèle les offres, aucune modification possible."]},
              {h:"Évaluation en sous-commission (art. 41, 43) : ≤ 15 jours",p:[
                "Chaque membre signe une déclaration d'absence de COI. Trois filtres :"],
               ul:[
                "<b>Administratif</b> : pièces présentes, valides. Demande d'éclaircissement possible si absence non dirimante.",
                "<b>Technique</b> : notation sur grille du DAO. Offres sous le seuil minimum éliminées.",
                "<b>Financier</b> : correction erreurs arithmétiques, base TTC commune, classement."]},
              {h:"Rapport d'analyse et suite",p:[
                "Document signé par tous les membres. Pour chaque offre : motifs de conformité ou rejet. Classement et proposition d'attribution motivée. Ce rapport est la première défense contre les recours.",
                "Suite : CPM → DGCMP (7 jours) → publication attribution provisoire → standstill (10 jours) → signature → ARMP 48/72 h."]}
            ],
            ex:"AOO équipement chimie, cinq offres. Offre C : attestation fiscale expirée → demande d'éclaircissement → expirée confirmée → rejet motivé. Offre B : gamme incomplète → rejet technique. A (2,4 M) et D (2,1 M) conformes. D moins-disant conforme → proposition d'attribution. Rapport signé, DGCMP silence = accord. Publication. Standstill 10 jours sans recours. Signature.",
            traps:[
              "Repousser l'ouverture pour attendre un candidat : viole l'égalité.",
              "Rédiger le PV après la séance.",
              "Écarter sur des motifs non prévus au DAO.",
              "Dépasser 15 jours sans motif."],
            key:[
              "Ouverture à l'heure, PV séance tenante.",
              "Évaluation ≤ 15 jours, sur les seuls critères du DAO.",
              "Rapport motivé = première défense contre les recours.",
              "Archivage ARMP : 72 h (dossier), 48 h (marché signé)."],
            src:"Code, art. 37, 41, 43, 55, 82 ; Manuel INSAPT, ch. 7-8."})},

        { t:{fr:"Exécution, réception et paiement",en:"Contract execution, acceptance and payment",ar:"التنفيذ والاستلام والدفع"},
          html:D({obj:"Piloter l'exécution d'un marché, mobiliser/libérer les garanties, prononcer une réception défendable et payer dans les délais.",
            sections:[
              {h:"Notification et garanties",p:[
                "La notification écrite déclenche le contrat. Le titulaire mobilise la <b>garantie de bonne exécution</b> (3-10 %). L'avance de démarrage n'est versée qu'<b>après remise de la caution de restitution</b> — jamais d'avance non garantie. Un ordre de service peut fixer la date de démarrage."]},
              {h:"Suivi et avenants",p:[
                "Tout écart (retard, non-conformité, force majeure) constaté par écrit dans les 48 h. Pénalités de retard automatiques si prévues au CCAP.",
                "Avenant : écrit, motivé, soumis CPM + DGCMP. <b>Ne jamais bouleverser l'économie du marché ni changer son objet.</b>"]},
              {h:"La réception (Titre V)",p:[
                "Commission de réception <b>distincte</b> du demandeur et de l'acheteur. Travaux : provisoire puis définitive. Fournitures : contrôle qualitatif, quantitatif, péremption. Services : validation des livrables.",
                "Le PV de réception <b>conditionne le paiement du solde et la libération des garanties</b>."]},
              {h:"Paiement et intérêts moratoires",p:[
                "Paiement au <b>service fait</b> dans les délais légaux. Retard imputable à l'administration → <b>intérêts moratoires</b> au taux légal. Paiement direct des sous-traitants agréés si prévu."]}
            ],
            ex:"Marché réactifs trois lots. Lot 1 : conforme, 30 % payés. Lot 2 : réserve étiquetage, levée 5 jours, 30 % payés. Lot 3 : péremption 18 mois (CCTP exigeait 24 mois) → PV de refus, mise en demeure, pénalités. Remplacement → PV définitif, solde payé. Sans CCTP clair sur la péremption, le refus aurait été indéfendable.",
            traps:[
              "Avance sans caution de restitution.",
              "Réceptionner par courtoisie : le PV signé engage l'Institut.",
              "Avenant oral ou par email.",
              "Ignorer les intérêts moratoires : réclamables contentieusement."],
            key:[
              "Garanties = protection de l'INSAPT.",
              "Réception par commission distincte = contrôle interne.",
              "Avenant motivé, limité, jamais tacite.",
              "Service fait ⇒ paiement dans les délais.",
              "Le decompte de résiliation précise les obligations financières de chaque partie.",
              "La retenue de garantie (5-10 % du marché) est libérée à la réception définitive après levée de toutes les réserves."],
            src:"Code, Titre IV, Titre V ; Manuel INSAPT, ch. 8-11."})},

        { t:{fr:"Séparation des fonctions & contrôle interne",en:"Segregation of duties & internal control",ar:"الفصل بين المهام والرقابة الداخلية"},
          html:D({obj:"Appliquer la séparation des fonctions aux quatre rôles clés, articuler contrôle interne/a priori/a posteriori.",
            sections:[
              {h:"Quatre rôles à séparer",p:[
                "Le contrôle interne empêche la fraude par construction. La règle des 'quatre yeux' réduit simultanément le risque de fraude et les erreurs ordinaires."],
               ul:[
                "<b>Demandeur</b> : exprime le besoin, spécifie, utilisera la prestation.",
                "<b>Acheteur</b> : cellule de passation — conduit la procédure, rédige le contrat.",
                "<b>Réceptionnaire</b> : commission qui constate la conformité de la livraison.",
                "<b>Ordonnateur/Payeur</b> : engage le paiement + agent comptable qui le décaisse."],
               p:["Aucun de ces rôles ne peut être joué par la même personne pour un même marché."]},
              {h:"Trois niveaux de contrôle",ul:[
                "<b>Interne INSAPT</b> : séparation des fonctions, validations hiérarchiques, archivage.",
                "<b>A priori DGCMP (art. 54-55)</b> : avis motivé sur DAO, attribution, projet de marché — 7 jours ouvrables (silence = accord).",
                "<b>A posteriori ARMP (art. 64)</b> : audit annuel — 100 % des marchés > 300 M, 25 % entre 10 et 300 M, 5 % des bons < 10 M. Auditeur indépendant recruté par AO.",
                "<b>Incompatibilités (art. 65)</b> : nul ne cumule CPM + DGCMP + ARMP."]},
              {h:"La traçabilité",p:[
                "PV, avis, signatures datées, registres, correspondances, archives. Délais ARMP : 48 h (marchés signés), 72 h (dossiers). Conservation légale : 10 ans."]}
            ],
            ex:"Chef de service demande un équipement, rédige le DAO avec ses specs, siège à la CPM, préside la réception, vise le bon à payer. Un individu contrôle tout le cycle. L'audit ARMP relève l'absence de séparation : défaillance grave. Sanction : rappel à l'ordre, formation obligatoire, durcissement des contrôles.",
            traps:[
              "'Petite équipe' n'est pas une excuse : les risques sont encore plus élevés.",
              "Signer par complaisance un PV auquel on n'a pas assisté.",
              "Avis DGCMP remplacé par un accord oral.",
              "Négliger les archives."],
            key:[
              "Quatre rôles = quatre personnes distinctes.",
              "Trois niveaux : interne (INSAPT) / a priori (DGCMP) / a posteriori (ARMP).",
              "Incompatibilités strictes CPM/DGCMP/ARMP (art. 65).",
              "Traçabilité = le contrôle repose sur des traces.",
              "Chaque validation est datée, signée et versée au dossier avant le déclenchement de l'étape suivante.",
              "La tenue du registre des marchés (objet, montant, titulaire, statut) est une obligation minimale de toute cellule de passation."],
            src:"Code, art. 52-55, 64-65 ; Manuel INSAPT, ch. 4, ch. 12 SOP 6."})}
      ]
    },

    /* 2 ▸ CODE — 10 modules (adossés aux Titres du Code) */
    {
      id: "code", icon: "§", color: "#C60C30",
      exam: { pool: ["code"], n: 20, minutes: 30 },
      name: { fr: "Introduction au Code des Marchés Publics", en: "Introduction to the Public Procurement Code", ar: "مدخل إلى مدونة الصفقات العمومية" },
      desc: { fr: "10 modules sur le Décret N°2130/PR/2020 : champ, seuils, organes, modes de passation, exécution, recours et sanctions.", en: "10 modules on Decree No. 2130/PR/2020: scope, thresholds, organs, methods, execution, remedies and sanctions.", ar: "١٠ وحدات حول المرسوم رقم ٢١٣٠/٢٠٢٠" },
      modules: [
        { t:{fr:"Genèse et architecture du Code",en:"Origin and structure of the Code",ar:"نشأة المدونة وهيكلها"},
          html:D({obj:"Situer le Décret N°2130/PR/2020 dans la hiérarchie des normes et décrire son architecture en sept Titres.",
            sections:[
              {h:"Contexte et portée",p:[
                "Le Code des Marchés Publics du Tchad, porté par le Décret N°2130/PR/2020, abroge le code de 2015 et régit la préparation, la passation, l'exécution, le contrôle et la régulation de tous les marchés publics et délégations de service public. Il s'applique à tous les financements (art. 8), sauf primauté des accords internationaux contraires.",
                "L'INSAPT, en tant qu'établissement public (art. 4), est pleinement soumis au Code. Ses marchés sont passés sous l'autorité du Directeur Général (art. 28)."]},
              {h:"Architecture : sept Titres",ul:[
                "<b>Titre I</b> — Dispositions générales : définitions (art. 1-2), principes (art. 3), champ (art. 4-8), seuils (art. 9-17), préalables (art. 18), types de marchés (art. 19-24), éthique (art. 25-26).",
                "<b>Titre II</b> — Organes : maîtres d'ouvrage (art. 28-30), CPM (art. 31-49), autorités approbatrices (art. 50-51), DGCMP (art. 52-58), ARMP (art. 59-68).",
                "<b>Titre III</b> — Passation : planification/PPM (art. 70-73), appel d'offres (art. 76-103), prestations intellectuelles (art. 95-99), gré à gré (art. 100-102), DSP (art. 105-109).",
                "<b>Titre IV</b> — Exécution et règlement : garanties, variation de prix, avenants, paiements.",
                "<b>Titre V</b> — Contrôle de l'exécution et résiliation.",
                "<b>Titre VI</b> — Contentieux et sanctions : recours (art. 210-221), sanctions (art. 222-230).",
                "<b>Titre VII</b> — Dispositions finales : dématérialisation, documents types."]},
              {h:"Texte officiel",p:[
                "PDF officiel publié par l'ARMP (armp-tchad.com/decrets). L'onglet 'Code des Marchés Publics' du Portail SCM INSAPT permet la recherche par mot-clé dans les 69 articles."]}
            ],
            ex:"Un bailleur finance un équipement INSAPT avec ses propres règles de passation. L'art. 8 s'applique : les règles du bailleur priment sur les dispositions contraires du Code, mais les dispositions non contraires demeurent applicables. En pratique : DAO-type du bailleur, mais obligations d'archivage nationales (art. 37) et règles d'éthique (art. 25-26) maintenues.",
            traps:[
              "Croire que le Code ne s'applique qu'aux marchés sur fonds propres de l'État.",
              "Confondre décret 2020 (en vigueur) et décret 2015 (abrogé).",
              "Chercher les seuils dans le Code sans vérifier les décrets d'application."],
            key:[
              "Décret N°2130/PR/2020 = Code en vigueur depuis 2020.",
              "Sept Titres : du champ d'application aux dispositions finales.",
              "Primauté des accords internationaux sur les dispositions contraires."],
            src:"Code, art. 3, 4, 8, 28 ; armp-tchad.com/decrets."})},

        { t:{fr:"Définitions clés (art. 1-2)",en:"Key definitions (arts. 1-2)",ar:"التعريفات الأساسية"},
          html:D({obj:"Maîtriser une vingtaine de définitions fondamentales du Code.",
            sections:[
              {h:"Les acteurs",ul:[
                "<b>Autorité contractante / Maître d'ouvrage</b> : la personne morale de droit public qui passe le marché — à l'INSAPT, représentée par son DG.",
                "<b>Maître d'ouvrage délégué</b> : entité mandatée par document écrit (sans délégation écrite = nullité).",
                "<b>Candidat → Soumissionnaire → Attributaire → Titulaire</b> : quatre stades du même acteur (manifeste, dépose une offre, est retenu provisoirement, signe le marché approuvé)."]},
              {h:"Les documents",ul:[
                "<b>DAO</b> : ensemble des documents mis à disposition des candidats.",
                "<b>CCAG/CCAP</b> : clauses administratives générales et particulières (le CCAP déroge au CCAG sur les points qu'il précise).",
                "<b>CCTG/CCTP</b> : clauses techniques générales et particulières.",
                "<b>Avenant</b> : acte écrit modifiant des clauses du marché après signature.",
                "<b>Allotissement</b> : répartition en lots distincts."]},
              {h:"Les procédures",ul:[
                "<b>Gré à gré (entente directe)</b> : attribution sans AOO, après accord du Ministre. Exceptionnel et limitatif (art. 101).",
                "<b>RFQ / Demande de cotation</b> : consultation allégée sous seuil, ≥ 3 fournisseurs.",
                "<b>DSP</b> : concession, affermage ou régie — délégataire rémunéré par les résultats.",
                "<b>Offre moins-disante vs mieux-disante</b> : moins-disante = moins chère conforme ; mieux-disante = meilleur rapport qualité-coût pondéré."]}
            ],
            ex:"Un rapport d'évaluation indique 'Offre A retenue comme moins-disante conforme'. Cela signifie : moins chère parmi les offres jugées conformes aux exigences administratives et techniques. Si le DAO prévoyait une méthode qualité-coût, l'attribution aurait dû aller à la 'mieux-disante' au sens de la notation pondérée. Confondre les deux méthodes est un motif de recours.",
            traps:[
              "Confondre 'moins-disant' (prix) et 'mieux-disant' (qualité-coût).",
              "Signer sans document de délégation formalisé : nullité.",
              "Utiliser 'CCAG' et 'CCAP' comme synonymes."],
            key:[
              "Candidat → Soumissionnaire → Attributaire → Titulaire.",
              "DAO, CCAP, CCTP : trois documents, trois fonctions.",
              "Gré à gré = exceptionnel et limitatif (art. 100-101)."],
            src:"Code, art. 1-2, 100-101 ; Manuel INSAPT, ch. 2."})},

        { t:{fr:"Champ d'application et exclusions (art. 4-8)",en:"Scope and exclusions (arts. 4-8)",ar:"نطاق التطبيق والاستثناءات"},
          html:D({obj:"Identifier qui est soumis au Code, les exclusions légitimes et la primauté des accords internationaux.",
            sections:[
              {h:"Qui est soumis ? (art. 4)",p:[
                "L'État (ministères, institutions), les collectivités autonomes, les établissements publics (dont l'INSAPT), les entreprises publiques et sociétés à participation publique majoritaire, et les organismes créés par l'État pour des besoins d'intérêt général, financés ou garantis par l'État. Extension possible aux personnes de droit privé bénéficiant du concours ou de la garantie de l'État."]},
              {h:"Qui n'est pas admis à concourir ? (art. 7)",ul:[
                "Personnes frappées d'exclusion temporaire ou définitive.",
                "Fonctionnaires et agents en fonction (et entités où ils ont eu une participation < 2 ans).",
                "Entités liées à l'autorité contractante, à un membre CPM ou de la sous-commission.",
                "Membres du gouvernement, cabinets ministériels, élus.",
                "Personnes sous sanctions correctionnelles (impôts, douanes), déchues de capacité civile.",
                "Entreprises de travaux sans certificat de qualification.",
                "Consultants ayant préparé le DAO (et leurs affiliés)."]},
              {h:"Dérogations (art. 5, 8, 104)",p:[
                "<b>Produits pétroliers (art. 5)</b> : essence/gasoil pour véhicules administratifs et groupes électrogènes, au barème officiel CNH — excluant l'exploitation industrielle.",
                "<b>Marchés spéciaux (art. 104)</b> : défense, sécurité, intérêts stratégiques exigeant le secret — dispensés de publicité.",
                "<b>Accords internationaux (art. 8)</b> : dispositions d'un traité de financement priment sur les dispositions contraires du Code."]}
            ],
            ex:"L'INSAPT achète du gasoil pour ses groupes électrogènes (8 M FCFA/mois). Art. 5 : achat au barème officiel, sans procédure. Si le gasoil était destiné à une activité industrielle de production : dérogation inapplicable.",
            traps:[
              "Croire que la dérogation carburant couvre tous les achats pétroliers sans distinction.",
              "Oublier que les filiales d'agents publics (participation < 2 ans) sont exclues.",
              "Attribuer à un consultant ayant préparé le DAO : nullité."],
            key:[
              "INSAPT = établissement public → pleinement soumis au Code.",
              "Art. 7 : liste des exclus limitative et précise.",
              "Art. 5 : dérogation carburant — véhicules administratifs seulement."],
            src:"Code, art. 4-8, 104 ; Manuel INSAPT, ch. 2."})},

        { t:{fr:"Les seuils (art. 9-17)",en:"Thresholds (arts. 9-17)",ar:"العتبات"},
          html:D({obj:"Mémoriser les six chiffres clés et appliquer le bon mode de passation selon le seuil et la nature du besoin.",
            sections:[
              {h:"Six chiffres à retenir par cœur",ul:[
                "<b>Seuils d'assujettissement (art. 9)</b> — en dessous, hors Code :",
                "  → Travaux : < 50 000 000 FCFA",
                "  → Fournitures & Services : < 30 000 000 FCFA",
                "  → Prestations intellectuelles : < 20 000 000 FCFA",
                "<b>Seuils AON (art. 10)</b> — au-dessus, appel d'offres international (art. 11) :",
                "  → Travaux : ≤ 2 000 000 000 FCFA",
                "  → Fournitures : ≤ 1 000 000 000 FCFA",
                "  → Services : ≤ 400 000 000 FCFA",
                "  → Prestations intellectuelles : ≤ 500 000 000 FCFA"]},
              {h:"Entre les seuils : les modes intermédiaires",p:[
                "<b>Sous 10 M FCFA (art. 13)</b> : consultation directe — pas de procédure formelle mais documentation obligatoire.",
                "<b>Entre 10 M et le seuil d'assujettissement (art. 12)</b> : procédure simplifiée (RFQ ≥ 3 cotations écrites).",
                "<b>Du seuil d'assujettissement au seuil AON</b> : Appel d'Offres National (AON) — publicité ≥ 30 jours, CPM, DGCMP.",
                "<b>Au-dessus du seuil AON (art. 11)</b> : Appel d'Offres International — publicité élargie, délais plus longs."]},
              {h:"Infractions aux seuils (art. 14-16)",p:[
                "<b>Fractionnement (art. 14)</b> : scinder un marché pour rester sous seuil — strictement interdit, sanctions Titre VI.",
                "<b>Commandes successives similaires (art. 15)</b> : plusieurs commandes séparées pour prestations identiques jusqu'à atteindre le seuil — interdit."]}
            ],
            ex:"L'INSAPT achète des réactifs PCR VIH en mars (28 M), en juin (22 M) et en septembre (18 M) chez le même fournisseur pour des besoins identiques. Total : 68 M > seuil 30 M. Commandes successives similaires prohibées (art. 15) si non justifiées par des besoins imprévisibles distincts. Auraient dû faire l'objet d'un AON unique.",
            traps:[
              "Croire que trois achats sous 30 M = OK si le total dépasse le seuil.",
              "Confondre seuil d'assujettissement et seuil AON.",
              "Appliquer les seuils travaux à un achat de fournitures."],
            key:[
              "6 chiffres : 50/30/20 M (assujettissement) et 2 Mds/1 Md/400 M/500 M (AON).",
              "Fractionnement et commandes successives similaires : interdits, sanctionnés.",
              "Sous 10 M : consultation directe. Entre 10 M et seuil : procédure simplifiée."],
            src:"Code, art. 9-17 ; Manuel INSAPT, ch. 3."})},

        { t:{fr:"Les organes : CPM, DGCMP, ARMP (Titre II)",en:"The organs: CPM, DGCMP, ARMP (Title II)",ar:"الهيئات"},
          html:D({obj:"Distinguer les trois types d'organes, leurs missions, leurs délais et les incompatibilités qui les séparent.",
            sections:[
              {h:"La CPM — organe de passation (art. 31-49)",p:[
                "Organe d'appui technique placé auprès du maître d'ouvrage. Organise les séances d'ouverture, commet les sous-commissions d'analyse (≤ 15 jours), propose l'attribution et émet un avis technique sur les projets de marchés et d'avenants.",
                "Délai de statut : <b>21 jours max</b> (15 jours en urgence). Documentation transmise à l'ARMP sous <b>72 h</b> (dossiers) et <b>48 h</b> (marchés et avenants signés)."]},
              {h:"La DGCMP — contrôle a priori (art. 52-58)",p:[
                "Placée sous l'autorité du Ministre en charge des marchés publics. Émet un avis motivé sur le DAO avant lancement, les autorisations/dérogations, le rapport d'analyse/PV d'attribution, et le projet de marché avant approbation.",
                "Délai : <b>7 jours ouvrables</b> à compter de la réception d'un dossier complet. Au-delà : avis réputé favorable. Désaccord persistant → arbitrage ARMP sous 15 jours, décision contraignante."]},
              {h:"L'ARMP — régulation et a posteriori (art. 59-68)",p:[
                "Organe tripartite (Administration + secteur privé + société civile) auprès de la Présidence. Missions : réglementation, formation, documents-types, journal des marchés, audits a posteriori indépendants, sanctions, CRD.",
                "Audit annuel : 100 % des marchés > 300 M FCFA + 25 % entre 10 et 300 M + 5 % des bons de commande < 10 M. Résultats publiés."]},
              {h:"Incompatibilités (art. 65)",p:[
                "Nul ne peut être Président de plus d'une CPM, ni être à la fois membre d'une CPM et appartenir à la DGCMP ou à l'ARMP. Garantie institutionnelle de la séparation des fonctions."]}
            ],
            ex:"AON INSAPT 120 M FCFA. Séquence : DAO soumis à DGCMP (J+0) → avis DGCMP ≤ 7 jours ouvrables → lancement + publicité 30 jours → ouverture → évaluation ≤ 15 jours → rapport CPM ≤ 21 jours → avis DGCMP attribution → publication → standstill → signature → transmission ARMP 48 h.",
            traps:[
              "Lancer un DAO sans avis préalable DGCMP : irrégularité formelle.",
              "Croire que silence DGCMP après 7 jours = désaccord : c'est l'inverse.",
              "Cumuler fonctions CPM et DGCMP."],
            key:[
              "CPM : passation, ≤ 21 jours pour statuer.",
              "DGCMP : contrôle a priori, 7 jours ouvrables (silence = accord).",
              "ARMP : régulation, audits, CRD.",
              "Archivage : 72 h (dossiers), 48 h (marchés signés)."],
            src:"Code, art. 31-68 ; Manuel INSAPT, ch. 4."})},

        { t:{fr:"L'appel d'offres ouvert (art. 76-89)",en:"Open tendering (arts. 76-89)",ar:"طلب العروض المفتوح"},
          html:D({obj:"Conduire un AOO de bout en bout : publicité, DAO, ouverture, évaluation, attribution.",
            sections:[
              {h:"L'AOO : la règle de droit commun (art. 76)",p:[
                "L'appel d'offres ouvert est le mode de passation par défaut. Tout fournisseur satisfaisant aux conditions peut soumissionner. Le recours à tout autre mode est exceptionnel, justifié par le maître d'ouvrage et autorisé par le Ministre."]},
              {h:"Publicité et délai minimum (art. 84)",p:[
                "L'avis est publié au moins <b>30 jours calendaires</b> avant la date limite de réception des offres, dans les publications habilitées et sur les sites internet officiels (ARMP, site INSAPT). L'avis contient : objet, lieu d'obtention du DAO, délai de dépôt, montant de la caution, coordonnées de l'autorité contractante."]},
              {h:"Évaluation et attribution (art. 82-83)",p:[
                "Attribution <b>sans négociation</b>, sur les seuls critères annoncés dans le DAO, exprimés autant que possible en termes monétaires. Offre conforme la mieux-disante (ou moins-disante conforme selon la méthode). L'attributaire provisoire est publié.",
                "L'AOO est valable seulement si au moins <b>une soumission conforme</b> est reçue. Infructueux → relance AOO ou consultation ≥ 3 candidats après autorisation DGCMP."]},
              {h:"Infructuosité",p:[
                "Aucune offre reçue ou toutes non conformes → AOO infructueux, décision motivée et publiée. Deux suites : nouvel AOO ou AOR (≥ 3 candidats, autorisation DGCMP)."]}
            ],
            ex:"AOO maintenance équipements laboratoire. Cinq offres reçues. Offre C remise 2 h après la date limite → rejetée séance tenante, consignée au PV. Quatre restantes évaluées : deux non conformes techniquement, deux conformes. La moins chère des deux conformes est proposée à l'attribution. Avis DGCMP par silence. Publication, standstill 10 jours sans recours. Signature.",
            traps:[
              "Accepter une offre remise après la date limite.",
              "Négocier le prix avec l'attributaire avant signature.",
              "Déclarer infructueux sans preuves documentées.",
              "Publier avec moins de 30 jours sans autorisation DGCMP."],
            key:[
              "AOO = mode par défaut, publicité ≥ 30 jours, attribution sans négociation.",
              "Valide si au moins une offre conforme reçue.",
              "Infructueux → relance ou AOR avec autorisation DGCMP."],
            src:"Code, art. 76, 82-84 ; Manuel INSAPT, ch. 7."})},

        { t:{fr:"Procédures dérogatoires : restreint & gré à gré (art. 90-101)",en:"Derogatory procedures (arts. 90-101)",ar:"الإجراءات الاستثنائية"},
          html:D({obj:"Identifier les cas légitimes d'AOR et de gré à gré, maîtriser les conditions d'autorisation et éviter les usages abusifs.",
            sections:[
              {h:"L'appel d'offres restreint — AOR (art. 90)",p:[
                "L'AOR limite la consultation à des candidats présélectionnés (<b>minimum 3</b>). Il n'est possible qu'après avis de l'organe de contrôle, dans les cas suivants :"],
               ul:[
                "Urgence impérieuse imprévisible ne permettant pas les délais d'AOO.",
                "AOO précédent déclaré infructueux.",
                "Marchés de recherche, essai, expérimentation.",
                "Défaillance du titulaire initial.",
                "Nombre limité de fournisseurs capables d'exécuter."]},
              {h:"Le gré à gré (entente directe) — art. 100-101",p:[
                "Attribution sans appel d'offres, après autorisation préalable du Ministre. La demande est motivée. <b>Les quatre cas limitatifs de l'art. 101 :</b>"],
               ul:[
                "Brevet, licence ou droits exclusifs détenus par un seul prestataire.",
                "Prestataire unique pour raisons techniques ou artistiques.",
                "Extrême urgence pour remplacer un titulaire défaillant.",
                "Urgence impérieuse résultant d'une force majeure."],
               p:["<b>Même en gré à gré</b> : contrat écrit, contrôle DGCMP, archivage ARMP obligatoires."]},
              {h:"Autorisation préalable (art. 45)",p:[
                "Pour le gré à gré : demande écrite et motivée au Ministre. Pour l'AOR : avis de l'organe de contrôle. L'autorisation est versée au dossier et transmise à l'ARMP."]}
            ],
            ex:"LNSP : séquenceur tombe en panne. Seul le fabricant d'origine (breveté) peut fournir la pièce compatible. Art. 101, cas 1 : droits exclusifs. Demande gré à gré motivée au Ministre, autorisation obtenue, consultation directe, contrat écrit, avis DGCMP, archivage. Si la pièce était disponible chez trois distributeurs régionaux, le gré à gré aurait été illicite.",
            traps:[
              "Invoquer l'urgence créée par un défaut de planification : art. 101 ne couvre que la force majeure imprévisible.",
              "Gré à gré récurrent pour le même besoin : fraude aux seuils.",
              "Croire que le gré à gré dispense du contrat écrit et du contrôle."],
            key:[
              "AOR : minimum 3 candidats, avis DGCMP obligatoire.",
              "Gré à gré : 4 cas limitatifs (art. 101), autorisation ministérielle préalable.",
              "Même en gré à gré : contrat écrit + contrôle + archivage."],
            src:"Code, art. 45, 90, 100-101 ; Manuel INSAPT, ch. 7."})},

        { t:{fr:"Prestations intellectuelles & DSP (art. 95-107)",en:"Consulting services & PPP (arts. 95-107)",ar:"الخدمات الفكرية وتفويض المرفق العام"},
          html:D({obj:"Appliquer les méthodes de sélection des consultants, préparer une liste restreinte, comprendre le régime des DSP.",
            sections:[
              {h:"Spécificités (art. 24, 95-99)",p:[
                "Les prestations intellectuelles (maîtrise d'œuvre, assistance technique, études, audit, formation) ne se prêtent pas à une mise en concurrence uniquement sur le prix. La qualité de l'équipe et de la méthodologie est prédominante. D'où une procédure spécifique."]},
              {h:"Procédure : liste restreinte et deux enveloppes",ul:[
                "<b>Étape 1</b> : Publication d'un Avis à Manifestation d'Intérêt (AMI) avec TDR, profil requis, critères de pré-qualification. Délai ≥ 30 jours sauf avis DGCMP.",
                "<b>Étape 2</b> : Liste restreinte (généralement 3-6 cabinets).",
                "<b>Étape 3</b> : Lettre d'Invitation à Soumissionner avec DAO complet.",
                "<b>Étape 4</b> : Deux enveloppes — offres techniques d'abord, puis offres financières des seuls candidats techniquement qualifiés."]},
              {h:"Méthodes de sélection (art. 96-97)",ul:[
                "<b>Qualité-coût (SFQC)</b> : note technique + note financière pondérées. Type : 70-80 % technique / 20-30 % financier.",
                "<b>Budget déterminé</b> : même budget pour tous ; meilleure offre technique retenue.",
                "<b>Moindre coût</b> : parmi ceux ayant atteint la note technique minimale, le moins cher.",
                "<b>Qualité uniquement (art. 97)</b> : missions de complexité ou de caractère stratégique exceptionnel."]},
              {h:"Délégations de service public — DSP (art. 105-107)",p:[
                "Concession, affermage ou régie intéressée. Pré-qualification obligatoire (art. 107), publicité, délai de soumission ≥ <b>45 jours</b>, sélection validée en amont par l'organe de contrôle."]}
            ],
            ex:"L'INSAPT cherche un cabinet pour auditer son système qualité, budget estimé 25 M FCFA (seuil prestations intellectuelles : 20 M → Code applicable). Liste restreinte (3 cabinets), méthode qualité-coût (80/20). Cabinet A : technique 78/100, prix 22 M FCFA. Cabinet B : technique 62/100, prix 20 M FCFA. Score pondéré A = 78×0,8 + (22/20)×20×0,2 → calcul favorise A si son prix n'est pas excessif.",
            traps:[
              "Appliquer la méthode 'moins-disant' aux prestations intellectuelles.",
              "Ouvrir les enveloppes financières avant de terminer l'évaluation technique.",
              "DSP sans pré-qualification : nullité (art. 107)."],
            key:[
              "Prestations intellectuelles : liste restreinte, deux enveloppes, méthode qualité-coût.",
              "DSP : pré-qualification obligatoire, délai ≥ 45 jours.",
              "La qualité prime sur le prix pour les missions intellectuelles complexes."],
            src:"Code, art. 24, 95-99, 105-107 ; Manuel INSAPT, ch. 7."})},

        { t:{fr:"Préférences, sous-traitance & recours (art. 77-81, Titre VI)",en:"Preferences, subcontracting & remedies",ar:"الأفضليات والمناولة والطعون"},
          html:D({obj:"Appliquer les marges de préférence, encadrer la sous-traitance et guider un candidat lésé vers les voies de recours.",
            sections:[
              {h:"Préférence nationale (art. 80) : ≤ 15 %",p:[
                "En appel d'offres international, préférence possible aux soumissionnaires nationaux (entreprises tchadiennes) si : (1) offre jugée conforme, (2) prix ≤ prix international mieux-disant × 1,15. <b>Préférence annoncée dans le DAO</b> — sinon inapplicable."]},
              {h:"Préférence genre (art. 81) : 10 %",p:[
                "Préférence de <b>10 %</b> pour les entreprises ou groupements de femmes d'affaires de nationalité tchadienne. Condition : annoncée dans le DAO."]},
              {h:"Sous-traitance (art. 77) : plafond 30 %",p:[
                "Sous-traitance admise jusqu'à <b>30 %</b> de la valeur globale si : (a) acceptation et agrément du maître d'ouvrage pour chaque sous-traitant ; (b) prévu au DAO ; (c) déclaré dans l'offre (nature et montant). Au-delà de 30 % : interdit."]},
              {h:"Voies de recours (Titre VI)",ul:[
                "<b>Recours amiable</b> auprès de l'autorité contractante, à tout stade.",
                "<b>CRD de l'ARMP</b> : entre publication de l'avis et attribution, ou après publication des résultats. Peut être suspensif.",
                "<b>Recours hiérarchique</b> : litiges d'exécution.",
                "<b>Recours juridictionnel</b> : devant les juridictions compétentes."]}
            ],
            ex:"AOI réactifs. Entreprise nationale A : 118 M FCFA. Meilleur international : 100 M FCFA. Préférence 15 % déclarée dans DAO. Seuil : 100 M × 1,15 = 115 M. A = 118 M > 115 M → préférence ne s'applique pas, international retenu. Si A était à 113 M < 115 M → préférence appliquée, A retenu.",
            traps:[
              "Appliquer la préférence nationale sans l'avoir annoncée dans le DAO.",
              "Autoriser une sous-traitance > 30 %.",
              "Attendre la signature pour exercer un recours : certaines voies sont alors fermées."],
            key:[
              "Préférence nationale ≤ 15 %, genre ≤ 10 % — dans le DAO, sinon inapplicables.",
              "Sous-traitance ≤ 30 % — agréée, déclarée dans l'offre.",
              "Recours : amiable → CRD ARMP → juridiction."],
            src:"Code, art. 77-81, Titre VI ; Manuel INSAPT, ch. 8."})},

        { t:{fr:"Exécution, sanctions et dématérialisation (Titres IV-VII)",en:"Execution, sanctions and e-procurement (Titles IV-VII)",ar:"التنفيذ والعقوبات والرقمنة"},
          html:D({obj:"Décrire le régime des garanties, des paiements et des avenants, les sanctions applicables et la trajectoire de dématérialisation.",
            sections:[
              {h:"Titre IV — Exécution et règlement",p:[
                "<b>Garanties</b> : caution de soumission, garantie de bonne exécution (3-10 %), retenue de garantie (libérée à la réception définitive), caution de restitution d'avances.",
                "<b>Variation de prix</b> : clauses de révision pour les marchés de longue durée.",
                "<b>Avenants</b> : écrits, motivés, CPM + organe de contrôle. Ne doivent jamais bouleverser l'économie du marché."]},
              {h:"Paiement (service fait et intérêts moratoires)",p:[
                "Paiement après <b>service fait</b> constaté par PV. Retard imputable à l'administration → <b>intérêts moratoires</b> au taux légal. Paiement direct des sous-traitants agréés si prévu."]},
              {h:"Titre VI — Sanctions (art. 222-230)",p:[
                "L'ARMP prononce des sanctions pécuniaires et d'exclusion contre les acteurs du secteur privé ayant violé la réglementation. Liste publiée au Journal Officiel des marchés. Agents publics fautifs : sanctions disciplinaires et pénales de droit commun."]},
              {h:"Titre VII — Dématérialisation",p:[
                "Le Code encourage l'échange et la conservation d'informations par voie électronique (EDI). L'ARMP gère le portail national des marchés publics, publie les avis et résultats en temps réel. La dématérialisation renforce la traçabilité et la transparence."]}
            ],
            ex:"Titulaire livre mobilier avec 15 jours de retard. CCAP : pénalités 0,05 %/jour. Pénalités dues : 0,05 % × 15 × montant = 0,75 % du montant. Déduit du dernier paiement automatiquement. Si l'INSAPT tarde à payer le solde 30 jours après réception conforme : titulaire peut réclamer intérêts moratoires au taux légal.",
            traps:[
              "Croire que les pénalités doivent être réclamées formellement : automatiques si CCAP le prévoit.",
              "Verser une avance sans caution de restitution.",
              "Penser que la dématérialisation est optionnelle."],
            key:[
              "Garanties = protection contre les défaillances.",
              "Service fait → paiement dans les délais → pas d'intérêts moratoires.",
              "Sanctions ARMP : exclusion + publication.",
              "Dématérialisation : trajectoire inévitable, portail ARMP."],
            src:"Code, Titres IV-VII ; Manuel INSAPT, ch. 8-11, ch. 17."})},
      ]
    },

    /* 3 ▸ SOP — 10 modules */
    {
      id: "sop", icon: "▤", color: "#0a3a7a",
      exam: { pool: ["sop"], n: 20, minutes: 30 },
      name: { fr: "Procédures Générales & SOPs de l'INSAPT", en: "INSAPT General Procedures & SOPs", ar: "الإجراءات العامة وإجراءات التشغيل الموحدة" },
      desc: { fr: "10 modules opérationnels : réquisition, RFQ, appels d'offres, contrats, réception, urgences, réactifs, fournisseurs, KPIs et signalement.", en: "10 operational modules: requisition, RFQ, tenders, contracts, receipt, emergencies, reagents, vendors, KPIs and whistleblowing.", ar: "١٠ وحدات تشغيلية" },
      modules: [
        { t:{fr:"SOP 1 — Réquisition et validation du besoin",en:"SOP 1 — Requisition and need validation",ar:"إجراء ١ — طلب الشراء"},
          html:D({obj:"Rédiger une réquisition conforme, conduire la vérification PPM et crédits, enregistrer la demande dans le registre INSAPT.",
            sections:[
              {h:"Rôle et déclencheur",p:[
                "La réquisition est le document contractuel par lequel un service demandeur formalise son besoin d'achat. Elle déclenche le cycle de passation. Aucune dépense ne peut être engagée sans réquisition écrite préalable validée — même pour un achat sous 10 M FCFA. Elle protège le demandeur (preuve du besoin), la cellule de passation (justification) et l'Institut (traçabilité financière)."]},
              {h:"Contenu obligatoire",ul:[
                "<b>Identification</b> : service demandeur, responsable signataire, date.",
                "<b>Objet</b> : désignation précise des biens, travaux ou services requis.",
                "<b>Spécifications</b> : quantités, unités, spécifications techniques fonctionnelles (résultat attendu, normes, compatibilité) — jamais de marques.",
                "<b>Délai</b> : date de besoin souhaitée, avec justification si urgente.",
                "<b>Budget</b> : estimation du coût, ligne budgétaire, source de financement.",
                "<b>Validation hiérarchique</b> : signature du chef de service et de l'autorité budgétaire."]},
              {h:"Vérification par la cellule de passation",p:[
                "<b>PPM</b> : le besoin est-il inscrit au Plan de Passation des Marchés annuel ? Si non, révision du PPM (approuvée) nécessaire.",
                "<b>Crédits</b> : crédits budgétaires disponibles sur la ligne indiquée ? Si non, blocage (art. 71 et 73).",
                "<b>Fractionnement</b> : la réquisition s'inscrit-elle dans une série de demandes similaires ? Évaluer le total annuel et vérifier la conformité aux seuils (art. 14-15).",
                "<b>Enregistrement</b> : attribution d'un numéro de dossier chronologique, ouverture du dossier physique et numérique."]},
              {h:"Refus motivé",p:[
                "La cellule peut refuser une réquisition si elle est hors PPM, sans crédits suffisants, mal spécifiée ou constitutive d'un fractionnement. Le refus est écrit et motivé."]}
            ],
            ex:"Chef du laboratoire de sérologie demande 500 tubes vacutainers (hémolyse/or). Cellule : (1) PPM — poste 'fournitures de laboratoire' inscrit ✓. (2) Crédits : solde 4,2 M > estimation 1,8 M ✓. (3) Historique Q1 : même demande 1,6 M. Total cumulé 3,4 M < 30 M seuil ✓. Pas de fractionnement. Dossier ouvert, mode : RFQ.",
            traps:[
              "Spécifier une marque unique : discriminatoire.",
              "Valider hors PPM sans révision formelle.",
              "Sauter la vérification des crédits : marché nul.",
              "Ne pas attribuer de numéro de dossier : impossibilité de suivi."],
            key:[
              "Pas de réquisition signée → pas de procédure.",
              "Vérification en quatre points : PPM, crédits, fractionnement, enregistrement.",
              "Refus écrit et motivé si une condition n'est pas remplie."],
            src:"Code, art. 14-15, 71, 73 ; Manuel INSAPT, ch. 12 SOP 1."})},

        { t:{fr:"SOP 2 — Demande de cotation (RFQ) et règle des trois devis",en:"SOP 2 — Request for quotations & three quotes",ar:"إجراء ٢ — طلب عروض الأسعار"},
          html:D({obj:"Conduire une RFQ conforme en trois devis, comparer les offres sur tableau et attribuer le moins-disant conforme — en laissant une trace défendable.",
            sections:[
              {h:"Quand utilise-t-on la RFQ ?",p:[
                "La demande de cotation s'applique aux achats dont le montant est compris entre le seuil de la consultation directe (10 M FCFA) et le seuil d'assujettissement au Code : 30 M pour les fournitures/services, 50 M pour les travaux, 20 M pour les prestations intellectuelles. C'est la procédure simplifiée par excellence : rapide, légère, mais pas sans règles."]},
              {h:"Les six étapes d'une RFQ conforme",ul:[
                "<b>Étape 1 — Préparation</b> : fiche de spécifications identiques pour tous, budget estimatif confirmé, liste d'au moins trois fournisseurs préqualifiés de la Vendor Master List.",
                "<b>Étape 2 — Envoi simultané</b> : RFQ adressée par écrit à au moins trois fournisseurs en même temps, mêmes informations, même formulaire de prix, même délai de réponse.",
                "<b>Étape 3 — Réception</b> : cotations reçues dans des plis distincts ou des emails séparés avant la date limite. Date de réception consignée.",
                "<b>Étape 4 — Comparaison</b> : tableau comparatif (prix unitaire, prix total, délai, garantie). Calcul du total TTC sur base commune.",
                "<b>Étape 5 — Attribution</b> : au moins-disant conforme aux spécifications. Tout écart de spécification ayant abaissé le prix est disqualifiant.",
                "<b>Étape 6 — Documentation</b> : RFQ envoyées, réponses reçues (y compris non-réponses), tableau comparatif signé par deux agents, bon de commande émis."]},
              {h:"Pièges courants",p:[
                "Ne jamais consulter deux fournisseurs du même groupe d'intérêts : les trois devis doivent être indépendants. Un fournisseur qui ne répond pas dans les délais est consigné comme 'sans réponse' — sa non-participation ne remet pas en cause la procédure si au moins deux cotations conformes sont reçues."]}
            ],
            ex:"Achat papier A4 et cartouches. Estimation : 2,4 M FCFA. Trois fournisseurs VML contactés simultanément le 8 janvier, délai 10 jours ouvrables. Réponses : A = 2 350 000 conforme, B = 2 100 000 (papier 70 g au lieu de 80 g → non conforme), C = 2 500 000 conforme. Attribution : A, moins-disant conforme. B écarté non pour le prix mais pour la non-conformité.",
            traps:[
              "RFQ successives (pas simultanées) pour favoriser un fournisseur.",
              "Comparer les prix HT d'un fournisseur avec les prix TTC d'un autre : base commune obligatoire.",
              "Attribuer au moins-disant sans vérifier la conformité.",
              "Perdre le tableau comparatif ou ne pas le faire signer."],
            key:[
              "Trois devis simultanés, mêmes specs, même délai, même formulaire.",
              "Tableau comparatif signé par deux agents = pièce maîtresse du dossier.",
              "Attribution au moins-disant conforme — la conformité prime sur le prix."],
            src:"Code, art. 12-13 ; Manuel INSAPT, ch. 12 SOP 2."})},

        { t:{fr:"SOP 3 — Lancement d'un appel d'offres",en:"SOP 3 — Launching a tender",ar:"إجراء ٣ — إطلاق طلب العروض"},
          html:D({obj:"Préparer et publier un appel d'offres conforme : checklist pré-lancement, supports de publication, gestion des Q&R et des addenda.",
            sections:[
              {h:"Checklist pré-lancement en 7 points",ul:[
                "✅ Réquisition validée, PPM et crédits vérifiés.",
                "✅ DAO complet sur modèle-type ARMP (avis, IAS, CCAP, CCTP, bordereau, critères, projet de marché, formulaires).",
                "✅ Avis de la DGCMP sur le DAO reçu (ou 7 jours ouvrables écoulés sans objection).",
                "✅ Réunion pré-soumission planifiée si besoin (visite de site pour les travaux).",
                "✅ Délai minimum de publicité : 30 jours calendaires.",
                "✅ Registre de retrait des DAO préparé.",
                "✅ Boîte de dépôt des offres identifiée et sécurisée."]},
              {h:"Publication et supports officiels",p:[
                "L'avis est publié simultanément sur tous les supports requis : journal officiel des marchés publics, site internet de l'ARMP, site INSAPT si applicable. Tout support supplémentaire renforce la concurrence et ne crée pas d'inégalité si tous les candidats ont accès aux mêmes informations."]},
              {h:"Gestion des questions et réponses",p:[
                "Les candidats envoient leurs questions par écrit avant une date limite (typiquement J-10 avant la clôture). La cellule compile les réponses, les anonymise, et les diffuse à <b>tous les acquéreurs du DAO</b> simultanément. Une réponse qui modifie substantiellement le DAO devient un <b>addendum numéroté</b>. Si l'addendum intervient moins de 10 jours avant la clôture, le délai est prolongé."]},
              {h:"Réunion pré-soumission",p:[
                "Pour les marchés complexes (travaux, équipements à installer, services techniques), une réunion pré-soumission sur site est organisée. Elle est ouverte à tous les candidats. Un PV est dressé et diffusé comme addendum. Les informations données en réunion mais non diffusées par addendum sont sans valeur juridique."]}
            ],
            ex:"AOO laboratoire biosécurité niveau 2. DAO soumis à DGCMP J-9. Avis DGCMP favorable par silence J-2. Avis publié journal des marchés + site ARMP : délai 30 jours. Réunion de site J+12. PV diffusé à tous J+13 comme Addendum 1. Deux questions écrites reçues J+18, réponses diffusées J+20 comme Addendum 2. Clôture J+30.",
            traps:[
              "Publier dans un seul support local sans le journal officiel.",
              "Répondre à une question par email sans diffuser à tous.",
              "Addendum le jour J de clôture sans prolongation.",
              "PV de réunion pré-soumission non diffusé : engagements non opposables."],
            key:[
              "Checklist en 7 points avant tout lancement.",
              "Q&R anonymisées, diffusées à tous simultanément.",
              "Addendum = modification du DAO + prolongation du délai si nécessaire."],
            src:"Code, art. 55, 82-84 ; Manuel INSAPT, ch. 12 SOP 3."})},

        { t:{fr:"SOP 4 — Ouverture, évaluation et attribution",en:"SOP 4 — Opening, evaluation and award",ar:"إجراء ٤ — الفتح والتقييم والإرساء"},
          html:D({obj:"Conduire une séance d'ouverture régulière, piloter la sous-commission d'analyse et produire un rapport d'attribution défendable.",
            sections:[
              {h:"Protocole d'ouverture (art. 43)",p:[
                "La séance se tient à l'heure, la date et au lieu annoncés. Le Président vérifie que les plis sont fermés et cachetés, les ouvre un par un en présence de la CPM et d'un représentant par soumissionnaire. Pour chaque pli : vérification de la garantie de soumission, lecture publique du montant (avec rabais), du délai et des principaux éléments.",
                "Un PV d'ouverture est signé <b>séance tenante</b>. Les originaux sont conservés sous scellé ; des copies sont remises à la sous-commission d'analyse."]},
              {h:"Travaux de la sous-commission : trois filtres en 15 jours",p:[
                "<b>Filtre 1 — Administratif</b> : pièces présentes, valides, signées. Demande d'éclaircissement possible si absence non dirimante.",
                "<b>Filtre 2 — Technique</b> : notation sur grille du DAO. Les offres sous le seuil minimum ou non conformes sont éliminées.",
                "<b>Filtre 3 — Financier</b> : correction des erreurs arithmétiques, mise sur base TTC commune, classement. Attribution à l'offre conforme la mieux-évaluée."]},
              {h:"Le rapport d'analyse",p:[
                "Document écrit, daté et signé par tous les membres. Pour chaque offre : motifs de conformité ou de rejet. Classement final et proposition d'attribution motivée. C'est ce rapport que la DGCMP examinera, que l'ARMP auditera et qu'un candidat écarté attaquera devant le CRD. <b>Chaque rejet doit être défendable par écrit.</b>"]},
              {h:"Avis DGCMP, publication, standstill",p:[
                "Rapport transmis à la CPM → DGCMP → avis sous 7 jours ouvrables → publication attribution provisoire → standstill (typiquement 10 jours) → si aucun recours suspensif : signature du marché → transmission ARMP sous 48 h."]}
            ],
            ex:"AOO équipement chimie. Cinq offres reçues. Filtre 1 : offre C sans attestation fiscale valide → demande d'éclaircissement → rejet motivé. Filtre 2 : offre B gamme incomplète → rejet technique. Filtre 3 : A (2,4 M) et D (2,1 M) conformes. D moins-disant conforme → attribution. Rapport signé, DGCMP silence. Publication, standstill 10 jours. Signature.",
            traps:[
              "Rédiger le PV d'ouverture après la séance depuis des notes.",
              "Écarter une offre sur un critère non prévu au DAO.",
              "Dépasser 15 jours d'évaluation sans autorisation.",
              "Rapport laconique : 'non conforme' sans motif → recours assuré."],
            key:[
              "PV d'ouverture séance tenante, toujours.",
              "15 jours max, trois filtres, chaque rejet motivé par écrit.",
              "Rapport d'analyse = première défense contre les recours."],
            src:"Code, art. 41, 43, 55, 82 ; Manuel INSAPT, ch. 12 SOP 4."})},

        { t:{fr:"SOP 5 — Gestion des contrats et avenants",en:"SOP 5 — Contract management and amendments",ar:"إجراء ٥ — إدارة العقود والملاحق"},
          html:D({obj:"Administrer un marché de la notification à la clôture : garanties, suivi, avenants, pénalités et résiliation.",
            sections:[
              {h:"Notification et garanties",p:[
                "La notification écrite au titulaire déclenche le contrat et fait courir les délais. Le titulaire mobilise la <b>garantie de bonne exécution</b>. L'avance de démarrage (généralement 10-20 % pour les travaux) n'est versée qu'après remise de la <b>caution de restitution d'avances</b> d'un montant équivalent. Un ordre de service fixe la date de démarrage effectif si nécessaire."]},
              {h:"Suivi de l'exécution",p:[
                "Le gestionnaire du contrat tient un tableau de bord : jalons de livraison, qualité des livrables intermédiaires, consommation du budget, gestion des sous-traitants. Tout écart (retard, non-conformité, événement imprévu) est <b>constaté par écrit dans les 48 heures</b>. Les pénalités de retard s'appliquent automatiquement selon la formule du CCAP ; elles ne nécessitent pas de mise en demeure si le CCAP le précise."]},
              {h:"Les avenants : cadre et limites",p:[
                "Un avenant modifie une ou plusieurs clauses après la signature. Conditions cumulatives : (1) écrit et signé, (2) motivé par un événement survenu après la signature, (3) soumis à l'avis de la CPM, (4) examiné par l'organe de contrôle. <b>Limite absolue (art. 22)</b> : ne pas bouleverser l'économie du marché ni changer son objet. Au-delà de 20-30 % d'augmentation, un nouveau marché est requis."]},
              {h:"Résiliation",p:[
                "La résiliation peut être : à l'initiative de l'autorité contractante (faute du titulaire ou intérêt général), à l'initiative du titulaire, de plein droit, ou d'un commun accord. Chaque mode entraîne des conséquences financières différentes. La résiliation pour faute du titulaire peut entraîner son exclusion et l'appel de la garantie de bonne exécution."]}
            ],
            ex:"Marché mobilier de bureau, délai contractuel : 60 jours. Pénalités : 0,05 %/jour. À J+75 (15 jours de retard), livraison. Pénalités : 0,05 % × 15 × montant. Gestionnaire déduit du paiement final sans mise en demeure (prévu au CCAP). Fournisseur conteste 5 jours invoquant une inondation documentée. Instruction : 5 jours exonérés, 10 jours de pénalités maintenus.",
            traps:[
              "Avance sans caution : perte sèche en cas de défaillance.",
              "Avenant par oral ou email sans CPM et DGCMP.",
              "Oublier d'appliquer les pénalités.",
              "Résilier sans dossier documenté : contentieux difficile."],
            key:[
              "Garanties mobilisées avant tout premier paiement.",
              "Tout écart constaté par écrit dans les 48 h.",
              "Avenant = écrit, motivé, CPM + DGCMP, limite 20-30 %.",
              "Résiliation = procédure formelle, jamais tacite."],
            src:"Code, art. 22, Titre IV, Titre V ; Manuel INSAPT, ch. 12 SOP 5."})},

        { t:{fr:"SOP 6 — Réception, archivage et clôture",en:"SOP 6 — Receipt, archiving and closure",ar:"إجراء ٦ — الاستلام والأرشفة والإغلاق"},
          html:D({obj:"Organiser la réception conforme des prestations, déclencher les paiements et archiver le dossier complet selon les exigences INSAPT et ARMP.",
            sections:[
              {h:"La commission de réception : rôle et composition",p:[
                "Une commission de réception ad hoc, distincte du service demandeur et de la cellule de passation, est convoquée pour chaque livraison significative. Elle comprend au minimum : un représentant de la Direction Générale ou du service gestionnaire, le responsable technique du service bénéficiaire, et un agent de l'agence comptable si le paiement est lié à la réception.",
                "La commission ne peut pas réunir le demandeur initial et le payeur : séparation des fonctions (art. 65)."]},
              {h:"Protocole de réception en trois vérifications",ul:[
                "<b>Quantitative</b> : compter, peser ou mesurer selon la nature — avant de signer.",
                "<b>Qualitative</b> : comparer aux spécifications du CCTP (normes, dimensions, compatibilité, péremption pour les réactifs, performance pour les équipements).",
                "<b>Tests si requis</b> : mise en route, test de performance selon les protocoles du marché.",
                "<b>PV de réception</b> : conforme (provisoire), conforme avec réserves (délai de levée fixé), ou non conforme (refus motivé, mise en demeure)."],
               p:["Le PV de réception conditionne le paiement et la libération des garanties. Le signer sans avoir effectué les vérifications engage la responsabilité personnelle du signataire."]},
              {h:"Archivage : délais et pièces",p:[
                "Le dossier complet est archivé chronologiquement (physique et numérique) : réquisition, DAO, PV d'ouverture, rapport d'analyse, marché approuvé, garanties, PV de réception, factures, preuves de paiement, avenants. Transmission à l'ARMP sous <b>48 heures</b> (marché signé) et sous <b>72 heures</b> (dossiers de procédure). Conservation légale : <b>10 ans</b>."]}
            ],
            ex:"Livraison 1 200 boîtes de gants chirurgicaux stériles (taille L, péremption > 24 mois). Commission : (1) compte physique 1 200 ✓ ; (2) taille L ✓ ; (3) emballage intact ✓ ; (4) péremption : 18 mois ✗ (< 24 mois exigés). PV de refus. Mise en demeure. Remplacement livré 5 jours plus tard avec péremption conforme : PV de réception provisoire signé, paiement déclenché.",
            traps:[
              "Signer un PV sans vérifier physiquement : responsabilité personnelle.",
              "Réceptionner partiellement sans noter les réserves.",
              "Archiver sans transmettre à l'ARMP : infraction aux délais de l'art. 37.",
              "Conserver moins de 10 ans."],
            key:[
              "Commission de réception ≠ demandeur ≠ payeur.",
              "Trois vérifications : quantité, qualité, conformité aux specs.",
              "PV de réception = condition du paiement + libération des garanties.",
              "Archivage 10 ans, transmission ARMP 48/72 h."],
            src:"Code, art. 37, 65 ; Manuel INSAPT, ch. 12 SOP 6."})},

        { t:{fr:"SOP 7 — Achats d'urgence",en:"SOP 7 — Emergency procurement",ar:"إجراء ٧ — المشتريات الطارئة"},
          html:D({obj:"Distinguer urgence légitime et fausse urgence, appliquer la procédure accélérée INSAPT et régulariser correctement a posteriori.",
            sections:[
              {h:"Qu'est-ce qu'une urgence légitime ?",p:[
                "Le Code (art. 101) reconnaît l'urgence impérieuse résultant de la <b>force majeure</b> : événement imprévisible, extérieur et irrésistible (catastrophe naturelle, épidémie déclarée, panne grave imprévue sans possibilité de substitution). Une urgence est légitime si elle est :"],
               ul:[
                "Imprévisible : on ne pouvait raisonnablement pas l'anticiper.",
                "Grave : elle empêche la continuation normale des activités de santé publique.",
                "Irrémédiable sans achat immédiat : le délai d'une procédure normale causerait un préjudice substantiel."],
               p:["<b>L'urgence créée par un défaut de planification n'est pas une urgence légitime.</b> L'audit ARMP la détecte et peut sanctionner les responsables."]},
              {h:"Procédure accélérée INSAPT",p:[
                "<b>Étape 1</b> : Qualification écrite de l'urgence par l'autorité compétente (DG ou délégué).",
                "<b>Étape 2</b> : Si besoin ≥ seuil d'assujettissement : demande d'autorisation au Ministre (art. 45) ou consultation ≥ 3 fournisseurs préqualifiés si sous seuil.",
                "<b>Étape 3</b> : Consultation restreinte immédiate, DAO simplifié, délai de réponse adapté (24-72 h).",
                "<b>Étape 4</b> : Attribution au mieux-disant disponible (délai prime si urgence de délai).",
                "<b>Étape 5</b> : Bon de commande d'urgence, livraison, réception.",
                "<b>Étape 6</b> : Régularisation complète dans les 30 jours : rapport d'urgence signé, archivage, rapport à la DGCMP et à l'ARMP."]},
              {h:"Reporting spécifique",p:[
                "Tout achat d'urgence fait l'objet d'un rapport spécifique transmis à l'ARMP : nature de l'urgence, date de survenance, date de l'achat, justification du choix du fournisseur, montant, mesures pour éviter la répétition."]}
            ],
            ex:"Inondation détruit les stocks de solutés IV du CVS. Besoin immédiat : 500 poches NaCl 0,9 %, estimation 3,5 M FCFA. Qualification d'urgence écrite par le DG. Consultation de 3 grossistes pharmaceutiques le samedi par téléphone, confirmation de prix par email. Attribution au seul grossiste pouvant livrer le lundi. Livraison + réception le lundi. Rapport d'urgence transmis le vendredi suivant.",
            traps:[
              "Invoquer l'urgence pour un achat prévisible sous-planifié.",
              "Ne pas documenter la qualification de l'urgence.",
              "Omettre la régularisation a posteriori : audit ARMP sanctionnera.",
              "Retenir systématiquement le même fournisseur 'de confiance' lors des urgences."],
            key:[
              "Urgence légitime = imprévisible, grave, irrémédiable sans achat immédiat.",
              "Urgence par défaut de planification = infraction sanctionnable.",
              "Achat d'urgence = procédure accélérée + régularisation 30 jours + rapport ARMP."],
            src:"Code, art. 45, 90, 101 ; Manuel INSAPT, ch. 13 (Achats d'urgence)."})},

        { t:{fr:"SOP 8 — Réactifs de laboratoire & chaîne du froid",en:"SOP 8 — Lab reagents & cold chain",ar:"إجراء ٨ — كواشف المختبر وسلسلة التبريد"},
          html:D({obj:"Quantifier correctement les besoins en réactifs, rédiger des spécifications techniques solides, gérer la chaîne du froid à la réception et appliquer le FEFO en stock.",
            sections:[
              {h:"Quantification basée sur la consommation",p:[
                "La quantification repose sur trois données : (1) consommation mensuelle moyenne (CMM) sur les 12 derniers mois, corrigée des ruptures ; (2) délai de livraison prévisible (délai fournisseur + délai de passation) ; (3) stock de sécurité (généralement 2-3 mois de CMM). Formule : <b>Quantité = CMM × (délai + couverture) − stock actuel</b>.",
                "Pour les programmes (VIH, paludisme, tuberculose), la quantification est également calée sur les prévisions d'activité communiquées par les programmes et les PTF."]},
              {h:"Spécifications techniques pour les réactifs",ul:[
                "<b>Identité</b> : nom générique (DCI ou IUPAC), concentration, forme (lyophilisé, liquide).",
                "<b>Compatibilité équipements</b> : analyseur cible, numéro de catalogue acceptable uniquement comme équivalence — pas comme exigence exclusive.",
                "<b>Conditionnement</b> : contenance unitaire, nombre de tests par flacon.",
                "<b>Péremption minimale à livraison</b> : spécifier un minimum (ex. 18 mois) pour garantir l'utilisation complète avant expiration.",
                "<b>Stockage et transport</b> : température (+2/+8°C, -20°C, ambiante), indicateurs de température, cold pack.",
                "<b>Documentation</b> : Certificate of Analysis (CoA), fiches de données de sécurité (FDS/MSDS)."]},
              {h:"Réception avec contrôle de la chaîne du froid",p:[
                "À la réception : (1) intégrité des emballages ; (2) relevé de température ou data logger (hors plage → quarantaine) ; (3) péremption de chaque lot (consignée dans le registre par numéro de lot) ; (4) quantités et conformité du CoA.",
                "Si la chaîne du froid a été rompue, <b>le lot est mis en quarantaine</b> et le fournisseur est notifié par écrit. Réception refusée jusqu'à remplacement ou avis du pharmacien/biologiste responsable."]},
              {h:"Gestion FEFO en stock",p:[
                "FEFO (First Expired, First Out) : réactifs à péremption la plus proche sortis en premier. Le registre des péremptions génère des alertes à 6 mois et à 3 mois. Les réactifs à moins de 3 mois non utilisables sont signalés pour élimination ou redistribution."]}
            ],
            ex:"Commande de réactifs PCR VIH (CMM : 120 tests/mois, délai fournisseur : 3 mois, stock sécurité : 2 mois, stock actuel : 80 tests). Quantité : 120 × (3+2) − 80 = 520 tests. Spécification : Roche cobas® 6800, péremption ≥ 18 mois, -20°C, data logger inclus. À réception : data logger OK, péremption 22 mois ✓, 6 boîtes 100 tests ✓, CoA joint. PV signé. FEFO programmé M-6.",
            traps:[
              "Quantifier sur les commandes passées sans tenir compte des ruptures : sous-estimation.",
              "Numéro de catalogue unique sans équivalences : risque de monopole.",
              "Signer le PV sans vérifier le data logger.",
              "Stocker selon l'ordre d'arrivée (FIFO) au lieu du FEFO."],
            key:[
              "Quantification = CMM × (délai + couverture) - stock actuel.",
              "Spécifications : identité, compatibilité, péremption minimale, stockage, CoA.",
              "Réception : data logger + péremption + conformité avant signature.",
              "Gestion FEFO obligatoire pour les réactifs."],
            src:"Manuel INSAPT, ch. 14 (Gestion des stocks), ch. 15 (SOP réactifs R-1 à R-4)."})},

        { t:{fr:"SOP 9 — Répertoire des fournisseurs (Vendor Master List)",en:"SOP 9 — Vendor Master List",ar:"إجراء ٩ — سجل الموردين"},
          html:D({obj:"Créer et maintenir une Vendor Master List conforme, inscrire et radier des fournisseurs sur des critères objectifs, évaluer la performance après chaque contrat.",
            sections:[
              {h:"Pourquoi une Vendor Master List ?",p:[
                "La VML est le référentiel vivant des fournisseurs dont l'INSAPT a vérifié les capacités et l'intégrité. Elle accélère les procédures (les RFQ peuvent être adressées directement aux inscrits), sécurise la qualité (seuls les fournisseurs avec des documents valides sont consultés) et construit la mémoire institutionnelle (historique de performance)."]},
              {h:"Inscription sur dossier : critères et pièces",ul:[
                "<b>Juridique</b> : registre du commerce valide, statuts, mandat du signataire.",
                "<b>Fiscal/social</b> : attestations d'être en règle (impôts, sécurité sociale) à date.",
                "<b>Intégrité</b> : déclaration sur l'honneur d'absence d'exclusion ou de condamnation pénale.",
                "<b>Technique</b> : domaines d'activité, références de marchés similaires (avec attestations de bonne exécution), moyens.",
                "<b>Financier</b> : CA moyen des 3 derniers exercices, attestation bancaire.",
                "<b>Spécifique</b> : agréments techniques sectoriels (pharmacie, santé, bâtiment)."],
               p:["L'inscription est valable 2 ans. La mise à jour des documents est à la charge du fournisseur. Une attestation expirée entraîne la suspension temporaire."]},
              {h:"Évaluation post-contrat (fiche de performance)",p:[
                "Après chaque marché, le gestionnaire du contrat remplit une fiche de performance : (1) qualité des produits/services ; (2) respect des délais ; (3) réactivité aux réclamations ; (4) documentation (CoA, factures, BL) ; (5) note globale sur 10.",
                "Note < 5/10 sur deux contrats consécutifs → révision de l'inscription. Faute grave → radiation immédiate."]},
              {h:"La VML ne remplace pas la publicité",p:[
                "Pour les AOO, la publication est obligatoire quelle que soit la taille de la VML. Celle-ci sert uniquement pour les RFQ sous seuil et pour identifier des candidats en pré-qualification. Un fournisseur non inscrit à la VML peut soumissionner à un AOO."]}
            ],
            ex:"RFQ pour cartouches d'imprimante (estimation 800 000 FCFA). Cellule consulte VML : 6 fournisseurs inscrits 'fournitures de bureau'. Vérification des attestations : 2 expirées → suspendus. Il reste 4 actifs. Contacte 3 en rotation pour diversifier. Le 4ème sera sollicité la prochaine fois. Aucun fournisseur systématiquement favori.",
            traps:[
              "Consulter toujours les mêmes 3 fournisseurs 'de confiance' sans rotation.",
              "Oublier de vérifier la validité des attestations avant envoi.",
              "Confondre inscription VML et pré-qualification pour l'AOO.",
              "Ne jamais remplir les fiches de performance : mémoire institutionnelle perdue."],
            key:[
              "VML = référentiel vivant, non une liste fermée.",
              "Inscription sur dossier, validité 2 ans, mise à jour fournisseur.",
              "Évaluation post-contrat après chaque marché.",
              "VML ne remplace jamais la publicité d'un AOO."],
            src:"Manuel INSAPT, ch. 12 SOP 2 et ch. 16 ; annexe S (Répertoire des fournisseurs) et ch. 10 (performance des fournisseurs)."})},

        { t:{fr:"SOP 10 — KPIs, reporting & mécanisme de signalement",en:"SOP 10 — KPIs, reporting & whistleblowing",ar:"إجراء ١٠ — مؤشرات الأداء والتقارير والإبلاغ"},
          html:D({obj:"Définir les KPIs de la fonction achats INSAPT, construire le reporting trimestriel et annuel, et opérationnaliser le mécanisme de signalement.",
            sections:[
              {h:"Pourquoi mesurer la performance achats ?",p:[
                "La fonction achats ne peut s'améliorer que si elle se mesure. Les KPIs permettent d'identifier les goulets d'étranglement (procédures trop longues), les risques (taux d'infructuosité, taux de recours), les économies réalisées et la performance des fournisseurs. Ils alimentent le reporting à la Direction Générale et les revues avec les PTF."]},
              {h:"7 KPIs prioritaires pour l'INSAPT",ul:[
                "<b>Délai moyen de passation</b> : de la réquisition validée à la notification du marché. Cible : ≤ 45 jours pour un AON standard.",
                "<b>Taux d'exécution du PPM</b> : part des marchés prévus effectivement lancés. Cible : ≥ 85 %.",
                "<b>Taux d'infructuosité</b> : part des AOO déclarés infructueux. Taux > 15 % = problème de spécification ou de concurrence.",
                "<b>Économies réalisées</b> : écart % entre budget estimatif et prix d'attribution. Cible : > 5 %.",
                "<b>Taux de livraison dans les délais</b> : part des marchés réceptionnés dans les délais contractuels. Cible : ≥ 90 %.",
                "<b>Taux de recours / litiges</b> : part des procédures ayant fait l'objet d'un recours. Cible : < 5 %.",
                "<b>Délai moyen de paiement</b> : de la réception conforme au paiement. Cible : ≤ 30 jours."]},
              {h:"Reporting trimestriel et annuel",p:[
                "Chaque trimestre, la cellule produit un tableau de bord : marchés lancés, en cours, réceptionnés, montants engagés vs budget, KPIs du trimestre. Présenté en réunion de direction et transmis aux PTF si requis. En fin d'exercice, le rapport annuel consolide tous les marchés, analyse les écarts vs PPM, et tire les leçons."]},
              {h:"Le mécanisme de signalement opérationnel",p:[
                "Le manuel INSAPT (ch. 16, annexe T) désigne un responsable du mécanisme de signalement, indique les canaux (boîte électronique dédiée, adresse postale confidentielle, permanence téléphonique) et définit le processus : enregistrement, instruction, réponse à l'alerteur sous 30 jours, suivi. Chaque signalement est archivé sous pli confidentiel. L'alerteur de bonne foi est protégé contre toute représaille."]}
            ],
            ex:"Revue Q3. Délai moyen de passation = 68 jours (vs cible 45) — cause : délai moyen DGCMP de 15 jours pour les dossiers INSAPT (cible 7). Action : réunion avec la DGCMP pour identifier les lacunes. Taux d'infructuosité = 22 % (vs cible 15 %) — cause : spécifications trop restrictives pour les réactifs de biochimie. Action : révision des spécifications avec les biologistes.",
            traps:[
              "Calculer les KPIs uniquement en fin d'année : trop tard pour corriger.",
              "Mesurer uniquement les délais et oublier la qualité et les économies.",
              "Traiter les signalements informellement sans archivage.",
              "Ne pas communiquer les KPIs en interne : les équipes ne s'améliorent pas sans feedback."],
            key:[
              "7 KPIs : délai passation, exécution PPM, infructuosité, économies, délais livraison, recours, délais paiement.",
              "Reporting trimestriel à la DG + PTF si requis.",
              "Signalement : canal dédié + instruction sous 30 jours + protection de l'alerteur."],
            src:"Manuel INSAPT, ch. 12 SOP, ch. 17 (KPIs), annexe T (signalement), ch. 10 (performance des fournisseurs)."})},
      ]
    },

    /* 4 ▸ CERTIFICATION LEVEL 1 — manual ch. 1-6 */
    {
      id: "l1", icon: "Ⅰ", color: "#FECB00", cert: true,
      exam: { pool: ["l1"], n: 30, minutes: 60 },
      name: { fr: "Certification INSAPT — Niveau 1", en: "INSAPT Certification — Level 1", ar: "شهادة المعهد — المستوى الأول" },
      desc: { fr: "Chapitres 1 à 6 du Manuel de Passation : préambule, considérations générales, coordination CPA, gouvernance, planification et sourcing. Examen chronométré de 60 minutes.", en: "Manual chapters 1-6: preamble, general considerations, CPA coordination, governance, planning and sourcing. 60-minute timed exam.", ar: "الفصول ١–٦ من الدليل مع امتحان محدد بـ٦٠ دقيقة" },
      manualChapters: [1, 2, 3, 4, 5, 6]
    },

    /* 5 ▸ LEVEL 2 — ch. 7-13 */
    {
      id: "l2", icon: "Ⅱ", color: "#FECB00", cert: true,
      exam: { pool: ["l2"], n: 30, minutes: 60 },
      name: { fr: "Certification INSAPT — Niveau 2", en: "INSAPT Certification — Level 2", ar: "شهادة المعهد — المستوى الثاني" },
      desc: { fr: "Chapitres 7 à 13 : appels d'offres & RFQ, attribution, gestion des contrats, performance fournisseurs, intégration financière, SOP de passation générale, achats d'urgence. Examen de 60 minutes.", en: "Chapters 7-13: tenders & RFQ, award, contract management, supplier performance, financial integration, general SOPs, emergency procurement. 60-minute exam.", ar: "الفصول ٧–١٣ مع امتحان ٦٠ دقيقة" },
      manualChapters: [7, 8, 9, 10, 11, 12, 13]
    },

    /* 6 ▸ LEVEL 3 — ch. 14-19 */
    {
      id: "l3", icon: "Ⅲ", color: "#FECB00", cert: true,
      exam: { pool: ["l3"], n: 30, minutes: 60 },
      name: { fr: "Certification INSAPT — Niveau 3", en: "INSAPT Certification — Level 3", ar: "شهادة المعهد — المستوى الثالث" },
      desc: { fr: "Chapitres 14 à 19 : réactifs & stocks, SOP réactifs, éthique & anti-corruption, KPIs & reporting, coordination PTF, clauses contractuelles types. Examen de 60 minutes.", en: "Chapters 14-19: reagents & stock, reagent SOPs, ethics & anti-corruption, KPIs & reporting, partner coordination, standard clauses. 60-minute exam.", ar: "الفصول ١٤–١٩ مع امتحان ٦٠ دقيقة" },
      manualChapters: [14, 15, 16, 17, 18, 19]
    },

    /* 7 ▸ LEVEL 4 — synthesis, 15 modules, locked until L1-L3 */
    {
      id: "l4", icon: "Ⅳ", color: "#C60C30", cert: true, requires: ["l1", "l2", "l3"],
      exam: { pool: ["l4"], n: 40, minutes: 80 },
      name: { fr: "Certification INSAPT — Niveau 4 (Expert)", en: "INSAPT Certification — Level 4 (Expert)", ar: "شهادة المعهد — المستوى الرابع (خبير)" },
      desc: { fr: "Le niveau le plus élevé : synthèse du Manuel complet et du Code des Marchés Publics en 15 modules (annexes R à V du Manuel Version 1 — RFI/RFP/RFQ, répertoire des fournisseurs, signalement, double conformité PTF —, la passation directe par la CPM de la Version B, et l'intégralité du Code par Titres). Examen expert chronométré de 80 minutes. Débloqué après validation des Niveaux 1 à 3.", en: "The highest level: full Manual + Procurement Code synthesis in 15 modules. 80-minute expert exam. Unlocked after Levels 1-3.", ar: "أعلى مستوى: ١٥ وحدة وامتحان ٨٠ دقيقة — يُفتح بعد المستويات ١–٣" },
      manualChapters: [20, 21, 22, 23, 24],
      codeTitres: true // + 10 modules generated from Code Titres at runtime
    }
  ];

  window.EL_QB = QB;

  // Build lesson list for a course at runtime
  window.elBuildModules = function (course) {
    const lang = window.EL_LANG || "fr";
    let mods = [];
    if (course.modules) {
      mods = course.modules.map((m, i) => ({ title: m.t[lang] || m.t.fr, html: m.html }));
    }
    if (course.manualChapters) {
      course.manualChapters.forEach(n => {
        const c = ch(n);
        mods.push({ title: c.title, html: c.html, manual: true });
      });
    }
    if (course.codeTitres && window.CODE_MP) {
      // group Code articles by Titre -> up to 10 modules
      const byT = {};
      window.CODE_MP.articles.forEach(a => { (byT[a.titre] = byT[a.titre] || []).push(a); });
      const titres = Object.keys(byT);
      titres.forEach(t => {
        const arts = byT[t];
        const html = arts.map(a =>
          `<h4 class="m-h3">Article ${a.art} — ${a.heading}</h4><p class="m-p">${a.body}</p>`).join("");
        mods.push({ title: "Code des Marchés — " + t, html });
      });
      // pad/merge to reach ~10 code modules if fewer titres
      const extra = [
        { title: "Code des Marchés — Cas pratiques de seuils", html: "<p class='m-p'>Exercez-vous : un achat de réactifs de 28 M FCFA (fournitures) → sous le seuil des 30 M : procédure simplifiée. Des travaux de réhabilitation à 65 M → soumis au Code, appel d'offres national. Une étude à 520 M (prestations intellectuelles) → au-delà de 500 M : appel d'offres international. Un achat de 8 M → consultation directe. Rappel : fractionner pour éviter ces règles est une infraction.</p>" },
        { title: "Code des Marchés — Délais récapitulatifs", html: "<ul class='m-ul'><li>Publicité appel d'offres ouvert : ≥ 30 jours</li><li>Propositions des consultants : ≥ 30 jours</li><li>DSP : ≥ 45 jours</li><li>Avis organe de contrôle : 7 jours ouvrables (silence vaut accord)</li><li>CPM : 21 jours (15 en urgence) ; évaluation : ≤ 15 jours</li><li>Archivage ARMP : dossiers 72 h ; marchés signés 48 h</li></ul>" },
        { title: "Code des Marchés — Pourcentages clés", html: "<ul class='m-ul'><li>Sous-traitance : ≤ 30 % de la valeur du marché</li><li>Préférence nationale : ≤ 15 % (AOI)</li><li>Préférence entreprises de femmes tchadiennes : 10 %</li><li>Audit annuel : 100 % des marchés > 300 M ; 25 % entre 10 et 300 M ; 5 % des bons de commande < 10 M</li></ul>" }
      ];
      extra.forEach(e => { if (mods.length < (course.manualChapters ? course.manualChapters.length : 0) + 10) mods.push(e); });
    }
    return mods;
  };
})();
