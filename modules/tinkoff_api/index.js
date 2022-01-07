import request from "request-promise"
import tinkoffAPI from '@tinkoff/invest-openapi-js-sdk';
import dict from "../../dict.js";

class TINKOFF_API {
    constructor() {
        const apiURL = 'https://api-invest.tinkoff.ru/openapi';
        const socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws';
        const secretToken = process.env.TINKOFF_TOKEN;
        const brokerAccountId = process.env.brokerAccountId;
        this.api = new tinkoffAPI({apiURL, secretToken, socketURL, brokerAccountId});
    }

    async getCurrencyRates() {
        const USD = await this.api.orderbookGet({figi: 'BBG0013HGFT4', depth: 1});
        const EUR = await this.api.orderbookGet({figi: 'BBG0013HGFT4', depth: 1});
        dict.setCurrencyRates({USD: USD.lastPrice, EUR: EUR.lastPrice})
    }

    addProfitInRUB(stock) {
        if (stock.averagePositionPrice.currency !== 'RUB') {
            stock.averagePositionPrice.value = stock.averagePositionPrice.value * dict.currencyRates[stock.averagePositionPrice.currency]
            stock.expectedYield.value = stock.expectedYield.value * dict.currencyRates[stock.averagePositionPrice.currency]
        }
        return stock
    }

    async get_portfolio() {
        const history = await this.api.candlesGet({
            from: '2020-01-01T00:00:00.131642+03:00',
            to: '2021-01-01T00:00:00.131642+03:00',
            figi: 'BBG006L8G4H1',
            interval: 'day',
        });
        const operations = await this.api.operations({
            from: '2020-01-01T19:49:33.131642+03:00',
            to: '2021-01-01T19:49:33.131642+03:00'
        })

        const cash = await this.api.portfolioCurrencies();
        const cashInRub = cash.currencies.find(item => item.currency == 'RUB').balance

        let stocks = await this.api.portfolio();
        stocks = stocks.positions.map(this.addProfitInRUB)
        stocks.push({
            instrumentType: "Currency",
            balance: 1,
            lots: 0,
            expectedYield: {
                currency: "RUB",
                value: 0
            },
            averagePositionPrice: {
                currency: "RUB",
                value: cashInRub
            },
            name: "Рубль РФ"
        })
        const shortStatus = {
            total: stocks.reduce((sum, stock) => sum + stock.averagePositionPrice.value*stock.balance, 0),
            profit: stocks.reduce((sum, stock) => sum + stock.expectedYield.value, 0)
        }
        return {
            stocks: stocks,
            shortStatus
        }
    }

}

export default TINKOFF_API;


