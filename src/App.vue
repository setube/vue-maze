<template>
  <div class="maze">
    <div class="maze-box">
      <div class="maze-time" v-if="timing">
        <a-countdown :format="language('Countdown: mm:ss:SSS')" @finish="loading = true" :start="start" :key="now"
                     :value="countdownValue" :now="now"/>
      </div>
      <div class="maze-spin">
        <a-spin :loading="loading" hide-icon>
          <canvas ref="mazeCanvasRef"></canvas>
          <template #tip>
            <div class="loadingTip">
              <div class="text">
                {{
                  hasReachedEnd ? language('Congratulations! You have successfully completed the challenge!') : language('The countdown has ended!')
                }}
                {{ language('Do you want to restart the challenge?') }}
              </div>
              <div class="button">
                <a-button @click="loading = false">{{ language('No') }}</a-button>
                <a-button @click="timerEnds" type="primary">{{ language('Yes') }}</a-button>
              </div>
            </div>
          </template>
        </a-spin>
      </div>
      <div class="controls">
        <a-button class="controls-button" v-for="(item, index) in controls" :key="index" @click="move(item.type)">
          <span>{{ item.name }}</span>
          <span class="shortcutKeys">({{ item.key }})</span>
        </a-button>
      </div>
      <a-drawer :width="width" :title="language('Settings')" :ok-text="language('Yes')" :cancel-text="language('No')"
                :visible="show" @ok="saveSettings" @cancel="show = false">
        <a-form :model="$store.mazeSetUp" layout="vertical">
          <template v-for="item in formData" :key="item.field">
            <a-form-item :field="item.field" :label="item.label" :extra="item.extra">
              <template v-if="item.component === 'a-switch'">
                <a-switch v-model="$store.mazeSetUp[item.field]" type="round"/>
              </template>
              <template v-else-if="item.component === 'a-radio-group'">
                <a-radio-group v-model="$store.mazeSetUp[item.field]" type="button">
                  <a-radio v-for="option in item.options" :key="option.value" :value="option.value">{{
                      option.label
                    }}
                  </a-radio>
                </a-radio-group>
              </template>
              <template v-else-if="item.component === 'a-input-number'">
                <a-input-number v-model="$store.mazeSetUp[item.field]" mode="button" :min="item.props.min"
                                :max="item.props.max">
                  <template #suffix v-if="item.field === 'deadEnd'">%</template>
                </a-input-number>
              </template>
              <template v-else-if="item.component === 'a-textarea'">
                <a-textarea v-model="$store.mazeSetUp[item.field]"/>
              </template>
              <template v-else-if="item.component === 'a-color-picker'">
                <a-color-picker v-model="$store.mazeSetUp[item.field]" show-preset show-text/>
              </template>
            </a-form-item>
          </template>
        </a-form>
      </a-drawer>
    </div>
  </div>
</template>

<script setup>
import zh from '@/assets/zh-CN.json';
import {Message} from '@arco-design/web-vue';

import {ref, computed, onMounted, getCurrentInstance, nextTick} from 'vue';


// Reactive data
const now = ref(0);
const show = ref(false);
const maze = ref([]);
const width = ref('40%');
const start = ref(false);
const timing = ref(false);
const player = ref({x: 1, y: 1});
const loading = ref(false);
const hasReachedEnd = ref(false);
const countdownValue = ref(0);

const {proxy} = getCurrentInstance()

const mazeCanvasRef = ref(null)
const language = (text) => proxy.$store.mazeSetUp.language === 'zh-CN' ? zh[text] : text;
// Computed properties
const endPosition = computed(() => {
  const {rows, endLocation} = proxy.$store.mazeSetUp;
  const center = Math.floor(rows / 2);
  const endPoints = {
    center: {x: center, y: center},
    random: null,
    leftDown: {x: 1, y: rows - 2},
    rightTop: {x: rows - 2, y: 1},
    rightDown: {x: rows - 2, y: rows - 2}
  };

  // Random point logic
  if (endLocation === 'random') {
    const randomEnd = [
      endPoints.leftDown,
      endPoints.rightTop,
      endPoints.center,
      endPoints.rightDown
    ];
    endPoints.random = randomEnd[Math.floor(Math.random() * randomEnd.length)];
  }

  // Get end position
  const targetEnd = endPoints[endLocation];
  if (targetEnd) {
    const targetCell = maze.value.find(c => c.x === targetEnd.x && c.y === targetEnd.y);
    if (targetCell) {
      targetCell.wall = false;
      return targetEnd;
    }
  }
});

