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
    this.contactInfo = `${this.lastName}, ${this.firstName}<br>${this.email}<br>${this.phone}`;
    this.description = `<b>Type:</b> ${type}<br><b>Envrironment:</b> ${environment}<br><b>Severity:</b> ${severity}<br>${description}`;
    this.dateReported = dateReported;
    this.dateClosed = dateClosed;
    this.status = 'Open';
  }
  getDescription() {
    console.log(this.description);
  }
}
//#endregion Issue Class

// global vars
let id = 0;
let issues = [];

//#region Submit Button event listener
let submitButton = document.getElementById('submit-button');
submitButton.addEventListener('click', e => {
  // e.preventDefault();

  //get data from local storage and store in issues array
  issues = DataStorage.getData();
  console.table(issues);

  //gets max id number so new issue can start at next available id
  function getMaxId(array) {
    let idArr = array.map(item => {
      return [item.id];
    });
    if (Math.max(...idArr) >= 0) {
      return Math.max(...idArr);
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
//#endregion Submit Button event listener

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

  static removeData(id) {
    console.log(`DataStorage.removeData called`);

    //get data from local storage
    const issues = DataStorage.getData();
    //search for index of id that is to be deleted
    let indexToDelete = issues.findIndex(issue => issue.id === id);
    console.log(indexToDelete);

    //if index is found
    if (indexToDelete >= 0) {
      console.log('ID found');

      //clear data from local storage
      localStorage.removeItem('issues');
      console.table(issues);
      //remove the item from the array
      issues.splice(indexToDelete, 1);
      console.table(issues);

      //store the array in local storage again
      localStorage.setItem('issues', JSON.stringify(issues));
    } else {
      console.log('ID NOT found');
    }
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

    for (let i = table.rows.length - 1; i > 0; i--) {
      table.deleteRow(i);
      console.log(`Deleted row: ${i}`);
    }

    //get data from local storage
    let unsortedIssues = DataStorage.getData();
    issues = unsortedIssues.sort((a, b) => a.id - b.id);

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
        row.insertCell(6).innerHTML = UI.numberOfOpenDays(issues, i);
        let actions = row.insertCell(7);
        actions.appendChild(
          UI.createCloseButton(issues[i].id, issues[i].status)
        );
        actions.appendChild(UI.createDeleteButton(issues[i].id));
      }
    }
  }

  static createCloseButton(id, status) {
    //Create Close Button
    let btnClose = document.createElement('button');

    if (status === 'Open') {
      btnClose.className = 'btn btn-warning py-1 px-3 mb-2';
      btnClose.id = `btnClose-${id}`;
      btnClose.innerHTML = 'Close';
      btnClose.onclick = () => {
        console.log(`Closing issue with id: ${id}`);
        let issues = DataStorage.getData();
        let updatedIssue = UI.closeIssue(
          issues[issues.findIndex(issue => issue.id === id)]
        );
        DataStorage.removeData(id);
        DataStorage.addData(updatedIssue);
        UI.drawTable();
      };
    } else {
      btnClose.className = 'btn btn-light py-1 px-3 mb-2 border disabled';
      btnClose.id = `btnClose-${id}`;
      btnClose.innerHTML = 'Close';
    }
    return btnClose;
  }

  static createDeleteButton(id) {
    let btnDelete = document.createElement('button');
    btnDelete.className = 'btn btn-danger py-1 mb-2';
    btnDelete.id = `btnDelete-${id}`;
    btnDelete.innerHTML = 'Delete';
    btnDelete.onclick = () => {
      console.log(`Deleting issue with id: ${id}`);
      DataStorage.removeData(id);
      UI.drawTable();
    };
    return btnDelete;
  }

  static closeIssue(issue) {
    let today = new Date();
    today = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getDate()}`;
    issue.dateClosed = today;
    issue.status = 'Closed';
    return issue;
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

  static numberOfOpenDays(issues, i) {
    const msToDays = 86400000;
    if (issues[i].dateClosed === '') {
      let today = new Date();
      today = `${today.getFullYear()}-${
        today.getMonth() + 1
      }-${today.getDate()}`;
      let endDate = new Date(today + 'Z');
      let startDate = new Date(issues[i].dateReported + 'Z');
      if (Math.floor((endDate - startDate) / msToDays) >= 0) {
        return Math.floor((endDate - startDate) / msToDays);
      }
      return 0;
    } else {
      let endDate = new Date(issues[i].dateClosed + 'Z');
      let startDate = new Date(issues[i].dateReported + 'Z');
      if (Math.floor((endDate - startDate) / msToDays) >= 0) {
        return Math.floor((endDate - startDate) / msToDays);
      }
    }
    return 0;
  }
}
//#endregion UI Class

//populate table when page first loads
document.addEventListener('DOMContentLoaded', UI.drawTable);
