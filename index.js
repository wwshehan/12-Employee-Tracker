const mysql = require("mysql");
const inquirer = require("inquirer");

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

const start = () => {
    connection.connect((err) => {
        if (err) throw err;
        chooseAction();
    });
};

const chooseAction = () => {
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
            "Quit"
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
                    addDepartment();
                    break;
                case "Add Role":
                    addRole();
                    break;
                case "Update Employee Role":
                    updateRole();
                    break;
                case "Quit":
                    connection.end();
                    break;
            }
        })
}
// creating functions to perform the actions of the menu 
const employeeViewAll = () => {
    connection.query(
        "SELECT employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, CONCAT (manager.first_name, ' ', manager.last_name) AS manager FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id LEFT JOIN employees manager ON manager.id = employees.manager_id", 
        (err, res) => {
            if (err) return console.log(err);
            console.table(res);
            chooseAction();
        }
    );
};
const employeeByDept = () => {
    connection.query(
        "SELECT departments.name AS department FROM departments", (err, res) => {
            if (err) return console.log(err);
            console.table(res);
            chooseAction();
        }
    )
};
const employeeByManager = () => {
    connection.query(
        "SELECT roles.title, roles.salary, departments.name AS department FROM roles INNER JOIN departments ON roles.department_id = departments.id", (err, res) => {
            if (err) return console.log(err);
            console.table(res);
            chooseAction();
        }
    )
};

const addEmployee = () => {
    connection.query("SELECT * FROM roles", (err, rolesRes) => {
        if (err) console.log(err)
        connection.query("SELECT * FROM employees", (err, employeesRes) => {
            if (err) console.log(err)

            let listEmp = employeesRes.map((employee) => {
                return {
                    name: `${employee.first_name} ${employee.last_name}`, value: employee.id
                }
            })
            listEmp.push({ name: "None", value: null })

            inquirer.prompt([
                {
                    type: "input",
                    name: "first_name",
                    message: "What is the employee's first name?"
                },
                {
                    type: "input",
                    name: "last_name",
                    message: "What is the employee's last name?"
                },
                {
                    type: "rawlist",
                    name: "role_id",
                    message: "What is the role of this employee?",
                    choices: rolesRes.map((role) => {
                        return { name: role.title, value: role.id }
                    })
                },
                {
                    type: "list",
                    name: "manager_id",
                    message: "Does this employee have a manager?",
                    choices: listEmp
                },
            ]).then((answer) => {
                connection.query("INSERT INTO employees SET ?",
                    {
                        first_name: answer.first_name,
                        last_name: answer.last_name,
                        role_id: answer.role_id,
                        manager_id: answer.manager_id
                    }, (err, res) => {
                        if (err) return console.log(err);
                        console.log(`Your employee ${answer.first_name} ${answer.last_name} has been added sucessfully.`)
                        chooseAction();
                    }
                )
            });
        });

    });
};
const addDepartment = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Please enter a name for the department that you want to add."
        }
    ]).then((answer) => {
        connection.query(
            "INSERT INTO departments SET ?",
            {
                name: answer.name
            }, (err, res) => {
                if (err) return console.log(err);
                console.log(`The department ${answer.name} has been added sucessfully.`)
                chooseAction();
            }
        )
    })
};
const addRole = () => {
    connection.query("SELECT * FROM departments", (err, res) => {
        if (err) console.log(err)

        inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "Please enter the title of the role that you want to add."
            },
            {
                type: "input",
                name: "salary",
                message: "What is the salary for that role?"
            },
            {
                type: "rawlist",
                name: "department_id",
                message: "What department does this role fall under?",
                choices: res.map((department) => {
                    return { name: department.name, value: department.id }
                })
            }
        ]).then((answer) => {
            connection.query(
                "INSERT INTO roles SET ?",
                {
                    title: answer.title,
                    salary: answer.salary,
                    department_id: answer.department_id
                }, (err, res) => {
                    if (err) return console.log(err);
                    console.log(`Your role ${answer.title} has been added sucessfully.`)
                    chooseAction();
                }
            );
            console.log(answer)
        });
    });
};
const updateRole = () => {
    connection.query("SELECT * FROM employees", function (err, results) {
        if (err) console.log(err)
        const employeeArr = results.map(({ id, last_name, first_name }) => {
            return { name: `${last_name}, ${first_name}`, value: id }
        })
        connection.query("SELECT * FROM roles", (err, rolesRes) => {
            if (err) console.log(err)
            const rolesArr = rolesRes.map(({ id, title }) => ({ value: id, name: title }))
            inquirer.prompt([
                {
                    type: "list",
                    name: "id",
                    message: "Which employee's role do you want to update?",
                    choices: employeeArr
                },
                {
                    type: "list",
                    name: "roleId",
                    message: "What is the new role for this employee?",
                    choices: rolesArr
                }
            ]).then((answers) => {
                connection.query("UPDATE employees SET role_id = ? WHERE id = ?",
                    [
                        answers.roleId,
                        answers.id
                    ],

                    (err, res) => {
                        if (err) console.log(err);

                        chooseAction();
                    }
                )
            });
        })
    });
};
start();