import { defineStore } from 'pinia';

export const useMainStore = defineStore('main', {
    state: () => ({
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
            // 语言选择
            language: 'zh-CN',
            // 迷宫生成算法
            algorithm: 'Maze',
            // 墙壁颜色
            wallColor: '#333333',
            // 路径颜色
            pathColor: '#EEEEEE',
            // 终点位置
            endLocation: 'random'
        }
    }),
    persist: {
        key: 'vue-maze',
        paths: ['mazeSetUp'],
        storage: localStorage,
        serializer: {
            serialize: (state) => {
                return JSON.stringify(state);
            },
            deserialize: (value) => {
                return JSON.parse(value);
            }
        }
    }
});