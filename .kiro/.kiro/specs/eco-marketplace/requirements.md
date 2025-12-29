# Requirements Document

## Introduction

EcoSync is a sustainable marketplace platform where users can rent or sell their items. The platform incentivizes eco-friendly behavior through a Green Points system that rewards users based on the carbon footprint saved by reusing items instead of buying new ones.

## Glossary

- **Platform**: The EcoSync web application
- **User**: A registered member who can list, rent, sell, or purchase items
- **Listing**: An item posted for rent or sale by a User
- **Green_Points**: Reward currency earned based on carbon footprint savings
- **Carbon_Calculator**: The component that estimates carbon savings for transactions
- **Transaction**: A completed rental or sale between two Users
- **Renter**: A User who temporarily borrows an item
- **Seller**: A User who permanently transfers ownership of an item
- **Buyer**: A User who purchases an item

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a visitor, I want to create an account and log in, so that I can participate in the marketplace.

#### Acceptance Criteria

1. WHEN a visitor provides valid email, password, and profile information, THE Platform SHALL create a new User account
2. WHEN a User provides valid credentials, THE Platform SHALL authenticate and grant access to the marketplace
3. IF a User provides invalid credentials, THEN THE Platform SHALL display an error message and deny access
4. WHEN a User account is created, THE Platform SHALL initialize their Green_Points balance to zero

### Requirement 2: Item Listing Management

**User Story:** As a user, I want to list my items for rent or sale, so that others can find and acquire them.

#### Acceptance Criteria

1. WHEN a User creates a listing with title, description, photos, and price, THE Platform SHALL publish the Listing to the marketplace
2. WHEN a User specifies listing type, THE Platform SHALL categorize it as either "rent" or "sell"
3. WHEN a User creates a rental listing, THE Platform SHALL require rental duration options and pricing per period
4. WHEN a User edits their Listing, THE Platform SHALL update the listing details immediately
5. WHEN a User deletes their Listing, THE Platform SHALL remove it from the marketplace
6. IF a User attempts to create a Listing without required fields, THEN THE Platform SHALL display validation errors

### Requirement 3: Item Discovery and Search

**User Story:** As a user, I want to search and browse items, so that I can find what I need to rent or buy.

#### Acceptance Criteria

1. WHEN a User enters search keywords, THE Platform SHALL return relevant Listings matching the query
2. WHEN a User applies category filters, THE Platform SHALL display only Listings in selected categories
3. WHEN a User applies location filters, THE Platform SHALL display Listings within the specified area
4. WHEN a User sorts results by price, date, or Green_Points potential, THE Platform SHALL order Listings accordingly
5. THE Platform SHALL display estimated Green_Points for each Listing

### Requirement 4: Transaction Processing

**User Story:** As a user, I want to complete rental or purchase transactions, so that I can acquire items I need.

#### Acceptance Criteria

1. WHEN a Buyer initiates a purchase, THE Platform SHALL create a pending Transaction
2. WHEN a Renter initiates a rental, THE Platform SHALL create a pending Transaction with rental period details
3. WHEN payment is confirmed, THE Platform SHALL mark the Transaction as completed
4. WHEN a Transaction is completed, THE Platform SHALL notify both parties
5. IF payment fails, THEN THE Platform SHALL cancel the Transaction and notify the Buyer/Renter
6. WHEN a rental period ends, THE Platform SHALL prompt the Renter to return the item

### Requirement 5: Green Points Calculation and Award

**User Story:** As a user, I want to earn Green Points based on my eco-friendly transactions, so that I am rewarded for sustainable behavior.

#### Acceptance Criteria

1. WHEN a Transaction is completed, THE Carbon_Calculator SHALL estimate the carbon footprint saved
2. WHEN carbon savings are calculated, THE Platform SHALL convert savings to Green_Points using a defined ratio
3. WHEN Green_Points are calculated, THE Platform SHALL award points to both the Buyer/Renter and Seller/Owner
4. THE Platform SHALL display the carbon footprint calculation breakdown for each Transaction
5. WHEN a User views their profile, THE Platform SHALL display their total Green_Points and carbon savings history

### Requirement 6: Carbon Footprint Estimation

**User Story:** As a user, I want to understand how my transactions help the environment, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN an item category is selected, THE Carbon_Calculator SHALL use category-specific carbon data for estimation
2. THE Carbon_Calculator SHALL estimate carbon saved by comparing reused item vs. new production
3. WHEN displaying carbon savings, THE Platform SHALL show equivalent metrics (e.g., trees planted, car miles avoided)
4. IF carbon data is unavailable for an item category, THEN THE Carbon_Calculator SHALL use a default estimation model

### Requirement 7: User Ratings and Reviews

**User Story:** As a user, I want to rate and review other users after transactions, so that the community can identify trustworthy members.

#### Acceptance Criteria

1. WHEN a Transaction is completed, THE Platform SHALL allow both parties to submit ratings and reviews
2. WHEN a User submits a rating, THE Platform SHALL update the other party's reputation score
3. WHEN a User views a profile, THE Platform SHALL display their average rating and recent reviews
4. IF a User attempts to review without completing a Transaction, THEN THE Platform SHALL deny the review submission

### Requirement 8: Green Points Redemption

**User Story:** As a user, I want to redeem my Green Points for rewards, so that my sustainable behavior has tangible benefits.

#### Acceptance Criteria

1. WHEN a User has sufficient Green_Points, THE Platform SHALL allow redemption for available rewards
2. WHEN Green_Points are redeemed, THE Platform SHALL deduct points from the User's balance
3. THE Platform SHALL display available rewards and their Green_Points cost
4. IF a User attempts to redeem more points than available, THEN THE Platform SHALL display an insufficient balance error
