(function(){
    console.log('PackRegex.js');
    const { JSDOM } = require("jsdom");
    const { window } = new JSDOM();
    window.ENHANCEDSHOPPER = 'debug';
    this.$ = require("jquery")(window);
    this.window = window;
    require('./../TamperMonkeyMain.js');

    var regex = window.ES.packRegex;

    var test = [];
    test[0] = 'pack of 2cans'.match(regex)[0] === 'pack of 2';
    test[1] = 'box of 13 mittens'.match(regex)[0] === 'box of 13';
    test[2] = 'lot of 204'.match(regex)[0] === 'lot of 204';
    test[3] = 'count of 4'.match(regex)[0] === 'count of 4';
    test[4] = '4total'.match(regex)[0] === '4total';
    test[5] = '8 count'.match(regex)[0] === '8 count';
    test[6] = '7ct'.match(regex)[0] === '7ct';
    test[7] = '9 pack'.match(regex)[0] === '9 pack';
    test[8] = 'extrabox of 13 mittensextra'.match(regex)[0] === 'box of 13';
    test[9] = 'extracount of 4extra'.match(regex)[0] === 'count of 4';
    test[10] = 'extra7ctextra'.match(regex)[0] === '7ct';
    var isSuccessful = true;
    for(var i in test) if(!test[i]) isSuccessful = false; 
    console.log('Test ' + (isSuccessful ? 'Success!' : 'Failed.'));
})();