const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Statik dosyaları (index.html vb.) dışarıya aç
app.use(express.static(__dirname));

// ==========================================
// SUPABASE BAĞLANTI BİLGİLERİ
// ==========================================
const SUPABASE_URL = 'https://hwzwuswlmewnhkfcpzgs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_51OhoEZQ9j8lIdg4AXwMHg_wNxeEti9';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// UBL-TR 1.2 XML Üretici Motoru
function generateUBLTR12(fatura) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
    <ext:UBLExtensions>
        <ext:UBLExtension>
            <ext:ExtensionContent>
                <!-- Mali Mühür / Dijital İmza Alanı (GİB Entegratörü Tarafından İmzalanır) -->
            </ext:ExtensionContent>
        </ext:UBLExtension>
    </ext:UBLExtensions>
    <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
    <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
    <cbc:ProfileID>${fatura.senaryo}</cbc:ProfileID>
    <cbc:ID>${fatura.fatura_no}</cbc:ID>
    <cbc:CopyIndicator>false</cbc:CopyIndicator>
    <cbc:UUID>${fatura.ettn}</cbc:UUID>
    <cbc:IssueDate>${fatura.tarih}</cbc:IssueDate>
    <cbc:IssueTime>${fatura.saat}</cbc:IssueTime>
    <cbc:InvoiceTypeCode>${fatura.fatura_tipi}</cbc:InvoiceTypeCode>
    <cbc:Note>GİB UBL-TR 1.2 Wrapper API Tarafından Otomatik Üretilmiştir.</cbc:Note>
    <cbc:DocumentCurrencyCode>TRY</cbc:DocumentCurrencyCode>
    <cbc:LineCountNumeric>1</cbc:LineCountNumeric>

    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="VKN">1234567890</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyName>
                <cbc:Name>Demo E-Ticaret ve Yazılım A.Ş.</cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:CitySubdivisionName>Kadıköy</cbc:CitySubdivisionName>
                <cbc:CityName>İstanbul</cbc:CityName>
                <cac:Country><cbc:Name>Türkiye</cbc:Name></cac:Country>
            </cac:PostalAddress>
        </cac:Party>
    </cac:AccountingSupplierParty>

    <cac:AccountingCustomerParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="${fatura.alici_vkn.length === 11 ? 'TCKN' : 'VKN'}">${escapeXml(fatura.alici_vkn)}</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyName>
                <cbc:Name>${escapeXml(fatura.alici_unvan)}</cbc:Name>
            </cac:PartyName>
        </cac:Party>
    </cac:AccountingCustomerParty>

    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="TRY">${fatura.kdv_tutari.toFixed(2)}</cbc:TaxAmount>
        <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="TRY">${fatura.tutar.toFixed(2)}</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="TRY">${fatura.kdv_tutari.toFixed(2)}</cbc:TaxAmount>
            <cbc:Percent>${fatura.kdv_orani}</cbc:Percent>
            <cac:TaxCategory>
                <cac:TaxScheme>
                    <cbc:Name>KDV</cbc:Name>
                    <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
                </cac:TaxScheme>
            </cac:TaxCategory>
        </cac:TaxSubtotal>
    </cac:TaxTotal>

    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="TRY">${fatura.tutar.toFixed(2)}</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="TRY">${fatura.tutar.toFixed(2)}</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="TRY">${fatura.genel_toplam.toFixed(2)}</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="TRY">${fatura.genel_toplam.toFixed(2)}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>

    <cac:InvoiceLine>
        <cbc:ID>1</cbc:ID>
        <cbc:InvoicedQuantity unitCode="C62">1</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="TRY">${fatura.tutar.toFixed(2)}</cbc:LineExtensionAmount>
        <cac:Item>
            <cbc:Name>Yazılım ve Entegrasyon Hizmet Bedeli</cbc:Name>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="TRY">${fatura.tutar.toFixed(2)}</cbc:PriceAmount>
        </cac:Price>
    </cac:InvoiceLine>
