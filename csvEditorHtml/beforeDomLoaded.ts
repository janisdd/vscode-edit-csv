//--- called before dom (body) is rendered

document.documentElement.style.setProperty('--extension-options-bar-display', initialConfig?.optionsBarAppearance === "collapsed" ? `none` : `block`)

//--- side-panel
document.documentElement.style.setProperty('--extension-side-panel-display', initialConfig?.sidePanelAppearance === "collapsed" ? `none` : `flex`)
document.documentElement.style.setProperty('--extension-side-panel-expand-icon-display', initialConfig?.sidePanelAppearance === "collapsed" ? `block` : `none`)
document.documentElement.style.setProperty('--extension-side-panel-collapse-icon-display', initialConfig?.sidePanelAppearance === "collapsed" ? `none` : `block`)

//--- table style
document.documentElement.style.setProperty('--extension-table-font-family', initialConfig?.fontFamilyInTable === "sameAsCodeEditor" ? `var(--vscode-editor-font-family)` : `inherit`)

