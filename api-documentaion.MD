# E-Commerce API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication

This API uses **httpOnly signed cookies** for authentication, not bearer tokens.

- After a successful register/login, the server sets a `token` cookie automatically. It is not returned in the response body.
- Every subsequent request to a protected route must be sent **with credentials** (`credentials: 'include'` in fetch, or `withCredentials: true` in axios) so the browser attaches the cookie.
- Cross-origin requests (e.g. a frontend on `localhost:3000` calling an API on `localhost:5000`) require the server's CORS config to allow the frontend's origin explicitly, with `credentials: true` — the default `cors()` will not work with cookies.

**Roles:** `user` (default) and `admin` (the first person ever to register on the API automatically becomes `admin`; everyone after is `user`).

**Error format:** all errors are returned as `{ "msg": "..." }` with an appropriate HTTP status code (400, 401, 403, 404, 500).

---

## Auth Routes — `/api/v1/auth`

### Register
`POST /register` — public

**Body**
```json
{
  "name": "Awais",
  "email": "awais@example.com",
  "password": "secret123"
}
```
- `name`: required, 3–50 characters
- `email`: required, must be a valid email, must be unique
- `password`: required, min 6 characters
- First registered user in the whole database is automatically given the `admin` role; everyone after is `user`.

**Response `201`**
```json
{ "user": { "name": "Awais", "userId": "...", "role": "user" } }
```
Also sets the `token` cookie.

---

### Login
`POST /login` — public

**Body**
```json
{ "email": "awais@example.com", "password": "secret123" }
```

**Response `200`**
```json
{ "user": { "name": "Awais", "userId": "...", "role": "user" } }
```
Also sets the `token` cookie. Both "no such user" and "wrong password" return the same `401 Invalid credentials` message (prevents user enumeration).

---

### Logout
`GET /logout` — public

Overwrites the `token` cookie with a near-instant expiry, effectively logging the user out.

**Response `200`**
```json
{ "msg": "user logged out!" }
```

---

## User Routes — `/api/v1/users`

### Get All Users
`GET /` — **admin only**

Returns every user with `role: 'user'` (excludes admins and always excludes `password`).

**Response `200`**
```json
{ "users": [ { "_id": "...", "name": "...", "email": "...", "role": "user" } ] }
```

---

### Show Current User
`GET /showMe` — logged in

Returns the decoded token payload for whoever is currently authenticated.

**Response `200`**
```json
{ "user": { "name": "...", "userId": "...", "role": "..." } }
```

---

### Update User (name/email)
`PATCH /updateUser` — logged in

**Body**
```json
{ "name": "New Name", "email": "new@example.com" }
```
Both fields required. Re-issues the auth cookie since the token payload (`name`) may have changed.

**Response `200`**
```json
{ "user": { "name": "New Name", "userId": "...", "role": "..." } }
```

---

### Update Password
`PATCH /updateUserPassword` — logged in

**Body**
```json
{ "oldPassword": "secret123", "newPassword": "newSecret456" }
```
Verifies `oldPassword` against the stored hash before allowing the change. New password gets hashed automatically via the `pre('save')` hook.

**Response `200`**
```json
{ "msg": "Success! Password Updated." }
```

---

### Get Single User
`GET /:id` — logged in (own profile) or admin (any profile)

Uses `checkPermissions` — a non-admin requesting someone else's `:id` gets `401 Unauthorized`.

**Response `200`**
```json
{ "user": { "_id": "...", "name": "...", "email": "...", "role": "..." } }
```

---

## Product Routes — `/api/v1/products`

### Create Product
`POST /` — **admin only**

**Body** (minimum required fields per schema)
```json
{
  "name": "Comfy Chair",
  "price": 150,
  "description": "A comfy chair",
  "category": "office",
  "company": "ikea",
  "colors": ["#222"]
}
```
`user` field is set automatically from the logged-in admin's ID — don't send it.

**Response `201`** — the created product object.

---

### Get All Products
`GET /` — public

**Response `200`**
```json
{ "products": [ /* array of products */ ], "count": 12 }
```

---

### Get Single Product
`GET /:id` — public

