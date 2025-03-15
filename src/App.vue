<template>
  <div> {{ message }}</div>
  <!-- <div> {{ coordinates_sat }}</div> -->
  <div v-for="sat in coordinates_sat"
  :key="sat"
  >
    <div v-for="coord in sat" :key="coord">
      {{ coord }}
    </div>
  </div>
</template>

<script>
// import api_app from './components/api_app.vue'

const API_KEY = process.env.VUE_APP_API;
const API_URL = `https://api.spectator.earth/satellite/?api_key=${API_KEY}`;
//Read this 
//https://visualalchemist.in/2024/06/25/data-driven-art-inspiring-creativity-with-real-world-data/

export default {
  name: 'App',
  // components: {
  //   api_app
  // },
  data(){
    return{
      sat_data: null, 
      interval: null,
      message: '',
      coordinates_sat: '',
      display_time: null,
      sat_cords:[]
    }
  },
  computed: {
    // data_information(){
    //  return console.log("MY DATA",this.sat_data)
    // }
  },
  mounted(){
    this.fetch_data();
    this.interval = setInterval(()=>{
      this.coordinates_sat = this.sat_data.features.map(d => d.geometry.coordinates)
      console.log(this.coordinates_sat)
      console.log("Fetching data");
      this.fetch_data();
      }, 
      2000);
    
    this.display_time = setInterval(() => {
      this.message = new Date().toLocaleTimeString();
    }, 1000)
  },
  methods:{
    async fetch_data(){
      try{
        const res = await fetch(API_URL, {cache: "no-store"});
        if (!res.ok) throw new Error (`AIP Error: ${res.status}`)
        const data = await res.json();
        this.sat_data = data;
        console.log("Updated Data", data)
      } catch (error) {
        console.error("Fetch error:", error)
      }
        
    }
  }, 
  beforeUnmount(){
    clearInterval(this.interval);
    console.log("Interval Cleared");
    clearInterval(this.display_time);
    console.log("interval cleared tested")
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
