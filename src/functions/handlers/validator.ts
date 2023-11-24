const types = {
    '0': 'one-time',
    '1': 'one-day',
    '2': 'three-days',
    '3': 'one-week'
};

function validateUrl(url: string): boolean {
    return /^http:\/\/./.test(url) || /^https:\/\/./.test(url);
}

export { validateUrl, types }