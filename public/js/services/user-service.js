// *****************************
// ユーザーデータ管理
// *****************************
async function getUserByUuid(uuid) {
    try {
        const url = `${BASE_PATH}/api/users/${uuid}`
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!res.ok) {
            throw new Error('通信エラー');
        }
        const result = await res.json();
        if (!result.success) throw new Error('データベースエラー');

        const user = {
            uuid: result.user.uuid,
            name: result.user.name,
            role: result.user.role
        };
        return user;

    } catch (err) {
        console.error(err);
        return null;
    }
}

async function getUsers() {
    try {
        const url = `${BASE_PATH}/api/users`
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!res.ok) {
            throw new Error('通信エラー');
        }
        const result = await res.json();
        if (!result.success) throw new Error('データベースエラー');

        const users = result.users.map(u => {
            return {
                uuid: u.uuid,
                name: u.name,
                role: u.role
            }
        })
        return users;

    } catch (err) {
        console.error(err);
        return [];
    }
}