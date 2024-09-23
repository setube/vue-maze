<template>
    <div class="maze">
        <div class="maze-box">
            <div class="maze-time" v-if="timing">
                <a-countdown format="倒计时: mm:ss:SSS" @finish="loading = true" :start="start" :key="now" :value="countdownValue" :now="now" />
            </div>
            <a-spin :loading="loading" hide-icon>
                <div class="maze-container" :style="{ gridTemplateColumns: `repeat(${rows}, 10px)` }">
                    <div v-for="(cell, index) in maze" :key="index" :class="getCellClass(cell)">
                        <span v-if="player.x === cell.x && player.y === cell.y && !hasReachedEnd" v-html="mazeSetUp.player" />
                        <span v-if="end.x === cell.x && end.y === cell.y && !hasReachedEnd" v-html="mazeSetUp.end" />
                        <span v-if="hasReachedEnd && end.x === cell.x && end.y === cell.y" v-html="mazeSetUp.arrival" />
                    </div>
                </div>
                <template #tip>
                    <div class="loadingTip">
                        <div class="text">
                            {{ hasReachedEnd ? '恭喜你挑战成功!' :'倒计时结束!'}} 是否重新开始挑战?
                        </div>
                        <div class="button">
                            <a-button @click="loading = false">取消</a-button>
                            <a-button @click="timerEnds" type="primary">确定</a-button>
                        </div>
                    </div>
                </template>
            </a-spin>
            <div class="controls">
                <a-button @click="move('up')">上<span class="shortcutKeys">(W)</span></a-button>
                <a-button @click="move('down')">下<span class="shortcutKeys">(S)</span></a-button>
                <a-button @click="move('left')">左<span class="shortcutKeys">(A)</span></a-button>
                <a-button @click="move('right')">右<span class="shortcutKeys">(D)</span></a-button>
                <a-button @click="show = true">设置</a-button>
            </div>
            <a-drawer :width="width" title="迷宫设置" :visible="show" @ok="saveSettings" @cancel="show = false" unmountOnClose>
                <a-form :model="mazeSetUp" layout="vertical">
                    <a-form-item field="dark" label="夜间模式" extra="是否开启夜间模式">
                        <a-switch v-model="mazeSetUp.dark" type="round" />
                    </a-form-item>
                    <a-form-item field="rows" label="迷宫大小" extra="迷宫大小必须为单数, 数字越大生成的迷宫就越大">
                        <a-input-number v-model="mazeSetUp.rows" placeholder="迷宫大小" />
                    </a-form-item>
                    <a-form-item field="deadEnd" label="死胡同数量占比" extra="填写百分比">
                        <a-input-number v-model="mazeSetUp.deadEnd" :max="100" :min="10" placeholder="死胡同数量占比" />
                    </a-form-item>
                    <a-form-item field="endLocation" label="终点位置" extra="终点位置默认为中间">
                        <a-radio-group v-model="mazeSetUp.endLocation" type="button">
                            <a-radio value="rightTop">右上角</a-radio>
                            <a-radio value="leftDown">左下角</a-radio>
                            <a-radio value="center">中间</a-radio>
                            <a-radio value="rightDown">右下角</a-radio>
                            <a-radio value="random">随机</a-radio>
                        </a-radio-group>
                    </a-form-item>
                    <a-form-item field="player" label="计时挑战" extra="是否开启计时挑战">
                        <a-switch v-model="mazeSetUp.timing" type="round" />
                    </a-form-item>
                    <a-form-item field="player" label="计时时限" extra="最少1分钟">
                        <a-input-number v-model="mazeSetUp.time" :min="1" placeholder="最少1分钟" />
                    </a-form-item>
                    <a-form-item field="player" label="玩家图标" extra="支持填写HTML标签">
                        <a-textarea v-model="mazeSetUp.player" placeholder="玩家图标" />
                    </a-form-item>
                    <a-form-item field="end" label="终点图标" extra="支持填写HTML标签">
                        <a-textarea v-model="mazeSetUp.end" placeholder="终点图标" />
                    </a-form-item>
                    <a-form-item field="arrival" label="抵达终点图标" extra="支持填写HTML标签">
                        <a-textarea v-model="mazeSetUp.arrival" placeholder="抵达终点图标" />
                    </a-form-item>
                    <a-form-item field="wallColor" label="墙壁颜色" extra="支持选择16进制和RGB颜色代码">
                        <a-color-picker v-model="mazeSetUp.wallColor" show-preset show-history showText />
                    </a-form-item>
                    <a-form-item field="pathColor" label="路径颜色" extra="支持选择16进制和RGB颜色代码">
                        <a-color-picker v-model="mazeSetUp.pathColor" show-preset show-history showText />
                    </a-form-item>
                </a-form>
            </a-drawer>
        </div>
    </div>
