# 🛍️ E-Commerce Backend API

A robust and scalable E-commerce API built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Email verification with OTP
  - Password reset functionality

- **User Management**
  - Profile management
  - Profile image upload
  - Address management

- **Product Management**
  - Product CRUD operations
  - Category management
  - Image upload
  - Search & filtering
  - Pagination & sorting

- **Shopping Cart**
  - Add/Remove items
  - Update quantities
  - Cart total calculation
  - Stock validation

- **Order Management**
  - Order creation
  - Order history
  - Order status tracking
  - Email notifications

- **Payment Integration**
  - Stripe integration
  - Payment status tracking
  - Refund handling
  - Webhook processing

- **Reviews & Ratings**
  - Product reviews
  - Rating system
  - Image upload for reviews

- **Wishlist**
  - Add/Remove products
  - Wishlist management

## 🛠️ Technical Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Upload**: Cloudinary
- **Payment**: Stripe
- **Email**: Nodemailer
- **Validation**: Express Validator
- **Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Stripe Account
- Cloudinary Account
- Gmail Account (for email notifications)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/iamzaidakbar/ecommerce-backend.git
cd ecommerce-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
# Server Configuration
NODE_ENV=development
PORT=4000
API_VERSION=v1

# MongoDB Configuration
MONGODB_URI=your_mongodb_uri

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
EMAIL_FROM=your_email@gmail.com

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── config/         # Configuration files
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── docs/          # API documentation
├── tests/             # Test files
└── logs/              # Application logs
```

## 🔒 Security Features

- JWT Authentication
- Password Hashing
- Rate Limiting
- CORS Protection
- Request Validation
- Error Handling
- Input Sanitization

## 📝 API Documentation

Detailed API documentation is available in:
- [API Guide](./api_docs.md)
- [API Reference](./src/docs/apiGuide.ts)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

1. Build the project:
```bash
npm run build
```

2. Set production environment variables
3. Start the server:
```bash
npm start
```

## 📈 Future Improvements

- [ ] Redis Caching
- [ ] GraphQL API
- [ ] OAuth Integration
- [ ] Advanced Search
- [ ] Analytics Dashboard
- [ ] Bulk Operations
- [ ] Multi-language Support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Express.js Team
- MongoDB Team
- Stripe Team
- All contributors

## 📞 Support

For support, email your.email@example.com or create an issue in the repository.