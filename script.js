// Получаем элементы DOM
const taskInput = document.getElementById("taskInput");
const categorySelect = document.getElementById("categorySelect");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const totalCount = document.getElementById("totalCount");
const clearAllBtn = document.getElementById("clearAllBtn");
const themeToggle = document.getElementById("themeToggle");

const viewFilterBtns = document.querySelectorAll(".filter-btn");
const catFilterBtns = document.querySelectorAll(".cat-btn");

// Массив для хранения задач
let tasks = [];

// Текущие фильтры
let currentViewFilter = "all";
let currentCategoryFilter = "";

// Загрузка задач из localStorage
function loadTasks() {
  const storedTasks = localStorage.getItem("tasks");
  if (storedTasks) {
    tasks = JSON.parse(storedTasks);
    renderTasks();
  }
}

// Сохранение задач в localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Рендеринг задач с учётом всех фильтров
function renderTasks() {
  const searchQuery = searchInput.value.toLowerCase();

  taskList.innerHTML = "";
  let visibleCount = 0;

  tasks.forEach((task, index) => {
    // Проверка фильтров
    if (
      (currentViewFilter === "active" && task.completed) ||
      (currentViewFilter === "completed" && !task.completed) ||
      (currentCategoryFilter && task.category !== currentCategoryFilter) ||
      (searchQuery && !task.text.toLowerCase().includes(searchQuery))
    ) {
      return;
    }

    visibleCount++;

    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;

    // Категория
    let categoryLabel = "";
    if (task.category) {
      const catName = categorySelect.querySelector(`option[value="${task.category}"]`).text;
      categoryLabel = `<span class="task-category cat-${task.category}">${catName}</span>`;
    }

    li.innerHTML = `
      ${categoryLabel}
      <span class="task-text" contenteditable="false">${task.text}</span>
      <div class="task-actions">
        <button class="btn edit-btn" data-index="${index}">✏</button>
        <button class="btn delete-btn" data-index="${index}">×</button>
      </div>
    `;

    // Обработчики
    li.querySelector(".task-text").addEventListener("click", () => toggleTaskCompletion(index));
    li.querySelector(".task-text").addEventListener("dblclick", () => enableEditing(li, task, index));
    li.querySelector(".edit-btn").addEventListener("click", () => enableEditing(li, task, index));
    li.querySelector(".delete-btn").addEventListener("click", () => animateAndRemoveTask(li, index));

    taskList.appendChild(li);
  });

  totalCount.textContent = visibleCount;
}

// Добавление новой задачи
function addTask() {
  const taskText = taskInput.value.trim();
  const category = categorySelect.value;

  if (!taskText) return;

  tasks.push({
    text: taskText,
    completed: false,
    category: category,
  });

  taskInput.value = "";
  categorySelect.value = ""; // Сброс выбора категории
  saveTasks();
  renderTasks();
}

// Переключение статуса выполнения задачи
function toggleTaskCompletion(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

// Включение режима редактирования
function enableEditing(li, task, index) {
  const textSpan = li.querySelector(".task-text");
  textSpan.contentEditable = true;
  textSpan.focus();

  // Сохранение при потере фокуса или нажатии Enter
  const finishEditing = () => {
    const newText = textSpan.textContent.trim();
    if (newText) {
      task.text = newText;
      saveTasks();
      renderTasks();
    } else {
      animateAndRemoveTask(li, index);
    }
  };

  textSpan.addEventListener("blur", finishEditing);
  textSpan.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      textSpan.blur();
    }
  });
}

// Анимация удаления задачи
function animateAndRemoveTask(li, index) {
  li.classList.add("removed");

  setTimeout(() => {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  }, 400);
}

// Очистка всех задач
function clearAllTasks() {
  if (tasks.length === 0) return;

  if (confirm("Вы уверены, что хотите удалить все задачи?")) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
}

// Переключение темы
function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", document.body.classList.contains("dark-theme") ? "dark" : "light");
}

// Установка фильтра по виду (все/активные/выполненные)
function setViewFilter(filter) {
  currentViewFilter = filter;
  viewFilterBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  renderTasks();
}

// Установка фильтра по категории
function setCategoryFilter(category) {
  currentCategoryFilter = category;
  catFilterBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.cat === category);
  });
  renderTasks();
}

// Восстановление темы при загрузке
function restoreTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
  }
}

// Обработчики событий
addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});
searchInput.addEventListener("input", renderTasks);
clearAllBtn.addEventListener("click", clearAllTasks);
themeToggle.addEventListener("click", toggleTheme);

// Фильтры по виду
viewFilterBtns.forEach((btn) => {
  btn.addEventListener("click", () => setViewFilter(btn.dataset.filter));
});

// Фильтры по категориям
catFilterBtns.forEach((btn) => {
  btn.addEventListener("click", () => setCategoryFilter(btn.dataset.cat));
});

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  restoreTheme();
  loadTasks();

  // Устанавливаем активные фильтры по умолчанию
  setViewFilter("all");
  setCategoryFilter("");
});
