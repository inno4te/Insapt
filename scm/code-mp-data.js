/* ============================================================
   Base de données consultable — Code des Marchés Publics du Tchad
   Décret N°2130/PR/2020 portant Code des Marchés Publics
   Source officielle : ARMP — https://armp-tchad.com/decrets
   (PDF : /_files/FILE_KRV1730981306.pdf)
   ------------------------------------------------------------
   Contenu fidèle au texte officiel (articles, définitions,
   seuils, procédures), transcrit depuis le PDF de l'ARMP.
   Pour toute application, se référer au PDF officiel opposable.
   ============================================================ */
window.CODE_MP = {
  meta: {
    ref: "Décret N°2130/PR/2020",
    title: "Code des Marchés Publics du Tchad",
    note: "Transcription fidèle du texte officiel de l'ARMP — se référer au PDF officiel pour toute application.",
    official: "https://armp-tchad.com/decrets",
    pdf: "https://armp-tchad.com/_files/FILE_KRV1730981306.pdf"
  },
  articles: [
    /* ===== TITRE I — DISPOSITIONS GÉNÉRALES ===== */
    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 1 — Des définitions", art:"1",
      heading:"Définition du marché public",
      body:"Les Marchés Publics sont des contrats écrits passés, à titre onéreux, pour la réalisation de travaux, l'achat de fournitures et de services, ainsi que pour la réalisation de prestations intellectuelles par l'État, les collectivités autonomes, les établissements publics, les sociétés d'État et les sociétés à participation financière publique majoritaire, ou pour leur compte.",
      tags:["marché public","définition","contrat écrit","travaux","fournitures","services","prestations intellectuelles","à titre onéreux"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 1 — Des définitions", art:"2",
      heading:"Définitions des termes (glossaire)",
      body:"Définit les termes du Code : abattement, achat public, acompte, affermage, allotissement, appel d'offres, attributaire, auditeur indépendant, autorité contractante, autorité délégante, autorité de régulation, avance, avenant, avis à manifestation d'intérêt, cahiers des charges (CCAG, CCAP, CCTG, CCTP), candidat, centrale d'achat, commande publique, commission de passation, comité de règlement des différends, concession, contrôle a priori et a posteriori, délégation de service public, demande de cotation, dématérialisation, DGCMP, DAO, garanties, groupements, maître d'œuvre, maître d'ouvrage, maître d'ouvrage délégué, marché de gré à gré, offre la moins-disante, régie intéressée, soumission, soumissionnaire, termes de référence, titulaire.",
      tags:["définitions","glossaire","CCAG","CCAP","CCTG","CCTP","avenant","affermage","concession","allotissement","gré à gré","moins-disant","autorité contractante","DGCMP","DAO"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 2 — Objet, principes et champ", art:"3",
      heading:"Objet et principes de la commande publique",
      body:"Le Code fixe les règles applicables à la préparation, la passation, l'exécution, la régulation et au contrôle des marchés publics de travaux, fournitures, services et prestations intellectuelles, ainsi qu'aux sanctions administratives et au règlement des litiges. Les marchés respectent les principes de liberté d'accès à la commande publique, d'égalité de traitement des candidats, de transparence des procédures, d'économie et d'efficacité. Un marché ne peut commencer à être exécuté avant d'avoir été notifié.",
      tags:["objet","principes","liberté d'accès","égalité de traitement","transparence","économie","efficacité","notification","délégation de service public"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 2 — Objet, principes et champ", art:"4",
      heading:"Champ d'application",
      body:"Le Code s'applique aux marchés conclus par : l'État, les collectivités autonomes et les établissements publics ; les entreprises publiques et sociétés à participation publique majoritaire ; les autres organismes, agences ou offices créés par l'État ou les collectivités pour satisfaire des besoins d'intérêt général, financés ou garantis par l'État. Il peut être étendu aux sociétés à participation publique non visées et aux personnes de droit privé bénéficiant du concours financier de l'État, de sa garantie ou de la qualité de maître d'ouvrage délégué.",
      tags:["champ d'application","État","collectivités","établissement public","entreprise publique","intérêt général","INSAPT","maître d'ouvrage délégué"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 2 — Objet, principes et champ", art:"5",
      heading:"Dérogation — produits pétroliers",
      body:"Par dérogation, les autorités contractantes peuvent acquérir sans les procédures du Code les produits pétroliers (super carburant, essence ordinaire, gasoil) destinés aux véhicules administratifs et groupes électrogènes, au prix en vigueur du barème publié par la Commission Nationale des Hydrocarbures. Sont exclus les produits destinés à l'exploitation industrielle.",
      tags:["dérogation","produits pétroliers","carburant","gasoil","essence","hydrocarbures","véhicules administratifs"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 2 — Objet, principes et champ", art:"6",
      heading:"Capacité du titulaire",
      body:"L'exécution des marchés ne peut être confiée qu'à un entrepreneur, fournisseur, prestataire, consultant ou agent de l'État jouissant de la capacité juridique et possédant l'expérience, les qualifications, les compétences techniques ainsi que les ressources financières, équipements et moyens matériels nécessaires à la bonne exécution du marché.",
      tags:["capacité juridique","qualification","expérience","compétences techniques","ressources financières","titulaire"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 2 — Objet, principes et champ", art:"7",
      heading:"Personnes non admises à concourir",
      body:"Ne sont pas admis à concourir : les personnes frappées d'exclusion temporaire ou définitive ; les militaires, fonctionnaires et agents de l'État en fonction et les personnes morales où ils détiennent une participation ou influence significative (ou depuis moins de deux ans) ; les entreprises où l'autorité contractante, un responsable ou un membre de la CPM/SCA a des intérêts ; les membres du gouvernement, des cabinets ministériels et les élus ; les personnes sous sanctions correctionnelles (impôts, douanes) ; les personnes déchues de la capacité civile ; les affiliés aux consultants ayant préparé le DAO ; les entreprises de travaux sans certificat de qualification.",
      tags:["exclusion","incompatibilité","conflit d'intérêts","fonctionnaires","élus","membres du gouvernement","certificat de qualification"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 2 — Objet, principes et champ", art:"8",
      heading:"Financement & primauté des conventions internationales",
      body:"Le Code s'applique à tous les marchés quelle que soit l'origine de leur financement. Toutefois, en cas de conflit avec les obligations souscrites par le Tchad dans un traité ou un accord de financement avec une institution internationale, les dispositions du traité ou de l'accord prévalent sur les dispositions contraires du Code ; les autres dispositions non contraires demeurent applicables.",
      tags:["financement","traité","convention internationale","bailleur","accord de financement","primauté"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Section 3 — Seuils par type de marché", art:"9",
      heading:"Seuils de la commande publique (assujettissement)",
      body:"Ne sont pas soumises au Code les conventions dont les montants TTC sont inférieurs à : cinquante millions (50 000 000) FCFA pour les marchés de travaux ; trente millions (30 000 000) FCFA pour les marchés de fournitures et services ; vingt millions (20 000 000) FCFA pour les marchés de prestations intellectuelles.",
      tags:["seuils","50 millions","30 millions","20 millions","travaux","fournitures","services","prestations intellectuelles","FCFA","assujettissement"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Section 4 — Seuils d'appel d'offres national", art:"10",
      heading:"Seuils de l'appel d'offres national",
      body:"Font l'objet d'un appel d'offres national les marchés dont le montant TTC est inférieur ou égal à : deux milliards (2 000 000 000) FCFA pour les travaux ; un milliard (1 000 000 000) FCFA pour les fournitures ; quatre cent millions (400 000 000) FCFA pour les services ; cinq cent millions (500 000 000) FCFA pour les prestations intellectuelles.",
      tags:["appel d'offres national","seuils","2 milliards","1 milliard","400 millions","500 millions","travaux","fournitures","services"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Section 4 — Seuils d'appel d'offres national", art:"11",
      heading:"Appel d'offres international",
      body:"Les marchés de travaux, fournitures, services et prestations intellectuelles au-delà des seuils de l'appel d'offres national feront l'objet d'un appel d'offres international.",
      tags:["appel d'offres international","seuils","concurrence internationale"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Section 5 — Procédures simplifiées", art:"12",
      heading:"Procédure simplifiée",
      body:"Les contrats dont le montant TTC est supérieur ou égal à dix millions (10 000 000) FCFA et strictement inférieur aux seuils par type de marché sont passés par la procédure simplifiée. Un décret fixe cette procédure.",
      tags:["procédure simplifiée","10 millions","seuils","sous seuil"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Section 5 — Procédures simplifiées", art:"13",
      heading:"Consultation directe (moins de 10 millions)",
      body:"Les contrats dont le montant est inférieur à dix millions (10 000 000) FCFA sont passés suivant la procédure de consultation directe.",
      tags:["consultation directe","10 millions","petite dépense","procédure allégée"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Section 5 — Procédures simplifiées", art:"14",
      heading:"Interdiction du fractionnement",
      body:"Le fractionnement d'un marché directement ou indirectement motivé par le souhait de se situer en-dessous des seuils est strictement interdit.",
      tags:["fractionnement","interdiction","contournement des seuils","fraude"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Section 5 — Procédures simplifiées", art:"15",
      heading:"Interdiction des commandes successives similaires",
      body:"Est interdite la réalisation de travaux, fournitures, services et prestations dont les commandes sont passées successivement au cours d'un exercice budgétaire par un même service, pour des prestations identiques ou très similaires, quand elles ne font pas l'objet d'un marché et que leur montant total atteint les seuils par type de marché.",
      tags:["commandes successives","saucissonnage","exercice budgétaire","seuils","interdiction"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Section 5 — Procédures simplifiées", art:"16",
      heading:"Sanctions des infractions aux seuils",
      body:"Toute infraction aux dispositions relatives aux seuils et au fractionnement est passible des sanctions prévues au Titre VI, Chapitre 4 du présent Code.",
      tags:["sanctions","infraction","seuils","fractionnement"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Section 5 — Procédures simplifiées", art:"17",
      heading:"Bon de commande public",
      body:"Les procédures simplifiées de Bon de Commande publique seront fixées par décret.",
      tags:["bon de commande","procédure simplifiée","décret"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 3 — Préalables à la commande", art:"18",
      heading:"Préalables à toute commande publique",
      body:"Toute commande publique obéit aux préalables suivants : 1) l'identification des projets ; 2) l'évaluation de l'opportunité ; 3) l'intégration des besoins dans une programmation budgétaire ; 4) la disponibilité des crédits ; 5) la planification des opérations de mise en concurrence ; 6) la constitution d'un Dossier d'Appel d'Offres ; 7) le respect des obligations de publicité et de transparence ; 8) le choix de l'offre économiquement la plus avantageuse.",
      tags:["préalables","planification","opportunité","crédits","DAO","publicité","transparence","offre la plus avantageuse","programmation budgétaire"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 4 — Types de marchés", art:"19",
      heading:"Les quatre types de marchés publics",
      body:"Les types de marchés publics sont : 1) les marchés de travaux ; 2) les marchés de fournitures ; 3) les marchés de services ; 4) les marchés de prestations intellectuelles.",
      tags:["types de marchés","travaux","fournitures","services","prestations intellectuelles"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 4 — Types de marchés", art:"20",
      heading:"Marchés de travaux",
      body:"Les marchés de travaux ont pour objet la réalisation, au bénéfice d'un maître d'ouvrage ou maître d'ouvrage délégué, de tous travaux de bâtiment ou de génie civil ou la réfection d'ouvrages de toute nature.",
      tags:["marché de travaux","bâtiment","génie civil","réfection","ouvrages"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 4 — Types de marchés", art:"21",
      heading:"Marchés de fournitures",
      body:"Les marchés de fournitures concernent l'achat, la prise en crédit-bail, la location ou la location-vente de produits ou matériels au bénéfice d'un maître d'ouvrage ou maître d'ouvrage délégué.",
      tags:["marché de fournitures","achat","crédit-bail","location","location-vente","matériels"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 4 — Types de marchés", art:"22",
      heading:"Marchés de services",
      body:"Les marchés de services ont pour objet la réalisation de prestations qui ne peuvent être qualifiées ni de travaux ni de fournitures. Ils recouvrent notamment les services courants et les prestations de transport, d'entretien et maintenance des équipements et matériels, de nettoyage, de gardiennage des locaux administratifs et de jardinage.",
      tags:["marché de services","services courants","transport","maintenance","nettoyage","gardiennage","entretien"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 4 — Types de marchés", art:"23",
      heading:"Marchés mixtes",
      body:"Un marché peut comporter, à titre accessoire, des éléments relevant d'un autre type. Lorsqu'un marché a pour objet à la fois des services et des fournitures, il est un marché de services si la valeur de ceux-ci dépasse celle des produits, et inversement. En cas d'égalité de valeurs, le marché est réputé de fournitures.",
      tags:["marché mixte","services","fournitures","qualification","valeur prédominante"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 4 — Types de marchés", art:"24",
      heading:"Marchés de prestations intellectuelles",
      body:"Les marchés de prestations intellectuelles ont pour objet des prestations à caractère principalement intellectuel dont l'élément prédominant n'est pas physiquement quantifiable. Ils incluent la maîtrise d'ouvrage déléguée, la conduite d'opérations, la maîtrise d'œuvre, les services d'assistance technique et les marchés d'études.",
      tags:["prestations intellectuelles","maîtrise d'œuvre","assistance technique","études","conduite d'opérations","consultant"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 5 — Règles d'éthique", art:"25",
      heading:"Éthique des autorités publiques",
      body:"Toute personne intervenant, à quelque titre que ce soit, dans le processus de passation des marchés publics et des délégations de service public — pour le compte d'un maître d'ouvrage, d'une autorité de contrôle ou de régulation — est soumise aux dispositions prohibant la corruption, les pratiques frauduleuses et les conflits d'intérêt.",
      tags:["éthique","corruption","fraude","conflit d'intérêts","intégrité","déontologie"] },

    { titre:"Titre I — Dispositions générales", chapitre:"Chapitre 5 — Règles d'éthique", art:"26",
      heading:"Engagements des candidats et soumissionnaires",
      body:"Les candidats et soumissionnaires ont l'obligation, sous peine de rejet de leur offre, d'informer par écrit le maître d'ouvrage ou maître d'ouvrage délégué, tant au dépôt qu'en cours de procédure et jusqu'à la fin de l'exécution, de tout paiement, avantage ou privilège accordé au profit de toute personne agissant comme intermédiaire ou agent.",
      tags:["engagements","soumissionnaire","déclaration","intermédiaire","transparence","rejet de l'offre"] },

    /* ===== TITRE II — ORGANES ===== */
    { titre:"Titre II — Organes de gestion des marchés", chapitre:"Généralités", art:"27",
      heading:"Trois types d'organes",
      body:"La procédure de passation fait intervenir trois types d'organe : les organes de passation ; l'organe de contrôle a priori ; l'organe de régulation. Les seuils de passation, de contrôle et d'approbation sont fixés par décret. Le Ministère en charge des marchés publics dispose des pouvoirs d'autorisation des procédures exceptionnelles.",
      tags:["organes","passation","contrôle a priori","régulation","seuils","ministère des marchés publics"] },

    { titre:"Titre II — Organes de gestion des marchés", chapitre:"Chapitre 1 — Organes de passation", art:"28",
      heading:"Maîtres d'ouvrage",
      body:"Les maîtres d'ouvrage passent leurs marchés via : pour l'État, les départements ministériels et institutions ; pour les Provinces, le Président du Conseil Provincial ou le Gouverneur ; pour les départements, le Préfet ; pour les Communes, le Maire ; pour les établissements publics et organismes (art. 4), le Directeur Général ; pour les entreprises publiques et sociétés à participation majoritaire, le Directeur Général ou le Gérant. INSAPT, établissement public, passe ses marchés via son Directeur Général.",
      tags:["maître d'ouvrage","directeur général","établissement public","INSAPT","gouverneur","préfet","maire"] },

    { titre:"Titre II — Organes de gestion des marchés", chapitre:"Chapitre 1 — Organes de passation", art:"30",
      heading:"Maître d'ouvrage délégué & Service de Passation des Marchés",
      body:"Les maîtres d'ouvrage peuvent confier à un maître d'ouvrage délégué tout ou partie de leurs attributions, par un document écrit prévoyant à peine de nullité l'objet, les attributions, la rémunération et le contrôle. Chaque maître d'ouvrage se dote d'un Service de Passation des Marchés chargé de la planification, de la préparation des dossiers et de la mise en œuvre de la passation et de l'exécution. Les marchés conclus par une personne non habilitée sont nuls.",
      tags:["maître d'ouvrage délégué","service de passation","planification","nullité","délégation","cellule des marchés","SCM"] },

    { titre:"Titre II — Organes de gestion des marchés", chapitre:"Chapitre 2 — Commissions de passation", art:"31",
      heading:"Commissions de Passation des Marchés (CPM)",
      body:"Les Commissions de Passation des Marchés Publics sont des organes d'appui technique placés auprès des maîtres d'ouvrage pour les marchés au-dessus des seuils. Elles organisent les séances d'ouverture des plis, commettent des sous-commissions d'analyse, proposent l'attribution et émettent un avis technique sur les projets de marchés et d'avenants.",
      tags:["CPM","commission de passation","ouverture des plis","sous-commission d'analyse","attribution","avis technique","avenant"] },

    { titre:"Titre II — Organes de gestion des marchés", chapitre:"Chapitre 2 — Commissions de passation", art:"37",
      heading:"Fonctionnement de la CPM & archivage (72 h)",
      body:"La CPM se réunit sur convocation de son Président, qui fixe l'ordre du jour, signe les procès-verbaux et transmet les rapports d'analyse au maître d'ouvrage. Toute la documentation (DAO, PV d'ouverture, rapports d'analyse, avis d'appel d'offres, offres paraphées) est transmise à l'ARMP pour archivage dans un délai maximum de soixante-douze (72) heures dès la fin des travaux. Le maître d'ouvrage transmet à l'ARMP les avis, résultats, marchés et avenants dans les 48 heures après signature.",
      tags:["fonctionnement","procès-verbal","archivage","72 heures","48 heures","ARMP","documentation","traçabilité"] },

    { titre:"Titre II — Organes de gestion des marchés", chapitre:"Chapitre 2 — Commissions de passation", art:"41",
      heading:"Délais de la CPM (21 jours)",
      body:"La Commission de Passation des Marchés dispose d'un délai maximal de vingt-et-un (21) jours à compter de la réception d'un dossier pour se prononcer, y compris le délai de la sous-commission d'analyse. Ce délai peut être ramené à quinze (15) jours en cas d'urgence. Le dossier est transmis à la DGCMP dans un délai n'excédant pas 21 jours.",
      tags:["délais","21 jours","15 jours","urgence","CPM","DGCMP","sous-commission"] },

    { titre:"Titre II — Organes de gestion des marchés", chapitre:"Chapitre 2 — Commissions de passation", art:"43",
      heading:"Ouverture des plis & sous-commission d'analyse",
      body:"À l'ouverture, le Président vérifie que les plis sont fermés et cachetés, les ouvre, contrôle les pièces administratives et donne lecture publique des principaux éléments (montant, rabais, délais). La séance d'ouverture des offres n'est pas publique : seuls les soumissionnaires (un représentant chacun) y participent. Un procès-verbal est établi séance tenante. Les copies sont confiées à une sous-commission d'analyse ; l'évaluation ne peut excéder quinze (15) jours.",
      tags:["ouverture des plis","pli cacheté","procès-verbal","sous-commission","évaluation","15 jours","soumissionnaire"] },

    { titre:"Titre II — Organes de gestion des marchés", chapitre:"Chapitre 2 — Commissions de passation", art:"45",
      heading:"Autorisation préalable du gré à gré",
      body:"Le maître d'ouvrage sollicite du Ministre en charge des marchés publics l'autorisation préalable de passer un marché de gré à gré ; sa demande doit être motivée. En cas d'accord, il procède à la consultation directe, sans obligation de publicité, conformément aux cas de l'article 101.",
      tags:["gré à gré","autorisation préalable","ministre","motivation","consultation directe","article 101"] },

    { titre:"Titre II — Organes de gestion des marchés", chapitre:"Chapitre 4 — Autorités approbatrices", art:"50",
      heading:"Approbation des marchés",
      body:"Les marchés publics et délégations de service public sont transmis à une autorité approbatrice distincte de l'autorité signataire, conformément au décret fixant les seuils d'approbation. Les marchés ne sont valables que s'ils sont approuvés par les autorités compétentes.",
      tags:["approbation","autorité approbatrice","autorité signataire","seuils d'approbation","validité"] },

    { titre:"Titre II — Organes de gestion des marchés", chapitre:"Sous-titre 2 — Organe de contrôle", art:"52",
      heading:"Contrôle : DGCMP et ARMP",
      body:"Le contrôle de l'application de la réglementation est assuré par : 1) l'Organe de Contrôle des Marchés Publics (DGCMP), chargé du contrôle a priori de la passation et du suivi de l'exécution ; 2) l'Autorité de Régulation des Marchés Publics (ARMP), chargée de la régulation indépendante et, par des audits indépendants, du contrôle a posteriori.",
      tags:["contrôle","DGCMP","ARMP","contrôle a priori","contrôle a posteriori","audit","régulation"] },

    { titre:"Titre II — Organes de gestion des marchés", chapitre:"Sous-titre 3 — Contrôle a priori", art:"54",
      heading:"Missions de l'organe de contrôle a priori",
      body:"L'Organe de Contrôle des Marchés Publics, placé sous l'autorité du Ministre en charge des marchés publics, émet un avis motivé sur les DAO avant lancement, donne son avis sur les autorisations et dérogations, émet un avis motivé sur le rapport d'analyse comparative et le PV d'attribution provisoire, et procède à un examen juridique et technique du dossier de marché avant approbation.",
      tags:["contrôle a priori","DGCMP","avis motivé","DAO","dérogation","examen juridique","attribution provisoire"] },

    { titre:"Titre II — Organes de gestion des marchés", chapitre:"Sous-titre 3 — Contrôle a priori", art:"55",
      heading:"Avis de l'organe de contrôle (7 jours)",
      body:"L'organe de contrôle émet sur chaque dossier un avis favorable, favorable assorti de réserves, ou défavorable. Il dispose d'un délai de sept (7) jours ouvrables à compter de la réception d'un dossier complet ; passé ce délai, l'avis est réputé favorable. En cas de désaccord persistant, le dossier est transmis à l'ARMP pour arbitrage (délai de 15 jours), dont la décision s'impose aux deux parties. Ce recours est suspensif.",
      tags:["avis","favorable","réserves","défavorable","7 jours","silence vaut accord","arbitrage","ARMP","recours suspensif"] },

    { titre:"Titre II — Organes de gestion des marchés", chapitre:"Sous-titre 4 — Organe de régulation", art:"59",
      heading:"Création de l'ARMP",
      body:"Il est institué auprès de la Présidence de la République un organe de régulation dénommé Autorité de Régulation des Marchés Publics (ARMP), chargé d'assurer la régulation du système. L'ARMP comprend de manière tripartite des représentants de l'Administration, du secteur privé et de la société civile.",
      tags:["ARMP","création","régulation","tripartite","présidence de la République","secteur privé","société civile"] },

    { titre:"Titre II — Organes de gestion des marchés", chapitre:"Sous-titre 4 — Organe de régulation", art:"60",
      heading:"Missions et attributions de l'ARMP",
      body:"L'ARMP veille à l'application de la réglementation, contribue à la formation et à l'information des opérateurs, élabore les documents types et manuels, collecte les statistiques, promeut la transparence et les voies de recours, évalue les capacités, fait conduire des audits a posteriori (rendus publics), prononce des sanctions pécuniaires et d'exclusion, reçoit les recours des candidats et soumissionnaires, et gère le journal officiel et le site internet des marchés publics.",
      tags:["ARMP","missions","formation","documents types","statistiques","audit","sanctions","exclusion","recours","journal des marchés"] },

    { titre:"Titre II — Organes de gestion des marchés", chapitre:"Chapitre 3 — Contrôle a posteriori", art:"64",
      heading:"Auditeur indépendant (audit annuel)",
      body:"L'Auditeur Indépendant assure le contrôle a posteriori par un audit annuel. L'ARMP commande, à la fin de chaque exercice, un audit indépendant sur un échantillon aléatoire comprenant tous les marchés supérieurs à 300 millions FCFA, 25 % des marchés compris entre 10 et 300 millions, et 5 % des bons de commande inférieurs à 10 millions. L'auditeur est un cabinet de réputation établie recruté par appel d'offres.",
      tags:["auditeur indépendant","audit annuel","échantillon","300 millions","25%","5%","contrôle a posteriori","exercice budgétaire"] },

    { titre:"Titre II — Organes de gestion des marchés", chapitre:"Sous-titre 5 — Incompatibilités", art:"65",
      heading:"Incompatibilités",
      body:"Nul ne peut être Président de plus d'une Commission de Passation des Marchés, ni être à la fois membre d'une CPM et appartenir à la DGCMP ou à l'ARMP. Ces incompatibilités garantissent la séparation des fonctions de passation, de contrôle et de régulation.",
      tags:["incompatibilité","séparation des fonctions","CPM","DGCMP","ARMP","cumul interdit"] },

    /* ===== TITRE III — GESTION / PASSATION ===== */
    { titre:"Titre III — Gestion des marchés", chapitre:"Chapitre 1 — Détermination des besoins", art:"70",
      heading:"Détermination des besoins",
      body:"Avant tout appel à la concurrence, consultation ou entente directe, le maître d'ouvrage est tenu de déterminer aussi exactement que possible la nature et l'étendue des besoins à satisfaire. Les travaux, fournitures ou services objet des marchés doivent répondre exclusivement à ces besoins.",
      tags:["détermination des besoins","expression du besoin","planification","préparation"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Chapitre 1 — Détermination des besoins", art:"71",
      heading:"Plan de passation des marchés (PPM)",
      body:"Lors de l'établissement de leur budget, les maîtres d'ouvrage évaluent le montant total des marchés envisagés et établissent un plan de passation des marchés, selon un modèle type de l'ARMP. Ces plans, cohérents avec les crédits alloués, sont révisables et communiqués à l'ARMP qui en assure la publicité. Tout marché doit avoir été préalablement inscrit au PPM, sous peine de nullité.",
      tags:["PPM","plan de passation","budget","publicité","nullité","programmation","ARMP"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Chapitre 1 — Détermination des besoins", art:"72",
      heading:"Allotissement",
      body:"Lorsque l'allotissement présente des avantages financiers ou techniques, les travaux, fournitures ou services sont répartis en lots pouvant donner lieu chacun à un marché distinct. Le DAO fixe le nombre, la nature et l'importance des lots. Tout morcellement de commandes en violation du PPM est prohibé.",
      tags:["allotissement","lots","marché distinct","morcellement","avantages techniques"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Chapitre 2 — Financement & crédits", art:"73",
      heading:"Existence des crédits",
      body:"En phase de préparation, le maître d'ouvrage doit évaluer le montant estimé des prestations et s'assurer de l'existence de crédits budgétaires suffisants, et obtenir le cas échéant les autorisations préalables auxquelles la conclusion du marché est soumise.",
      tags:["crédits budgétaires","disponibilité des crédits","autorisation préalable","préparation"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Sous-titre 2 — Passation / Généralités", art:"76",
      heading:"Appel d'offres ouvert : la règle",
      body:"Les marchés publics sont passés après mise en concurrence sur appel d'offres. Ils peuvent exceptionnellement être attribués de gré à gré dans les conditions définies. L'appel d'offres ouvert est la règle ; le recours à tout autre mode doit être exceptionnel, justifié par le maître d'ouvrage et autorisé au préalable par le Ministre en charge des marchés publics. Tout fournisseur, prestataire ou entrepreneur peut se porter candidat et bénéficie de l'égalité de traitement.",
      tags:["appel d'offres ouvert","règle","mise en concurrence","gré à gré","autorisation","égalité de traitement"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Section 2 — Sous-traitance", art:"77",
      heading:"Sous-traitance (plafond 30 %)",
      body:"En matière de travaux et services, le titulaire peut sous-traiter certaines parties à condition d'avoir obtenu l'acceptation de chaque sous-traitant et l'agrément de ses conditions de paiement, et que cette possibilité soit prévue au DAO. Le soumissionnaire doit indiquer dans son offre la nature et le montant de la partie sous-traitée. La sous-traitance de plus de trente pour cent (30 %) de la valeur globale du marché est interdite.",
      tags:["sous-traitance","30%","plafond","agrément","titulaire","paiement direct"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Section 3 — Préférence nationale", art:"80",
      heading:"Préférence nationale (15 %)",
      body:"Le maître d'ouvrage peut, lors de la préparation d'un DAO international, accorder une préférence aux soumissionnaires nationaux, à condition que leur offre soit jugée conforme au mieux-disant et que le prix ne soit pas supérieur de plus de quinze pour cent (15 %) à celui-ci. La préférence s'applique aux artisans et chefs d'entreprise tchadiens et aux sociétés à majorité de capital tchadien. Elle doit être annoncée dès le lancement dans le DAO.",
      tags:["préférence nationale","15%","soumissionnaire national","tchadien","appel d'offres international","DAO"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Section 4 — Préférence genre", art:"81",
      heading:"Préférence genre (10 %)",
      body:"Lors de la passation, une préférence de dix pour cent (10 %) peut être accordée à l'offre conforme présentée par une entreprise ou un groupement d'entreprises de femmes d'affaires de nationalité tchadienne. Cette préférence doit être expressément annoncée dès le lancement de l'appel d'offres dans le DAO.",
      tags:["préférence genre","10%","femmes d'affaires","tchadienne","inclusion","DAO"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Chapitre 2 — Marchés par appel d'offres", art:"82",
      heading:"Critères d'évaluation",
      body:"L'appel d'offres se conclut sans négociation, sur la base de critères objectifs portés à la connaissance des candidats dans le DAO et exprimés autant que possible en termes monétaires. Outre le prix, les critères peuvent inclure les spécifications techniques, le délai d'exécution, le coût de fonctionnement, le service après-vente, et les conditions de paiement, ainsi que la qualification des candidats (moyens, capacité professionnelle et financière, références).",
      tags:["critères d'évaluation","objectifs","termes monétaires","prix","délai","qualification","références","DAO"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Section 2 — Types d'appels d'offres", art:"83",
      heading:"Types d'appels d'offres",
      body:"L'appel d'offres peut être ouvert, restreint ou avec concours ; national ou international. L'appel d'offres n'est valable que si, après respect de toutes les dispositions réglementaires, le maître d'ouvrage a reçu au moins une soumission jugée conforme.",
      tags:["types d'appels d'offres","ouvert","restreint","concours","national","international","soumission conforme"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Sous-section 1 — Appel d'offres ouvert", art:"84",
      heading:"Appel d'offres ouvert & publicité (30 jours)",
      body:"L'appel d'offres est ouvert lorsque tout candidat satisfaisant aux conditions peut soumettre une offre. L'avis est publié au moins trente (30) jours avant la date limite de réception des offres, par insertion dans des publications habilitées et sur les sites internet officiels. Un appel d'offres est déclaré infructueux en l'absence d'offres conformes ; il est alors procédé à un nouvel appel d'offres ou à une consultation d'au moins trois (3) candidats, après autorisation de l'organe de contrôle.",
      tags:["appel d'offres ouvert","publicité","30 jours","avis","infructueux","trois candidats","délai de soumission"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Sous-section 4 — Appel d'offres restreint", art:"90",
      heading:"Appel d'offres restreint (minimum 3)",
      body:"L'appel d'offres est restreint lorsque seuls les candidats que le maître d'ouvrage a décidé de consulter peuvent remettre des offres. Le nombre de candidats admis (minimum 3) doit assurer une concurrence réelle. Le recours n'est possible qu'après avis de l'organe de contrôle, notamment en cas d'urgence impérieuse imprévisible, d'appel d'offres infructueux, de marchés de recherche/essai, de défaillance du titulaire, ou lorsque seul un nombre limité de fournisseurs peut exécuter.",
      tags:["appel d'offres restreint","minimum 3","concurrence réelle","urgence","infructueux","avis de l'organe de contrôle"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Chapitre 3 — Prestations intellectuelles", art:"95",
      heading:"Liste restreinte & manifestation d'intérêt",
      body:"La liste restreinte des candidats pré-qualifiés est arrêtée à la suite d'une sollicitation de manifestation d'intérêt comprenant les termes de référence, la lettre d'invitation et les critères. Les offres s'ouvrent en deux temps : d'abord les offres techniques (évaluées selon le DAO), puis, seulement pour les candidats techniquement qualifiés, les offres financières. Le délai de soumission ne peut être inférieur à trente (30) jours sans l'avis de l'organe de contrôle.",
      tags:["liste restreinte","manifestation d'intérêt","termes de référence","offre technique","offre financière","30 jours","consultant"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Chapitre 3 — Prestations intellectuelles", art:"96",
      heading:"Méthodes de sélection des consultants",
      body:"L'attribution s'effectue, par référence à une qualification minimum requise : soit sur la base de la qualité technique et du montant de la proposition (qualité-coût) ; soit sur la base d'un budget prédéterminé ; soit sur la base de la meilleure proposition financière parmi les candidats ayant obtenu la note minimale. Pour les prestations d'une complexité exceptionnelle, la sélection peut se faire exclusivement sur la qualité technique (art. 97).",
      tags:["sélection consultants","qualité-coût","qualité technique","budget déterminé","moindre coût","note minimale"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Chapitre 4 — Marchés de gré à gré", art:"100",
      heading:"Définition du gré à gré",
      body:"Un marché est dit de gré à gré (entente directe) lorsqu'il est passé sans appel d'offres, après accord du Ministre en charge des marchés publics. La demande d'autorisation de recours à cette procédure doit décrire les motifs la justifiant.",
      tags:["gré à gré","entente directe","sans appel d'offres","autorisation du ministre","motivation"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Chapitre 4 — Marchés de gré à gré", art:"101",
      heading:"Cas limitatifs du gré à gré",
      body:"Un marché de gré à gré ne peut être passé que dans l'un des cas limitatifs suivants : besoins ne pouvant être satisfaits que par un brevet, une licence ou des droits exclusifs détenus par un seul prestataire ; marché ne pouvant être confié qu'à un prestataire déterminé pour des raisons techniques ou artistiques ; extrême urgence pour remplacer un titulaire défaillant ; urgence impérieuse motivée par la force majeure ne permettant pas de respecter les délais d'appel d'offres.",
      tags:["gré à gré","cas limitatifs","brevet","droits exclusifs","raisons techniques","extrême urgence","force majeure"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Chapitre 5 — Marchés spéciaux", art:"104",
      heading:"Marchés spéciaux (défense & sécurité)",
      body:"Les marchés spéciaux sont ceux relatifs à la défense nationale, à la sécurité et aux intérêts stratégiques de l'État (y compris les vivres destinés aux militaires). Le Code ne s'applique pas aux marchés concernant des besoins de défense et de sécurité exigeant le secret ou pour lesquels la protection des intérêts essentiels de l'État est incompatible avec la publicité.",
      tags:["marchés spéciaux","défense","sécurité","intérêts stratégiques","secret","exception"] },

    { titre:"Titre III — Gestion des marchés", chapitre:"Chapitre 6 — Délégations de service public", art:"105",
      heading:"Délégations de service public (DSP)",
      body:"L'État et les collectivités locales décentralisées peuvent conclure des conventions de délégation de service public. La procédure de sélection du délégataire doit être préalablement validée par l'organe de contrôle. La passation est précédée d'une publicité et le délai de réception des soumissions est au minimum de quarante-cinq (45) jours (art. 106) ; une pré-qualification est obligatoire (art. 107).",
      tags:["délégation de service public","DSP","concession","affermage","régie","45 jours","pré-qualification","délégataire"] },

    /* ===== TITRE IV — EXÉCUTION & RÈGLEMENT ===== */
    { titre:"Titre IV — Exécution et règlement", chapitre:"Chapitre 1 — Garanties", art:"Garanties",
      heading:"Régime des garanties",
      body:"Le Code organise les garanties du marché : la caution de soumission (garantie de l'offre, pour garantir la participation jusqu'à la signature), la garantie de bonne exécution (technique et de délai), la retenue de garantie, les autres garanties et la caution de restitution d'avances (pour garantir le remboursement de l'avance de démarrage).",
      tags:["garantie","caution de soumission","bonne exécution","retenue de garantie","avance de démarrage","restitution d'avances"] },

    { titre:"Titre IV — Exécution et règlement", chapitre:"Chapitre 2 — Variation des prix & avenants", art:"Avenants",
      heading:"Variation des prix et avenants",
      body:"Le marché peut faire l'objet d'une variation de prix et d'avenants modifiant certaines clauses du marché de base pour l'adapter à des événements survenus après sa signature, dans les limites fixées par le Code et sans bouleverser l'économie du marché. Tout projet d'avenant est soumis à l'avis de la CPM et à l'examen de l'organe de contrôle.",
      tags:["avenant","variation de prix","modification","clauses","économie du marché","avis CPM","contrôle"] },

    { titre:"Titre IV — Exécution et règlement", chapitre:"Chapitre 3 — Modalités de règlement", art:"Règlement",
      heading:"Avances, acomptes, délais & intérêts moratoires",
      body:"Le règlement des marchés comprend les avances (paiement partiel préalable à l'exécution), les acomptes (paiement de fractions exécutées), les délais de règlement, les intérêts moratoires et pénalités, et les paiements directs aux sous-traitants. Le retard de paiement imputable à l'administration ouvre droit à des intérêts moratoires.",
      tags:["règlement","avance","acompte","délai de paiement","intérêts moratoires","pénalités","paiement sous-traitant"] },

    /* ===== TITRE V — CONTRÔLE EXÉCUTION / RÉSILIATION ===== */
    { titre:"Titre V — Contrôle de l'exécution & résiliation", chapitre:"Chapitre 1 — Contrôle & réception", art:"Réception",
      heading:"Contrôle de l'exécution et réception",
      body:"L'exécution des marchés fait l'objet d'un contrôle par le maître d'ouvrage et d'une réception constatant la conformité des prestations. La commission de réception est établie auprès de chaque autorité contractante. La réception conditionne la libération des garanties et le paiement du solde.",
      tags:["contrôle d'exécution","réception","commission de réception","conformité","solde","garanties"] },

    { titre:"Titre V — Contrôle de l'exécution & résiliation", chapitre:"Chapitre 3 — Résiliation", art:"Résiliation",
      heading:"Résiliation des marchés",
      body:"Le marché peut être résilié : à l'initiative de l'autorité contractante (notamment pour faute du titulaire ou motif d'intérêt général), à l'initiative du titulaire, de plein droit, ou d'un commun accord. Les conséquences de la résiliation (décompte, indemnités éventuelles) sont réglées selon les stipulations du marché et le Code.",
      tags:["résiliation","faute du titulaire","intérêt général","plein droit","commun accord","décompte","indemnités"] },

    /* ===== TITRE VI — CONTENTIEUX & SANCTIONS ===== */
    { titre:"Titre VI — Contentieux et sanctions", chapitre:"Chapitre 1 — Litiges & recours", art:"Recours",
      heading:"Recours des candidats et soumissionnaires",
      body:"Les candidats et soumissionnaires disposent de voies de recours à chaque étape : entre la publication de l'avis et l'ouverture des plis ; à l'ouverture des plis ; entre la publication des résultats et la notification de l'attribution ; puis un recours devant le Comité de Règlement des Différends (CRD) de l'ARMP. Le Code fixe les modalités d'exercice de ces recours.",
      tags:["recours","litige","CRD","comité de règlement des différends","ARMP","attribution","voies de recours"] },

    { titre:"Titre VI — Contentieux et sanctions", chapitre:"Chapitre 3 — Contentieux de l'exécution", art:"Contentieux",
      heading:"Contentieux de l'exécution",
      body:"Le contentieux de l'exécution comprend le recours hiérarchique et le recours juridictionnel. Il couvre les différends survenant lors de l'exécution du marché entre le titulaire et l'autorité contractante.",
      tags:["contentieux","exécution","recours hiérarchique","recours juridictionnel","différend"] },

    { titre:"Titre VI — Contentieux et sanctions", chapitre:"Chapitre 4 — Sanctions", art:"222",
      heading:"Sanctions & exclusion de la commande publique",
      body:"L'ARMP prononce des sanctions pécuniaires et, sous certaines conditions, des sanctions d'exclusion (art. 222) à l'encontre des acteurs du secteur privé ayant porté atteinte à la réglementation, notamment en cas de corruption ou d'infractions assimilables. Les personnes ayant violé la réglementation peuvent être exclues de la commande publique pour une durée limitée, la liste étant publiée au Journal Officiel des marchés publics. Le contentieux répressif couvre la complicité, la violation du secret professionnel, les malversations et défaillances, la nullité des contrats et la réparation des dommages.",
      tags:["sanctions","exclusion","corruption","malversation","secret professionnel","nullité","Journal Officiel","liste des exclus","article 222"] },

    /* ===== TITRE VII — DISPOSITIONS FINALES ===== */
    { titre:"Titre VII — Dispositions transitoires et finales", chapitre:"Dispositions finales", art:"Dématérialisation",
      heading:"Dématérialisation & documents types",
      body:"L'ARMP élabore, diffuse et met à jour les documents types, manuels de procédures et progiciels appropriés, et met en place un site internet des marchés publics. Le Code encourage la dématérialisation : création, échange, envoi, réception ou conservation d'informations par des moyens électroniques (notamment l'Échange de Données Informatisées et la messagerie électronique).",
      tags:["dématérialisation","documents types","manuels de procédures","site internet","EDI","archivage électronique","ARMP"] }
  ]
};
