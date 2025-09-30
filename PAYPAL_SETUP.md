# PayPal Integration Setup Guide

## 🚀 Quick Start

### 1. Install PayPal SDK

```bash
pnpm add @paypal/checkout-server-sdk
```

### 2. Set Up PayPal Developer Account

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create a new app (or use existing)
3. Get your **Client ID** and **Secret**
4. Note: Use **Sandbox** for testing, **Live** for production

### 3. Add Environment Variables

Add to your `.env` file:

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_secret_here
PAYPAL_MODE=sandbox  # or 'live' for production

# PayPal Webhook Secret (for verifying webhook signatures)
PAYPAL_WEBHOOK_ID=your_webhook_id_here

# Public keys for client-side
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id_here
```

---

## 📋 PayPal Subscription Plan IDs

You need to create subscription plans in PayPal Dashboard first:

### Create Plans in PayPal Dashboard

1. Go to **Products & Services** → **Subscriptions**
2. Click **Create Plan**
3. Create plans for each tier:

#### Professional Plan

- **Name**: KamkmPDF Professional
- **Billing Cycle**: Monthly
- **Price**: $12 USD
- **Plan ID**: Copy this after creation

#### Business Plan

- **Name**: KamkmPDF Business
- **Billing Cycle**: Monthly
- **Price**: $79 USD
- **Plan ID**: Copy this after creation

#### Enterprise Plan

- **Name**: KamkmPDF Enterprise
- **Billing Cycle**: Monthly
- **Price**: $500 USD
- **Plan ID**: Copy this after creation

### Add Plan IDs to Environment

```env
# PayPal Plan IDs (get these from PayPal Dashboard)
PAYPAL_PLAN_ID_PROFESSIONAL=P-xxxxxxxxxxxxx
PAYPAL_PLAN_ID_BUSINESS=P-xxxxxxxxxxxxx
PAYPAL_PLAN_ID_ENTERPRISE=P-xxxxxxxxxxxxx
```

---

## 🔔 Webhook Setup

### 1. Create Webhook in PayPal Dashboard

1. Go to **Developer Dashboard** → **Webhooks**
2. Click **Create Webhook**
3. **Webhook URL**: `https://yourdomain.com/api/webhooks/paypal`
4. **Event types** to subscribe to:
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.REFUNDED`

5. Save and copy the **Webhook ID**

### 2. Test Webhook Locally

Use ngrok or similar tool:

```bash
ngrok http 3000
```

Then update webhook URL to: `https://your-ngrok-url.ngrok.io/api/webhooks/paypal`

---

## 🧪 Testing

### Test Cards (Sandbox Mode)

PayPal provides test accounts in sandbox:

1. Go to **Sandbox** → **Accounts**
2. Use the **Personal** account email/password to test purchases
3. Use the **Business** account to receive payments

### Test Flow

1. Visit `/pricing`
2. Click "Upgrade to Pro"
3. Complete PayPal checkout (use sandbox account)
4. Verify subscription created in database
5. Check webhook received and processed

---

## 🔒 Security Best Practices

1. **Never expose secrets** - Keep `PAYPAL_CLIENT_SECRET` server-side only
2. **Verify webhooks** - Always verify webhook signatures
3. **Use HTTPS** - Required for production webhooks
4. **Validate amounts** - Double-check subscription prices in webhooks
5. **Handle failures** - Implement proper error handling and retries

---

## 📊 Monitoring

### Key Metrics to Track

- Successful subscriptions created
- Failed payment attempts
- Subscription cancellations
- Webhook delivery failures
- Payment disputes/chargebacks

### PayPal Dashboard

Monitor in real-time:

- **Activity** → View all transactions
- **Reports** → Download detailed reports
- **Disputes** → Handle customer disputes

---

## 🚨 Common Issues

### Issue: Webhook not receiving events

**Solution**:

- Check webhook URL is publicly accessible
- Verify webhook is active in PayPal Dashboard
- Check event types are subscribed

### Issue: "Invalid client credentials"

**Solution**:

- Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`
- Ensure using correct mode (sandbox vs live)
- Regenerate credentials if needed

### Issue: Subscription not activating

**Solution**:

- Check PayPal plan is active
- Verify plan ID matches environment variable
- Check webhook handler is processing `BILLING.SUBSCRIPTION.ACTIVATED`

---

## 📚 Resources

- [PayPal Subscriptions API](https://developer.paypal.com/docs/subscriptions/)
- [PayPal Webhooks Guide](https://developer.paypal.com/api/rest/webhooks/)
- [PayPal Sandbox Testing](https://developer.paypal.com/tools/sandbox/)
- [PayPal Node.js SDK](https://github.com/paypal/Checkout-NodeJS-SDK)

---

## ✅ Checklist

Before going live:

- [ ] PayPal app created in Developer Dashboard
- [ ] Subscription plans created for all tiers
- [ ] Environment variables configured
- [ ] Webhook endpoint deployed and accessible
- [ ] Webhook verified in PayPal Dashboard
- [ ] Test purchases completed successfully
- [ ] Database updates working correctly
- [ ] Error handling implemented
- [ ] Monitoring/logging set up
- [ ] Switch from sandbox to live mode
- [ ] Update client ID in frontend

---

**Ready to integrate!** Follow the implementation files created in this PR.
