<template>
  <div class="start-screen">
    <div class="content">
      <h1>拼图游戏</h1>
      <p>共3关，难度逐步提升</p>
      <div class="level-list-container">
        <ul class="level-list">
          <li>第1关: 3 x 3</li>
          <li>第2关: 4 x 4</li>
          <li>第3关: 5 x 5</li>
        </ul>
      </div>
      <button class="start-btn" @click="$emit('start')">开始游戏</button>
    </div>
  </div>
</template>

<script setup>
  defineEmits(["start"]);
</script>

<style scoped>
  .start-screen {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .content {
    background: white;
    padding: 16px;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 80%;
    width: 400px;
  }

  h1 {
    color: #2d3748;
    margin-bottom: 16px;
    font-size: 24px;
  }

  p {
    color: #4a5568;
    margin-bottom: 24px;
    font-size: 14px;
  }

  .level-list {
    list-style: none;
    padding: 0;
    margin: 0 0 24px;
    text-align: left;
    display: inline-block;
  }

  .level-list li {
    color: #4a5568;
    margin: 8px 0;
    padding: 8px 16px;
    background: #f7fafc;
    border-radius: 6px;
    font-size: 14px;
  }

  .start-btn {
    background: #4299e1;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: transform 0.2s, background-color 0.2s;
  }

  .start-btn:hover {
    background: #3182ce;
    transform: translateY(-2px);
  }

  .start-btn:active {
    transform: translateY(0);
  }
</style>
