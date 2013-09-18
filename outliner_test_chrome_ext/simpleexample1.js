			var appConsts = {
				"productname": "Hello Chrome Extension",
				"productnameForDisplay": "CE Outliner",
				"domain": "hello.blorkmark.com", 
				"version": "0.50"
				}
			var appPrefs = {
				"outlineFont": "Arial", "outlineFontSize": 16, "outlineLineHeight": 24,
				"authorName": "", "authorEmail": ""
				};
			var whenLastKeystroke = new Date (), whenLastAutoSave = new Date ();  
			var flReadOnly = false, flRenderMode = false;
			var cmdKeyPrefix = "Ctrl+"; 
			
			var urlConcordSource = "http://raw.github.com/scripting/concord/master/opml/concord.opml";
			var urlConcordCssSource = "http://raw.github.com/scripting/concord/master/opml/concordCss.opml";
			var urlConcordDocs = "http://raw.github.com/scripting/concord/master/opml/concordDocs.opml";
			var urlConcordUtilsSource = "http://raw.github.com/scripting/concord/master/opml/concordUtils.opml";
			var urlHelloOutliner = "http://raw.github.com/scripting/concord/master/example1/source.opml";
			var urlExample0 = "http://raw.github.com/scripting/concord/master/example0/source.opml";
			
			function initLocalStorage () {
				if (localStorage.savedOpmltext == undefined) {
					localStorage.savedOpmltext = initialOpmltext;
					editSource (urlConcordDocs); //9/14/13 by DW
					}
				if (localStorage.ctOpmlSaves == undefined) {
					localStorage.ctOpmlSaves = 0;
					}
				if (localStorage.whenLastSave == undefined) {
					localStorage.whenLastSave = new Date ().toString ();
					}
				if (localStorage.flTextMode == undefined) {
					localStorage.flTextMode = "true";
					}
				}
			function setInclude () { //used to test includes
				opSetOneAtt ("type", "include");
				opSetOneAtt ("url", "http://smallpicture.com/states.opml");
				}
			function editSource (url) {
				opXmlToOutline (initialOpmltext); //empty the outline display
				readText (url, function (opmltext, op) {
					opXmlToOutline (opmltext);
					saveOutlineNow ();
					}, undefined, true);
				}
			function nukeDom () {
				var summit, htmltext = "", indentlevel = 0;
				$(defaultUtilsOutliner).concord ().op.visitToSummit (function (headline) {
					summit = headline;
					return (true);
					});
				var visitSub = function (sub) {
					if (sub.attributes.getOne ("isComment") != "true") { 
						htmltext += filledString ("\t", indentlevel) + sub.getLineText () + "\r\n"
						if (sub.countSubs () > 0) {
							indentlevel++;
							sub.visitLevel (visitSub); 
							indentlevel--;
							}
						}
					};
				summit.visitLevel (visitSub);
				
				var t = new Object ();
				t.text = summit.getLineText ();
				htmltext = multipleReplaceAll (htmltext, t, false, "<" + "%", "%" + ">");
				
				document.open ();
				document.write (htmltext);
				document.close ();
				}
			function opExpandCallback (parent) {
				var type = parent.attributes.getOne ("type"), url = parent.attributes.getOne ("url"), xmlUrl = parent.attributes.getOne ("xmlUrl");
				//link nodes
					if ((type == "link") && (url != undefined)) {
						window.open (url);
						return;
						}
				//rss nodes
					if ((type == "rss") && (xmlUrl != undefined)) {
						window.open (xmlUrl);
						return;
						}
				//include nodes
					if ((type == "include") && (url != undefined)) {
						op.deleteSubs ();
						op.clearChanged ();
						readText (url, function (opmltext, op) {
							op.insertXml (opmltext, right); 
							op.clearChanged ();
							}, op, true);
						}
				}
			function opInsertCallback (headline) { 
				headline.attributes.setOne ("created", new Date ().toUTCString ());
				}
			function opCollapseCallback (parent) {
				if (parent.attributes.getOne ("type") == "include") {
					parent.deleteSubs ();
					parent.clearChanged ();
					}
				}
			function opHoverCallback (headline) { 
				var atts = headline.attributes.getAll (), s = "";
				//set cursor to pointer if there's a url attribute -- 3/24/13  by DW
					if ((atts.url != undefined) || (atts.xmlUrl != undefined)) {
						document.body.style.cursor = "pointer";
						}
					else {
						document.body.style.cursor = "default";
						}
				}
			function opCursorMovedCallback (headline) {
				}
			function opKeystrokeCallback (event) { 
				whenLastKeystroke = new Date (); 
				}
			function runSelection () {
				var value = eval (opGetLineText ());
				opDeleteSubs ();
				opInsert (value, "right");
				opGo ("left", 1);
				}
			function setOutlinerPrefs (id, flRenderMode, flReadonly) { 
				$(id).concord ({
					"prefs": {
						"outlineFont": appPrefs.outlineFont, 
						"outlineFontSize": appPrefs.outlineFontSize, 
						"outlineLineHeight": appPrefs.outlineLineHeight,
						"renderMode": flRenderMode,
						"readonly": flReadonly,
						"typeIcons": appTypeIcons
						},
					"callbacks": {
						"opInsert": opInsertCallback,
						"opCursorMoved": opCursorMovedCallback,
						"opExpand": opExpandCallback,
						"opHover": opHoverCallback, 
						"opKeystroke": opKeystrokeCallback
						}
					});
				}
			function saveOutlineNow () {
				localStorage.savedOpmltext = opOutlineToXml (appPrefs.authorName, appPrefs.authorEmail);
				localStorage.ctOpmlSaves++;
				opClearChanged ();
				console.log ("saveOutlineNow: " + localStorage.savedOpmltext.length + " chars.");
				}
			function backgroundProcess () {
				if (opHasChanged ()) {
					if (secondsSince (whenLastKeystroke) >= 1) { 
						saveOutlineNow ();
						}
					}
				}
			function startup () {
				initLocalStorage ();
				$("#idMenuProductName").text (appConsts.productname);
				$("#idProductVersion").text ("v" + appConsts.version);
				//init menu keystrokes
					if (navigator.platform.toLowerCase ().substr (0, 3) == "mac") {
						cmdKeyPrefix = "&#8984;";
						}
					$("#idMenubar .dropdown-menu li").each (function () {
						var li = $(this);
						var liContent = li.html ();
						liContent = liContent.replace ("Cmd-", cmdKeyPrefix);
						li.html (liContent);
						});
				setOutlinerPrefs ("#outliner", false, false);
				opSetFont (appPrefs.outlineFont, appPrefs.outlineFontSize, appPrefs.outlineLineHeight); 
				opXmlToOutline (localStorage.savedOpmltext);
				self.setInterval (function () {backgroundProcess ()}, 1000); //call every second
				}
