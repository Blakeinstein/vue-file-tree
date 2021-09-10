<script lang="ts">
import Vue, { PropType } from 'vue';
import File from '@/components/file.vue';
import Folder from '@/components/folder.vue';

export default Vue.extend({
  name: 'VueFileTree', 
  data(): IFileTree {
    return {
      searchValue: '',
      currentFile: null
    };
  },
  props: {
    files: {
      type: Object as PropType<IFolder>,
      default: () => <IFolder>{},
    }
  },
  components: {
    File,
    Folder
  },
  computed: {
    folders () {
      return this.files.folders.map(folder => {
        return <IFolderDated>{
          folder,
          date : new Date()
        }
      })
    }
  },
  watch: {
    searchValue: 'onSearchValueChange'
  },
  methods: {
    onSearchValueChange (value: string) {
      console.log(value);
    },
    onAllReadClick () {
      const eachFolder = (obj: IFolder) => {
        for (const folder of obj.folders) {
          eachFolder(folder);
        }
        if (obj.files) {
          for (const file of obj.files) {
            file.isChanged = false;
            file.isNew = false;
          }
        }
      }

      eachFolder(this.files)
    }
  },
});
</script>

<template>
  <div class="file-tree">
    <div v-if="files.allCount === 0" class="no-file">
        There is no file yet
        <br>Please wait
    </div>
    <div v-else>
        <input class="search" type="text" v-model="searchValue" placeholder="Search for files ...">
        <div class="inner" :style="`right: -${scrollbarWidth}px;`">
            <files-tree-folder 
              :key="folder.date"
              class="content"
              v-for="folder of folders"
              :content="folder.folder"
              :current-file="currentFile"
              :depth="0"
            ></files-tree-folder>
        </div>
        <a href="#" class="all-read" @click.prevent="onAllReadClick">Mark all as read</a>
    </div>
  </div>
</template>

<style scoped>
.file-tree {
  position: absolute;
  top: 120px;
  bottom: 0px;
  left: 0;
  width: 290px;
  background: #26283B;
  color: #ffffff;
  user-select: none;
  overflow: hidden;
}

.no-file{
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  color: #fff;
  font-size: 20px;
  opacity: 0.5;
  font-weight: 300;
  font-family: 'DINNextRoundedLTPro';
}

.search{
  display: block;
  font-size: 14px;
  padding-left: 20px;
  width: 100%;
  height: 40px;
  margin-bottom: 10px;
  line-height: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.inner{
    position: absolute;
    top: 40px;
    bottom: 0;
    left: 0;
    overflow-y: scroll;
}

.content {
  padding-bottom: 60px;
  line-height: 28px;
  font-size: 14px;
}

.all-read{
  position: fixed;
  bottom: 20px;
  left: 20px;
  height: 20px;
  padding-left: 4px;
  padding-right: 4px;
  line-height: 20px;
  background: #393855;
  font-size: 12px;
  text-transform: uppercase;
}

.all-read::hover {
  color: #4BD1C5;
}
</style>
