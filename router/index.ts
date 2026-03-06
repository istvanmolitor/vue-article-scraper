import type { RouteRecordRaw } from 'vue-router'
import ArticleScraperPage from '../pages/ArticleScraperPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/admin/article-scraper',
    name: 'ArticleScraper',
    component: ArticleScraperPage,
    meta: {
      title: 'Cikk szkraper'
    }
  }
]

export default routes


