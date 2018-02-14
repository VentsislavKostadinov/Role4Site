$(document).ready(function () {

    // localStorage.clear();   //  clear everything that we are saved.
    // Every time the user have to log in.

    setGreeting();

    // App constants

    const baseUrl = "https://baas.kinvey.com/";
    const appKey = "kid_B1qY8Cdhx";
    const appSecret = "6e04f28a6c7a447aaab352cec68c593b";

    $("#linkHome").click(() => showView("home"));
    $("#linkWorkForUs").click(() => showView("workForUs"));
    $("#linkHistory").click(() => showView("history"));
    $("#linkLogin").click(() => showView("login"));
    $("#linkRegister").click(() => showView("register"));
    $("#linkList").click(() => showView("list"));
    $("#linkAddWorker").click(() => showView("add"));
    $("#linkLogout").click(logout);

    $("#viewLogin").find("form").submit(login);
    $("#viewRegister").find("form").submit(register);
    $("#viewAddWorker").find("form").submit(createWorker);

    $("form > button[type=submit]").click(e => e.preventDefault(e));

    // Navigation header

    function showView(name) {

        $("section").hide();

        switch (name) {
            case "home": $("#viewHome").show(); break;
            case "workForUs": $("#viewWorkForUs").show(); break;
            case "history": $("#viewHistory").show(); break;
            case "login": $("#viewLogin").show(); break;
            case "register": $("#viewRegister").show(); break;
            case "list": getWorkers(); $("#viewList").show(); break;
            case "add": $("#viewAddWorker").show(); break;
            case "edit": $("#viewEdit").show(); break;
            case "logout": $("#viewLogout").show(); break;

        }
    }

    function makeHeader(type) {

        if(type === "basic") {
            return {
                "Authorization": "Basic " + btoa(appKey + ":" + appSecret),
                "Content-Type": "application/json"
            }
        } else {

            return {
                "Authorization": "Kinvey " + localStorage.getItem("authtoken"),
                "Content-Type": "application/json"
            }
        }
    }

    // User session
    function setGreeting() {

        let username = localStorage.getItem("username");

        if(username !== null) {
            $("#loggedInUser").text("Welcome, " + username + "!");

            $("#linkWorkForUs").hide();
            $("#linkHistory").hide();
            $("#linkLogin").hide();
            $("#linkRegister").hide();
            $("#linkList").show();
            $("#linkAddWorker").show();
            $("#linkLogout").show();

        } else {
            $("#loggedInUser").text("");
            $("#linkWorkForUs").show();
            $("#linkHistory").show();
            $("#linkLogin").show();
            $("#linkRegister").show();
            $("#linkList").hide();
            $("#linkAddWorker").hide();
            $("#linkLogout").hide();

        }
    }

    function setStorage(data) {

        localStorage.setItem("authtoken", data._kmd.authtoken);
        localStorage.setItem("username", data.username);
        localStorage.setItem("userId", data._id);

        $("#loggedInUser").text("Welcome, " + data.username + "!");
        setGreeting();
        showView("list");

    }


    function login(e) {

        e.preventDefault();
        console.log("Attempting Login");
        let username = $("#loginUsername").val();
        let password = $("#loginPassword").val();


        let req = {
            url: baseUrl + "user/" + appKey + "/login",
            method: "POST",
            headers: makeHeader("basic"),
            data: JSON.stringify({

                username: username,
                password: password
            }),

            success: setStorage,
          //  error: (reason) => console.warn(reason)
             error: errorLogin

        };

        function errorLogin() {

            alert("Username or passwords are incorrect!");
        }

        $.ajax(req);
    }

    function register(e) {

        e.preventDefault();

        console.log("Attempting Register");
        let username = $("#regUsername").val();
        let password = $("#regPassword").val();
        let repeatPassword = $("#regRepeatPassword").val();

        if(password !== repeatPassword) {

            alert("Passwords don't match");
            return;
        }

        let req = {
            url: baseUrl + "user/" + appKey,
            method: "POST",
            headers: makeHeader("basic"),
            data: JSON.stringify({

                username: username,
                password: password
            }),

            success: setStorage,
            error: (reason) => console.warn(reason)
        };

        $.ajax(req);
    }

    function logout() {

        console.log("Attempting Logout");
        let req = {
            url: baseUrl + "user/" + appKey + "/_logout",
            method: "POST",
            headers: makeHeader("Kinvey"),
            success: logoutSuccess,
            error: (reason) => console.warn(reason)
        };

        $.ajax(req);

        function logoutSuccess(data) {

            localStorage.clear();
            setGreeting();
            showView("home");

        }
    }

    // Catalog

    function getWorkers() {

        let tbody =  $("#viewList").find("table").find("tbody");

        tbody.empty();

        let req = {
            url: baseUrl + "appdata/" + appKey + "/workers",

            headers: makeHeader("Kinvey"),
            success: displayWorkers,
            error: (reason) => console.warn(reason)
        };

        $.ajax(req);

        function displayWorkers(data) {
            for(let worker of data) {

                let actions = [];
                if(worker._acl.creator === localStorage.getItem("userId")) {

                    actions.push($('<button type="button" class="btn btn-primary">Edit</button>').click(() => editWorker(worker)));
                    actions.push($( '<button type="button" class="btn btn-danger">Delete</button>').click(() => deleteWorker(worker._id)));

                }

                let row = $("<tr>");
                row.append($('<td>').text(worker.names));
                row.append($('<td>').text(worker.nin));
                row.append($('<td>').text(worker.utr));
                row.append($('<td>').text(worker.cscs));

                row.append($("<td>").append(actions));
                row.appendTo(tbody);
            }
        }
    }

    function createWorker() {

        let names = $("#inputNames").val();
        let nin = $("#inputNin").val();
        let utr = $("#inputUtr").val();
        let cscs = $("#inputCscs").val();

        let req = {

            url: baseUrl + "appdata/" + appKey + "/workers",
            method: "POST",
            headers: makeHeader("kinvey"),
            data: JSON.stringify({names, nin, utr, cscs}),

            success: createSuccess,
            error: (reason) => console.warn(reason)
        };

        $.ajax(req);

        function createSuccess(data) {
            console.log(data);
            $("#viewAddWorker").find("form").trigger("reset");
            showView("workers");
        }
    }
    
    function editWorker(worker) {

        showView("edit");

        $("#editNames").val(worker.names);
        $("#editNin").val(worker.nin);
        $("#editUtr").val(worker.utr);
        $("#editCscs").val(worker.cscs);

       $("#viewEdit").find("form").submit(edit);
       
       function edit() {

           let editedWorker = {
               names: $("#editNames").val(),
               nin: $("#editNin").val(),
               utr: $("#editUtr").val(),
               cscs: $("#editCscs").val()
           };

         /*  if(editedWorker.names.length === 0 ) {alert("Names can not be Empty!");  return;}
           if(editedWorker.nin.length === 0 ) {alert("NIN can not be Empty!");  return;}
           if(editedWorker.utr.length === 0 ) {alert("UTR can not be Empty!");  return;}
           if(editedWorker.cscs.length === 0 ) {alert("CSCS can not be Empty!");  return;} */

           let req = {
               url: baseUrl + "appdata/" + appKey + "/workers/" + worker._id,
               method: "PUT",
               headers: makeHeader("kinvey"),
               data: JSON.stringify(editedWorker),
               success: editSuccess,
               error: (reason) => console.warn(reason)
           };


           $.ajax(req);
           
           function editSuccess(data) {

               alert("Worker edited!");
               showView("list");

           }}
    }
    
    function deleteWorker(id) {

        let req = {
            url: baseUrl + "appdata/" + appKey + "/workers/" + id,
            method: "DELETE",
            headers: makeHeader("kinvey"),
            success: deleteSuccess,
            error:   (reason) => console.warn(reason)

        };

        $.ajax(req);

        function deleteSuccess(data) {
            console.log(data);
            alert("Book deleted!");
            showView("list");
        }

    }

});