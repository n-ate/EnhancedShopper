(function(){
    console.log('CostRegex.js');
    const { JSDOM } = require("jsdom");
    const { window } = new JSDOM();
    window.ENHANCEDSHOPPER = 'debug';
    this.$ = require("jquery")(window);
    this.window = window;
    require('./../TamperMonkeyMain.js');

    

    var regex = window.ES.costRegex;

    var test = [];
    test[0] = 'for only $2.01'.match(regex)[0] === '$2.01';
    test[1] = 'extrafor only $2.01extra'.match(regex)[0] === '$2.01';
    // test[2] = 'extra2USDextra'.match(regex)[0] === '2USD'; //TODO: implement more currencies
    // test[3] = 'extra2 USDextra'.match(regex)[0] === '2 USD';
    // test[4] = 'extra2$extra'.match(regex)[0] === '2$';
    var isSuccessful = true;
    for(var i in test) if(!test[i]) isSuccessful = false; 
    console.log('Test ' + (isSuccessful ? 'Success!' : 'Failed.'));
})();