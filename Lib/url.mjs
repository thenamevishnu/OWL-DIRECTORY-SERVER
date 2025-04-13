export const escapeRegExp = (query) => {
    return query.replace(/[^a-zA-Z0-9]/g, '\\$&');    
}