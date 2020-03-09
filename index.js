const mysql = require("mysql");
const inquirer = require("inquirer");
const consoleTable = require("console.table");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "CMS_db"
});

connection.connect((err) => {
    if (err) throw err;
    start()
    });

const start=() => {
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
        "View all Employees",
        "View All Employees By Department",
        "View All Employees By Manager",
        "Add Employee",
        "Add Department",
        "Add Role",
        "Update Employee Role",
        ]
    })
    .then((answer) => {
        switch (answer.action) {
            case "View all Employees":
            employeeViewAll();
            break;
            case "View All Employees By Department":
            employeeByDept();
            break;
            case "View All Employees By Manager":
            employeeByManager();
            break;
            case "Add Employee":
            addEmployee();
            break;
            case "Add Department":
            addDepartment ();
            break;
            case "Add Role":
            addRole ();
            break;
            case "Update Employee Role":
            updateRole();
            break;
        }
    })
}
// creating functions to perform the actions of the menu 
function employeeViewAll () {
connection.query("SELECT * FROM employees", function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
     console.log(res);
    connection.end();
    });
}
