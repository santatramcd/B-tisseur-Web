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
  // NOTE POUR L'INTÉGRATION : ce formulaire n'envoie nulle part pour
  // le moment (aucun backend n'est branché). Pour recevoir les
  // demandes par email, deux options simples :
  //   1) Un service comme Formspree / Getform : remplacer l'action
  //      du <form> par leur URL et enlever preventDefault() ci-dessous.
  //   2) Une fonction serverless qui envoie l'email (ex: via l'API
  //      Anthropic/Resend/SendGrid) recevant ces mêmes champs en JSON.
  // ---------------------------------------------------------------
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }
    form.style.display = 'none';
    confirmBox.classList.add('active');
    confirmBox.scrollIntoView({behavior:'smooth', block:'center'});
  });
})();
