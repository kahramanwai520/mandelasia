<script>
import { Chat } from "@chat-ui/vue3";
import axios from "axios";
import Pusher from "pusher-js";

export default {
  name: "ChatWidget",
  components: {
    Chat,
  },
  props: {
    ipAddress: String,
  },
  data() {
    return {
      chatMessage: false,
      showChat: false,
      data: [],
    };
  },
  mounted() {
    this.listen();
  },
  methods: {
    listen() {
      axios
        .get("https://api.ipify.org?format=json")
        .then((response) => {
          let pusher = new Pusher("0d3b34df0b6b9220c260", { cluster: "eu" });

          pusher.subscribe(`public-chat.${response.data.ip}`);

          pusher.bind("new-message", (data) => {
            if (data.conversation.user == "admin") {
              this.showChat = true;
              const messagePerson = {
                type: "chatbot",
                timestamp: this.formatAMPM(new Date()),
                message: data.conversation.message,
              };

              this.data.push(messagePerson);
            }
          });
        })
        .catch((e) => {
          console.log(e);
        });
    },
    formatAMPM(date) {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? "0" + minutes : minutes;
      var strTime = hours + ":" + minutes + " " + ampm;
      return strTime;
    },
    handleSendEvent(input) {
      if (input == "") return;

      const messagePerson = {
        type: "person",
        timestamp: this.formatAMPM(new Date()),
        message: input,
      };

      let data = {
        message: input,
        user: "client",
        ipaddress: this.ipAddress,
        baza_id: '1',
      };

      this.$emit("chat-message-status", this.chatMessage);

      axios
        .post(`${process.env.VUE_APP_BAZA_URL}/api/conversations/store`, data)
        .then((response) => {
          console.log(response);
        })
        .catch((e) => {
          this.errors.push(e);
          console.log(this.errors);
        });

      this.data.push(messagePerson);
    },
  },
};
</script>

<template>
    <Chat
      :class="showChat ? '' : 'hidden'"
      :stateOpenChat="1"
      :chat="data"
      :onSend="handleSendEvent"
    />
</template>
