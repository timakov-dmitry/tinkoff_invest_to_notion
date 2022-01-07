import tinkoffAPI from '@tinkoff/invest-openapi-js-sdk';
import dotenv from 'dotenv';
import * as fs from "fs";
import {promisify} from "util";
const writeFileAsync = promisify(fs.writeFile)


dotenv.config();
const apiURL = 'https://api-invest.tinkoff.ru/openapi';
const socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws';
const secretToken = process.env.TINKOFF_TOKEN;
const brokerAccountId = process.env.brokerAccountId;
const api = new tinkoffAPI({apiURL, secretToken, socketURL, brokerAccountId});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function dump(data, index) {
    data = JSON.stringify(data, null, 2);
    await writeFileAsync(`dumps/stock_${index}.json`, data);
    console.log(`Data written to file stock_${index}.json`);
}
const DUMP_LIMIT = 100;
// const YEARS = [2016, 2017, 2018, 2019, 2020, 2021];
const YEARS = [2015, 2014, 2013, 2012, 2011, 2010];

(async function () {

    let historyData = []
    let stockDownloadIndex = 0
    let stocks = await api.stocks();
    stocks = stocks.instruments.map(stock => ({
        figi: stock.figi,
        name: stock.name
    }))
    for (const stock of stocks) {
        console.log(`${stockDownloadIndex+1}/${stocks.length}. Downloading "${stock.name}" (${stock.figi})`)
        for (const year of YEARS) {
            const stockHistory = await loadHistory(stock, year)
            historyData.push(...stockHistory)
            // Пауза для избежания блокировки IP (Too Many Requests!)
            await sleep(100)
        }
        stockDownloadIndex++
        if (stockDownloadIndex % DUMP_LIMIT == 0 ) {
            console.log(`${stockDownloadIndex}/${stocks.length}. Dump to file`)
            await dump(historyData, Math.floor(stockDownloadIndex/DUMP_LIMIT))
            historyData = []
        }
    }
    await dump(historyData, 0)

    async function loadHistory({figi, name},  year) {
        try {
            const history = await api.candlesGet({
                from: `${year-1}-01-01T00:00:00.131642+03:00`,
                to: `${year}-01-01T00:00:00.131642+03:00`,
                figi,
                interval: 'day',
            });
            if (!history.candles.length) return []
            return history.candles.map(day => ({
                o: day.o,
                c: day.c,
                h: day.h,
                l: day.l,
                v: day.v,
                date: day.time.substr(0, 10),
                figi,
                name
            }))
        } catch (e) {
            console.log(e)
            return []
        }
    }
})()