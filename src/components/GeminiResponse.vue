<template>
    <div
        v-for="key in responses"
        :key="key"
        class="pormpts">  
    </div>
</template>

<script>
export default {
    name: 'GeminiResponse',
    data() {
        return{

        }
    },
    props: {
        responses: Array
    },
    methods:{

    }
};
</script>