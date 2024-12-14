# E-Commerce API Guide

Welcome to the E-Commerce API! This guide explains how to use the API to build awesome apps for online shopping. Don’t worry; we’ve kept it simple so anyone, even a beginner, can follow along.

Base URL

All requests to the API start with this:

http://localhost:4000/api/v1

How to Use the API

Here’s how to call the API:

- URL: The endpoint for the feature you want to use.
- Method: The HTTP method (e.g., GET, POST).
- Body: Information you send (only for POST, PUT, PATCH).
- Description: Explains what the endpoint does.
- Auth: If login is required, it’ll say "Required."

Features

1. Authentication (Login & Signup)

This is for signing up, logging in, and managing accounts.

Register (Sign up)

- URL: `/auth/register`
- Method: POST
- Body Example:

{
"email": "user@example.com",
"password": "password123",
"firstName": "John",
"lastName": "Doe"
}

- What it does: Creates a new account and sends you a verification email.

Login

- URL: `/auth/login`
- Method: POST
- Body Example:

json
{
"email": "user@example.com",
"password": "password123"
}

- What it does: Logs you in and gives you a token to stay logged in.

Forgot Password

- URL: `/auth/forgot-password`
- Method: POST
- Body Example:

json
{
"email": "user@example.com"
}

- What it does: Sends an email to reset your password.

Reset Password

- URL: `/auth/reset-password/:token`
- Method: PATCH
- Body Example:

{
"password": "newpassword123"
}

- What it does: Updates your password using a token from your email.

2. Products

Everything about products, like browsing and managing them.

Get All Products

- URL: `/products`
- Method: GET
- Query Example:

json
/products?search=laptop&minPrice=500&maxPrice=2000&sortBy=price&order=desc&page=1&limit=10

- What it does: Shows a list of products based on filters (like price, category, etc.).

Get Product Details

- URL: `/products/:id`
- Method: GET
- What it does: Shows details of one product.

Add a Product (Admin Only)

- URL: `/products`
- Method: POST
- Body Example:

json
{
"name": "Smartphone",
"description": "Latest model",
"price": 699.99,
"category": "electronics",
"imageUrl": "image_link",
"stock": 50
}

- What it does: Adds a new product to the store (Admins only).

---

3. Cart

For managing your shopping cart.

View Cart

- URL: `/cart`
- Method: GET
- Auth: Required
- What it does: Shows all items in your cart.

Add Item to Cart

- URL: `/cart`
- Method: POST
- Body Example:

json
{
"productId": "product_id",
"quantity": 1
}

- What it does: Adds a product to your cart.

Update Item Quantity

- URL: `/cart`
- Method: PUT
- Body Example:

json
{
"productId": "product_id",
"quantity": 3
}

- What it does: Updates the quantity of an item in your cart.

Remove Item from Cart

- URL: `/cart/:productId`
- Method: DELETE
- What it does: Removes an item from your cart.

Clear Cart

- URL: `/cart/clear`
- Method: DELETE
- What it does: Empties your entire cart.

---

4. Orders

Handles checkout and managing orders.

Create an Order

- URL: `/orders`
- Method: POST
- Body Example:

json
{
"items": [
{ "product": "product_id", "quantity": 2 }
],
"shippingAddress": {
"street": "123 Main St",
"city": "New York",
"state": "NY",
"postalCode": "10001",
"country": "USA"
},
"paymentMethod": "card"
}

- What it does: Creates a new order.

Get Your Orders

- URL: `/orders`
- Method: GET
- Auth: Required
- What it does: Lists all your orders.

5. Payments

For paying and refunds.

Create Payment

- URL: `/payments/create-payment-intent`
- Method: POST
- Body Example:

json
{
"orderId": "order_id"
}

- What it does: Starts the payment process.

Get Payment Status

- URL: `/payments/status/:orderId`
- Method: GET
- What it does: Checks if a payment was successful.

Refund Payment

- URL: `/payments/refund/:orderId`
- Method: POST
- Body Example:

json
{
"reason": "customer_requested"
}

- What it does: Requests a refund for an order.

---

6. Reviews

Let customers leave feedback on products.

Add a Review

- URL: `/reviews`
- Method: POST
- Body Example:

json
{
"productId": "product_id",
"rating": 5,
"comment": "Great product!",
"images": "File upload"
}

- What it does: Adds a review for a product.

---

7. User Profile

Manage your account details.

View Profile

- URL: `/users/profile`
- Method: GET
- Auth: Required
- What it does: Shows your account information.

Update Profile

- URL: `/users/profile`
- Method: PUT
- Body Example:

json
{
"firstName": "Jane",
"lastName": "Doe",
"email": "jane@example.com"
}

- What it does: Updates your account information.

---

Common Info

Headers

- Authorization: Add this to requests if login is required:
  Authorization: Bearer your_jwt_token

- Content-Type:
  - JSON requests: `application/json`
  - File uploads: `multipart/form-data`

Error Codes

- 400: Bad Request (Something is wrong with your input).
- 401: Unauthorized (You need to log in).
- 404: Not Found (The resource doesn’t exist).
- 500: Internal Server Error (Something went wrong on our side).

---

Have Questions?

Feel free to ask! This guide is here to help you make the most of the API.
