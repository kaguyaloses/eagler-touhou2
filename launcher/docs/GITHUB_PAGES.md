# GitHub Pages

This site publishes the Launcher and all eight normal game Runtimes, but no original game DATA or multiplayer Runtimes. Players install games by importing prepared Package ZIPs in their browser. Raw `.dat` import is unavailable on this site because it does not publish a private DATA hash.

## Publish the prepared build

The verified production site is generated at `launcher/dist/import-site/`. From that directory, create the upload asset with the website files at the ZIP root:

```sh
cd launcher/dist/import-site
zip -qr ../eagler-touhou-import-site.zip .
```

Attach `launcher/dist/eagler-touhou-import-site.zip` to a GitHub Release. Do not attach any game-package ZIPs or original game files.

## Publish

GitHub Pages must use **GitHub Actions** as its source. In the repository, open **Actions → Deploy GitHub Pages → Run workflow**, enter the release tag, and run it. The workflow verifies that the ZIP is an import-mode production build for this repository's Pages URL before publishing it.

The site stays online after the Codespace closes. Imported Packages stay in each player's browser storage. Multiplayer requires a separately hosted relay and is not included in this build.