// ==UserScript==
// @name         Instacart price/oz
// @namespace    
// @version      0.1
// @description  adds price per ounce to cart items
// @author       Nate Layton
// @match        http*://www.instacart.com/*
// @grant        none
// @require     http://code.jquery.com/jquery-2.1.4.min.js
// ==/UserScript==

(function() {
    var units = {
        "fl oz" : 1,
        "ounce" : 1,
        "oz"    : 1,
        "pound" : 16,
        "lb"    : 16,
        "quart" : 32.000032,
        "gallon": 128.000128,
        "gal"   : 128.000128,
        "pint"  : 16.0000169,
        "kg"    : 35.2739619,
        "gram"  : 0.03527396195,
        "liters": 33.8140565,
        "ml": 0.0338140565,
        "l": 33.8140565
    }
    function GetStringAsNumber(value){
        return Number(value.replace(/[^0-9\.-]+/g,''));
    }
    function GetSizeAsOunces(size){        
        var multiplier = 0;
        for(var unit in units){
            if(size.indexOf(unit) > -1) {
                multiplier = units[unit];
                size.replace(unit, '');
                break;
            }
        }
        if(multiplier == 0) console.log('Unrecognized units: ' + size);
        if(size.indexOf('x') > -1) {
            var result = 1;
            var arr = size.split('x');
            for(var i=0; i<arr.length; i++) result *= GetStringAsNumber(arr[i]);
            return result * multiplier;
        }
        return GetStringAsNumber(size) * multiplier;
    }
    function GetPricePerOunce(price, ounces){
        return Math.round((price / ounces)*1000) / 1000;
    }
    function InsertPricePerOunce() {
        var $items = $('li.item-card:not(.computed)');
        $items.each(function(key, value){
            var $el = $(value);
            var $price = $el.find('.item-price');
            var $size = $el.find('.item-size');
            if($price.length != 0 && $size.length != 0) {
                var price = $price.text();
                var size = $size.text();
                if(price != 0 && size != 0) {
                    price = GetStringAsNumber(price);
                    size = GetSizeAsOunces(size);
                    var ppo = GetPricePerOunce(price, size).toFixed(3);
                    $price.append("<span style='float:right;font-weight:normal;font-size:0.8em'>$" + ppo.substr(0, ppo.length -1) + "<span style='font-size:0.9em'>" + ppo.substr(ppo.length -1) + " </span>oz</span>");
                    $el.addClass('computed');
                }
            }
        });
        setTimeout(InsertPricePerOunce, 999);
    }
    InsertPricePerOunce();
})();
