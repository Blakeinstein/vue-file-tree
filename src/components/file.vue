<script lang="ts">
import Vue, { PropType } from 'vue';
import FileIcon from '@/components/icon.vue';

export default Vue.extend({
  name: 'VueFileTreeFile',
  components: {
    FileIcon
  },
  props: {
    depth: {
      type: Number,
      default: 0
    },
    content: {
      type: Object as PropType<IFile>,
      default: () => <IFile>{}
    },
    searchQuery: {
      type: String,
      default: ''
    },
    currentFile: {
      type: Object as PropType<IFile | null>,
      default: null
    }
  },
  data(): IFileTreeFile {
    return {
      matchingPositions: []
    };
  },
  computed: {
    visible(): boolean {
      if (this.searchQuery !== '') {
        const text = this.content.path.full.replace(/^\.\//, '');
        let searchPosition = 0;
        this.matchingPositions = [];
        for (let n = 0; n < text.length; n++) {
          if (searchPosition < this.searchQuery.length && text[n].toLowerCase() === this.searchQuery[searchPosition]) {
            searchPosition++;
            this.matchingPositions.push(n - this.content.path.directory.length + 1);
          }
        }
        if (searchPosition !== this.searchQuery.length) {
          return false;
        }
      }
      return true;
    }
  },
  methods: {
    onNameClick() {
      this.$emit('currentFileChangeRequest');
    }
  }
})
</script>

<template>
<div v-show="visible">
  <a href="#" class="name" :class="[ currentFile && currentFile.id === content.id ? 'active' : '' ]" :style="{ paddingLeft:depth * 20 + 'px' }" @click.prevent="onNameClick">
      <file-icon class="icon" :extension="content.extension"></file-icon>
      <span class="text">
        <template v-for="(letter, key) in content.name">
          <span
            :key="key"
            class="letter"
            :class="[matchingPositions.indexOf(key) !== -1 ? 'highlight' : '']"
          >
            {{ letter }}
          </span>
        </template>
      </span>
      <span v-if="content.isNew" class="notif new">new</span>
      <span v-if="content.isChanged && !content.isNew" class="notif changed">changed</span>
  </a>
</div> 
</template>

<style>
.name {
  display: block;
  white-space: nowrap;
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
.name .notif {
  display: inline-block;
  position: relative;
  top: -1px;
  padding-left: 3px;
  padding-right: 3px;
  margin-left: 0px;
  border-radius: 6px;
  color: #fff;
  font-size: 8px;
  height: 11px;
  line-height: 11px;
}
.name .notif.new {
  background-image: linear-gradient(-90deg, #6e67fd 0%, #9b52f5 100%);
}
.name .notif.changed {
  background-image: linear-gradient(-90deg, #ff708f 0%, #fe846f 100%);
}
.name.active {
  background: #2d2d49;
}
.name:hover .text {
  color: #4bd1c5;
}
.name:hover .text .letter {
  opacity: 1;
}
</style>