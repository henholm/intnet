<template>
  <div id="popup" :style="{display : popupData.display}">
      <div class="inner">
        <div class="header">
            <div>{{popupData.header}}</div>
            <div @click="closeFunction">Close</div>
        </div>
        <div class="body">{{popupData.body}}</div>
        <div class="footer">{{popupData.footer}}</div>
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
  @import './assets/stylePopup.css';
</style>
