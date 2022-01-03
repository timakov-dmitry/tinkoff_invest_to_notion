import TINKOFF_API from 'modules/tinkoff_api'

const tinkoff = new TINKOFF_API();

tinkoff.get_portfolio()
    .then(console.log)
    .catch(console.log)