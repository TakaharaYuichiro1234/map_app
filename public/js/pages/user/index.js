// *****************************
// ユーザー切り替えページ
// *****************************

document.addEventListener("DOMContentLoaded", () => {
    init();
});

function init() {
    // select boxの設定
    const domSelect = document.getElementById("select-user");
    const users = getUsers();
    for(let user of users) {
        const option = document.createElement("option");
        option.text = user.name;
        option.value = user.id;
        domSelect.appendChild(option);
    }

    // selectの初期値を現在のユーザーにする
    const currentUser = getCurrentUser();
    document.getElementById("current-user-name").innerHTML = currentUser.name;
    domSelect.value = currentUser.id;

    // Listerの設定
    document.getElementById("change-user-btn").addEventListener("click", changeUser);
}

function changeUser() {
    const selectedId = document.getElementById("select-user").value;
    setUserId(selectedId);
    window.location.href = "index.html";
}
