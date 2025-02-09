<template>
  <div class="page flex flex-col items-center justify-center min-h-screen">
    <audio ref="bgm" src="/balabala/src/assets/bgm-music.mp3" loop></audio>
    <div class="title">Look who found this game 👀? Go play it!</div>
    <div v-if="!gameStarted" @click="startGame" class="start-button">
      Start Game
    </div>
    <div v-else class="canvas">
      <canvas
        ref="gameCanvas"
        width="400"
        height="400"
        class="border-4 border-gray-800"
      ></canvas>

      <!-- 游戏胜利 Modal -->
      <Modal
        class="modal"
        v-model:visible="showWinModal"
        title="Happy birthday Yumika!"
        centered
        @ok="handleOk"
        :footer="[
          h(
            'button',
            {
              type: 'primary',
              class: 'heart-button',
              onClick: handleOk,
            },
            '❤️'
          ),
        ]"
        :closable="false"
        :maskClosable="false"
      >
        <p>
          25 is a big milestone, congrats on all the 🍰s you’ve eaten to get
          here! JK, starting PhD is a huge step, and we are more than proud of
          you. Watching you follow your passion and work so hard toward your
          dreams has been truly inspiring. And we know you’ll do even more
          amazing things.
          <br />
          <br />
          That being said, we hope you remember to take care of yourself along
          the way. Don’t burn out, we need you to be happy AND healthy (cardio)!
          We love you sooooooo much, and we feel so lucky to be your friends.
          We’ll be right here cheering you on for the many years to come.
          <br />
          <br />
          So, here’s to you, an incredible friend, a 🦜 lover with the biggest
          heart, and a truly wonderful human being we love deeply. Wishing you
          the most amazing year ahead!
          <br />
          <br />
          With love,
          <br />
          Grace (welcomes you to the club) &
          <br />
          Isabel (24 but still cool)
        </p>
      </Modal>

      <!-- 游戏失败 Modal -->
      <Modal
        v-model:visible="showFailModal"
        title="Game Over!"
        centered
        @ok="handleRestart"
        :footer="[
          h(
            'button',
            {
              type: 'primary',
              class: 'ok-button',
              onClick: handleRestart,
            },
            'Try Again'
          ),
        ]"
        :closable="false"
        :maskClosable="false"
      >
        <p>Oops! You hit yourself!</p>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, h } from "vue";
import { Modal } from "ant-design-vue";
import cakeImageSrc from "@/assets/cake-icon.png"; // 引入食物图片

const gameStarted = ref<boolean>(false);
const gameCanvas = ref<HTMLCanvasElement | null>(null);
const showWinModal = ref<boolean>(false); // 胜利提示 Modal
const showFailModal = ref<boolean>(false); // 失败提示 Modal
const bgm = ref<HTMLAudioElement | null>(null);

let ctx: CanvasRenderingContext2D | null;
let snake: { x: number; y: number }[];
let food: { x: number; y: number };
let direction: { x: number; y: number };
let score: number;
let gameInterval: number;
const gameSpeed: number = 300; // 调整速度，数值越大速度越慢

// 蛇的颜色数组，循环使用
const snakeColors = ["#F7CFD8", "#F4F8D3", "#A6F1E0", "#73C7C7"];

// 初始化食物图片
const foodImage = new Image();
foodImage.src = cakeImageSrc;

const startGame = async (): Promise<void> => {
  gameStarted.value = true;
  bgm.value.volume = 0.3;
  bgm.value
    ?.play()
    .catch((err) => console.error("Audio play was prevented:", err));
  await nextTick();
  initializeGame();
};

const handleOk = () => {
  showWinModal.value = false;
  restartGame();
};

const handleRestart = () => {
  showFailModal.value = false;
  restartGame();
};

const restartGame = async (): Promise<void> => {
  await nextTick();
  initializeGame();
};

const initializeGame = (): void => {
  ctx = gameCanvas.value?.getContext("2d") || null;
  if (!ctx) {
    console.error("Canvas context could not be retrieved.");
    return;
  }

  // 获取设备像素比
  const dpr = window.devicePixelRatio || 1;

  // 设置 Canvas 宽高为设备像素比的倍数，确保高分辨率清晰度
  gameCanvas.value.width = 400 * dpr;
  gameCanvas.value.height = 400 * dpr;

  // 使用 CSS 保持显示尺寸不变
  gameCanvas.value.style.width = "400px";
  gameCanvas.value.style.height = "400px";

  // 将 Canvas 上下文缩放，以匹配设备像素比

  ctx.scale(dpr, dpr);
  snake = [{ x: 10, y: 10 }];
  food = getRandomPosition();
  direction = { x: 1, y: 0 };
  score = 0;

  document.addEventListener("keydown", changeDirection);

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(updateGame, gameSpeed);
};