const controls = computed(() => [
  {key: 'Q', type: 'show', name: language('Settings')},
  {key: 'W', type: 'up', name: language('Up')},
  {key: 'R', type: 'refresh', name: language('Refresh')},
  {key: 'A', type: 'left', name: language('Left')},
  {key: 'S', type: 'down', name: language('Down')},
  {key: 'D', type: 'right', name: language('Right')}
])

const formData = computed(() => {
  const options = {
    algorithms: [
      {value: 'Maze', label: 'Maze'},
      {value: 'Generation', label: 'Generation'},
      {value: 'Algorithm', label: 'Algorithm'}
    ],
    language: [
      {value: 'zh-CN', label: '简体中文'},
      {value: 'en-US', label: 'English'}
    ],
    endLocations: [
      {value: 'rightTop', label: language('Right Top')},
      {value: 'leftDown', label: language('Left Down')},
      {value: 'center', label: language('Center')},
      {value: 'rightDown', label: language('Right Down')},
      {value: 'random', label: language('Random')}
    ]
  };
  return [
    {field: 'dark', label: language('Night Mode'), extra: '', component: 'a-switch'},
    {
      field: 'language',
      label: language('Language'),
      extra: '',
      options: options.language,
      component: 'a-radio-group'
    },
    {
      field: 'algorithm',
      label: language('Maze Generation Algorithm'),
      extra: '',
      options: options.algorithms,
      component: 'a-radio-group'
    },
    {
      field: 'rows',
      label: language('Maze Size'),
      extra: language('The maze size must be an odd number, and the larger the number, the larger the maze that will be generated.'),
      props: {min: 19},
      component: 'a-input-number'
    },
    {
      field: 'deadEnd',
      label: language('Percentage of Dead Ends'),
      extra: '',
      props: {max: 100, min: 10},
      component: 'a-input-number'
    },
    {
      field: 'endLocation',
      label: language('Location of the Endpoint'),
      extra: '',
      options: options.endLocations,
      component: 'a-radio-group'
    },
    {field: 'timing', label: language('Countdown Challenge'), extra: '', component: 'a-switch'},
    {
      field: 'time',
      label: language('Countdown Timer Limit'),
      extra: '',
      props: {min: 1, placeholder: ''},
      component: 'a-input-number'
    },
    {
      field: 'player',
      label: language('Player Icon'),
      extra: language('Supports Filling in HTML Tags'),
      component: 'a-textarea'
    },
    {
      field: 'end',
      label: language('Endpoint Icon'),
      extra: language('Supports Filling in HTML Tags'),
      component: 'a-textarea'
    },
    {
      field: 'arrival',
      label: language('Icon for Reaching the Endpoint'),
      extra: language('Supports Filling in HTML Tags'),
      component: 'a-textarea'
    },
    {
      field: 'wallColor',
      label: language('Wall Color'),
      extra: '',
      props: {showPreset: true, showText: true},
      component: 'a-color-picker'
    },
    {
      field: 'pathColor',
      label: language('Path Color'),
      extra: '',
      props: {showPreset: true, showText: true},
      component: 'a-color-picker'
    }
  ];
})

const checkPathExists = computed(() => {
  const end = endPosition.value;
  const rows = proxy.$store.mazeSetUp.rows;
  const queue = [{x: 1, y: 1}];
  const visited = new Set();
  const directions = coordinateArray(1);
  while (queue.length > 0) {
    const current = queue.shift();
    if (current.x === end.x && current.y === end.y) return true;
    visited.add(`${current.x}, ${current.y}`);
    directions.forEach(dir => {
      const neighbor = {x: current.x + dir.x, y: current.y + dir.y};
      // 检查坐标是否在迷宫范围内
      const isInBounds = neighbor.x >= 0 && neighbor.x < rows && neighbor.y >= 0 && neighbor.y < rows;
      if (isInBounds && !maze.value.find(c => c.x === neighbor.x && c.y === neighbor.y).wall && !visited.has(`${neighbor.x}, ${neighbor.y}`)) queue.push(neighbor);
    });
  }
  return false;
})

onMounted(() => {
  generateMaze();
  renderingInitialization(window.innerWidth);
  // 监听键盘
  window.addEventListener('keydown', move);
})


// 打开计时结束弹窗
function timerEnds() {
  // 重置倒计时
  now.value = 0;
  countdownValue.value = 0;
  // 关闭加载
  loading.value = false;
  // 重置玩家位置
  player.value = {x: 1, y: 1};
  // 初始化迷宫数据
  generateMaze();
}

