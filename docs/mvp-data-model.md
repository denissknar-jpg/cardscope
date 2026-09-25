# MVP data model for virtual cards

## 1. Purpose

This model defines the minimum data structure needed for the first version of the project. The goal is to support a product catalog, partner management, affiliate linking, and future automation without overengineering the first release.

## 2. Core entities

### 2.1 Partner

Fields:
- partner_id: unique identifier
- name: partner business name
- website_url: public site or landing page
- country: market region
- program_type: CPA | RevShare | Referral | Hybrid
- commission_value: commission amount or percentage
- payout_schedule: weekly | monthly | threshold-based
- payout_min: minimum payout threshold
- api_available: boolean
- tracking_method: url | cookie | api | hybrid
- kyc_required: boolean
- traffic_rules: text summary
- status: active | monitoring | paused | rejected
- created_at: timestamp
- updated_at: timestamp

### 2.2 Offer

Fields:
- offer_id: unique identifier
- partner_id: link to partner
- category_id: link to category
- offer_name: product name
- short_description: short summary
- full_description: longer description
- product_type: virtual_card | debit_card | credit_card | deposit | sim_card | service_payment
- affiliate_url: referral link
- landing_url: landing page or partner page
- commission_value: commission or payout amount
- payout_currency: currency code
- min_amount: minimal value or threshold
- validity_status: active | experimental | paused | archived
- is_featured: boolean
- kyc_required: boolean
- region_restrictions: region filter
- notes: internal comments
- last_checked_at: timestamp
- last_updated_at: timestamp

### 2.3 Category

Fields:
- category_id
- name
- slug
- description
- sort_order
- is_active

### 2.4 Audit log

Fields:
- audit_id
- offer_id
- changed_by
- field_name
- old_value
- new_value
- change_reason
- changed_at

## 3. Suggested MVP categories

- virtual_cards
- debit_cards
- credit_cards
- deposits
- sim_cards
- service_payments

## 4. Minimum recommended fields for first release

For the first working product, it is enough to store:
- product name
- category
- partner
- commission
- terms
- tracking link
- status
- last update
- notes

This is enough for a useful public catalog and for future automation.

## 5. Automation requirements

The following fields should be updated automatically:
- affiliate_url
- commission_value
- status
- last_checked_at
- last_updated_at
- notes

Automation should also detect:
- broken links
- outdated commission values
- inactive offers
- missing KYC requirements
- partner policy changes

## 6. First release recommendation

Start with only the most stable fields and visible data. Do not overengineer filters or analytics in the first version. Focus on:
- product list
- category filter
- search
- affiliate link
- status
- update log

## 7. Data flow

1. Partner data is collected and stored.
2. Offer records are created from the partner information.
3. Offers are displayed in the catalog.
4. The automation layer checks the source data periodically.
5. Changed values are written to the audit log.
6. Moderators review flagged items before public publication.

## 8. Summary

The MVP model should stay simple, clear, and easily extendable. A small but reliable data structure is more valuable than a broad but fragile system at the first stage.
