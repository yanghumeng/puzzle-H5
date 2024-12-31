<template>
  <div class="puzzle-game">
    <div class="timer">{{ formatTime(timeSpent) }}</div>
    <PreviewModal :show="showPreview" :imageUrl="previewImageUrl" :countdown="previewCountdown"
      @image-loaded="onPreviewImageLoaded" />
    <div class="level-info">{{ levelInfo }}</div>

    <!-- 修改九宫格样式 -->
    <div class="puzzle-grid" ref="gridRef" :style="{
      'grid-template-columns': `repeat(${gridSize}, 1fr)`,
    }">
      <div v-for="(cell, index) in gridCells" :key="'cell-' + index" class="grid-cell" :data-index="index"
        @touchstart.prevent="startGridDrag($event, index)" @touchmove.prevent="onGridDrag($event)"
        @touchend.prevent="endGridDrag">
        <img v-if="cell" :src="cell.imgData" :data-position="cell.position" />
      </div>
    </div>

    <!-- 底部滑动选择区域 -->
    <div class="piece-slider">
      <!-- 左按钮 -->
      <button class="slider-btn prev" @click="scrollSlider('left')">
        <i class="arrow left"></i>
      </button>

      <div class="slider-wrapper" ref="sliderRef">
        <div class="slider-content">
          <div v-for="piece in unplacedPieces" :key="'piece-' + piece.position" class="puzzle-piece"
            :class="{ dragging: isDragging && currentDragging?.position === piece.position }"
            @touchstart.prevent="startDrag($event, piece)" @touchmove.prevent="onDrag($event)"
            @touchend.prevent="endDrag">
            <img :src="piece.imgData" :data-position="piece.position" />
          </div>
        </div>
      </div>

      <!-- 右按钮 -->
      <button class="slider-btn next" @click="scrollSlider('right')">
        <i class="arrow right"></i>
      </button>
    </div>
    <MusicButton />
    <!-- 添加弹窗组件 -->
    <LevelCompleteModal :show="showLevelComplete" :level="currentLevel" :time="formatTime(timeSpent)" @next="nextLevel"
      @cancel="endGame" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import PreviewModal from "./PreviewModal.vue";
import LevelCompleteModal from "./LevelCompleteModal.vue";
import puzzle1 from "../assets/images/1 (1).jpg";
import puzzle2 from "../assets/images/1 (2).jpg";
import puzzle3 from "../assets/images/1 (3).jpg";
import puzzle4 from "../assets/images/1 (4).jpg";
import puzzle5 from "../assets/images/1 (5).jpg";
import puzzle6 from "../assets/images/1 (6).jpg";
import puzzle7 from "../assets/images/1 (7).jpg";
import puzzle8 from "../assets/images/1 (8).jpg";
import puzzle9 from "../assets/images/1 (9).jpg";
import puzzle10 from "../assets/images/1 (10).jpg";
import moveSound from "../assets/audio/move.wav"; // 导入移动音效

// 游戏状态
const timeSpent = ref(0);
const timer = ref(null);
const gridCells = ref(Array(9).fill(null));
const piecesArray = ref([]);
const sliderRef = ref(null);
const currentDragging = ref(null);

// 拖动状态相关变量
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const gridRef = ref(null);
const dragElement = ref(null);

const SCROLL_AMOUNT = 200; // 每次滚动距离

// 九宫格拖拽相关变量
const gridDragging = ref(null);
const gridDragStartIndex = ref(null);

// 添加游戏难度相关状态
const currentLevel = ref(1); // 当前关卡 1-3
const gridSize = computed(() => currentLevel.value + 2); // 3x3, 4x4, 5x5
const totalCells = computed(() => gridSize.value * gridSize.value);

// 添加关卡信息显示
const levelInfo = computed(() => {
  return `第${currentLevel.value}关 (${gridSize.value}x${gridSize.value})`;
});

// 添加弹窗控制状态
const showLevelComplete = ref(false);

