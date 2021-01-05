const ip = require('ip');

const address = ip.address();

const toCode = (address = '') => {
    const parts = address.split(".").map(Number).map(n => n.toString(16).toUpperCase()).join('-');
    return parts;
}
console.log(toCode(address))
console.log(Number(255).toString(16))