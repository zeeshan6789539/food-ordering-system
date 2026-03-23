# How This Project Works

This is a **Food Ordering API** backend built with **NestJS**. It handles users, auth, products, cart, and orders. Below is how the pieces fit together and why certain choices (like BullMQ) were made.

---

## High-Level Flow

1. **Auth** – Users register (`POST /users/register`) or log in with password (`POST /auth/login`) or OTP (`POST /auth/otp/request` → `POST /auth/otp/verify`). JWT is issued for protected routes.
2. **Products** – Catalog of products with variants (e.g. size, price).
3. **Cart** – Users add items to cart; cart is stored in the database.
4. **Orders** – User places order from cart → order is saved inside a DB transaction (cart locked for consistency) → **background job** is queued for confirmation email/notifications → API returns the order quickly.

---

## Why BullMQ?

**BullMQ** is a Redis-based job queue. It’s used so that **heavy or slow work does not run inside the HTTP request**.

### What would happen without a queue?

If we sent the confirmation email and did other post-order work **inside** the `placeOrder` request:

- The HTTP request would wait for the email to be sent (or fail).
- If the email service is slow or down, the user would see timeouts or errors even though the order was saved.
- Under load, many concurrent orders would block the API and hurt responsiveness.

### What we do with BullMQ

1. **When an order is placed** (`OrderService.placeOrder`):
   - Order and order items are saved in a **single transaction**, with a **pessimistic write lock** on the user’s cart row so concurrent checkouts cannot corrupt totals or double-spend the same cart.
   - Cart line items are removed and `totalAmount` is reset to zero.
   - A job is **added to the `orders` queue** with `orderId` (public display id), `userId`, `totalAmount`, and `email`.
   - Jobs use `removeOnComplete: { count: 1000 }` so Redis does not grow unbounded while keeping recent history.
   - The API **returns the order immediately** without waiting for email or other side effects.

2. **In the background** (`OrderProcessor`):
   - A **worker** (separate from the HTTP request) picks up jobs from the `orders` queue.
   - It runs the actual work: e.g. send confirmation email, push notification, etc. **In development**, this is only logged to the console; production would plug in real providers.
   - If a job fails, BullMQ can **retry** (3 attempts with exponential backoff starting at 1s, as configured in `OrderModule`).

So:

- **Fast API responses** – Place order returns as soon as the transaction and enqueue are done.
- **Reliability** – Failed jobs can retry; Redis keeps jobs until they’re processed.
- **Scalability** – You can run more workers or more app instances; the queue absorbs spikes.

### Dependencies

- **Redis** – BullMQ stores queues and job state in Redis. The app connects via `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` in `app.module.ts`.
- **@nestjs/bullmq** – NestJS integration for BullMQ (queues and processors).
- **bullmq** – The queue library itself.
- **ioredis** – Redis client used by BullMQ.

---

## Other Main Technologies

| Piece        | Role |
|-------------|------|
| **PostgreSQL + TypeORM** | Users, products, cart, orders, OTPs. |
| **JWT + Passport**       | Protected routes; token in `Authorization: Bearer <token>`. |
| **Throttler**            | Global rate limiting: 10 req/s (1s window), 50/10s, 100/min (`ThrottlerGuard` in `app.module.ts`). |
| **Swagger**              | API docs at `/api/docs`. |
| **class-validator / class-transformer** | DTO validation and transformation. |

---

## Order IDs and status

- **`id`** – UUID primary key (used in `GET /orders/:id`).
- **`orderId`** – Short human-readable id (e.g. `ORD-A1B2C3D4`) from `generateOrderId()`; this is what goes to the queue and is suitable for receipts.
- **`status`** – `pending` or `paid` (orders start as `pending` at placement).
- **`paymentType`** – One of `card`, `cash`, `online`, `other` (`PlaceOrderDto`).

---

## Order Flow (Step by Step)

1. User has items in cart (from `CartModule`).
2. **`POST /orders`** with body `{ "paymentType": "card" | "cash" | "online" | "other" }` (JWT required).
3. `OrderService.placeOrder`:
   - Opens a transaction and loads the cart with **pessimistic write lock**, joins items, variants, and products.
   - If the cart is empty → `400 Bad Request`.
   - Creates `Order` with generated `orderId`, `paymentType`, `status: 'pending'`, and `OrderItem` rows (snapshot of names and unit price at checkout).
   - Deletes cart items and sets cart `totalAmount` to `0`.
   - Commits the transaction.
   - Adds a `process` job to the **orders** queue.
4. Response returns the saved order (including `id`, `orderId`, `items`, etc.) for the confirmation UI.
5. **OrderProcessor** consumes the job: in development, logs only; in production, wire email/notifications here.

### Order HTTP API (authenticated)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/orders` | Place order from cart |
| `GET` | `/orders` | List current user’s orders (newest first) |
| `GET` | `/orders/:id` | Get one order by **UUID** `id` (not by `orderId` string) |

---

## Scalability (from `app.module.ts`)

The design supports high concurrency by:

- **BullMQ** – Offloading order processing, emails, notifications to background workers.
- **Transactional checkout** – Pessimistic lock on the cart during place-order avoids race conditions when the same cart is used concurrently.
- **Horizontal scaling** – Multiple app instances behind a load balancer (e.g. Docker/K8s).
- **Node clustering** – e.g. PM2 or Node `cluster` to use all CPU cores per instance.
- **DB indexes** – On `users(email, phoneNumber)`, `orders(orderId, userId)`, `otps(emailOrPhone, createdAt)`.
- **Short request path** – No long-running work in the request; enqueue and return.

---

## Summary

- **BullMQ** is used so that **after an order is saved**, follow-up work (emails, notifications) runs in **background workers** instead of in the HTTP request. That keeps the API fast and reliable and makes it easier to scale and retry failed work.
- **Place order** is **atomic** (transaction + locked cart), returns a **display `orderId`**, and **lists/details** of orders are available under **`/orders`** for the authenticated user.
