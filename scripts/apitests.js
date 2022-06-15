const axios = require("axios");
const key = '2c103fd3455f8aa304a0c71c05bb7b44f12471bae3edaf0f943afbf086719dcb';

axios.get(`https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD` + '&api_key={' + key + '}').then(r => console.log(r.data));