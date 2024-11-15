import WebFontLoader from 'webfontloader'

export default class WebFontFile extends Phaser.Loader.File {
  private fonts: string[]

  constructor(loader: Phaser.Loader.LoaderPlugin, fonts: string[]) {
    super(loader, {
      type: 'webfont',
      key: fonts.toString(),
    })

    this.fonts = fonts
  }

  load() {
    const config = {
      active: () => {
        this.loader.nextFile(this, true)
      },
      google: {
        families: this.fonts,
      },
    }

    WebFontLoader.load(config)
  }
}
