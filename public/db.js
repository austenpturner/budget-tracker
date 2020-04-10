let db;

// open database
const request = indexedDB.open("budgetDB", 1);

request.onupgradeneeded = e => {
    // result of target request is the database
    db = e.target.result;
    db.createObjectStore("budget", { autoIncrement: true });
    console.log("upgrade is called");
};
 
request.onsuccess = e => {
    db = e.target.result;
    console.log("success is called");
    searchDatabase();
};
 
request.onerror = e => {
    console.log(`Error: ${e.target.errorCode}`);
};

const saveRecord = record => {
    const transaction = db.transaction(["budget"], "readwrite");
    const store = transaction.objectStore("budget");
    store.add(record);
};

const searchDatabase = () => {
    const transaction = db.transaction(["budget"], "readwrite");
    const store = transaction.objectStore("budget");
    const getAll = store.getAll();
    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                  Accept: "application/json, text/plain, */*",
                  "Content-Type": "application/json"
                }
            }).then(res => {
                res.json();
            }).then(() => {
                const transaction = db.transaction(["budget"], "readwrite");
                const store = transaction.objectStore("budget");
                store.clear();
            });
        }
    };
}

window.addEventListener("online", searchDatabase);
