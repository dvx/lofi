import { noop } from 'lodash';
import { memo, ReactNode, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

const copyStyles = (source: Document, target: { head: { appendChild: (arg0: unknown) => void } }): void => {
  Array.from(source.styleSheets).forEach((styleSheet: CSSStyleSheet) => {
    let rules;
    try {
      rules = styleSheet.cssRules;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }

    const isFontFaceRule = rules && Object.values(rules).some((r) => r instanceof CSSFontFaceRule) && styleSheet.href;

    if (rules && !isFontFaceRule) {
      const newStyleEl = source.createElement('style');

      Array.from(styleSheet.cssRules).forEach((cssRule) => {
        const { cssText, STYLE_RULE } = cssRule;
        let returnText = cssText;
        if ([3, 5].includes(STYLE_RULE)) {
          returnText = cssText
            .split('url(')
            .map((line) => {
              if (line[1] === '/') {
                return `${line.slice(0, 1)}${window.location.origin}${line.slice(1)}`;
              }
              return line;
            })
            .join('url(');
        }
        newStyleEl.appendChild(source.createTextNode(returnText));
      });

      target.head.appendChild(newStyleEl);
    } else if (styleSheet.href) {
      const newLinkEl = source.createElement('link');

      newLinkEl.rel = 'stylesheet';
      newLinkEl.href = styleSheet.href;
      target.head.appendChild(newLinkEl);
    }
  });
};

const toWindowFeatures = (obj: { [x: string]: unknown }): string => {
  return Object.keys(obj)
    .reduce((features, name) => {
      const value = obj[name];
      if (typeof value === 'boolean') {
        features.push(`${name}=${value ? 'yes' : 'no'}`);
      } else {
        features.push(`${name}=${value}`);
      }
      return features;
    }, [])
    .join(',');
};

interface Props {
  url?: string;
  name: string;
  title?: string;
  features?: { width?: number; height?: number; isFullscreen?: boolean };
  children: ReactNode;
  onOpen?: (window: Window) => void;
  onUnload?: () => void;
}

export const WindowPortal = memo(
  ({
    url = '',
    name = '',
    title = '',
    features = { width: 600, height: 640, isFullscreen: false },
    children = {},
    onOpen = noop,
    onUnload = noop,
  }: Props) => {
    const [isMounted, setIsMounted] = useState(false);
    const [container] = useState<HTMLDivElement>(() => document.createElement('div'));

    useEffect(() => {
      const left = window.top.outerWidth / 2 + window.top.screenX - features.width / 2;
      const top = window.top.outerHeight / 2 + window.top.screenY - features.height / 2;
      const newWindow = window.open(url, name, toWindowFeatures({ ...features, top, left }));

      newWindow.document.title = title;
      newWindow.document.body.appendChild(container);

      setTimeout(() => copyStyles(document, newWindow.document), 0);

      onOpen(newWindow);
      setIsMounted(true);

      return () => {
        onUnload();
        newWindow?.close();
        setIsMounted(false);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isMounted ? ReactDOM.createPortal(children, container) : null;
  }
);
