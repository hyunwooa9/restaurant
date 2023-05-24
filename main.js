function Menu(name, time) {
    this.name = name;
    this.time = time;
} 

function Chef() {
    this.status = "ready"; // cooking    
}

Chef.prototype.isAbailable = function () {
    return this.status === "ready";
}

Chef.prototype.cookAsync = function (menu) {
    var chef = this;

    chef.status = "cooking";

    return new Promise(function(resolve) {
        setTimeout(function(){
            chef.status = "ready";
            resolve();
        }, menu.time);
    });  
}


function Server(servingTime) {
    this.status = "waiting";
    this.servingTime = servingTime;
}

Server.prototype.isAbailable = function() {
    return this.status === "waiting";
}
Server.prototype.serveAsync = function (menu) {
    var server = this;
    
    server.status = "serving";

    return new Promise(function(resolve) {
        setTimeout(function() {
            server.status = "waiting";
            resolve();
        }, server.servingTime)
    })
}


var orders = [];
var cookings = [];
var servings = [];

var chefs = [new Chef(), new Chef()];
var servers = [new Server(1000), new Server(2000)];

function renderList(id, list) {
    var orderEl = document.getElementById(id);

    orderEl.innerHTML = "";
    list.forEach(function (order) {
        var liEl = document.createElement("li");
        liEl.textContent = order.name;
        orderEl.append(liEl);
    });
}

function renderOrders() {
    renderList("orders", orders);
}

function rendercookings() {
    renderList("cooking", cookings);
}

function renderservings() {
    renderList("serving", servings);
}

// function renderOrders() {
//     var orderEl = document.getElementById("orders")

//     orderEl.innerHTML = "";
//     orders.forEach(function (order){
//         var liEl = document.createElement("li");
//         liEl.textContent = order.name;
//         orderEl.append(liEl);
//     })
// }

// function rendercookings() {
//     var cookingEl = document.getElementById("cooking");
//     cookingEl.innerHTML = "";
//     cookings.forEach(function (order){
//         var liEl = document.createElement("li");
//         liEl.textContent = order.name;
//         cookingEl.append(liEl);
//     })
// }

// function renderservings() {
//     var orderEl = document.getElementById("serving");
//     orderEl.innerHTML = "";
//     servings.forEach(function (order){
//         var liEl = document.createElement("li");
//         liEl.textContent = order.name;
//         orderEl.append(liEl);
//     })
// }

document.getElementById("sundea").onclick = function () {    
    run(new Menu("순대국", 1000));
}

document.getElementById("heajang").onclick = function () {
    run(new Menu("해장국", 2000));
}

function findChefAsync() {
    return new Promise(function (resolve) {
        function findChef() {
            var availableChef = chefs.find(function(chef) {
                return chef.isAbailable();
            });

            if (availableChef){
                resolve(availableChef);
            }
            else {
                setTimeout(findChef, 300);
            }
        }    

        findChef();    
    });   
    
}

function findServerAsync() {
    return new Promise(function (resolve){
        function findServer() {
            var availableServer = servers.find(function(server){
                return server.isAbailable();
            })
            if (availableServer){
                resolve(availableServer);
            }
            else {
                setTimeout(findServer, 300)};

        }
        findServer();
    })
}

// 주문, 요리, 서빙의 메인 프로세스는 이 함수에서 전부 처리되어야 한다.
// 화면이 뻗으면 안됨

function run(menu) {
    //주문 목록의 추가, 출력
    orders.push(menu);
    renderOrders();

    findChefAsync()
    .then(function(chef) {
        orders.splice(orders.indexOf(menu), 1);
        cookings.push(menu);
        renderOrders();
        rendercookings();
        
        return chef.cookAsync(menu);        
    })
    .then(function () {
        cookings.splice(cookings.indexOf(menu), 1);
        rendercookings();

        return findServerAsync();
    })
    .then(function(server) {
        servings.push(menu);
        renderservings();

        return server.serveAsync(menu);
    })
    .then(function() {
        servings.splice(servings.indexOf(menu), 1);
        renderservings();
    });
}