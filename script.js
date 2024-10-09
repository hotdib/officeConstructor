const container = document.getElementById("map_container");
const popup = document.getElementById("popup");
const input = document.getElementById("input");
const button = document.getElementById("button");

let coordX, coordY;

let isDragging = false; // флаг для отслеживания перемещения
let dragTimeout = null; // Флаг для определения задержки после завершения перетаскивания

// Функция для получения координат клика на карте
function coordinates(event) {
	coordX = event.clientX;
	coordY = event.clientY;
}

// Открыть всплывающее окно
function popupOpen() {
	popup.classList.add("active");
	popup.disabled = false;
	input.focus();
}

// Добавляем обработчик клика на контейнер (карту)
container.addEventListener('click', function (event) {
	if (!isDragging && !dragTimeout) {  // Открываем popup только если не было перетаскивания
		coordinates(event);
		popupOpen();
		console.log(isDragging)
	}
	dragTimeout = null;  // Сбрасываем флаг после клика
});

// Функция для добавления нового офиса на карту
function addNewWaypoint() {
	const newWaypoint = document.createElement("li");
	newWaypoint.textContent = input.value;
	container.append(newWaypoint);

	newWaypoint.setAttribute("style", `top: ${coordY}px; left: ${coordX}px; position: absolute;`);

	// Добавляем возможность перетаскивать новые офисы
	addDragFunctionality(newWaypoint);
}

// Функция отправки имени офиса

function sendOfficeName() {
	addNewWaypoint();
	popup.classList.remove("active");
	input.value = "";
	popup.disabled = true;
}

button.addEventListener('click', function (event) {
	if (input.value != "") {
		sendOfficeName()
	}
});

// Обработчик нажатия клавиши Enter на поле ввода
input.addEventListener('keydown', function (event) {
	if (event.key === 'Enter' && input.value != "") {
		event.preventDefault(); // Предотвращаем стандартное поведение Enter (если нужно)
		sendOfficeName();
	}
});


// Добавление перетаскивания для всех элементов <li>
function addDragFunctionality(liElement) {
	liElement.addEventListener('mousedown', function (event) {
		coordX = event.clientX;
		coordY = event.clientY;
		isDragging = true; // Устанавливаем флаг, что началось перетаскивание
		console.log(isDragging)
		console.log("Mouse down on element:", liElement);
		liElement.setAttribute("style", `top: ${coordY}px; left: ${coordX}px; position: absolute;`);

		// Добавляем событие перемещения элемента при движении мыши
		document.addEventListener('mousemove', moveElement);

		function moveElement(event) {
			coordX = event.clientX;
			coordY = event.clientY;
			liElement.style.top = `${coordY}px`;
			liElement.style.left = `${coordX}px`;
			console.log("Mouse move ", liElement);
		}

		// Убираем событие перемещения при отпускании мыши
		document.addEventListener('mouseup', function () {
			document.removeEventListener('mousemove', moveElement);
			isDragging = false; // Перетаскивание завершилось


			console.log(isDragging)
			console.log("Mouse up", liElement);

			// Устанавливаем задержку после отпускания мыши, чтобы избежать вызова события клика
			dragTimeout = setTimeout(() => {
				dragTimeout = null;
			}, 50);  // Небольшая задержка, чтобы клик не сработал после перетаскивания
		}, { once: true }); // событие должно сработать один раз
	});
}

// Применяем функцию перетаскивания для уже существующих <li> (если они есть)
document.querySelectorAll("li").forEach(addDragFunctionality);
