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

let formatTable = (rows, val1, val2) => {
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
      value: val1,
      alias: val2,
      color: "white",
      width: 15,
      formatter: function (value) {
        if (typeof value !== 'number') {
          value = "0";
        }
        return value;
      }
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



let userSku = "";
let userQty = "";
let stockQty = "";
let userOrder = "";
let userPrice = "";
let itemId = "";


connection.connect(function (err) {
  if (err) throw err;
  // console.log("connected with id of " + connection.threadId);
  console.log("\nWelcome to Bamazon!");
  deleteSummary();
});

const deleteSummary = () => {
  let query = `DROP TABLE IF EXISTS summary`;
  connection.query(query, function (err, res) {
    if (err) throw err;
    createSummary();
  });
}

const createSummary = () => {
  let query = `CREATE TABLE IF NOT EXISTS summary (
    item_id INT NOT NULL,
    product_name VARCHAR(30),
    price DECIMAL(10,2),
    quantity INT(10)
  )`;
  connection.query(query, function (err, res) {
    if (err) throw err;
    showProducts();
  });
}

const showProducts = () => {
  let query = "SELECT item_id, product_name, price, stock_quantity FROM products";
  connection.query(query, function (err, res) {
    if (err) throw err;
    formatTable(res, "stock_quantity", "Stock");
    setTimeout(takeOrder, 500);
  });
};

const showSummary = () => {
  connection.query(
    `SELECT item_id, product_name, price, quantity FROM summary`,
    function (err, res) {
      if (err) throw err;
      console.log("\nThank you for shopping with us!\n");

      let totalCost = 0;
      for (var i = 0; i < res.length; i++) {
        totalCost = totalCost + res[i].price * res[i].quantity;
      }

      if (totalCost !== 0) {
        formatTable(res, "quantity", "Quantity");
        console.log(`\nTotal cost: $${totalCost.toFixed(2)}\n`);
      }
      process.exit();
      connection.end();
    }
  );
}

const updateInventory = () => {

  //get the product name and price of user's order
  connection.query(
    `SELECT product_name, price FROM products WHERE ?`,
    {
      item_id: userSku
    },
    function (err, res) {
      if (err) throw err;
      userOrder = res[0].product_name;
      userPrice = res[0].price.toFixed(2);
      updateProducts();
    });


  //update the data in products table
  const updateProducts = () => {
    connection.query(
      `UPDATE products SET ? WHERE ?`,
      [
        {
          stock_quantity: stockQty - userQty
        },
        {
          item_id: userSku
        }
      ],
      function (err, res) {
        if (err) throw err;
        // console.log("Inventory Updated!");
        insertSummary();
      });
  }

  // insert the data to summary table
  const insertSummary = () => {
    connection.query(
      "INSERT INTO summary SET ?",
      {
        item_id: userSku,
        product_name: userOrder,
        price: userPrice,
        quantity: userQty
      },
      function (err, res) {
        if (err) throw err;
        // console.log("Summary Updated!");

        inquirer.prompt([
          {
            type: "confirm",
            message: "Keep shopping?",
            name: "keepShopping"
          }
        ]).then(function (res) {
          switch (res.keepShopping) {
            case true:
              takeOrder();
              break;

            case false:
              inquirer.prompt([
                {
                  type: "confirm",
                  message: "Are you sure?",
                  name: "sure"
                }
              ]).then(function (res) {
                switch (res.sure) {
                  case true:
                    showSummary();
                    break;

                  case false:
                    takeOrder();
                    break;
                }
              });
              break;

          };
        });
      });
  }
};

const isValidSku = (input) => {
  let number = parseFloat(input);
  if (!Number.isInteger(number) || number < 1 || number > itemId) {
    return "Enter a valid SKU number!";
  } else {
    return true;
  };
};

const isStockEnough = () => {

  //get the stock quantity
  let query = `SELECT stock_quantity FROM products WHERE ?`;
  connection.query(query, { item_id: userSku }, function (err, res) {
    if (err) throw err;
    stockQty = res[0].stock_quantity;

    //if there's not enough stock,
    if (stockQty < userQty) {
      console.log("\nSorry, insufficient quantity :(\n");
      inquirer.prompt([
        {
          type: "confirm",
          message: "Keep shopping?",
          name: "keepShopping"
        }
      ]).then(function (res) {
        switch (res.keepShopping) {
          case true:
            showProducts();
            break;

          case false:
            showSummary();
            break;
        }
      });

      //if there's enough stock,
    } else {
      updateInventory();
    }
  });
};

const takeOrder = () => {

  //check how many SKUs there are (for isValidSku function)
  connection.query(`SELECT item_id FROM products`, function (err, res) {
    itemId = res.length;

    //take user's order
    inquirer.prompt([
      {
        type: "input",
        message: "What is the SKU of the product you want to buy?",
        name: "sku",
        validate: isValidSku
      },
      {
        type: "input",
        message: "How many units do you want to buy?",
        name: "quantity",
      }
    ]).then(function (answer) {
      userSku = answer.sku;
      userQty = answer.quantity;

      //check if there's stock
      isStockEnough();
    });

  });
}