</Invoice>`;
}

// Seçilen Özel Entegratöre Göre SOAP/WSDL Zarfı Üretici
function generateSoapEnvelope(entegrator, fatura, ublXml) {
  const cdataXml = `<![CDATA[${ublXml}]]>`;
  
  switch (entegrator) {
    case 'uyumsoft':
      return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:efat="http://tempuri.org/BasicInvoiceService">
  <soapenv:Header>
    <efat:Authentication>
      <efat:Username>DEMO_UYUMSOFT_USER</efat:Username>
      <efat:Password>Uyumsoft_Pass_999!</efat:Password>
    </efat:Authentication>
  </soapenv:Header>
  <soapenv:Body>
    <efat:SendInvoice>
      <efat:InvoiceInfo>
        <efat:InvoiceId>${fatura.fatura_no}</efat:InvoiceId>
        <efat:UUID>${fatura.ettn}</efat:UUID>
        <efat:DocumentContent>${cdataXml}</efat:DocumentContent>
      </efat:InvoiceInfo>
    </efat:SendInvoice>
  </soapenv:Body>
</soapenv:Envelope>`;

    case 'logo':
      return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:logo="http://www.logo.com.tr/eInvoice">
  <soapenv:Header/>
  <soapenv:Body>
    <logo:sendUBLInvoice>
      <logo:sessionID>DEMO-LOGO-SESSION-KEY-TOKEN</logo:sessionID>
      <logo:vkn>${fatura.alici_vkn}</logo:vkn>
      <logo:rawXML>${cdataXml}</logo:rawXML>
    </logo:sendUBLInvoice>
  </soapenv:Body>
