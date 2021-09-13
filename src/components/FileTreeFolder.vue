<script lang="ts">
import Vue, { PropType } from 'vue';
import File from '@/components/file.vue';
import FileIcon from '@/components/icon.vue';

export default Vue.extend({
  name: 'VueFileTreeFolder',
  components: {
    File,
    FileIcon
  },
  props: {
    depth: {
      type: Number,
      default: 0
    },
    directory: {
      type: String,
      default: ''
    },
    content: {
      type: Object as PropType<IFolder>,
      default: () => <IFolder>{},
      required: true
    },
    searchQuery: {
      type: String,
      default: ''
    }
  },
  data(): IFileTreeFolder {
    return {
      open: true,
      matchingPositions: []
    };
  },
  computed: {
    fullPath(): string {
      return `${this.directory}${this.content.name}`;
    },

    files() {
      const files = this.content.files.sort((fileA, fileB) =>
        fileA.name < fileB.name ? -1 : 1
      );

      return files;
    },
    visible(): boolean {
      let visible = false;
      const totalCount = this.content.files.length;
      let visibleCount = 0;

      for (const $child of this.$children) {
        if ($child.visible === true) {
          visibleCount++;
        }
      }

      if (visibleCount > 0) {
        visible = true;
      }

      // Get and clean search
      const search = this.searchQuery;

      // If no search value, return true
      if (search !== "") {
        // Set up fuzzy search
        const text = this.fullPath.replace(/^\.\//, "");
        let searchPosition = 0;
        this.matchingPositions = <number[]>[];

        // Go through each character in the text
        for (let n = 0; n < text.length; n++) {
          // If match a character in the search, highlight it
          if (
            searchPosition < search.length &&
            text[n].toLowerCase() === search[searchPosition]
          ) {
            searchPosition += 1;
            this.matchingPositions.push(n - this.directory.length + 2);
          }
        }
      }

      return visible;
    }
  },
  methods: {
    onNameClick() {
      this.open = !this.open;
    },
  },
});
</script>

<template>
  <div v-show="visible">
    <a href="#" class="name" :style="{ paddingLeft:(depth + 1) * 20 + 'px' }" @click.prevent="onNameClick">
        <file-icon class="icon" extension="folder-active" v-show="open"></file-icon>
        <file-icon class="icon" extension="folder" v-show="!open"></file-icon>
        <span class="text">
            <template v-for="(letter, key) in content.name">
                <span :key="key" class="letter" :class="[matchingPositions.indexOf(key) !== -1 ? 'highlight' : '']">{{ letter }}</span>
            </template>
        </span>
    </a>
    <div v-show="open">
        <files-tree-folder class="js-child" v-for="folder of content.folders" :key="folder.name" :content="folder" :depth="depth + 1" :directory="fullPath + '/'"></files-tree-folder>
        <files-tree-file class="js-child" v-for="file of files" :key="file.path.full" :content="file" :depth="depth + 2"></files-tree-file>
    </div>
  </div>
</template>

<style>
.name {
  display: block;
  white-space: nowrap;
}
.name .icon {
  opacity: 0.6;
}
.name .text {
  padding-left: 12px;
  padding-right: 6px;
}
.name .text .letter {
  opacity: 0.6;
}
.name .text .letter.highlight {
  opacity: 1;
  font-weight: bold;
}
.name:hover .icon {
  opacity: 1;
}
.name:hover .text {
  color: #4bd1c5;
}
.name:hover .text .letter {
  opacity: 1;
}
</style>