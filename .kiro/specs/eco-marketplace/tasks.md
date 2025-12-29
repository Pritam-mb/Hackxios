# Implementation Plan: EcoSync Marketplace

## Overview

This implementation plan breaks down the EcoSync sustainable marketplace into discrete coding tasks. The platform uses React frontend, Node.js/Express backend, and PostgreSQL database with a Green Points system based on carbon footprint savings.

## Tasks

- [ ] 1. Project Setup and Core Infrastructure
  - [ ] 1.1 Initialize Node.js/Express backend project with TypeScript
    - Set up package.json with dependencies (express, typescript, pg, bcrypt, jsonwebtoken)
    - Configure tsconfig.json and ESLint
    - Create folder structure: src/services, src/routes, src/models, src/middleware
    - _Requirements: All_

  - [ ] 1.2 Set up PostgreSQL database schema
    - Create migration files for all tables (users, listings, transactions, reviews, points_transactions, category_carbon_data, rewards)
    - Define enums for listing_type, transaction_type, transaction_status
    - Set up foreign key relationships
    - _Requirements: All_

  - [ ] 1.3 Set up testing framework
    - Install Jest, fast-check, and supertest
    - Configure test environment with test database
    - Create test utilities and helpers
    - _Requirements: All_

- [ ] 2. Authentication Service
  - [ ] 2.1 Implement user registration and login
    - Create AuthService with register() and login() methods
    - Implement password hashing with bcrypt
    - Generate JWT tokens for authentication
    - Initialize greenPointsBalance to 0 on registration
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ] 2.2 Implement authentication middleware
    - Create validateToken middleware for protected routes
    - Handle token expiration and refresh
    - _Requirements: 1.2, 1.3_

  - [ ]* 2.3 Write property test for zero points initialization
    - **Property 1: New User Zero Points Initialization**
    - **Validates: Requirements 1.4**

  - [ ]* 2.4 Write property test for authentication round-trip
    - **Property 2: Authentication Round-Trip**
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 2.5 Write property test for invalid credentials rejection
    - **Property 3: Invalid Credentials Rejection**
    - **Validates: Requirements 1.3**

- [ ] 3. Checkpoint - Authentication Complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Listing Service
  - [ ] 4.1 Implement listing CRUD operations
    - Create ListingService with create(), update(), delete(), getById() methods
    - Validate required fields (title, description, photos, price, listingType)
    - Require rentalPeriods for rental listings
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 4.2 Implement listing search and filtering
    - Create search() method with keyword matching
    - Implement category and location filters
    - Add sorting by price, date, greenPoints potential
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 4.3 Write property test for listing CRUD consistency
    - **Property 4: Listing CRUD Consistency**
    - **Validates: Requirements 2.1, 2.4, 2.5**

  - [ ]* 4.4 Write property test for listing validation
    - **Property 5: Listing Validation**
    - **Validates: Requirements 2.2, 2.3, 2.6**

  - [ ]* 4.5 Write property test for search filter accuracy
    - **Property 6: Search Filter Accuracy**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [ ]* 4.6 Write property test for search sort order
    - **Property 7: Search Sort Order**
    - **Validates: Requirements 3.4**

- [ ] 5. Checkpoint - Listings Complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Carbon Calculator Service
  - [ ] 6.1 Implement carbon calculation logic
    - Create CarbonCalculatorService with calculateSavings() method
    - Load category-specific carbon data from database
    - Calculate savings: newProductionKgCO2 - (transport + disposal avoided)
    - Apply rental factor for rental transactions
    - Implement default model for unknown categories
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ] 6.2 Implement carbon equivalents calculation
    - Calculate equivalent trees planted (1 tree ≈ 21kg CO2/year)
    - Calculate equivalent car miles avoided (1 mile ≈ 0.4kg CO2)
    - Return CalculationBreakdown with all metrics
    - _Requirements: 6.3_

  - [ ]* 6.3 Write property test for carbon calculation consistency
    - **Property 11: Carbon Calculation Consistency**
    - **Validates: Requirements 6.1, 6.2, 6.4**

  - [ ]* 6.4 Write property test for carbon equivalents
    - **Property 12: Carbon Equivalents Calculation**
    - **Validates: Requirements 6.3**

- [ ] 7. Green Points Service
  - [ ] 7.1 Implement points calculation and awarding
    - Create GreenPointsService with calculatePoints() method
    - Define points-to-carbon ratio (e.g., 10 points per kg CO2 saved)
    - Implement awardPoints() to credit both transaction parties
    - Record points transactions in database
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 7.2 Implement points redemption
    - Create redeem() method with balance validation
    - Deduct points on successful redemption
    - Return available rewards list
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 7.3 Write property test for points awarded to both parties
    - **Property 10: Points Awarded to Both Parties**
    - **Validates: Requirements 5.3**

  - [ ]* 7.4 Write property test for redemption balance validation
    - **Property 15: Redemption Balance Validation**
    - **Validates: Requirements 8.1, 8.2, 8.4**

- [ ] 8. Checkpoint - Carbon and Points Complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Transaction Service
  - [ ] 9.1 Implement transaction initiation
    - Create TransactionService with initiate() method
    - Create pending transaction with type (purchase/rental)
    - Store rental period dates for rentals
    - _Requirements: 4.1, 4.2_

  - [ ] 9.2 Implement transaction state management
    - Implement confirmPayment() to transition to completed
    - Implement cancel() for failed payments
    - Integrate with CarbonCalculator and GreenPoints services on completion
    - Send notifications to both parties
    - _Requirements: 4.3, 4.4, 4.5, 4.6_

  - [ ]* 9.3 Write property test for transaction creation
    - **Property 8: Transaction Creation**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 9.4 Write property test for transaction state transitions
    - **Property 9: Transaction State Transitions**
    - **Validates: Requirements 4.3, 4.5**

- [ ] 10. Review Service
  - [ ] 10.1 Implement review submission and authorization
    - Create ReviewService with submit() and canReview() methods
    - Verify completed transaction exists between users
    - Prevent duplicate reviews for same transaction
    - _Requirements: 7.1, 7.4_

  - [ ] 10.2 Implement rating calculation
    - Update user's averageRating on new review
    - Implement getAverageRating() and getByUser() methods
    - _Requirements: 7.2, 7.3_

  - [ ]* 10.3 Write property test for review authorization
    - **Property 13: Review Authorization**
    - **Validates: Requirements 7.1, 7.4**

  - [ ]* 10.4 Write property test for rating average update
    - **Property 14: Rating Average Update**
    - **Validates: Requirements 7.2**

- [ ] 11. Checkpoint - All Services Complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. API Routes and Integration
  - [ ] 12.1 Create REST API endpoints
    - POST/GET /auth/register, /auth/login
    - CRUD /listings, GET /listings/search
    - POST /transactions, PATCH /transactions/:id/confirm, /transactions/:id/cancel
    - POST /reviews, GET /users/:id/reviews
    - GET /points/balance, POST /points/redeem, GET /rewards
    - _Requirements: All_

  - [ ] 12.2 Wire up services and middleware
    - Connect routes to services
    - Apply authentication middleware to protected routes
    - Add error handling middleware
    - _Requirements: All_

  - [ ]* 12.3 Write integration tests
    - Test complete purchase flow
    - Test complete rental flow
    - Test user journey: register → list → sell → earn → redeem
    - _Requirements: All_

- [ ] 13. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
