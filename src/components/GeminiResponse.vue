<template>
    <div>
        {{ response }}
    </div>
</template>

<script>
export default {
    name: 'GeminiResponse',
    data() {
        return{
            response: ''
        }
    },
    props: {
        gemini_response: Array
    },
    methods:{
        setResponse() {
            this.response = this.gemini_response;
            return this.response
        }
    }
};
</script>