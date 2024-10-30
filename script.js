const container = document.getElementById("map_container");
const popup = document.getElementById("popup");
const inputPopup = document.getElementById("inputPopup");
const buttonAdd = document.getElementById("buttonAdd");
const popupCloseButton = document.getElementById("popupClose");
const routeButton = document.getElementById("routeButton");
const routeButtonInputClean = document.getElementById("routeButtonInputClean");
const routeButtonDelete = document.getElementById("routeButtonDelete");
const routeButtonReverse = document.getElementById("routeButtonReverse");


const canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Устанавливаем размеры канваса при загрузке страницы
function setCanvasSize() {
    canvas.width = container.clientWidth; // Устанавливаем ширину
    canvas.height = container.clientHeight; // Устанавливаем высоту
}

// Устанавливаем размеры канваса при загрузке
setCanvasSize();

// Пересчитываем размеры канваса при изменении размеров окна
window.addEventListener('resize', setCanvasSize);



let coordX, coordY;
let isDragging = false; // флаг для отслеживания перемещения
let dragTimeout = null; // Флаг для определения задержки после завершения перетаскивания
let currentLi = null; // Текущий элемент li, над которым находится мышь

// Функция для получения координат клика на карте
function coordinates(event) {
    coordX = event.clientX;
    coordY = event.clientY;
}

// Открыть всплывающее окно
function popupOpen() {
    popup.classList.add("active");
    popup.disabled = false;
    inputPopup.focus();
}

// Закрыть всплывающее окно
function popupClose() {
    popup.classList.remove("active");
    popup.disabled = true;
    inputPopup.value = "";
}

// Добавляем обработчик клика на контейнер (карту)
container.addEventListener('click', function (event) {
    if (!isDragging && !dragTimeout) {  // Открываем popup только если не было перетаскивания
        coordinates(event);
        popupOpen();
    }
    dragTimeout = null;  // Сбрасываем флаг после клика
});

// Функция для добавления нового офиса на карту
function addNewWaypoint() {
    const newWaypoint = document.createElement("li");
    newWaypoint.textContent = inputPopup.value;
    container.append(newWaypoint);

    newWaypoint.setAttribute("style", `top: ${coordY}px; left: ${coordX}px;`);

    // Добавляем возможность перетаскивать новые офисы
    addDragFunctionality(newWaypoint);
    addDeleteFunctionality(newWaypoint); // Добавляем функционал удаления
}

// Добавляем перетаскивание для элементов <li>
function addDragFunctionality(liElement) {
    liElement.addEventListener('mousedown', function (event) {
        coordX = event.clientX;
        coordY = event.clientY;
        isDragging = true; // Устанавливаем флаг, что началось перетаскивание

        liElement.setAttribute("style", `top: ${coordY}px; left: ${coordX}px;`);

        // Добавляем событие перемещения элемента при движении мыши
        document.addEventListener('mousemove', moveElement);

        function moveElement(event) {
            coordX = event.clientX;
            coordY = event.clientY;
            liElement.style.top = `${coordY}px`;
            liElement.style.left = `${coordX}px`;
        }

        // Убираем событие перемещения при отпускании мыши
        document.addEventListener('mouseup', function () {
            document.removeEventListener('mousemove', moveElement);
            isDragging = false; // Перетаскивание завершилось

            // Устанавливаем задержку после отпускания мыши, чтобы избежать вызова события клика
            dragTimeout = setTimeout(() => {
                dragTimeout = null;
            }, 50);  // Небольшая задержка, чтобы клик не сработал после перетаскивания
        }, { once: true }); // событие должно сработать один раз
    });
}

// Добавляем возможность удаления элемента <li>
function addDeleteFunctionality(liElement) {
    liElement.addEventListener('mouseenter', () => {
        currentLi = liElement; // Сохраняем текущий элемент, над которым мышка
    });

    liElement.addEventListener('mouseleave', () => {
        currentLi = null; // Убираем элемент, если мышка ушла
    });
}

// Удаление элемента при нажатии клавиши Delete
document.addEventListener('keydown', (event) => {
    if (event.key === 'Delete' && currentLi) {
        currentLi.remove(); // Удаляем текущий элемент
        currentLi = null; // Сбрасываем переменную
    }
});

// Обработчик кнопки добавления нового элемента
buttonAdd.addEventListener('click', function () {
    if (inputPopup.value != "") {
        sendOfficeName();
    }
});

// Функция для добавления нового офиса и закрытия popup
function sendOfficeName() {
    addNewWaypoint();
    popupClose();
}

// Обработчик нажатия клавиши Enter в поле ввода
inputPopup.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && inputPopup.value != "") {
        event.preventDefault(); // Предотвращаем стандартное поведение Enter (если нужно)
        sendOfficeName();
    }
});

// Закрытие всплывающего окна при нажатии кнопки
popupCloseButton.addEventListener('click', function () {
    if (popup.classList.contains("active") || popup.disabled == false) {
        popupClose();
    }
});

// Применяем функции для уже существующих <li> элементов (если они есть)
document.querySelectorAll("li").forEach(addDragFunctionality);
document.querySelectorAll("li").forEach(addDeleteFunctionality);