</template>

<script>
    import { Message } from '@arco-design/web-vue';

    export default {
        data () {
            return {
                // 当前时间
                now: 0,
                // 计时时限
                time: 1,
                // 设置弹窗
                show: false,
                // 迷宫的行数
                rows: 41,
                // 存储迷宫的结构数据
                maze: [],
                // 弹窗宽度
                width: '40%',
                // 开始倒计时
                start: false,
                // 计时挑战开关
                timing: false,
                // 玩家初始位置
                player: { x: 1, y: 1 },
                // 加载
                loading: false,
                // 地图设置
                mazeSetUp: {
                    // 终点图标
                    end: '🚩',
                    // 夜间模式开关
                    dark: false,
                    // 计时时限
                    time: 1,
                    // 迷宫的行数
                    rows: 41,
                    // 计时挑战开关
                    timing: false,
                    // 玩家图标
                    player: '😃',
                    // 抵达终点图标
                    arrival: '🥰',
                    // 死胡同数量
                    deadEnd: 20,
                    // 墙壁颜色
                    wallColor: '#333333',
                    // 路径颜色
                    pathColor: '#EEEEEE',
                    // 终点位置
                    endLocation: 'center'
                },
                // 终点位置
                endLocation: 'center',
                // 是否已经到终点
                hasReachedEnd: false,
                // 倒计时显示的值
                countdownValue: 0
            };
        },
        computed: {
            // 迷宫的终点坐标
            end () {
                const rows = this.rows;
                const center = Math.floor(rows / 2);
                const endLocation = this.endLocation;
                const endPoints = {
                    center: { x: center, y: center },
                    random: null,
                    leftDown: { x: 1, y: rows - 2 },
                    rightTop: { x: rows - 2, y: 1 },
                    rightDown: { x: rows - 2, y: rows - 2 }
                };
                // 随机点的逻辑
                if (endLocation === 'random') {
                    const randomEnd = [
                        endPoints.leftDown,
                        endPoints.rightTop,
                        endPoints.center,
                        endPoints.rightDown
                    ];
                    endPoints.random = randomEnd[Math.floor(Math.random() * randomEnd.length)];
                }
                // 获取终点位置
                const targetEnd = endPoints[endLocation];
                if (targetEnd) {
                    const targetCell = this.maze.find(c => c.x === targetEnd.x && c.y === targetEnd.y);
                    if (targetCell) {
                        targetCell.wall = false;
                        return targetEnd;
                    }
                }
            }
        },
        mounted () {
            // 初始化迷宫
            this.generateMaze();
            // 渲染初始化
            this.renderingInitialization(window.innerWidth);
            // 监听键盘
            window.addEventListener('keydown', this.move);
            // 监听网页宽度
            window.addEventListener('resize', (val) => this.renderingInitialization(val.target.innerWidth));
        },
        methods: {
            // 打开计时结束弹窗
            timerEnds () {
                // 重置倒计时
                this.now = 0;
                this.countdownValue = 0;
                // 关闭加载
                this.loading = false;
                // 重置玩家位置
                this.player = { x: 1, y: 1 };
                // 初始化迷宫数据
                this.generateMaze();
            },
            // 渲染初始化
            renderingInitialization (width) {
                const rows = width > 750 ? 41 : 25;
                this.rows = rows;
                this.width = width > 750 ? '40%' : '100%';
                this.mazeSetUp.rows = rows;
                // 初始化迷宫
                this.generateMaze();
            },
            // 保存设置
            saveSettings () {
                // 初始化迷宫数据
                this.generateMaze();
                // 关闭弹窗
                this.show = false;
                // 发送通知
                Message.success('地图数据设置成功');
            },
            // 初始化迷宫
            generateMaze () {
                const { time, rows, dark, start, timing, wallColor, pathColor, endLocation } = this.mazeSetUp;
                // 计时开始时间
                this.now = Date.now();
                // 计时时限
                this.time = time;
                // 修改迷宫大小
                this.rows = rows;
                // 是否开始倒计时
                this.start = timing;
                // 计时挑战开关
                this.timing = timing;
                // 修改重点位置
                this.endLocation = endLocation;
                // 重置倒计时
                this.countdownValue = this.now + 1000 * 60 * this.time;
                // 修改墙壁颜色和路径颜色
                this.$nextTick(() => {
                    const body = document.body;
                    const style = document.documentElement.style;
                    style.setProperty('--wallColor', wallColor);
                    style.setProperty('--pathColor', pathColor);
                    // 是否开启夜间模式
                    if (dark) body.setAttribute('arco-theme', 'dark');
                    else body.removeAttribute('arco-theme');
                });
                // 初始化迷宫
                this.maze = Array(this.rows * this.rows).fill().map((_, i) => ({
                    // 计算x坐标
                    x: i % this.rows,
                    // 计算y坐标
                    y: Math.floor(i / this.rows),
                    // 默认每个坐标都是墙
                    wall: true
                }));
                // 定义起点的x坐标
                const startX = 1;
                // 定义起点的y坐标
                const startY = 1;
                // 挖掘迷宫路径
                this.carveMaze(startX, startY);
                // 确保起点和终点不是墙
                this.maze.find(c => c.x === startX && c.y === startY).wall = false;
                this.maze.find(c => c.x === this.end.x && c.y === this.end.y).wall = false;
                // 创建死胡同
                this.createDeadEnds();
            },
            // 挖掘迷宫的路径
            carveMaze (x, y) {
                const directions = this.coordinateArray(2);
                // 随机打乱方向顺序
                directions.sort(() => Math.random() - 0.5);
                directions.forEach(dir => {
                    // 计算新的x坐标
                    const nx = x + dir.x;
                    // 计算新的y坐标
                    const ny = y + dir.y;
                    // 检查新位置是否在迷宫范围内且是墙
                    if (nx > 0 && nx < this.rows - 1 && ny > 0 && ny < this.rows - 1) {
                        const neighbor = this.maze.find(c => c.x === nx && c.y === ny);
                        // 只有当相邻是墙时才进行处理
                        if (neighbor && neighbor.wall) {
                            // 移除相邻与当前坐标之间的墙壁
                            const wallX = x + dir.x / 2; // 计算墙的x坐标
                            const wallY = y + dir.y / 2; // 计算墙的y坐标
                            const wallCell = this.maze.find(c => c.x === wallX && c.y === wallY);
                            // 移除墙壁
                            if (wallCell) wallCell.wall = false;
                            // 移除相邻的墙壁
                            neighbor.wall = false;
                            // 递归挖掘新的路径
                            this.carveMaze(nx, ny);
                        }
                    }
                });
            },
            // 创建死胡同的函数
            createDeadEnds () {
                // 获取所有路径坐标
                const paths = this.maze.filter(cell => !cell.wall);
                // 死胡同数量占比
                const deadEndCount = Math.floor(paths.length * (this.mazeSetUp.deadEnd / 100));
                for (let i = 0; i < deadEndCount; i++) {
                    // 随机选择一条路径
                    const randomPath = paths[Math.floor(Math.random() * paths.length)];
                    const neighbors = this.getNeighbors(randomPath).filter(neighbor => !neighbor.wall);
                    // 如果该路径的相邻只有一个，则将该路径变为墙
                    if (neighbors.length === 1) this.maze.find(c => c.x === randomPath.x && c.y === randomPath.y).wall = true;
                }
            },
            // 获取坐标样式的函数
            getCellClass (cell) {
                return {
                    // 每个坐标都包含cell类
                    cell: true,
                    // 如果是墙，则包含wall类
                    wall: cell.wall,
                    // 如果不是墙，则包含path类
                    path: !cell.wall
                };
            },
            // 玩家移动的函数
            move (direction) {
                // 获取玩家当前坐标
                const { x, y } = this.player;
                // 新的坐标初始化为当前坐标
                let newX = x, newY = y;
                // 获取移动方向
                direction = typeof direction === 'string' ? direction : direction.key;
                switch (direction) {
                    case 'w':
                    case 'up':
                    case 'ArrowUp':
                        // 向上移动
                        if (y > 0) newY--;
                        break;
                    case 's':
                    case 'down':
                    case 'ArrowDown':
                        // 向下移动
                        if (y < this.rows - 1) newY++;
                        break;
                    case 'a':
                    case 'left':
                    case 'ArrowLeft':
                        // 向左移动
                        if (x > 0) newX--;
                        break;
                    case 'd':
                    case 'right':
                    case 'ArrowRight':
                        // 向右移动
                        if (x < this.rows - 1) newX++;
                        break;
                    default:
                        return;
                }
                // 查找目标坐标
                const targetCell = this.maze.find(cell => cell.x === newX && cell.y === newY);
                // 如果目标坐标不是墙
                if (!targetCell.wall) {
                    // 更新玩家的x坐标
                    this.player.x = newX;
                    // 更新玩家的y坐标
                    this.player.y = newY;
                    // 检查是否到达终点
                    this.hasReachedEnd = this.player.x === this.end.x && this.player.y === this.end.y;
                    // 如果到达终点并且计时没有结束
                    if (this.hasReachedEnd && !this.loading) {
                        // 停止计时
                        this.start = false;
                        // 打开加载遮罩
                        this.loading = true;
                    }
                }
            },
            // 获取相邻坐标的函数
            getNeighbors (cell) {
                const directions = this.coordinateArray(1);
                // 用于存储相邻坐标的数组
                const neighbors = [];
                directions.forEach(dir => {
                    // 新的x坐标
                    const newX = cell.x + dir.x;
                    // 新的y坐标
                    const newY = cell.y + dir.y;
                    // 检查新坐标是否在迷宫范围内
                    if (newX >= 0 && newX < this.rows && newY >= 0 && newY < this.rows) {
                        // 查找相邻
                        const neighbor = this.maze.find(c => c.x === newX && c.y === newY);
                        // 如果相邻不是墙，则加入相邻数组
                        if (!neighbor.wall) neighbors.push(neighbor);
                    }
                });
                // 返回相邻数组
                return neighbors;
            },
            // 坐标数组
            coordinateArray (num) {
                return [
                    // 上
                    { x: 0, y: -num },
                    // 下
                    { x: 0, y: num },
                    // 左
                    { x: -num, y: 0 },
                    // 右
                    { x: num, y: 0 }
                ];
            }
        }
    };
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

    .maze-container {
        display: grid;
        gap: 5px;
        justify-content: center;
    }

    .loadingTip .text {
        color: var(--color-white);
        margin-bottom: 10px;
    }

    .loadingTip .button button {
        margin-right: 10px;
    }

    .cell {
        width: 10px;
        height: 10px;
        border: 1px solid #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 2px;
    }

    .wall {
        background-color: var(--wallColor);
    }

    .path {
        background-color: var(--pathColor);
    }

    .controls {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 20px;
    }

    .controls>button {
        font-size: 16px;
        padding: 10px;
        margin: 5px;
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