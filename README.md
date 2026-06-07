# 🌊 LIMANOVA — Kurulum Kılavuzu

## 1. SQL Şemasını Çalıştır

Supabase Dashboard → SQL Editor:
https://supabase.com/dashboard/project/linlbzlgwgtiomzqapyg/sql/new

`lib/schema.sql` dosyasının tüm içeriğini yapıştır → Run.

---

## 2. GitHub'a Yükle

```bash
cd limanova
git init
git add .
git commit -m "Limanova v1"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/limanova.git
git push -u origin main
```

---

## 3. Vercel'e Deploy Et

1. https://vercel.com → "Add New Project"
2. GitHub reposunu seç
3. Environment Variables bölümüne şunları ekle:

```
NEXT_PUBLIC_SUPABASE_URL = https://linlbzlgwgtiomzqapyg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci... (anon key)
SUPABASE_SERVICE_ROLE_KEY = eyJhbGci... (service_role key)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51...
STRIPE_SECRET_KEY = sk_test_51...
STRIPE_WEBHOOK_SECRET = (aşağıda açıklanıyor)
NEXT_PUBLIC_SITE_URL = https://limanova.vercel.app
```

4. Deploy et → URL'ini al

---

## 4. Stripe Webhook Kur

1. https://dashboard.stripe.com/webhooks → "Add endpoint"
2. URL: `https://limanova.vercel.app/api/webhook`
3. Events: `checkout.session.completed` seç
4. Webhook signing secret'ı kopyala → Vercel'de `STRIPE_WEBHOOK_SECRET` olarak ekle

---

## 5. Vercel'de Redeploy

Environment variables ekledikten sonra:
Vercel Dashboard → Deployments → "Redeploy"

---

## Sonraki Adımlar

- [ ] Gerçek Stripe anahtarlarına geç (canlıya alınca)
- [ ] Admin paneli: başvuruları onayla/reddet
- [ ] E-posta bildirimleri (Resend.com)
- [ ] Vatandaş giriş sistemi
- [ ] Mağaza ödeme entegrasyonu
- [ ] Daha fazla dil ekle
