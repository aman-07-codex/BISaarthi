'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'EN' | 'HI';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  EN: {
    // Nav & Layout
    'nav.dashboard': 'Dashboard',
    'nav.ask': 'Ask BISaarthi',
    'nav.find': 'Find Standards',
    'nav.compare': 'Compare Standards',
    'nav.saved': 'Saved Standards',
    'nav.history': 'Chat History',
    'nav.settings': 'Settings',
    'nav.primary': 'Core Modules',
    'nav.workspace': 'Workspace',
    'nav.authoritative': 'Authoritative Sources',
    'nav.quickAskPlaceholder': 'Ask BISaarthi about any Indian Standard or product...',
    'nav.quickAskBtn': 'Ask',
    'nav.toggleLang': 'Toggle language (English / Hindi)',
    'nav.light': 'Light',
    'nav.dark': 'Dark',
    'nav.logout': 'Sign Out',
    'nav.userRole': 'Regulatory Officer',

    // Breadcrumbs
    'cat.overview': 'Overview',
    'cat.guidance': 'Guidance',
    'cat.discovery': 'Discovery',
    'cat.comparison': 'Comparison',
    'cat.standards': 'Standards',
    'cat.workspace': 'Workspace',
    'cat.account': 'Account',
    'cat.platform': 'Platform',

    // Common Buttons & Actions
    'btn.explore': 'Explore',
    'btn.launch': 'Launch',
    'btn.viewDetails': 'View Standard Details',
    'btn.compare': 'Compare Standard',
    'btn.save': 'Save Standard',
    'btn.saved': 'Saved',
    'btn.remove': 'Remove',
    'btn.clear': 'Clear',
    'btn.reset': 'Reset',
    'btn.back': 'Back',
    'btn.backToStandards': 'Back to Standards',
    'btn.search': 'Search',
    'btn.send': 'Send',
    'btn.copy': 'Copy',
    'btn.export': 'Export',
    'btn.newChat': 'New Consultation',
    'btn.analyze': 'Analyze & Find Standards',
    'btn.analyzing': 'Analyzing Product...',
    'btn.saveChanges': 'Save Changes',
    'btn.resetDefaults': 'Reset to Defaults',

    // Dashboard
    'dash.welcome': 'Welcome back, Aman Mishra',
    'dash.subtitle': 'Your AI-powered regulatory assistant for Indian Standards, Quality Control Orders (QCOs), and BIS conformity assessment.',
    'dash.quickPromptTitle': 'Quick Compliance Query',
    'dash.quickPromptPlaceholder': 'E.g. What BIS standard applies to electric immersion water heaters in India?',
    'dash.recentQueries': 'Recent Guidance Consultations',
    'dash.savedQuick': 'Pinned Indian Standards',
    'dash.exploreFeatures': 'Core Guidance Modules',
    'dash.qcoUpdates': 'Latest QCO Updates',
    'dash.statActive': 'Active Standards Indexed',
    'dash.statLabs': 'Recognized Labs',
    'dash.statQco': 'Mandatory QCOs',
    'dash.statConfidence': 'Guidance Reliability',
    'dash.askDesc': 'Two-way conversational guidance. Ask multi-turn regulatory questions, verify mandatory schemes, and inspect testing clauses.',
    'dash.findDesc': 'Natural language product standard identification. Match product parameters and electrical ratings to applicable IS standards.',
    'dash.compareDesc': 'Side-by-side comparative analysis of two Indian Standards. Inspect scope overlap, testing parameters, and certification limits.',

    // Chat
    'chat.title': 'AI Regulatory Chatbot',
    'chat.subtitle': 'Ask questions about Indian Standards, QCO applicability, certification schemes, and laboratory test protocols.',
    'chat.emptyHeading': 'How can BISaarthi assist your compliance journey?',
    'chat.emptyDesc': 'Your conversational assistant for Bureau of Indian Standards guidance. Ask questions in simple language to identify standards, understand mandatory certification schemes, and review laboratory testing expectations.',
    'chat.inputPlaceholder': 'Ask BISaarthi about Indian Standards, QCOs, testing limits, or certification steps...',
    'chat.disclaimer': 'BISaarthi provides AI regulatory guidance based on indexed BIS publications. Verify critical limits with authoritative BIS documents.',
    'chat.suggested': 'Suggested Inquiries',
    'chat.suggested1': 'What is the mandatory IS standard for electric water heaters?',
    'chat.suggested2': 'Explain Scheme-I vs Scheme-II certification under BIS',
    'chat.suggested3': 'What tests are mandatory under IS 302-2-201 for immersion heaters?',
    'chat.suggested4': 'Which laboratory tests are required for LED drivers under IS 15885?',
    'chat.clearSession': 'Clear Session',
    'chat.downloadTranscript': 'Download Transcript',

    // Find Standards
    'find.title': 'Find Applicable Standards',
    'find.subtitle': 'Describe your product specifications, intended application, or operating limits to discover relevant Indian Standards with rationale.',
    'find.descTab': 'Natural Language Description',
    'find.fileTab': 'Upload Specification Document',
    'find.inputLabel': 'Product Description & Technical Specifications',
    'find.inputPlaceholder': 'Describe your product (e.g., Portable electric immersion water heater, 1500W, 230V AC, with 3-pin plug and stainless steel heating tube for household use)...',
    'find.attachHint': 'Attach technical sheet or CAD specs (optional)',
    'find.tryExamples': 'Try quick examples:',
    'find.example1': 'Electric Immersion Heater (1500W)',
    'find.example2': 'LED Luminaires & Drivers',
    'find.example3': 'Lithium-ion Battery Pack',
    'find.resultsFound': 'Applicable Standards Identified',
    'find.resultsSubtitle': 'Ranked by regulatory relevance, safety overlap, and mandatory QCO coverage.',
    'find.filterCategory': 'Filter by Domain',
    'find.allCategories': 'All Domains',
    'find.whyStandards': 'Why These Standards?',
    'find.whyStandardsDesc': 'Based on your product description, BISaarthi identified electrical heating element design, household appliance general safety, and 3-pin plug cord set requirements as the primary regulatory domains under the Electrical Appliances Quality Control Order (QCO).',
    'find.noResults': 'No standards match the selected filters. Try clearing your filter criteria.',
    'find.howItWorks': 'How Standard Identification Works',

    // Compare Standards
    'compare.title': 'Compare Indian Standards',
    'compare.subtitle': 'Select two Indian Standards to compare scope, regulatory mandate, testing parameters, and certification requirements side by side.',
    'compare.std1Label': 'First Standard (IS A)',
    'compare.std2Label': 'Second Standard (IS B)',
    'compare.selectPlaceholder': 'Choose an Indian Standard...',
    'compare.swap': 'Swap Standards',
    'compare.compareBtn': 'Compare Standards',
    'compare.summary': 'Comparative Summary',
    'compare.scope': 'Scope & Application Comparison',
    'compare.qco': 'Quality Control Order (QCO) Status',
    'compare.testing': 'Testing Requirements & Limits',
    'compare.certScheme': 'Certification Scheme & BIS Route',
    'compare.keyDifferences': 'Key Technical Differences',
    'compare.viewFull1': 'View IS A Details',
    'compare.viewFull2': 'View IS B Details',

    // Standard Details
    'std.overviewTab': 'Overview & Scope',
    'std.labsTab': 'Recognized Laboratories',
    'std.testsTab': 'Tests & Certification',
    'std.scopeTitle': 'Why This Standard Applies',
    'std.scopeHeading': 'Scope of the Standard',
    'std.keyReqTitle': 'Technical Requirements',
    'std.qcoTitle': 'Statutory Quality Control Order (QCO)',
    'std.productManual': 'BIS Product Manual Reference',
    'std.gazette': 'Gazette Notification Details',
    'std.mandatory': 'Mandatory Compliance',
    'std.voluntary': 'Voluntary Standard',
    'std.status': 'Standard Status',
    'std.year': 'Publication Year',
    'std.committee': 'Technical Committee',
    'std.viewPdf': 'View BIS Document',

    // Saved Standards
    'saved.title': 'Saved Standards',
    'saved.subtitle': 'Quick access to bookmarked standards, regulatory references, and testing specifications.',
    'saved.searchPlaceholder': 'Search saved standards by IS number, title, or domain...',
    'saved.emptyHeading': 'No Saved Standards Yet',
    'saved.emptyDesc': 'Bookmark Indian Standards during consultation or discovery to keep them accessible here for rapid inspection.',
    'saved.findBtn': 'Discover Standards Now',

    // Chat History
    'history.title': 'History',
    'history.subtitle': 'Review, resume, or export your previous regulatory guidance sessions with BISaarthi.',
    'history.searchPlaceholder': 'Search past consultations by keyword, product, or standard number...',
    'history.emptyHeading': 'No Prior Consultations Found',
    'history.emptyDesc': 'Your conversations with BISaarthi will be stored here so you can revisit recommendations and rationale anytime.',
    'history.startNew': 'Start a New Consultation',
    'history.resume': 'Resume Chat',
    'history.delete': 'Delete Session',
    'history.all': 'All',
    'history.today': 'Today',
    'history.thisWeek': 'This Week',
    'history.older': 'Older',
    'history.continue': 'Continue',
    'history.conversationsLogged': 'Conversations Logged',
    'history.showing': 'Showing',
    'history.of': 'of',
    'history.conversations': 'conversations',
    'history.clearFilters': 'Clear Filters',
    'history.noResults': 'No conversations found',
    'history.noResultsDesc': 'Try a different search term or clear your filters.',

    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Customize your interface language, display theme, regulatory notification alerts, and account preferences.',
    'settings.profileSection': 'User Profile & Organization',
    'settings.fullName': 'Full Name',
    'settings.email': 'Email Address',
    'settings.org': 'Organization / Enterprise',
    'settings.role': 'Designation / Role',
    'settings.langSection': 'Language Preference',
    'settings.langDesc': 'Choose the primary language used across navigation, buttons, and user interface labels.',
    'settings.langEn': 'English',
    'settings.langHi': 'हिन्दी (Hindi)',
    'settings.themeSection': 'Interface Theme',
    'settings.themeDesc': 'Choose between Light mode, Dark mode, or automatic system appearance.',
    'settings.notifications': 'Regulatory Update Notifications',
    'settings.notifDesc': 'Receive alerts when indexed standards receive amendments or new QCO gazettes are published.',
    'settings.notifEmail': 'Email notifications for QCO gazettes',
    'settings.notifBrowser': 'In-app notification banners',
    'settings.savedToast': 'Preferences updated successfully.',

    // Footer
    'footer.disclaimer': 'Regulatory Disclaimer: BISaarthi is an AI guidance system based on authoritative BIS publications. It does not replace official BIS certification, laboratory testing reports, or statutory determinations.',
    'footer.rights': '© 2026 BISaarthi. All rights reserved. Built for Indian Standards Compliance.',

    // Landing Page - Navigation
    'landing.navAbout': 'About',
    'landing.navHowItWorks': 'How It Works',
    'landing.navWhatItDoes': 'What It Can Do',
    'landing.navFaq': 'FAQ',
    'landing.navContact': 'Contact',
    'landing.ctaAsk': 'Ask BISAARTHI',

    // Landing Page - Hero
    'landing.heroTitle1': 'Navigate Indian Standards with ',
    'landing.heroTitle2': 'confidence.',
    'landing.heroSubtitle': 'BISaarthi is your AI-powered assistant that helps you discover, understand and explore the right Indian Standards for your products.',
    'landing.heroBadge1Title': 'AI-Assisted',
    'landing.heroBadge1Desc': 'Direct & Relevant',
    'landing.heroBadge2Title': 'Source-backed',
    'landing.heroBadge2Desc': 'Technical & Government',
    'landing.heroBadge3Title': 'Explainable',
    'landing.heroBadge3Desc': 'Clear & Transparent',
    'landing.heroMockPrompt': 'Which standards apply to my product?',
    'landing.heroMockStd1Title': 'Immersion Water Heaters Safety',
    'landing.heroMockStd2Title': 'Plugs and Socket-Outlets (250V)',
    'landing.heroMockStd3Title': 'Self-Ballasted LED Lamps Safety',
    'landing.heroMockMandatory': 'Mandatory',
    'landing.heroMockCrs': 'CRS Scheme',
    'landing.heroMockIndianStd': 'Indian Standards',
    'landing.heroMockBisServices': 'BIS Services',

    // Landing Page - The Problem
    'landing.probTag': 'THE PROBLEM',
    'landing.probTitle': "Indian Standards shouldn't be this difficult to navigate.",
    'landing.probSubtitle': 'Thousands of standards, complex language, multiple procedures and scattered information make compliance confusing and time-consuming.',
    'landing.probCard1Title': 'Thousands of Standards',
    'landing.probCard1Desc': 'Too many documents to search through manually without clarity.',
    'landing.probCard2Title': 'Complex Language',
    'landing.probCard2Desc': 'Technical jargon is hard to interpret for engineers and MSMEs.',
    'landing.probCard3Title': 'Multiple Procedures',
    'landing.probCard3Desc': 'Different conformity paths for domestic vs imported goods.',
    'landing.probCard4Title': 'Difficult to Locate',
    'landing.probCard4Desc': 'Finding the right gazettes and laboratory rules is challenging.',

    // Landing Page - What BISaarthi Does
    'landing.whatTag': 'WHAT BISAARTHI DOES',
    'landing.whatTitle': 'One assistant. Multiple compliance journeys.',
    'landing.whatSubtitle': 'From discovering applicable standards to understanding their requirements and related BIS services — BISaarthi is with you at every step.',
    'landing.whatAskDesc': 'Ask questions about Indian Standards, BIS requirements, certification, testing, and related technical queries in natural language.',
    'landing.whatFindDesc': 'Describe your product or requirement and BISaarthi helps identify the Indian Standards that may apply to it.',
    'landing.whatCompareDesc': 'Compare two Indian Standards side by side to understand their scope, requirements, applicability, and key differences.',

    // Landing Page - How It Works
    'landing.howTag': 'HOW BISAARTHI WORKS',
    'landing.howTitle': 'From your product idea to the standards that matter.',
    'landing.step1Title': 'Understand',
    'landing.step1Desc': "Understand the user's product, requirement, or question.",
    'landing.step2Title': 'Retrieve BIS Data',
    'landing.step2Desc': 'Retrieve relevant information from BIS data sources.',
    'landing.step3Title': 'Identify Standards',
    'landing.step3Desc': "Identify the Indian Standards relevant to the user's requirement.",
    'landing.step4Title': 'Explain + Evidence',
    'landing.step4Desc': 'Explain why the standards apply and provide supporting evidence.',
    'landing.step5Title': 'Verify Official BIS Source',
    'landing.step5Desc': 'Connect the result back to the official BIS source for verification.',

    // Landing Page - Why Trust
    'landing.trustTag': 'WHY TRUST BISAARTHI',
    'landing.trustTitle': 'AI-assisted. Source-backed. Explainable.',
    'landing.trust1Title': 'Built on Indian Standards',
    'landing.trust1Desc': 'Information referenced directly from authoritative BIS specifications and statutory Quality Control Orders.',
    'landing.trust2Title': 'Explainable Results',
    'landing.trust2Desc': 'Every recommendation comes with transparent contextual reasoning and applicable clause highlights.',
    'landing.trust3Title': 'Transparent & Reliable',
    'landing.trust3Desc': 'We help you understand your compliance landscape while keeping you in complete decision control.',
    'landing.bookSub': 'Statutory & Technical Specifications',
    'landing.bookRep': 'Official Reference Repository',

    // Landing Page - FAQ & Dark CTA Card
    'landing.faqTag': 'FREQUENTLY ASKED QUESTIONS',
    'landing.ctaCardTitle': 'Find where your product stands.',
    'landing.ctaCardSubtitle': 'Ask BISAARTHI and get clarity on the standards that matter.',

    // Landing Page - Footer
    'landing.footerMission': 'Empowering India through accessible and understandable standards.',
    'landing.footerQuickLinks': 'QUICK LINKS',
    'landing.footerResources': 'RESOURCES',
    'landing.footerLegal': 'LEGAL',
    'landing.footerConnect': 'CONNECT',
    'landing.footerPrivacy': 'Privacy Policy',
    'landing.footerTerms': 'Terms of Use',
    'landing.footerDisclaimer': 'Disclaimer',
    'landing.footerHelp': 'Help Centre',
    'landing.footerIndianStd': 'Indian Standards',
    'landing.footerBisServ': 'BIS Services',
  },
  HI: {
    // Nav & Layout
    'nav.dashboard': 'डैशबोर्ड',
    'nav.ask': 'Ask BISaarthi',
    'nav.find': 'मानक खोजें',
    'nav.compare': 'मानकों की तुलना करें',
    'nav.saved': 'सहेजे गए मानक',
    'nav.history': 'इतिहास',
    'nav.settings': 'सेटिंग्स',
    'nav.primary': 'मुख्य मॉड्यूल',
    'nav.workspace': 'वर्कस्पेस',
    'nav.authoritative': 'आधिकारिक स्रोत',
    'nav.quickAskPlaceholder': 'किसी भी भारतीय मानक या उत्पाद के बारे में पूछें...',
    'nav.quickAskBtn': 'पूछें',
    'nav.toggleLang': 'भाषा बदलें (English / हिन्दी)',
    'nav.light': 'लाइट',
    'nav.dark': 'डार्क',
    'nav.logout': 'लॉग आउट',
    'nav.userRole': 'नियामक अधिकारी',

    // Breadcrumbs
    'cat.overview': 'अवलोकन',
    'cat.guidance': 'मार्गदर्शन',
    'cat.discovery': 'खोज',
    'cat.comparison': 'तुलना',
    'cat.standards': 'मानक विवरण',
    'cat.workspace': 'वर्कस्पेस',
    'cat.account': 'खाता',
    'cat.platform': 'प्लेटफॉर्म',

    // Common Buttons & Actions
    'btn.explore': 'शुरू करें',
    'btn.launch': 'खोलें',
    'btn.viewDetails': 'मानक का विवरण देखें',
    'btn.compare': 'मानकों की तुलना करें',
    'btn.save': 'मानक सहेजें',
    'btn.saved': 'सहेजा गया',
    'btn.remove': 'हटाएं',
    'btn.clear': 'साफ़ करें',
    'btn.reset': 'रीसेट',
    'btn.back': 'वापस',
    'btn.backToStandards': 'मानकों पर वापस जाएं',
    'btn.search': 'खोजें',
    'btn.send': 'भेजें',
    'btn.copy': 'कॉपी करें',
    'btn.export': 'एक्सपोर्ट करें',
    'btn.newChat': 'नई चैट',
    'btn.analyze': 'विश्लेषण करें और मानक खोजें',
    'btn.analyzing': 'उत्पाद का विश्लेषण हो रहा है...',
    'btn.saveChanges': 'परिवर्तन सहेजें',
    'btn.resetDefaults': 'डिफ़ॉल्ट सेटिंग्स रीसेट करें',

    // Dashboard
    'dash.welcome': 'स्वागत है, अमन मिश्रा',
    'dash.subtitle': 'भारतीय मानकों (IS), अनिवार्य QCO और बीआईएस प्रमाणन प्रक्रियाओं के लिए आपका एआई नियामक सहायक।',
    'dash.quickPromptTitle': 'त्वरित अनुपालन प्रश्न',
    'dash.quickPromptPlaceholder': 'उदा. भारत में इलेक्ट्रिक इमर्शन वाटर हीटर पर कौन सा बीआईएस मानक लागू होता है?',
    'dash.recentQueries': 'हाल की परामर्श चर्चाएं',
    'dash.savedQuick': 'पिन किए गए भारतीय मानक',
    'dash.exploreFeatures': 'प्रमुख फीचर्स',
    'dash.qcoUpdates': 'नवीनतम QCO अपडेट्स',
    'dash.statActive': 'सक्रिय मानक',
    'dash.statLabs': 'मान्यता प्राप्त लैब्स',
    'dash.statQco': 'अनिवार्य QCO आदेश',
    'dash.statConfidence': 'विश्वसनीयता',
    'dash.askDesc': 'द्विपक्षीय संवादात्मक मार्गदर्शन। अनुपालन से जुड़े प्रश्न पूछें, अनिवार्य योजनाओं को समझें और परीक्षण नियमों की समीक्षा करें।',
    'dash.findDesc': 'सरल भाषा में उत्पाद मानक खोजें। अपने उत्पाद के विवरण और तकनीकी मानकों के अनुसार लागू IS मानक खोजें।',
    'dash.compareDesc': 'दो भारतीय मानकों की साथ-साथ तुलना करें। कार्यक्षेत्र, परीक्षण आवश्यकताएं और प्रमाणन प्रक्रियाओं का अंतर देखें।',

    // Chat
    'chat.title': 'एआई नियामक चैटबॉट',
    'chat.subtitle': 'भारतीय मानकों, QCO, प्रमाणन प्रक्रियाओं और लैब परीक्षण से जुड़े प्रश्न पूछें।',
    'chat.emptyHeading': 'बीआईएस सारथी आपकी कैसे सहायता कर सकता है?',
    'chat.emptyDesc': 'भारतीय मानक ब्यूरो (BIS) से जुड़े नियमों और प्रक्रियाओं के लिए आपका एआई सहायक। सरल भाषा में प्रश्न पूछकर लागू मानक, अनिवार्य प्रमाणन और लैब टेस्टिंग की जानकारी प्राप्त करें।',
    'chat.inputPlaceholder': 'भारतीय मानकों, QCO, परीक्षण नियमों या प्रमाणन के बारे में पूछें...',
    'chat.disclaimer': 'बीआईएस सारथी आधिकारिक बीआईएस प्रकाशनों पर आधारित मार्गदर्शन प्रदान करता है। महत्वपूर्ण आवश्यकताओं की पुष्टि आधिकारिक बीआईएस दस्तावेजों से करें।',
    'chat.suggested': 'सुझाए गए प्रश्न',
    'chat.suggested1': 'इलेक्ट्रिक वाटर हीटर के लिए अनिवार्य IS मानक क्या है?',
    'chat.suggested2': 'बीआईएस के तहत Scheme-I और Scheme-II प्रमाणन में क्या अंतर है?',
    'chat.suggested3': 'इमर्शन हीटर के लिए IS 302-2-201 के तहत कौन से परीक्षण अनिवार्य हैं?',
    'chat.suggested4': 'IS 15885 के तहत LED ड्राइवर्स के लिए कौन से लैब टेस्ट आवश्यक हैं?',
    'chat.clearSession': 'चैट साफ़ करें',
    'chat.downloadTranscript': 'ट्रांसक्रिप्ट डाउनलोड करें',

    // Find Standards
    'find.title': 'लागू भारतीय मानक खोजें',
    'find.subtitle': 'अपने उत्पाद का विवरण या आवश्यकताएं दर्ज करें और स्पष्ट कारण के साथ लागू भारतीय मानक प्राप्त करें।',
    'find.descTab': 'सरल भाषा विवरण',
    'find.fileTab': 'स्पेसिफिकेशन दस्तावेज़ अपलोड करें',
    'find.inputLabel': 'उत्पाद विवरण और तकनीकी स्पेसिफिकेशन्स',
    'find.inputPlaceholder': 'अपने उत्पाद का विवरण दें (उदा. पोर्टेबल इलेक्ट्रिक इमर्शन वाटर हीटर, 1500W, 230V AC, 3-पिन प्लग और घरेलू उपयोग हेतु स्टेनलेस स्टील हीटिंग ट्यूब)...',
    'find.attachHint': 'तकनीकी शीट या CAD फाइल जोड़ें (वैकल्पिक)',
    'find.tryExamples': 'उदाहरण देखें:',
    'find.example1': 'इलेक्ट्रिक इमर्शन हीटर (1500W)',
    'find.example2': 'LED ल्यूमिनेयर और ड्राइवर्स',
    'find.example3': 'लिथियम-आयन बैटरी पैक',
    'find.resultsFound': 'पहचाने गए लागू मानक',
    'find.resultsSubtitle': 'नियामक प्रासंगिकता, सुरक्षा मानकों और अनिवार्य QCO के आधार पर क्रमबद्ध।',
    'find.filterCategory': 'कैटेगरी के अनुसार फ़िल्टर करें',
    'find.allCategories': 'सभी कैटेगरीज',
    'find.whyStandards': 'यह मानक क्यों लागू होता है',
    'find.whyStandardsDesc': 'आपके उत्पाद विवरण के आधार पर, बीआईएस सारथी ने विद्युत उपकरण गुणवत्ता नियंत्रण आदेश (QCO) के तहत हीटिंग एलीमेंट डिजाइन, घरेलू सुरक्षा और 3-पिन प्लग आवश्यकताओं की पहचान की है।',
    'find.noResults': 'चुने गए फ़िल्टर से कोई मानक मेल नहीं खाता। कृपया फ़िल्टर साफ़ करें।',
    'find.howItWorks': 'मानक पहचान कैसे काम करती है',

    // Compare Standards
    'compare.title': 'भारतीय मानकों की तुलना करें',
    'compare.subtitle': 'दो भारतीय मानकों का कार्यक्षेत्र, नियामक नियम, परीक्षण आवश्यकताएं और प्रमाणन प्रक्रियाएं साथ-साथ समझें।',
    'compare.std1Label': 'पहला मानक (IS A)',
    'compare.std2Label': 'दूसरा मानक (IS B)',
    'compare.selectPlaceholder': 'एक भारतीय मानक चुनें...',
    'compare.swap': 'मानक बदलें',
    'compare.compareBtn': 'मानकों की तुलना करें',
    'compare.summary': 'तुलनात्मक सारांश',
    'compare.scope': 'कार्यक्षेत्र और उपयोग की तुलना',
    'compare.qco': 'गुणवत्ता नियंत्रण आदेश (QCO) स्थिति',
    'compare.testing': 'परीक्षण आवश्यकताएं और सीमाएं',
    'compare.certScheme': 'प्रमाणन योजना और बीआईएस प्रक्रिया',
    'compare.keyDifferences': 'प्रमुख तकनीकी अंतर',
    'compare.viewFull1': 'IS A का पूरा विवरण देखें',
    'compare.viewFull2': 'IS B का पूरा विवरण देखें',

    // Standard Details
    'std.overviewTab': 'अवलोकन एवं कार्यक्षेत्र',
    'std.labsTab': 'मान्यता प्राप्त लैब्स',
    'std.testsTab': 'परीक्षण एवं प्रमाणन',
    'std.scopeTitle': 'यह मानक क्यों लागू होता है',
    'std.scopeHeading': 'मानक का कार्यक्षेत्र',
    'std.keyReqTitle': 'तकनीकी आवश्यकताएँ',
    'std.qcoTitle': 'वैधानिक गुणवत्ता नियंत्रण आदेश (QCO)',
    'std.productManual': 'बीआईएस उत्पाद नियमावली',
    'std.gazette': 'राजपत्र अधिसूचना विवरण',
    'std.mandatory': 'अनिवार्य अनुपालन',
    'std.voluntary': 'स्वैच्छिक मानक',
    'std.status': 'मानक स्थिति',
    'std.year': 'प्रकाशन वर्ष',
    'std.committee': 'तकनीकी समिति',
    'std.viewPdf': 'बीआईएस दस्तावेज़ देखें',

    // Saved Standards
    'saved.title': 'सहेजे गए मानक',
    'saved.subtitle': 'बुकमार्क किए गए मानकों, संदर्भों और परीक्षण नियमों तक त्वरित पहुंच।',
    'saved.searchPlaceholder': 'IS संख्या, शीर्षक या कैटेगरी से सहेजे गए मानक खोजें...',
    'saved.emptyHeading': 'अभी तक कोई मानक सहेजा नहीं गया',
    'saved.emptyDesc': 'परामर्श या खोज के दौरान भारतीय मानकों को बुकमार्क करें ताकि वे त्वरित समीक्षा के लिए यहां उपलब्ध रहें।',
    'saved.findBtn': 'मानक खोजें',

    // Chat History
    'history.title': 'इतिहास',
    'history.subtitle': 'बीआईएस सारथी के साथ अपने पिछले परामर्श सत्रों की समीक्षा करें या जारी रखें।',
    'history.searchPlaceholder': 'कीवर्ड, उत्पाद या मानक संख्या से खोजें...',
    'history.emptyHeading': 'कोई पिछला परामर्श नहीं मिला',
    'history.emptyDesc': 'बीआईएस सारथी के साथ आपकी बातचीत यहां सुरक्षित रहेगी ताकि आप कभी भी सिफारिशें और कारण दोबारा देख सकें।',
    'history.startNew': 'नई चैट शुरू करें',
    'history.resume': 'चैट जारी रखें',
    'history.delete': 'हटाएं',
    'history.all': 'सभी',
    'history.today': 'आज',
    'history.thisWeek': 'इस सप्ताह',
    'history.older': 'पुराने',
    'history.continue': 'जारी रखें',
    'history.conversationsLogged': 'बातचीत दर्ज',
    'history.showing': 'दिखाए जा रहे हैं',
    'history.of': 'में से',
    'history.conversations': 'चैट्स',
    'history.clearFilters': 'फ़िल्टर हटाएं',
    'history.noResults': 'कोई बातचीत नहीं मिली',
    'history.noResultsDesc': 'कोई भिन्न खोज शब्द आज़माएं या फ़िल्टर साफ़ करें।',

    // Settings
    'settings.title': 'सेटिंग्स',
    'settings.subtitle': 'अपनी भाषा, डिस्प्ले थीम, नियामक सूचनाएं और खाता प्राथमिकताएं सेट करें।',
    'settings.profileSection': 'उपयोगकर्ता प्रोफ़ाइल और संगठन',
    'settings.fullName': 'पूरा नाम',
    'settings.email': 'ईमेल पता',
    'settings.org': 'संगठन / कंपनी',
    'settings.role': 'पद / भूमिका',
    'settings.langSection': 'भाषा प्राथमिकता',
    'settings.langDesc': 'नेविगेशन, बटन और इंटरफ़ेस टेक्स्ट के लिए अपनी पसंदीदा भाषा चुनें।',
    'settings.langEn': 'English',
    'settings.langHi': 'हिन्दी (Hindi)',
    'settings.themeSection': 'इंटरफ़ेस थीम',
    'settings.themeDesc': 'लाइट मोड, डार्क मोड या सिस्टम थीम चुनें।',
    'settings.notifications': 'नियामक अपडेट सूचनाएं',
    'settings.notifDesc': 'मानकों में संशोधन या नए QCO राजपत्र प्रकाशित होने पर अलर्ट प्राप्त करें।',
    'settings.notifEmail': 'QCO राजपत्रों के लिए ईमेल अलर्ट',
    'settings.notifBrowser': 'इन-ऐप सूचना बैनर',
    'settings.savedToast': 'प्राथमिकताएं सफलतापूर्वक अपडेट की गईं।',

    // Footer
    'footer.disclaimer': 'नियामक अस्वीकरण: बीआईएस सारथी आधिकारिक बीआईएस प्रकाशनों पर आधारित एक एआई मार्गदर्शन प्रणाली है। यह आधिकारिक बीआईएस प्रमाणन, परीक्षण रिपोर्ट या वैधानिक कानूनी निर्धारण का स्थान नहीं लेता है।',
    'footer.rights': '© 2026 BISaarthi. सर्वाधिकार सुरक्षित। भारतीय मानक अनुपालन के लिए निर्मित।',

    // Landing Page - Navigation
    'landing.navAbout': 'परिचय',
    'landing.navHowItWorks': 'यह कैसे काम करता है',
    'landing.navWhatItDoes': 'सुविधाएं',
    'landing.navFaq': 'FAQ',
    'landing.navContact': 'संपर्क',
    'landing.ctaAsk': 'Ask BISAARTHI',

    // Landing Page - Hero
    'landing.heroTitle1': 'आत्मविश्वास के साथ समझें ',
    'landing.heroTitle2': 'भारतीय मानक।',
    'landing.heroSubtitle': 'BISaarthi आपका एआई सहायक है जो आपके उत्पादों के लिए सही भारतीय मानक (IS) खोजने, समझने और लागू करने में मदद करता है।',
    'landing.heroBadge1Title': 'एआई-संचालित',
    'landing.heroBadge1Desc': 'सटीक एवं प्रासंगिक',
    'landing.heroBadge2Title': 'प्रमाणित स्रोत',
    'landing.heroBadge2Desc': 'आधिकारिक एवं सरकारी',
    'landing.heroBadge3Title': 'स्पष्ट विवरण',
    'landing.heroBadge3Desc': 'पारदर्शी एवं सरल',
    'landing.heroMockPrompt': 'मेरे उत्पाद पर कौन से मानक लागू होते हैं?',
    'landing.heroMockStd1Title': 'इमर्शन वाटर हीटर सुरक्षा',
    'landing.heroMockStd2Title': 'प्लग और सॉकेट-आउटलेट (250V)',
    'landing.heroMockStd3Title': 'सेल्फ-बैलास्टेड एलईडी लैंप सुरक्षा',
    'landing.heroMockMandatory': 'अनिवार्य',
    'landing.heroMockCrs': 'CRS स्कीम',
    'landing.heroMockIndianStd': 'भारतीय मानक',
    'landing.heroMockBisServices': 'बीआईएस सेवाएं',

    // Landing Page - The Problem
    'landing.probTag': 'मुख्य चुनौतियाँ',
    'landing.probTitle': 'भारतीय मानकों को समझना इतना जटिल नहीं होना चाहिए।',
    'landing.probSubtitle': 'हजारों मानक, जटिल तकनीकी भाषा, अलग-अलग प्रक्रियाएं और बिखरी हुई जानकारी अनुपालन को कठिन और समय लेने वाला बना देती है।',
    'landing.probCard1Title': 'हजारों मानक',
    'landing.probCard1Desc': 'बिना स्पष्ट मार्गदर्शन के इतने सारे दस्तावेजों में खोजना कठिन है।',
    'landing.probCard2Title': 'जटिल तकनीकी भाषा',
    'landing.probCard2Desc': 'इंजीनियरों और MSMEs के लिए तकनीकी शब्दावली को समझना चुनौतीपूर्ण है।',
    'landing.probCard3Title': 'विभिन्न प्रक्रियाएं',
    'landing.probCard3Desc': 'घरेलू और आयातित उत्पादों के लिए अलग-अलग प्रमाणन प्रक्रियाएं।',
    'landing.probCard4Title': 'दस्तावेज़ खोजने में कठिनाई',
    'landing.probCard4Desc': 'सही राजपत्र अधिसूचनाएं और लैब परीक्षण नियम ढूंढना मुश्किल होता है।',

    // Landing Page - What BISaarthi Does
    'landing.whatTag': 'BISAARTHI की क्षमताएं',
    'landing.whatTitle': 'एक सहायक। हर अनुपालन आवश्यकता का समाधान।',
    'landing.whatSubtitle': 'लागू मानकों की पहचान से लेकर उनकी तकनीकी आवश्यकताओं और बीआईएस सेवाओं को समझने तक — BISaarthi हर कदम पर आपके साथ है।',
    'landing.whatAskDesc': 'सरल भाषा में भारतीय मानकों, बीआईएस आवश्यकताओं, प्रमाणन और लैब टेस्टिंग से जुड़े सवाल पूछें।',
    'landing.whatFindDesc': 'अपने उत्पाद या आवश्यकता का विवरण दें और BISaarthi लागू होने वाले भारतीय मानकों की पहचान करने में मदद करेगा।',
    'landing.whatCompareDesc': 'दो भारतीय मानकों की साथ-साथ तुलना करें और उनके कार्यक्षेत्र, आवश्यकताओं और प्रमुख अंतरों को समझें।',

    // Landing Page - How It Works
    'landing.howTag': 'BISAARTHI कैसे काम करता है',
    'landing.howTitle': 'आपके उत्पाद विवरण से लेकर लागू होने वाले सही मानकों तक।',
    'landing.step1Title': 'उत्पाद को समझना',
    'landing.step1Desc': 'उपयोगकर्ता के उत्पाद, आवश्यकता या प्रश्न को समझना।',
    'landing.step2Title': 'बीआईएस डेटा प्राप्त करना',
    'landing.step2Desc': 'आधिकारिक बीआईएस स्रोतों से प्रासंगिक जानकारी प्राप्त करना।',
    'landing.step3Title': 'मानकों की पहचान',
    'landing.step3Desc': 'उपयोगकर्ता की आवश्यकता के अनुसार उपयुक्त भारतीय मानकों की पहचान करना।',
    'landing.step4Title': 'कारण और प्रमाण',
    'landing.step4Desc': 'मानक लागू होने का स्पष्ट कारण और प्रमाण प्रस्तुत करना।',
    'landing.step5Title': 'आधिकारिक स्रोत से सत्यापन',
    'landing.step5Desc': 'सत्यापन के लिए परिणाम को आधिकारिक बीआईएस स्रोत से जोड़ना।',

    // Landing Page - Why Trust
    'landing.trustTag': 'BISAARTHI पर भरोसा क्यों करें',
    'landing.trustTitle': 'एआई-संचालित। प्रमाणित स्रोतों पर आधारित। पारदर्शी।',
    'landing.trust1Title': 'भारतीय मानकों पर आधारित',
    'landing.trust1Desc': 'आधिकारिक बीआईएस विनिर्देशों और वैधानिक गुणवत्ता नियंत्रण आदेशों (QCO) से सीधे संदर्भित जानकारी।',
    'landing.trust2Title': 'स्पष्ट और समझने योग्य परिणाम',
    'landing.trust2Desc': 'हर सिफारिश के साथ स्पष्ट कारण और लागू होने वाले क्लॉज की जानकारी दी जाती है।',
    'landing.trust3Title': 'पारदर्शी एवं विश्वसनीय',
    'landing.trust3Desc': 'हम आपको अनुपालन नियमों को समझने में मदद करते हैं, जबकि अंतिम निर्णय हमेशा आपका होता है।',
    'landing.bookSub': 'वैधानिक एवं तकनीकी विनिर्देश',
    'landing.bookRep': 'आधिकारिक संदर्भ भंडार',

    // Landing Page - FAQ & Dark CTA Card
    'landing.faqTag': 'अक्सर पूछे जाने वाले प्रश्न',
    'landing.ctaCardTitle': 'जानें आपका उत्पाद मानकों पर कहाँ खरा उतरता है।',
    'landing.ctaCardSubtitle': 'Ask BISAARTHI से पूछें और आवश्यक मानकों पर पूर्ण स्पष्टता प्राप्त करें।',

    // Landing Page - Footer
    'landing.footerMission': 'सुलभ और समझने योग्य मानकों के माध्यम से भारत को सशक्त बनाना।',
    'landing.footerQuickLinks': 'त्वरित लिंक्स',
    'landing.footerResources': 'संसाधन',
    'landing.footerLegal': 'कानूनी',
    'landing.footerConnect': 'जुड़ें',
    'landing.footerPrivacy': 'गोपनीयता नीति',
    'landing.footerTerms': 'उपयोग की शर्तें',
    'landing.footerDisclaimer': 'अस्वीकरण',
    'landing.footerHelp': 'सहायता केंद्र',
    'landing.footerIndianStd': 'भारतीय मानक',
    'landing.footerBisServ': 'बीआईएस सेवाएं',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'bisaarthi-language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('EN');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      if (saved === 'EN' || saved === 'HI') {
        setLanguageState(saved);
      }
    } catch {
      // Fallback to default EN if localStorage is unavailable
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Ignore localStorage write error
    }
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'EN' ? 'HI' : 'EN';
    setLanguage(nextLang);
  };

  const t = (key: string, fallback?: string): string => {
    const dict = translations[language];
    if (dict && dict[key]) {
      return dict[key];
    }
    const enDict = translations.EN;
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'EN',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key: string, fallback?: string) => fallback || key,
    };
  }
  return context;
};
