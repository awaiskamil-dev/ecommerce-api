# E-Commerce API

A full-featured e-commerce REST API built with Node.js, Express, and MongoDB — featuring JWT + httpOnly cookie authentication, role- and ownership-based authorization, product/review/order management, image uploads, and a simulated payment flow.

> Built as part of a Node/Express backend course, extended with additional security hardening, input validation, and full API documentation.

## Features

- 🔐 **Authentication** — register/login/logout with JWT stored in httpOnly, signed cookies (never exposed to client-side JavaScript)
- 👥 **Authorization** — role-based (`authorizePermissions`) and ownership-based (`checkPermissions`) access control; the first registered user automatically becomes `admin`
- 🛒 **Products, Reviews & Orders** — full CRUD across all three resources
- ⭐ **Live rating calculation** — a product's `averageRating`/`numOfReviews` are recalculated automatically via a MongoDB aggregation pipeline whenever a review is added or removed
- 🔗 **Mongoose virtuals** — reviews can be populated onto a product without storing review IDs on the product document
- 🗑️ **Cascading deletes** — deleting a product also removes every review tied to it
- 💳 **Payment-safe order creation** — item price/name/image are re-derived server-side from the database, never trusted from the client, preventing price tampering
- 📸 **Image uploads** — file-type and size validation, stored via Cloudinary
- 🛡️ **Security middleware** — helmet, rate limiting, XSS sanitization, NoSQL-injection sanitization, and configurable CORS

## Tech Stack

| Category | Tech |
|---|---|
| Runtime / Framework | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JSON Web Tokens, httpOnly signed cookies, bcryptjs |
| File Storage | Cloudinary, express-fileupload |
| Security | helmet, express-rate-limit, xss-clean, express-mongo-sanitize, cors |
| Validation | Mongoose schema validation, validator.js |

## Project Structure

\```
controllers/    route handler logic
models/         Mongoose schemas
routes/         Express routers
middleware/     auth, error handling, not-found
errors/         custom error classes (BadRequestError, NotFoundError, UnauthenticatedError, UnauthorizedError)
utils/          JWT helpers, cookie helper, checkPermissions, createTokenUser
\```

## Getting Started

### Prerequisites
- Node.js
- A MongoDB Atlas connection string (or local MongoDB instance)
- A Cloudinary account (for image uploads)

### Installation

```bash
git clone https://github.com/awaiskamil-dev/ecommerce-api.git
cd ecommerce-api
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret_string
JWT_LIFETIME=1d
PORT=5000
NODE_ENV=development
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Run

```bash
npm run dev
```

The API runs on `http://localhost:5000`, with all routes prefixed with `/api/v1`.

## API Documentation

Full endpoint reference — request bodies, required auth, and example responses — is available in [`API-Documentation.md`](./API-Documentation.md).

## Testing

All routes were tested via Postman with cookie-based session handling enabled. Since auth relies on httpOnly cookies rather than bearer tokens, make sure your API client is configured to send/store cookies between requests.

## Notes

- Payments are simulated via a mock Stripe flow — no real transactions occur, and `clientSecret` is a placeholder value.
- Tax and shipping fee are currently accepted from the client request; a production version would compute these server-side from trusted inputs.

## License

ISC