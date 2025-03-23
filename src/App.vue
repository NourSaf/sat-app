<template>
  <div>
    <el-row>
      <el-col :span="24">
        <div class="grid-content"> 
          <h1>The Dreaming Sat</h1>
        </div>
        <div>
        </div>
    </el-col>
    </el-row>

    <div class="section">

      <h3 >CURRENT LOCATION</h3>
      <div>{{ gemini_response }}</div>
      
      <h3> This is my Dream</h3>
      <p>{{ dream_response }}</p>

    </div>

    <div class="section">
      <h3>Sataletie image:</h3>
      <img v-if="geminiImageUrl" :src="geminiImageUrl" alt="Image of the current satellite location" />
      <p v-else>DREAMING...</p>
    </div>
  </div>
</template>

<script>
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.VUE_APP_API;
const genAI = new GoogleGenerativeAI("AIzaSyCZjHuMPr9JPA37ps8Gs1z3xgN9x3LGVB0");

export default {
  name: 'App',
  data() {
    return {
      sat_data: null,
      interval: null,
      coordinates_sat: '',
      dream_data:'',
      gemini_response: '',
      dream_response: '',
      geminiImageUrl: '',
      prompt: '',
      dream_prompt:'',
    };
  },

  mounted() {
    this.fetch_data();
    this.interval = setInterval(() => {
      this.coordinates_sat = this.sat_data.features.map(d => d.geometry.coordinates);
      this.dream_data = this.sat_data.features.map(d => d)
      console.log('This is dream data', this.dream_data)
      this.fetch_data();
    }, 15000);
  },

  watch: {
    dream_data:{
      deep: true,
      handler(data){
        if (data[0].geometry.coordinates){
          console.log("This is Sat Name",data[0].geometry.coordinates[0])
          const lat = data[0].geometry.coordinates[0];
          const lon = data[0].geometry.coordinates[1];
          const alt = data[0].geometry.coordinates[2];
          const name = data[0].properties.name;
          const type = data[0].properties.senspr_type;

          this.prompt = `What is the place located at latitude ${lat}, longitude ${lon}? Provide only the name of the place. Be accurate`;
          this.dream_prompt = `This satellite ${name} is at ${lat}, ${lon} and have this sensor ${type}. Genrate a poem based on what the machine is dreaming about. Max 100 words. Return only the dream text without any extra explination`
          this.sendToGemini();

          this.generateGeminiImage(lat, lon, alt);
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
        this.gemini_response = result.response.text();
        this.dream_response = drea_result.response.text();
      } catch (error) {
        console.error("Gemini text generation error:", error);
      }
    },

    async generateGeminiImage(lat, lon, alt) {
      const imagePrompt = `
        Generate an ultra-realistic, highly detailed satellite imagery scene similar 
        to imagery captured by the ALOS-2 satellite, accurately reflecting 
        real-time position data, 
        including the satellite's current latitude ${lat}, longitude ${lon}, and altitude ${alt}. 
        The image should always maintain a 1080 width by 1080px height ratio. 
        Portray Earth's curvature distinctly, showcasing a dynamic 
        position and perspective consistent with realistic orbital mechanics. 
        Include the specific swath coverage of the satellite, emphasizing accurate and 
        vivid geographical features such as terrain textures, cloud formations, 
        oceanic currents, mountain ranges, rivers, urban centers, and vegetation 
        patterns. The lighting should accurately depict natural sunlight 
        conditions, highlighting realistic shadows and reflections based 
        on the satellite's real-time location relative to 
        Earth and the Sun. Capture authentic atmospheric effects, 
        including the thin glowing blue line of Earth's atmosphere 
        on the horizon, subtle atmospheric scattering, and accurate cloud shadows on land and sea surfaces. Ensure visual clarity, sharpness, and resolution comparable to genuine ALOS-2 satellite imagery. The imagery should evoke an authentic sense of real-time observation, suggesting the continuous changing position and swath coverage of the satellite in Earth's orbit.
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

<style scoped>
.section {
  margin-top: 20px;
}

img {
  max-width: 100%;
  border-radius: 8px;
  border: 1px solid #ddd;
}


.el-row {
  margin-bottom: 20px;
  &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }

</style>