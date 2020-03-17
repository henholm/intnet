<template>
  <div id="popup" :style="{display: popupData.display}">
  <div id="popup">
      <div class="inner">
        <div class="header">
            <div>{{popupData.header}}</div>
            <div @click="closeFunction">X</div>
        </div>
        <div class="body">{{popupData.body}}</div>
      </div>
  </div>
</template>
<script>
export default {
  props: ['popupData'],
  methods: {
    closeFunction() {
      this.popupData.display = 'none';
    },
  },
};
</script>

<style>
  @import './assets/popup.css';
</style>
