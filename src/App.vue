<template>
  <div id="app">

  </div>
</template>

<script>
export default {
  name: "App",
  components: {},
  data() {
    return {

    }
  },
  mounted() {
    var url = this.HOST + "/comment/music?id=186016&limit=1"
    this.$axios.get(url)
    .then(res => {
      console.log(res.data);
      console.log("看得到我吗？");
    })
    .catch(error => {
      console.log(error);
    })
  },
  methods: {
    
  }
};
</script>

<style>
</style>
