<template>
  <div class="music-btn" :class="{ 'is-playing': isPlaying }" @click="toggleMusic">
    <div class="music-icon">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<script setup>
  import { ref, onUnmounted } from "vue";
  import bgMusic from "../assets/audio/bg.mp3";

  const isPlaying = ref(false);
  const audio = new Audio();
  audio.src = bgMusic;
  audio.loop = true;

  audio.addEventListener("canplaythrough", () => {
    console.log("Audio loaded and ready to play");
    audio
      .play()
      .then(() => {
        isPlaying.value = true;
      })
      .catch((error) => {
        console.log("Autoplay prevented:", error);
        isPlaying.value = false;
      });
  });

  audio.addEventListener("error", (e) => {
    console.error("Audio error:", e);
    isPlaying.value = false;
  });

  const toggleMusic = async () => {
    try {
      if (!isPlaying.value) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          isPlaying.value = true;
        }
      } else {
        audio.pause();
        isPlaying.value = false;
      }
    } catch (error) {
      console.error("Music play error:", error);
      isPlaying.value = false;
    }
  };

  //把播放按钮暴露出去
  defineExpose({
    toggleMusic,
  });

  onUnmounted(() => {
    audio.pause();
    audio.src = "";
  });
</script>

<style scoped>
  .music-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 30px;
    height: 30px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }

  .music-icon {
    width: 16px;
    height: 16px;
    position: relative;
  }

  .music-icon span {
    position: absolute;
    bottom: 0;
    width: 2px;
    background: #333;
    border-radius: 1px;
  }

  .music-icon span:nth-child(1) {
    left: 0;
    height: 8px;
  }

  .music-icon span:nth-child(2) {
    left: 5px;
    height: 12px;
  }

  .music-icon span:nth-child(3) {
    left: 10px;
    height: 16px;
  }

  .music-icon span:nth-child(4) {
    left: 15px;
    height: 10px;
  }

  .is-playing .music-icon span {
    animation: musicBeat 1s infinite ease-in-out;
  }

  .is-playing .music-icon span:nth-child(1) {
    animation-delay: 0s;
  }
  .is-playing .music-icon span:nth-child(2) {
    animation-delay: 0.2s;
  }
  .is-playing .music-icon span:nth-child(3) {
    animation-delay: 0.4s;
  }
  .is-playing .music-icon span:nth-child(4) {
    animation-delay: 0.6s;
  }

  @keyframes musicBeat {
    0%,
    100% {
      transform: scaleY(1);
    }
    50% {
      transform: scaleY(0.5);
    }
  }
</style>
