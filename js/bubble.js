// 从以下几个方面来定义一个气泡
// 颜色，大小，显示时长，显示剩余时间，移动方向, 产生气泡的中心位置, 
function Bubble_Type(config = {
    color: [126, 0, 0, 0.5],
    size: 20,
    duration: 5,
    remaining: 5,
    direction: 0,
    center: {
        x: 0,
        y: 0
    },
    distance: 1
}) {
    this.color = config.color ? config.color : [126, 0, 0, 1]
    // 单位px
    this.size = config.size ? config.size : 20
    // 持续时间单位ms
    this.duration = config.duration ? config.duration : 5000
    this.remaining = config.remaining ? config.remaining : 5000
    // 顺时针角度
    this.direction = config.direction ? config.direction : 0
    this.center = config.center ? config.center : {
        x: 0,
        y: 0
    }
    // 每次刷新时的移动距离
    this.distance = config.distance ? config.distance : 1
}

function Bubble(x, y) {
    this.x = x
    this.y = y
    this.getRandomColor = function () {
        return [parseInt(Math.random() * 1000000) % 256, parseInt(Math.random() * 1000000) % 256, parseInt(Math.random() * 1000000) % 256, 1]
    }
    this.getRandomSize = function () {
        let diffrence = window.configs.bubble_size[1] - window.configs.bubble_size[0] + 1
        return window.configs.bubble_size[0] + (parseInt(Math.random() * 1000000) % diffrence)
    }
    this.getRandomDirection = function () {
        return parseInt(Math.random() * 1000000) % 361
    }
    this.getRandomDuration = function () {
        let diffrence = window.configs.bubble_duration[1] - window.configs.bubble_duration[0] + 1
        return window.configs.bubble_duration[0] + (parseInt(Math.random() * 1000000) % diffrence)
    }
    this.getRandomSpeed = function () {
        let diffrence = window.configs.bubble_move_speed[1] - window.configs.bubble_move_speed[0] + 1
        return (window.configs.bubble_move_speed[0] + (parseInt(Math.random() * 1000000) % diffrence)) * 0.1
    }
    this.getRandomBubble = function () {
        let res = {
            color: this.getRandomColor(),
            size: this.getRandomSize(),
            duration: this.getRandomDuration(),
            direction: this.getRandomDirection(),
            center: {
                x: this.x,
                y: this.y
            },
            distance: this.getRandomSpeed()
        }
        res.remaining = res.duration
        return res
    }
}

