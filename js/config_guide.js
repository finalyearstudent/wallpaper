//配置向导（当前配置：背景图片，背景文字，当前城市）
function openConfigGuide() {
    document.getElementById("guide-main").style.display = "block"
}
// 关闭向导
function closeGuide() {
    document.getElementById("guide-main").style.display = "none"
    let guide_page = Array.from(document.getElementsByClassName("guide-page"))
    guide_page.forEach(function (item, index) {
        item.className = item.className.replace(/\s*guide-page-show/, '')
    })
    guide_page[0].className += " guide-page-show"
}
