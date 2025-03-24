<template>
  
  <div class="main">
      <div class="section-img">      
        <img class="sat-image" :src="geminiImageUrl"/>
        <div class="info-section">
          <div class="title"> My name is Satellite <span class="sub-title">  {{ this.sat_name }} </span> </div>
          <div class="title"> My sensor type is <span class="sub-title">  {{ this.type }} </span> </div>
          <div class="title"> Now I am flying over <span class="sub-title"> {{ location_response }} </span></div>
        </div>

        <div class="center-text">
          <p v-if="dream_response">{{ dream_response }} </p>
          <p v-else> Wait I am dreaming... </p>
        </div>
      </div>
  </div>

</template>

<script>
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.VUE_APP_API;
const genAI = new GoogleGenerativeAI("AIzaSyCH2jsmty34rFNcxzgjRqOBvhsJEmQJhiM");

export default {
  name: 'App',
  data() {
    return {
      sat_data: null,
      interval: null,
      coordinates_sat: '',
      dream_data:'',
      location_response: '',
      dream_response: '',
      geminiImageUrl: '',
      prompt: '',
      dream_prompt:'',
      lon: '', 
      lat: '',
      alt: '',
      sat_name:'',
      type:'',
    };
  },

  mounted() {
    this.fetch_data().then(() => {
      this.coordinates_sat = this.sat_data.features.map(d => d.geometry.coordinates);
      this.dream_data = this.sat_data.features.map(d => d);
      console.log('This is dream data', this.dream_data);
    });

    this.interval = setInterval(() => {
      this.fetch_data().then(() => {
        this.coordinates_sat = this.sat_data.features.map(d => d.geometry.coordinates);
        this.dream_data = this.sat_data.features.map(d => d);
        console.log('This is dream data', this.dream_data);
      });
    }, 25000);
  },
  

  watch: {
    dream_data:{
      deep: true,
      handler(data){
        if (data[0].geometry.coordinates){
          console.log("This is Sat Name",data[0].geometry.coordinates[0])
            const randomIndex = Math.floor(Math.random() * data.length);
            this.lon = data[randomIndex].geometry.coordinates[0];
            this.lat = data[randomIndex].geometry.coordinates[1];
            this.sat_name = data[randomIndex].properties.name;
            this.type = data[randomIndex].properties.modes[0].sensor_type;
            this.swath = data[randomIndex].properties.modes[0].swath;
            

          this.prompt = `What is the place located at latitude ${this.lat}, longitude ${this.lon} and swath of ${this.swath}? Provide only the name of the place. Be accurate. If you do not finde a plase return the nearest area to that location and only the location "The nearest location is.."".`;
          this.dream_prompt = `This satellite ${this.name} is at ${this.lat}, ${this.lon} and have this sensor ${this.type}. Genrate a poem based on what the machine is dreaming about. Max 100 words. Return only the dream text without any extra explination`
          this.sendToGemini();

          this.generateGeminiImage(this.lat, this.lon, this.swath);
        }
      }
    }
  },

  methods: {
    async fetch_data() {
      try {
        const res = await fetch(`https://api.spectator.earth/satellite/?api_key=${API_KEY}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        this.sat_data = await res.json();
        console.log(this.sat_data)
      } catch (error) {
        console.error("Fetch error:", error);
      }
    },

    async sendToGemini() {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(this.prompt);
        const drea_result = await model.generateContent(this.dream_prompt);
        this.location_response = result.response.text();
        this.dream_response = drea_result.response.text();
      } catch (error) {
        console.error("Gemini text generation error:", error);
      }
    },

    async generateGeminiImage(lat, lon, swath) {
      const imagePrompt = `
        Generate a highly realistic satellite image at a resolution of exactly 1080x1080 pixels, vividly capturing Earth's surface at the precise coordinates of Longitude: ${lon}, Latitude: ${lat}. The viewpoint should emulate that of a real-time Earth observation satellite orbiting directly overhead, clearly reflecting the satellite's current swath width coverage of approximately ${swath} kilometers.

        Ensure the following details:
        - Accurately depict natural terrain, including geological features, bodies of water, vegetation types, or urban landscapes corresponding precisely to these coordinates.
        - Maintain logical realism consistent with satellite imagery: realistic atmospheric clarity, accurate color grading (natural colors), and appropriate shadowing based on sunlight direction relevant to the current time at the provided location.
        - The perspective should be strictly top-down, perpendicular to Earth's surface, avoiding oblique or angled views.
        - Include realistic cloud coverage only if typical and logical for the region at this moment; avoid exaggerated or unrealistic cloud formations.

        This image must appear precisely representative of live satellite-captured visuals, suitable for real-time monitoring purposes and credible satellite data applications.
        `;
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp-image-generation",
        generationConfig: {
          responseModalities: ['Text', 'Image']
        },
      });

      try {
        const result = await model.generateContent(imagePrompt);
        
        let imageGenerated = false;

        for (const part of result.response.candidates[0].content.parts) {
          if (part.inlineData) {
            this.geminiImageUrl = `data:image/png;base64,${part.inlineData.data}`;
            imageGenerated = true;
            break;
          }
        }

        if (!imageGenerated) {
          console.error("Gemini didn't return valid inline image data.");
          this.geminiImageUrl = '';
        }

      } catch (error) {
        console.error("Gemini image generation error:", error);
        this.geminiImageUrl = '';
      }
    },
  },

  beforeUnmount() {
    clearInterval(this.interval);
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Funnel+Display:wght@300..800&display=swap');


body{
  margin: 0;
  padding: 0;
  font-family: "Funnel Display", sans-serif;
  color: black;
}

img {
  max-width: 100%;
}

.main{
    height: 100vh;
    width: 100vw;
    position: relative;
}

.section-img{
  height: 100vh;
  width: 100vw;
  position: fixed;
}

.sat-image{
    filter: blur(6px);
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-color: black;
    opacity: 0.5;
}

.info-section{
  position: absolute;
  top:20px;
  left: 20px;
}

.title{
  font-weight: 700;
}

.sub-title{
  font-weight: 200;
}

.center-text{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    font-size: 2em;
}

</style>