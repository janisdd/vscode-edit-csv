//--- called before dom (body) is rendered (only use this in the vs code extension)

if (typeof initialConfig !== 'undefined') { //only in vs code extension
	document.documentElement.style
		.setProperty('--extension-options-bar-display', initialConfig?.optionsBarAppearance === "collapsed" ? `none` : `block`)
}

