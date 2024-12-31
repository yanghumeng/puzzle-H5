<template>
  <div class="app">
    <MusicButton ref="musicButton" />
    <StartScreen v-if="!gameStarted" @start="startGame" />
    <PuzzleGame v-else @end-game="endGame" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import StartScreen from "./components/StartScreen.vue";
import PuzzleGame from "./components/PuzzleGame.vue";
import MusicButton from "./components/MusicButton.vue";

const gameStarted = ref(false);
const musicButton = ref(null);
function startGame() {
  gameStarted.value = true;
  musicButton.value.toggleMusic();
}

function endGame() {
  gameStarted.value = false;
}
</script>

<style>
.app {
  height: 100vh;
  width: 100vw;
  background: url('./assets/images/bg.jpeg') center center no-repeat;
  background-size: cover;
  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
}

.app::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: -1;
}

/* 重置一些基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  overflow-x: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

/* 防止在 iOS 设备上双击缩放 */
html {
  touch-action: manipulation;
}
</style>
