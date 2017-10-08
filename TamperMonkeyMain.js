// ==UserScript==
// @name         Enhanced Shopper
// @namespace
// @version      0.15
// @description  adds price per ounce to cart items (other features soon)
// @author       Nate Layton
// @grant        none
// @include      http*://*.*/*
// @require      http://code.jquery.com/jquery-2.1.4.min.js
// @source       https://github.com/n-ate/EnhancedShopper
// @updateURL    https://raw.githubusercontent.com/n-ate/EnhancedShopper/master/TamperMonkeyMain.js
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
            "kilogram"      : { type: 'weight', oz: 35.27396195,    variations : ['kg', 'kilo gram'] },
            "mililiter"     : { type: 'volume', oz: 0.033814056,    variations : ['ml'] },
            "gram"          : { type: 'weight', oz: 0.03527396195,  variations : ['g'] },
            "liter"         : { type: 'volume', oz: 33.814056,      variations : ['l'] }
        },
        costs : {//TODO: implement these currencies
            "USD" : { variations : "$"},
            "GBP" : { variations : "£"},
            "EUR" : { variations : "€"},
        },
        costRegex : /\$ *([0-9]+\.?[0-9]*|[0-9]*\.?[0-9]+)/gi, //NOTE: only supports USD now
        packRegex : /(((lot|pack|box|count|ct) +of *[0-9]+)|([0-9]+ *(pack|pk|count|ct|total|tot)))/gi,
        evaluateForCosts : function(value) {
            var matches = value.match(es.costRegex);
            return {
                count: (matches === null) ? 0 : matches.length,
                text: value.replace(es.costRegex, '')
            };
        },
        getNumberOfUnits : function(text) {//TODO: make getNumberOfUnits tests
            var count = 0;
            for(var key in es.units){
                es.ensureUnitRegex(key);
                var matches = text.match(es.units[key].regex);
                count += (matches === null) ? 0 : matches.length;
                if(count > 1) break;
            }
            return count;
        },
        getNumberOfPacks : function(value) {
            var matches = value.match(es.packRegex);
            return (matches === null) ? 0 : matches.length;
        },
        getCost : function(text) {
            var matches = text.match(es.costRegex);
            return matches[0];
        },
        getUnit : function(text) {
            for(var key in es.units) {
                es.ensureUnitRegex(key);
                var matches = text.match(es.units[key].regex);
                if(matches !== null && matches.length > 0) return matches[0];
            }
            return null;
        },
        getPack : function(text) {
            var matches = text.match(es.packRegex);
            return (matches !== null && matches.length > 0) ? matches[0] : null;
        },
        ensureUnitRegex: function(key) {
            if(!es.units[key].hasOwnProperty('regex')) {
                var sb = ['([0-9]+\\.?[0-9]*|[0-9]*\\.?[0-9]+) *((x|X) *([0-9]+\\.?[0-9]*|[0-9]*\\.?[0-9]+) *)*(', key];
                for(var i=0; i<es.units[key].variations.length; i++) {
                    sb.push('|');
                    sb.push(es.units[key].variations[i]);
                }
                sb.push(')');
                es.units[key].regex = new RegExp(sb.join(''), 'gi');
            }
        },
        getNumberOfItems : function(text) {
            var costs = es.evaluateForCosts(text);
            var units = es.getNumberOfUnits(costs.text);//exclude costs from units query
            var packs = es.getNumberOfPacks(costs.text);//exclude costs from packs query
            var measure = units > packs ? units : packs;
            return costs.count < measure ? costs.count : measure;//TODO: review what makes an item
        },
        markItems($scope) {
            var result = [];
            var text = $scope.text();
            var count = es.getNumberOfItems(text);
            if(count === 1) {//found a single item
                es.getNumberOfItems(text);
                if(!$scope.is('[es-item]')) {//item is already marked
                    $scope.children().each(function(i, el) {//check if a child contains a complete item
                        $.merge(result, es.markItems($(el)));
                    });
                    if(result.length === 0) {
                        var cost = es.getCost(text);
                        var costlessText = text.replace(cost, '');
                        var unit = es.getUnit(costlessText);
                        var pack = es.getPack(costlessText);
                        $scope
                            .attr('es-item', 'min')//minimum dom fragment that contains all item text
                            .attr('es-cost', cost)
                            .attr('es-unit', unit)
                            .attr('es-pack', pack);
                        result = [$scope];//children did not have a complete item use current scope
                    }
                }
            }
            else if(count > 1) {
                $scope.children().each(function(i, el) {
                    var $el = $(el);
                    var items = es.markItems($el);
                    if(items.length === 1) {//maximum dom fragment that contains only one item's text
                        if($el.is('[es-item~=min]')) $el.attr('es-item', 'min max');//both min and max //NOTE: separate min and max to different attributes to reduce overhead
                        else $el.attr('es-item', 'max');
                    }
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
                var matches = unit.match(es.units[key].regex);
                if(matches !== null && matches.length > 0) {
                    nativeUnit = es.units[key];
                    break;
                }
            }
            var finalUnit = nativeUnit.type === 'weight' ? weight : volume;
            for(key in es.units) {//find final/destination unit
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
        addRatioLabels : function($items, currency, weight, volume, position) {
            $items.each(function(i, item) {
                $item = $(item);
                var unitAmount, unitType;
                var unit = $item.attr('es-unit');
                var pack = $item.attr('es-pack');
                var cost = es.convertCurrency($item.attr('es-cost'), currency);
                if(unit) {
                    var r = es.convertUnit(unit, weight, volume);
                    unitType = r.unit;
                    unitAmount = (pack) ? r.num * es.getStringAsNumber(pack) : r.num;
                }
                else {
                    unitType = 'ea';
                    unitAmount = es.getStringAsNumber(pack);
                }
                var unitCost = (Math.round((cost / unitAmount) * 1000) / 1000).toFixed(3);
                var posStyle = 'position:absolute;z-index:99999;' + (position.indexOf('right') > -1 ? 'right:0;' : 'left:0;') + (position.indexOf('bottom') > -1 ? 'bottom:0;' : 'top:0;');
                var html = "<div style='font-weight:normal;font-size:16px;background:rgba(255,255,255,0.5);border-radius:7px;padding:0 2.5px;letter-spacing:0;" + posStyle + "'>$" + unitCost.substr(0, unitCost.length -1) + "<span style='font-size:0.7em'>" + unitCost.substr(unitCost.length -1) + " </span>" + unitType + "</div>";
                $item.css('position', 'relative');
                $item.prepend(html);
                $item.attr('es-ratio', 'labeled');
            });
        },
        getStringAsNumber: function(value) {
            var result = 1;
            if(value.indexOf('x') + value.indexOf('X') > -2) {
                var arr = value.split(/x|X/gi);
                for(var i=0; i<arr.length; i++) result *= es.getStringAsNumber(arr[i]);
            }
            else result = Number(value.replace(/[^0-9\.-]+/gi,''));
            return result;
        },
        insertPricePerOunce: function() {
            es.markItems($('body'));
            var $notLabeled = $('[es-item~=min]:not([es-ratio=labeled])');
            if($notLabeled.length > 0) console.log('ES: found ' + $notLabeled.length + ' to label');
            es.addRatioLabels($notLabeled, 'USD', 'ounce', 'fluid ounce', 'top right');
            setTimeout(es.insertPricePerOunce, 999);
        }
    };
    if(window.ENHANCEDSHOPPER === 'debug') window.ES = es;
    else es.insertPricePerOunce();
})();