//================ Начало логики =============

const startOffice = document.getElementById('start-office');

const endOffice = document.getElementById('end-office');

let waypoints = document.querySelectorAll("#map_container li"); // Все текущие элементы li


function makeRoute(){
    // Очищаем canvas перед рисованием новой линии
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Считываем значения инпутов каждый раз, когда вызываем makeRoute
    let startOfficeValue = parseFloat(startOffice.value); // Преобразуем в число
    let endOfficeValue = parseFloat(endOffice.value); // Преобразуем в число

    if (isNaN(startOfficeValue) || isNaN(endOfficeValue)) {
        console.log("Одно из значений не является числом");
        return; // Завершаем выполнение, если одно из значений NaN
    }

    let moreless = startOfficeValue < endOfficeValue;
    console.log("start:", startOfficeValue);
    console.log("end:", endOfficeValue);
    console.log("moreless:", moreless);

    
    // Проверяем каждый элемент li
    waypoints.forEach((li) => {
        let position = parseFloat(li.textContent); // Получаем текстовое содержимое и преобразуем в число
        li.classList.remove("endOfficeValue");
        li.classList.remove("startOfficeValue");


        // Получаем координаты через getComputedStyle
        const computedStyle = getComputedStyle(li);
        let posX = parseInt(computedStyle.left);
        let posY = parseInt(computedStyle.top);


        if (position === startOfficeValue) {
            console.log("Начальный офис найден:", position);
            li.classList.add("startOfficeValue");

            startCoords = { x: posX, y: posY }; // Сохраняем координаты начального офиса
            if (startCoords) {
                ctx.beginPath(); // Начинаем новый путь
                ctx.moveTo(startCoords.x, startCoords.y); // Начальная точка
            };

            if (moreless == true) {
                console.log("moreless = true");
                // Ваша логика для случая, когда moreless истинно
                
                while (position < endOfficeValue) {
                
                console.log("Позиция до", position);
                position += 1;
                console.log("позиция после", position);
                waypoints.forEach((li) => {
                    if(li.textContent == position){
                        const computedStyle = getComputedStyle(li);
                        let posX = parseInt(computedStyle.left);
                        let posY = parseInt(computedStyle.top);
                        endCoords = { x: posX, y: posY }; // Сохраняем координаты конечного офиса
                        ctx.lineTo(endCoords.x, endCoords.y); // Конечная точка
                        
                        ctx.stroke(); // Рисуем линию
                        // startCoords = endCoords; // Сохраняем координаты этой точки
                    } 
                    // else{
                    //     position += 1;
                    // }
                });
                }
                
            } else {
                console.log("moreless = false");
                // Ваша логика для случая, когда moreless ложно


                while (position > endOfficeValue) {
                
                console.log("Позиция до", position);
                position -= 1;
                console.log("позиция после", position);
                waypoints.forEach((li) => {
                    if(li.textContent == position){
                        const computedStyle = getComputedStyle(li);
                        let posX = parseInt(computedStyle.left);
                        let posY = parseInt(computedStyle.top);
                        endCoords = { x: posX, y: posY }; // Сохраняем координаты конечного офиса
                        ctx.lineTo(endCoords.x, endCoords.y); // Конечная точка
                        
                        ctx.stroke(); // Рисуем линию
                        // startCoords = endCoords; // Сохраняем координаты этой точки
                    } 
                    // else{
                    //     position -= 1;
                    // }
                });
            }
             }

            
            


            
        } 
        else if (position === endOfficeValue) {
            console.log("Конечный офис найден:", position);
            li.classList.add("endOfficeValue");

            // endCoords = { x: posX, y: posY }; // Сохраняем координаты конечного офиса

        } 
    });
    // Теперь рисуем линию, если оба офиса найдены
    // if (startCoords && endCoords) {
    //     ctx.beginPath(); // Начинаем новый путь
    //     ctx.moveTo(startCoords.x, startCoords.y); // Начальная точка
    //     ctx.lineTo(endCoords.x, endCoords.y); // Конечная точка
    //     ctx.stroke(); // Рисуем линию
        

    // } else {
    //     console.log("Один из офисов не найден.");
    // }
};

// Обработчик кнопки создания маршрута
routeButton.addEventListener('click', function (event) {
    event.preventDefault();
    if (startOffice.value != "" && endOffice.value != "") {
        makeRoute();
    } else {
        console.log("input empty")
    }
});
routeButtonInputClean.addEventListener('click', function (event) {
    event.preventDefault();
    startOffice.value = ""; 
    endOffice.value = "";
});
routeButtonDelete.addEventListener('click', function (event) {
    event.preventDefault();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    waypoints.forEach((li) => {
        li.classList.remove("endOfficeValue");
        li.classList.remove("startOfficeValue");
    });
});

routeButtonReverse.addEventListener('click', function (event) {
    event.preventDefault();
    let startReverse = startOffice.value;
    let endReverse = endOffice.value;
    startOffice.value = endReverse;
    endOffice.value = startReverse;
});
