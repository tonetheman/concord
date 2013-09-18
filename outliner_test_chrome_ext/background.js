
/**
* Opens history.html when the browser action is clicked.
* Used window.open because I didn't want the tabs permission.
*/
chrome.browserAction.onClicked.addListener(function() {
  window.open('simpleexample1.html', 'testwindow', 'width=1024,height=768');
});
