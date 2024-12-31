<template>
  <div v-if="show" class="preview-modal">
    <div class="preview-content">
      <template v-if="isImageLoaded">
        <h3>记住图片位置 ({{ countdown }}秒后开始游戏)</h3>
        <div class="preview-image">
          <img :src="imageUrl" alt="预览图" />
        </div>
      </template>
      <div v-else class="loading-container">
        <div class="loading-spinner"></div>
        <p>图片加载中...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  imageUrl: String,
  countdown: Number
});

const emit = defineEmits(['image-loaded']);
const isImageLoaded = ref(false);

watch(() => props.imageUrl, (newUrl) => {
  if (newUrl) {
    isImageLoaded.value = false;
    const img = new Image();
    img.onload = () => {
      isImageLoaded.value = true;
      emit('image-loaded');
    };
    img.src = newUrl;
  }
}, { immediate: true });
</script>

<style scoped>
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.preview-content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  max-width: 90%;
  animation: fadeIn 0.3s ease-out;
}

.preview-image {
  margin: 10px 0;
  max-height: 70vh;
  overflow: hidden;
}

.preview-image img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.animate__animated {
  animation-duration: 0.5s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

.animate__fadeIn {
  animation-name: fadeIn;
}

.animate__fadeOut {
  animation-name: fadeOut;
}

.loading-container {
  padding: 30px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-container p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>