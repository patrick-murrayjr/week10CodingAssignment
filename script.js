//#region Issue Class
/**
 * Issue Class
 * Author: Patrick Murray
 *
 * stores data concerning each reported incident.
 */
class Issue {
  constructor(
    id,
    firstName,
    lastName,
    phone = '',
    email,
    description,
    type,
    environment,
    severity,
    dateReported = '',
    dateClosed = ''
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.email = email;
    this.contactInfo = `${this.firstName} ${this.lastName}<br>${this.email}<br>${this.phone}`;
    this.description = `<b>Type:</b> ${type}<br><b>Envrironment:</b> ${environment}<br><b>Severity:</b> ${severity}<br>${description}`;
    this.dateReported = dateReported;
    this.dateClosed = dateClosed;
    this.status = 'open';
  }
  getDescription() {
    console.log(this.description);
  }
  setDateClosed(dateClosed) {
    this.dateClosed = dateClosed;
  }
}
//#endregion Issue Class

let id = 0;
let issues = [];

//Submit Button event listener
let submitButton = document.getElementById('submit-button');
submitButton.addEventListener('click', e => {
  // e.preventDefault();

  //get data from local storage and store in issues array
  issues = DataStorage.getData();
  console.table(issues);

  //gets max id number so ne issue can start at next available id
  function getMaxId(array) {
    let tmp = array.map(item => {
      return [item.id];
    });
    if (Math.max(...tmp) >= 0) {
      return Math.max(...tmp);
    }
    return 0;
  }

  //get data from form
  id = getMaxId(DataStorage.getData());
  let reportedDate = document.getElementById('reported-date').value;
  if (this.reportedDate === '') {
    reportedDate = new Date();
  } else {
    reportedDate = document.getElementById('reported-date').value;
  }
  let closedDate = '';
  let firstName = document.getElementById('first-name').value;
  let lastName = document.getElementById('last-name').value;
  let phone = document.getElementById('phone').value;
  let email = document.getElementById('email').value;
  let description = document.getElementById('description').value;
  let type = document.getElementById('type').value;
  let environment = document.getElementById('environment').value;
  let severity = document.getElementById('severity').value;

  //check that all required fields have been entered
  if (
    UI.requiredDataIsEntered(
      firstName,
      lastName,
      email,
      description,
      reportedDate
    )
  ) {
    //create new Issue object from form data
    let newIssue = new Issue(
      ++id,
      firstName,
      lastName,
      phone,
      email,
      description,
      type,
      environment,
      severity,
      reportedDate,
      closedDate
    );

    //store issues array to local storage
    DataStorage.addData(newIssue);

    //populate list based on issues array
    UI.drawTable();
  }
});

//#region DataStorage Class
/**
 * DataStorage Class - Static
 * Author: Patrick Murray
 *
 * Handles data transfer to/from local storage
 */
class DataStorage {
  static getData() {
    console.log(`DataStorage.getData called`);
    let issues = [];

    // if issues key/value does not exist then create it
    if (localStorage.getItem('issues') === null) {
      console.log(`Issues is NULL`);
      issues = [];
    }
    // Otherwise get key/value and parse
    else {
      issues = JSON.parse(localStorage.getItem('issues'));
      // console.table(issues);
    }
    return issues;
  }

  static addData(issue) {
    console.log(`DataStorage.addData called`);
    //get data from local storage
    const issues = DataStorage.getData();
    issues.push(issue);
    console.table(issues);

    // Stringify and store
    localStorage.setItem('issues', JSON.stringify(issues));
  }
}
//#endregion DataStorage Class

//#region UI Class
/**
 * UI Class
 * Author: Patrick Murray
 * Handles UI Tasks for App
 */
class UI {
  static drawTable() {
    console.log(`UI.drawTable called`);
    //remove existing rows from table
    let table = document.getElementById('list');
    console.log(`Num rows: ${table.rows.length}`);
    for (let i = table.rows.length - 1; i > 0; i--) {
      table.deleteRow(i);
      console.log(`Deleted row: ${i}`);
    }

    //get data from local storage
    issues = DataStorage.getData();

    //loop through issues array and add new rows to table
    if (issues.length > 0) {
      let table = document.getElementById('list');
      for (let i = 0; i < issues.length; i++) {
        let row = table.insertRow(i + 1);
        row.setAttribute('id', `issue-${i + 1}`);
        row.insertCell(0).innerHTML = issues[i].id;
        row.insertCell(1).innerHTML = issues[i].description;
        row.insertCell(2).innerHTML = issues[i].contactInfo;
        row.insertCell(3).innerHTML = issues[i].dateReported;
        row.insertCell(4).innerHTML = issues[i].dateClosed;
        row.insertCell(5).innerHTML = issues[i].status;
        row.insertCell(6).innerHTML = 'TODO';
        row.insertCell(7).innerHTML = 'TODO';
      }
    }
    console.log(`Num rows: ${table.rows.length}`);
  }

  static requiredDataIsEntered(
    firstName,
    lastName,
    email,
    description,
    reportedDate
  ) {
    if (
      firstName === '' ||
      lastName === '' ||
      email === '' ||
      description === '' ||
      reportedDate === ''
    ) {
      return false;
    }
    return true;
  }
}
//#endregion UI Class

console.table(DataStorage.getData());
document.addEventListener('DOMContentLoaded', UI.drawTable);
