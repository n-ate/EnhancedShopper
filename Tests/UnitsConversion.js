(function(){
    console.log('UnitsConversion.js');
    const { JSDOM } = require("jsdom");
    const { window } = new JSDOM();
    window.ENHANCEDSHOPPER = 'debug';
    this.$ = require("jquery")(window);
    this.window = window;
    require('./../TamperMonkeyMain.js');

    var test = [];
    //weights//
    test[0] = window.ES.convertUnit('8 X 13.22773573125 ounce', 'kg', '').num === 3;
    test[1] = window.ES.convertUnit('8 X 13.22773573125oz', 'kg', '').num === 3;
    test[2] = window.ES.convertUnit('6.613867865625 pound', 'kilogram', '').num === 3;
    test[3] = window.ES.convertUnit('6.613867865625lb', 'kg', '').num === 3;
    test[4] = window.ES.convertUnit('3kg', 'kilogram', '').num === 3;
    test[5] = window.ES.convertUnit('6x.5kg', 'kg', '').num === 3;
    test[6] = window.ES.convertUnit('150X20grams', 'kilogram', '').num === 3;
    test[7] = window.ES.convertUnit('30x10X10g', 'kg', '').num === 3;
    //volumes//
    test[8] = window.ES.convertUnit('169.07028 fluid ounce', '', 'liter').num === 5;
    test[9] = window.ES.convertUnit('169.07028 floz', '', 'l').num === 5;
    test[10] = window.ES.convertUnit('2 x 2.641720483279517quart', '', 'liter').num === 5;
    test[11] = window.ES.convertUnit('5.283440966559034 qt', '', 'l').num === 5;
    test[12] = window.ES.convertUnit('1.3208602416397586gallons', '', 'liter').num === 5;
    test[13] = window.ES.convertUnit('1.3208602416397586 gal', '', 'l').num === 5;
    test[14] = window.ES.convertUnit('10 x 1.0566881338731587 pints', '', 'liter').num === 5;
    test[15] = window.ES.convertUnit('10.566881338731587pnt', '', 'l').num === 5;
    test[16] = window.ES.convertUnit('40X 125mililiter', '', 'liter').num === 5;
    test[17] = window.ES.convertUnit('5000ml', '', 'l').num === 5;
    test[18] = window.ES.convertUnit('5l', '', 'liter').num === 5;
    test[19] = window.ES.convertUnit('5l', '', 'l').num === 5;
    var isSuccessful = true;
    for(var i in test) if(!test[i]) isSuccessful = false; 
    console.log('Test ' + (isSuccessful ? 'Success!' : 'Failed.'));
})();