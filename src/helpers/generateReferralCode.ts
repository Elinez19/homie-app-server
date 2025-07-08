export function generateReferralNumber() {
	const randomNumber = Math.floor(100000 + Math.random() * 900000);
	return `HM-${randomNumber}`;
}
