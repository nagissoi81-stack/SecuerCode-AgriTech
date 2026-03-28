import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // 🛡️ استيراد مباشر
function App() {
  const [lang, setLang] = useState('ar');
  const [area, setArea] = useState(0);
  const [temp, setTemp] = useState(30);
  const [crop, setCrop] = useState('alfalfa');
  const [customCrop, setCustomCrop] = useState('');
  const [results, setResults] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const content = {
    ar: {
      title: "SecuerCode | Agri-Tech",
      subTitle: "نظام إدارة المحاصيل الذكي والطقس الحي",
      calcTitle: "حاسبة التسميد المتطورة",
      selectCrop: "نوع المحصول:",
      tempLabel: "الحرارة الحالية:",
      stressLabel: "الإجهاد:",
      loading: "جاري جلب الطقس...",
      customPlaceholder: "اسم المحصول...",
      crops: {
        alfalfa: "علف البرسيم", maize: "الذرة", wheat: "القمح", vegetables: "خضروات", other: "أخرى"
      },
      placeholder: "المساحة (فدان)",
      btnCalc: "احسب البرنامج التسميدي",
      resTitle: "نتائج لـ",
      acre: "فدان",
      group1: "العناصر الكبرى (NPK)",
      group2: "العناصر الصغرى",
      group3: "المحسنات العضوية",
      n: "نيتروجين", p: "فوسفور", k: "بوتاسيوم",
      iron: "حديد", zinc: "زنك", mg: "مغنيسيوم", ca: "كالسيوم", humic: "حمض هيوميك",
      fulvic: "حمض فولفيك", seaweed: "طحالب", amino: "أحماض أمينية",
      unitK: "كجم", unitL: "لتر", unitG: "جم",
      stressHigh: "مرتفع ⚠️", stressNormal: "طبيعي ✅",
      footerDesc: "تطوير م/ ناجي الشيخ",
      waMsg: "SecuerCode Agri-Tech: استفسار بخصوص محصول "
    },
    en: {
      title: "SecuerCode | Agri-Tech",
      subTitle: "Smart Crop Management & Live Weather",
      calcTitle: "Advanced Fertilizer Calculator",
      selectCrop: "Crop Type:",
      tempLabel: "Live Temp:",
      stressLabel: "Stress:",
      loading: "Fetching...",
      customPlaceholder: "Crop Name...",
      crops: {
        alfalfa: "Alfalfa", maize: "Maize", wheat: "Wheat", vegetables: "Vegetables", other: "Other"
      },
      placeholder: "Area (Acre)",
      btnCalc: "Calculate Program",
      resTitle: "Results for",
      acre: "Acres",
      group1: "Macronutrients",
      group2: "Micronutrients",
      group3: "Organic Conditioners",
      n: "Nitrogen", p: "Phosphorus", k: "Potassium",
      iron: "Iron", zinc: "Zinc", mg: "Magnesium", ca: "Calcium", humic: "Humic Acid",
      fulvic: "Fulvic Acid", seaweed: "Seaweed", amino: "Amino Acids",
      unitK: "kg", unitL: "L", unitG: "g",
      stressHigh: "High ⚠️", stressNormal: "Normal ✅",
      footerDesc: "Dev by Eng. Nagi Alshaikh",
      waMsg: "SecuerCode Agri-Tech: Inquiry about "
    }
  };

  const t = content[lang];

  useEffect(() => {
    const fetchLocationWeather = async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const data = await response.json();
            setTemp(Math.round(data.current_weather.temperature));
            setLoadingWeather(false);
          } catch (error) {
            setLoadingWeather(false);
          }
        }, () => setLoadingWeather(false));
      } else {
        setLoadingWeather(false);
      }
    };
    fetchLocationWeather();
  }, []);

  const calculateFertilizer = () => {
    let factor = 1;
    if (crop === 'maize') factor = 1.5;
    if (crop === 'wheat') factor = 1.2;
    const heatAdjustment = temp > 35 ? 1.25 : 1.0;
    
    setResults({
      n: (area * 25 * factor).toFixed(1),
      p: (area * 15 * factor).toFixed(1),
      k: (area * 20 * factor * heatAdjustment).toFixed(1),
      iron: (area * 500).toFixed(0), 
      zinc: (area * 300).toFixed(0),
      mg: (area * 5).toFixed(1), 
      ca: (area * 10).toFixed(1),
      humic: (area * 2).toFixed(1), 
      fulvic: (area * 1).toFixed(1),
      seaweed: (area * 500 * heatAdjustment).toFixed(0),
      amino: (area * 1 * heatAdjustment).toFixed(1)
    });
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      const date = new Date().toLocaleDateString();

      doc.setFontSize(20);
      doc.text("SecuerCode Agri-Tech Report", 105, 15, { align: "center" });
      
      doc.setFontSize(12);
      doc.text(`Engineer: Nagi Alshaikh`, 20, 30);
      doc.text(`Date: ${date}`, 20, 37);
      doc.text(`Crop: ${crop === 'other' ? customCrop : t.crops[crop]}`, 20, 44);
      doc.text(`Area: ${area} Acres`, 20, 51);
      doc.text(`Temperature: ${temp}C`, 20, 58);

      const tableData = [
        ["Nutrient", "Amount", "Unit"],
        ["Nitrogen (N)", results.n, "kg"],
        ["Phosphorus (P)", results.p, "kg"],
        ["Potassium (K)", results.k, "kg"],
        ["Iron", results.iron, "g"],
        ["Zinc", results.zinc, "g"],
        ["Humic Acid", results.humic, "L"],
        ["Amino Acids", results.amino, "L"]
      ];

      // 🛡️ الطريقة الصحيحة والمستقرة للاستدعاء في React
      autoTable(doc, {
        startY: 65,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }
      });

      doc.save(`SecuerCode_Report_${crop}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("حدث خطأ أثناء إنشاء الملف، يرجى المحاولة مرة أخرى.");
    }
  };
  return (
    <div className={`min-h-screen bg-emerald-50 font-sans ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="fixed top-4 left-4 z-50 bg-white border-2 border-emerald-600 text-emerald-700 text-xs font-bold py-2 px-4 rounded-full shadow-md">
        {lang === 'ar' ? 'English' : 'العربية'}
      </button>

      <a href={`https://wa.me/97430555474?text=${encodeURIComponent(t.waMsg + (crop === 'other' ? customCrop : t.crops[crop]))}`} 
         target="_blank" rel="noreferrer" 
         className={`fixed bottom-6 ${lang === 'ar' ? 'left-6' : 'right-6'} bg-green-500 text-white p-4 rounded-full shadow-2xl z-50`}>
        💬
      </a>

      <header className="bg-emerald-900 text-white py-8 px-4 text-center shadow-lg border-b-4 border-emerald-500">
        <h1 className="text-3xl font-extrabold">{t.title} 🌿</h1>
        <p className="text-sm opacity-90 mt-1">{t.subTitle}</p>
        <p className="text-xs text-emerald-300 mt-2 font-bold">Eng: Nagi Alshaikh</p>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white p-6 rounded-3xl shadow-2xl border border-emerald-100">
          
          <div className="mb-6 p-4 bg-emerald-50 rounded-2xl flex items-center justify-between text-sm">
            {loadingWeather ? (
              <p className="animate-pulse">{t.loading}</p>
            ) : (
              <>
                <p className="font-bold">📍 {t.tempLabel} {temp}°C</p>
                <p className="font-bold">{t.stressLabel} <span className={temp > 35 ? 'text-red-600' : 'text-green-600'}>{temp > 35 ? t.stressHigh : t.stressNormal}</span></p>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-emerald-800">{t.selectCrop}</label>
              <select value={crop} onChange={(e) => setCrop(e.target.value)} className="p-3 border-2 border-emerald-100 rounded-xl bg-gray-50 outline-none">
                <option value="alfalfa">{t.crops.alfalfa}</option>
                <option value="maize">{t.crops.maize}</option>
                <option value="wheat">{t.crops.wheat}</option>
                <option value="vegetables">{t.crops.vegetables}</option>
                <option value="other">{t.crops.other}</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-emerald-800">{t.placeholder}</label>
              <input type="number" onChange={(e) => setArea(e.target.value)} placeholder="0" className="p-3 border-2 border-emerald-100 rounded-xl outline-none" />
            </div>
          </div>

          {crop === 'other' && (
            <input 
              type="text" 
              maxLength={15} 
              value={customCrop}
              onChange={(e) => setCustomCrop(e.target.value.replace(/[^\u0600-\u06FFa-zA-Z0-9 ]/g, ''))}
              placeholder={t.customPlaceholder} 
              className="w-full p-3 border-2 border-amber-100 rounded-xl mb-6 bg-amber-50 outline-none" 
            />
          )}

          <button onClick={calculateFertilizer} className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-black text-xl mb-6 shadow-md hover:bg-emerald-800 transition">
            {t.btnCalc}
          </button>

          {results && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-6">
                <div className="p-5 bg-green-50 rounded-2xl border-b-4 border-green-400">
                  <h4 className="font-bold text-green-800 mb-3 border-b border-green-200">🟢 {t.group1}</h4>
                  <p className="flex justify-between py-1"><span>{t.n}</span> <b>{results.n} {t.unitK}</b></p>
                  <p className="flex justify-between py-1"><span>{t.p}</span> <b>{results.p} {t.unitK}</b></p>
                  <p className="flex justify-between py-1"><span>{t.k}</span> <b>{results.k} {t.unitK}</b></p>
                </div>
                <div className="p-5 bg-blue-50 rounded-2xl border-b-4 border-blue-400">
                  <h4 className="font-bold text-blue-800 mb-3 border-b border-blue-200">🔵 {t.group2}</h4>
                  <p className="flex justify-between py-1"><span>{t.iron}</span> <b>{results.iron} {t.unitG}</b></p>
                  <p className="flex justify-between py-1"><span>{t.zinc}</span> <b>{results.zinc} {t.unitG}</b></p>
                  <p className="flex justify-between py-1"><span>{t.mg}</span> <b>{results.mg} {t.unitK}</b></p>
                </div>
                <div className="p-5 bg-amber-50 rounded-2xl border-b-4 border-amber-400">
                  <h4 className="font-bold text-amber-800 mb-3 border-b border-amber-200">🟠 {t.group3}</h4>
                  <p className="flex justify-between py-1"><span>{t.humic}</span> <b>{results.humic} {t.unitL}</b></p>
                  <p className="flex justify-between py-1"><span>{t.seaweed}</span> <b>{results.seaweed} {t.unitG}</b></p>
                  <p className="flex justify-between py-1"><span>{t.amino}</span> <b>{results.amino} {t.unitL}</b></p>
                </div>
              </div>
              
              {/* زر تحميل PDF في مكانه الصحيح */}
              <button 
                onClick={downloadPDF}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
              >
                📥 {lang === 'ar' ? 'تحميل تقرير التسميد (PDF)' : 'Download PDF Report'}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding - SecuerCode Social Links */}
      <footer className="mt-12 bg-emerald-950 text-white py-10 px-4 text-center border-t-4 border-emerald-500">
        <p className="text-sm font-bold mb-6">{t.footerDesc}</p>
        
        {/* Social Icons Section */}
        <div className="flex justify-center items-center gap-8 mb-8">
          <a 
            href="https://linkedin.com/in/nagi-alshaikh" 
            target="_blank" 
            rel="noreferrer" 
            className="group flex flex-col items-center gap-2 hover:text-emerald-400 transition-all"
          >
            <span className="text-3xl bg-white/10 p-3 rounded-full group-hover:bg-emerald-800 shadow-lg">🔗</span>
            <span className="text-[10px] font-bold tracking-widest uppercase">LinkedIn</span>
          </a>

          <a 
            href="https://github.com/nagissoi81-stack" 
            target="_blank" 
            rel="noreferrer" 
            className="group flex flex-col items-center gap-2 hover:text-emerald-400 transition-all"
          >
            <span className="text-3xl bg-white/10 p-3 rounded-full group-hover:bg-emerald-800 shadow-lg">💻</span>
            <span className="text-[10px] font-bold tracking-widest uppercase">GitHub</span>
          </a>

          <a 
            href="https://www.nagialshaikh-tech.com/" 
            target="_blank" 
            rel="noreferrer" 
            className="group flex flex-col items-center gap-2 hover:text-emerald-400 transition-all"
          >
            <span className="text-3xl bg-white/10 p-3 rounded-full group-hover:bg-emerald-800 shadow-lg">🌐</span>
            <span className="text-[10px] font-bold tracking-widest uppercase">Portfolio</span>
          </a>
        </div>

        <div className="border-t border-white/10 pt-6 max-w-xs mx-auto">
          <p className="text-[10px] text-emerald-500 font-black tracking-[0.2em] opacity-80">
            © {new Date().getFullYear()} SECUERCODE | AGRI-TECH DIVISION
          </p>
          <p className="text-[9px] text-gray-500 mt-1">Built with React & Cybersecurity Standards</p>
        </div>
      </footer>
    </div>
  );
}

export default App;