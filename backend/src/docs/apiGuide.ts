/**
 * E-commerce API Documentation
 * Base URL: http://localhost:4000/api/v1
 */

export const apiGuide = {
  auth: {
    register: {
      url: '/auth/register',
      method: 'POST',
      body: {
        email: 'user@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      },
      description: 'Register a new user and send verification email'
    },
    login: {
      url: '/auth/login',
      method: 'POST',
      body: {
        email: 'user@example.com',
        password: 'password123'
      },
      description: 'Login and receive JWT token'
    },
    forgotPassword: {
      url: '/auth/forgot-password',
      method: 'POST',
      body: {
        email: 'user@example.com'
      },
      description: 'Request password reset email'
    },
    resetPassword: {
      url: '/auth/reset-password/:token',
      method: 'PATCH',
      body: {
        password: 'newpassword123'
      },
      description: 'Reset password using token from email'
    },
    verifyEmail: {
      url: '/auth/verify-email',
      method: 'POST',
      body: {
        otp: '123456'
      },
      description: 'Verify email using OTP'
    },
    resendVerification: {
      url: '/auth/resend-verification',
      method: 'POST',
      body: {
        email: 'user@example.com'
      },
      description: 'Resend verification OTP'
    }
  },

  products: {
    getAll: {
      url: '/products',
      method: 'GET',
      query: {
        search: 'laptop',
        category: 'electronics',
        minPrice: 500,
        maxPrice: 2000,
        minStock: 1,
        sortBy: 'price',
        order: 'desc',
        page: 1,
        limit: 10
      },
      description: 'Get products with filters, sorting and pagination'
    },
    getOne: {
      url: '/products/:id',
      method: 'GET',
      description: 'Get single product details'
    },
    create: {
      url: '/products',
      method: 'POST',
      auth: 'Admin only',
      body: {
        name: 'Product Name',
        description: 'Product Description',
        price: 99.99,
        category: 'Category',
        imageUrl: 'image_url',
        stock: 100
      },
      description: 'Create new product'
    },
    update: {
      url: '/products/:id',
      method: 'PUT',
      auth: 'Admin only',
      body: {
        name: 'Updated Name',
        price: 89.99,
        stock: 95
      },
      description: 'Update product details'
    },
    delete: {
      url: '/products/:id',
      method: 'DELETE',
      auth: 'Admin only',
      description: 'Soft delete product'
    },
    search: {
      url: '/products/search',
      method: 'GET',
      query: {
        q: 'search term'
      },
      description: 'Full-text search in products'
    }
  },

  cart: {
    get: {
      url: '/cart',
      method: 'GET',
      auth: 'Required',
      description: 'Get user\'s cart'
    },
    add: {
      url: '/cart',
      method: 'POST',
      auth: 'Required',
      body: {
        productId: 'product_id',
        quantity: 1
      },
      description: 'Add item to cart'
    },
    update: {
      url: '/cart',
      method: 'PUT',
      auth: 'Required',
      body: {
        productId: 'product_id',
        quantity: 2
      },
      description: 'Update cart item quantity'
    },
    remove: {
      url: '/cart/:productId',
      method: 'DELETE',
      auth: 'Required',
      description: 'Remove item from cart'
    },
    clear: {
      url: '/cart/clear',
      method: 'DELETE',
      auth: 'Required',
      description: 'Clear entire cart'
    }
  },

  orders: {
    create: {
      url: '/orders',
      method: 'POST',
      auth: 'Required',
      body: {
        items: [{
          product: 'product_id',
          quantity: 2
        }],
        shippingAddress: {
          street: '123 Main St',
          city: 'City',
          state: 'State',
          postalCode: '12345',
          country: 'Country'
        },
        paymentMethod: 'card'
      },
      description: 'Create new order'
    },
    getAll: {
      url: '/orders',
      method: 'GET',
      auth: 'Required',
      description: 'Get user\'s orders'
    },
    getOne: {
      url: '/orders/:id',
      method: 'GET',
      auth: 'Required',
      description: 'Get single order details'
    },
    cancel: {
      url: '/orders/:id/cancel',
      method: 'POST',
      auth: 'Required',
      description: 'Cancel order'
    }
  },

  payments: {
    createIntent: {
      url: '/payments/create-payment-intent',
      method: 'POST',
      auth: 'Required',
      body: {
        orderId: 'order_id'
      },
      description: 'Create Stripe payment intent'
    },
    getStatus: {
      url: '/payments/status/:orderId',
      method: 'GET',
      auth: 'Required',
      description: 'Get payment status'
    },
    refund: {
      url: '/payments/refund/:orderId',
      method: 'POST',
      auth: 'Required',
      body: {
        reason: 'customer_requested'
      },
      description: 'Request refund for order'
    }
  },

  reviews: {
    create: {
      url: '/reviews',
      method: 'POST',
      auth: 'Required',
      body: {
        productId: 'product_id',
        rating: 5,
        comment: 'Great product!',
        images: 'File upload'
      },
      description: 'Create product review'
    }
  },

  wishlist: {
    get: {
      url: '/wishlist',
      method: 'GET',
      auth: 'Required',
      description: 'Get user\'s wishlist'
    },
    add: {
      url: '/wishlist',
      method: 'POST',
      auth: 'Required',
      body: {
        productId: 'product_id'
      },
      description: 'Add item to wishlist'
    },
    remove: {
      url: '/wishlist/:productId',
      method: 'DELETE',
      auth: 'Required',
      description: 'Remove item from wishlist'
    }
  },

  user: {
    getProfile: {
      url: '/users/profile',
      method: 'GET',
      auth: 'Required',
      description: 'Get user profile'
    },
    updateProfile: {
      url: '/users/profile',
      method: 'PUT',
      auth: 'Required',
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      description: 'Update user profile'
    },
    uploadImage: {
      url: '/users/profile/image',
      method: 'POST',
      auth: 'Required',
      body: {
        image: 'File upload'
      },
      description: 'Upload profile image'
    }
  },

  common: {
    headers: {
      auth: {
        Authorization: 'Bearer your_jwt_token'
      },
      contentType: {
        'Content-Type': 'application/json'
      },
      multipart: {
        'Content-Type': 'multipart/form-data'
      }
    },
    responses: {
      success: {
        status: 200,
        body: {
          status: 'success',
          data: {
            // Response data varies by endpoint
          }
        }
      },
      error: {
        status: 400,
        body: {
          status: 'error',
          message: 'Error message'
        }
      }
    },
    errorCodes: {
      400: 'Bad Request - Invalid input',
      401: 'Unauthorized - Authentication required',
      403: 'Forbidden - Insufficient permissions',
      404: 'Not Found - Resource not found',
      429: 'Too Many Requests - Rate limit exceeded',
      500: 'Internal Server Error'
    }
  }
}; 