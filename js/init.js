window.onload = function () {
    let dbname = "wallpaper-wby"
    let version = 1
    // 声明缓存
    window.cache = {

    }
    init_bg(dbname, version)
    // 在之前要把所有配置从数据库中读取出来
    get_bgurl(dbname, version, function (bgurl) {
        // 如果储存了图像
        if (bgurl) {
            configs.bgurl = bgurl
        }
        // 设置背景
        document.getElementsByTagName("body")[0].style.backgroundImage = "url(" + configs.bgurl + ")"
        // 从localstorage中读取插件开关配置
        read_switch_configs()
        // 更新html配置显示，气泡属性等
        init_html_config()
        // 初始化各类插件
        let weather = new Show_current_weather(canvas)
        // 绘制成功回调，每次画布刷新的回调，可以在画布上增加绘画
        let callback_per_repaint = function (canvas) {
            // 开启天气系统
            weather.start()
        }
        // 初始化各种按钮
        init_buttons()
        // 开始启动桌面背景程序
        init(window.configs, callback_per_repaint)
        // 启动完成
        document.getElementById("loading").style.display = "none"
    })
}

function init_buttons() {
    // 向导按钮监听
    let next_step_btns = Array.from(document.getElementsByClassName("guide-next-step"))
    let max_index = next_step_btns.length - 1
    next_step_btns.forEach((item, index) => {
        let guide_main = document.getElementById('guide-main')
        guide_main = Array.from(guide_main.children)
        // 每个都添加点击特效和操作
        item.addEventListener('click', function () {
            // 点击效果
            let bgColor = item.style.backgroundColor
            item.style.backgroundColor = "transparent"
            setTimeout(() => {
                // 0.5s后显示下一页
                // 修改第index页，取消index页显示，显示index + 1页
                if (max_index > index) {
                    guide_main[index].className = guide_main[index].className.replace(/\s*guide-page-show/, '')
                    guide_main[index + 1].className = guide_main[index + 1].className + " guide-page-show"
                } else {
                    // 已经到最后一页，是完成按钮
                    let db_version = 1
                    // 完成时将配置添加到数据库中
                    add_bg("wallpaper-wby", db_version, window.cache.bgurl)
                }
                item.style.backgroundColor = bgColor
            }, 200)
        })
    })

}

// 背景预览
function preview_bgimg() {
    getBase64(document.getElementById("bgImg").files[0], document.getElementById("img-preview"))
    document.getElementById("img-preview").style.display = "block"
}

// 获取图片的base64
function getBase64(file, img) {
    let file_reader = new FileReader()
    file_reader.readAsDataURL(file)
    file_reader.onloadend = function (event) {
        img.src = event.target.result
        // 暂存在window下
        window.cache.bgurl = event.target.result
    }
}
