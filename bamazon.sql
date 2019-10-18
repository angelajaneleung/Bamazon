
DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(45) NULL,
    department_name VARCHAR (45) NULL,
    price DECIMAL (10,2) NULL,
    stock_quantity INT NULL,
    PRIMARY KEY (item_id)
);


INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUE 
("Smart Sweets", "Food", 3.59, 25),
("Instant Noodles", "Food", 1.99, 45),
("All Clad Pot Set", "Kitchen", 1285.99, 10),
("Kitchen Aid Mixer", "Kitchen", 649.99, 10),
("Breville Toaster", "Kitchen", 159.99, 10),
("Harry Potter Set", "Books", 81.98, 25),
("Lord Of The Rings Set", "Books", 44.50, 10),
("Barbour Jacket", "Apparel", 418.70, 5),
("Lululemon Shorts", "Apparel", 54.00, 15),
("North Face Vest", "Apparel", 65.40, 20);


SELECT * FROM products;
