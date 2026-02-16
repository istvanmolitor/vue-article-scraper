import { MenuBuilder, type MenuItemConfig } from '../../vue-menu/types/menu'

export class ArticleScraperMenuBuilder extends MenuBuilder {
  build(menu: MenuItemConfig, menuName: string): MenuItemConfig {
    if (menuName === 'admin') {
      this.addMenuItem(menu, {
        id: 'article-scraper',
        title: 'Cikk szkraper',
        path: '/article-scraper',
        order: 100
      })
    }

    return menu
  }
}



