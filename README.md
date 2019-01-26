# Lofi: a tiny player

Lofi is a mini Spotify player with visualizations. It is *not* a replacement for the Spotify Desktop app, nor does it play music independently of the Spotify app; instead, Lofi works alongside it to provide a more intuitive and pleasant access to common features, including pausing/playing, and previous/next track. Lofi also displays cover art and track info stylishly and it facilitates WebGL-powered audio visualizations for both Windows and MacOS. In other words, it's a "tiny Spotify player" or a "mini mode" for the Spotify desktop app.

It is possible to make Lofi work with other audio sources (including YouTube and SoundCloud), and that might make it on the roadmap at some point.

## Design goals

- A small, `1:1` aspect ratio player depicting album art
- An always-on-top "widget-like" app
- Minimalist (no extraneous controls)
- Multiple-screen capable
- Windows and MacOS compatible
- Visualization-ready (WebGL)
- ≤ 100MB memory footprint

# Building

To build, you'll need `node-gyp`, a compatible Python version (2.x), and your operating system's SDK (Microsoft Build Tools or Xcode). Linux native compilation is currently not supported. First, you'll need to run `yarn install`.

To **build from scratch**, run `yarn run dist` or `yarn run pack`. Find the output in `/dist`.

To **develop**, run `yarn run build` to build required natives, followed by either `yarn run development` or `yarn run production` to start the front-end in either interactive or non-interactive mode. Finally, kick off Electron via `yarn run start`.

## Folder structure

