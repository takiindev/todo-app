let listItem = JSON.parse(localStorage.getItem("listItem")) || [];
// console.log(listItem);
let list = document.querySelector(".list");

// Phần render
// listItem.forEach((item) => {
//   if (item.text != "") {
//     render(item.text, item.done);
//   }
// });
renderAll();
function render(text, done) {
  const typeFilter = document.querySelector(".select select").value;
  if (typeFilter != 1) {
    if (typeFilter == 2 && !done) {
      return;
    }
    if (typeFilter == 3 && done) {
      return;
    }
  }
  list.innerHTML += `<li class="item" draggable="true">
          <div class="status ${done ? "done" : ""}">
            <div class="fake_checkbox">
                <img src="./assets/icon/tick.svg">
            </div>
            <input type="checkbox" style="display: none" name=""
            }" ${done ? "checked" : ""} />
          </div>
          <h1 class="content">${text}</h1>
        </li>`;
}

// Phần sử lý sự kiện khi click
list.addEventListener("click", (e) => {
  let item = e.target.closest(".fake_checkbox");
  if (!item || !list.contains(item)) return;
  item = e.target.closest(".item");
  const checkBox = item.querySelector("input[type='checkbox']");
  const status = item.querySelector(".status");
  checkBox.checked = !checkBox.checked;
  status.classList.toggle("done", checkBox.checked);
  let undoStack = JSON.parse(localStorage.getItem("undoStack"));
  let idx;
  list.querySelectorAll(".item").forEach((e, index) => {
    if (e == item) {
      console.log(index);
      idx = index;
    }
  });
  undoStack.push({
    action: "changeStatus",
    index: idx,
  });
  localStorage.setItem("undoStack", JSON.stringify(undoStack));
  updateListItem();
});

// code cũ
// let items = document.querySelectorAll(".item");

// items.forEach((element) => {
//   element.addEventListener("click", () => {
//     const checkBox = element.querySelector("input");
//     const status = element.querySelector(".status");

//     checkBox.checked = !checkBox.checked;
//     status.classList.toggle("done", checkBox.checked);
//     updateListItem();
//     console.log(listItem)
//   });
// });

//  Phân sử lý sự kiến kéo thả và cập nhật vị trí khi kéo //

let draggingItem = null;
let draggingItemIdx = -1;
list.addEventListener("dragstart", (e) => {
  document.querySelector(".trashContainer").style.display = "flex";
  const item = e.target.closest(".item");
  if (!item || !list.contains(item)) return;
  draggingItem = item;
  item.classList.add("dragging");
  list.querySelectorAll(".item").forEach((element, index) => {
    if (element === draggingItem) {
      draggingItemIdx = index;
    }
  });
});

const trash = document.querySelector(".trashContainer");

trash.addEventListener("dragenter", (e) => {
  if (!trash.contains(e.relatedTarget)) {
    trash.classList.add("mouseOn");
  }
});

trash.addEventListener("dragleave", (e) => {
  if (!trash.contains(e.relatedTarget)) {
    trash.classList.remove("mouseOn");
  }
});

list.addEventListener("dragend", (e) => {
  const rect = trash.getBoundingClientRect();

  // Tâm hình tròn
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Bán kính (giả sử là hình tròn hoàn hảo)
  const radius = rect.width / 2;

  // Khoảng cách từ chuột tới tâm
  const dx = e.clientX - centerX;
  const dy = e.clientY - centerY;

  const isInsideCircle = dx * dx + dy * dy <= radius * radius;

  if (isInsideCircle) {
    let undoStack = JSON.parse(localStorage.getItem("undoStack"));
    let idx;
    undoStack.push({
      action: "removeItem",
      index: draggingItemIdx,
      element: JSON.parse(JSON.stringify(listItem[draggingItemIdx])),
    });
    localStorage.setItem("undoStack", JSON.stringify(undoStack));
    draggingItem.remove();
    updateListItem();
  }

  document.querySelector(".trashContainer").style.display = "none";

  if (document.querySelector(".select select").value == 1) {
    list.querySelectorAll(".item").forEach((element, index) => {
      if (element === draggingItem && draggingItemIdx != index) {
        let undoStack = JSON.parse(localStorage.getItem("undoStack"));
        undoStack.push({
          action: "changeIdx",
          from: draggingItemIdx,
          to: index,
          element: JSON.parse(JSON.stringify(listItem[draggingItemIdx])),
        });
        localStorage.setItem("undoStack", JSON.stringify(undoStack));
      }
    });
  }
  const item = e.target.closest(".item");
  if (!item || !list.contains(item)) return;
  draggingItem = null;
  item.classList.remove("dragging");
  if (document.querySelector(".select select").value == 1) {
    updateListItem();
  }
});

// code cũ
// items.forEach((element) => {
//   element.addEventListener("dragstart", () => {
//     draggingItem = element;
//     element.classList.add("dragging");
//   });

//   element.addEventListener("dragend", () => {
//     draggingItem = null;
//     element.classList.remove("dragging");
//     updateListItem();
//   });
// });