// 渲染初始化
function renderingInitialization(width) {
  const oldRows = proxy.$store.mazeSetUp.rows;
  const rows = width > 750 ? oldRows : 25;
  width = width > 750 ? '40%' : '100%';
  proxy.$store.mazeSetUp.rows = rows;
  // 初始化迷宫
  generateMaze();
}

// 保存设置
function saveSettings() {
  // 初始化迷宫数据
  generateMaze();
  // 关闭弹窗
  show.value = false;
  // 发送通知
  Message.success(language('Settings Saved'));
}

// 初始化迷宫
function generateMaze() {
  const {time, rows, dark, start, timing, algorithm} = proxy.$store.mazeSetUp;
  // 计时开始时间
  now.value = Date.now();
  // 是否开始倒计时
  proxy.$store.setMazeSetUp({start: timing});
  proxy.$store.setMazeSetUp({timing: timing});
  // 重置玩家位置
  player.value = {x: 1, y: 1};
  // 重置胜利状态
  hasReachedEnd.value = false;
  // 重置倒计时
  countdownValue.value = now.value + 1000 * 60 * proxy.$store.time;
  // 修改墙壁颜色和路径颜色
  nextTick(() => {
    const body = document.body;
    // 是否开启夜间模式
    if (dark) body.setAttribute('arco-theme', 'dark');
    else body.removeAttribute('arco-theme');
  });
  // 初始化迷宫
  maze.value = Array(rows * rows).fill().map((_, i) => ({
    x: i % rows,
    // 计算y坐标
    y: Math.floor(i / rows),
    // 默认每个坐标都是墙
    wall: true
  }));
  // 迷宫算法
  if (algorithm === 'Maze') carveMaze(1, 1); // Maze算法
  else if (algorithm === 'Generation') Generation(); // Generation算法
  else if (algorithm === 'Algorithm') Algorithm(1, 1); // Algorithm算法
  // 确保起点和终点不是墙
  maze.value.find(c => c.x === 1 && c.y === 1).wall = false;
  maze.value.find(c => c.x === endPosition.value.x && c.y === endPosition.value.y).wall = false;
  // 创建死胡同
  createDeadEnds();
  // 在确保起点和终点不是墙后
  if (!checkPathExists) generateMaze();
  drawMaze();
}


// 绘制Canvas迷宫地图
function drawMaze() {
  const canvas = mazeCanvasRef.value;
  const ctx = canvas.getContext('2d');
  const cellSize = 15; // 每个单元格的大小
  const {end, rows, player: playerState, arrival, wallColor, pathColor} = proxy.$store.mazeSetUp;
  // 设置 Canvas 尺寸
  canvas.width = rows * cellSize;
  canvas.height = rows * cellSize;

  // 道路
  ctx.fillStyle = pathColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  maze.value.forEach(cell => {
    if (!(cell.x === 1 && cell.y === rows) && cell.wall) {
      ctx.fillStyle = wallColor;
      ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
    }
  });

  // 单独处理 x 为 1 且 y 为 row 的元素
  const specialCell = maze.value[rows - 1][0];
  if (specialCell) {
    ctx.fillStyle = specialColor;
    ctx.fillRect(specialCell.x * cellSize, specialCell.y * cellSize, cellSize, cellSize);
  }

  const TEXT_OFFSET_X = cellSize / 4;
  const TEXT_OFFSET_Y = (cellSize * 3) / 4;
  // 绘制终点图标

  const endCell = maze.value.find(cell => cell.x === endPosition.value.x && cell.y === endPosition.value.y);
  if (endCell && !hasReachedEnd.value) ctx.fillText(end, endCell.x * cellSize + TEXT_OFFSET_X, endCell.y * cellSize + TEXT_OFFSET_Y);
  // 绘制玩家图标
  const playerCell = maze.value.find(cell => cell.x === player.value.x && cell.y === player.value.y);
  if (playerCell) ctx.fillText(playerState, playerCell.x * cellSize + TEXT_OFFSET_X, playerCell.y * cellSize + TEXT_OFFSET_Y);
  // 如果玩家抵达终点，绘制到达图标
  if (hasReachedEnd.value) ctx.fillText(arrival, playerCell.x * cellSize + TEXT_OFFSET_X, playerCell.y * cellSize + TEXT_OFFSET_Y);
}


