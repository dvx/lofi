/**
 * Component dependencies.
 * @private
 */

import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

/**
 * The NewWindow class object.
 * @public
 */

class NewWindow extends React.PureComponent<any, any> {
  /**
   * NewWindow default props.
   */
  static defaultProps = {
    url: '',
    name: '',
    title: '',
    fullscreen: false,
    size: { w: 500, h: 500 },
    features: { width: '600px', height: '640px' },
    onBlock: { },
    onOpen: { },
    onUnload: { },
    center: 'parent',
    copyStyles: true
  }
  container: HTMLDivElement
  window: any
  windowCheckerInterval: any
  released: boolean

  /**
   * The NewWindow function constructor.
   * @param {Object} props
   */
  constructor(props: any) {
    super(props)
    this.container = document.createElement('div')
    this.window = null
    this.windowCheckerInterval = null
    this.released = false
    this.state = {
      mounted: false
    }
  }

  /**
   * Render the NewWindow component.
   */
  render() {
    if (!this.state.mounted) return null
    return ReactDOM.createPortal(this.props.children, this.container)
  }

  componentDidMount() {
    this.openChild()
    this.setState({ mounted: true })
  }

  /**
   * Create the new window when NewWindow component mount.
   */
  openChild() {
    const { url, title, name, features, onBlock, onOpen, center, fullscreen, size } = this.props

    // Prepare position of the new window to be centered against the 'parent' window or 'screen'.
    if (
      typeof center === 'string' &&
      (features.width === undefined || features.height === undefined)
    ) {
      console.warn(
        'width and height window features must be present when a center prop is provided'
      )
    } else if (center === 'parent') {
      features.left =
        window.top.outerWidth / 2 + window.top.screenX - features.width / 2
      features.top =
        window.top.outerHeight / 2 + window.top.screenY - features.height / 2
    } else if (center === 'screen') {
      const screenLeft =
      //@ts-ignore
        window.screenLeft !== undefined ? window.screenLeft : window.screen.left
      const screenTop =
      //@ts-ignore
        window.screenTop !== undefined ? window.screenTop : window.screen.top

      const width = window.innerWidth
        ? window.innerWidth
        : document.documentElement.clientWidth
        ? document.documentElement.clientWidth
        : window.screen.width
      const height = window.innerHeight
        ? window.innerHeight
        : document.documentElement.clientHeight
        ? document.documentElement.clientHeight
        : window.screen.height

      features.left = width / 2 - features.width / 2 + screenLeft
      features.top = height / 2 - features.height / 2 + screenTop
    }

    // Open a new window.
    this.window = window.open(url, name, toWindowFeatures(features))
    
    // When a new window use content from a cross-origin there's no way we can attach event
    // to it. Therefore, we need to detect in a interval when the new window was destroyed
    // or was closed.
    this.windowCheckerInterval = setInterval(() => {
      if (!this.window || this.window.closed) {
        this.release()
      }
    }, 50)

    // Check if the new window was succesfully opened.
    if (this.window) {
      this.window.document.title = title
      this.window.document.body.appendChild(this.container)

      // If specified, copy styles from parent window's document.
      if (this.props.copyStyles) {
        setTimeout(() => copyStyles(document, this.window.document), 0)
      }

      if (typeof onOpen === 'function') {
        onOpen(this.window)
      }

      // Release anything bound to this component before the new window unload.
      this.window.addEventListener('beforeunload', () => this.release())
    } else {
      // Handle error on opening of new window.
      if (typeof onBlock === 'function') {
        onBlock(null)
      } else {
        console.warn('A new window could not be opened. Maybe it was blocked.')
      }
    }
  }

  /**
   * Close the opened window (if any) when NewWindow will unmount.
   */
  componentWillUnmount() {
    if (this.window) {
      this.window.close()
    }
  }

  /**
   * Release the new window and anything that was bound to it.
   */
  release() {
    // This method can be called once.
    if (this.released) {
      return
    }
    this.released = true

    // Remove checker interval.
    clearInterval(this.windowCheckerInterval)

    // Call any function bound to the `onUnload` prop.
    const { onUnload } = this.props

    if (typeof onUnload === 'function') {
      onUnload(null)
    }
  }
}

/**
 * Utility functions.
 * @private
 */

/**
 * Copy styles from a source document to a target.
 * @param {Object} source
 * @param {Object} target
 * @private
 */

function copyStyles(source: Document, target: { head: { appendChild: (arg0: any) => void } }) {
  Array.from(source.styleSheets).forEach((styleSheet: CSSStyleSheet) => {
    // For <style> elements
    let rules
    try {
      rules = styleSheet.cssRules
    } catch (err) {
      console.error(err)
    }

    // For @font-face rule, it must be loaded via <link href=''> because the
    // rule contains relative path from the css file.
    const isFontFaceRule =
      rules &&
      Object.values(rules).some(r => r instanceof CSSFontFaceRule) &&
      styleSheet.href

    if (rules && !isFontFaceRule) {
      const newStyleEl = source.createElement('style')

      // Write the text of each rule into the body of the style element
      Array.from(styleSheet.cssRules).forEach(cssRule => {
        const { cssText, type } = cssRule
        let returnText = cssText
        // Check if the cssRule type is CSSImportRule (3) or CSSFontFaceRule (5) to handle local imports on a about:blank page
        // '/custom.css' turns to 'http://my-site.com/custom.css'
        if ([3, 5].includes(type)) {
          returnText = cssText
            .split('url(')
            .map(line => {
              if (line[1] === '/') {
                return `${line.slice(0, 1)}${
                  window.location.origin
                }${line.slice(1)}`
              }
              return line
            })
            .join('url(')
        }
        newStyleEl.appendChild(source.createTextNode(returnText))
      })

      target.head.appendChild(newStyleEl)
    } else if (styleSheet.href) {
      // for <link> elements loading CSS from a URL
      const newLinkEl = source.createElement('link')

      newLinkEl.rel = 'stylesheet'
      newLinkEl.href = styleSheet.href
      target.head.appendChild(newLinkEl)
    }
  })
}

/**
 * Convert features props to window features format (name=value,other=value).
 * @param {Object} obj
 * @return {String}
 * @private
 */

function toWindowFeatures(obj: { [x: string]: any }) {
  return Object.keys(obj)
    .reduce((features, name) => {
      const value = obj[name]
      if (typeof value === 'boolean') {
        features.push(`${name}=${value ? 'yes' : 'no'}`)
      } else {
        features.push(`${name}=${value}`)
      }
      return features
    }, [])
    .join(',')
}

/**
 * Component export.
 * @private
 */

export default NewWindow