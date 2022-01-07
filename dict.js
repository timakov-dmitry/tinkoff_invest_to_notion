class DICT {
    activeTypes= {
        Stock: undefined,
        Etf: undefined,
        Currency: undefined
    }

    currencyTypes = {
        USD: undefined,
        RUB: undefined,
        EUR: undefined
    }

    currencyRates = {
        USD: undefined,
        EUR: undefined
    }

    setCurrencyRates(rates) {
        for(const currency in rates) {
            this.currencyRates[currency] = rates[currency]
        }
    }

    setValues(dictName, items) {
        for (const item of items){
            this[dictName][item.name] = item.id
        }
    }
}

export default new DICT()