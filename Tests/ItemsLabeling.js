(function(){
    console.log('ItemsLabeling.js');
    var fs = require('fs');
    var testData = fs.readFileSync('ItemsSamplePage.html', 'utf8');
    const { JSDOM } = require("jsdom");
    const { window } = new JSDOM(testData);
    window.ENHANCEDSHOPPER = 'debug';
    this.$ = require("jquery")(window);
    this.window = window;
    require('./../TamperMonkeyMain.js');
    var $body = $('body');
    window.ES.markItems($body);
    window.ES.addRatioLabels($('[es-item=min]'), 'USD', 'ounce', 'fluid ounce', 'top right');

    //TODO: add tests
    // var test = [];
    // test[0] = $('[es-item=min]').length === 17;
    // test[1] = $('[es-item=max]').length  === 17;
    // test[2] = $('[es-cost]').length  === 17;
    // test[3] = $('[es-unit]').length  === 17;
    // test[4] = secondRun < firstRun;
    // var isSuccessful = true;
    // for(var i in test) if(!test[i]) isSuccessful = false;
    // console.log('Test ' + (isSuccessful ? 'Success!' : 'Failed.'));
})();