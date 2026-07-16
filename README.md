# INSAPT — Site institutionnel + Portail SCM

Site web professionnel de l'**Institut National de Santé Publique du Tchad (INSAPT)**, inspiré de la structure de l'INSP RDC (insp.cd), aux couleurs du drapeau tchadien (bleu `#002664`, or `#FECB00`, rouge `#C60C30`).

Trilingue : **français (défaut)**, **arabe (ع, RTL)**, **anglais**. Le choix de langue est mémorisé.

## Structure du dépôt

```
insapt-site/
├── index.html                 Site public (onglets : Accueil, Institut, Missions,
│                              Pôles, Gouvernance, Direction, Documents, Actualités, Contact)
├── assets/
│   ├── style.css              Design system (drapeau tchadien, RTL)
│   ├── i18n.js                Moteur trilingue FR/AR/EN
│   └── img/                   (déposez ici les photos DG/DGA/SG…)
├── documents/                 Textes officiels (PDF) + manuel
│   ├── loi-11-2020.pdf
│   ├── decret-2624-2023.pdf
│   ├── decret-0642-2025.pdf
│   ├── plan-strategique-2026-2030.pdf
│   ├── arrete-cousp.pdf
│   ├── manuel-passation-marches.pdf   (version imprimable)
│   └── manuel-passation-marches.docx
├── scm/                       Portail Chaîne d'Approvisionnement (protégé)
│   ├── index.html             Connexion + application (8 onglets)
│   ├── scm.css
│   ├── scm.js
│   ├── manual-body.html       Manuel des marchés rendu en HTML
│   ├── manual-toc.html
│   └── code-mp-data.js        Code des Marchés Publics (69 articles)
├── elearning/                 INSAPT Academy — plateforme e-learning
│   ├── index.html             Connexion apprenant + application
│   ├── elearning.css
│   ├── elearning.js           Auth, cours, examens, certificats PDF, admin
│   ├── courses-data.js        Catalogue 7 parcours + banque QCM (62 questions)
│   └── manual-modules.js      24 chapitres du Manuel comme modules
├── google-apps-script/        Backend Google Sheets (4 onglets)
│   ├── Code.gs
│   └── README.md
└── .nojekyll                  (ne pas supprimer — requis pour GitHub Pages)
```

## Le portail SCM (Supply Chain Management)

Accès depuis le bouton **« Chaîne d'approvisionnement »** ou `scm/index.html`.

**Identifiants** (tels que fournis) :
- Identifiant : `insaptscm`
- Mot de passe : `insaptst0ck`

> Contrôle d'accès **côté client** : il empêche l'accès occasionnel mais n'est pas un rempart serveur. Pour un usage sensible, hébergez `scm/` derrière une authentification serveur ou un GitHub Pages d'organisation à accès restreint.

### Onglets du portail

| Onglet | Fonction |
|---|---|
| **Tableau de bord** | KPI (articles, valeur, catégories, bailleurs), graphique par catégorie, derniers articles |
| **Procédures** | Circuit de passation synthétique + repères de seuils/méthodes |
| **Manuel des marchés** | Manuel complet **en HTML** (sommaire + 24 chapitres, tableaux) + impression |
| **Code des Marchés Publics** | **Base consultable** du Décret N°2130/PR/2020 (texte officiel ARMP) : recherche par mot-clé / n° d'article / thème, filtre par Titre, surlignage des termes, puces de recherche rapide, lien vers le PDF officiel de l'ARMP. 69 articles couvrant les 7 Titres (dispositions générales & seuils, organes, passation, exécution, contrôle/résiliation, contentieux/sanctions, dispositions finales) |
| **Codes-barres** | Génération **en séquence** `INSAPT-AAAA-NNNNNN`, aperçu imprimable, ajout auto au registre |
| **Registre des stocks** | Saisie/mise à jour d'articles, recherche, **export CSV**, sync Google |
| **Rapports** | Requêtes prédéfinies : âge des actifs, par bailleur, par catégorie, par emplacement, valeur par pôle, à réformer — exportables |
| **Documents & liens** | Lien **ARMP** (armp-tchad.com), textes INSAPT, configuration Google |

### Codes-barres → Google Sheet

