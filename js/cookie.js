
function createCookie(name, value, days) {

    if(days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 1000));

        let expires = "; expires=" + date.toGMTString();

    } else {
        let expires = "";
        document.cookie = name + " = " + value + expires + "; path =/";
    }
}