function CanvasContent(maxsize, draw_interval, canvas) {
    this.content = []
    // content 最大长度
    this.max_size = 300
    // 绘制时间间隔ms
    this.draw_interval = 30
    this.canvas
    // 鼠标停止的位置
    this.mouse = {
        x: 0,
        y: 0
    }

    if (canvas) {
        this.canvas = canvas
    }
    else {
        console.arr("初始化失败，未找到画布")
    }
    if (maxsize) {
        this.max_size = maxsize
    }
    if (draw_interval) {
        this.draw_interval = draw_interval
    }

    this.push_new_bubbles = function (new_bubbles) {
        // 检查最大允许同时渲染的气泡个数
        if (this.max_size < (this.content.length + new_bubbles.length)) {
            let length = new_bubbles.length
            // 删除头部的元素
            this.content.splice(0, length)
            // 尾部添加新元素
            this.content = this.content.concat(new_bubbles)
        } else {
            // 直接在尾部添加
            this.content = this.content.concat(new_bubbles)
        }
    }

    //  获取当前content
    this.get_cur_content = function () {
        return this.content
    }

    // 重新计算气泡属性，背景透明，xy坐标，持续时间
    this.renew_content = function () {
        this.content = this.content.map((bubble) => {
            let res = bubble
            res.remaining -= this.draw_interval
            if (res.remaining < 0) {
                // 如果剩余时间小于0，直接删除这个气泡
                return undefined
            }
            res.color[3] = (res.remaining / res.duration)
            if (res.color[3] <= 0) {
                // 如果透明度小于或等于0，直接删除这个元素
                return undefined
            }
            // 计算新坐标
            let radian = this.get_radian(bubble.direction)
            let sinTheta = Math.sin(radian)
            let cosTheta = Math.cos(radian)
            // Number.EPSILON 是 1 和 比1大的最小浮点数的差值
            if (Math.abs(sinTheta) < Number.EPSILON) {
                sinTheta = 0;
            }
            if (Math.abs(cosTheta) < Number.EPSILON) {
                cosTheta = 0;
            }
            res.center.x += bubble.distance * sinTheta
            res.center.y += bubble.distance * cosTheta
            return res
        })
        // 将数组中的undefined删除
        this.content = this.content.filter(bubble => bubble)
    }

    // 绘制当前气泡 callback 提供绘制气泡背景后的回调接口,可以继续在画布上绘制其他东西
    this.draw_cur_bubbles = function (callback) {
        // 是否开启绘制气泡，不绘制时，请求帧接口还是在执行
        if (window.configs.switch.create_bubble) {
            document.getElementById("canvas").style.visibility = "visible"
            // 绘制
            let ctx = this.canvas.getContext('2d')
            // 清空画布
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            // 显示背景图片,直接用画布生成性能太低了
            // ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            if (this.content.length <= 0) {
                return
            }
            // 显示气泡
            for (let index in this.content) {
                let bubble = this.content[index]
                this.draw_a_bubble(ctx, bubble)
            }
            // 更新
            this.renew_content()
        } else {
            document.getElementById("canvas").style.visibility = "hidden"
        }

        if (typeof callback == "function") {
            // 提供插件接口
            callback(this.canvas)
        }
    }

    this.draw_a_bubble = function (ctx, bubble) {
        let rgba = `rgba(${bubble.color[0]}, ${bubble.color[1]}, ${bubble.color[2]}, ${bubble.color[3] * window.configs.bubble_basic_opcity})`
        ctx.beginPath()
        ctx.fillStyle = rgba
        ctx.arc(bubble.center.x, bubble.center.y, bubble.size, 0, Math.PI * 2, true)
        ctx.fill()
        ctx.closePath()
    }

    // 计算角度对应的弧度
    this.get_radian = function (angle) {
        return angle / 180 * Math.PI
    }

    // 开始自动绘制
    this.start_draw = function (callback) {
        let that = this
        // 记录创建的帧数
        window.count = 0
        // 储存回调，方便draw_a_frame直接获取
        that.callback = callback
        // 鼠标停留处一直产生气泡
        that.mouse_create_bubbles()
        // 使用60帧的接口，直接使用setinterval在长时间后会出现计时问题
        window.requestAnimationFrame(that.draw_a_frame)
    }

    let count = 0
    let starTime = new Date().getTime()
    this.mouse_create_bubbles = function () {
        let that = this
        let interval = setInterval(() => {
            // 计数
            count++
            let curTime = new Date().getTime()
            // console.log(count + " " + (curTime - starTime - window.configs.mousehover_bubble_interval * count))
            if (curTime - starTime - window.configs.mousehover_bubble_interval * count > 33) {
                window.clearInterval(interval)
                count = 0
                starTime = new Date().getTime()
                that.mouse_create_bubbles()
            }
            let diffrence = window.configs.mousehover_bubble_number[1] - window.configs.mousehover_bubble_number[0] + 1
            let number = window.configs.mousehover_bubble_number[0] + parseInt(Math.random() * 1000) % diffrence
            // 读取配置，是否生成气泡
            if (window.configs.switch.create_bubble) {
                create_bubbles(that, that.mouse.x, that.mouse.y, number)
            }
        }, window.configs.mousehover_bubble_interval);
    }

    // 气泡绘制的一帧显示
    this.draw_a_frame = function () {
        window.count++
        if (window.count >= 60000) {
            // 一个小时重新请求一次天气
            reload_weather()
            window.count = 0
        }
        let that = window.canvas_content
        // 气泡显示开关
        that.draw_cur_bubbles(that.callback)
        // 请求下一帧
        window.requestAnimationFrame(that.draw_a_frame)
    }
}

