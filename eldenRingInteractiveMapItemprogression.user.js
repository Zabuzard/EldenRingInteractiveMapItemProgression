// ==UserScript==
// @name     Elden Ring Interactive Map Item Progression
// @namespace   Zabuza
// @description To mark items on the map as completed (using right click)
// @include     http*://eldenring.wiki.fextralife.com/file/Elden-Ring/map-*.html*
// @version     1
// @require http://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant       none
// @run-at      document-idle
// ==/UserScript==

function addCssRules() {
	$('body').append('<style type="text/css">\
			.isCompletedItem {\
				opacity:  0.3;\
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
    $(item).removeClass('isCompletedItem');
    completedItems.delete(identifier);
  } else {
    $(item).addClass('isCompletedItem');
    completedItems.add(identifier);
  }
    
  storeCompletedItems();
}

function applyStatus() {
  completedItems.forEach(function(identifier) {
    $(".leaflet-marker-icon[title='" + identifier + "']").addClass('isCompletedItem');
  });
}

function attachHook() {
  $(".leaflet-marker-icon").unbind("mousedown").mousedown(function(event) {
    var rightClickEvent = 3;
    if (event.which == rightClickEvent) {
  	  toggleItemCompleted(this);
    }
	});
}

function showAllSymbols() {
  $("span:contains('All')").prev("input.leaflet-control-layers-selector").parent("div").click();
}

function routine() {
  applyStatus();
	attachHook();
  window.setTimeout(routine, 2000);
}

var storageKeys = {};
storageKeys.keyIndex = 'eldenringmap_';
storageKeys.completedItems = 'completedItems';

var completedItems = new Set();

addCssRules();
showAllSymbols();
loadStorage();

attachHook();
window.setTimeout(routine, 500);
