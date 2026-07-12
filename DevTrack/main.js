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

const todayDateElement = document.getElementById('today-date');

if (todayDateElement) {
	todayDateElement.textContent = new Date().toLocaleDateString(undefined, {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}
