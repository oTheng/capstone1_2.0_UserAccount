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

const totalDeposits = document.getElementById("reportDeposits");
const totalPayments = document.getElementById("reportPayments");
const currentBalance = document.getElementById("reportBalance");
const totalTransactions = document.getElementById("reportCount");

const largestDeposit = document.getElementById("largestDeposit");
const largestPayment = document.getElementById("largestPayment");
const averageTransaction = document.getElementById("averageTransaction");

async function loadReports() {

    try {

        const response = await fetch(API_URL, {
            headers: authHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            forceLogout();
            return;
        }

        const transactions = await response.json();

        let deposits = 0;
        let payments = 0;
        let balance = 0;

        let biggestDeposit = 0;
        let biggestPayment = 0;

        transactions.forEach(transaction => {

            const amount = Number(transaction.amount);

            balance += amount;

            if (amount >= 0) {

                deposits += amount;

                if (amount > biggestDeposit) {
                    biggestDeposit = amount;
                }

            } else {

                payments += amount;

                if (Math.abs(amount) > biggestPayment) {
                    biggestPayment = Math.abs(amount);
                }

            }

        });

        const average =
            transactions.length > 0
                ? balance / transactions.length
                : 0;

        totalDeposits.textContent =
            "$" + deposits.toFixed(2);

        totalPayments.textContent =
            "$" + Math.abs(payments).toFixed(2);

        currentBalance.textContent =
            "$" + balance.toFixed(2);

        totalTransactions.textContent =
            transactions.length;

        largestDeposit.textContent =
            "$" + biggestDeposit.toFixed(2);

        largestPayment.textContent =
            "$" + biggestPayment.toFixed(2);

        averageTransaction.textContent =
            "$" + average.toFixed(2);

    }

    catch(error){

        alert("Unable to load reports.");

        console.error(error);

    }

}

loadReports();