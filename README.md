# Cete Studio 2026

Code du site [cete.studio](https://www.cete.studio), en complément du Designer Webflow
(site « Cete Studio 2026 »).

| Fichier | Où il est chargé | Contenu |
|---|---|---|
| `site.css` | Webflow > Site settings > Custom code > **Head** | Ce que le Designer ne sait pas faire : états posés par le JS, modals contact et showreel, curseur |
| `site.js` | Webflow > Site settings > Custom code > **Footer**, après Barba | Curseur, loader et roulette de l'accueil, page projet, modals, transitions Barba.js |

Les fichiers sont servis par jsDelivr, figés sur un commit :

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Cetezer44/Cete_Studio_2026@<commit>/site.css">
<script src="https://cdn.jsdelivr.net/npm/@barba/core@2.10.3/dist/barba.umd.js"></script>
<script src="https://cdn.jsdelivr.net/gh/Cetezer44/Cete_Studio_2026@<commit>/site.js"></script>
```

## Mettre à jour

1. Modifier `site.js` ou `site.css`, puis commit et push.
2. Dans Webflow, remplacer `<commit>` par le nouveau hash (12 caractères suffisent) dans le head et le footer.
3. Publier.

Le repo doit rester léger et public : jsDelivr refuse les repos GitHub de plus de 50 Mo.