// 添加气泡到canvas_content
function create_bubbles(canvas_content, x, y, number) {
    let new_bubbles = []
    // 随机生成气泡，并将当前气泡添加至CanvasContent
    bubble = new Bubble(x, y)
    for (let i = 0; i < number; i++) {
        new_bubbles.push(bubble.getRandomBubble())
    }
    canvas_content.push_new_bubbles(new_bubbles)
}

// init 函数自动生成画布，并开始绘制
function init(configs, callback) {
    // 配置中心增加监听器
    configs_add_listener()
    //准备画布
    let canvas = document.getElementById("canvas")
    let ctx = canvas.getContext('2d')
    // 解决高清屏模糊问题
    let ratio = getPixelRatio(ctx);
    // 设置canvas全屏
    canvas.width = document.documentElement.clientWidth
    canvas.height = document.documentElement.clientHeight
    // 将canvas扩大，保证一个像素点对应一个设备独立像素（这样图形也要扩大相应的倍数）
    canvas.style.width = canvas.width + 'px'
    canvas.style.height = canvas.height + 'px'
    canvas.width = canvas.width * ratio
    canvas.height = canvas.height * ratio
    let trigger = false
    // 直接将画布扩大倍数
    ctx.scale(ratio, ratio)
    // 初始化一个canvas_content记录已经产生的气泡并自动维护气泡的各种属性计算
    let canvas_content = new CanvasContent(configs.bubble_number, configs.canvas_repaint_interval, canvas)
    // 这里存储引用，方便回调函数中直接获取引用
    window.canvas_content = canvas_content
    // 添加鼠标hover事件
    canvas.addEventListener('mousemove', (e) => {
        // let startTime = new Date().getTime()
        // 防抖
        if (!trigger) {
            trigger = true
            setTimeout(() => {
                trigger = false
            }, window.configs.mousemove_time);
            // 更新鼠标当前位置
            canvas_content.mouse = {
                x: e.offsetX,
                y: e.offsetY
            }
            if (window.configs.switch.create_bubble) {
                let diffrence = window.configs.bubble_create_number[1] - window.configs.bubble_create_number[0] + 1
                let number = window.configs.bubble_create_number[0] + parseInt(Math.random() * 1000) % diffrence
                create_bubbles(canvas_content, e.offsetX, e.offsetY, number)
                // let curTime = new Date().getTime()
                // console.log("当前时间差:", curTime - startTime)
                // startTime = curTime
            }
        }
    })

    canvas_content.start_draw(callback)

    // 监听配置变化，其他非画布组件启动和关闭
    let component_show_time = new Show_Time()
    setInterval(() => {
        // 背景文字显示组件
        if (!window.configs.switch.show_background_text) {
            document.getElementById("background-text").style.visibility = "hidden"
        } else {
            document.getElementById("background-text").style.visibility = "visible"
        }
        // 时间组件
        if (window.configs.switch.show_cur_time) {
            component_show_time.start()
        } else {
            component_show_time.shutdown()
        }
    }, 100);
}

// 获取画布的像素比
function getPixelRatio(context) {
    var backingStore = context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
}

// 特效时间展示系统，使用svg
function Show_Time() {
    // 启动
    this.start = function () {
        let svg = document.getElementById("svg")
        if (!svg) {
            console.error("svg未初始化！")
        }
        svg.style.display = "block"

        let text1 = document.getElementById("text1")
        let text2 = document.getElementById("text2")
        let text3 = document.getElementById("text3")
        let text4 = document.getElementById("text4")
        let texts = [text1, text2, text3, text4]

        // 每10ms获取最新时间
        setInterval(() => {
            texts.forEach(element => {
                element.textContent = this.getTime()
            });
        }, 10);

    }
    this.getTime = function getCurTime() {
        date = new Date()
        hour = parseInt(date.getHours())
        min = parseInt(date.getMinutes())
        sec = parseInt(date.getSeconds())

        if (hour < 10) {
            hour = "0" + hour
        }
        if (min < 10) {
            min = "0" + min
        }
        if (sec < 10) {
            sec = "0" + sec
        }
        return hour + ":" + min + ":" + sec
    }

    this.shutdown = function () {
        document.getElementById("svg").style.display = "none"
    }
}

