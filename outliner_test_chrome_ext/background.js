
/**
* Opens history.html when the browser action is clicked.
* Used window.open because I didn't want the tabs permission.
*/
chrome.browserAction.onClicked.addListener(function() {
  window.open('simpleexample0.html', 'testwindow', 'width=700,height=600');
});
