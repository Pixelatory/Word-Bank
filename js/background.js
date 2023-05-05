addToWordBank = function(word){
    var query = word.selectionText;
    //chrome.tabs.create({url: "http://www.urbandictionary.com/define.php?term=" + query});
    console.log(word);
 };

/*
    contextMenu is to add functionality when right clicking on web page

    contexts: 'selection' makes this only pop-up when something is selected
*/

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        title: "Add to Word Bank",
        contexts:["selection"],
        id:'right_click_add'
    });
});

chrome.contextMenus.onClicked.addListener(addToWordBank);
