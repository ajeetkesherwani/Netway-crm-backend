# NetwayCRM

**NetwayCRM** is a Customer Relationship Management (CRM) system tailored for broadband service providers. It helps manage broadband plans, track customer subscriptions, automate billing, and monitor usage — all in one centralized platform.

---

## 🚀 Features

- 📦 **Broadband Plan Management** – Create, edit, and categorize internet packages by speed, data limit, price, and validity.
- 👥 **Customer Management** – Store and manage customer profiles, KYC documents, addresses, and plan subscriptions.
- 💳 **Billing & Invoicing** – Automated bill generation with payment tracking, due date reminders, and invoice history.
- 📈 **Usage Monitoring** – Track data usage and alert customers on nearing limits (optional feature).
- 🔔 **Notifications** – SMS/Email alerts for renewals, offers, payments, and usage.
- 📊 **Admin Dashboard** – Real-time metrics on subscribers, plan sales, revenue, and usage analytics.

---

## 🛠️ Tech Stack

- **Backend:** Node.js 
- **Frontend:** React.js 
- **Database:** MongoDB
- **Authentication:** JWT / OAuth2
- **APIs:** RESTful APIs for frontend/backend communication
- **Deployment:** VPS 

## Broadband plan payments with CCAvenue

The broadband payment endpoints are separate from product orders:

- `POST /api/user/recharge/plan-payment` (authenticated): create a pending plan payment. Send `{ "packageId": "<package-id>" }`. The amount is looked up by the backend from the user's plan/price book.
- `POST /api/user/recharge/ccavenue/callback` (CCAvenue callback): decrypt CCAvenue's `encResp`, reconfirm the order with its Status API, then activate the plan only on a verified successful payment.
- `GET /api/user/recharge/plan-payment/:orderId` (authenticated): check the current status for the signed-in user.
- The legacy `POST /api/user/recharge/planPurchase` route remains available, but now requires an order or tracking ID for an already verified payment.

Set `CCAVENUE_ENV=staging` while testing. The callback URL defaults to the origin of `API_BASE_URL` plus `/api/user/recharge/ccavenue/callback`; optionally set `CCAVENUE_CALLBACK_URL` to the exact public callback URL registered with CCAvenue. The callback must be reachable by CCAvenue. Register the backend server's outbound public IP in CCAvenue for the Status API call. Production callbacks must use HTTPS.
I
In Postman, first create a plan payment with the user's bearer token. Copy `orderId` and `gatewayUrl` from the response, then check status with the authenticated GET endpoint. To complete an actual sandbox payment, submit the returned `gatewayFields` (`encRequest` and `access_code`) as an `x-www-form-urlencoded` POST to `gatewayUrl` in a browser; the CCAvenue checkout/bank authentication flow requires browser redirects and cannot be completed by just calling the backend endpoint in Postman. CCAvenue posts the encrypted result to the callback, after which the status endpoint reports `Paid` or `Failed`.

The supplied CCAvenue API guide describes merchant API calls such as status/lookups. The hosted checkout URL is returned by the plan-payment endpoint; do not send its checkout request to the merchant API (`DoWebTrans`) URL.

---
