<template>
    <div class="maze">
        <div class="maze-box">
            <div class="maze-container" :style="{ gridTemplateColumns: `repeat(${rows}, 10px)` }">
                <div v-for="(cell, index) in maze" :key="index" :style="xyRadius(cell.x, cell.y)" :class="getCellClass(cell)">
                    <span v-if="player.x === cell.x && player.y === cell.y && !hasReachedEnd" v-html="mazeSetUp.player" />
                    <span v-if="end.x === cell.x && end.y === cell.y && !hasReachedEnd" v-html="mazeSetUp.end" />
                    <span v-if="hasReachedEnd && end.x === cell.x && end.y === cell.y" v-html="mazeSetUp.arrival" />
                </div>
            </div>
            <div class="controls">
                <a-button @click="move('up')">上<span class="shortcutKeys">(W)</span></a-button>
                <a-button @click="move('down')">下<span class="shortcutKeys">(S)</span></a-button>
                <a-button @click="move('left')">左<span class="shortcutKeys">(A)</span></a-button>
                <a-button @click="move('right')">右<span class="shortcutKeys">(D)</span></a-button>
                <a-button @click="show = true">设置</a-button>
            </div>
            <a-drawer width="40%" title="迷宫设置" :visible="show" @ok="saveSettings" unmountOnClose>
                <a-form :model="mazeSetUp" layout="vertical">
                    <a-form-item field="rows" label="迷宫大小">
                        <a-input-number v-model="mazeSetUp.rows" placeholder="迷宫大小" />
                        <template #extra>
                            <div>迷宫大小必须为单数, 数字越大生成的迷宫就越大</div>
                        </template>
                    </a-form-item>
                    <a-form-item field="deadEnd" label="死胡同数量占比">
                        <a-input-number v-model="mazeSetUp.deadEnd" placeholder="死胡同数量占比" />
                        <template #extra>
                            <div>填写百分比</div>
                        </template>
                    </a-form-item>
                    <a-form-item field="endLocation" label="终点位置">
                        <a-radio-group v-model="mazeSetUp.endLocation" type="button">
                            <a-radio value="rightTop">右上角</a-radio>
                            <a-radio value="leftDown">左下角</a-radio>
                            <a-radio value="center">中间</a-radio>
                            <a-radio value="rightDown">右下角</a-radio>
                            <a-radio value="random">随机</a-radio>
                        </a-radio-group>
                    </a-form-item>
                    <a-form-item field="player" label="玩家图标">
                        <a-textarea v-model="mazeSetUp.player" placeholder="玩家图标" />
                        <template #extra>
                            <div>支持填写HTML标签</div>
                        </template>
                    </a-form-item>
                    <a-form-item field="end" label="终点图标">
                        <a-textarea v-model="mazeSetUp.end" placeholder="终点图标" />
                        <template #extra>
                            <div>支持填写HTML标签</div>
                        </template>
                    </a-form-item>
                    <a-form-item field="arrival" label="抵达终点图标">
                        <a-textarea v-model="mazeSetUp.arrival" placeholder="抵达终点图标" />
                        <template #extra>
                            <div>支持填写HTML标签</div>
                        </template>
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
                // 设置弹窗
                show: false,
                // 迷宫的行数
                rows: 41,
                // 存储迷宫的结构数据
                maze: [],
                // 玩家初始位置
                player: { x: 1, y: 1 },
                // 地图设置
                mazeSetUp: {
                    // 终点图标
                    end: '🏁',
                    // 迷宫的行数
                    rows: 41,
                    // 玩家图标
                    player: '😃',
                    // 抵达终点图标
                    arrival: '🥰',
                    // 死胡同数量
                    deadEnd: 20,
                    // 终点位置
                    endLocation: 'center'
                },
                // 是否已经到终点
                hasReachedEnd: false
            };
        },
        computed: {
            // 迷宫的终点坐标
            end () {
                const rows = this.rows;
                const { endLocation } = this.mazeSetUp;
                const center = Math.floor(rows / 2);
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
            // 监听键盘
            window.addEventListener('keydown', this.move);
        },
        methods: {
            // 保存设置
            saveSettings () {
                // 初始化迷宫数据
                this.generateMaze();
                // 发送通知
                Message.success('地图数据设置成功~');
            },
            // 初始化迷宫
            generateMaze () {
                // 关闭弹窗
                this.show = false;
                // 修改迷宫大小
                this.rows = this.mazeSetUp.rows;
                // 初始化迷宫，1表示墙，0表示路径
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
            },
            // 给四个角加上圆角
            xyRadius (x, y) {
                const rows = this.rows - 1;
                if (x == 0 && y == 0) return 'border-top-left-radius: 2px';
                else if (x == rows && y == 0) return 'border-top-right-radius: 2px';
                else if (x == 0 && y == rows) return 'border-bottom-left-radius: 2px';
                else if (x == rows && y == rows) return 'border-bottom-right-radius: 2px';
                else return '';
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

    .maze-container {
        display: grid;
        gap: 5px;
        margin-bottom: 20px;
        justify-content: center;
    }

    .cell {
        width: 10px;
        height: 10px;
        border: 1px solid #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .wall {
        background-color: #333;
    }

    .path {
        background-color: #eee;
    }

    .controls {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
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
</style>