// Check if the provided format is a valid date
export function isDateValid(dateStr) {
    return !isNaN(new Date(dateStr));
}

// Returns true if date is in the provided range else false
export function dateInRange(start, end, date) {
    return date >= start && date <= end;
}
