// Bilingual site content. Every string is either plain text or [english, arabic].

const site = {
  name: ['Exotic Tint for Trading and Contracting', 'إكزوتك تينت للتجارة والمقاولات'],
  brand: ['Exotic Tint Qatar', 'إكزوتك تينت قطر'],
  domain: 'https://exotictintqatar.com',
  phone: '+974 3119 0664',
  phoneRaw: '+97431190664',
  whatsapp: '97431190664',
  email: 'contact@exotictintqatar.com',
  instagram: 'https://www.instagram.com/exotic_tint_qatar/',
  facebook: 'https://www.facebook.com/people/Exotics-Window-Tintin/61559300550958/',
  tiktok: 'https://www.tiktok.com/@exotic_window_tinting_qa',
  address: ['Doha, Qatar', 'الدوحة، قطر'],
  hours: ['8:00 AM – 6:00 PM · 7 days a week', '٨:٠٠ صباحاً – ٦:٠٠ مساءً · ٧ أيام في الأسبوع'],
  tagline: ['Premium Tint & Protective Films', 'أفلام تظليل وحماية فاخرة'],
};

const ui = {
  nav: {
    home: ['Home', 'الرئيسية'],
    about: ['About', 'من نحن'],
    services: ['Services', 'خدماتنا'],
    contact: ['Contact', 'تواصل معنا'],
    allServices: ['All services', 'جميع الخدمات'],
  },
  quote: ['Get a free quote', 'احصل على عرض سعر مجاني'],
  bookNow: ['Book now', 'احجز الآن'],
  callUs: ['Call us', 'اتصل بنا'],
  whatsapp: ['WhatsApp us', 'راسلنا على واتساب'],
  explore: ['Explore services', 'استكشف خدماتنا'],
  learnMore: ['Learn more', 'اعرف المزيد'],
  viewService: ['View service', 'عرض الخدمة'],
  langSwitch: ['العربية', 'English'],
  menu: ['Menu', 'القائمة'],
  close: ['Close', 'إغلاق'],
  skip: ['Skip to content', 'انتقل إلى المحتوى'],
  rights: ['All rights reserved.', 'جميع الحقوق محفوظة.'],
  quickLinks: ['Quick links', 'روابط سريعة'],
  getInTouch: ['Get in touch', 'تواصل معنا'],
  followUs: ['Follow us', 'تابعنا'],
  hoursLabel: ['Business hours', 'ساعات العمل'],
  footerBlurb: [
    'Window films, smart glass, surface protection and interior finishes for homes and businesses across Qatar — installed on-site by specialists.',
    'أفلام نوافذ وزجاج ذكي وحماية أسطح وتشطيبات داخلية للمنازل والشركات في جميع أنحاء قطر — يركّبها مختصون في موقعك.',
  ],
};

