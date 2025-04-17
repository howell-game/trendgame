<template>
  <div class="chat-container">
    <h2>Support Chat</h2>

    <div class="chat-box">
      <div v-for="(message, index) in chatMessages" :key="index" :class="['message', message.sender]">
        <span v-if="message.sender === 'ai'">AI:</span>
        <span v-else>You:</span>
        <!-- Use v-html to display sanitized message -->
        <p v-html="message.text"></p>
      </div>
    </div>

    <div class="chat-input">
      <input
        v-model="userMessage"
        @keyup.enter="sendMessage"
        placeholder="Type your message..."
        class="chat-input-field"
      />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import sanitizeHtml from "sanitize-html"; // Import sanitize-html

export default {
  setup() {
    const store = useStore();
    const userMessage = ref("");
    const chatMessages = computed(() => store.getters.chatMessages);

    onMounted(() => {
      store.dispatch("connectWebSocket");
    });

    const sendMessage = () => {
      if (!userMessage.value.trim()) return;

      // Sanitize the user message
      const sanitizedMessage = sanitizeHtml(userMessage.value, {
        allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'u' ], // Customize tags based on need
        allowedAttributes: {
          'a': [ 'href', 'target' ], // Allow links with href and target attributes
        },
      });

      // Dispatch the sanitized message
      store.dispatch("sendMessage", sanitizedMessage);
      userMessage.value = "";
    };

    return {
      userMessage,
      chatMessages,
      sendMessage,
    };
  },
};
</script>

<style scoped>
.chat-container {
  width: 100%;
  max-width: 800px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: lightyellow;
  display: flex;
  flex-direction: column;
  height: 80vh;
}

.chat-box {
  flex-grow: 1;
  height: 100%;
  overflow-y: auto;
  margin-bottom: 10px;
  padding: 10px;
  background: #fff;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.message {
  padding: 8px;
  margin: 5px 0;
  border-radius: 5px;
}

.message.user {
  background: #e1f5fe;
  text-align: right;
}

.message.ai {
  background: #c8e6c9;
}

.chat-input {
  display: flex;
  position: sticky;
  bottom: 0;
  background: lightyellow;
  padding: 10px;
  border-top: 1px solid #ddd;
}

.chat-input input {
  flex-grow: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  outline: none;
}

.chat-input button {
  padding: 12px;
  background: red;
  color: lightyellow;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 5px;
}
</style>