// Algorithm算法
function Algorithm(x, y) {
  const directions = coordinateArray(2);
  // 随机打乱方向顺序
  directions.sort(() => Math.random() - 0.5);
  directions.forEach(dir => {
    const nx = x + dir.x;
    const ny = y + dir.y;
    const rows = proxy.$store.mazeSetUp.rows;
    // 检查新位置是否在迷宫范围内且是墙
    if (nx > 0 && nx < rows - 1 && ny > 0 && ny < rows - 1) {
      const neighbor = maze.value.find(c => c.x === nx && c.y === ny);
      // 只有当相邻是墙时才进行处理
      if (neighbor && neighbor.wall) {
        // 移除当前与相邻坐标之间的墙壁
        const wallX = x + dir.x / 2; // 计算墙的x坐标
        const wallY = y + dir.y / 2; // 计算墙的y坐标
        maze.value.find(c => c.x === wallX && c.y === wallY).wall = false;
        // 将相邻坐标设为路径
        neighbor.wall = false;
        // 递归挖掘新的路径
        Algorithm(nx, ny);
      }
    }
  });
}


// Generation算法
function Generation() {
  // 初始化边集合
  const edges = [];
  const parent = {};
  const rows = proxy.$store.mazeSetUp.rows;
  // 生成所有边
  for (let x = 1; x < rows; x += 2) {
    for (let y = 1; y < rows; y += 2) {
      if (x < rows - 2) edges.push({from: {x, y}, to: {x: x + 2, y}});
      if (y < rows - 2) edges.push({from: {x, y}, to: {x, y: y + 2}});
    }
  }
  // 随机打乱边
  edges.sort(() => Math.random() - 0.5);
  // 初始化并查集
  edges.forEach(edge => {
    const fromKey = `${edge.from.x},${edge.from.y}`;
    const toKey = `${edge.to.x},${edge.to.y}`;
    parent[fromKey] = fromKey;
    parent[toKey] = toKey;
  });
  const find = (key) => {
    if (parent[key] !== key) parent[key] = find(parent[key]);
    return parent[key];
  };
  const union = (key1, key2) => {
    const root1 = find(key1);
    const root2 = find(key2);
    if (root1 !== root2) {
      parent[root1] = root2;
      return true;
    }
    return false;
  };
  // 构建迷宫
  edges.forEach(edge => {
    const fromKey = `${edge.from.x},${edge.from.y}`;
    const toKey = `${edge.to.x},${edge.to.y}`;
    if (union(fromKey, toKey)) {
      // 移除墙壁
      maze.value.find(c => c.x === edge.from.x && c.y === edge.from.y).wall = false;
      maze.value.find(c => c.x === edge.to.x && c.y === edge.to.y).wall = false;
      // 移除墙壁的中间墙
      const wallX = (edge.from.x + edge.to.x) / 2;
      const wallY = (edge.from.y + edge.to.y) / 2;
      maze.value.find(c => c.x === wallX && c.y === wallY).wall = false;
    }
  });
}


// Maze算法
function carveMaze(x, y) {
  // 标记当前单元为路径
  const currentCell = maze.value.find(c => c.x === x && c.y === y);
  if (currentCell) currentCell.wall = false;
  // 随机获取方向
  const directions = coordinateArray(2);
  directions.sort(() => Math.random() - 0.5);
  directions.forEach(dir => {
    const nx = x + dir.x;
    const ny = y + dir.y;
    const rows = proxy.$store.mazeSetUp.rows;
    // 检查新的坐标是否在范围内且是墙
    if (nx > 0 && nx < rows - 1 && ny > 0 && ny < rows - 1) {
      const neighbor = maze.value.find(c => c.x === nx && c.y === ny);
      if (neighbor && neighbor.wall) {
        // 移除墙壁
        const wallX = x + dir.x / 2;
        const wallY = y + dir.y / 2;
        const wallCell = maze.value.find(c => c.x === wallX && c.y === wallY);
        if (wallCell) wallCell.wall = false;
        // 递归
        carveMaze(nx, ny);
      }
    }
  })
}


// 创建死胡同的函数
function createDeadEnds() {
  // 获取所有路径坐标
  const paths = maze.value.filter(cell => !cell.wall);
  // 死胡同数量占比
  const deadEndCount = Math.floor(paths.length * (proxy.$store.mazeSetUp.deadEnd / 100));
  for (let i = 0; i < deadEndCount; i++) {
    // 随机选择一条路径
    const randomPath = paths[Math.floor(Math.random() * paths.length)];
    const neighbors = getNeighbors(randomPath).filter(neighbor => !neighbor.wall);
    // 如果该路径的相邻只有一个且不是起点或终点，则将该路径变为墙
    if (neighbors.length === 1 && !(randomPath.x === 1 && randomPath.y === 1) && !(randomPath.x === endPosition.value.x && randomPath.y === endPosition.value.y)) {
      maze.value.find(c => c.x === randomPath.x && c.y === randomPath.y).wall = true;
    }
  }
}


