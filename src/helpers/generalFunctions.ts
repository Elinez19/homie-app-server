export function capitalizeFullName(name: string): string {
	return name
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

export function splitName(displayName: string) {
	const parts = displayName.split(' ');

	if (parts.length === 3 && parts[1].endsWith('.')) {
		// Handle case like "Ese O. Jonathan"
		return {
			firstname: parts[0],
			lastname: parts[2]
		};
	} else if (parts.length >= 2) {
		// Handle other cases like "Ese Jonathan"
		return {
			firstname: parts[0],
			lastname: parts.slice(1).join(' ')
		};
	} else {
		// Fallback for single names or unexpected input
		return {
			firstname: parts[0] || '',
			lastname: ''
		};
	}
}