const services = [
  {
    slug: 'architectural-window-film-solutions',
    img: 'residential',
    icon: 'building',
    title: ['Architectural Window Film Solutions', 'حلول أفلام النوافذ المعمارية'],
    short: ['Homes, offices & buildings', 'المنازل والمكاتب والمباني'],
    summary: [
      'Heat control, safety, reflective, privacy, blackout and skylight films for villas, offices and buildings — fitted on-site.',
      'أفلام عزل حراري وأمان وعاكسة وخصوصية وتعتيم وأفلام للمناور للفلل والمكاتب والمباني — تُركّب في موقعك.',
    ],
    options: [
      [['Solar Control Nano Ceramic Films', 'أفلام النانو سيراميك للتحكم الحراري'], ['Blocks most of the sun’s heat without making rooms dark.', 'تحجب معظم حرارة الشمس دون تعتيم الغرف.']],
      [['Safety & Security Films', 'أفلام الأمان والحماية'], ['Holds broken glass together and slows down break-ins.', 'تُمسك الزجاج المكسور وتُبطئ محاولات الاقتحام.']],
      [['Reflective Films', 'الأفلام العاكسة'], ['Mirror look outside, strong heat rejection inside.', 'مظهر مرآة من الخارج وعزل حراري قوي من الداخل.']],
      [['Privacy Films', 'أفلام الخصوصية'], ['See out clearly while people outside can’t see in.', 'ترى الخارج بوضوح بينما لا يرى من بالخارج الداخل.']],
      [['Blackout Films', 'أفلام التعتيم'], ['Stops all light — for bedrooms, cinemas and storage.', 'تحجب الضوء كلياً — لغرف النوم والسينما والتخزين.']],
      [['Skylight Solar Control Film', 'أفلام التحكم الحراري للمناور'], ['Takes the heat and glare out of overhead glass.', 'تُزيل الحرارة والوهج من الزجاج العلوي.']],
    ],
    faq: [
      [['Will the film make my rooms dark?', 'هل سيجعل الفيلم غرفي مظلمة؟'], ['No. Nano ceramic films block heat without heavy darkening. You choose the shade — from almost clear to full privacy.', 'لا. أفلام النانو سيراميك تحجب الحرارة دون تعتيم كبير. وأنت تختار الدرجة — من شبه شفاف إلى خصوصية كاملة.']],
      [['Can you do a whole building?', 'هل يمكنكم تنفيذ مبنى كامل؟'], ['Yes. We fit villas, offices, shops and full towers, and can work evenings, weekends or in phases.', 'نعم. نركّب للفلل والمكاتب والمحلات والأبراج الكاملة، ويمكننا العمل مساءً أو في العطلات أو على مراحل.']],
      [['How do I get a price?', 'كيف أحصل على السعر؟'], ['Send window sizes or photos on WhatsApp. We reply with a free, fixed-price quote.', 'أرسل مقاسات النوافذ أو صورها عبر واتساب. نرد بعرض سعر مجاني وثابت.']],
    ],
  },
  {
    slug: 'smart-glass-privacy-solutions',
    img: 'frosted',
    icon: 'bolt',
    title: ['Smart Glass & Privacy Solutions', 'حلول الزجاج الذكي والخصوصية'],
    short: ['Switchable privacy', 'خصوصية بلمسة زر'],
    summary: [
      'Smart switchable film turns clear glass frosted at the touch of a button — privacy when you want it, open views when you don’t.',
      'فيلم ذكي قابل للتحويل يجعل الزجاج الشفاف مصنفراً بلمسة زر — خصوصية عندما تريدها وإطلالة مفتوحة عندما لا تحتاجها.',
    ],
    options: [
      [['Smart Switchable Film', 'الفيلم الذكي القابل للتحويل'], ['Applied to your existing glass. Power on: clear. Power off: frosted.', 'يُركّب على زجاجك الحالي. عند التشغيل: شفاف. عند الإيقاف: مصنفر.']],
    ],
    faq: [
      [['Do I need to replace my glass?', 'هل أحتاج لتغيير الزجاج؟'], ['No. Smart film is applied to the glass you already have, so there’s no glazing work.', 'لا. الفيلم الذكي يُركّب على الزجاج الموجود لديك، فلا حاجة لأعمال تركيب زجاج.']],
      [['How is it controlled?', 'كيف يتم التحكم به؟'], ['With a wall switch, a remote, or a smart-home app. One room or many zones.', 'بمفتاح جداري أو ريموت أو تطبيق المنزل الذكي. غرفة واحدة أو عدة مناطق.']],
      [['Where is it used?', 'أين يُستخدم؟'], ['Meeting rooms, offices, clinics, bathrooms, bedrooms and shop windows.', 'غرف الاجتماعات والمكاتب والعيادات والحمامات وغرف النوم وواجهات المحلات.']],
    ],
  },
  {
    slug: 'surface-protection-solutions',
    img: 'marble',
    icon: 'shield',
    title: ['Surface Protection Solutions', 'حلول حماية الأسطح'],
    short: ['Marble, wood & steel', 'الرخام والخشب والستانلس'],
    summary: [
      'Invisible films for marble, wood, tabletops, countertops and stainless steel. Stops stains, etching and scratches — for far less than restoring.',
      'أفلام غير مرئية للرخام والخشب والطاولات وأسطح المطابخ والستانلس ستيل. تمنع البقع والتآكل والخدوش — بتكلفة أقل بكثير من الترميم.',
    ],
    options: [
      [['Marble Protection Film', 'فيلم حماية الرخام'], ['Lemon, coffee and keys stay on the film, not the stone.', 'الليمون والقهوة والمفاتيح تبقى على الفيلم لا على الحجر.']],
      [['Wooden Surface Protection', 'حماية الأسطح الخشبية'], ['Stops water rings, heat marks and scratches on wood.', 'يمنع حلقات الماء وآثار الحرارة والخدوش على الخشب.']],
      [['Tabletop & Countertop Protection', 'حماية الطاولات وأسطح المطابخ'], ['For dining tables, kitchen islands and reception desks.', 'لطاولات الطعام وجزر المطابخ ومكاتب الاستقبال.']],
      [['Stainless Steel Protection Film', 'فيلم حماية الستانلس ستيل'], ['No fingerprints, smudges or scratches on lifts and appliances.', 'لا بصمات ولا لطخات ولا خدوش على المصاعد والأجهزة.']],
    ],
    faq: [
      [['Can people see the film?', 'هل يظهر الفيلم؟'], ['Not really. We match gloss or matte to your surface, and trim the edges flush.', 'تقريباً لا. نطابق اللمعة أو المطفي مع السطح ونقص الحواف بدقة.']],
      [['Is it cheaper than restoration?', 'هل هو أرخص من الترميم؟'], ['Yes. Restoration can cost QAR 120–250/m² every few years. Film is around QAR 80–120/m², once.', 'نعم. قد يكلف الترميم ١٢٠–٢٥٠ ريال/م² كل بضع سنوات. الفيلم حوالي ٨٠–١٢٠ ريال/م² مرة واحدة.']],
      [['Can it be removed?', 'هل يمكن إزالته؟'], ['Yes. It peels off cleanly without damaging the surface underneath.', 'نعم. يُزال بسهولة دون أن يضر السطح تحته.']],
    ],
  },
  {
    slug: 'decorative-interior-solutions',
    img: 'commercial',
    icon: 'layers',
    title: ['Decorative & Interior Solutions', 'الحلول الديكورية والداخلية'],
    short: ['Design, branding & walls', 'تصاميم وهوية وجدران'],
    summary: [
      'Custom decorative films, office glass branding, frosted designs and wallpaper — cut and fitted to your space.',
      'أفلام ديكورية مخصصة وهوية بصرية على زجاج المكاتب وتصاميم مصنفرة وورق جدران — تُقص وتُركّب حسب مساحتك.',
    ],
    options: [
      [['Custom Decorative Window Films', 'أفلام النوافذ الديكورية المخصصة'], ['Patterns, gradients and textures that dress up plain glass.', 'نقوش وتدرجات وملمس يزيّن الزجاج العادي.']],
      [['Office Glass Branding', 'الهوية البصرية على زجاج المكاتب'], ['Your logo and colours on doors, partitions and shopfronts.', 'شعارك وألوانك على الأبواب والقواطع والواجهات.']],
      [['Wallpaper Installation', 'تركيب ورق الجدران'], ['Feature walls for majlis, bedrooms, offices and showrooms.', 'جدران مميزة للمجالس وغرف النوم والمكاتب والمعارض.']],
      [['Custom Frosted Glass Designs', 'تصاميم الزجاج المصنفر المخصصة'], ['Frosted bands, lines or full frost — privacy with style.', 'أشرطة مصنفرة أو خطوط أو تصنفير كامل — خصوصية بأناقة.']],
    ],
    faq: [
      [['Can you use my own design?', 'هل يمكنكم استخدام تصميمي؟'], ['Yes. Send your logo or idea — we prepare a proof and only cut once you approve it.', 'نعم. أرسل شعارك أو فكرتك — نجهز نموذجاً ولا نقص إلا بعد موافقتك.']],
      [['Is it permanent?', 'هل هو دائم؟'], ['It lasts for years, but comes off cleanly when you rebrand or move.', 'يدوم لسنوات، لكنه يُزال بسهولة عند تغيير الهوية أو الانتقال.']],
      [['Do you supply the wallpaper?', 'هل توفرون ورق الجدران؟'], ['We can supply and install, or install wallpaper you already have.', 'يمكننا التوريد والتركيب، أو تركيب ورق جدران لديك.']],
    ],
  },
  {
    slug: 'fabric-material-protection',
    img: 'nano',
    icon: 'drop',
    title: ['Fabric & Material Protection', 'حماية الأقمشة والمواد'],
    short: ['Sofas, majlis & carpets', 'الكنب والمجالس والسجاد'],
    summary: [
      'Invisible nano coating for sofas, majlis, carpets and curtains. Liquids bead up instead of soaking in.',
      'طلاء نانو غير مرئي للكنب والمجالس والسجاد والستائر. السوائل تتجمع قطرات بدل أن تتغلغل.',
    ],
    options: [
      [['Fabric Nano Coating', 'طلاء النانو للأقمشة'], ['Each fibre is coated, so dirt and spills stay on top.', 'كل ليف يُطلى فتبقى الأوساخ والانسكابات على السطح.']],
      [['Stain & Liquid Repellent Treatment', 'معالجة طاردة للبقع والسوائل'], ['Coffee, juice and oil roll off — blot and it’s gone.', 'القهوة والعصير والزيت تنزلق — امسحها فتختفي.']],
    ],
    faq: [
      [['Does it change how the fabric feels?', 'هل يغير ملمس القماش؟'], ['No. The coating is invisible and the fabric still breathes.', 'لا. الطلاء غير مرئي والقماش يبقى يتنفس.']],
      [['Is it safe for kids?', 'هل هو آمن للأطفال؟'], ['Yes. Once cured, it’s safe for everyday family use.', 'نعم. بعد الجفاف يصبح آمناً للاستخدام العائلي اليومي.']],
      [['How long does it last?', 'كم يدوم؟'], ['Protection lasts a long time with normal use; we’ll advise on care and re-application timing.', 'تدوم الحماية طويلاً مع الاستخدام العادي، وسننصحك بطريقة العناية وموعد إعادة التطبيق.']],
    ],
  },
];

