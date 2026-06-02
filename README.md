# DEHYDE — Premium Menswear Streetwear

Luxury D2C ecommerce platform for premium menswear streetwear (India).

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, TypeScript, Tailwind, Framer Motion, Shadcn UI, Zustand |
| Backend | Node.js, Express.js, MongoDB Atlas |
| Auth | JWT, Google OAuth, OTP-ready |
| Payments | Razorpay |
| Images | Cloudinary |

## Folder Structure

```
dehyde/
├── frontend/          # Next.js App Router (Vercel)
├── backend/           # Express REST API (Railway / Render)
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB Atlas cluster
- Razorpay keys (test/live)
- Cloudinary account
- Google OAuth credentials (optional)

### Backend

```bash
cd backend
cp .env.example .env
# Fill MONGODB_URI, JWT secrets, Razorpay, Cloudinary, etc.
npm install
npm run dev
```

API runs at `http://localhost:5000`

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev
```

App runs at `http://localhost:3000`

## Deployment

### Frontend → Vercel

1. Import repo, set root directory to `frontend`
2. Environment variables:
   - `NEXT_PUBLIC_API_URL` → production API URL
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
3. Deploy

### Backend → Railway or Render

1. New service from repo, root `backend`
2. Set all variables from `backend/.env.example`
3. Build: `npm run build` | Start: `npm start`
4. Add MongoDB Atlas connection string
5. Configure Razorpay webhook URL: `https://your-api.com/api/payments/webhook`

### MongoDB Atlas

- Create cluster, database user, network access (0.0.0.0/0 for cloud hosts or IP whitelist)
- Use connection string in `MONGODB_URI`

### Cloudinary

- Upload folder: `dehyde/products`
- Set `CLOUDINARY_*` in backend `.env`

## Admin

Default admin is seeded on first run if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `.env`.

Access: `https://your-domain.com/admin`

## Reward Coins

- 1 coin = ₹1
- Credited after successful payment
- Configurable max redemption % in admin settings
