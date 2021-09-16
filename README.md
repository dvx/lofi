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

Lofi is a mini Spotify player with visualizations. It is _not_ a replacement for the Spotify Desktop app, nor does it play music independently of the Spotify app; instead, Lofi works alongside it to provide a more intuitive and pleasant access to common features. Lofi also displays cover art and track info stylishly and it facilitates WebGL-powered audio visualizations for both Windows, MacOS and Linux. In other words, it's a "tiny Spotify player" or a "mini mode" to enhance the Spotify desktop app.

## Design goals

- A small, `1:1` aspect ratio player depicting album art
- An always-on-top "widget-like" app
- Minimalist (no extraneous controls)
- Multiple-screen capable
- Windows, MacOS and Linux compatible
- Visualization-ready (WebGL)
- ≤ 100MB memory footprint

# Building

To build, you'll need `node-gyp`, a compatible Python version (2.x), and your operating system's SDK (Microsoft Build Tools or Xcode).

First, you'll need to run:

```
$ yarn install
```

If you have more than one Python installation on your system, you can prevent the build from failing by editing the `package.json` file in the root directory.

Append the following on the `"build": ...` line:

```
--python path/to/python27
```

Now you can run `yarn install` again.

# Distribution

To **create a setup file**, run `yarn run dist`. The output will be located in `./dist`.

```
$ yarn run dist
```

# Development

To **develop**, open up a Terminal and type:

```
$ yarn run development
$ yarn run start
```

## `node-sass` compatibility

You might need to change the `node-sass` version inside `package.json` to be compliant with your `nodejs` version or the `node-gyp` build might fail.

Please refer to the [Node version support policy matrix](https://github.com/sass/node-sass) on the `node-sass` web site.

# Bugs, issues, and contributing

Found a 🐛? Have a feature request? Feel free to open an [issue](https://github.com/dvx/lofi/issues) or [contribute](https://github.com/dvx/lofi).

As always, you are more than welcome join our [Discord](https://discord.gg/YuH9UJk) 🎤 server. The more the merrier! 🎉

Don't forget to ⭐ and/or fork this repo.

# License

MIT
