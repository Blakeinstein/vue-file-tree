<script lang="ts">
import Vue from "vue";

const icons = <Record<string, string[]>>{
  js: ["js"],
  typescript: ["ts"],
  html: ["html", "htm"],
  sass: ["sass", "scss"],
  less: ["less"],
  stylus: ["stylus", "styl"],
  css: ["css"],
  php: ["php"],
  json: ["json"],
  jade: ["jade"],
  pug: ["pug"],
  md: ["md"],
  sql: ["sql"],
  apache: ["htaccess", "htpasswd"],
  yml: ["yml"],
  svg: ["svg"],
  font: ["eot", "ttf", "woff", "woff2"],
  image: ["jpeg", "jpg", "tiff", "gif", "bmp", "png", "webp"],
  video: [
    "mpeg",
    "mpg",
    "mp4",
    "amv",
    "wmv",
    "mov",
    "avi",
    "ogv",
    "mkv",
    "webm",
  ],
  audio: ["mp3", "wav", "ogg", "raw"],
  zip: ["zip", "rar", "7z", "gz"],
  txt: ["txt"],
  coffee: ["coffee"],
  git: ["gitignore", "gitkeep"],
  xml: ["xml"],
  twig: ["twig"],
  c: ["c", "h"],
  folder: ["folder"],
  "folder-active": ["folder-active"],
  kotlin: ["kt"],
  go: ["go"],
}

export default Vue.extend({
  name: "VueFileTreeIcon",
  props: {
    extension: { type: String, default: "" },
  },
  data(): IFileTreeIcon {
    return {
      icon: 'random',
    }
  },
  computed() {
    iconPath: (): string => {
      for (const iconKey in icons) {
        const iconExtensions = icons[iconKey];
        if (iconExtensions.indexOf(this.extension) !== -1) {
          this.icon = iconKey;
        }
      }
      return require(`./icons/${this.icon}.svg`);
    }
  }
});
</script>

<template>
<span>
    <img :src="iconPath" alt="">
</span>
</template>

<style>
.icon {
  display: inline-block;
  width: 12px;
  height: 12px;
}
.icon img {
  display: inline-block;
  width: 100%;
  height: 100%;
}
</style>