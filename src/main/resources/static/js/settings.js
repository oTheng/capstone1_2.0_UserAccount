const API_URL = "http://localhost:8080/api/transactions";

// =========================
// AUTH GUARD
// =========================
// Every page has its own script, so each page checks for the
// login token itself. No token -> back to the login screen.

if (!localStorage.getItem("authToken")) {
    window.location.href = "index.html";
}

// Attach the token to a request's headers (same helper as app.js)
function authHeaders(extra = {}) {
    const token = localStorage.getItem("authToken");
    if (token) {
        extra["Authorization"] = "Bearer " + token;
    }
    return extra;
}

// Token rejected by the API — clear the session and go log in again
function forceLogout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
}

// =========================
// API STATUS
// =========================

async function checkApi() {

    try {

        const response = await fetch(API_URL, {
            headers: authHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            forceLogout();
            return;
        }

        if(response.ok){

            document.getElementById("apiStatus").textContent =
                "Online";

        }

    }

    catch(error){

        document.getElementById("apiStatus").textContent =
            "Offline";

    }

}

// =========================
// DARK MODE
// =========================

document.getElementById("darkModeBtn")
    .addEventListener("click",()=>{

        document.body.classList.toggle("dark-mode");

    });

// =========================
// EXPORT CSV
// =========================

document.getElementById("exportBtn")
    .addEventListener("click",async()=>{

        const response=await fetch(API_URL,{
            headers: authHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            forceLogout();
            return;
        }

        const transactions=await response.json();

        let csv="ID,Date,Time,Description,Vendor,Amount,Type\n";

        transactions.forEach(t=>{

            csv+=`${t.id},${t.transactionDate},${t.transactionTime},${t.description},${t.vendor},${t.amount},${t.transactionType}\n`;

        });

        const blob=new Blob([csv],{type:"text/csv"});

        const url=window.URL.createObjectURL(blob);

        const a=document.createElement("a");

        a.href=url;

        a.download="transactions.csv";

        a.click();

    });

// =========================
// CLEAR SEARCH
// =========================

document.getElementById("clearSearchBtn")
    .addEventListener("click",()=>{

        localStorage.removeItem("search");

        alert("Search history cleared.");

    });

// =========================

checkApi();