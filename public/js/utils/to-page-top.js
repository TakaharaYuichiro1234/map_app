// *****************************
// 「ページのトップへ戻る」ボタン
// *****************************

let hideTimer = null;

function initToPageTop(buttonElementId) {
    const button = document.getElementById(buttonElementId);

    button.addEventListener('click', () => {
        window.scroll({ 
            top: 0, 
            behavior: "smooth"
        });
    });

    window.addEventListener('scroll', () => {
        if(window.scrollY > 100){
            button.classList.add('is-active');

            if (hideTimer) clearTimeout(hideTimer);

            hideTimer = setTimeout(() => {
                button.classList.remove('is-active');
            }, 2500);
        } else {
            button.classList.remove('is-active');
        }
    });
}
