# EcoSync Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                      React Web App                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Auth    │ │ Listings │ │  Search  │ │ Profile  │           │
│  │  Pages   │ │  Pages   │ │  Pages   │ │  Pages   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────┬───────────────────────────────────────┘
                          │ REST API
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                 │
│                   Express.js Server                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Middleware                             │   │
│  │  • Authentication (JWT)  • Rate Limiting  • Validation   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│     AUTH      │ │   LISTING     │ │  TRANSACTION  │
│   SERVICE     │ │   SERVICE     │ │   SERVICE     │
│               │ │               │ │               │
│ • Register    │ │ • Create      │ │ • Initiate    │
│ • Login       │ │ • Update      │ │ • Confirm     │
│ • Validate    │ │ • Delete      │ │ • Complete    │
│ • Logout      │ │ • Search      │ │ • Cancel      │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │
        │         ┌───────┴───────┐         │
        │         ▼               ▼         │
        │ ┌───────────────┐ ┌───────────────┐
        │ │    CARBON     │ │ GREEN POINTS  │
        │ │  CALCULATOR   │ │   SERVICE     │
        │ │               │ │               │
        │ │ • Calculate   │ │ • Calculate   │
        │ │ • Get Data    │ │ • Award       │
        │ │ • Equivalents │ │ • Redeem      │
        │ └───────┬───────┘ └───────┬───────┘
        │         │                 │
        └─────────┼─────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │     PostgreSQL       │    │       Redis          │          │
│  │                      │    │                      │          │
│  │ • Users              │    │ • Session Cache      │          │
│  │ • Listings           │    │ • Search Cache       │          │
│  │ • Transactions       │    │ • Rate Limits        │          │
│  │ • Reviews            │    │                      │          │
│  │ • Points             │    │                      │          │
│  │ • Carbon Data        │    │                      │          │
│  │ • Rewards            │    │                      │          │
│  └──────────────────────┘    └──────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│   PAYMENT     │   │    EMAIL      │
│   GATEWAY     │   │   SERVICE     │
│   (Stripe)    │   │  (SendGrid)   │
└───────────────┘   └───────────────┘
```

---

## Transaction Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  BUYER   │     │   API    │     │ SERVICES │     │    DB    │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. Initiate    │                │                │
     │ ──────────────>│                │                │
     │                │ 2. Validate    │                │
     │                │ ──────────────>│                │
     │                │                │ 3. Create      │
     │                │                │ ──────────────>│
     │                │                │<───────────────│
     │                │<───────────────│ Transaction    │
     │<───────────────│ Pending        │ (pending)      │
     │                │                │                │
     │ 4. Pay         │                │                │
     │ ──────────────>│                │                │
     │                │ 5. Process     │                │
     │                │ ──────────────>│ Payment        │
     │                │                │ Gateway        │
     │                │                │                │
     │                │ 6. On Success  │                │
     │                │ ──────────────>│                │
     │                │                │ 7. Calculate   │
     │                │                │ Carbon ───────>│
     │                │                │<───────────────│
     │                │                │                │
     │                │                │ 8. Award       │
     │                │                │ Points ───────>│
     │                │                │<───────────────│
     │                │                │                │
     │                │                │ 9. Update      │
     │                │                │ Status ───────>│
     │                │<───────────────│<───────────────│
     │<───────────────│ Complete       │                │
     │                │ + Points       │                │
     │                │                │                │
```

---

## Green Points Calculation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    TRANSACTION COMPLETED                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              GET ITEM CATEGORY DATA                          │
│                                                              │
│  Category: Electronics (Laptop)                              │
│  ├── New Production: 150 kg CO2                              │
│  ├── Transport: 8 kg CO2                                     │
│  └── Disposal: 15 kg CO2                                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              CALCULATE CARBON SAVINGS                        │
│                                                              │
│  IF Purchase:                                                │
│    Savings = Production + Transport + Disposal               │
│    Savings = 150 + 8 + 15 = 173 kg CO2                       │
│                                                              │
│  IF Rental:                                                  │
│    Savings = (Production + Transport + Disposal) × 0.3       │
│    Savings = 173 × 0.3 = 51.9 kg CO2                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              CONVERT TO GREEN POINTS                         │
│                                                              │
│  Points = Carbon Savings × 10                                │
│  Points = 173 × 10 = 1,730 points                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              AWARD TO BOTH PARTIES                           │
│                                                              │
│  Buyer:  +865 points (50%)                                   │
│  Seller: +865 points (50%)                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              CALCULATE EQUIVALENTS                           │
│                                                              │
│  Trees Planted: 173 ÷ 21 = 8.2 trees                         │
│  Car Miles Avoided: 173 ÷ 0.4 = 432 miles                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Overview

