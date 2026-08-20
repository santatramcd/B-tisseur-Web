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

  // ---------------------------------------------------------------
  // Envoi vers le webhook n8n : stocke la demande dans Google Sheets,
  // envoie l'email de confirmation au client + une notification pour
  // vous. Remplacez l'URL ci-dessous par votre Production URL n8n
  // (voir GUIDE-CONFIGURATION-N8N.md).
  // ---------------------------------------------------------------
  const N8N_WEBHOOK_URL = "https://n8n-jp2v.onrender.com/webhook/batisseur";

  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }

    if(N8N_WEBHOOK_URL.indexOf('COLLEZ_ICI') !== -1){
      alert("Le formulaire n'est pas encore connecté : suivez GUIDE-CONFIGURATION-N8N.md pour ajouter votre URL de webhook n8n dans script.js.");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // n8n peut répondre avec du JSON, du texte ou un corps vide. Un statut
      // HTTP 2xx confirme que le webhook a accepté la demande.
      if(!res.ok){
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
      alert("Une erreur est survenue lors de l'envoi. Merci de réessayer, ou de nous contacter directement par téléphone.");
    }
  });
})();
