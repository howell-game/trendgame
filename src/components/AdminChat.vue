<template>
  <div class="admin-chat-container">
    <h2>Admin Chat Panel</h2>
    <div class="admin-chat-box">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.sender]">
        <span v-if="message.sender === 'admin'">Admin:</span>
        <span v-else>{{ message.userName }}:</span>
        <p>{{ message.text }}</p>
      </div>
    </div>

    <div class="admin-chat-input">
      <input v-model="adminMessage" @keyup.enter="sendMessage" placeholder="Type your reply..." />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";

export default {
  setup() {
    const messages = ref([]); // Stores chat messages
    const adminMessage = ref("");
    let socket = null;

    onMounted(() => {
      socket = new WebSocket("ws://localhost:5000");

      socket.onopen = () => {
        console.log("Admin connected to WebSocket");
        socket.send(JSON.stringify({ type: "admin_connect" })); // Notify backend that admin is online
      };

      socket.onmessage = (event) => {
        const receivedMessage = JSON.parse(event.data);
        messages.value.push(receivedMessage);
      };

      socket.onclose = () => {
        console.log("Admin WebSocket Disconnected");
      };
    });

    const sendMessage = () => {
      if (!adminMessage.value.trim()) return;

      const messageData = {
        text: adminMessage.value,
        sender: "admin",
        type: "admin_response",
      };

      socket.send(JSON.stringify(messageData)); // Send response to user
      messages.value.push(messageData);
      adminMessage.value = "";
    };

    return {
      messages,
      adminMessage,
      sendMessage,
    };
  },
};
</script>

<style scoped>
.admin-chat-container {
  width: 500px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f1f1f1;
}

.admin-chat-box {
  height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.message {
  padding: 8px;
  margin: 5px 0;
  border-radius: 5px;
}

.message.admin {
  background: #ffe0b2;
  text-align: right;
}

.message.user {
  background: #c8e6c9;
}

.admin-chat-input {
  display: flex;
}

.admin-chat-input input {
  flex: 1;
  padding: 8px;
}

.admin-chat-input button {
  padding: 8px;
  background: red;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
