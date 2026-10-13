# ElectroHub Future Architecture Roadmap

## Vision

ElectroHub will grow from a single storefront into a trusted Electronics marketplace with multiple sellers, real-time order tracking, analytics, payments, identity verification, and a mobile experience.

The architecture should preserve the current fast path while introducing clear service boundaries. The product, order, seller, payment, and notification domains should not remain coupled to one static page or one large API file.

## Current State

### Phase 1 — implemented

- Static HTML/CSS/JavaScript storefront
- Product catalog with search, filters, sorting, favorites, cart, and comparison
- Vercel serverless API routes
- PostgreSQL-backed product catalog
- Firebase Authentication and Firestore for users, orders, reviews, and product counters
- Firebase Admin dashboard
- AI assistant through Groq
- Email confirmation through Resend
- M-Pesa payment integration through IntaSend
- Local catalog fallback
- Blockchain ledger prototype

### Architecture gaps

- Product data is stored in PostgreSQL, while customer orders and authentication are in Firestore.
- Product creation, editing, and deletion are implemented in one API route.
- The admin dashboard directly calls Firestore for orders and reviews.
- The order status API assumes a particular Firestore path and does not support a single canonical order model.
- Seller ownership is not represented in the product model.
- Product images are manually supplied as URLs.
- Order status and payment status are not unified.
- Analytics and reporting are not implemented.
- Real-time order listeners are not implemented.
- KYC and payment risk checks are not implemented.
- Mobile clients cannot share the user experience without a stable API contract.

## Phase 2 — next 6 months

### 1. Establish a canonical marketplace data model

Introduce a shared domain model for:

- sellers
- products
- product versions
- store profiles
- orders
- order items
- payment events
- reviews
- KYC submissions
- shipment events
- notifications

The current product catalog should remain available while seller and marketplace ownership become explicit.

#### Acceptance criteria

- Every product has a unique owner or seller ID.
- Every order has one canonical status and payment status.
- Every order item references the product and seller.
- Every seller has a store profile and onboarding status.
- Every mutable operation returns a consistent API response.

### 2. Add Cloudinary image uploads

Replace manual image URL entry with a server-side upload flow that accepts image files, validates them, and stores the Cloudinary public ID or URL.

#### Frontend

- Upload controls for product images
- Image previews
- Remove and replace image actions
- Upload progress feedback
- Maximum file size and image type validation

#### API

- Upload endpoint with authenticated seller/admin authorization
- Cloudinary configuration through environment variables
- Uploaded image metadata persisted with the product

#### Acceptance criteria

- A seller can upload an image through the admin or seller dashboard.
- The uploaded URL is stored with the product.
- Invalid files are rejected before upload.
- Attachment metadata is not exposed to untrusted clients.

### 3. Seller onboarding and vendor marketplace

Create a seller application and onboarding workflow.

#### Seller onboarding fields

- Business name
- Seller owner
- Contact email and phone
- Store name and description
- KYC documents
- Bank/payment details
- Country and tax information
- Seller verification status
- Store status

#### Permissions

- Seller can manage only their products.
- Seller cannot modify another seller's products.
- Seller can view only their orders.
- Seller can update order status only for their own orders.
- Admin can approve, suspend, or reject sellers.

#### Acceptance criteria

- A new seller can complete onboarding.
- A suspended seller cannot create or update products.
- Product ownership is visible in the catalog.
- Admin can approve or reject a seller.

### 4. Real-time order tracking

Replace ad-hoc order status display with Firestore listeners and a dedicated order page.

#### Requirements

- Load the current user's orders.
- Listen for updates to the order document.
- Display current status and timestamps.
- Display payment state separately from fulfillment state.
- Show the latest status event.
- Handle connection loss without leaving the page in a broken state.

#### Acceptance criteria

- A status update appears immediately on the order page.
- A disconnected client reconnects automatically.
- A user sees the exact order status and payment status.

### 5. Analytics dashboard

Build a protected admin dashboard with sales, inventory, seller, and product metrics.

Recommended metrics:

- Total revenue
- Number of orders
- Conversion rate
- Average order value
- Products with low stock
- Sales by category
- Sales by seller
- Top products
- Payment success and failure rates
- Order completion time

#### Acceptance criteria

- Admin can view dashboard data without exposing private payment details.
- Metrics are calculated from the canonical order and product records.
- The dashboard refreshes or updates through a stable API.

### 6. KYC and trust controls

Add a KYC workflow before supporting production payments.

- Identity verification
- Document upload
- Verification status
- Review timestamp
- Rejection reason
- Seller trust score
- Payment eligibility

### 7. Push notifications

Add a notification service that supports:

- Order confirmation
- Order status changes
- Payment success
- Payment failure
- Seller approval
- Seller rejection
- Product inventory alerts

## Phase 3 — 12–18 months

### 1. Mobile app

Create a React Native application that consumes the same product, order, seller, and payment APIs.

### 2. Recommendation engine

Start with collaborative and content-based recommendations:

- Product popularity
- Seller affinity
- Category preference
- Previously viewed products
- Completed orders

### 3. Multi-currency

Add KES, USD, and UGX using a central exchange-rate service and explicit currency conversion rules.

### 4. Logistics integrations

Add provider adapters for Sendy and pickup APIs. The application should use a common shipment interface rather than embedding provider logic in the order page.

## Phase 4 — long term

### 1. Microservices

Separate:

- Catalog service
- Seller service
- Order service
- Payment service
- Inventory service
- Notification service
- Identity service

### 2. Event-driven architecture

Publish order, payment, inventory, and seller events to Kafka or Google Pub/Sub.

### 3. Data warehouse

Move business reporting to BigQuery or another warehouse.

### 4. CDN personalization

Use edge functions and caching for product pages and recommendations while keeping account-specific data on the server.

## Recommended Phase 2 Implementation Order

1. Define the canonical seller, product, order, and payment models.
2. Create the seller onboarding API and authorization rules.
3. Add seller ownership to products.
4. Add Cloudinary upload support.
5. Build the seller product dashboard.
6. Add the order tracking page and Firestore listener.
7. Add the analytics dashboard.
8. Add KYC and notification services.

## Immediate Next Task

The first practical milestone should be **seller ownership + seller product management**, because it creates the foundation for Cloudinary uploads, seller onboarding, and multi-vendor marketplace behavior.

The implementation should begin with one seller onboarding endpoint, one seller-owned product collection, and a small seller dashboard. This avoids building a full marketplace before the data model is stable.
