// ---------- Mobile nav toggle ----------
(function(){
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if(!toggle || !nav) return;
  toggle.addEventListener('click', function(){
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();

// ---------- Reservation page logic ----------
(function(){
  const form = document.getElementById('bookingForm');
  if(!form) return;

  const offreSelect = document.getElementById('offre');
  const artisanFields = document.getElementById('artisanFields');
  const confirmBox = document.getElementById('confirmBox');

  // Pre-fill offer from ?offre=xxx in the URL (set by the landing page CTAs)
  const params = new URLSearchParams(window.location.search);
  const offreParam = params.get('offre');
  if(offreParam){
    const optionExists = Array.from(offreSelect.options).some(o => o.value === offreParam);
    if(optionExists) offreSelect.value = offreParam;
  }

  function syncArtisanFields(){
    const isArtisan = offreSelect.value === 'artisan';
    artisanFields.classList.toggle('active', isArtisan);
    // required only when visible
    ['metier','ville','services_artisan','horaires'].forEach(id => {
      document.getElementById(id).required = isArtisan;
    });
  }
  offreSelect.addEventListener('change', syncArtisanFields);
  syncArtisanFields();

  // URL du webhook Airtable Automation : elle sera fournie par Airtable
  // après avoir créé une automation « When webhook received ».
  const AIRTABLE_WEBHOOK_URL = 'https://hooks.airtable.com/workflows/v1/genericWebhook/appBgDer7lMPmFFpt/wflHPNTAYj9CZWAuL/wtrEfXxsADWPPLBfz';

  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }

    if(!AIRTABLE_WEBHOOK_URL){
      alert("Le formulaire n'est pas encore connecté à Airtable. Ajoutez l'URL du webhook Airtable dans script.js, comme indiqué dans README.md.");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const airtablePayload = {
      offre: data.offre,
      nom: data.nom,
      telephone: data.telephone,
      email: data.email,
      metier: data.metier,
      ville: data.ville,
      services: data.services_artisan,
      services_artisan: data.services_artisan,
      horaires: data.horaires,
      date: data.date,
      creneau: data.creneau,
      message: data.message
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';

    try {
      const res = await fetch(AIRTABLE_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(airtablePayload)
      });

      // Airtable ne fournit pas Access-Control-Allow-Origin. En no-cors,
      // la réponse devient opaque : l'absence d'exception confirme l'envoi,
      // mais le navigateur ne peut pas lire le statut HTTP.
      if(!res.ok && res.type !== 'opaque'){
        throw new Error(`Échec de l'envoi (HTTP ${res.status})`);
      }

      // Efface les données du navigateur avant le message de succès.
      form.reset();
      syncArtisanFields();
      form.style.display = 'none';
      confirmBox.classList.add('active');
      confirmBox.scrollIntoView({behavior:'smooth', block:'center'});
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer ma demande';
      alert("La demande n'a pas pu être transmise à Airtable. Vérifiez l'URL du webhook et que l'Automation est active, puis réessayez. Contact : 032 46 658 49.");
    }
  });
})();

// ---------- Assistant IA ----------
(function(){
  const AI_AGENT_ENDPOINT = '';
  const assistantData = {
    company: 'Bâtisseur Web',
    contact: 'contact@santatra-michado.site · 032 46 658 49',
    responseTime: 'sous 24h',
    services: [
      { name: 'Site Vitrine Essentiel', aliases: ['vitrine', 'essentiel'], price: '300 € à 600 €', details: '1 à 5 pages, thème WordPress personnalisé, formulaire de contact, réseaux sociaux, mobile et SEO de base.', delay: '5 à 7 jours' },
      { name: 'Site Professionnel', aliases: ['professionnel', 'pro'], price: '700 € à 1 500 €', details: '6 à 12 pages, design sur mesure, blog, SEO avancé, Google Analytics, Google My Business et 1h de formation.', delay: '10 à 15 jours' },
      { name: 'Site E-commerce', aliases: ['e-commerce', 'ecommerce', 'boutique', 'woocommerce'], price: '1 200 € à 3 000 €+', details: 'Boutique WooCommerce, paiements Stripe, PayPal et Mobile Money, gestion des produits, stock et tunnel de paiement.', delay: '15 à 25 jours' },
      { name: 'Site Automatique Artisan', aliases: ['artisan', 'automatique', 'généré'], price: 'à partir de 5 informations', details: 'Site généré en quelques minutes à partir du métier, de la ville, du téléphone, des services et des horaires. Mise en ligne et nom de domaine inclus.', delay: 'quelques minutes' }
    ]
  };

  const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function localReply(message){
    const text = normalize(message);
    const service = assistantData.services.find(item => item.aliases.some(alias => text.includes(normalize(alias))));

    if(/bonjour|salut|hello|bonsoir/.test(text)) return 'Bonjour ! Je peux vous orienter vers l’offre adaptée, préciser les tarifs et délais, ou vous accompagner pour demander un devis.';
    if(/prix|tarif|cout|combien|budget/.test(text)) return service
      ? `${service.name} est proposé entre ${service.price}. Le délai indicatif est de ${service.delay}.`
      : 'Les offres vont de 300 € à 600 € pour un site vitrine, 700 € à 1 500 € pour un site professionnel, et 1 200 € à 3 000 €+ pour une boutique. Le site artisan est généré à partir de 5 informations.';
    if(/delai|temps|duree|quand|rapide/.test(text)) return service
      ? `Pour ${service.name}, le délai indicatif est de ${service.delay}. Le devis est envoyé sous 24h.`
      : 'Le délai va de 5 à 7 jours pour le Vitrine Essentiel, jusqu’à 15 à 25 jours pour l’e-commerce. Le site Artisan peut être généré en quelques minutes.';
    if(/artisan|plombier|electricien|serrurier|peintre/.test(text)) return 'L’offre Automatique Artisan demande 5 informations : métier, ville, téléphone, services et horaires. Le site est généré en quelques minutes, avec mise en ligne et nom de domaine inclus.';
    if(/maintenance|support|sauvegarde|mise a jour/.test(text)) return 'La maintenance mensuelle comprend les mises à jour, les sauvegardes et le support technique. Elle coûte 30 € à 100 € par mois.';
    if(/contact|appel|devis|reserver|reservation|telephone|email/.test(text)) return `Vous pouvez réserver un appel gratuit de 15 minutes via le formulaire. Une réponse vous sera envoyée ${assistantData.responseTime}. Contact : ${assistantData.contact}.`;
    if(/service|offre|proposer|wordpress|site/.test(text)) return 'Nous créons des sites WordPress vitrine, professionnels et e-commerce WooCommerce, ainsi qu’un site automatique pour artisans. Dites-moi votre activité et votre objectif pour que je vous conseille.';
    if(service) return `${service.name} : ${service.details} Tarif indicatif : ${service.price}.`;
    return 'Je peux vous renseigner sur les offres, les tarifs, les délais, la maintenance ou la réservation d’un appel. Quelle est votre activité et quel site souhaitez-vous créer ?';
  }

  const widget = document.createElement('aside');
  widget.className = 'ai-assistant';
  widget.innerHTML = `
    <div class="ai-panel" hidden>
      <div class="ai-header">
        <div><span class="ai-kicker">Assistant Bâtisseur Web</span><strong>Une question sur votre site ?</strong></div>
        <button type="button" class="ai-close" aria-label="Fermer l’assistant">×</button>
      </div>
      <div class="ai-messages" aria-live="polite"></div>
      <div class="ai-suggestions">
        <button type="button" data-question="Quelle offre correspond à mon projet ?">Choisir une offre</button>
        <button type="button" data-question="Quels sont les tarifs et délais ?">Tarifs et délais</button>
        <button type="button" data-question="Comment fonctionne l'offre artisan ?">Offre artisan</button>
      </div>
      <form class="ai-form">
        <label class="sr-only" for="aiInput">Votre question</label>
        <input id="aiInput" type="text" placeholder="Écrivez votre question..." autocomplete="off" required>
        <button type="submit" aria-label="Envoyer la question">→</button>
      </form>
      <a class="ai-booking" href="reservation.html">Demander un devis ou réserver un appel →</a>
    </div>
    <button type="button" class="ai-launcher" aria-expanded="false" aria-label="Ouvrir l'assistant IA"><span>✦</span><b>Assistant IA</b></button>`;
  document.body.appendChild(widget);

  const panel = widget.querySelector('.ai-panel');
  const launcher = widget.querySelector('.ai-launcher');
  const messages = widget.querySelector('.ai-messages');
  const input = widget.querySelector('#aiInput');
  const form = widget.querySelector('.ai-form');

  function addMessage(content, author){
    const message = document.createElement('div');
    message.className = `ai-message ${author}`;
    message.textContent = content;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function openAssistant(){
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    if(!messages.children.length) addMessage('Bonjour ! Je connais les offres, tarifs et délais affichés sur ce site. Comment puis-je vous aider ?', 'assistant');
    input.focus();
  }

  function ask(question){
    addMessage(question, 'user');
    input.value = '';
    const pending = document.createElement('div');
    pending.className = 'ai-message assistant ai-pending';
    pending.textContent = 'Je consulte les informations du site...';
    messages.appendChild(pending);

    const answer = AI_AGENT_ENDPOINT
      ? fetch(AI_AGENT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question, page: window.location.pathname, siteData: assistantData }) })
          .then(response => response.ok ? response.json() : Promise.reject(new Error('Agent indisponible')))
          .then(data => data.reply || data.response || data.text || localReply(question))
          .catch(() => localReply(question))
      : Promise.resolve(localReply(question));

    answer.then(response => { pending.remove(); addMessage(response, 'assistant'); });
  }

  launcher.addEventListener('click', () => panel.hidden ? openAssistant() : (panel.hidden = true, launcher.setAttribute('aria-expanded', 'false')));
  widget.querySelector('.ai-close').addEventListener('click', () => { panel.hidden = true; launcher.setAttribute('aria-expanded', 'false'); });
  widget.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click', () => ask(button.dataset.question)));
  form.addEventListener('submit', event => { event.preventDefault(); if(input.value.trim()) ask(input.value.trim()); });
})();
