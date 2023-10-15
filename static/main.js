$(document).ready(async function () {

    var zeroPointOne = null;
    infos = await localGet();
    
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
    
    function removeRow(key) {
        const len = Object.keys(infos).length;
        for (var i=key; i<len-1; i++){
            window['infos'][i] = infos[i+1];
        }
        delete infos[len-1];
        reRender();
    }
    
    const tableHandler = function(e) {
        const clicked = e.currentTarget;
        const clickedkey = parseInt(clicked.parentElement.parentElement.id.replace("tableitem", ""));
    
        if (clicked.classList.contains("table_name")) {
            window["infos"][clickedkey]["name"] = clicked.value;
        } else if (clicked.classList.contains("table_price")) {
            window["infos"][clickedkey]["price"] = parseFloat(clicked.value);
        } else if (clicked.classList.contains("table_importance")) {
            window["infos"][clickedkey]["importance"] = parseInt(clicked.value);
        } else if (clicked.classList.contains("table_delete")) {
            removeRow(clickedkey);
        }
        // reRender();  // don't because it cancels focus
        renderBar(window["infos"]);
        localSave(window["infos"]);
        // result.innerText = e.target.value;
    }
    
    function renderTable(infos){
        var table = $(".container table tbody")[0];
        table.innerHTML = "<tr><th>Item</th><th>Price</th><th>Importance</th><th>Delete</th></tr>";
    
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
    
            const d = document.createElement("td");
    
            const e = document.createElement("button");
            e.style.background = "#BB4444";
            e.classList = "table_delete";
            e.style.height = "30px";
            e.style.width = "90%";
            e.style.margin = "auto";
            $(e).on("click", tableHandler);
    
            d.appendChild(e)
    
            node.appendChild(a);
            node.appendChild(b);
            node.appendChild(c);
            node.appendChild(d);
            
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
    
        for (var key in infos) {
            const node = document.createElement("div");
            node.setAttribute("draggable", "true");
            node.addEventListener("dragstart", function (event) {
                event.dataTransfer.setData("text/plain", parseInt(event.target.id.replace("baritem", "")));
                // $("body")[0].style.backgroundColor = "#FFDDDD";
            });
    
            node.style.order = infos[key]["importance"]*10;  // all orders times 10 so 0.1 works
            if (key == window["zeroPointOne"]) {
                node.style.order = infos[key]["importance"]*10-1;  // topmost of bottom
            }
            node.id = "baritem" + key.toString();
            node.className = "bar";
    
            node.style.backgroundColor = `rgb(${r(infos[key]["name"]) + 128}, ${r(infos[key]["price"]) + 128}, ${r(infos[key]["name"]) + 128})`;
            node.style.flex = infos[key]["price"] / calculateTotalBudget(infos);
    
            var offsetHeight = $(".bar-container")[0].offsetHeight * infos[key]["price"] / calculateTotalBudget(infos);
            if (offsetHeight > 1000) {
                node.innerHTML = `
                <div class="bar">
                    <div class="bar-content">
                        <div class="bar-details">
                            <p class="bar-name">${infos[key]["name"]}</p>
                            <p class="bar-price">$${infos[key]["price"]}</p>
                        </div>
                    <div class="bar-importance">${infos[key]["importance"]}</div>
                </div>
                `;
            } else if(offsetHeight <= 1000 && offsetHeight >= 20){
                node.innerHTML = `
                <div class="bar small-height">
                    <div class="bar-content">
                        <div class="bar-details">
                            <p class="bar-name">${infos[key]["name"]}</p>
                            <p class="bar-price">$${infos[key]["price"]}</p>
                        </div>
                    <div class="bar-importance">${infos[key]["importance"]}</div>
                </div>
                `;
            } else if (offsetHeight < 20) {
                node.style.display = "none";
            }
            node.addEventListener("dragover", function (event) {
                event.preventDefault();
            });
    
            node.addEventListener("drop", function (event) {
                event.preventDefault();
                const fromKey = parseInt(event.dataTransfer.getData("text/plain"));
                const target = event.currentTarget;
                // replaces the dropped item, being on the bottom of it. if it is blank space, go to the very top
                if (target.id == "bar-container" || target.id == "baritem"+fromKey.toString()) {
                    var lightest = 1000000;
                    for (var key in window["infos"]) {
                        var temp = window["infos"][key]["importance"];
                        if (temp < lightest) {
                            lightest = temp;
                        }
                    }
                    window["infos"][fromKey]["importance"] = lightest - 1;
                } else {
                    const toKey = parseInt(target.id.replace("baritem", ""));
                    const toWeight = window["infos"][toKey]["importance"];
                    window["infos"][fromKey]["importance"] = toWeight + 1;  // this causes jankiness
                }
                window["zeroPointOne"] = fromKey;
    
                // $("body")[0].style.backgroundColor = "#FFFFFF";
    
                reRender();
            });
    
            bar.appendChild(node);
        }
    }
    
    function localSave(infos) {
        // localStorage.setItem("infosave", JSON.stringify(infos));
        fetch('/budget-planner', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(infos)
        });
    }
    async function localGet() {
        // infos = localStorage.getItem("infosave");
        // if (infos === null) {
        //     infos = {
        //         0: {"name": "groceries", "price": 200, "importance": 8},
        //         1: {"name": "rent", "price": 600, "importance": 9},
        //         2: {"name": "John", "price": 900, "importance": 7},
        //         3: {"name": "Noor", "price": 800, "importance": 4}
        //     };
        //     localStorage.setItem("infosave", JSON.stringify(infos))
        // } else {
        //     infos = JSON.parse(infos);
        // }

        infos = await fetch('/usersDatabase', {
            method: 'GET'
        }).then(response => response.json())

        return infos
        // return infos;
    }
    function reRender(){
        renderTable(infos);
        renderBar(infos);
        localSave(infos);
    }
    reRender();
    
    
    $("#addbutton").on("click", function(event) {
        $("#addform")[0].style.display = "initial";
    });
    
    $("#addform > form").on("submit", function(event) {
        event.preventDefault();
    
        var i = $("#addform_importance")[0].value;
        if (i === null || i == "") {
            i = $("#addform_importance")[0].placeholder;
        }

        window["infos"][Object.keys(window["infos"]).length] = {
            "name": $("#addform_name")[0].value,
            "price": parseFloat($("#addform_price")[0].value),
            "importance": parseInt(i)
        }
        $("#addform")[0].style.display = "none";
        console.log(window["infos"]);
        reRender();
    })

    $("#addform_name").on("focusout", function(event) {
        const name = $("#addform_name")[0].value;
        fetch(`http://localhost:5000/importance/${name}`, {
            method: 'GET'
        }).then(response => response.json())
        .then(response => {
            $("#addform_importance")[0].placeholder = parseInt(response["importance"]);
        });
    });
    
    
    });