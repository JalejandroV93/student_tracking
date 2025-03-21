// src/lib/auth.ts
const API_KEY = process.env.API_KEY; 

export function authenticateRequest(request: Request): boolean {
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
        const [type, key] = authHeader.split(' ');
        if (type === 'Bearer' && key === API_KEY) {
            return true;
        }
    }
    return false;
}