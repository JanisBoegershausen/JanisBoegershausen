function keyPressed() {
    if(keyCode == 13){
        AddTodoEntry();
    }
}

// Add an entry with the given text to the todo list
function AddTodoEntry() {
  var div = document.createElement("div");
  var inputField = document.getElementById("todo-text-input");

  // HTML code for an todo list entry
  div.innerHTML =
    `
  <label class="todoListEntry">
  ` +
    inputField.value +
    `
  <input type="checkbox" />
  <span class="checkmark"></span>
  </label>
  `;

  inputField.value = "";

  // Add rightclick event for deleting
  div.onmousedown = function (event) {
    if (event.which == 3) {
      div.parentNode.removeChild(div);
    }
  };

  // Parent the verated div under the list parent
  document.getElementById("todoList").appendChild(div);
}