```
┌─────────────────┐       ┌─────────────────┐
│     USERS       │       │    LISTINGS     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │
│ email           │  │    │ user_id (FK) ───┼──┐
│ password_hash   │  │    │ title           │  │
│ display_name    │  │    │ description     │  │
│ location        │  │    │ category        │  │
│ green_points    │  │    │ photos[]        │  │
│ avg_rating      │  │    │ listing_type    │  │
│ created_at      │  │    │ price           │  │
└─────────────────┘  │    │ rental_periods  │  │
         │           │    │ location        │  │
         │           │    │ status          │  │
         │           │    └─────────────────┘  │
         │           │             │           │
         │           └─────────────┼───────────┘
         │                         │
         ▼                         ▼
┌─────────────────────────────────────────────┐
│              TRANSACTIONS                    │
├─────────────────────────────────────────────┤
│ id (PK)                                      │
│ listing_id (FK) ─────────────────────────────┤
│ seller_id (FK) ──────────────────────────────┤
│ buyer_id (FK) ───────────────────────────────┤
│ type (purchase/rental)                       │
│ status (pending/paid/completed/cancelled)    │
│ amount                                       │
│ carbon_saved                                 │
│ green_points_awarded                         │
│ rental_start_date                            │
│ rental_end_date                              │
│ created_at                                   │
│ completed_at                                 │
└─────────────────────────────────────────────┘
         │
         ├──────────────────┐
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│    REVIEWS      │  │ POINTS_TRANS    │
├─────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)         │
│ reviewer_id(FK) │  │ user_id (FK)    │
│ reviewee_id(FK) │  │ transaction_id  │
│ transaction_id  │  │ points          │
│ rating (1-5)    │  │ type            │
│ comment         │  │ description     │
│ created_at      │  │ created_at      │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ CARBON_DATA     │  │    REWARDS      │
├─────────────────┤  ├─────────────────┤
│ category (PK)   │  │ id (PK)         │
│ production_co2  │  │ name            │
│ transport_co2   │  │ description     │
│ disposal_co2    │  │ points_cost     │
└─────────────────┘  │ available       │
                     └─────────────────┘
```

---

## API Endpoints

```
AUTH
├── POST   /api/auth/register     → Create account
├── POST   /api/auth/login        → Get JWT token
└── POST   /api/auth/logout       → Invalidate token

LISTINGS
├── POST   /api/listings          → Create listing
├── GET    /api/listings/:id      → Get listing
├── PUT    /api/listings/:id      → Update listing
├── DELETE /api/listings/:id      → Delete listing
└── GET    /api/listings/search   → Search with filters

TRANSACTIONS
├── POST   /api/transactions           → Initiate
├── PATCH  /api/transactions/:id/pay   → Confirm payment
├── PATCH  /api/transactions/:id/cancel→ Cancel
└── GET    /api/transactions           → User's transactions

REVIEWS
├── POST   /api/reviews                → Submit review
└── GET    /api/users/:id/reviews      → Get user reviews

GREEN POINTS
├── GET    /api/points/balance         → Get balance
├── GET    /api/points/history         → Get history
├── POST   /api/points/redeem          → Redeem reward
└── GET    /api/rewards                → Available rewards

USERS
├── GET    /api/users/:id              → Get profile
└── PUT    /api/users/:id              → Update profile
```

---

## State Machines

### Transaction Status
```
                    ┌─────────┐
                    │ PENDING │
                    └────┬────┘
                         │
           ┌─────────────┼─────────────┐
           │             │             │
           ▼             │             ▼
    ┌──────────┐         │      ┌───────────┐
    │   PAID   │         │      │ CANCELLED │
    └────┬─────┘         │      └───────────┘
         │               │
         ▼               │
   ┌───────────┐         │
   │ COMPLETED │◄────────┘
   └───────────┘    (payment confirmed)
```

### Listing Status
```
    ┌────────┐
    │ ACTIVE │◄──────────────┐
    └───┬────┘               │
        │                    │
        ├────────┐           │
        │        │           │
        ▼        ▼           │
   ┌────────┐ ┌────────┐     │
   │  SOLD  │ │ RENTED │─────┘
   └────────┘ └────────┘  (rental ends)
```
