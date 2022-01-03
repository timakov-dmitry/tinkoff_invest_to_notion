import request from "request-promise"


class TINKOFF_API {
    async get_portfolio () {
        const options = {
            uri: 'https://api-invest.tinkoff.ru/openapi/portfolio',
            qs: {
                brokerAccountId: '2119858393'
            },
            headers: {
                'Authorization': `Bearer ${process.env.TINKOFF_TOKEN}`
            },
            json: true
        };
        const response = await request(options)
        return response
    }
}

export default TINKOFF_API;


