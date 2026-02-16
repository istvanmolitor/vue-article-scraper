# Vue Article Scraper

Vue komponens a cikkek szkrapeléséhez.

## Funkciók

- URL beviteli mező
- Cikk letöltése a backend API-n keresztül
- Letöltött cikk címének megjelenítése
- Hibaüzenetek kezelése
- Loading állapot

## Használat

```vue
<script setup>
import { ArticleScraper } from '@/packages/vue-article-scraper'
</script>

<template>
  <ArticleScraper />
</template>
```

## Struktúra

```
vue-article-scraper/
├── components/
│   └── ArticleScraper.vue    # Fő komponens
├── config/
│   └── menuBuilder.ts        # Menu integráció
├── pages/
│   └── ArticleScraperPage.vue # Dashboard layout-os oldal
├── router/
│   └── index.ts              # Route definíciók
└── index.ts                  # Export
```

## Route

Az `/article-scraper` útvonalon érhető el a felület.

## Menü

A menü automatikusan regisztrálódik az admin menübe "Cikk szkraper" néven.

## API integráció

A komponens az `/api/article-scraper/scrape` végpontot hívja POST kéréssel.

