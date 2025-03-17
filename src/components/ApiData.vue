<template>

    <div>
    <h1>The Dreaming Sat</h1>
    <h3><strong>Current Locations:</strong> {{ coordinates_sat }}</h3>
    <h3>Dream:</h3>
    <p>{{ geminiResponse }}</p>
  </div>
  </template>
  
<script>
  const API_KEY = process.env.VUE_APP_API;
  const GEMI_API = process.env.VUE_GEMI_API;
  const API_URL = `https://api.spectator.earth/satellite/?api_key=${API_KEY}`;
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  //Read this 
  //https://visualalchemist.in/2024/06/25/data-driven-art-inspiring-creativity-with-real-world-data/
  
  export default {
    name: 'apiData',
        data(){
      return{
        sat_data: null, 
        interval: null,
        message: '',
        coordinates_sat: '',
        display_time: null,
        sat_cords:[], 
        geminiResponse: '',
        prompt: ''
      }
    },
    computed: {
      // data_information(){
      //  return console.log("MY DATA",this.sat_data)
      // }
    },
    mounted(){
        this.fetch_data();
        this.interval = setInterval(() => {
            this.coordinates_sat = this.sat_data.features.map(d => d.geometry.coordinates)
            console.log(this.coordinates_sat)
            console.log("Fetching data");
            this.fetch_data();
        }, 
            5000);
        
        this.display_time = setInterval(() => {
        this.message = new Date().toLocaleTimeString();
        }, 1000)
    },
    watch: {
    coordinates_sat: {
      deep: true,
      handler(newCoords) {
        if (newCoords[0] && newCoords[1]) {
          this.prompt = `What is the satellite seeing from lattitude ${newCoords[0]} and longitude ${newCoords[1]}.`;
          this.sendToGemini();
        }
      },
    },
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
      },

      async sendToGemini(){
        try{
          const genAI = new GoogleGenerativeAI(GEMI_API);
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          const result = await model.generateContent(this.prompt);
          const dream = result.response.text()
          // console.log(result.response.text());
          this.geminiResponse = dream;
        }catch (error) {
          console.error("Error fetching response from Gemini:", error);
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

  