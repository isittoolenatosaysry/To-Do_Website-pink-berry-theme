const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const prioritySelect = document.getElementById("prioritySelect");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.classList.add(task.priority);
        li.draggable = true;

        if (task.completed) {
            li.classList.add("completed");
        }

        // Text-Span erstellen
        const span = document.createElement("span");
        span.textContent = task.text;
        li.appendChild(span);

        // 🔵 DOPPELKLICK ZUM BEARBEITEN (HIER gehört es hin!)
        span.addEventListener("dblclick", () => {
            const inputEdit = document.createElement("input");
            inputEdit.type = "text";
            inputEdit.value = task.text;

            li.replaceChild(inputEdit, span);
            inputEdit.focus();

            inputEdit.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    tasks[index].text = inputEdit.value;
                    saveTasks();
                    renderTasks();
                }
            });

            inputEdit.addEventListener("blur", () => {
                tasks[index].text = inputEdit.value;
                saveTasks();
                renderTasks();
            });
        });

        // Erledigt markieren (nur wenn NICHT auf Input geklickt wird)
        li.addEventListener("click", (e) => {
            if (e.target.tagName === "INPUT") return;

            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            renderTasks();
        });

        // Löschen Button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";
        deleteBtn.classList.add("delete-btn");

        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });

        li.appendChild(deleteBtn);

        // Drag Events
        li.addEventListener("dragstart", () => {
            li.classList.add("dragging");
        });

        li.addEventListener("dragend", () => {
            li.classList.remove("dragging");
            updateTaskOrder();
        });

        taskList.appendChild(li);
    });
}

function updateTaskOrder() {
    const items = document.querySelectorAll("#taskList li");
    const newTasks = [];

    items.forEach(item => {
        const text = item.firstChild.textContent;
        const task = tasks.find(t => t.text === text);
        if (task) newTasks.push(task);
    });

    tasks = newTasks;
    saveTasks();
}

taskList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(taskList, e.clientY);

    if (afterElement == null) {
        taskList.appendChild(dragging);
    } else {
        taskList.insertBefore(dragging, afterElement);
    }
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

addBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (text === "") return;

    tasks.push({ 
        text: text, 
        completed: false,
        priority: prioritySelect.value
    });
    input.value = "";
    saveTasks();
    renderTasks();
});

input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addBtn.click();
    }
});

renderTasks();