// 添加图片池管理
const puzzleImages = [puzzle1, puzzle2, puzzle3, puzzle4, puzzle5, puzzle6, puzzle7, puzzle8, puzzle9, puzzle10];
const usedImages = ref(new Set());

// 添加预览相关状态
const showPreview = ref(false);
const previewImageUrl = ref("");
const previewCountdown = ref(5);
const previewTimer = ref(null);

// 创建音效对象
const moveSoundEffect = new Audio(moveSound);
moveSoundEffect.volume = 0.5; // 设置音量为50%

// 播放移动音效的函数
const playMoveSound = () => {
  moveSoundEffect.currentTime = 0; // 重置音频到开始位置
  moveSoundEffect.play().catch(error => {
    console.log('Move sound play error:', error);
  });
};

// 获取随机未使用图片
function getRandomImage() {
  const availableImages = puzzleImages.filter((img) => !usedImages.value.has(img));
  if (availableImages.length === 0) {
    console.error("No more available images!");
    return puzzleImages[0]; // fallback
  }

  const randomIndex = Math.floor(Math.random() * availableImages.length);
  const selectedImage = availableImages[randomIndex];
  usedImages.value.add(selectedImage);
  return selectedImage;
}



// 初始化游戏
onMounted(async () => {
  initGame();
});

onUnmounted(() => {
  clearInterval(timer.value);
  clearInterval(previewTimer.value);
  moveSoundEffect.src = '';
});

// 添加 emit 定义
const emit = defineEmits(["end-game"]);

// 初始化游戏
async function initGame() {
  // 重置状态
  timeSpent.value = 0;
  gridCells.value = Array(totalCells.value).fill(null);

  const selectedImage = getRandomImage();

  // 显示预览模态框
  previewImageUrl.value = selectedImage;
  previewCountdown.value = 5;
  showPreview.value = true;
}

// 修改为处理图片加载完成的事件
function onPreviewImageLoaded() {
  // 图片加载完成后开始倒计时
  startPreviewCountdown();

  // 初始化拼图
  const img = new Image();
  img.onload = () => {
    piecesArray.value = shuffleArray(splitImage(img));
  };
  img.src = previewImageUrl.value;
}

// 将图片切割成9份并返回base64数据
function splitImage(img) {
  const pieces = [];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const size = gridSize.value;
  const pieceWidth = Math.floor(img.width / size);
  const pieceHeight = Math.floor(img.height / size);

  canvas.width = pieceWidth;
  canvas.height = pieceHeight;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      ctx.clearRect(0, 0, pieceWidth, pieceHeight);

      ctx.drawImage(img, x * pieceWidth, y * pieceHeight, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight);

      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, pieceWidth, pieceHeight);

      pieces.push({
        imgData: canvas.toDataURL(),
        position: y * size + x,
        isPlaced: false,
      });
    }
  }

  return pieces;
}

// 打乱数组
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// 计算未放置的拼图
const unplacedPieces = computed(() => {
  return piecesArray.value.filter((piece) => !piece.isPlaced);
});

// 开始拖动
function startDrag(event, piece) {
  if (piece.isPlaced) return;

  const touch = event.touches[0];
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();

  // 记录拖动状态
  isDragging.value = true;
  currentDragging.value = piece;

  // 计算触摸点相对元素的偏移
  dragOffset.value = {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };

  // 创建拖动元素
  dragElement.value = element.cloneNode(true);
  Object.assign(dragElement.value.style, {
    position: "fixed",
    zIndex: 1000,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    opacity: "0.8",
    pointerEvents: "none",
    transform: "scale(1.1)",
    transition: "transform 0.1s",
  });

  // 设置初始位置
  updateDragPosition(touch.clientX, touch.clientY);

  // 添加到body
  document.body.appendChild(dragElement.value);
}

