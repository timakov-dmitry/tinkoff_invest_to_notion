import TINKOFF_API from './modules/tinkoff_api/index.js';
import NOTION_API from './modules/notion_api/index.js';

class DAILY_REPORT {
    constructor() {
        this.tinkoff = new TINKOFF_API();
        this.notion = new NOTION_API();
    }

    async build() {
        // загрузка курсов валют
        await this.tinkoff.getCurrencyRates();
        // загрузка активов
        let {stocks, shortStatus} = await this.tinkoff.get_portfolio();
        // создание записи в таблице
        const page_id = await this.notion.createDailyPageInTable(shortStatus)
        // расширение записи в целую страницу
        const {id: database_id} = await this.notion.createPageWithPortfolio(page_id)
        stocks = stocks.map(this.notion._prepareStockItem)
        // заполнение таблицы с активами
        for (const stock of stocks){
            await this.notion.addItemToPortfolioTable(database_id, stock);
        }
        return 'Done'
    }
}

export default DAILY_REPORT;