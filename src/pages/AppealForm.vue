<script>
// import Form1 from '@/views/Form1.vue'
import Form2 from '@/views/Form2.vue'

export default {
  components: { Form2 },
  data() {
    return {
      baza_id: '',
    }
  },
  created() {
    this.baza_id = process.env.VUE_APP_FORM_ID;
  },
}
</script>

<template>
  <form-2></form-2>
</template>