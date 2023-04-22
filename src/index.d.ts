declare module '*.gif';
declare module '*.ico';
declare module '*.icns';
declare module '*.png';
declare module '*.svg';

declare module '*volume.node' {
  const value: { volume: () => number };
  export = value;
}

declare module '*black-magic.node';
