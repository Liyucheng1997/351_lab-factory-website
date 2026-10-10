// 意大利语（主语言）。其它语言的结构必须和这里一样（类型从这里推出来）。
export const it = {
  meta: {
    title: "LGF · Laboratorio di confezione a Reggio Emilia",
    description:
      "Laboratorio di confezione per il prêt-à-porter donna a Reggio Emilia. Taglio, confezione e stiro nella stessa sede di 2.000 m², con ogni capo tracciato.",
  },
  skip: "Vai al contenuto",
  nav: { about: "Il laboratorio", contact: "Contatti", cta: "Preventivo" },
  hero: {
    eyebrow: "Laboratorio di confezione · Reggio Emilia",
    title: "Taglio, confezione e stiro.\nSotto lo stesso tetto.",
    lead: "Produciamo capi di prêt-à-porter donna per brand italiani, dal prototipo alla serie.",
    cta: "Richiedi un preventivo",
    more: "Scopri il laboratorio",
    caption: "Rappresentazione 3D del laboratorio",
    drag: "Trascina per ruotare",
    zones: { cutting: "Taglio", sewing: "Confezione", pressing: "Stiro", quality: "Controllo" },
    tabs: ["Panoramica", "Taglio", "Confezione", "Stiro", "Controllo"],
    notes: [
      "2.000 m² organizzati in un unico flusso: il tessuto entra da un lato, il capo finito esce dall'altro.",
      "Banco di taglio da 10 m con stenditore e taglio automatico. Ogni pacco riceve un'etichetta QR.",
      "Macchine lineari e taglia-cuci industriali. Ogni capo è confezionato da una sola sarta.",
      "Tavoli da stiro aspiranti, generatori di vapore e manichino da stiro.",
      "Controllo capo per capo su tavolo luminoso, imballo e consegna diretta.",
    ],
  },
  about: {
    title: "Perché i brand lavorano con noi.",
    stats: [
      { value: "2.000", unit: "m²", label: "di laboratorio" },
      { value: "15", unit: "", label: "professionisti" },
      { value: "3", unit: "", label: "reparti interni" },
      { value: "100%", unit: "", label: "dei capi tracciati" },
    ],
    points: [
      { title: "Tutto in casa", text: "Taglio, confezione, stiro e controllo nella stessa sede. Rispondiamo direttamente di ogni capo." },
      { title: "Ogni capo tracciato", text: "Etichetta QR su ogni pacco e ogni fase scansionata: sappiamo sempre a che punto è il vostro ordine." },
      { title: "Filiera trasparente", text: "Personale con regolare contratto, NDA su richiesta, laboratorio aperto ad audit e visite." },
    ],
    clients: "Lavoriamo per",
    note: "I marchi appartengono ai rispettivi titolari.",
  },
  contact: {
    title: "Parliamo del vostro prossimo ordine.",
    lead: "Inviateci una breve descrizione: tipo di capo, quantità e tempi. Vi rispondiamo personalmente.",
    form: {
      name: "Nome e cognome",
      company: "Azienda / brand",
      email: "Email",
      message: "Cosa volete produrre?",
      messagePlaceholder: "Es. 300 cappotti in lana, consegna a marzo",
      privacy: "Acconsento al trattamento dei dati per ricevere una risposta.",
      privacyLink: "Informativa privacy",
      submit: "Invia richiesta",
      sending: "Invio…",
      success: "Grazie, abbiamo ricevuto la vostra richiesta. Vi risponderemo al più presto.",
      mailOpened: "Abbiamo preparato l'email nel vostro programma di posta: inviatela per completare la richiesta.",
      error: "Non è stato possibile inviare il messaggio.",
      errorMail: "Scriveteci a",
      errorCall: "Riprovate più tardi o contattateci per telefono.",
    },
    info: { address: "Sede", email: "Email", phone: "Telefono", whatsapp: "WhatsApp", hours: "Orari", maps: "Apri in Maps", visit: "Visite al laboratorio su appuntamento." },
  },
  footer: { rights: "Tutti i diritti riservati.", privacy: "Privacy", vat: "P.IVA" },
  privacy: {
    title: "Informativa sulla privacy",
    updated: "Ultimo aggiornamento: ottobre 2026",
    back: "Torna al sito",
    sections: [
      {
        h: "Titolare del trattamento",
        p: "Il titolare del trattamento è {company}, con sede a {city}. Per qualsiasi richiesta relativa ai vostri dati potete scriverci all'indirizzo indicato nella sezione Contatti.",
      },
      {
        h: "Dati raccolti",
        p: "Tramite il modulo di contatto raccogliamo nome, azienda, email e il messaggio che scegliete di inviarci. Il sito non utilizza cookie di profilazione né strumenti di tracciamento di terze parti.",
      },
      {
        h: "Finalità e base giuridica",
        p: "Usiamo i dati esclusivamente per rispondere alla vostra richiesta e per eventuali trattative precontrattuali (art. 6.1.b GDPR). Non li cediamo a terzi e non li usiamo per comunicazioni promozionali.",
      },
      {
        h: "Conservazione",
        p: "Conserviamo le richieste per il tempo necessario a gestire il rapporto e comunque non oltre 24 mesi dall'ultimo contatto, salvo obblighi di legge.",
      },
      {
        h: "I vostri diritti",
        p: "Potete chiedere in qualsiasi momento accesso, rettifica, cancellazione o limitazione dei vostri dati, e proporre reclamo al Garante per la protezione dei dati personali.",
      },
    ],
  },
};

export type Dict = typeof it;
