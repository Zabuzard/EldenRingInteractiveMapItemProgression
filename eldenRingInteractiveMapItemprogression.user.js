// ==UserScript==
// @name     Elden Ring Interactive Map Item Progression
// @namespace   Zabuza
// @description To mark items on the map as completed (using right click)
// @include     http*://eldenring.wiki.fextralife.com/file/Elden-Ring/map-*.html*
// @version     1.5
// @require http://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant       none
// @run-at      document-idle
// ==/UserScript==

function addCssRules() {
	$('body').append('<style type="text/css">\
			.' + completedClassName + ' {\
				opacity: 0.3 !important;\
			}\
		</style>');
}

function buildKey(key) {
	return storageKeys.keyIndex + storageKeys[key];
}

function loadStorage() {
	var keyOfStorage = buildKey(storageKeys.completedItems);
	var value = localStorage.getItem(keyOfStorage);
    
  if (value === null || value === '' || value == 'undefined') {
    return;
  }
  
	completedItems = new Set(JSON.parse(value));
}

function storeCompletedItems() {
  var itemsText = JSON.stringify(Array.from(completedItems));
  
  var keyOfStorage = buildKey(storageKeys.completedItems);
	localStorage.setItem(keyOfStorage, itemsText);
}

function toggleItemCompleted(item) {
  var identifier = $(item).attr("title");
  
  if (completedItems.has(identifier)) {
    $(item).removeClass(completedClassName);
    completedItems.delete(identifier);
  } else {
    $(item).addClass(completedClassName);
    completedItems.add(identifier);
  }
    
  storeCompletedItems();
}

function applyStatus() {
  completedItems.forEach(function(identifier) {
    $(".leaflet-marker-icon[title='" + $.escapeSelector(identifier) + "']").addClass(completedClassName);
  });
}

function attachHook() {
  $("img, div").find(".leaflet-marker-icon").each(function() {
    if (!$(this).hasClass(hookAttachedClassName)) {
      $(this).addClass(hookAttachedClassName);
      
      $(this).mouseup(function(event) {
    		var rightClickEvent = 3;
    		if (event.which == rightClickEvent) {
  	  		toggleItemCompleted(this);
        }
      });
    }
  });
}

function showAllSymbols() {
  $("button#bcat-Show-All").click();
  $("span:contains('All')").prev("input.leaflet-control-layers-selector").parent("div").click();
}

function hideSomeSymbols() {
  $("button#bcat-Consumables").click();
  $("button#bcat-Materials").click();
  $("button#bcat-Spiritsprings").click();
  $("button#bcat-Summoning_Pool").click();
  
  $('label > div:contains("Consumables")').click();
  $('label > div:contains("Materials")').click();
  $('label > div:contains("Spiritsprings")').click();
  $('label > div:contains("Summoning Pool")').click();
}

function routine() {
  loadStorage();
  applyStatus();
	attachHook();
}

var storageKeys = {};
storageKeys.keyIndex = 'eldenringmap_';
storageKeys.completedItems = 'completedItems';

var completedClassName = 'isCompletedItem';
var hookAttachedClassName = 'hookAttached';

var completedItems = new Set();

addCssRules();
showAllSymbols();
hideSomeSymbols();
loadStorage();

attachHook();
window.setTimeout(routine, 500);

$(".leaflet-control-layers, #map-overground, #map-underground, #map-endgame, #mapSwitch").click(function(e) {
  window.setTimeout(routine, 2000);
});