// Old URLs -> new main service pages (kept so Google links and bookmarks still work)
const redirects = {
  'automotive-window-tinting': '',
  'residential-window-tinting-services': 'architectural-window-film-solutions',
  'commercial-window-tinting-services': 'architectural-window-film-solutions',
  'customized-cut-frosted-film': 'decorative-interior-solutions',
  'marble-protection-film': 'surface-protection-solutions',
  'fabric-nano-coating-service': 'fabric-material-protection',
};

const process = [
  [['Consultation', 'الاستشارة'], ['We understand your goals — heat, privacy, protection or design — and recommend the ideal film.', 'نفهم أهدافك — الحرارة أو الخصوصية أو الحماية أو التصميم — ونوصي بالفيلم المثالي.']],
  [['Site assessment', 'معاينة الموقع'], ['We measure your glass or surfaces and confirm a clear, flat-rate quote.', 'نقيس الزجاج أو الأسطح ونؤكد عرض سعر واضحاً وثابتاً.']],
  [['Preparation', 'التحضير'], ['Every surface is deep-cleaned for perfect, bubble-free adhesion.', 'يُنظف كل سطح بعمق لضمان التصاق مثالي خالٍ من الفقاعات.']],
  [['Precision install', 'تركيب دقيق'], ['Films are cut to fit and applied, sealed and smoothed by specialists.', 'تُقص الأفلام بالمقاس وتُركّب وتُثبت وتُنعّم على يد مختصين.']],
  [['Final inspection', 'الفحص النهائي'], ['We check clarity, edges and performance before handover.', 'نفحص الوضوح والحواف والأداء قبل التسليم.']],
];

