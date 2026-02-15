// *****************************
// ユーザーデータ管理
// *****************************
function getUserId() {
    let uid = localStorage.getItem(STORAGE_USER);
    if (!uid) {
        users = getUsers();
        uid = users[0].id;
        if (!safeSetItem(STORAGE_USER, uid)) return null;
    }
    return uid;
}

function setUserId(id) {
    if (!safeSetItem(STORAGE_USER, id)) return false;
    return true;
}

function getCurrentUser() {
    const id = localStorage.getItem(STORAGE_USER);
    const users = getUsers();
    const found = users.filter(user => user.id === id);
    let currentUser;
    if (found.length > 0) {
        currentUser = found[0];
    } else {
        currentUser = users[0];
        setUserId(currentUser.id);
    }
    return currentUser;
}

function getUserById(id) {
    const users = getUsers();
    const found = users.filter(user => user.id === id);
    let user = null;
    if (found.length > 0) {
        user = found[0];
    }
    return user;
}

function getUsers() {
    const users = [];
    for (let i = 0; i < 5; i++) {
        const user = {"id": String(i+1), "name": "ユーザー" + String(i+1)};
        users.push(user);
    }
    return users;
}