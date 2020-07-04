window.onload = function () {
    // 测试删除数据库
    // delete_db()
    // return
    // 展示加载效果
    setTimeout(() => {
        let dbname = "wallpaper-wby"
        let version = 1
        // 声明缓存
        window.cache = {

        }
        init_bg(dbname, version)
        // 在之前要把所有配置从数据库中读取出来
        get_bgurl(dbname, version, function (bgurl, city) {
            // 如果储存了图像,base64解析很消耗时间，避免过多元素使用
            if (bgurl) {
                configs.bgurl = bgurl
            }
            if (city) {
                window.cache.city = city
            }
            // 设置背景
            change_bg(configs.bgurl)
            // 从localstorage中读取插件开关配置
            read_switch_configs()
            // 更新html配置显示，气泡属性等
            init_html_config()
            // 初始化各类插件
            window.weather = new Show_current_weather(canvas)
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
    }, 4000);
}

function init_buttons() {
    // 向导按钮监听
    let next_step_btns = Array.from(document.getElementsByClassName("guide-next-step"))
    let max_index = next_step_btns.length - 1
    next_step_btns.forEach((item, index) => {
        let guide_main = document.getElementById('guide-main')
        guide_main = Array.from(guide_main.children)
        if (index != 0 && index != max_index) {
            item.setAttribute("allow-next", false)
        } else {
            // 在按钮上设置允许下一步值
            item.setAttribute("allow-next", true)
        }
        // 每个都添加点击特效和操作
        item.addEventListener('click', function () {
            // 点击效果
            let bgColor = item.style.backgroundColor
            if (item.getAttribute("allow-next") == "true") {
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
                        add_bg("wallpaper-wby", db_version, window.cache.bgurl, window.cache.city)
                        // 按照配置进行更新壁纸和城市天气
                        reload_weather()
                        change_bg(window.cache.bgurl)
                        // 关闭向导
                        closeGuide()
                    }
                    item.style.backgroundColor = bgColor
                    // 上一页清空未完成标记
                    if (index > 1)
                        guide_main[index - 1].lastElementChild.className = guide_main[index - 1].lastElementChild.className.replace(/\s*guide-content-hint/, '')
                }, 200)
            } else {
                // 显示当前页需要完成操作才能下一步
                guide_main[index].lastElementChild.className += " guide-content-hint"
            }
        })
    })
}