const areas = [
  ['Doha', 'الدوحة'],
  ['Lusail', 'لوسيل'],
  ['The Pearl', 'اللؤلؤة'],
  ['West Bay', 'الخليج الغربي'],
  ['Al Rayyan', 'الريان'],
  ['Al Gharrafa', 'الغرافة'],
  ['Al Kheesa', 'الخيسة'],
  ['Al Wakra', 'الوكرة'],
];

const testimonials = [
  {
    name: 'Miranda Snyder',
    role: ['Office manager', 'مديرة مكتب'],
    service: ['Commercial & frosted', 'تجاري ومصنفر'],
    text: [
      'Exotic Tint Qatar provided excellent commercial window tinting in Doha. The frosted window film designs are perfect for our office, and the heat reduction is amazing!',
      'قدّمت إكزوتك تينت قطر خدمة ممتازة لتظليل مكتبنا في الدوحة. تصاميم الأفلام المصنفرة مثالية لمكتبنا، وتقليل الحرارة مذهل!',
    ],
  },
  {
    name: 'Debra Reyes',
    role: ['Homeowner', 'صاحبة منزل'],
    service: ['Nano coating & marble', 'نانو ورخام'],
    text: [
      'Their nano coating for sofa and marble protection services are incredible. My furniture and surfaces look brand new.',
      'خدمات طلاء النانو للكنب وحماية الرخام لديهم رائعة. أثاثي وأسطحي تبدو جديدة تماماً.',
    ],
  },
  {
    name: 'Omar S.',
    role: ['Office manager', 'مدير مكتب'],
    service: ['Commercial tint', 'تظليل تجاري'],
    text: [
      'Cooler offices and lower bills — great service from start to finish. The team was fast, clean and professional.',
      'مكاتب أبرد وفواتير أقل — خدمة رائعة من البداية للنهاية. الفريق سريع ونظيف ومحترف.',
    ],
  },
];