// 拖动中
function onDrag(event) {
  if (!isDragging.value || !dragElement.value) return;

  const touch = event.touches[0];
  updateDragPosition(touch.clientX, touch.clientY);

  // 检查是否在九宫格上方
  const gridRect = gridRef.value.getBoundingClientRect();
  const { clientX, clientY } = touch;

  if (isOverGrid(clientX, clientY, gridRect)) {
    const cellIndex = getCellIndex(clientX, clientY, gridRect);
    highlightCell(cellIndex);
  } else {
    clearHighlight();
  }
}

// 结束拖动
function endDrag(event) {
  if (!isDragging.value || !dragElement.value) return;

  const touch = event.changedTouches[0];
  const gridRect = gridRef.value.getBoundingClientRect();

  if (isOverGrid(touch.clientX, touch.clientY, gridRect)) {
    const cellIndex = getCellIndex(touch.clientX, touch.clientY, gridRect);
    // 如果目标格子已有拼图，则交换位置
    if (gridCells.value[cellIndex]) {
      const temp = gridCells.value[cellIndex];
      gridCells.value[cellIndex] = currentDragging.value;
      currentDragging.value.isPlaced = true;
      temp.isPlaced = false;
      // 播放移动音效
      playMoveSound();
    } else {
      // 否则直接放置
      placePiece(currentDragging.value, cellIndex);
    }

    // 检查是否完成
    checkCompletion();
  }

  clearDragState();
}

// 更新拖动元素位置
function updateDragPosition(x, y) {
  if (!dragElement.value) return;

  const { x: offsetX, y: offsetY } = dragOffset.value;
  dragElement.value.style.left = `${x - offsetX}px`;
  dragElement.value.style.top = `${y - offsetY}px`;
}

// 检查是否在九宫格上方
function isOverGrid(x, y, gridRect) {
  return x >= gridRect.left && x <= gridRect.right && y >= gridRect.top && y <= gridRect.bottom;
}

// 获取当前所在格子索引
function getCellIndex(x, y, gridRect) {
  const relativeX = x - gridRect.left;
  const relativeY = y - gridRect.top;
  const cellWidth = gridRect.width / gridSize.value;
  const cellHeight = gridRect.height / gridSize.value;

  const col = Math.floor(relativeX / cellWidth);
  const row = Math.floor(relativeY / cellHeight);

  // 使用当前网格大小计算索引
  return row * gridSize.value + col;
}

// 高亮显示目标格子
function highlightCell(index) {
  clearHighlight();
  const cells = gridRef.value.querySelectorAll(".grid-cell");
  cells[index]?.classList.add("highlight");
}

// 清除高亮
function clearHighlight() {
  const cells = gridRef.value.querySelectorAll(".grid-cell");
  cells.forEach((cell) => cell.classList.remove("highlight"));
}

// 放置拼图
function placePiece(piece, cellIndex) {
  piece.isPlaced = true;
  gridCells.value[cellIndex] = piece;

  // 添加放置动画
  const cell = gridRef.value.querySelectorAll(".grid-cell")[cellIndex];
  cell.classList.add("piece-placed");
  setTimeout(() => {
    cell.classList.remove("piece-placed");
  }, 300);

  // 播放移动音效
  playMoveSound();

  // 检查是否完成
  checkCompletion();
}

// 清理拖动状态
function clearDragState() {
  isDragging.value = false;
  currentDragging.value = null;
  dragElement.value?.remove();
  dragElement.value = null;
  clearHighlight();
}

// 检查拼图是否完成并且位置正确
function checkCompletion() {
  // 首先检查是否所有格子都已填充
  const allFilled = gridCells.value.every((cell) => cell !== null);
  if (!allFilled) return;

  // 检查每个格子的位置是否正确
  const isCorrect = gridCells.value.every((cell, index) => {
    const correctPosition = cell.position === index;
    console.log(`Cell ${index}: current position ${cell.position}, correct: ${correctPosition}`);
    return correctPosition;
  });

  console.log("All pieces placed correctly:", isCorrect);

  if (isCorrect) {
    if (currentLevel.value < 3) {
      handleLevelComplete();
    } else {
      // 最后一关完成
      clearInterval(timer.value);
      setTimeout(() => {
        alert(`恭喜通关！\n总用时：${formatTime(timeSpent.value)}`);
      }, 300);
    }
  }
}

