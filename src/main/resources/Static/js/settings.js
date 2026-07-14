const API_URL = "http://localhost:8080/api/transactions";

// =========================
// API STATUS
// =========================

async function checkApi() {

    try {

        const response = await fetch(API_URL);

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

        const response=await fetch(API_URL);

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