const http = require('http');
const program = require('commander');
const packageConfig = require('./package.json');

program
  .version(packageConfig.version)
  .option('-s, --symbols <symbols>', 'stock symbol(s) to lookup', parseSymbols)
  .parse(process.argv);

function parseSymbols(symbols) {
  var allSymbols = symbols.split(',');
  
  var i;
  for (i = 0; i < allSymbols.length; i++) {
    allSymbols[i] = allSymbols[i].trim();
  }
  
  return allSymbols;
}

function getStock(symbol, callback) {
  http.get({
    host: 'finance.yahoo.com',
    path: `/webservice/v1/symbols/${symbol}/quote?format=json`
  }, response => {
    var body = '';
    response.on('data', d => {
      body += d;
    });
    response.on('end', () => {
      var parsed = JSON.parse(body);
      if (parsed.list.resources.length > 0) {
        callback(undefined, parsed.list.resources[0].resource.fields);
      }
      else {
        callback(undefined, { symbol: symbol.toUpperCase() });
      }
    });
  });
}

if (program.symbols) {
  var i;
  for (i = 0; i < program.symbols.length; i++) {
    getStock(program.symbols[i], (err, stock) => {
      if (!err) {
        if (stock.price) {
          console.log(`${stock.name} (${stock.symbol}) - ${`$${parseFloat(stock.price).toFixed(2)}`}`);
        }
        else {
          console.log(`${stock.symbol} not found`);
        }
      }
      else {
        console.error(err);
      }
    });
  }
}