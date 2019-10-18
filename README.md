# Bamazon
This app is an Amazon-like storefront with the MySQL. The app will take in orders from customers and deplete stock from the store's inventory. 

#Challenge 1: Customer View
Run: node bamazonCustomer.js
The app should then prompt users with two messages.
The first should ask them the ID of the product they would like to buy.
The second message should ask how many units of the product they would like to buy.
Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.
Laslty if the order can be completed there should be a total presented to the customer.

#Challenge 2: Manager View 
Run: node bamazonManager.js
It will list a set of menu options:
View Products for Sale
View Low Inventory
Add to Inventory
Add New Product
If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.
If a manager selects View Low Inventory, then it should list all items with an inventory count lower than five.
If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.

#Video (in action)



    https://asciinema.org/a/2PS39xoAnBSFywwUZNzJQc3ZK




