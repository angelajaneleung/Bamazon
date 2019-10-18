require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const Table = require('tty-table');

const connection = mysql.createConnection(
  {
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.PASSWORD,
    database: "bamazon"
  }
);

connection.connect(function (err) {
  if (err) throw err;
  // console.log("connected with id of " + connection.threadId);
  askQuestion();
});

let formatTable = (rows) => {
  let header = [
    {
      value: "item_id",
      alias: "SKU",
      color: "blue"
    },
    {
      value: "product_name",
      alias: "Name",
      color: "green",
      width: 25,
      align: "left"
    },
    {
      value: "price",
      alias: "Price ($)",
      color: "cyan",
      width: 25,
      formatter: function (value) {
        let str = "$" + value.toFixed(2);
        return str;
      }
    },
    {
      value: "stock_quantity",
      alias: "Stock",
      color: "white",
      width: 15
    }
  ]

  var t1 = Table(header, rows, {
    headerColor: "white",
    borderStyle: 2,
    borderColor: "white",
    paddingBottom: 0,
    headerAlign: "center",
    color: "white",
  });

  str1 = t1.render();
  console.log(str1);
};


let addSku = "";
let addQty = "";
let stockQty = "";
let itemId = "";


const askQuestion = () => {
  inquirer.prompt([
    {
      type: "list",
      message: "Select option!",
      choices: ["View Items", "View Low Inventory", "Add to Inventory", "Add New Item", "Exit"],
      name: "option"
    }
  ]).then(function (answers) {
    switch (answers.option) {
      case "View Items":
        viewProducts();
        break;

      case "View Low Inventory":
        viewLowInventory();
        break;

      case "Add to Inventory":
        addInventory();
        break;

      case "Add New Item":
        addNewProducts();
        break;

      case "Exit":
        console.log("\nBye!\n");
        process.exit();
        connection.end();
        break;
    }
  });
}

const viewProducts = () => {
  let query = "SELECT item_id, product_name, price, stock_quantity FROM products";
  connection.query(query, function (err, res) {
    if (err) throw err;
    formatTable(res);
    setTimeout(askQuestion, 1000);
  });
}

const viewLowInventory = () => {
  let query = "SELECT item_id, product_name, price, stock_quantity FROM products WHERE stock_quantity < 5";
  connection.query(query, function (err, res) {
    if (err) throw err;
    if (res.length === 0) {
      console.log("\nNo items are low!\n");
    } else {
      formatTable(res);
    }
    setTimeout(askQuestion, 1000);
  });
}


const updateProducts = () => {

  //get stock_quantity
  connection.query(`SELECT stock_quantity FROM products WHERE ?`,
    {
      item_id: addSku
    },
    function (err, res) {
      if (err) throw err;
      stockQty = parseFloat(res[0].stock_quantity);

      //update the products table
      connection.query(`UPDATE products SET ? WHERE ?`,
        [
          {
            stock_quantity: stockQty + addQty
          },
          {
            item_id: addSku
          }
        ],
        function (err, res) {
          if (err) throw err;
          console.log("\nStock replenished!\n");
          setTimeout(askQuestion, 1000);
        }
      );

    });
}

const isValidSku = (input) => {
  let number = parseFloat(input);
  if (!Number.isInteger(number) || number < 1 || number > itemId) {
    return "Enter a valid SKU number!";
  } else {
    return true;
  };
};

const addInventory = () => {

  //check how many SKUs there are (for isValidSku function)
  connection.query(`SELECT item_id FROM products`, function (err, res) {
    itemId = res.length;

    //ask questions for replenishment
    inquirer.prompt([
      {
        type: "input",
        message: "Which SKU do you want to replenish?",
        name: "sku",
        validate: isValidSku
      },
      {
        type: "input",
        message: "How many units do you want to add?",
        name: "quantity"
      }
    ]).then(function (answers) {
      addSku = answers.sku;
      addQty = parseFloat(answers.quantity);

      inquirer.prompt([
        {
          type: "confirm",
          message: `Is this correct? \nSKU to add: ${addSku} \nUnit(s) to add: ${addQty}`,
          name: "correct"
        }
      ]).then(function (answer) {
        switch (answer.correct) {
          case true:
            updateProducts();
            break;

          case false:
            addInventory();
            break;
        }
      });
    });


  });
}

const addNewProducts = () => {

  let newProduct = "";
  let newDepartment = "";
  let newPrice = "";
  let newUnits = "";

  inquirer.prompt([
    {
      type: "input",
      message: "Name of the new product?",
      name: "newProduct"
    },
    {
      type: "list",
      message: "Which depeartment?",
      choices: ["Food", "Kitchen", "Books", "Apparel"],
      name: "newDepartment"
    },
    {
      type: "input",
      message: "How much does the item cost?",
      name: "newPrice"
    },
    {
      type: "input",
      message: "How many units would you like to add?",
      name: "newUnits"
    }
  ]).then(function (answers) {

    newProduct = answers.newProduct;
    newDepartment = answers.newDepartment;
    newPrice = parseFloat(answers.newPrice).toFixed(2);
    newUnits = answers.newUnits;

    connection.query(
      `INSERT INTO products SET ?`,
      {
        product_name: newProduct,
        department_name: newDepartment,
        price: newPrice,
        stock_quantity: newUnits
      },
      function (err, res) {
        if (err) throw err;
        console.log("\nItems successfully added!\n");
        setTimeout(askQuestion, 1000);
      });

  });
}