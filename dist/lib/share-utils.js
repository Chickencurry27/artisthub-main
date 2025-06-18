export function generateShareToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
export function createShareLink(projectId, token) {
    return `/share/${projectId}/${token}`;
}
