import * as React from 'react';

class RecreateChildOnPropsChange extends React.Component<any, any> {
  _forceRecreateCounter = 0;
  constructor(props: any) {
    super(props);
  }

  shouldComponentUpdate(nextProps: any) {
    let props = this.props;
    if (props === nextProps) {
      return true;
    }

    let keys = Object.keys(props);
    let nextKeys = Object.keys(nextProps);

    if (keys.length !== nextKeys.length) {
      return false;
    }

    for (let key of keys) {
      if (key !== 'children' && (!nextProps.hasOwnProperty(key) || props[key] !== nextProps[key])) {
        return true;
      }
    }

    return false;
  }

  render() {
    this._forceRecreateCounter++;
    return React.cloneElement(
      // @ts-ignore
      React.Children.only(this.props.children),
      { key: this._forceRecreateCounter }
    );
  }
}

export default RecreateChildOnPropsChange;
