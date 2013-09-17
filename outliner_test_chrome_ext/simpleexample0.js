	$(document).ready (function () {
		$("#outliner").concord ({
			"prefs": {
			"outlineFont": "Georgia", 
			"outlineFontSize": 18, 
			"outlineLineHeight": 24,
			"renderMode": false,
			"readonly": false,
			"typeIcons": appTypeIcons
			},
		});
		opXmlToOutline (initialOpmltext);
	});
