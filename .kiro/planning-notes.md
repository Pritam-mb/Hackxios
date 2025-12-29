# EcoSync Planning Notes

## Project Overview

EcoSync is a sustainable marketplace where users can rent or sell items while earning Green Points based on carbon footprint savings.

---

## Core Features Breakdown

### 1. User Management
- Registration with email/password
- JWT-based authentication
- User profiles with location, avatar
- Green Points balance tracking
- Reputation/rating system

### 2. Item Listings
- Create listings for rent OR sale
- Required: title, description, photos, price, category
- Rental listings need: duration options, pricing per period
- Edit/delete own listings
- Status management (active, sold, rented)

### 3. Search & Discovery
- Keyword search
- Category filters
- Location-based filtering (radius)
- Sort by: price, date, green points potential
- Display estimated Green Points per listing

### 4. Transactions
- Purchase flow (buy items)
- Rental flow (borrow items with dates)
- Payment processing
- Status: pending → paid → completed / cancelled
- Notifications to both parties

### 5. Green Points System
- Earned on completed transactions
- Both buyer AND seller get points
- Points = carbon savings × conversion ratio
- Redeemable for rewards
- Balance validation on redemption

### 6. Carbon Calculator
- Category-specific carbon data
- Formula: new production CO2 - reuse savings
- Rental factor (partial savings)
- Equivalent metrics: trees planted, car miles avoided
- Default model for unknown categories

### 7. Reviews & Ratings
- Only after completed transactions
- 1-5 star rating + comment
- Updates user's average rating
- One review per party per transaction

---

## User Flows

### Seller Flow
```
Register → List Item → Receive Offer → Complete Sale → Earn Green Points
```

### Buyer Flow
```
Register → Search Items → Purchase/Rent → Complete Transaction → Earn Green Points → Redeem Rewards
```

### Green Points Flow
```
Transaction Complete → Calculate Carbon Saved → Convert to Points → Award Both Parties → Display in Profile
```

---

## Key Business Rules

1. **Points Initialization**: New users start with 0 Green Points
2. **Dual Rewards**: Both parties earn points on every transaction
3. **Rental vs Sale**: Rentals use a factor (e.g., 0.3x) for carbon savings
4. **Review Gate**: Must complete transaction to leave review
5. **Redemption Lock**: Cannot redeem more points than balance

---

## Item Categories (with carbon data)

| Category | New Production (kg CO2) | Transport | Disposal |
|----------|------------------------|-----------|----------|
| Electronics | 50-200 | 5-10 | 10-20 |
| Furniture | 30-100 | 10-30 | 15-25 |
| Clothing | 10-30 | 2-5 | 3-8 |
| Tools | 20-50 | 3-8 | 5-10 |
| Sports Equipment | 15-60 | 5-15 | 8-15 |
| Books | 2-5 | 1-2 | 1-2 |
| Appliances | 40-150 | 10-20 | 15-30 |

---

## Green Points Conversion

- **Ratio**: 10 points per 1 kg CO2 saved
- **Tree Equivalent**: 1 tree ≈ 21 kg CO2/year absorbed
- **Car Miles**: 1 mile ≈ 0.4 kg CO2 emitted

### Example Calculation
```
Item: Used Laptop (Electronics)
New Production: 150 kg CO2
Transport Saved: 8 kg CO2
Disposal Avoided: 15 kg CO2
Total Saved: 173 kg CO2
Green Points: 1,730 points (split between buyer/seller)
```

---

## Reward Tiers (Example)

| Reward | Points Cost |
|--------|-------------|
| $5 Platform Credit | 500 |
| Plant a Tree | 1,000 |
| $20 Partner Discount | 2,000 |
| Carbon Offset Certificate | 5,000 |
| Premium Membership (1 month) | 10,000 |
