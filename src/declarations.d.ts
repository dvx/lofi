declare module '*.svg' {
  const value: any;
  export = value;
}

declare module '*.png' {
  const value: any;
  export = value;
}

declare module '*.ico' {
  const value: any;
  export = value;
}

declare module '*.icns' {
  const value: any;
  export = value;
}

// visualizations provider
declare module '*visualizations.js' {
  const value: {
    visualizations: Array<{ name: string; visualize: Function }>;
    nextVisualization: Function;
    prevVisualization: Function;
  };
  export = value;
}

// volume native type
declare module '*volume.node' {
  const value: { volume: Function };
  export = value;
}

// black magic native type
declare module '*black-magic.node' {
  const value: {};
  export = value;
}

// non-exposed type from 'electron-settings'
interface SettingsObserver {
  dispose(): void;
}

declare module 'electron-transparency-mouse-fix';
declare module 'electron-localshortcut';
declare module 'react-electron-titlebar';