const getRandomPosition = (): { x: number; y: number } => {
  const gridSize = 20;
  return {
    x: Math.floor(Math.random() * (400 / gridSize)),
    y: Math.floor(Math.random() * (400 / gridSize)),
  };
};

const changeDirection = (e: KeyboardEvent): void => {
  switch (e.key) {
    case "ArrowUp":
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
  }
};

const updateGame = (): void => {
  let head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Wrap around logic
  if (head.x < 0) head.x = 19;
  if (head.y < 0) head.y = 19;
  if (head.x >= 20) head.x = 0;
  if (head.y >= 20) head.y = 0;

  // 检测是否撞到自己
  if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    clearInterval(gameInterval);
    showFailModal.value = true; // 显示失败模态框
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    food = getRandomPosition();
    if (score === 25) {
      clearInterval(gameInterval); // 暂停游戏
      showWinModal.value = true; // 显示胜利模态框
    }
  } else {
    snake.pop();
  }

  drawGame();
};

const drawGame = (): void => {
  if (!ctx) return;

  ctx.clearRect(0, 0, 400, 400);

  // 绘制蛇，颜色循环
  snake.forEach((segment, index) => {
    ctx.fillStyle = snakeColors[index % snakeColors.length]; // 根据索引循环颜色
    ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);

    // 绘制蛇头眼睛
    if (index === 0) {
      drawEyes(segment);
    }
  });

  drawFood(); // 绘制食物
};

// 绘制蛇头的眼睛
const drawEyes = (head: { x: number; y: number }): void => {
  if (!ctx) return;

  ctx.fillStyle = "white"; // 眼睛颜色
  const size = 4; // 眼睛大小
  let eye1X, eye1Y, eye2X, eye2Y;

  if (direction.x === 1) {
    // 向右移动
    eye1X = head.x * 20 + 14;
    eye1Y = head.y * 20 + 4;
    eye2X = head.x * 20 + 14;
    eye2Y = head.y * 20 + 14;
  } else if (direction.x === -1) {
    // 向左移动
    eye1X = head.x * 20 + 4;
    eye1Y = head.y * 20 + 4;
    eye2X = head.x * 20 + 4;
    eye2Y = head.y * 20 + 14;
  } else if (direction.y === 1) {
    // 向下移动
    eye1X = head.x * 20 + 4;
    eye1Y = head.y * 20 + 14;
    eye2X = head.x * 20 + 15;
    eye2Y = head.y * 20 + 14;
  } else {
    // 向上移动
    eye1X = head.x * 20 + 5;
    eye1Y = head.y * 20 + 4;
    eye2X = head.x * 20 + 15;
    eye2Y = head.y * 20 + 4;
  }

  ctx.beginPath();
  ctx.arc(eye1X, eye1Y, size / 2, 0, Math.PI * 2);
  ctx.arc(eye2X, eye2Y, size / 2, 0, Math.PI * 2);
  ctx.fill();
};

const drawFood = (): void => {
  if (!ctx) return;

  ctx.drawImage(foodImage, food.x * 20, food.y * 20, 20, 20);
};
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: rgb(212, 241, 255);
}

.page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 30px;
  margin-bottom: 70px;
}

.start-button {
  font-size: 20px;
  padding: 4px 30px;
  background-color: rgb(183, 231, 255);
  border-radius: 20px;
  cursor: pointer;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 4px 8px 0px;
  transition: all 0.3s ease;
  user-select: none;
  position: relative;
  overflow: hidden;
}

/* Hover 动画效果 */
.start-button:hover {
  background-color: rgb(156, 212, 240);
  transform: scale(1.05);
  box-shadow: rgba(99, 99, 99, 0.3) 0px 6px 12px 0px;
}

/* 按下去的动画效果 */
.start-button:active {
  background-color: rgb(136, 192, 220);
  transform: scale(0.95);
  box-shadow: rgba(99, 99, 99, 0.1) 0px 2px 4px 0px;
}

.canvas {
  border: 2px solid rgb(156, 197, 219);
  border-radius: 10px;
}

.ok-button {
  color: rgb(21, 118, 167);
  font-size: 16px;
  padding: 4px 30px;
  border: transparent;
  background-color: rgb(183, 231, 255);
  border-radius: 10px;
  cursor: pointer;
}

.heart-button {
  color: rgb(21, 118, 167);
  font-size: 16px;
  padding: 4px 10px;
  border: transparent;
  background-color: rgb(255, 222, 238);
  border-radius: 10px;
  cursor: pointer;
}
</style>