// 背景预览
function preview_bgimg(item) {
    getBase64(document.getElementById("bgImg").files[0], document.getElementById("img-preview"))
    document.getElementById("img-preview").style.display = "block"
    // 取消禁止下一步标记
    item.setAttribute("allow-next", true)
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

// 初始化中国行政区划信息
function getAdministrativeDivision(resp) {
    if (resp && resp.result)
        window.administrativeDivision = resp.result[0]
}

function chooseProvince(province) {
    // 检查中国行政区划加载是否成功
    if (window.administrativeDivision instanceof Array) {
        // 将省级列表渲染
        document.getElementById("province-list").style.visibility = "visible"
        let fragment = document.createDocumentFragment()
        window.administrativeDivision.forEach((item) => {
            let el = document.createElement("li")
            el.textContent = item.name
            el.onclick = function (e) {
                // 阻止事件冒泡
                var ev = e || window.event;
                if (ev && ev.stopPropagation) {
                    //非IE浏览器
                    ev.stopPropagation();
                } else {
                    //IE浏览器(IE11以下)
                    ev.cancelBubble = true;
                }
                province.innerHTML = item.fullname + '<div class="guide-content-option-list" id="province-list"></div>'
                province.setAttribute("provinceid", item.id)
                // 添加直辖市标记
                if (item.fullname[item.fullname.length - 1] == "市")
                    province.setAttribute("zhixiashi", "true")
                else {
                    province.setAttribute("zhixiashi", "false")
                }
                document.getElementById("guide-content-city").style.visibility = "visible"
            }
            fragment.appendChild(el)

        })
        document.getElementById("province-list").appendChild(fragment)
    } else {
        jsonp('http://apis.map.qq.com/ws/district/v1/list?key=FZHBZ-2KTWU-3OXVE-BIR4P-I7PSE-65FDD', "getAdministrativeDivision")
    }
}

function chooseCity(city) {
    if (window.administrativeDivision instanceof Array) {

        // 获取城市列表
        let url = "https://apis.map.qq.com/ws/district/v1/getchildren?id="
            + document.getElementById("guide-content-province").getAttribute("provinceid")
            + "&key=FZHBZ-2KTWU-3OXVE-BIR4P-I7PSE-65FDD"
        jsonp(url, "showCitys")

    } else {
        jsonp('http://apis.map.qq.com/ws/district/v1/list?key=FZHBZ-2KTWU-3OXVE-BIR4P-I7PSE-65FDD', "getAdministrativeDivision")
    }
}

function showCitys(resp) {
    let cities
    if (resp && resp.result) {
        cities = resp.result[0]
    }

    let fragment = document.createDocumentFragment()
    cities.forEach((item) => {
        let el = document.createElement("li")
        el.textContent = item.fullname
        el.onclick = function (e) {
            // 阻止事件冒泡
            var ev = e || window.event;
            if (ev && ev.stopPropagation) {
                //非IE浏览器
                ev.stopPropagation();
            } else {
                //IE浏览器(IE11以下)
                ev.cancelBubble = true;
            }
            document.getElementById("guide-content-city").innerHTML = item.fullname + '<div class="guide-content-option-list" id="city-list"></div>'
            document.getElementById("guide-content-city").setAttribute("cityid", item.id)

            if (document.getElementById("guide-content-province").getAttribute("zhixiashi") == "true") {
                // 是直辖市，这一步就结束了
                window.cache.city = item.fullname
                document.getElementById("guide-content-city").parentNode.lastElementChild.setAttribute("allow-next", true)
            } else {
                document.getElementById("guide-content-district").style.visibility = "visible"
            }
        }
        fragment.appendChild(el)
    })
    document.getElementById("city-list").appendChild(fragment)
    document.getElementById("city-list").style.visibility = "visible"
}

function chooseDistrict(district) {
    if (window.administrativeDivision instanceof Array) {
        document.getElementById("city-list").style.visibility = "visible"
        // 获取城市列表
        let url = "https://apis.map.qq.com/ws/district/v1/getchildren?id="
            + document.getElementById("guide-content-city").getAttribute("cityid")
            + "&key=FZHBZ-2KTWU-3OXVE-BIR4P-I7PSE-65FDD"
        jsonp(url, "showDistricts")
    } else {
        jsonp('http://apis.map.qq.com/ws/district/v1/list?key=FZHBZ-2KTWU-3OXVE-BIR4P-I7PSE-65FDD', "getAdministrativeDivision")
    }
}
function showDistricts(resp) {
    let districts
    if (resp && resp.result) {
        districts = resp.result[0]
    }
    let fragment = document.createDocumentFragment()
    districts.forEach((item) => {
        let el = document.createElement("li")
        el.textContent = item.fullname
        el.onclick = function (e) {
            // 阻止事件冒泡
            var ev = e || window.event;
            if (ev && ev.stopPropagation) {
                //非IE浏览器
                ev.stopPropagation();
            } else {
                //IE浏览器(IE11以下)
                ev.cancelBubble = true;
            }
            document.getElementById("guide-content-district").innerHTML = item.fullname + '<div class="guide-content-option-list" id="district-list"></div>'
            document.getElementById("guide-content-district").setAttribute("districtid", item.id)
            // 记录选择的城市名称
            window.cache.city = item.fullname
            document.getElementById("guide-content-district").parentNode.lastElementChild.setAttribute("allow-next", true)
        }
        fragment.appendChild(el)
    })
    document.getElementById("district-list").appendChild(fragment)
    document.getElementById("district-list").style.visibility = "visible"
}
// 使用jsonp进行跨域
function jsonp(url, callbackName) {
    let script = document.createElement("script")
    script.src = url + "&output=jsonp&callback=" + callbackName
    document.getElementsByTagName("body")[0].appendChild(script)
}