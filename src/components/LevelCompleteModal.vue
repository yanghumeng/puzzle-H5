<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h2>恭喜完成第{{ level }}关！</h2>
      <p>用时：{{ time }}</p>
      <div class="modal-buttons">
        <button class="btn cancel" @click="$emit('cancel')">结束游戏</button>
        <button class="btn next" @click="$emit('next')">下一关</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  level: Number,
  time: String,
});

defineEmits(["next", "cancel"]);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 80%;
  width: 300px;
  animation: modalPop 0.3s ease-out;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.2s;
}

.btn:active {
  transform: scale(0.95);
}

.btn.cancel {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn.next {
  background-color: #3b82f6;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}

h2 {
  margin: 0 0 10px 0;
  color: #1f2937;
  font-size: 16px;
}

p {
  margin: 0 0 20px 0;
  color: #4b5563;
  font-size: 14px;
}

@keyframes modalPop {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