const homeFaq = [
  [['Which areas in Qatar do you cover?', 'ما المناطق التي تغطونها في قطر؟'], ['We install across Doha, Lusail, The Pearl, West Bay, Al Rayyan, Al Gharrafa, Al Kheesa, Al Wakra and surrounding areas — on-site at your home or office.', 'نقوم بالتركيب في الدوحة ولوسيل واللؤلؤة والخليج الغربي والريان والغرافة والخيسة والوكرة والمناطق المحيطة — في منزلك أو مكتبك.']],
  [['How does pricing work?', 'كيف يتم التسعير؟'], ['Affordable, flat-rate pricing with no hidden fees. Send us photos or sizes on WhatsApp and we’ll reply with a free estimate.', 'أسعار مناسبة وثابتة دون رسوم خفية. أرسل لنا الصور أو المقاسات عبر واتساب وسنرد بتقدير مجاني.']],
  [['How much heat and UV does window film block?', 'كم تحجب الأفلام من الحرارة والأشعة؟'], ['Our films block 99% of UV rays, and super nano ceramic films reject up to 98% of solar heat. Exact performance depends on the film you choose.', 'تحجب أفلامنا ٩٩٪ من الأشعة فوق البنفسجية، وتصد أفلام السوبر نانو سيراميك حتى ٩٨٪ من حرارة الشمس. يعتمد الأداء الدقيق على نوع الفيلم الذي تختاره.']],
  [['What’s the difference between nano ceramic and regular tint?', 'ما الفرق بين النانو سيراميك والتظليل العادي؟'], ['Regular dyed tint mainly darkens glass. Nano ceramic films use ceramic particles to reject infrared heat without heavy darkening, don’t interfere with phone or GPS signals, and won’t fade or turn purple.', 'التظليل العادي يُعتم الزجاج بشكل أساسي. أما أفلام النانو سيراميك فتستخدم جزيئات سيراميكية لصد الحرارة دون تعتيم كبير، ولا تؤثر على إشارة الجوال أو الـ GPS، ولا تبهت أو يتغير لونها.']],
  [['Do you accept cashless payment?', 'هل تقبلون الدفع الإلكتروني؟'], ['Yes — secure, seamless cashless payments with flexible options for every service.', 'نعم — دفع إلكتروني آمن وسلس مع خيارات مرنة لكل خدمة.']],
  [['How quickly can you book me in?', 'متى يمكنكم الحجز لي؟'], ['Booking takes less than 60 seconds on WhatsApp, and we work 7 days a week from 8 AM to 6 PM.', 'يستغرق الحجز أقل من ٦٠ ثانية عبر واتساب، ونعمل ٧ أيام في الأسبوع من ٨ صباحاً حتى ٦ مساءً.']],
];

module.exports = { site, ui, services, redirects, process, areas, testimonials, homeFaq };
