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

const Timer = {
	startTime: null,
	running: false,
	totalSeconds: 0,
	interval: null,
	sessions: 0,

	start() {
		if (this.running) {
			return;
		}

		this.startTime = Date.now();
		this.running = true;
		this.interval = setInterval(() => {
			this.tick();
		}, 1000);
		this.tick();
	},

	tick() {
		const timerDisplay = document.getElementById('timer-display');

		if (!timerDisplay) {
			return;
		}

		const elapsedMilliseconds = this.totalSeconds * 1000 + (Date.now() - this.startTime);
		timerDisplay.textContent = this.format(elapsedMilliseconds);
		timerDisplay.classList.add('running');
		timerDisplay.classList.remove('stopped');
	},

	stop() {
		if (!this.running) {
			return;
		}

		const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
		this.totalSeconds += elapsedSeconds;
		this.sessions = +1;
		clearInterval(this.interval);
		this.interval = null;
		this.startTime = null;
		this.running = false;
		this.updateDisplay();
		const sessionCountElement = document.getElementById('session-count');

		if (sessionCountElement) {
			sessionCountElement.textContent = `Sessions today: ${this.sessions}`;
		}
	},

	reset() {
		clearInterval(this.interval);
		this.startTime = null;
		this.running = false;
		this.totalSeconds = 0;
		this.interval = null;
		this.updateDisplay();
	},

	format(milliseconds) {
		const seconds = Math.floor(milliseconds / 1000);
		const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
		const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
		const remainingSeconds = String(seconds % 60).padStart(2, '0');
		return `${hours}:${minutes}:${remainingSeconds}`;
	},

	updateDisplay() {
		const timerDisplay = document.getElementById('timer-display');

		if (!timerDisplay) {
			return;
		}

		const elapsedMilliseconds = this.running
			? this.totalSeconds * 1000 + (Date.now() - this.startTime)
			: this.totalSeconds * 1000;

		timerDisplay.textContent = this.format(elapsedMilliseconds);
		timerDisplay.classList.toggle('running', this.running);
		timerDisplay.classList.toggle('stopped', !this.running);
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

const timerStartButton = document.getElementById('timer-start-btn');
const timerStopButton = document.getElementById('timer-stop-btn');
const timerResetButton = document.getElementById('timer-reset-btn');

if (timerStartButton) {
	timerStartButton.addEventListener('click', () => {
		Timer.start();
	});
}

if (timerStopButton) {
	timerStopButton.addEventListener('click', () => {
		Timer.stop();
	});
}

if (timerResetButton) {
	timerResetButton.addEventListener('click', () => {
		Timer.reset();
	});
}

if (todayDateElement) {
	todayDateElement.textContent = new Date().toLocaleDateString(undefined, {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

Timer.updateDisplay();
TaskUI.bindEvents();
TaskUI.render();

