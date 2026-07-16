# Connexion Google — Registre des stocks en direct (INSAPT SCM)

Ce dossier contient le script qui relie le portail SCM à un **Google Sheet** (et, via Google Drive, à un classeur partagé) pour un stockage vivant des données de stock.

Le portail fonctionne **sans** cette connexion (stockage local dans le navigateur). La connexion Google ajoute la synchronisation multi-appareils et le partage.

## Étapes (aucune ligne de commande)

1. Ouvrez <https://script.google.com> → **Nouveau projet**.
2. Supprimez le contenu par défaut, collez tout `Code.gs` de ce dossier.
3. En haut du fichier, réglez :
   - `SHARED_KEY` — une clé secrète (ex. `INSAPT-SCM-2026`). Vous saisirez la **même** dans le portail.
   - `SPREADSHEET_ID` — laissez vide pour que le script crée automatiquement un classeur nommé « INSAPT — Registre des Stocks (SCM) », ou collez l'ID d'un classeur existant du Drive INSAPT.
4. Menu **Exécuter → setup** une première fois. Autorisez les accès demandés (Sheets + Drive). Cela crée le classeur.
5. **Déployer → Nouveau déploiement → Type : Application Web**
   - *Exécuter en tant que* : **Moi**
   - *Qui a accès* : **Tout le monde**
   - Déployez et **copiez l'URL `…/exec`**.
6. Dans le portail SCM → onglet **Documents & liens → Connexion Google** :
   - collez l'URL `…/exec`
   - saisissez la **même** clé partagée
   - **Enregistrer & tester** → le voyant passe à « Google · en ligne ».

## Ce qui se synchronise

**Registre des stocks (onglet « Stocks » du Sheet)**
- **Génération de codes-barres** → chaque nouvel article est poussé vers le Sheet.
- **Enregistrement / mise à jour d'un article** → mise à jour de la ligne correspondante (par `code`).
- **Sync Google Sheet** (bouton du registre) → pousse tout le registre local.
- **Importer depuis Google Sheet** → tire les lignes du Sheet vers le portail et réaligne la séquence des codes-barres.

**Code des Marchés Publics (onglet « CodeMP » du Sheet)**
- **Publier vers Google** (onglet Code des Marchés Publics) → écrit les 69 articles fournis dans un onglet `CodeMP` **vide** (ne fait rien s'il contient déjà des données, pour ne pas écraser vos modifications).
- **↻ Google** → recharge les articles depuis le Sheet ; le portail affiche alors « Source : Google Sheet ». Si le Sheet est vide ou hors ligne, il retombe sur le fichier local (`code-mp-data.js`).
- Vous pouvez **éditer les articles directement dans Google Sheets** (colonnes `art, titre, chapitre, heading, body, tags, updated` ; les `tags` sont séparés par des barres verticales `|`). Les modifications apparaissent dans le portail après « ↻ Google ».

**INSAPT Academy (onglets « Learners » et « ELSettings »)**
- À la connexion (Nom + Section), l'apprenant est enregistré sur `Learners` (id unique dérivé du nom). Sa progression (modules terminés, certificats, cours en cours) est sérialisée en JSON dans la colonne `progress` et mise à jour à chaque avancée.
- Il peut alors reprendre sa formation depuis n'importe quel ordinateur ou téléphone : à la reconnexion, la progression est rechargée du Sheet.
- **Console admin** (`forteh` / `f0rteh`) : liste des apprenants, certificats obtenus, export CSV, et paramètres des certificats (nom & titre du signataire, seuil de réussite) stockés dans l'onglet `ELSettings`.

## Colonnes des onglets

- **Stocks** : `code, name, cat, donor, qty, value, loc, date, state, note, created, updated`
- **CodeMP** : `art, titre, chapitre, heading, body, tags, updated` (tags séparés par `|`)
- **Learners** : `id, name, section, progress, created, updated` (progress = JSON)
- **ELSettings** : `key, value` (clés : `signer`, `signerTitle`, `pass`)

## Sécurité

- Le portail utilise un contrôle d'accès côté client (identifiant/mot de passe fournis). Pour un usage réseau, placez le site derrière une authentification serveur ou GitHub Pages privé/organisation.
- La `SHARED_KEY` empêche les appels anonymes d'écrire dans votre Sheet ; gardez-la confidentielle.
