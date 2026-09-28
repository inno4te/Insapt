/* INSAPT — trilingual engine (FR default, AR, EN).
   Any element with data-i18n="key" gets its text replaced.
   Language persists in localStorage. AR flips document to RTL. */
(function () {
  const T = {
    fr: {
      "util.hours": "Lun–Ven · 07h30–15h30",
      "util.place": "N'Djaména, Tchad",
      "util.portal": "Portail agents",
      "nav.home": "Accueil",
      "nav.about": "L'Institut",
      "nav.missions": "Missions",
      "nav.poles": "Pôles techniques",
      "nav.org": "Gouvernance",
      "nav.people": "Direction",
      "nav.docs": "Documents",
      "nav.news": "Actualités",
      "nav.contact": "Contact",
      "nav.scm": "Chaîne d'approvisionnement",
      "nav.labstock": "Lab Stock — LaBiEp",
      "nav.academy": "Academy",
      "foot.academy": "INSAPT Academy — Formation",
      "scm.academy": "🎓 INSAPT Academy",

      "hero.eyebrow": "Établissement public à caractère scientifique",
      "hero.title1": "Protéger la santé des populations par la ",
      "hero.titleEm": "science et la veille",
      "hero.title2": "",
      "hero.lead": "L'Institut National de Santé Publique du Tchad conduit la recherche, la surveillance et la formation au service de la santé publique nationale.",
      "hero.cta1": "Découvrir l'Institut",
      "hero.cta2": "Nos missions",
      "hero.poles": "Nos trois pôles techniques",
      "hero.cvs": "Centre de Veille Sanitaire",
      "hero.cvsD": "Surveillance épidémiologique & alerte",
      "hero.lnsp": "Laboratoire National de Santé Publique",
      "hero.lnspD": "Analyses, contrôle qualité & diagnostic",
      "hero.cfrsp": "Centre de Formation et Recherche",
      "hero.cfrspD": "Formation continue & recherche appliquée",

      "stat.1": "Création par la Loi",
      "stat.1n": "2020",
      "stat.2": "Pôles techniques",
      "stat.2n": "03",
      "stat.3": "Double tutelle ministérielle",
      "stat.3n": "02",
      "stat.4": "Siège",
      "stat.4n": "N'Djaména",

      "about.kicker": "L'Institut",
      "about.title": "Un institut national au cœur de la santé publique",
      "about.p": "Créé par la Loi N°11/PR/2020 et organisé par le Décret N°2624/PT/PM/MSPP/2023, l'INSAPT est un établissement public à caractère scientifique doté de la personnalité juridique et de l'autonomie administrative et financière. Il est placé sous la double tutelle du Ministère en charge de la Santé Publique et du Ministère en charge de l'Enseignement Supérieur et de la Recherche Scientifique.",
      "about.c1t": "Notre statut",
      "about.c1": "Établissement public à caractère scientifique, autonomie administrative et financière.",
      "about.c2t": "Notre tutelle",
      "about.c2": "Santé Publique (tutelle administrative et technique) et Enseignement Supérieur (tutelle académique et scientifique).",
      "about.c3t": "Notre vocation",
      "about.c3": "Recherche, veille sanitaire, laboratoire de référence, formation et expertise au service des populations.",

      "miss.kicker": "Missions",
      "miss.title": "Une mission de service public",
      "miss.p": "Aux termes du Décret d'organisation, l'INSAPT est principalement chargé de :",
      "miss.1": "Réaliser les activités de recherche scientifique relevant de sa compétence et intéressant la sauvegarde de la santé des populations.",
      "miss.2": "Effectuer toutes études, recherches et analyses en vue de trouver des solutions aux problèmes prioritaires de santé publique.",
      "miss.3": "Assurer, en cas de besoin, un enseignement complémentaire et un encadrement technique du personnel de santé.",
      "miss.4": "Apporter l'expertise en matière de recherche, de suivi et de certification des vaccins et en centraliser les données.",
      "miss.5": "Assurer le contrôle de qualité des analyses réalisées par les laboratoires publics et privés du territoire national.",
      "miss.6": "Contribuer à l'organisation des actions de prévention et de contrôle des pathologies liées aux épizooties transmissibles à l'homme.",

      "poles.kicker": "Pôles techniques",
      "poles.title": "Trois pôles, une chaîne de valeur en santé publique",
      "poles.p": "L'INSAPT est organisé en trois pôles techniques complémentaires (Décret N°2624/2023, art. 22).",
      "poles.cvsChip": "Article 23",
      "poles.cvsT": "Centre de Veille Sanitaire (CVS)",
      "poles.cvs": "Observation de l'état de santé de la population, veille et vigilance sanitaires, alerte précoce et collaboration intersectorielle en appui à la décision publique.",
      "poles.lnspChip": "Article 25",
      "poles.lnspT": "Laboratoire National de Santé Publique (LNSP)",
      "poles.lnsp": "Soutien technique aux programmes de santé, contrôle sanitaire des eaux et aliments, diagnostic de confirmation des maladies à potentiel épidémique et supervision des laboratoires provinciaux.",
      "poles.cfrspChip": "Article 27",
      "poles.cfrspT": "Centre de Formation et Recherche en Santé Publique (CFRSP)",
      "poles.cfrsp": "Planification, organisation et évaluation des activités de formation et de recherche : formation spécialisée, formation continue, ateliers et publication des travaux.",

      "org.kicker": "Gouvernance",
      "org.title": "Une organisation structurée et redevable",
      "org.p": "La structure de l'INSAPT (Décret N°2624/2023, art. 7) s'articule autour de quatre ensembles.",
      "org.1t": "Conseil d'Administration",
      "org.1": "Présidé par le Ministre en charge de la Santé, vice-présidé par le Ministre en charge de l'Enseignement Supérieur. Fixe les orientations, adopte le budget et arrête les comptes.",
      "org.2t": "Direction Générale",
      "org.2": "Dirigée par un Directeur Général assisté d'un Adjoint. Comprend le Secrétariat Général, la Direction des Études, la Direction de la Communication et l'Agence Comptable.",
      "org.3t": "Organes techniques",
      "org.3": "Les trois pôles : CVS, LNSP et CFRSP, chacun placé sous l'autorité d'un Directeur nommé par décret.",
      "org.4t": "Organes consultatifs",
      "org.4": "Un Conseil Scientifique (10 membres) et un Comité d'Éthique chargés de l'orientation scientifique et des questions de déontologie.",

      "ppl.kicker": "Direction",
      "ppl.title": "L'équipe de direction",
      "ppl.p": "Nommée par le Décret N°0642/PR/PM/MSPP/2025 du 15 avril 2025.",
      "ppl.dg": "Directeur Général",
      "ppl.dgName": "Pr Ali Mahamat Moussa",
      "ppl.dga": "Directrice Générale Adjointe",
      "ppl.dgaName": "Dr Djekoundade Antoinette",
      "ppl.sg": "Secrétaire Général",
      "ppl.sgName": "M. Mingar Tomasbe Arnaud",
      "ppl.de": "Directeur des Études",
      "ppl.deName": "Dr Mahamat Fayiz Abakar",
      "ppl.dc": "Directrice de la Communication, des Statistiques et des Archives",
      "ppl.dcName": "Mme Mariam Issaka Daoud",
      "ppl.vacant": "Poste",
      "ppl.vacantName": "À pourvoir",

      "docs.kicker": "Documents",
      "docs.title": "Textes fondateurs & ressources",
      "docs.p": "Les textes officiels régissant la création et le fonctionnement de l'INSAPT.",
      "docs.code": "Code des Marchés Publics — Décret N°2130/PR/2020",
      "docs.codeS": "Base consultable par mot-clé (portail SCM)",
      "docs.d1": "Loi N°11/PR/2020 — Création de l'INSAPT",
      "docs.d1s": "Décret d'application · PDF",
      "docs.d2": "Décret N°2624/PT/PM/MSPP/2023 — Organisation & Fonctionnement",
      "docs.d2s": "18 septembre 2023 · PDF",
      "docs.d3": "Décret N°0642/PR/PM/MSPP/2025 — Nominations",
      "docs.d3s": "15 avril 2025 · PDF",
      "docs.d4": "Plan Stratégique 2026–2030",
      "docs.d4s": "Document de référence · PDF",
      "docs.d5": "Arrêté portant création du COUSP",
      "docs.d5s": "Centre des Opérations d'Urgence · PDF",

      "news.kicker": "Actualités",
      "news.title": "Vie de l'Institut",
      "news.p": "Cet espace accueillera les communiqués, appels et événements de l'INSAPT.",
      "news.tag": "Institution",
      "news.1t": "Mise en place des organes de gouvernance",
      "news.1": "L'INSAPT poursuit l'opérationnalisation de sa Direction Générale et de ses pôles techniques.",
      "news.2t": "Élaboration du Plan Stratégique 2026–2030",
      "news.2": "Un cadre pluriannuel pour orienter la recherche, la veille et la formation en santé publique.",
      "news.3t": "Renforcement de la fonction achats",
      "news.3": "Adoption d'un Manuel de Politiques et Procédures de Passation des Marchés.",
      "news.readmore": "Lire la suite",

      "contact.kicker": "Contact",
      "contact.title": "Nous joindre",
      "contact.addr": "Adresse",
      "contact.addrV": "Siège de l'INSAPT — N'Djaména, République du Tchad",
      "contact.mail": "Courriel",
      "contact.phone": "Téléphone",
      "contact.phoneV": "À communiquer",

      "foot.about": "L'Institut National de Santé Publique du Tchad — recherche, veille sanitaire, laboratoire de référence et formation au service de la santé des populations.",
      "foot.explore": "Explorer",
      "foot.resources": "Ressources",
      "foot.contact": "Contact",
      "foot.armp": "ARMP — Codes des marchés publics",
      "foot.portal": "Portail SCM (agents)",
      "foot.labstock": "Lab Stock — Stocks LaBiEp (agents)",
      "foot.rights": "Tous droits réservés.",
      "foot.builtFor": "République du Tchad · Unité — Travail — Progrès",

      /* SCM portal */
      "scm.loginTitle": "Portail Chaîne d'Approvisionnement",
      "scm.loginSub": "Accès réservé au responsable SCM de l'INSAPT.",
      "scm.user": "Identifiant",
      "scm.pass": "Mot de passe",
      "scm.signin": "Se connecter",
      "scm.err": "Identifiant ou mot de passe incorrect.",
      "scm.back": "Retour au site public",
      "scm.secure": "Connexion sécurisée · session locale",
      "scm.welcome": "Espace de gestion des approvisionnements et des stocks",
      "scm.logout": "Déconnexion",
      "scm.tab.dash": "Tableau de bord",
      "scm.tab.proc": "Procédures",
      "scm.tab.manual": "Manuel des marchés",
      "scm.tab.code": "Code des Marchés Publics",
      "scm.tab.barcode": "Codes-barres",
      "scm.tab.stock": "Registre des stocks",
      "scm.tab.reports": "Rapports",
      "scm.tab.docs": "Documents & liens"
    },

    en: {
      "util.hours": "Mon–Fri · 07:30–15:30",
      "util.place": "N'Djamena, Chad",
      "util.portal": "Staff portal",
      "nav.home": "Home",
      "nav.about": "The Institute",
      "nav.missions": "Missions",
      "nav.poles": "Technical hubs",
      "nav.org": "Governance",
      "nav.people": "Leadership",
      "nav.docs": "Documents",
      "nav.news": "News",
      "nav.contact": "Contact",
      "nav.scm": "Supply Chain",
      "nav.labstock": "Lab Stock — LaBiEp",
      "nav.academy": "Academy",
      "foot.academy": "INSAPT Academy — Training",
      "scm.academy": "🎓 INSAPT Academy",

      "hero.eyebrow": "Scientific public establishment",
      "hero.title1": "Protecting population health through ",
      "hero.titleEm": "science and surveillance",
      "hero.title2": "",
      "hero.lead": "The National Public Health Institute of Chad leads research, surveillance and training in the service of national public health.",
      "hero.cta1": "About the Institute",
      "hero.cta2": "Our missions",
      "hero.poles": "Our three technical hubs",
      "hero.cvs": "Health Surveillance Centre",
      "hero.cvsD": "Epidemiological surveillance & alert",
      "hero.lnsp": "National Public Health Laboratory",
      "hero.lnspD": "Analysis, quality control & diagnosis",
      "hero.cfrsp": "Training & Research Centre",
      "hero.cfrspD": "Continuing training & applied research",

      "stat.1": "Established by Law",
      "stat.1n": "2020",
      "stat.2": "Technical hubs",
      "stat.2n": "03",
      "stat.3": "Ministerial supervision",
      "stat.3n": "02",
      "stat.4": "Headquarters",
      "stat.4n": "N'Djamena",

      "about.kicker": "The Institute",
      "about.title": "A national institute at the heart of public health",
      "about.p": "Established by Law No. 11/PR/2020 and organised by Decree No. 2624/PT/PM/MSPP/2023, INSAPT is a scientific public establishment with legal personality and administrative and financial autonomy. It operates under the joint supervision of the Ministry of Public Health and the Ministry of Higher Education and Scientific Research.",
      "about.c1t": "Our status",
      "about.c1": "Scientific public establishment with administrative and financial autonomy.",
      "about.c2t": "Our supervision",
      "about.c2": "Public Health (administrative and technical oversight) and Higher Education (academic and scientific oversight).",
      "about.c3t": "Our purpose",
      "about.c3": "Research, health surveillance, reference laboratory, training and expertise for the population.",

      "miss.kicker": "Missions",
      "miss.title": "A public-service mission",
      "miss.p": "Under the organising Decree, INSAPT is principally responsible for:",
      "miss.1": "Conducting scientific research within its remit relating to safeguarding population health.",
      "miss.2": "Carrying out studies, research and analyses to solve priority public-health problems.",
      "miss.3": "Providing, where needed, complementary teaching and technical mentoring of health staff.",
      "miss.4": "Providing expertise in vaccine research, monitoring and certification and centralising related data.",
      "miss.5": "Ensuring quality control of analyses performed by public and private laboratories nationwide.",
      "miss.6": "Contributing to prevention and control of diseases linked to zoonoses transmissible to humans.",

      "poles.kicker": "Technical hubs",
      "poles.title": "Three hubs, one public-health value chain",
      "poles.p": "INSAPT is organised into three complementary technical hubs (Decree No. 2624/2023, art. 22).",
      "poles.cvsChip": "Article 23",
      "poles.cvsT": "Health Surveillance Centre (CVS)",
      "poles.cvs": "Observation of the population's health status, health surveillance and vigilance, early warning and intersectoral collaboration supporting public decision-making.",
      "poles.lnspChip": "Article 25",
      "poles.lnspT": "National Public Health Laboratory (LNSP)",
      "poles.lnsp": "Technical support to health programmes, sanitary control of water and food, confirmatory diagnosis of epidemic-prone diseases and supervision of provincial laboratories.",
      "poles.cfrspChip": "Article 27",
      "poles.cfrspT": "Public Health Training & Research Centre (CFRSP)",
      "poles.cfrsp": "Planning, organising and evaluating training and research activities: specialised training, continuing education, workshops and publication of work.",

      "org.kicker": "Governance",
      "org.title": "A structured and accountable organisation",
      "org.p": "INSAPT's structure (Decree No. 2624/2023, art. 7) is built around four bodies.",
      "org.1t": "Board of Directors",
      "org.1": "Chaired by the Minister of Health, vice-chaired by the Minister of Higher Education. Sets direction, adopts the budget and closes the accounts.",
      "org.2t": "General Directorate",
      "org.2": "Led by a Director General assisted by a Deputy. Includes the General Secretariat, Directorate of Studies, Directorate of Communication and the Accounting Agency.",
      "org.3t": "Technical bodies",
      "org.3": "The three hubs: CVS, LNSP and CFRSP, each headed by a Director appointed by decree.",
      "org.4t": "Advisory bodies",
      "org.4": "A Scientific Council (10 members) and an Ethics Committee responsible for scientific direction and matters of ethics.",

      "ppl.kicker": "Leadership",
      "ppl.title": "The leadership team",
      "ppl.p": "Appointed by Decree No. 0642/PR/PM/MSPP/2025 of 15 April 2025.",
      "ppl.dg": "Director General",
      "ppl.dgName": "Prof. Ali Mahamat Moussa",
      "ppl.dga": "Deputy Director General",
      "ppl.dgaName": "Dr Djekoundade Antoinette",
      "ppl.sg": "Secretary General",
      "ppl.sgName": "Mr Mingar Tomasbe Arnaud",
      "ppl.de": "Director of Studies",
      "ppl.deName": "Dr Mahamat Fayiz Abakar",
      "ppl.dc": "Director of Communication, Statistics and Archives",
      "ppl.dcName": "Ms Mariam Issaka Daoud",
      "ppl.vacant": "Position",
      "ppl.vacantName": "To be filled",

      "docs.kicker": "Documents",
      "docs.title": "Founding texts & resources",
      "docs.p": "The official texts governing the creation and operation of INSAPT.",
      "docs.code": "Public Procurement Code — Decree No. 2130/PR/2020",
      "docs.codeS": "Keyword-searchable database (SCM portal)",
      "docs.d1": "Law No. 11/PR/2020 — Establishment of INSAPT",
      "docs.d1s": "Implementing decree · PDF",
      "docs.d2": "Decree No. 2624/PT/PM/MSPP/2023 — Organisation & Operation",
      "docs.d2s": "18 September 2023 · PDF",
      "docs.d3": "Decree No. 0642/PR/PM/MSPP/2025 — Appointments",
      "docs.d3s": "15 April 2025 · PDF",
      "docs.d4": "Strategic Plan 2026–2030",
      "docs.d4s": "Reference document · PDF",
      "docs.d5": "Order establishing the COUSP",
      "docs.d5s": "Public Health Emergency Operations Centre · PDF",

      "news.kicker": "News",
      "news.title": "Institute life",
      "news.p": "This space will host INSAPT's announcements, calls and events.",
      "news.tag": "Institution",
      "news.1t": "Standing up the governance bodies",
      "news.1": "INSAPT continues to operationalise its General Directorate and technical hubs.",
      "news.2t": "Developing the 2026–2030 Strategic Plan",
      "news.2": "A multi-year framework to steer public-health research, surveillance and training.",
      "news.3t": "Strengthening the procurement function",
      "news.3": "Adoption of a Procurement Policy & Procedures Manual.",
      "news.readmore": "Read more",

      "contact.kicker": "Contact",
      "contact.title": "Get in touch",
      "contact.addr": "Address",
      "contact.addrV": "INSAPT Headquarters — N'Djamena, Republic of Chad",
      "contact.mail": "Email",
      "contact.phone": "Phone",
      "contact.phoneV": "To be provided",

      "foot.about": "The National Public Health Institute of Chad — research, surveillance, reference laboratory and training in the service of population health.",
      "foot.explore": "Explore",
      "foot.resources": "Resources",
      "foot.contact": "Contact",
      "foot.armp": "ARMP — Public procurement codes",
      "foot.portal": "SCM portal (staff)",
      "foot.labstock": "Lab Stock — LaBiEp inventory (staff)",
      "foot.rights": "All rights reserved.",
      "foot.builtFor": "Republic of Chad · Unity — Work — Progress",

      "scm.loginTitle": "Supply Chain Portal",
      "scm.loginSub": "Restricted to the INSAPT SCM manager.",
      "scm.user": "Username",
      "scm.pass": "Password",
      "scm.signin": "Sign in",
      "scm.err": "Incorrect username or password.",
      "scm.back": "Back to public site",
      "scm.secure": "Secure sign-in · local session",
      "scm.welcome": "Procurement & stock management workspace",
      "scm.logout": "Sign out",
      "scm.tab.dash": "Dashboard",
      "scm.tab.proc": "Procedures",
      "scm.tab.manual": "Procurement manual",
      "scm.tab.code": "Public Procurement Code",
      "scm.tab.barcode": "Barcodes",
      "scm.tab.stock": "Stock register",
      "scm.tab.reports": "Reports",
      "scm.tab.docs": "Documents & links"
    },

    ar: {
      "util.hours": "الاثنين–الجمعة · 07:30–15:30",
      "util.place": "نجامينا، تشاد",
      "util.portal": "بوابة الموظفين",
      "nav.home": "الرئيسية",
      "nav.about": "المعهد",
      "nav.missions": "المهام",
      "nav.poles": "الأقطاب الفنية",
      "nav.org": "الحوكمة",
      "nav.people": "الإدارة",
      "nav.docs": "الوثائق",
      "nav.news": "الأخبار",
      "nav.contact": "اتصل بنا",
      "nav.scm": "سلسلة الإمداد",
      "nav.labstock": "مخزون المختبر",
      "nav.academy": "الأكاديمية",
      "foot.academy": "أكاديمية المعهد — التدريب",
      "scm.academy": "🎓 أكاديمية المعهد",

      "hero.eyebrow": "مؤسسة عامة ذات طابع علمي",
      "hero.title1": "حماية صحة السكان من خلال ",
      "hero.titleEm": "العلم والرصد",
      "hero.title2": "",
      "hero.lead": "يقود المعهد الوطني للصحة العامة في تشاد البحث والرصد والتكوين في خدمة الصحة العامة الوطنية.",
      "hero.cta1": "تعرّف على المعهد",
      "hero.cta2": "مهامنا",
      "hero.poles": "أقطابنا الفنية الثلاثة",
      "hero.cvs": "مركز الرصد الصحي",
      "hero.cvsD": "الرصد الوبائي والإنذار",
      "hero.lnsp": "المعمل الوطني للصحة العامة",
      "hero.lnspD": "التحاليل ومراقبة الجودة والتشخيص",
      "hero.cfrsp": "مركز التدريب والبحث",
      "hero.cfrspD": "التكوين المستمر والبحث التطبيقي",

      "stat.1": "الإنشاء بموجب القانون",
      "stat.1n": "٢٠٢٠",
      "stat.2": "أقطاب فنية",
      "stat.2n": "٠٣",
      "stat.3": "إشراف وزاري مزدوج",
      "stat.3n": "٠٢",
      "stat.4": "المقر",
      "stat.4n": "نجامينا",

      "about.kicker": "المعهد",
      "about.title": "معهد وطني في قلب الصحة العامة",
      "about.p": "أُنشئ المعهد الوطني للصحة العامة في تشاد بموجب القانون رقم ١١/PR/٢٠٢٠ ونُظّم بالمرسوم رقم ٢٦٢٤/PT/PM/MSPP/٢٠٢٣، وهو مؤسسة عامة ذات طابع علمي تتمتع بالشخصية القانونية والاستقلال الإداري والمالي. ويخضع للإشراف المزدوج لوزارة الصحة العامة ووزارة التعليم العالي والبحث العلمي.",
      "about.c1t": "وضعنا القانوني",
      "about.c1": "مؤسسة عامة ذات طابع علمي تتمتع بالاستقلال الإداري والمالي.",
      "about.c2t": "الإشراف",
      "about.c2": "الصحة العامة (إشراف إداري وفني) والتعليم العالي (إشراف أكاديمي وعلمي).",
      "about.c3t": "رسالتنا",
      "about.c3": "البحث والرصد الصحي والمعمل المرجعي والتكوين والخبرة في خدمة السكان.",

      "miss.kicker": "المهام",
      "miss.title": "مهمة خدمة عامة",
      "miss.p": "بموجب مرسوم التنظيم، يتولى المعهد أساساً ما يلي:",
      "miss.1": "القيام بأنشطة البحث العلمي في نطاق اختصاصه والمتعلقة بالحفاظ على صحة السكان.",
      "miss.2": "إجراء الدراسات والبحوث والتحاليل لإيجاد حلول لمشاكل الصحة العامة ذات الأولوية.",
      "miss.3": "تقديم دعم تعليمي وتأطير فني للعاملين الصحيين عند الحاجة.",
      "miss.4": "توفير الخبرة في بحث ورصد واعتماد اللقاحات وتجميع البيانات ذات الصلة.",
      "miss.5": "ضمان مراقبة جودة التحاليل التي تجريها المختبرات العامة والخاصة على المستوى الوطني.",
      "miss.6": "المساهمة في تنظيم إجراءات الوقاية ومكافحة الأمراض المرتبطة بالأوبئة الحيوانية المنتقلة للإنسان.",

      "poles.kicker": "الأقطاب الفنية",
      "poles.title": "ثلاثة أقطاب، سلسلة قيمة في الصحة العامة",
      "poles.p": "يتكوّن المعهد من ثلاثة أقطاب فنية متكاملة (المرسوم ٢٦٢٤/٢٠٢٣، المادة ٢٢).",
      "poles.cvsChip": "المادة ٢٣",
      "poles.cvsT": "مركز الرصد الصحي",
      "poles.cvs": "مراقبة الحالة الصحية للسكان، والرصد واليقظة الصحية، والإنذار المبكر، والتعاون بين القطاعات دعماً للقرار العام.",
      "poles.lnspChip": "المادة ٢٥",
      "poles.lnspT": "المعمل الوطني للصحة العامة",
      "poles.lnsp": "الدعم الفني للبرامج الصحية، والرقابة الصحية على المياه والأغذية، والتشخيص التأكيدي للأمراض ذات الإمكانات الوبائية، والإشراف على مختبرات الأقاليم.",
      "poles.cfrspChip": "المادة ٢٧",
      "poles.cfrspT": "مركز التدريب والبحث في الصحة العامة",
      "poles.cfrsp": "تخطيط وتنظيم وتقييم أنشطة التدريب والبحث: التكوين المتخصص والمستمر وورش العمل ونشر الأعمال.",

      "org.kicker": "الحوكمة",
      "org.title": "تنظيم منظّم وخاضع للمساءلة",
      "org.p": "يقوم هيكل المعهد (المرسوم ٢٦٢٤/٢٠٢٣، المادة ٧) على أربع هيئات.",
      "org.1t": "مجلس الإدارة",
      "org.1": "يرأسه وزير الصحة العامة، ونائبه وزير التعليم العالي. يحدد التوجهات ويعتمد الميزانية ويقفل الحسابات.",
      "org.2t": "الإدارة العامة",
      "org.2": "يقودها مدير عام يساعده نائب. وتضم الأمانة العامة وإدارة الدراسات وإدارة الاتصال ووكالة المحاسبة.",
      "org.3t": "الهيئات الفنية",
      "org.3": "الأقطاب الثلاثة: مركز الرصد والمعمل الوطني ومركز التدريب، ويرأس كلاً منها مدير معيّن بمرسوم.",
      "org.4t": "الهيئات الاستشارية",
      "org.4": "مجلس علمي (١٠ أعضاء) ولجنة أخلاقيات مكلفة بالتوجيه العلمي ومسائل السلوك المهني.",

      "ppl.kicker": "الإدارة",
      "ppl.title": "فريق الإدارة",
      "ppl.p": "معيّن بموجب المرسوم رقم ٠٦٤٢/PR/PM/MSPP/٢٠٢٥ الصادر في ١٥ أبريل ٢٠٢٥.",
      "ppl.dg": "المدير العام",
      "ppl.dgName": "الأستاذ علي محمد موسى",
      "ppl.dga": "المديرة العامة النائبة",
      "ppl.dgaName": "د. جيكوندادي أنطوانيت",
      "ppl.sg": "الأمين العام",
      "ppl.sgName": "السيد منقار توماسبي أرنولد",
      "ppl.de": "مدير الدراسات",
      "ppl.deName": "د. محمد فايز أبكر",
      "ppl.dc": "مديرة الاتصال والإحصاء والأرشفة",
      "ppl.dcName": "السيدة مريم إسحاق داود",
      "ppl.vacant": "منصب",
      "ppl.vacantName": "شاغر",

      "docs.kicker": "الوثائق",
      "docs.title": "النصوص المؤسِّسة والموارد",
      "docs.p": "النصوص الرسمية المنظِّمة لإنشاء المعهد وسير عمله.",
      "docs.code": "مدونة الصفقات العمومية — المرسوم رقم ٢١٣٠/PR/٢٠٢٠",
      "docs.codeS": "قاعدة قابلة للبحث بالكلمات المفتاحية (بوابة سلسلة الإمداد)",
      "docs.d1": "القانون رقم ١١/PR/٢٠٢٠ — إنشاء المعهد",
      "docs.d1s": "مرسوم تطبيقي · PDF",
      "docs.d2": "المرسوم رقم ٢٦٢٤/٢٠٢٣ — التنظيم وسير العمل",
      "docs.d2s": "١٨ سبتمبر ٢٠٢٣ · PDF",
      "docs.d3": "المرسوم رقم ٠٦٤٢/٢٠٢٥ — التعيينات",
      "docs.d3s": "١٥ أبريل ٢٠٢٥ · PDF",
      "docs.d4": "الخطة الاستراتيجية ٢٠٢٦–٢٠٣٠",
      "docs.d4s": "وثيقة مرجعية · PDF",
      "docs.d5": "قرار إنشاء مركز عمليات الطوارئ",
      "docs.d5s": "مركز عمليات الطوارئ الصحية · PDF",

      "news.kicker": "الأخبار",
      "news.title": "حياة المعهد",
      "news.p": "ستستضيف هذه المساحة بلاغات المعهد ودعواته وفعالياته.",
      "news.tag": "مؤسسة",
      "news.1t": "تفعيل هيئات الحوكمة",
      "news.1": "يواصل المعهد تفعيل إدارته العامة وأقطابه الفنية.",
      "news.2t": "إعداد الخطة الاستراتيجية ٢٠٢٦–٢٠٣٠",
      "news.2": "إطار متعدد السنوات لتوجيه البحث والرصد والتكوين في الصحة العامة.",
      "news.3t": "تعزيز وظيفة المشتريات",
      "news.3": "اعتماد دليل سياسات وإجراءات إبرام الصفقات.",
      "news.readmore": "اقرأ المزيد",

      "contact.kicker": "اتصل بنا",
      "contact.title": "تواصل معنا",
      "contact.addr": "العنوان",
      "contact.addrV": "مقر المعهد — نجامينا، جمهورية تشاد",
      "contact.mail": "البريد الإلكتروني",
      "contact.phone": "الهاتف",
      "contact.phoneV": "سيُعلن لاحقاً",

      "foot.about": "المعهد الوطني للصحة العامة في تشاد — البحث والرصد والمعمل المرجعي والتكوين في خدمة صحة السكان.",
      "foot.explore": "استكشف",
      "foot.resources": "موارد",
      "foot.contact": "اتصل",
      "foot.armp": "الهيئة — مدونة الصفقات العمومية",
      "foot.portal": "بوابة سلسلة الإمداد (الموظفون)",
      "foot.labstock": "مخزون المختبر — وحدة LaBiEp (الموظفون)",
      "foot.rights": "جميع الحقوق محفوظة.",
      "foot.builtFor": "جمهورية تشاد · وحدة — عمل — تقدم",

      "scm.loginTitle": "بوابة سلسلة الإمداد",
      "scm.loginSub": "مخصصة لمسؤول سلسلة الإمداد بالمعهد.",
      "scm.user": "اسم المستخدم",
      "scm.pass": "كلمة المرور",
      "scm.signin": "تسجيل الدخول",
      "scm.err": "اسم المستخدم أو كلمة المرور غير صحيحة.",
      "scm.back": "العودة إلى الموقع العام",
      "scm.secure": "دخول آمن · جلسة محلية",
      "scm.welcome": "مساحة إدارة المشتريات والمخزون",
      "scm.logout": "تسجيل الخروج",
      "scm.tab.dash": "لوحة القيادة",
      "scm.tab.proc": "الإجراءات",
      "scm.tab.manual": "دليل الصفقات",
      "scm.tab.code": "مدونة الصفقات العمومية",
      "scm.tab.barcode": "الباركود",
      "scm.tab.stock": "سجل المخزون",
      "scm.tab.reports": "التقارير",
      "scm.tab.docs": "الوثائق والروابط"
    }
  };

  const RTL = { ar: true };
  const KEY = "insapt.lang";

  function apply(lang) {
    const dict = T[lang] || T.fr;
    document.documentElement.lang = lang;
    const rtl = !!RTL[lang];
    document.body.setAttribute("dir", rtl ? "rtl" : "ltr");
    document.body.setAttribute("data-lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const k = el.getAttribute("data-i18n");
      if (dict[k] != null) el.textContent = dict[k];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
      const k = el.getAttribute("data-i18n-ph");
      if (dict[k] != null) el.setAttribute("placeholder", dict[k]);
    });
    document.querySelectorAll("[data-i18n-html]").forEach(el => {
      const k = el.getAttribute("data-i18n-html");
      if (dict[k] != null) el.innerHTML = dict[k];
    });

    document.querySelectorAll(".lang-switch button").forEach(b => {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    window.INSAPT_LANG = lang;
    document.dispatchEvent(new CustomEvent("insapt:lang", { detail: { lang } }));
  }

  window.INSAPT_T = T;
  window.setLang = apply;

  document.addEventListener("DOMContentLoaded", () => {
    let lang = "fr";
    try { lang = localStorage.getItem(KEY) || "fr"; } catch (e) {}
    apply(lang);

    document.querySelectorAll(".lang-switch button").forEach(b => {
      b.addEventListener("click", () => apply(b.dataset.lang));
    });

    // mobile nav
    const burger = document.querySelector(".burger");
    const nav = document.querySelector(".nav");
    if (burger && nav) burger.addEventListener("click", () => nav.classList.toggle("open"));

    // scroll-spy for in-page nav
    const links = [...document.querySelectorAll(".nav a[href^='#']")];
    if (links.length) {
      const map = {};
      links.forEach(l => { const id = l.getAttribute("href").slice(1); const s = document.getElementById(id); if (s) map[id] = l; });
      const io = new IntersectionObserver(es => {
        es.forEach(e => { if (e.isIntersecting) {
          links.forEach(l => l.classList.remove("active"));
          if (map[e.target.id]) map[e.target.id].classList.add("active");
        }});
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.values(map).forEach(l => { const s = document.getElementById(l.getAttribute("href").slice(1)); if (s) io.observe(s); });
    }
  });
})();
