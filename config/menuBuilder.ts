import { MenuBuilder, type MenuItemConfig } from '@menu/index'
import { Download } from 'lucide-vue-next'

export class ArticleScraperMenuBuilder extends MenuBuilder {
  build(menu: MenuItemConfig, menuName: string): MenuItemConfig {
    if (menuName === 'admin') {
      this.addMenuItem(menu, {
        id: 'article-scraper',
        title: 'Cikk letöltése',
        path: '/admin/article-scraper',
        icon: Download,
        order: 100,
        permission: 'article-scraper'
      })
    }

    return menu
  }
}

// Export singleton instance
export const articleScraperMenuBuilder = new ArticleScraperMenuBuilder()