</soapenv:Envelope>`;

    case 'izibiz':
    default:
      return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:efat="http://schemas.i-izibiz.com/eFatura">
  <soapenv:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>DEMO_IZIBIZ_CORP</wsse:Username>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <efat:sendInvoiceRequest>
      <efat:SENDER_VKN>1234567890</efat:SENDER_VKN>
      <efat:RECEIVER_VKN>${fatura.alici_vkn}</efat:RECEIVER_VKN>
      <efat:INVOICE_CONTENT>${cdataXml}</efat:INVOICE_CONTENT>
    </efat:sendInvoiceRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
  }
}

// GİB Resmi Fatura Görünümü (HTML Şablonu)
function generateInvoiceHtmlPreview(fatura) {
  return `
    <div style="font-family: Arial, sans-serif; border: 2px solid #b91c1c; padding: 25px; max-width: 800px; margin: auto; color: #111; background: #fff;">
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #b91c1c; padding-bottom: 15px;">
        <div>
          <h2 style="margin: 0; color: #b91c1c; font-size: 22px; font-weight: 800; letter-spacing: 1px;">e-FATURA</h2>
          <p style="margin: 4px 0; font-size: 11px; color: #555;">GELİR İDARESİ BAŞKANLIĞI ELEKTRONİK FATURA STANDARDI</p>
          <p style="margin: 4px 0; font-size: 12px;"><b>Fatura No:</b> ${fatura.fatura_no}</p>
          <p style="margin: 2px 0; font-size: 11px; font-family: monospace;"><b>ETTN:</b> ${fatura.ettn}</p>
        </div>
        <div style="text-align: right; font-size: 12px; line-height: 1.5;">
          <p style="margin: 0;"><b>Düzenleme Tarihi:</b> ${fatura.tarih}</p>
          <p style="margin: 0;"><b>Düzenleme Zamanı:</b> ${fatura.saat}</p>
          <p style="margin: 0;"><b>Senaryo:</b> ${fatura.senaryo}</p>
          <p style="margin: 0;"><b>Fatura Tipi:</b> ${fatura.fatura_tipi}</p>
          <p style="margin: 0;"><b>Para Birimi:</b> TRY</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin: 20px 0; font-size: 12px; gap: 20px;">
        <div style="flex: 1; border: 1px solid #ddd; padding: 12px; border-radius: 6px;">
          <h4 style="margin: 0 0 6px 0; color: #b91c1c; border-bottom: 1px solid #eee; padding-bottom: 4px;">SATICI BİLGİLERİ</h4>
          <p style="margin: 2px 0;"><b>Demo E-Ticaret ve Yazılım A.Ş.</b></p>
          <p style="margin: 2px 0;"><b>VKN:</b> 1234567890</p>
          <p style="margin: 2px 0;">Kadıköy Vergi Dairesi</p>
          <p style="margin: 2px 0; color: #555;">Kadıköy / İstanbul / Türkiye</p>
        </div>
        <div style="flex: 1; border: 1px solid #ddd; padding: 12px; border-radius: 6px;">
          <h4 style="margin: 0 0 6px 0; color: #b91c1c; border-bottom: 1px solid #eee; padding-bottom: 4px;">ALICI BİLGİLERİ</h4>
          <p style="margin: 2px 0;"><b>${escapeXml(fatura.alici_unvan)}</b></p>
          <p style="margin: 2px 0;"><b>${fatura.alici_vkn.length === 11 ? 'TCKN' : 'VKN'}:</b> ${escapeXml(fatura.alici_vkn)}</p>
          <p style="margin: 2px 0;">Vergi Dairesi: Kadıköy</p>
          <p style="margin: 2px 0; color: #555;">İstanbul / Türkiye</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">
        <thead>
          <tr style="background: #f8fafc; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc;">
            <th style="padding: 8px; text-align: left;">Sıra</th>
            <th style="padding: 8px; text-align: left;">Mal / Hizmet Açıklaması</th>
            <th style="padding: 8px; text-align: right;">Miktar</th>
            <th style="padding: 8px; text-align: right;">Birim Fiyat</th>
            <th style="padding: 8px; text-align: right;">KDV (%)</th>
            <th style="padding: 8px; text-align: right;">KDV Tutarı</th>
            <th style="padding: 8px; text-align: right;">Mal/Hizmet Tutarı</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px;">1</td>
            <td style="padding: 8px;">Yazılım ve Entegrasyon Hizmet Bedeli</td>
            <td style="padding: 8px; text-align: right;">1 Adet</td>
            <td style="padding: 8px; text-align: right;">${fatura.tutar.toFixed(2)} ₺</td>
            <td style="padding: 8px; text-align: right;">%${fatura.kdv_orani}</td>
            <td style="padding: 8px; text-align: right;">${fatura.kdv_tutari.toFixed(2)} ₺</td>
            <td style="padding: 8px; text-align: right;">${fatura.tutar.toFixed(2)} ₺</td>
          </tr>
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; font-size: 12px;">
        <table style="width: 280px; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #444;">Mal/Hizmet Toplam Tutarı:</td>
            <td style="text-align: right; font-family: monospace;">${fatura.tutar.toFixed(2)} ₺</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #444;">Hesaplanan KDV:</td>
            <td style="text-align: right; font-family: monospace;">${fatura.kdv_tutari.toFixed(2)} ₺</td>
          </tr>
          <tr style="border-top: 2px solid #b91c1c;">
            <td style="padding: 8px 0; color: #b91c1c; font-weight: bold; font-size: 14px;">Ödenecek Tutar:</td>
            <td style="text-align: right; color: #b91c1c; font-weight: bold; font-size: 15px; font-family: monospace;">${fatura.genel_toplam.toFixed(2)} ₺</td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 30px; border-top: 1px dashed #bbb; padding-top: 10px; font-size: 10px; color: #666; text-align: center;">
        Bu belge 213 Sayılı V.U.K. hükümlerine göre GİB UBL-TR 1.2 standartlarında elektronik ortamda üretilmiştir.
      </div>
    </div>
  `;
}

// 🌐 1. ANA SAYFA ROTASI (CANLI PLAYGROUND VE KONSOLU DOĞRUDAN SUN)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 🩺 2. SAĞLIK KONTROLÜ
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'GİB UBL-TR 1.2 E-Fatura Wrapper API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 🚀 3. FATURA OLUŞTURMA REST ENDPOINT
app.post('/v1/invoices/create', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'error', message: 'Yetkisiz erişim: API Key eksik.' });
    }
    const apiKey = authHeader.split(' ')[1].trim();

    // 1. Kullanıcıyı ve Bakiyeyi Kontrol Et
    const { data: user, error: userErr } = await supabase
      .from('api_kullanicilari')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (userErr || !user) {
      return res.status(401).json({ status: 'error', message: 'Geçersiz API Anahtarı.' });
    }

    if (user.bakiye_kontor <= 0) {
      return res.status(402).json({ status: 'error', message: 'Yetersiz bakiye! Lütfen kontör yükleyin.' });
    }

    // 2. Fatura ve Entegratör Parametrelerini Al
    const { 
      alici_vkn, 
      alici_unvan, 
      tutar, 
      kdv_orani = 20, 
      senaryo = 'TICARIFATURA', 
      fatura_tipi = 'SATIS',
      entegrator = 'izibiz'
    } = req.body;

    const tutarNum = parseFloat(tutar);
    const kdvOraniNum = parseInt(kdv_orani);
    const kdvTutari = (tutarNum * kdvOraniNum) / 100;
    const genelToplam = tutarNum + kdvTutari;

    const ettn = crypto.randomUUID();
    const faturaNo = 'GIB' + new Date().getFullYear() + Math.floor(100000000 + Math.random() * 900000000);
    const tarih = new Date().toISOString().split('T')[0];
    const saat = new Date().toTimeString().split(' ')[0];

    const faturaPaketi = {
      senaryo,
      fatura_tipi,
      fatura_no: faturaNo,
      ettn,
      tarih,
      saat,
      alici_vkn,
      alici_unvan,
      tutar: tutarNum,
      kdv_orani: kdvOraniNum,
      kdv_tutari: kdvTutari,
      genel_toplam: genelToplam
    };

    // 3. XML, SOAP Zarfı ve HTML Görünümünü Derle
    const ublXml = generateUBLTR12(faturaPaketi);
    const soapEnvelope = generateSoapEnvelope(entegrator, faturaPaketi, ublXml);
    const htmlPreview = generateInvoiceHtmlPreview(faturaPaketi);

    // 4. Supabase'e Kaydet
    await supabase.from('faturalar').insert([{
      ettn_uuid: ettn,
      fatura_no: faturaNo,
      alici_vkn: alici_vkn,
      alici_unvan: alici_unvan,
      toplam_tutar: genelToplam,
      kdv_tutari: kdvTutari,
      fatura_tipi: fatura_tipi,
      ubl_xml: ublXml,
      durum: 'GIB_ONAY_BEKLIYOR'
    }]);

    // 5. Kontörü Düşür
    const yeniKontor = user.bakiye_kontor - 1;
    await supabase
      .from('api_kullanicilari')
      .update({ bakiye_kontor: yeniKontor })
      .eq('id', user.id);

    console.log(`✅ [FATURA ÜRETİLDİ] ETTN: ${ettn} | Entegratör: ${entegrator.toUpperCase()}`);
    console.log(`💳 [KONTÖR DÜŞÜLDÜ] Kalan Kontör: ${yeniKontor}`);

    // 6. Yanıtı Döndür
    return res.status(200).json({
      status: 'success',
      ettn: ettn,
      fatura_no: faturaNo,
      alici: alici_unvan,
      toplam_tutar: genelToplam.toFixed(2),
      kalan_kontor: yeniKontor,
      entegrator: entegrator.toUpperCase(),
      ubl_xml: ublXml,
      soap_envelope: soapEnvelope,
      html_preview: htmlPreview
    });

  } catch (err) {
    console.error('İşlem Hatası:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 GİB E-Fatura API http://localhost:${PORT} üzerinde hazır!`);
});
