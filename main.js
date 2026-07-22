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
		StatsManager.refresh();
		return task;
	},

	toggle(id) {
		const task = this.tasks.find((item) => item.id === id);

		if (task) {
			task.done = !task.done;
			this.save();
			StatsManager.refresh();
		}

		return task;
	},

	delete(id) {
		this.tasks = this.tasks.filter((task) => task.id !== id);
		this.save();
		StatsManager.refresh();
	},

	save() {
		localStorage.setItem('devtrack-tasks', JSON.stringify(this.tasks));
	},

	getAll() {
		return this.tasks;
	},
};

const ExportManager = {
	toCSV() {
		const headers = 'id,text,done,createdAt';
		const rows = TaskManager.getAll().map((task) => {
			const text = `"${String(task.text).replace(/"/g, '""')}"`;
			const createdAt = `"${String(task.createdAt).replace(/"/g, '""')}"`;
			return [task.id, text, task.done, createdAt].join(',');
		});

		return [headers, ...rows].join('\n');
	},

	download(name, content) {
		const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');

		link.href = url;
		link.download = name;
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	},

	exportTasks() {
		this.download('tasks.csv', this.toCSV());
	},
};

const ThemeManager = {
	theme: localStorage.getItem('devtrack-theme') || 'dark',
	buttonElement: document.getElementById('theme-btn'),

	init() {
		document.body.classList.toggle('light-mode', this.theme === 'light');
		this.updateButton();
	},

	toggle() {
		this.theme = this.theme === 'light' ? 'dark' : 'light';
		localStorage.setItem('devtrack-theme', this.theme);
		document.body.classList.toggle('light-mode', this.theme === 'light');
		this.updateButton();
	},

	updateButton() {
		if (!this.buttonElement) {
			return;
		}

		this.buttonElement.innerHTML = this.theme === 'light' ? '&#9728;&#65039;' : '&#127769;';
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
		this.sessions += 1;
		clearInterval(this.interval);
		this.interval = null;
		this.startTime = null;
		this.running = false;
		this.updateDisplay();

		const sessionCountElement = document.getElementById('session-count');

		if (sessionCountElement) {
			sessionCountElement.textContent = `Sessions today: ${this.sessions}`;
		}

		StatsManager.refresh();
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

const StatsManager = {
	sectionElement: document.getElementById('stats-section'),
	tasksDoneElement: document.getElementById('tasks-done'),
	tasksRemainingElement: document.getElementById('tasks-remaining'),
	completionRateElement: document.getElementById('completion-rate'),
	focusMinutesElement: document.getElementById('focus-minutes'),

	refresh() {
		if (!this.sectionElement) {
			return;
		}

		const tasks = TaskManager.getAll();
		const tasksCompleted = tasks.filter((task) => task.done === true).length;
		const tasksRemaining = tasks.filter((task) => task.done === false).length;
		const completionRate = tasks.length === 0 ? 0 : Math.round((tasksCompleted / tasks.length) * 100);
		const focusMinutes = Math.floor(Timer.totalSeconds / 60);

		if (this.tasksDoneElement) {
			this.tasksDoneElement.textContent = tasksCompleted;
		}

		if (this.tasksRemainingElement) {
			this.tasksRemainingElement.textContent = tasksRemaining;
		}

		if (this.completionRateElement) {
			this.completionRateElement.textContent = completionRate;
		}

		if (this.focusMinutesElement) {
			this.focusMinutesElement.textContent = focusMinutes;
		}
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
const themeButton = document.getElementById('theme-btn');
const exportCsvButton = document.getElementById('export-csv-btn');
const timerStartButton = document.getElementById('timer-start-btn');
const timerStopButton = document.getElementById('timer-stop-btn');
const timerResetButton = document.getElementById('timer-reset-btn');

if (themeButton) {
	themeButton.addEventListener('click', () => {
		ThemeManager.toggle();
	});
}

if (exportCsvButton) {
	exportCsvButton.addEventListener('click', () => {
		ExportManager.exportTasks();
	});
}

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

ThemeManager.init();
StatsManager.refresh();
Timer.updateDisplay();
TaskUI.bindEvents();
TaskUI.render();