// 刷新天气信息
function reload_weather() {
    window.weather.get_today_weather()
    // 提示更新成功
    document.getElementById("reload_weather").setAttribute("tip", "刷新成功")
    setTimeout(() => {
        document.getElementById("reload_weather").setAttribute("tip", "点击进行刷新天气")
    }, 1000);
}

// 实时天气背景展示系统
function Show_current_weather(canvas) {
    this.rain_list = []
    this.failTime = 0
    this.get_today_weather = function () {
        let that = this
        let api_url = "https://free-api.heweather.net/s6/weather/now?location=" + window.cache.city + "&key=355e24bd23a940fcb095df117ebd463d"
        let xmlhttp = new XMLHttpRequest()
        xmlhttp.addEventListener("load", function () {
            // 将string转化为json
            let info = JSON.parse(this.responseText)
            for (let key in info) {
                // 优选第一个
                info = info[key][0]
            }
            // 记录当前天气
            that.weather = info
            if (info && info.basic && info.now) {
                document.getElementById("weather_city").textContent = info.basic.location
                document.getElementById("weather_body_temperature").textContent = info.now.fl
                document.getElementById("weather_temperature").textContent = info.now.tmp
                document.getElementById("weather_weather").textContent = info.now.cond_txt
                document.getElementById("weather_wind_direction").textContent = info.now.wind_dir
            }
        }, false)
        xmlhttp.open("GET", api_url)
        xmlhttp.send()
    }
    this.get_a_random_rain = function () {
        // 生成一滴雨
        let random_rain = document.createElement("div")
        random_rain.className = "a-drop-of-rain"
        // 从数组中获取元素进行更新
        let random_x = parseInt(Math.random() * 1000) % 100
        let random_y = parseInt(Math.random() * 1000) % 100
        let random_width = (8 + parseInt(Math.random() * 100) % 13) / 1000
        let random_height = (15 + parseInt(Math.random() * 100) % 11) / 1000
        let animationDelay = 500 + parseInt(Math.random() * 100000) % 9999
        // 保证高度比宽度大，重力
        if (random_height < random_width) {
            let temp = random_width
            random_width = random_height
            random_height = temp
        }
        random_rain.style.width = "calc(100vh * " + random_width + ")"
        random_rain.style.height = "calc(100vh * " + random_height + ")"
        random_rain.style.backgroundSize = "calc(100vw * 0.05 * 8) calc(100vh * 0.05 * 8)"
        random_rain.style.left = random_x + "%"
        random_rain.style.top = random_y + "%"
        random_rain.style.backgroundPositionX = random_x + "%"
        random_rain.style.backgroundPositionY = random_y + "%"
        random_rain.style.animationDelay = animationDelay + "ms"

        // 插入html
        document.getElementById("rains").appendChild(random_rain)
        // 保存到缓存
        this.rain_list.push(random_rain)
    }
    // 
    this.updatePosition = function () {
        this.rain_list.map(function (item) {
            let top = item.style.top
            let last_Y = parseFloat(top.match(/\d*.*\d*/)[0])
            let cur_Y = last_Y + (window.configs.weather.rain_speed / 60)
            if (cur_Y > 99) {
                cur_Y = parseInt(Math.random() * 100) % 99
                item.style.left = (parseInt(Math.random() * 100) % 99) + "%"
                item.style.backgroundPositionX = (parseInt(Math.random() * 100) % 99) + "%"
                item.style.animation = "falling 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;"
            }
            item.style.backgroundPositionY = cur_Y + "%"
            item.style.top = cur_Y + "%"
            return item
        })
    }

    // 启动
    this.start = function () {
        // 只获取一次天气，增加刷新按钮，请求过多被封ip
        let that = this
        // 启动实时天气、天气获取成功且为雨天
        if (window.configs.switch["show_weather"] && that.weather && that.weather.now && that.weather.now.cond_code[0] == "3") {
            document.getElementById("rains").style.display = "block"
            document.getElementById("_window").style.backgroundColor = window.configs.weather.bg_color
            document.getElementById("_window").style.filter = "blur(10px)"
            document.getElementById("_window").style.display = "block"
            // 开始每帧更新坐标
            this.updatePosition()
        } else {
            // 关闭天气展示
            document.getElementById("_window").style.display = "none"
            document.getElementById("rains").style.display = "none"
            document.getElementById("_window").style.filter = "unset"
            document.getElementById("_window").style.backgroundColor = "transparent"
        }
    }

    // 创建雨滴
    for (let i = 0; i < window.configs.weather.rain_number; i++) {
        this.get_a_random_rain()
    }

    // 获取今天的天气
    this.get_today_weather()
}


