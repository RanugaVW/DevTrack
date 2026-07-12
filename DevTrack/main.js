const TaskManager = {
	tasks: JSON.parse(localStorage.getItem('devtrack-tasks') || '[]'),

	add(text) {
		const task = {
			id: Date.now(),
			text,
			done: false,
			createdAt: new Date().toISOString(),
		};

		this.tasks.push(task);
		this.save();
		return task;
	},

	toggle(id) {
		const task = this.tasks.find((item) => item.id === id);

		if (task) {
			task.done = !task.done;
			this.save();
		}

		return task;
	},

	delete(id) {
		this.tasks = this.tasks.filter((task) => task.id !== id);
		this.save();
	},

	save() {
		localStorage.setItem('devtrack-tasks', JSON.stringify(this.tasks));
	},

	getAll() {
		return this.tasks;
	},
};

const TaskUI = {
	listElement: document.getElementById('task-list'),
	inputElement: document.getElementById('task-input'),
	addButtonElement: document.getElementById('add-task-btn'),

	render() {
		if (!this.listElement) {
			return;
		}

		this.listElement.innerHTML = '';

		TaskManager.getAll().forEach((task) => {
			const listItem = document.createElement('li');
			listItem.className = 'task-item';

			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.checked = task.done;
			checkbox.addEventListener('click', () => {
				TaskManager.toggle(task.id);
				TaskUI.render();
			});

			const text = document.createElement('span');
			text.textContent = task.text;
			text.className = 'task-text';

			if (task.done) {
				text.classList.add('done');
			}

			const deleteButton = document.createElement('button');
			deleteButton.type = 'button';
			deleteButton.textContent = 'Delete';
			deleteButton.className = 'task-delete-btn';
			deleteButton.addEventListener('click', () => {
				TaskManager.delete(task.id);
				TaskUI.render();
			});

			listItem.append(checkbox, text, deleteButton);
			this.listElement.appendChild(listItem);
		});

		updateBadge();
	},

	addTaskFromInput() {
		if (!this.inputElement) {
			return;
		}

		const text = this.inputElement.value.trim();

		if (!text) {
			return;
		}

		TaskManager.add(text);
		this.inputElement.value = '';
		this.render();
	},

	bindEvents() {
		if (this.addButtonElement) {
			this.addButtonElement.addEventListener('click', () => {
				this.addTaskFromInput();
			});
		}

		if (this.inputElement) {
			this.inputElement.addEventListener('keydown', (event) => {
				if (event.key === 'Enter') {
					this.addTaskFromInput();
				}
			});
		}
	},
};

function updateBadge() {
	const badgeElement = document.getElementById('task-count');

	if (!badgeElement) {
		return;
	}

	const remainingTasks = TaskManager.getAll().filter((task) => task.done === false).length;
	badgeElement.textContent = remainingTasks === 0 ? 'All done!' : `${remainingTasks} tasks remaining`;
}

const todayDateElement = document.getElementById('today-date');

if (todayDateElement) {
	todayDateElement.textContent = new Date().toLocaleDateString(undefined, {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

TaskUI.bindEvents();
TaskUI.render();

