import {Client, APIErrorCode} from "@notionhq/client"
import dict from "../../dict.js";


class NOTION_API {
    constructor() {
        this.notion = new Client({
            auth: process.env.NOTION_TOKEN,
        })
        console.log('NOTION_API init finish')
    }

    _prepareStockItem(item) {
        return {
            Name: {
                title: [
                    {
                        text: {
                            content: item.name,
                        },
                    },
                ],
            },
            Count: {
                number: item.balance
            },
            Profit: {
                number: item.expectedYield.value
            },
            Currency: {
                type: 'select',
                select: {
                    id: dict.currencyTypes[item.averagePositionPrice.currency],
                }

            },
            Type: {
                type: 'select',
                select: {
                    id: dict.activeTypes[item.instrumentType]
                }
            },
            AvgPrice: {
                number: item.averagePositionPrice.value
            }
        }
    }

    async createDailyPageInTable(shortStatus) {
        const {id} = await this.notion.request({
            path: "pages",
            method: "POST",
            body: {
                parent: {
                    database_id: process.env.NOTION_DATABASE_ID,
                },
                properties: {
                    Name: {
                        title: [
                            {
                                text: {
                                    content: 'Отчет',
                                },
                            },
                        ],
                    },
                    Profit: {
                        number: shortStatus.profit
                    },
                    Total: {
                        number: shortStatus.total
                    },
                    USD: {
                      number: dict.currencyRates.USD
                    },
                    Date: {
                        type: "date",
                        date: {
                            start: new Date(),
                        }
                    }
                }

            },
        });
        return id
    }

    async createPageWithPortfolio(page_id) {
        const response =  await this.notion.databases.create({
            parent: {
                type: "page_id",
                page_id
            },
            icon: {
                type: "emoji",
                emoji: "🎉"
            },
            title: [
                {
                    type: "text",
                    text: {
                        content: "Активы",
                        link: null
                    }
                }
            ],
            properties: {
                Name: {
                    title: {}
                },
                Profit: {
                    number: {}
                },
                AvgPrice: {
                    number: {}
                },
                Type: {
                    select: {
                        options: Object.keys(dict.activeTypes).map(type => ({
                            name: type,
                            color: "gray"
                        }))
                    }
                },
                Currency: {
                    select: {
                        options: Object.keys(dict.currencyTypes).map(type => ({
                            name: type,
                            color: "gray"
                        }))
                    }
                },
                Count: {
                    number: {}
                }
            }
        })
        dict.setValues('currencyTypes', response.properties.Currency.select.options)
        dict.setValues('activeTypes', response.properties.Type.select.options)
        return response;
    }

    async addItemToPortfolioTable(database_id, stock) {
        const response = await this.notion.request({
            path: "pages",
            method: "POST",
            body: {
                parent: {
                    database_id,
                },
                properties: stock
            },
        });
        return response
    }

}

export default NOTION_API