/**
 * 记录html中开关id和内存中的开关储存值的对应关系
 */
const SW_MAP = {
    "sw_bubble": "create_bubble",
    "sw_text": "show_background_text",
    "sw_time": "show_cur_time",
    "sw_weather": "show_weather"
}

// 从localStorage中读取switch配置
function read_switch_configs() {
    window.configs.switch = {}
    if (window.localStorage) {
        init_storage("show_background_text")
        init_storage("show_cur_time")
        init_storage("show_weather")
        init_storage("create_bubble")
    } else {
        console.log("当前浏览器不支持localStorage")
    }
}

function init_storage(id) {
    if (!window.localStorage.getItem(id)) {
        window.localStorage.setItem(id, true)
        window.configs.switch[id] = true
    } else {
        window.configs.switch[id] = window.localStorage.getItem(id) == "true" ? true : false
    }
}
// html开关样式和内存设置保持一致
function init_html_config() {
    // 更新配置中心开关状态
    for (id in SW_MAP) {
        if (window.configs.switch[SW_MAP[id]]) {
            document.getElementById(id).parentNode.parentNode.className = document.getElementById(id).parentNode.parentNode.className.replace(/colse/, "open")
        } else {
            document.getElementById(id).parentNode.parentNode.className = document.getElementById(id).parentNode.parentNode.className.replace(/open/, "close")
        }
    }
    // 更新背景文字(div文本和尾元素after的文本)
    document.getElementById("background-text").setAttribute("texts", window.configs["background-text"])
    document.getElementById("background-text").textContent = window.configs["background-text"]
}
// html开关增加监听器
function configs_add_listener() {
    init_listener("sw_bubble")
    init_listener("sw_text")
    init_listener("sw_time")
    init_listener("sw_weather")
}

function init_listener(id) {
    document.getElementById(id).parentNode.addEventListener("click", function () {
        change_switch(id)
    })
}

// 改变配置状态 true -> false ; false -> true
function change_switch(id) {
    // 改变内存值
    window.configs.switch[SW_MAP[id]] = !window.configs.switch[SW_MAP[id]]
    // 改变开关样式
    if (!window.configs.switch[SW_MAP[id]]) {
        // 如果是open
        document.getElementById(id).parentNode.parentNode.className = document.getElementById(id).parentNode.parentNode.className.replace(/open/, "close")
    } else {
        document.getElementById(id).parentNode.parentNode.className = document.getElementById(id).parentNode.parentNode.className.replace(/close/, "open")
    }
    // 修改localstorage
    if (window.localStorage.getItem(SW_MAP[id]) == "true") {
        window.localStorage.setItem(SW_MAP[id], false)
    }
    else {
        window.localStorage.setItem(SW_MAP[id], true)
    }
}

// 更新壁纸
function change_bg(url) {
    document.getElementsByTagName("body")[0].style.backgroundImage = "url(" + url + ")"
}