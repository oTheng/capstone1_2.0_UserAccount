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

const vendorTable = document.getElementById("vendorTable");

async function loadVendors() {

    try {

        const response = await fetch(API_URL, {
            headers: authHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            forceLogout();
            return;
        }

        const transactions = await response.json();

        const vendors = {};

        transactions.forEach(transaction => {

            const vendor = transaction.vendor;

            if (!vendors[vendor]) {

                vendors[vendor] = {

                    count: 0,

                    deposits: 0,

                    payments: 0

                };

            }

            vendors[vendor].count++;

            if (transaction.amount >= 0) {

                vendors[vendor].deposits += Number(transaction.amount);

            } else {

                vendors[vendor].payments += Number(transaction.amount);

            }

        });

        vendorTable.innerHTML = "";

        for (const vendor in vendors) {

            const data = vendors[vendor];

            vendorTable.innerHTML += `

            <tr>

                <td>${vendor}</td>

                <td>${data.count}</td>

                <td>$${data.deposits.toFixed(2)}</td>

                <td>$${Math.abs(data.payments).toFixed(2)}</td>

                <td>$${(data.deposits + data.payments).toFixed(2)}</td>

            </tr>

            `;

        }

    }

    catch(error){

        alert("Unable to load vendors.");

        console.error(error);

    }

}

loadVendors();