function Menu(name, time) {
    this.name = name;
    this.time = time;
}

function Chef() {
    this.status = "ready"; // 요리중
}

Chef.prototype.isAvailable = function () {
    return this.status === "ready";
};

Chef.prototype.cookAsync = function (menu) {
    var chef = this; // 셰프에 대한 참조 저장

    // 셰프의 상태를 '요리중'으로 업데이트
    chef.status = "cooking";

    return new Promise(function (resolve) {
        setTimeout(function () {
            // 지정된 요리 시간 이후에 셰프의 상태를 '준비됨'으로 업데이트
            chef.status = "ready";
            resolve();
        }, menu.time);
    });
};

function Server(servingTime) {
    this.status = "waiting"; // 제공중
    this.servingTime = servingTime;
}

Server.prototype.isAvailable = function () {
    return this.status === "waiting";
};

Server.prototype.serveAsync = function (menu) {
    var server = this; // 서버에 대한 참조 저장

    // 서버의 상태를 '제공중'으로 업데이트
    server.status = "serving";

    return new Promise(function (resolve) {
        setTimeout(function () {
            // 지정된 제공 시간 이후에 서버의 상태를 '대기중'으로 업데이트
            server.status = "waiting";
            resolve();
        }, server.servingTime);
    });
};

var orders = [];
var cookings = []; // 요리중인 주문을 저장하는 배열
var servings = []; // 제공된 주문을 저장하는 배열

var chefs = [new Chef(), new Chef()];
var servers = [new Server(1000), new Server(2000)];

function renderOrders() {
    var orderEl = document.getElementById("orders");
    orderEl.innerHTML = "";
    orders.forEach(function (order) {
        var liEl = document.createElement("li");
        liEl.textContent = order.name;
        orderEl.append(liEl);
    });
}

function renderCookings() {
    var cookingEl = document.getElementById("cooking");
    cookingEl.innerHTML = "";
    cookings.forEach(function (order) {
        var liEl = document.createElement("li");
        liEl.textContent = order.name;
        cookingEl.append(liEl);
    });
}

function renderServings() {
    var servingEl = document.getElementById("serving");
    servingEl.innerHTML = "";
    servings.forEach(function (order) {
        var liEl = document.createElement("li");
        liEl.textContent = order.name;
        servingEl.append(liEl);
    });
}

document.getElementById("sundea").onclick = function () {
    run(new Menu("순대국", 1000));
};

document.getElementById("heajang").onclick = function () {
    run(new Menu("해장국", 2000));
};

function findChefAsync() {
    return new Promise(function (resolve) {
        function findChef() {
            var availableChef = chefs.find(function (chef) {
                return chef.isAvailable();
            });

            if (availableChef) {
                resolve(availableChef);
            } else {
                setTimeout(findChef, 1000); // 1초 후에 다시 시도
            }
        }

        findChef();
    });
}

function findServerAsync() {
    return new Promise(function (resolve) {
        function findServer() {
            var availableServer = servers.find(function (server) {
                return server.isAvailable();
            });

            if (availableServer) {
                resolve(availableServer);
            } else {
                setTimeout(findServer, 1000); // 1초 후에 다시 시도
            }
        }

        findServer();
    });
}

function run(menu) {
    orders.push(menu);
    renderOrders();

    findChefAsync()
        .then(function (chef) {
            orders.splice(orders.indexOf(menu), 1);
            cookings.push(menu);
            renderOrders();
            renderCookings();

            return chef.cookAsync(menu);
        })
        .then(function () {
            cookings.splice(cookings.indexOf(menu), 1);
            renderCookings();

            return findServerAsync();
        })
        .then(function (server) {
            servings.push(menu);
            renderServings();

            return server.serveAsync(menu);
        })
        .then(function () {
            servings.splice(servings.indexOf(menu), 1);
            renderServings();
        });
}
