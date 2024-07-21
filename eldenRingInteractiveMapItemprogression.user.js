// ==UserScript==
// @name     New Elden Ring Interactive Map Item Progression
// @namespace   Zabuza | Mod by Haunter
// @description To mark items on the map as completed (using right click). Progression can be ex-/imported using two new buttons.
// @include     http*://eldenring.wiki.fextralife.com/file/Elden-Ring/map-*.html*
// @version     1.5.1
// @require http://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant       none
// @run-at      document-idle
// ==/UserScript==

function addCssRules() {
  $('body').append('<style type="text/css">\
      .' + completedClassName + ' {\
        opacity: 0.3 !important;\
      }\
      .export-import-buttons {\
        position: fixed;\
        top: 0px;\
        margin-top: 10px;\
        margin-right: 10px;\
        left: 50%;\
        z-index: 1000;\
      }\
      .export-import-buttons button {\
        margin-right: 5px;\
        margin-left: 5px;\
        padding: 10px;\
        background-color: #222222b8;\
        color: white;\
        font: inherit;\
        border-image-source: url(https://eldenring.wiki.fextralife.com/file/Elden-Ring/elden-ring-wiki-guide-infobox-border.png);\
        border-image-width: 20px 40px;\
        border-image-repeat: round;\
        border-image-slice: 30 50 fill;\
        border-radius: 5px;\
        background-clip: padding-box;\
        border-top-width: 10px;\
        border-top-style: solid;\
        border-top-color: transparent;\
        border-right-width: 10px;\
        border-right-style: solid;\
        border-right-color: transparent;\
        border-bottom-width: 10px;\
        border-bottom-style: solid;\
        border-bottom-color: transparent;\
        border-left-width: 10px;\
        border-left-style: solid;\
        border-left-color: transparent;\
        border-image-outset: 0;\
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

// Export localStorage content as a text file:
function exportStorage() {
var keyOfStorage = buildKey(storageKeys.completedItems);
var value = localStorage.getItem(keyOfStorage);

if (value === null || value === '' || value == 'undefined') {
  alert("No data to export.");
  return;
}

var blob = new Blob([value], { type: 'text/plain' });
var a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = 'eldenring_completed_items.txt';
a.click();
}

// Import content from a previously exported text file:
function importStorage(event) {
  var file = event.target.files[0];
  if (!file) {
    alert("No file selected.");
    return;
  }

  var reader = new FileReader();
  reader.onload = function(e) {
    var content = e.target.result;
    try {
      var items = JSON.parse(content);

      // Clear the completedItems set and localStorage
      completedItems.clear();
      var keyOfStorage = buildKey(storageKeys.completedItems);
      localStorage.removeItem(keyOfStorage);

      // Rebuild completedItems and localStorage with imported content
      completedItems = new Set(items);
      storeCompletedItems();
      loadStorage();
      applyStatus();
      alert("Import successful.");
    } catch (error) {
      alert("Failed to import data: " + error.message);
    }
  };
  reader.readAsText(file);
}

// Add buttons to the UI to trigger the export and import functions:
function addExportImportButtons() {
  var container = $('<div class="export-import-buttons"></div>');

  var exportButton = $('<button>Export Completed Items</button>');
  exportButton.click(exportStorage);
  container.append(exportButton);

  var importButton = $('<button>Import Completed Items</button>');
  var fileInput = $('<input type="file" style="display:none;">');
  fileInput.change(importStorage);
  importButton.click(function() {
    fileInput.click();
  });
  container.append(importButton);
  container.append(fileInput);

  $('body').append(container);
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
addExportImportButtons();

attachHook();
window.setTimeout(routine, 500);

$(".leaflet-control-layers, #map-overground, #map-underground, #map-endgame, #mapSwitch").click(function(e) {
window.setTimeout(routine, 2000);
});