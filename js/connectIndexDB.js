// 添加背景数据数据库
function add_bg(dbname, version, value) {
    let request = window.indexedDB.open(dbname, version)
    request.onsuccess = function (event) {
        db = event.target.result;
        db.transaction(['background'], 'readwrite')
            .objectStore("background").put({
                id: "1",
                bgurl: value
            })
    }
    request.onerror = function () {
        console.error("数据库连接错误")
    }
}
// 获取背景url
function get_bgurl(dbname, version, callback) {
    let request = window.indexedDB.open(dbname, version)
    request.onsuccess = function (event) {
        db = event.target.result;
        let transaction = db.transaction(['background']);
        let objectStore = transaction.objectStore('background');
        let request = objectStore.get("1");
        request.onsuccess = function (event) {
            if (request.result) {
                callback(request.result["bgurl"])
            } else {
                callback(false)
            }
        };
        request.onerror = function (event) {
            callback(false)
        }
    }
    request.onerror = function () {
        console.error("数据库连接错误")
        callback(false)
    }
}

// 删除数据库
function delete_db() {
    var DBDeleteRequest = window.indexedDB.deleteDatabase("wallpaper-wby");

    DBDeleteRequest.onerror = function (event) {
        console.log("Error deleting database.");
    };

    DBDeleteRequest.onsuccess = function (event) {
        console.log("Database deleted successfully");

        console.log(event.result); // should be undefined
    };

}

// 创建数据库和表
function init_bg(dbname, version) {
    let request = window.indexedDB.open(dbname, version)
    request.onsuccess = function (event) {
    }
    request.onerror = function () {
        console.error("数据库连接错误")
    }
    // 创建background表
    request.onupgradeneeded = function (event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains('background')) {
            // keypath 是获取某个对象引用所需要使用的key，相当于主键
            db.createObjectStore('background', { keyPath: "id" });
        }
    }
}