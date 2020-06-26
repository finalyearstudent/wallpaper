/**
 * @deprecated
 * @description 此文件作废，请从桌面打开配置向导进行配置
 */
(function () {
    // 将配置挂载在window下
    window.configs = {
        // 背景文字
        "background-text": "今天你学习了吗？",
        // 背景图片绝对路径或相对路径
        bgurl: './img/bg2.jpg',
        // 泡泡总个数
        bubble_number: 666,
        // 鼠标移动处的随机产生气泡个数
        bubble_create_number: [2, 10],
        // px
        bubble_size: [2, 10],
        // ms
        bubble_duration: [2000, 5000],
        // 画布刷新时间
        canvas_repaint_interval: 1000 / 60,
        // 移动速度: n px per interval
        bubble_move_speed: [3, 10],
        // 泡泡基础透明度
        bubble_basic_opcity: 0.7,
        // 每ms监听一次鼠标移动事件
        mousemove_time: 30,
        // 鼠标悬停气泡刷新个数
        mousehover_bubble_number: [2, 5],
        // 鼠标悬停时产生气泡的时间间隔ms
        mousehover_bubble_interval: 360,
        // 天气显示
        weather: {
            // 雨滴数量
            // rain_number: 10,
            // 雨滴流速
            rain_speed: 1,
            // 雨天模糊层颜色
            bg_color: "rgba(0, 0, 0, 0.2)"
        }
    }
}())