<script lang="ts">
import Vue from 'vue';
import VueFileTree from '@/vue-file-tree.vue';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    VueFileTree
  }
});
</script>

<template>
  <div id="app">
    <vue-file-tree />
  </div>
</template>
