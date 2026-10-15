# Cete Studio 2026

Code du site [cete.studio](https://www.cete.studio), en complément du Designer Webflow
(site « Cete Studio 2026 »).

| Fichier | Où il est chargé | Contenu |
|---|---|---|
| `site.css` | Webflow > Site settings > Custom code > **Head** | Ce que le Designer ne sait pas faire : états posés par le JS, modals contact et showreel, curseur |
| `site.js` | Webflow > Site settings > Custom code > **Footer**, après Barba | Curseur, loader et roulette de l'accueil, page projet, modals, transitions Barba.js |

Les fichiers sont servis par **jsDelivr**, figés sur un commit complet (40 caractères) :

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Cetezer44/Cete_Studio_2026@<commit>/site.css">
<script src="https://cdn.jsdelivr.net/npm/@barba/core@2.10.3/dist/barba.umd.js"></script>
<script src="https://cdn.jsdelivr.net/gh/Cetezer44/Cete_Studio_2026@<commit>/site.js"></script>
```

Attention : juste après un nouveau commit, jsDelivr peut répondre « 503 No healthy backends » pendant
quelques minutes. Ne jamais changer l'URL dans Webflow avant d'avoir vérifié que les deux fichiers s'affichent.
En secours, githack sert les mêmes fichiers instantanément :
`https://rawcdn.githack.com/Cetezer44/Cete_Studio_2026/<commit>/site.js` (idem pour `site.css`).

## Mettre à jour

1. Modifier `site.js` ou `site.css`, puis commit et push.
2. Ouvrir les URL jsDelivr du nouveau commit et vérifier que les fichiers s'affichent (sinon attendre, ou passer par githack).
3. Dans Webflow, remplacer `<commit>` par le hash complet dans le head et le footer.
4. Publier.

## Roulette de l'accueil

Deux modes : la roue qui tourne au scroll, ou le mode **masque** (les vignettes restent en place, le scroll dévoile
l'image suivante dans chacune, avec passage automatique toutes les 4 s). Le mode masque s'active avec l'attribut
`data-mode="mask"` sur `.wheel` dans le Designer ; `?wheel=rotate` ou `?wheel=mask` dans l'URL permet de comparer.

Le repo doit rester léger et public : jsDelivr refuse les repos GitHub de plus de 50 Mo.
