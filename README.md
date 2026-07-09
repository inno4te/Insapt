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
│   ├── index.html             Connexion + application (7 onglets)
│   ├── scm.css
│   ├── scm.js                 Auth, codes-barres, stocks, rapports, sync Google
│   ├── manual-body.html       Manuel des marchés rendu en HTML (24 chapitres)
│   └── manual-toc.html
├── google-apps-script/        Backend Google Sheets (stockage en direct)
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
