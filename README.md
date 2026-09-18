# 🏛️ GİB UBL-TR 1.2 E-Fatura Wrapper REST API & Developer Suite

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Render](https://img.shields.io/badge/Render-Live%20Deploy-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://gib-efatura-wrapper.onrender.com)
[![GİB Standard](https://img.shields.io/badge/GİB_Standard-UBL--TR_1.2-dc2626?style=for-the-badge)](https://ebelge.gib.gov.tr/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

Türkiye'deki e-ticaret platformları, SaaS girişimleri ve bağımsız yazılımcılar için Gelir İdaresi Başkanlığı (GİB) E-Fatura standartlarını modern bir REST API mimarisiyle soyutlayan yüksek performanslı ara katman (Wrapper) servisidir.

Karmaşık XML şemaları ve entegratörlerin eski SOAP/WSDL protokolleri yerine; tek bir modern JSON isteğiyle **UBL-TR 1.2 XML**, **İzibiz/Uyumsoft/Logo SOAP Zarfı** ve **GİB Onaylı A4 Görsel PDF Önizlemesi** üretir.

---

## 🌐 Canlı Demo & Geliştirici Konsolu

Sunucu Render bulutunda 7/24 canlı ve kullanıma hazırdır:  
👉 **Canlı API ve Test Konsolu:** [https://gib-efatura-wrapper.onrender.com](https://gib-efatura-wrapper.onrender.com)

---

## 📄 GİB Standartlarında Resmi Belge Çıktısı

Sistem, iletilen JSON verisini yalnızca doğrulanmış XML formatına dönüştürmekle kalmaz; 213 Sayılı Vergi Usul Kanunu (V.U.K.) standartlarına uygun, yazdırılabilir ve tek tıkla PDF olarak kaydedilebilir resmi e-fatura şablonunu anında render eder:

```
+---------------------------------------------------------------------------------------+
|  e-FATURA                                      Duzenleme Tarihi : 2026-09-18          |
|  GELIR IDARESI BASKANLIGI ELEKTRONIK STANDARDI Duzenleme Zamani : 17:16:59            |
|  Fatura No : GIB2026918719853                  Senaryo          : TICARIFATURA        |
|  ETTN      : 2203e24d-35db-4a9d-a002-a86128d3c953 Fatura Tipi  : SATIS               |
+---------------------------------------------------------------------------------------+
| SATICI BILGILERI                               | ALICI BILGILERI                      |
| Demo E-Ticaret ve Yazilim A.S.                 | Ornek Teknoloji Ltd. Sti.            |
| VKN: 1234567890 | Kadikoy V.D. | Istanbul      | VKN: 1234567890 | Kadikoy V.D.       |
+---------------------------------------------------------------------------------------+
| Sira | Mal / Hizmet Aciklamasi        | Miktar | Birim Fiyat | KDV (%) | Toplam Tutar |
|  1   | Yazilim ve Entegrasyon Bedeli  | 1 Adet | 2.000,00 TL |  %20    |  2.400,00 TL |
+---------------------------------------------------------------------------------------+
| Mal/Hizmet Toplam Tutari : 2.000,00 TL                                                |
| Hesaplanan KDV (%20)     :   400,00 TL                                                |
| ODENECEK TUTAR           : 2.400,00 TL                                                |
+---------------------------------------------------------------------------------------+
| Bu belge 213 Sayili V.U.K. hukumlerine gore elektronik ortamda uretilmistir.          |
+---------------------------------------------------------------------------------------+
```

<img width="767" height="650" alt="fatura_ornegi" src="https://github.com/user-attachments/assets/bacf2a6b-8d6f-47c1-baf5-14bf09908d63" />

---

## 🎯 Çözülen Problem ve Mimari Vizyon

Türkiye'de e-fatura entegrasyonu yapmak isteyen geliştiriciler genellikle şu 3 büyük engelle karşılaşır:

1. **UBL-TR 1.2 Standart Karmaşası:** 150'den fazla zorunlu XML etiketi, namespace tanımları (`cac:`, `cbc:`, `ext:`) ve tek bir karakter (`&`, `<`, `>`) hatasında belgenin GİB tarafından reddedilmesi.
2. **Eski SOAP/WSDL Protokolleri:** Türkiye'deki özel entegratörlerin (İzibiz, Uyumsoft, Logo vb.) modern REST yerine CDATA içine gömülmüş hantal XML SOAP zarfları talep etmesi.
3. **Mali Mühür ve ETTN Yönetimi:** RFC 4122 v4 UUID (ETTN) standartlarının ve 16 haneli resmi fatura numaralarının yönetim zorluğu.

Bu proje, geliştiricinin sadece `alici_vkn`, `alici_unvan` ve `tutar` göndereceği yalın bir REST API sunarak tüm yasal dönüşümleri arka planda milisaniyeler içinde tamamlar.

---

## 📐 Sistem Mimarisi

```
[ Geliştirici / E-Ticaret / SaaS ]
               │
               ▼ (JSON Payload & Bearer API Key)
┌─────────────────────────────────────────────────────────────┐
│             GİB UBL-TR 1.2 Wrapper REST API                 │
├─────────────────────────────────────────────────────────────┤
│ 1. Kimlik & Bakiye Denetimi (Supabase PostgreSQL)          │
│ 2. VKN / TCKN Sözdizim Doğrulama                           │
│ 3. RFC 4122 v4 ETTN & GİB Fatura No Üretici                │
│ 4. UBL-TR 1.2 XML Derleme Motoru (TICARIFATURA / SATIS)    │
│ 5. Entegratör SOAP Zarfı Paketleme (İzibiz, Uyumsoft, Logo)│
│ 6. GİB Resmi HTML/PDF Görsel Motoru                        │
└─────────────────────────────────────────────────────────────┘
               │
       ┌───────┴───────────────────────┐
       ▼                               ▼
[ Supabase Arşiv ]           [ İstemci JSON Yanıtı (200 OK) ]
• UBL-TR XML Arşivi          • ETTN UUID & Fatura No
• Kontör Bakiyesi Güncelleme • UBL-TR 1.2 XML Belgesi
• Webhook Log Kaydı          • Entegratör SOAP Zarfı
                             • Resmi HTML/PDF Önizleme
```

<img width="767" height="650" alt="fatura_ornegi" src="https://github.com/user-attachments/assets/54a94ad4-1116-4f8e-9770-9da7a057a49a" />

---

## ✨ Öne Çıkan Özellikler

* 📄 **%100 GİB UBL-TR 1.2 Uyumu:** TICARIFATURA senaryosu, SATIS tipi ve `0015` KDV vergi koduyla tam uyumlu, W3C standartlarında doğrulanmış XML üretimi.
* 📦 **Çoklu Entegratör SOAP/WSDL Motoru:** 
  * **İzibiz:** `wsse:Security` ve `sendInvoiceRequest` zarf simülasyonu.
  * **Uyumsoft:** `BasicInvoiceService` ve `SendInvoice` CDATA formatı.
  * **e-Logo:** `sendUBLInvoice` ve session doğrulamalı SOAP paketi.
* 🖨️ **GİB Standart A4 PDF Önizleme:** Resmi kırmızı çerçeveli, satıcı/alıcı VKN dökümlü, tek tıkla yazdırılabilir ve PDF olarak kaydedilebilir dahili fatura motoru.
* 🛡️ **Kurumsal API Güvenliği & Kontör Yönetimi:** Bearer token yetkilendirmesi ve her başarılı faturada otomatik bakiye düşen PostgreSQL entegrasyonu.
* ⚡ **Canlı Developer Console:** Form üzerinden parametreleri değiştirip anında giden JSON, dönen XML ve canlı Webhook trafiğini izleme imkanı.

---

## 📡 Canlı API Kullanımı (cURL Örnekleri)

Canlı Render sunucusu üzerinden hemen fatura kesmek için aşağıdaki komutu kullanabilirsiniz:

#### Linux / macOS / Git Bash
```bash
curl -X POST https://gib-efatura-wrapper.onrender.com/v1/invoices/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer gib_live_demo_key_999" \
  -d '{
    "alici_vkn": "1234567890",
    "alici_unvan": "Ornek Teknoloji Ltd. Sti.",
    "entegrator": "izibiz",
    "senaryo": "TICARIFATURA",
    "fatura_tipi": "SATIS",
    "tutar": 2000,
    "kdv_orani": 20
  }'
```

#### Windows PowerShell
```powershell
curl.exe -X POST https://gib-efatura-wrapper.onrender.com/v1/invoices/create `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer gib_live_demo_key_999" `
  -d '{\"alici_vkn\":\"1234567890\",\"alici_unvan\":\"Ornek Teknoloji Ltd. Sti.\",\"entegrator\":\"izibiz\",\"tutar\":2000,\"kdv_orani\":20}'
```

#### Başarılı Yanıt Şeması (`200 OK`)
```json
{
  "status": "success",
  "ettn": "2203e24d-35db-4a9d-a002-a86128d3c953",
  "fatura_no": "GIB2026918719853",
  "alici": "Ornek Teknoloji Ltd. Sti.",
  "toplam_tutar": "2400.00",
  "kalan_kontor": 245,
  "entegrator": "IZIBIZ",
  "ubl_xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>...",
  "soap_envelope": "<?xml version=\"1.0\" encoding=\"utf-8\"?>...",
  "html_preview": "<div style=\"font-family: Arial...\">...</div>"
}
```

---

## 💻 Farklı Programlama Dilleriyle Entegrasyon

API'yi projelerinize eklemek için hazır kod blokları:

### Node.js (Axios / Fetch)
```javascript
const axios = require('axios');

async function createInvoice() {
  const response = await axios.post('https://gib-efatura-wrapper.onrender.com/v1/invoices/create', {
    alici_vkn: "1234567890",
    alici_unvan: "Ornek Teknoloji Ltd. Sti.",
    entegrator: "izibiz",
    tutar: 2000,
    kdv_orani: 20
  }, {
    headers: {
      'Authorization': 'Bearer gib_live_demo_key_999',
      'Content-Type': 'application/json'
    }
  });

  console.log('Fatura Kesildi! ETTN:', response.data.ettn);
  console.log('Kalan Kontör:', response.data.kalan_kontor);
}

createInvoice();
```

### Python (Requests)
```python
import requests

url = "https://gib-efatura-wrapper.onrender.com/v1/invoices/create"
headers = {
    "Authorization": "Bearer gib_live_demo_key_999",
    "Content-Type": "application/json"
}
payload = {
    "alici_vkn": "1234567890",
    "alici_unvan": "Ornek Teknoloji Ltd. Sti.",
    "entegrator": "izibiz",
    "tutar": 2000,
    "kdv_orani": 20
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

print(f"Fatura No: {data.get('fatura_no')}")
print(f"ETTN: {data.get('ettn')}")
```

### PHP (cURL)
```php
<?php
$curl = curl_init();

$payload = json_encode([
  "alici_vkn" => "1234567890",
  "alici_unvan" => "Ornek Teknoloji Ltd. Sti.",
  "entegrator" => "izibiz",
  "tutar" => 2000,
  "kdv_orani" => 20
]);

curl_setopt_array($curl, [
  CURLOPT_URL => "https://gib-efatura-wrapper.onrender.com/v1/invoices/create",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => $payload,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer gib_live_demo_key_999",
    "Content-Type: application/json"
  ],
]);

$response = curl_exec($curl);
curl_close($curl);

echo $response;
```

---

## 🚦 Hata Kodları ve Doğrulama Standartları

Sistem, yasa dışı veya hatalı isteklerde anında açıklayıcı hata mesajları döner:

| HTTP Kodu | Durum | Olası Neden |
| :--- | :--- | :--- |
| `200 OK` | **Başarılı** | Fatura başarıyla derlendi, zarflandı ve Supabase'e kaydedildi. |
| `400 Bad Request` | **Doğrulama Hatası** | VKN (10 hane) veya TCKN (11 hane) hatalı ya da tutar numerik değil. |
| `401 Unauthorized` | **Yetkisiz Erişim** | `Authorization: Bearer <KEY>` başlığı eksik veya geçersiz API anahtarı. |
| `402 Payment Required` | **Yetersiz Bakiye** | API kullanıcısının kontör bakiyesi (`bakiye_kontor`) tükenmiş. |
| `500 Server Error` | **Motor Hatası** | XML derleme veya veritabanı yazma sırasında beklenmeyen durum. |

#### Örnek 400 Bad Request Yanıtı:
```json
{
  "status": "error",
  "code": 400,
  "message": "Gecersiz alici VKN veya TCKN formati! VKN 10 haneli, TCKN 11 haneli numerik olmalidir."
}
```

---

## 🧪 Test Kimlik Bilgileri

Sistemi canlı veya yerel ortamda test etmek için tanımlanmış anahtarlar:

| Parametre | Değer | Açıklama |
| :--- | :--- | :--- |
| **Canlı API Endpoint** | `https://gib-efatura-wrapper.onrender.com/v1/invoices/create` | Bulutta çalışan genel uç nokta |
| **Demo API Key** | `Bearer gib_live_demo_key_999` | 250 test kontörü tanımlı kurumsal anahtar |
| **Test VKN** | `1234567890` | Kurumsal tüzel mükellef vergi kimlik numarası |
| **Test TCKN** | `12345678901` | 11 haneli bireysel kimlik numarası |

---

## 🚀 Yerel Geliştirme ve Kurulum (Self-Hosting)

Projeyi kendi bilgisayarınızda veya kendi sunucunuzda çalıştırmak için:

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/Metehanncakr-00/gib-efatura-wrapper.git
cd gib-efatura-wrapper
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Çevre Değişkenlerini Tanımlayın (`.env`)
Proje ana dizininde bir `.env` dosyası oluşturun:
```env
PORT=3000
SUPABASE_URL=https://your-supabase-id.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
DEMO_API_KEY=gib_live_demo_key_999
```

### 4. Sunucuyu Başlatın
```bash
# Geliştirme modu
npm run dev

# veya doğrudan çalıştırma
node server.js
```
Sunucu başladığında tarayıcınızdan `http://localhost:3000` adresine girerek Developer Sandbox konsoluna erişebilirsiniz.

---

## 🗄️ Supabase Veritabanı Şeması (SQL DDL)

Kendi Supabase projenizde bu mimariyi çalıştırmak için **SQL Editor** sekmesine aşağıdaki sorguyu yapıştırmanız yeterlidir:

```sql
-- 1. API Kullanıcıları Tablosu
CREATE TABLE IF NOT EXISTS api_kullanicilari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sirket_adi TEXT NOT NULL,
    api_key TEXT UNIQUE NOT NULL,
    bakiye_kontor INT DEFAULT 250,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Üretilen Faturalar Tablosu
CREATE TABLE IF NOT EXISTS faturalar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ettn_uuid TEXT NOT NULL,
    fatura_no TEXT NOT NULL,
    alici_vkn TEXT NOT NULL,
    alici_unvan TEXT NOT NULL,
    toplam_tutar NUMERIC NOT NULL,
    kdv_tutari NUMERIC NOT NULL,
    fatura_tipi TEXT NOT NULL,
    entegrator TEXT NOT NULL,
    ubl_xml TEXT NOT NULL,
    soap_envelope TEXT,
    durum TEXT DEFAULT 'KUYRUGA_ALINDI',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Webhook Olayları Tablosu
CREATE TABLE IF NOT EXISTS webhook_olaylari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fatura_id UUID REFERENCES faturalar(id),
    olay_tipi TEXT NOT NULL,
    http_status INT DEFAULT 200,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demo Kullanıcı Ekleme
INSERT INTO api_kullanicilari (sirket_adi, api_key, bakiye_kontor)
VALUES ('Demo Holding A.S.', 'gib_live_demo_key_999', 250)
ON CONFLICT (api_key) DO NOTHING;
```

---

## 🛠️ Teknoloji Yığını

* **Sunucu & Çalışma Zamanı:** Node.js, Express.js
* **Dağıtım (Deployment):** Render (Web Service)
* **Veritabanı & Güvenlik:** Supabase (PostgreSQL 15), Row Level Security (RLS)
* **XML Standartları:** OASIS UBL 2.1 / GİB UBL-TR 1.2
* **Protokoller:** REST JSON & SOAP 1.1 / 1.2 WSDL Simülasyonu
* **Arayüz & Tasarım:** Tailwind CSS v3, FontAwesome 6, JetBrains Mono

---

## 🗺️ Gelecek Yol Haritası (Roadmap)

- [x] v1.0: UBL-TR 1.2 XML Derleme Motoru
- [x] v1.0: İzibiz, Uyumsoft ve Logo SOAP Zarfı (Envelope) Simülasyonu
- [x] v1.0: Render üzerinde 7/24 canlı REST API servisi
- [x] v1.0: Supabase PostgreSQL entegrasyonu ve bakiye/kontör düşme mekanizması
- [x] v1.0: GİB Onaylı A4 HTML/PDF görsel fatura önizleyicisi
- [ ] v1.1: KDV Tevkifatı (`601`, `602` kodları) ve İstisna (`301`, `351`) senaryoları
- [ ] v1.2: Doğrudan `npm install tr-efatura` kütüphanesi olarak yayımlama
- [ ] v1.3: Doğrudan `pip install tr-efatura` Python paketi olarak yayımlama
- [ ] v1.4: Gerçek İzibiz/Uyumsoft canlı prod ortamı bağlantı desteği

---

## 🤝 Katkıda Bulunma (Contributing)

Açık kaynak ekosistemine katkı sağlamak isterseniz:
1. Depoyu Fork'layın (`Fork`)
2. Yeni bir özellik dalı açın (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Yeni entegrator destegi eklendi'`)
4. Dalınıza push yapın (`git push origin feature/yeni-ozellik`)
5. Bir **Pull Request (PR)** oluşturun.

---

## 👨‍💻 Geliştirici

**Metehan Çakır**  
* GitHub: [@Metehanncakr-00](https://github.com/Metehanncakr-00)  
* Proje Bağlantısı: [https://github.com/Metehanncakr-00/gib-efatura-wrapper](https://github.com/Metehanncakr-00/gib-efatura-wrapper)

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında açık kaynak olarak sunulmuştur.
