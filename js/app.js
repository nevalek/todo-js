document.addEventListener("DOMContentLoaded", () => {
    const objOfTasks = {};

    function updateTasks() {
        Object.keys(localStorage).forEach((key) => {
            const {title, body, complete} = JSON.parse(localStorage.getItem(key));
            objOfTasks[key] = {
                _id: key,
                title: title,
                body: body,
                complete: complete
            };
        });
    }

    updateTasks();

    //UI
    const listContainer = document.querySelector('.list-group');
    const btnStatus = document.querySelector('.btn-status');
    const form = document.forms['addTask'];
    const inputTitle = form.elements['title'];
    const textBody = form.elements['body'];

    renderAllTasks(objOfTasks, 'all');

    form.addEventListener('submit', onFormSubmitHandler);
    listContainer.addEventListener('click', onDeletehandler);
    listContainer.addEventListener('click', onEditHandler);
    listContainer.addEventListener('click', onCompleteHandler);
    btnStatus.addEventListener('click', onActiveTasksHandler);

    function onActiveTasksHandler({target}) {
        const status = target.dataset.tabStatus;
        const btnsGroupStatus = target.closest('.btn-status').querySelectorAll('[data-tab-status]');
        btnsGroupStatus.forEach((btn) => {
            //btn.classList.replace('active-category', 'btn-category');
            btn.classList.remove('active-category');
            btn.classList.add('btn-category');
            if (btn.getAttribute('data-tab-status') === status) {
                btn.classList.add('active-category');
                renderTaskStatus(status);
                return;
            }
        })
    }

    function renderTaskStatus(status) {
        listContainer.textContent = '';
        renderAllTasks(objOfTasks, status);
        return;
    }

    function renderAllTasks(tasksList, status) {
        const fragment = document.createDocumentFragment();
        Object.values(tasksList).forEach(task => {
            const li = listItemTemplate(task);
            if (task.complete) {
                li.classList.add('disabled');
            }
            switch (status) {
                case "all":
                    fragment.appendChild(li);
                    break;
                case 'active':
                    if (!task.complete) {
                        fragment.appendChild(li);
                    }
                    break;
                case 'complete':
                    if (task.complete) {
                        fragment.appendChild(li);
                    }
                    break;
                default:
                    fragment.appendChild(li);
                    break;

            }

        });
        listContainer.appendChild(fragment);
    }

    function listItemTemplate({_id, title, body, complete = false} = {}) {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'align-items-center', 'flex-wrap', 'mt-2');
        li.setAttribute('data-task-id', _id);

        const span = document.createElement('span');
        span.textContent = title;
        span.classList.add('test');
        span.style.fontWeight = 'bold';

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.classList.add('btn', 'btn-danger', 'ml-auto', 'delete-btn');

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Изменить';
        editBtn.classList.add('btn', 'btn-secondary', 'ml-auto', 'edit-btn', 'mr-1');

        const completeBtn = document.createElement('button');
        completeBtn.textContent = 'Завершить';
        completeBtn.classList.add('btn', 'btn-success', 'complete-btn');

        const article = document.createElement('p');
        article.textContent = body;
        article.classList.add('mt-w', 'w-100');

        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(completeBtn);
        li.appendChild(article);
        li.appendChild(deleteBtn);

        localStorage.setItem(_id, JSON.stringify({
            title: title,
            body: body,
            complete: complete
        }));

        return li;
    }

    function onFormSubmitHandler(e) {
        e.preventDefault();
        const titleValue = inputTitle.value;
        const bodyValue = textBody.value;

        if (!titleValue || !bodyValue) {
            alert('Заполните все поля');
            return;
        }

        const task = createNewTask(titleValue, bodyValue);
        const listItem = listItemTemplate(task);
        listContainer.insertAdjacentElement('afterbegin', listItem);
        form.reset();
    }

    function createNewTask(title, body) {
        const newTask = {
            title,
            body,
            completed: false,
            _id: `task-${Math.random()}`,
        };

        objOfTasks[newTask._id] = newTask;

        return {...newTask}
    }

    function deleteTask(id) {
        const {title} = objOfTasks[id];
        const isConfirm = confirm(`Точно вы хотите удалить задачу: ${title}`);
        if (!isConfirm) return isConfirm;
        delete objOfTasks[id];
        localStorage.removeItem(id);
        return isConfirm;
    }

    function deleteTaskFromHtml(confirmed, el) {
        if (!confirmed) return;
        el.remove();
    }

    function onDeletehandler({target}) {
        if (target.classList.contains('delete-btn')) {
            const parent = target.closest('[data-task-id]');
            const id = parent.dataset.taskId;
            const confirmed = deleteTask(id);
            deleteTaskFromHtml(confirmed, parent);
        }
    }

    function onEditHandler({target}) {
        if (target.classList.contains('edit-btn')) {
            const parent = target.closest('[data-task-id]'),
                id = parent.dataset.taskId,
                editBtn = parent.querySelector('.edit-btn');
            console.log(parent);

            if (editBtn.textContent === 'Сохранить') {
                console.log('Сохраняю');
                saveTask(id);
                return 0;
            } else {
                const title = parent.querySelector('span'),
                    body = parent.querySelector('p'),
                    editTitleInput = document.createElement('input'),
                    editBodyInput = document.createElement('textarea');
                editTitleInput.value = title.textContent;
                editTitleInput.classList.add('col-8');
                editBodyInput.classList.add('w-100', 'mt-1', 'mb-1');
                editBodyInput.value = body.textContent;
                parent.replaceChild(editTitleInput, title);
                parent.replaceChild(editBodyInput, body);
                editBtn.textContent = 'Сохранить';
                return 0;
            }
        }
    }

    function saveTask(id) {
        const task = document.querySelector(`[data-task-id="${id}"]`),
            editBtn = task.querySelector('.edit-btn'),
            inputTitle = task.querySelector('input'),
            textBody = task.querySelector('textarea'),
            title = document.createElement('span'),
            body = document.createElement('p');

        title.textContent = inputTitle.value;
        title.style.fontWeight = 'bold';
        body.textContent = textBody.value;
        body.classList.add('mt-w', 'w-100');
        task.replaceChild(title, inputTitle);
        task.replaceChild(body, textBody);
        editBtn.textContent = 'Изменить';

        localStorage.setItem(id, JSON.stringify({
            title: title.textContent,
            body: body.textContent
        }));
        updateTasks();

    }

    function onCompleteHandler({target}) {
        if (target.classList.contains('complete-btn')) {
            const parent = target.closest('[data-task-id]'),
                id = parent.dataset.taskId;
            parent.classList.add('disabled');
            const task = JSON.parse(localStorage.getItem(id));
            localStorage.setItem(id, JSON.stringify({
                ...task,
                complete: true
            }));
            updateTasks();
        }
    }
});

