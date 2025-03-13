<template>
  {{ data_information }}
  <api_app/>
</template>

<script>
import api_app from './components/api_app.vue'

const API_KEY = process.env.VUE_APP_API;
const bbox = '19.59,49.90,20.33,50.21';
const satellites = 'Sentinel-2A,Sentinel-2B';
const API_URL = `https://api.spectator.earth/overpass/?bbox=${bbox}&satellites=${satellites}&api_key=${API_KEY}`;

export default {
  name: 'App',
  components: {
    api_app
  },
  data(){
    return{
      sat_data: null
    }

  },
  computed: {
    data_information(){
      
     return console.log("MY DATA",this.sat_data)
    }
  },
  mounted(){
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) =>{
        this.sat_data = data;
      });
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
