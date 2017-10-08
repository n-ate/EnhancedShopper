(function(){
    console.log('UnitsRegex.js');
    const { JSDOM } = require("jsdom");
    const { window } = new JSDOM();
    window.ENHANCEDSHOPPER = 'debug';
    this.$ = require("jquery")(window);
    this.window = window;
    require('./../TamperMonkeyMain.js');

    window.ES.ensureUnitRegex('gram');
    var regex = window.ES.units['gram'].regex;

    var test = [];
    test[0] = 'extra2 x 2 X 2 gextra'.match(regex)[0] === '2 x 2 X 2 g';
    test[1] = 'extra2x2X2gextra'.match(regex)[0] === '2x2X2g';
    test[2] = 'extra6x2 x 2 X 2 gextra'.match(regex)[0] === '6x2 x 2 X 2 g';
    test[3] = 'extra2 gextra'.match(regex)[0] === '2 g';
    test[4] = 'extra2gextra'.match(regex)[0] === '2g';
    test[5] = 'extra22.2X2.22gramextra'.match(regex)[0] === '22.2X2.22gram';
    test[6] = 'extra232.2X2.22x.3gramextra'.match(regex)[0] === '232.2X2.22x.3gram';
    test[7] = 'extra232.2X2.22x.3 gramextra'.match(regex)[0] === '232.2X2.22x.3 gram';
    var isSuccessful = true;
    for(var i in test) if(!test[i]) isSuccessful = false; 
    console.log('Test ' + (isSuccessful ? 'Success!' : 'Failed.'));
})();