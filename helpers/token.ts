export function getToken() {
    const token = process.env.API_TOKEN;
    if (!token ) throw Error("Env API_TOKEN is not set")
    return token
}