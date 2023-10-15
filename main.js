$(document).ready(function () {
infos = {
    0: {"name": "groceries", "price": 200, "importance": 8},
    1: {"name": "rent", "price": 600, "importance": 9},
    2: {"name": "John", "price": 900, "importance": 7},
    3: {"name": "Noor", "price": 800, "importance": 4}
};

function h(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        h = (h << 5) - h + c;
        h |= 0;
    }
    return h;
}
  
function r(s) {
    return Math.abs(h(s.toString())) % 128;
}


const tableHandler = function(e) {
    const clicked = e.currentTarget;
    const clickedkey = parseInt(clicked.parentElement.parentElement.id.replace("tableitem", ""));

    if (clicked.classList.contains("table_name")) {
        infos[clickedkey]["name"] = clicked.value;
    } else if (clicked.classList.contains("table_price")) {
        infos[clickedkey]["price"] = parseFloat(clicked.value);
    } else if (clicked.classList.contains("table_importance")) {
        infos[clickedkey]["importance"] = parseInt(clicked.value);
    }
    // reRender();
    renderBar(infos);
    // result.innerText = e.target.value;
}


function renderTable(infos){
    var table = $(".container table tbody")[0];
    table.innerHTML = "<tr><th>Item</th><th>Price</th><th>Importance</th></tr>";

    for (var key in infos){
        const node = document.createElement("tr");
        node.id = "tableitem" + key.toString();
        
        const a = document.createElement("td");
        a.innerHTML = '<input type="text" class="table_name"></input>';
        a.children[0].value = infos[key]["name"];
        const b = document.createElement("td");
        b.innerHTML = '<input type="text" class="table_price"></input>';
        b.children[0].value = infos[key]["price"];
        const c = document.createElement("td");
        c.innerHTML = '<input type="text" class="table_importance"></input>';
        c.children[0].value = infos[key]["importance"];

        node.appendChild(a);
        node.appendChild(b);
        node.appendChild(c);
        
        table.appendChild(node);
    }
    $(".container table tbody input").on("focusout", tableHandler);
}
function calculateTotalBudget(infos) {
    let totalBudget = 0;
  
    for (const key in infos) {
      totalBudget += infos[key].price;
    }
  
    return totalBudget;
  }
  

  function renderBar(infos) {
    var bar = $(".bar-container")[0];
    bar.innerHTML = "";
    bar.style.backgroundColor = "rgb(240, 240, 240)";

    const bars = [];

    for (var key in infos) {
        const node = document.createElement("div");
        node.setAttribute("draggable", "true");
        node.addEventListener("dragstart", function (event) {
            event.dataTransfer.setData("text/plain", key);
        });

        node.style.order = infos[key]["importance"];
        node.id = "baritem" + key.toString();
        node.className = "bar";
        node.innerHTML = `
            <p class="bar_name">${infos[key]["name"]}</p>
            <p class="bar_price">${infos[key]["price"]}</p>
            <p class="bar_importance">${infos[key]["importance"]}</p>
        </div>`;
        node.style.backgroundColor = `rgb(${r(infos[key]["name"]) + 128}, ${r(infos[key]["price"]) + 128}, ${r(infos[key]["importance"]) + 128})`;
        node.style.flex = infos[key]["price"] / calculateTotalBudget(infos);

        node.addEventListener("dragover", function (event) {
            event.preventDefault();
        });

        node.addEventListener("drop", function (event) {
            event.preventDefault();
            const fromKey = event.dataTransfer.getData("text/plain");
            const fromIndex = bars.findIndex((bar) => bar.id === "baritem" + fromKey);
            const toIndex = bars.findIndex((bar) => bar.id === node.id);

            if (fromIndex !== -1 && toIndex !== -1) {
                bars[fromIndex].style.order = toIndex;
                bars[toIndex].style.order = fromIndex;
                bars.sort((a, b) => a.style.order - b.style.order); //todo: remove 
            }
        });

        bars.push(node);
        bar.appendChild(node);
    }
}

function reRender(){
    renderTable(infos);
    renderBar(infos);
}
reRender();


$("#addbutton").on("click", function(event) {
    infos[infos.length]
});




});