// 计时器相关函数
function startTimer() {
  if (timer.value) {
    clearInterval(timer.value);
  }

  timeSpent.value = 0;
  timer.value = setInterval(() => {
    timeSpent.value++;
  }, 1000);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// 滚动slider
function scrollSlider(direction) {
  const slider = sliderRef.value;
  if (!slider) return;

  const scrollAmount = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
  slider.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  });
}

// 开始九宫格内拖拽
function startGridDrag(event, index) {
  const cell = gridCells.value[index];
  if (!cell) return;

  const touch = event.touches[0];
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();

  gridDragging.value = true;
  gridDragStartIndex.value = index;

  // 计算触摸点相对元素的偏移
  dragOffset.value = {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };

  // 创建拖动元素
  dragElement.value = element.cloneNode(true);
  Object.assign(dragElement.value.style, {
    position: "fixed",
    zIndex: 1000,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    opacity: "0.8",
    pointerEvents: "none",
    transform: "scale(1.1)",
    transition: "transform 0.1s",
  });

  // 设置初始位置
  updateDragPosition(touch.clientX, touch.clientY);

  // 添加到body
  document.body.appendChild(dragElement.value);
}

// 九宫格内拖动
function onGridDrag(event) {
  if (!gridDragging.value || !dragElement.value) return;

  const touch = event.touches[0];
  updateDragPosition(touch.clientX, touch.clientY);

  // 检查是否在九宫格上方
  const gridRect = gridRef.value.getBoundingClientRect();
  const { clientX, clientY } = touch;

  if (isOverGrid(clientX, clientY, gridRect)) {
    const cellIndex = getCellIndex(clientX, clientY, gridRect);
    highlightCell(cellIndex);
  } else {
    clearHighlight();
  }
}

// 结束九宫格内拖动
function endGridDrag(event) {
  if (!gridDragging.value || !dragElement.value) return;

  const touch = event.changedTouches[0];
  const gridRect = gridRef.value.getBoundingClientRect();

  if (isOverGrid(touch.clientX, touch.clientY, gridRect)) {
    const targetIndex = getCellIndex(touch.clientX, touch.clientY, gridRect);

    // 交换位置
    if (targetIndex !== gridDragStartIndex.value) {
      const temp = gridCells.value[targetIndex];
      gridCells.value[targetIndex] = gridCells.value[gridDragStartIndex.value];
      gridCells.value[gridDragStartIndex.value] = temp;

      // 添加交换动画
      const cells = gridRef.value.querySelectorAll(".grid-cell");
      const targetCell = cells[targetIndex];
      const startCell = cells[gridDragStartIndex.value];

      if (targetCell && startCell) {
        targetCell.classList.add("piece-swapped");
        startCell.classList.add("piece-swapped");
        setTimeout(() => {
          targetCell.classList.remove("piece-swapped");
          startCell.classList.remove("piece-swapped");
        }, 300);
      }

      // 播放移动音效
      playMoveSound();

      // 检查是否完成
      checkCompletion();
    }
  }

  // 清理拖动状态
  gridDragging.value = false;
  gridDragStartIndex.value = null;
  clearDragState();
}

// 修改完成关卡处理函数
function handleLevelComplete() {
  clearInterval(timer.value);
  showLevelComplete.value = true;
}

// 添加下一关处理函数
function nextLevel() {
  showLevelComplete.value = false;
  clearInterval(timer.value);
  currentLevel.value++;
  initGame();
}

// 添加结束游戏函数
function endGame() {
  showLevelComplete.value = false;
  clearInterval(timer.value);
  clearInterval(previewTimer.value);
  usedImages.value.clear();
  currentLevel.value = 1;
  emit("end-game"); // 触发结束游戏事件
}