list.addEventListener("dragover", (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(list, e.clientY);

  if (afterElement == null) {
    list.appendChild(draggingItem);
  } else {
    list.insertBefore(draggingItem, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// Phần cập nhật lại danh sách việc cần làm vào localStorage và mảng listItem
function updateListItem() {
  newListItem = [];
  list.querySelectorAll(".item").forEach((item, index) => {
    const text = list.children[index].querySelector(".content").innerText;
    const done = list.children[index].querySelector("input").checked;
    newListItem.push({ text, done });
  });
  listItem = newListItem;
  // console.log(listItem);
  localStorage.setItem("listItem", JSON.stringify(listItem));
  // console.log(listItem);
}

// Phần nhập và thêm công việc mới
const submitBtn = document.querySelector(".searchBar button");
const input = document.querySelector(".searchBar input");
input.addEventListener("keyup", (e) => {
  e.preventDefault();
  if (e.key === "Enter") {
    e.preventDefault();
    submitBtn.click();
  }
});

let canSend = true;
submitBtn.addEventListener("click", (e) => {
  canSend = false;
  if (!canSend) {
    let text = input.value.trim();
    input.value = "";
    submit(text, false);
  }
});

function submit(text, done) {
  if (text != "") {
    listItem.push({ text, done });
    localStorage.setItem("listItem", JSON.stringify(listItem));
    render(text, done);
    list.scrollTo({
      top: list.scrollHeight,
      behavior: "smooth",
    });

    let undoStack = JSON.parse(localStorage.getItem("undoStack"));
    undoStack.push({
      action: "addItem",
    });
    localStorage.setItem("undoStack", JSON.stringify(undoStack));

    canSend = true;
  }
}

// xấy chức năng undo
if (!localStorage.getItem("undoStack")) {
  localStorage.setItem("undoStack", JSON.stringify([]));
}

let canUndo = true;
window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (
    (e.ctrlKey || e.metaKey) &&
    e.key === "z" &&
    canUndo &&
    document.querySelector(".select select").value == 1
  ) {
    canSend = false;
    // console.log("Undo action triggered");
    let undoStack = JSON.parse(localStorage.getItem("undoStack"));
    const lastAction = undoStack[undoStack.length - 1];
    if (lastAction) {
      if (lastAction.action === "changeIdx") {
        const fromIdx = lastAction.from;
        const toIdx = lastAction.to;
        const element = lastAction.element;
        const movedItem = listItem.splice(toIdx, 1)[0];
        listItem.splice(fromIdx, 0, movedItem);
      }

      if (lastAction.action == "addItem") {
        listItem.pop();
      }
      if (lastAction.action == "changeStatus") {
        list.querySelectorAll(".item").forEach((e, idx) => {
          if (idx == lastAction.index) {
            e.click();
          }
        });
      }

      if (lastAction.action == "removeItem") {
        listItem.splice(lastAction.index, 0, lastAction.element);
        localStorage.setItem("listItem", JSON.stringify(listItem));
        renderAll();
      }

      if (lastAction.action == "changeContent") {
        listItem[lastAction.index].text = lastAction.oldCT;
      }
      undoStack.pop();
      localStorage.setItem("undoStack", JSON.stringify(undoStack));
      renderAll();
      updateListItem();
      canSend = true;
    }
  }
});

function renderAll() {
  if(listItem.length == 0){
    list.classList.add("listNone")
  }else{
    list.classList.remove("listNone")
  }
  list.innerHTML = "";
  listItem.forEach((item) => {
    if (item.text != "") {
      render(item.text, item.done);
    }
  });
}

// đối với đổi vị trí
// let changeIdx =  {
//   action: "changeIdx",
//   from: 2,
//   to: 5,
//   element: null,
// }

const select = document.querySelector(".select");
select.querySelector("select").addEventListener("change", (e) => {
  if (e.target.value == 1) {
    select.querySelector(".fake").innerText = "Tất cả";
  } else if (e.target.value == 2) {
    select.querySelector(".fake").innerText = "Đã làm";
  } else {
    select.querySelector(".fake").innerText = "Chưa làm";
  }
  renderAll();
});

let elementEdting = null;
let elementEdtingidx = -1;

const editor = document.querySelector(".editor");

list.addEventListener("dblclick", (e) => {
  let item = e.target.closest(".content");
  if (!item || !list.contains(item)) return;
  elementEdting = e.target.closest(".item");
  editor.querySelector("textarea").value = elementEdting.querySelector(".content").innerText;
  editor.style.display = "flex";
  list.querySelectorAll(".item").forEach((element, index) => {
    if (element === elementEdting) {
      elementEdtingidx = index;
    }
  });
});

editor.querySelector("button").addEventListener("click", (e) => {
  console.log();
  const oldCT = elementEdting.querySelector(".content").innerText;
  elementEdting.querySelector(".content").innerText =
    editor.querySelector("textarea").value;

  let undoStack = JSON.parse(localStorage.getItem("undoStack"));
  let idx;
  undoStack.push({
    action: "changeContent",
    index: elementEdtingidx,
    oldCT: oldCT,
  });

  localStorage.setItem("undoStack", JSON.stringify(undoStack));
  editor.style.display = "none";
  updateListItem();
});

const ta = document.querySelector("textarea");

ta.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
  }
});