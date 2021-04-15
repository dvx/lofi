<p align="center">
  <img height="64" src="https://raw.githubusercontent.com/dvx/lofi/master/icon.png">
</p>

<h1 align="center"><strong>Lofi: a tiny Spotify player</strong></h1>

<p align="center">
  <a target="_blank" href="https://www.lofi.rocks">Website</a> • <a target="_blank" href="https://www.lofi.rocks/help">FAQ</a> 
</p>

<table width="100%">
  <tr>
    <td width="50%"><img width="100%" src="https://www.lofi.rocks/images/min.jpg"></td>
    <td width="50%"><img width="100%" src="https://www.lofi.rocks/images/vis.gif"></td>
  </tr>
</table>

Lofi is a mini Spotify player with visualizations. It is _not_ a replacement for the Spotify Desktop app, nor does it play music independently of the Spotify app; instead, Lofi works alongside it to provide a more intuitive and pleasant access to common features, including pausing/playing, and previous/next track. Lofi also displays cover art and track info stylishly and it facilitates WebGL-powered audio visualizations for both Windows and MacOS. In other words, it's a "tiny Spotify player" or a "mini mode" for the Spotify desktop app.

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

To build, you'll need `node-gyp`, a compatible Python version (2.x), and your operating system's SDK (Microsoft Build Tools or Xcode). Linux native compilation is currently not supported. First, you'll need to run:

```
$ yarn install
```

If you have more than one Python installation on your system, you can prevent the build from failing by editing the `package.json` file in the root directory.
Edit the build argument from

```
"build": "node-gyp rebuild --target=4.0.1 --arch=x64 --dist-url=https://atom.io/download/electron"
```

to

```
"build": "node-gyp rebuild --target=4.0.1 --arch=x64 --dist-url=https://atom.io/download/electron --python path/to/python27"
```

Now you can run `yarn install` again.

To **build from scratch**, run `yarn run dist`. Find the output in `/dist`.

```
$ yarn run dist
```

To **develop**, open up a Terminal and type:

```
$ yarn run build
$ yarn run development
$ yarn run start
```

Use `yarn run production` (instead of `development`) to start the front-end in non-interactive mode.

## `node-sass` compatibility

You might need to change the `node-sass` version inside `package.json` to be compliant with your `nodejs` version or the `node-gyp` build might fail.

| NodeJS  | Minimum node-sass version | Node Module |
| ------- | ------------------------- | ----------- |
| Node 12 | 4.12+                     | 72          |
| Node 11 | 4.10+                     | 67          |
| Node 10 | 4.9+                      | 64          |
| Node 8  | 4.5.3+                    | 57          |

# Bugs, issues, and contributing

See something you don't like? Have a feature request? Is your computer on fire? Feel free to open an issue, make a pull request or join our [Discord](https://discord.gg/YuH9UJk) server. The more the merrier.

# License

MIT.