// 添加预览倒计时函数
function startPreviewCountdown() {
  // 清除可能存在的旧计时器
  if (previewTimer.value) {
    clearInterval(previewTimer.value);
  }

  // 等待预览模态框完全显示后再开始倒计时
  nextTick(() => {
    previewTimer.value = setInterval(() => {
      if (showPreview.value) { // 只在预览显示时进行倒计时
        previewCountdown.value--;

        if (previewCountdown.value <= 0) {
          // 倒计时结束
          clearInterval(previewTimer.value);
          showPreview.value = false;
          // 开始游戏计时
          startTimer();
        }
      }
    }, 1000);
  });
}
</script>

<style scoped>
.puzzle-game {
  height: 100%;
  width: 100%;
  max-width: 375px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.timer {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  padding: 10px;
  width: 100%;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  height: 10vh;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.puzzle-grid {
  margin: 0 auto;
  display: grid;
  gap: 1px;
  background: #ccc;
  padding: 1px;
  border-radius: 8px;
  overflow: hidden;
  width: 250px;
  height: 250px;
  /* 移除之前的响应式宽度设置 */
}

.grid-cell {
  aspect-ratio: 1;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s ease;
  cursor: move;
  user-select: none;
  -webkit-user-select: none;
}

.grid-cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.grid-cell.highlight {
  background: rgba(76, 175, 80, 0.1);
  border: 2px dashed #4caf50;
}

.grid-cell.piece-placed {
  animation: placePiece 0.3s ease;
}

.piece-slider {
  width: 95%;
  padding: 10px 0;
  background: #f5f5f5;
  border-radius: 8px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  margin: 20px auto 0 auto;
}

.slider-wrapper {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  margin: 0 5px;
  min-width: 0;
  /* 添加平滑滚动 */
  scroll-behavior: smooth;
  /* 添加滚动捕捉 */
  scroll-snap-type: x proximity;
  /* 优化触摸滚动 */
  -webkit-overflow-scrolling: touch;
}

.slider-content {
  display: flex;
  gap: 10px;
  padding: 0 5px;
  width: max-content;
  /* 添加过渡效果 */
  transition: all 0.3s ease-out;
}

.slider-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
  transition: all 0.3s ease;
  z-index: 2;
}

.slider-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.slider-btn:active {
  transform: scale(0.95);
}

.arrow {
  border: solid #333;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 4px;
}

.arrow.left {
  transform: rotate(135deg);
}

.arrow.right {
  transform: rotate(-45deg);
}

.puzzle-piece {
  flex: 0 0 50px;
  width: 50px;
  height: 50px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: opacity 0.3s;
  cursor: move;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  /* 添加滚动捕捉对齐 */
  scroll-snap-align: start;
  /* 添加过渡效果 */
  transition: all 0.3s ease;
}

.puzzle-piece img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.puzzle-piece:active img {
  transform: scale(1.1);
}

.puzzle-piece.placed {
  opacity: 0.5;
  pointer-events: none;
}

.puzzle-piece.dragging {
  opacity: 0.3;
}

.puzzle-piece:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

/* 隐藏滚动条但保持功能 */
.slider-wrapper::-webkit-scrollbar {
  display: none;
}

.slider-wrapper {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes placePiece {
  0% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

/* 添加滚动动画 */
@keyframes slideLeft {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-100%);
  }
}

@keyframes slideRight {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(100%);
  }
}

/* 优化滚动体验 */
@media (hover: none) {
  .slider-wrapper {
    scroll-snap-type: x mandatory;
  }
}

/* 确保滚动容器有正确的滚动行为 */
.slider-wrapper {
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth !important;
}

.slider-wrapper::-webkit-scrollbar {
  display: none;
}

.piece-swapped {
  animation: swapPieces 0.3s ease;
}

@keyframes swapPieces {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

/* 添加关卡信息样式 */
.level-info {
  text-align: center;
  font-size: 18px;
  color: #000;
  margin: 10px 0;
  height: max-content;
}
</style>
