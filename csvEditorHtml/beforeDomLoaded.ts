//--- called before dom (body) is rendered

document.documentElement.style.setProperty('--extension-options-bar-display', initialConfig?.optionsBarAppearance === "collapsed" ? `none` : `block`)