Les codes sont générés séquentiellement (persistés localement). Chaque génération ajoute l'article au **registre local**, et — si la connexion Google est configurée — le pousse vers un **Google Sheet** de l'INSAPT. Le SCM Manager complète la fiche (désignation, catégorie, bailleur, valeur, emplacement, date, état), exporte en CSV et exécute les rapports.

Le portail est **déjà pré-configuré** avec le Web App de l'INSAPT :
`https://script.google.com/macros/s/AKfycbyZr2pxJS1mBqLRQv9Oli5jbbenmD-HHj6AvL_GH49Qp1XAHimIBitIdOUUqxDFyZaKFw/exec`
avec la clé partagée `INSAPT-SCM-KEY`. Au chargement, le voyant en haut du portail teste la connexion et passe à « Google · en ligne » si le script répond.

> **Important** : la clé `SHARED_KEY` en tête de votre `Code.gs` déployé doit être exactement `INSAPT-SCM-KEY`. Si vous l'avez changée, corrigez-la dans le script **ou** mettez à jour le champ « Clé partagée » du portail (onglet Documents & liens).

Pour (re)déployer ou modifier le stockage **en direct**, suivez `google-apps-script/README.md`.

## INSAPT Academy (e-learning)

Plateforme de formation et de certification en passation des marchés, accessible depuis le site public et depuis le portail SCM.

- Accès : `elearning/index.html`. L'apprenant se connecte avec **son nom complet (tel qu'il doit apparaître sur ses certificats) et sa section**. La progression est synchronisée avec Google Sheets et se reprend depuis n'importe quel appareil.
- **Accès administrateur** (lien « Accès administrateur » de la page de connexion) : `forteh` / `f0rteh` — liste des inscrits, certificats obtenus, export CSV, et paramètres des certificats (signataire, titre, seuil de réussite).
- **7 parcours** :
  1. **Cours Généraux** — 10 modules (principes, processus, COI, pré-sélection, éthique, DAO, évaluation, exécution, contrôle interne).
  2. **Code des Marchés Publics** — 10 modules (Décret N°2130/PR/2020 par Titres).
  3. **Procédures & SOPs INSAPT** — 10 modules opérationnels.
  4. **Certification Niveau 1** — Chapitres 1-6 du Manuel · examen 30 QCM / 60 min.
  5. **Certification Niveau 2** — Chapitres 7-13 du Manuel · examen 30 QCM / 60 min.
  6. **Certification Niveau 3** — Chapitres 14-19 du Manuel · examen 30 QCM / 60 min.
  7. **Certification Niveau 4 (Expert)** — 15 modules (Manuel complet + Code par Titres) · examen 40 QCM / 80 min. **Déverrouillé après validation des Niveaux 1-3.**
- Chaque examen est **chronométré** ; un score **≥ 75 %** délivre un **certificat PDF** aux couleurs de l'INSAPT, signé du DG (nom modifiable en admin), avec ID unique. Une mention `© Innocent Forteh` en tout petit blanc figure au pied du certificat.
- Contenu trilingue (interface FR / AR / EN). Les leçons issues du Manuel restent en français (langue du document officiel).

## Déploiement GitHub Pages (sans terminal)

1. Créez un dépôt GitHub, ex. `insapt-site`.
2. **Add file → Upload files** : glissez **tout le contenu** de ce dossier (gardez l'arborescence). Incluez bien `.nojekyll`.
3. **Settings → Pages → Build and deployment → Source : Deploy from a branch**, branche `main`, dossier `/root`. Enregistrez.
4. Le site est publié sous `https://<utilisateur>.github.io/insapt-site/`.

> Les PDF officiels sont volumineux (~15 Mo au total). Si l'upload web échoue, compressez-les ou utilisez GitHub Desktop.

## Ajouter les photos de la direction

Déposez les portraits dans `assets/img/` puis, dans `index.html`, remplacez chaque bloc
`<div class="photo"><span class="ini">…</span></div>` par
`<div class="photo"><img src="assets/img/dg.jpg" alt="…"></div>`.

## Personnalisation rapide

- **Textes / traductions** : `assets/i18n.js` (dictionnaires `fr`, `ar`, `en`).
- **Couleurs** : variables en tête de `assets/style.css` et `scm/scm.css`.
- **Coordonnées** : section Contact d'`index.html`.

---
© INSAPT — République du Tchad · Unité — Travail — Progrès
