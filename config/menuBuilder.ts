import { MenuBuilder, type MenuItemConfig } from '@menu/index'

export class ArticleScraperMenuBuilder extends MenuBuilder {
  build(menu: MenuItemConfig, menuName: string): MenuItemConfig {
    if (menuName === 'admin') {
      this.addMenuItem(menu, {
        id: 'article-scraper',
        title: 'Cikk szkraper',
        path: '/admin/article-scraper',
        order: 100
      })
    }

    return menu
  }
}

// Export singleton instance
export const articleScraperMenuBuilder = new ArticleScraperMenuBuilder()