Includes populated `reviews` (a virtual — every review whose `product` field matches this product's `_id`).

**Response `200`**
```json
{ "product": { "...": "...", "reviews": [ /* array of reviews */ ] } }
```

---

### Get Single Product's Reviews
`GET /:id/reviews` — public

Standalone reviews list for one product (separate from the `reviews` virtual above — this returns just the reviews, no product data).

**Response `200`**
```json
{ "reviews": [ /* ... */ ], "count": 3 }
```

---

### Update Product
`PATCH /:id` — **admin only**

**Body**: any subset of product fields to update.

**Response `200`** — the updated product object.

---

### Delete Product
`DELETE /:id` — **admin only**

Deletes the product **and cascades**: all reviews referencing this product are also deleted (via the `pre('remove')` hook — this only fires because the controller calls `.remove()` on a fetched document, not `findByIdAndDelete`).

**Response `200`**
```json
{ "msg": "Success! Product removed." }
```

---

### Upload Product Image
`POST /uploadImage` — **admin only**

**Body**: `multipart/form-data`, field name `image`. Max size 1MB, must be an image mimetype.

**Response `200`**
```json
{ "image": "/uploads/filename.jpeg" }
```
> Note: this route currently saves to local disk (`public/uploads/`). If you're using the Cloudinary version instead, the response shape is `{ "image": { "src": "https://res.cloudinary.com/..." } }`.

---

## Review Routes — `/api/v1/reviews`

### Create Review
`POST /` — logged in

**Body**
```json
{
  "product": "productId",
  "rating": 5,
  "title": "Great chair",
  "comment": "Very comfy"
}
```
- One review per user per product — enforced both in the controller and via a compound unique index (`{ product, user }`) at the database level.
- `user` is set automatically from the logged-in user — don't send it.
- Creating a review automatically recalculates the parent product's `averageRating` and `numOfReviews`.

**Response `201`** — the created review object.

---

### Get All Reviews
`GET /` — public

Each review's `product` field is populated with `{ name, company, price }` only.

**Response `200`**
```json
{ "reviews": [ /* ... */ ] }
```

---

### Get Single Review
`GET /:id` — public

**Response `200`**
```json
{ "review": { "...": "..." } }
```

---

### Update Review
`PATCH /:id` — logged in (owner only — no `checkPermissions` currently applied, worth adding)

**Body**: any subset of `rating`/`title`/`comment`.

**Response `200`** — the updated review object.

---

### Delete Review
`DELETE /:id` — logged in (owner or admin, via `checkPermissions`)

Deleting a review automatically recalculates the parent product's `averageRating`/`numOfReviews`.

**Response `200`**
```
Review deleted succesfully
```

---

## Order Routes — `/api/v1/orders`

> Payments use a **fake Stripe** flow (`fakeStripeAPI`) — no real charges occur. `clientSecret` is always the placeholder string `"someRandomValue"`.

### Create Order
`POST /` — logged in

**Body**
```json
{
  "items": [
    { "product": "productId1", "amount": 2 },
    { "product": "productId2", "amount": 1 }
  ],
  "tax": 15,
  "shippingFee": 10
}
```
- Only `product` (ID) and `amount` are trusted from the client per item.
- `name`, `price`, `image` are looked up server-side from the actual Product document — never taken from the request body — to prevent price tampering.
- `tax`/`shippingFee` are currently taken directly from the client (a known simplification in this version — a hardened version would compute these server-side too).

**Response `201`**
```json
{
  "order": {
    "orderItems": [ /* snapshotted item data */ ],
    "subtotal": 310,
    "tax": 15,
    "shippingFee": 10,
    "total": 335,
    "status": "pending",
    "clientSecret": "someRandomValue"
  },
  "clientSecret": "someRandomValue"
}
```

---

### Get All Orders
`GET /` — **admin only**

**Response `200`**
```json
{ "orders": [ /* ... */ ], "count": 5 }
```

---

### Get Current User's Orders
`GET /showAllMyOrders` — logged in

Returns only the orders belonging to the requester.

**Response `200`**
```json
{ "orders": [ /* ... */ ], "count": 2 }
```
> Note: this route must be registered **before** `/:id` in `orderRoutes.js` — otherwise Express matches `showAllMyOrders` as an `:id` value instead.

---

### Get Single Order
`GET /:id` — owner or admin (via `checkPermissions`)

**Response `200`**
```json
{ "order": { "...": "..." } }
```

---

### Update Order (mark as paid)
`PATCH /:id` — owner or admin (via `checkPermissions`)

**Body**
```json
{ "paymentIntentId": "someClientGeneratedValue" }
```
In this fake-Stripe flow, the client self-reports payment completion — a real integration would confirm this via a verified Stripe webhook instead.

**Response `200`** — the updated order, with `status: "paid"`.

---

## Security Middleware (applied globally)

| Package | Purpose |
|---|---|
| `express-rate-limit` | Limits each IP to 60 requests per 15-minute window |
| `helmet` | Sets various security-related HTTP headers |
| `xss-clean` | Strips script/HTML-like content from incoming request data |
| `express-mongo-sanitize` | Strips `$`/`.`-prefixed keys to prevent NoSQL injection |
| `cors` | Must be configured with `origin` + `credentials: true` for cookie-based auth to work cross-origin |

---

## Data Models Summary

- **User** — `name`, `email` (unique), `password` (hashed via bcrypt), `role` (`user`/`admin`)
- **Product** — `name`, `price`, `description`, `category`, `company`, `colors`, `featured`, `freeShipping`, `inventory`, `averageRating`, `numOfReviews`, `user` (creator), virtual `reviews`
- **Review** — `rating`, `title`, `comment`, `user` (ref), `product` (ref); unique per `(product, user)` pair
- **Order** — `orderItems` (embedded sub-schema snapshotting `name`/`image`/`price`/`amount`/`product`), `tax`, `shippingFee`, `subtotal`, `total`, `status`, `clientSecret`, `paymentIntentId`, `user` (ref)