<template>
  <div>

    <div class="section">
      <div>CURRENT LOCATION {{ gemini_response }}</div>
    </div>

    <div class="section img">      
      <img class="sat-image" v-if="geminiImageUrl" :src="geminiImageUrl" alt="Image of the current satellite location" />
      <p v-else>DREAMING...</p>
      <div class="center-text">
        
        <p>I am dreaming of {{ dream_response }}</p>
      </div>
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
          const lon = data[0].geometry.coordinates[0];
          const lat = data[0].geometry.coordinates[1];
          const name = data[0].properties.name;
          const type = data[0].properties.senspr_type;
          const swath = data[0].properties.swath;

          this.prompt = `What is the place located at latitude ${lat}, longitude ${lon} and swath of ${swath}? Provide only the name of the place. Be accurate`;
          this.dream_prompt = `This satellite ${name} is at ${lat}, ${lon} and have this sensor ${type}. Genrate a poem based on what the machine is dreaming about. Max 100 words. Return only the dream text without any extra explination`
          this.sendToGemini();

          this.generateGeminiImage(lat, lon, swath);
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
  .sat-image{
    filter: blur(4px);
  }
  .section .img{
    position: relative;
    text-align: center;
  }

  .center-text{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .sat-image{
    width: 100%;
  }

</style>