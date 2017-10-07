// ==UserScript==
// @name         Enhanced Shopper
// @namespace    
// @version      0.15
// @description  adds price per ounce to cart items (other features soon)
// @author       Nate Layton
// @grant        none
// @include        http*://*.*/*
// @require      http://code.jquery.com/jquery-2.1.4.min.js
// ==/UserScript==

(function() {
    var es = {
        units : {//TODO: handle units without numeral
            "fluid ounce"   : { type: 'volume', oz: 1,              variations : ['fl oz', 'floz'] },//NOTE: order is significant for searching
            "ounce"         : { type: 'weight', oz: 1,              variations : ['oz'] },
            "pound"         : { type: 'weight', oz: 16,             variations : ['lb'] },
            "quart"         : { type: 'volume', oz: 32.000032,      variations : ['qt'] },
            "gallon"        : { type: 'volume', oz: 128.000128,     variations : ['gal'] },
            "pint"          : { type: 'volume', oz: 16.0000169,     variations : ['pt', 'pnt'] },
            "kilogram"      : { type: 'weight', oz: 35.27396195,     variations : ['kg', 'kilo gram'] },
            "mililiter"     : { type: 'volume', oz: 0.033814056,   variations : ['ml'] },
            "gram"          : { type: 'weight', oz: 0.03527396195,  variations : ['g'] },
            "liter"        : { type: 'volume', oz: 33.814056,     variations : ['l'] }
        },
        costs : {//TODO: implement these currencies
            "USD" : { variations : "$"},
            "GBP" : { variations : "£"},
            "EUR" : { variations : "€"},
        },
        costRegEx : /\$ *([0-9]+\.?[0-9]*|[0-9]*\.?[0-9]+)/g, //NOTE: only supports USD now
        getNumberOfUnits : function(text) {
            var count = 0;
            for(var key in es.units){
                es.ensureUnitRegex(key);
                var matches = text.match(es.units[key].regEx);
                count += (matches === null) ? 0 : matches.length;
                if(count > 1) break;
            }
            return count;
        },
        getNumberOfCosts : function(value) {
            var matches = value.match(es.costRegEx);
            return (matches === null) ? 0 : matches.length;
        },
        getCost : function($item) {
            var matches = $item.text().match(es.costRegEx);
            return matches[0].replace(' ', '');
        },
        getUnit : function($item) {
            var text = $item.text();
            for(var key in es.units) {
                es.ensureUnitRegex(key);
                var matches = text.match(es.units[key].regEx);
                if(matches !== null && matches.length > 0) return matches[0].replace(' ', '');;
            }
            throw 'es.getUnit($item) : item unit was not found';
        },
        ensureUnitRegex: function(key) {                
            if(!es.units[key].hasOwnProperty('regEx')) {
                var sb = ['([0-9]+\\.?[0-9]*|[0-9]*\\.?[0-9]+) *((x|X) *([0-9]+\\.?[0-9]*|[0-9]*\\.?[0-9]+) *)*(', key];
                for(var i=0; i<es.units[key].variations.length; i++) {
                    sb.push('|');
                    sb.push(es.units[key].variations[i]);
                }
                sb.push(')');
                es.units[key].regEx = new RegExp(sb.join(''), 'g');
            }
        },
        getNumberOfItems : function($el) {
            var text = $el.text();
            var costs = es.getNumberOfCosts(text);
            var units = es.getNumberOfUnits(text);
            return costs < units ? costs : units;
        },
        markItems($scope) {
            var result = [];
            var count = es.getNumberOfItems($scope);
            if(count === 1) {//found a single item
                if(!$scope.is('[es-item]')) {//item is already marked
                    $scope.children().each(function(i, el) {//check if a child contains a complete item
                        $.merge(result, es.markItems($(el)));                    
                    });
                    if(result.length === 0) {
                        var cost = es.getCost($scope);
                        var unit = es.getUnit($scope);
                        $scope
                            .attr('es-item', 'min')//minimum dom fragment that contains all item text
                            .attr('es-cost', cost)
                            .attr('es-unit', unit);
                        result = [$scope];//children did not have a complete item use current scope
                    }
                }
            }
            else if(count > 1) {
                $scope.children().each(function(i, el) {
                    var $el = $(el);
                    var items = es.markItems($el);
                    if(items.length === 1) $el.attr('es-item', 'max');//maximum dom fragment that contains only one item's text
                    $.merge(result, items);
                });
            }
            return result;
        },
        convertCurrency : function(cost, currency) {
            return es.getStringAsNumber(cost);//TODO: implement currency conversion
        },
        convertUnit : function(unit, weight, volume) {
            var num = es.getStringAsNumber(unit);
            var nativeUnit;
            for(var key in es.units) {//find native unit
                es.ensureUnitRegex(key);
                var matches = unit.match(es.units[key].regEx);
                if(matches !== null && matches.length > 0) {
                    nativeUnit = es.units[key];
                    break;
                }
            }
            var finalUnit = nativeUnit.type === 'weight' ? weight : volume;
            for(var key in es.units) {//find final/destination unit
                if(key === finalUnit || es.units[key].variations.indexOf(finalUnit) > -1) {
                    finalUnit = es.units[key];
                    break;
                }
            }
            return {
                num: num * (nativeUnit.oz / finalUnit.oz), 
                unit: finalUnit.variations[0]
            };
        },
        addRatioLabels : function($items, currency, weight, volume, position) {//TODO: implement position
            $items.each(function(i, item) {
                $item = $(item);
                var cost = es.convertCurrency($item.attr('es-cost'), currency);
                var unit = es.convertUnit($item.attr('es-unit'), weight, volume);
                var unitCost = (Math.round((cost / unit.num) * 1000) / 1000).toFixed(3);
                var float = position.indexOf('right') > -1 ? 'right' : 'left';
                var html = "<span style='float:right;font-weight:normal;font-size:1em'>$" + unitCost.substr(0, unitCost.length -1) + "<span style='font-size:0.9em'>" + unitCost.substr(unitCost.length -1) + " </span>" + unit.unit + "</span>";
                if(position.indexOf('top') > -1) $item.prepend(html);
                else  $item.append(html);
                $item.attr('es-ratio', 'labeled');
            });
        },
        getStringAsNumber: function(value) {     
            var result = 1;   
            if(value.indexOf('x') + value.indexOf('X') > -2) {
                var result = 1;
                var arr = value.split(/x|X/g);
                for(var i=0; i<arr.length; i++) result *= es.getStringAsNumber(arr[i]);
            }
            else result = Number(value.replace(/[^0-9\.-]+/g,''));
            return result;
        },
        insertPricePerOunce: function() {
            es.markItems($('body'));
            var $notLabeled = $('[es-item=min]:not([es-ratio=labeled])');
            if($notLabeled.length > 0) console.log('ES: found ' + $notLabeled.length + 'to label');
            es.addRatioLabels($notLabeled, 'USD', 'ounce', 'fluid ounce', 'top right');
            setTimeout(es.insertPricePerOunce, 999);
        }
    };
    if(window.ENHANCEDSHOPPER === 'debug') window.ES = es;
    else es.insertPricePerOunce();
})();