// 玩家移动的函数
function move(direction) {
  // 获取玩家当前坐标
  const {x, y} = player.value;
  const isEnd = hasReachedEnd.value;
  // 新的坐标初始化为当前坐标
  let newX = x, newY = y;
  // 获取移动方向
  direction = typeof direction === 'string' ? direction : direction.key;
  const rows = proxy.$store.mazeSetUp.rows;
  switch (direction) {
      // 向上移动
    case 'w':
    case 'up':
    case 'ArrowUp':
      if (y > 0 && !isEnd) newY--;
      break;
      // 向下移动
    case 's':
    case 'down':
    case 'ArrowDown':
      if (y < rows - 1 && !isEnd) newY++;
      break;
      // 向左移动
    case 'a':
    case 'left':
    case 'ArrowLeft':
      if (x > 0 && !isEnd) newX--;
      break;
      // 向右移动
    case 'd':
    case 'right':
    case 'ArrowRight':
      if (x < rows - 1 && !isEnd) newX++;
      break;
      // 打开设置
    case 'q':
    case 'show':
      show.value = !show.value;
      return;
      // 刷新迷宫
    case 'r':
    case 'refresh':
      // 初始化
      generateMaze();
      // 发送通知
      Message.success(language('Refresh Successful'));
      return;
    default:
      return;
  }
  // 查找目标坐标
  const targetCell = maze.value.find(cell => cell.x === newX && cell.y === newY);
  // 如果目标坐标不是墙
  if (!targetCell.wall) {
    // 更新玩家的x坐标
    player.value.x = newX;
    // 更新玩家的y坐标
    player.value.y = newY;
    // 检查是否到达终点
    hasReachedEnd.value = player.value.x === endPosition.value.x && player.value.y === endPosition.value.y;
    drawMaze()
    // 如果到达终点并且计时没有结束
    if (hasReachedEnd.value && !loading.value) {
      // 停止计时
      start.value = false;
      // 打开加载遮罩
      loading.value = true;
    }
  }
}


// 获取相邻坐标的函数
function getNeighbors(cell) {
  const directions = coordinateArray(1);
  // 用于存储相邻坐标的数组
  const neighbors = [];
  directions.forEach(dir => {
    // 新的x坐标
    const newX = cell.x + dir.x;
    // 新的y坐标
    const newY = cell.y + dir.y;
    const rows = proxy.$store.mazeSetUp.rows;
    // 检查新坐标是否在迷宫范围内
    if (newX >= 0 && newX < rows && newY >= 0 && newY < rows) {
      // 查找相邻
      const neighbor = maze.value.find(c => c.x === newX && c.y === newY);
      // 如果相邻不是墙，则加入相邻数组
      if (!neighbor.wall) neighbors.push(neighbor);
    }
  });
  // 返回相邻数组
  return neighbors;
}


// 坐标数组
function coordinateArray(num) {
  return [
    // 上
    {x: 0, y: -num},
    // 下
    {x: 0, y: num},
    // 左
    {x: -num, y: 0},
    // 右
    {x: num, y: 0}
  ];
}
</script>

<style scoped>
.maze {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.maze-time {
  display: flex;
  justify-content: center;
  text-align: center;
  margin-bottom: 10px;
}

.maze-spin {
  display: flex;
  justify-content: center;
}

.loadingTip .text {
  color: var(--color-white);
  margin-bottom: 10px;
}

.loadingTip .button button {
  margin-right: 10px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
}

.controls-button {
  font-size: 16px;
  margin: 0 5px 10px 0;
  width: calc(33.333% - 4px);
}

.controls-button:nth-child(3),
.controls-button:nth-child(6) {
  margin-right: 0;
}

.shortcutKeys {
  color: rgba(169, 169, 169, 0.4);
  margin-left: 2px;
}

@media only screen and (max-width: 750px) {
  .shortcutKeys {
    display: none;
  }
}
</style>

<style>
html {
  user-select: none;
}

body {
  background-color: var(--color-bg-1);
  --color-spin-layer-bg: var(--color-mask-bg);
}

/* 倒计时文字大小 */
.arco-statistic-content .arco-statistic-value {
  font-size: 20px;
}
</style>
