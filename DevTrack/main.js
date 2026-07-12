const todayDateElement = document.getElementById('today-date');

if (todayDateElement) {
	todayDateElement.textContent = new Date().toLocaleDateString(undefined, {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}
