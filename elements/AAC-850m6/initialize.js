function(instance, context) {

  // ─── Instance ID (isolation multi-instances) ──────────────────────────────
  var instanceId = (Math.random() * Math.pow(2, 54)).toString(36);
  instance.data.instanceName = "genericDropdown-" + instanceId;
  var name     = instance.data.instanceName;
  var listName = name + '-list'; // classe du portal (attaché au body)

  // ─── Couleurs design system ───────────────────────────────────────────────
  var PRIMARY          = '#f20d0d';
  var PRIMARY_LIGHT    = '#fd6c70';
  var PRIMARY_CONTRAST = '#fef2f2';
  var BORDER           = '#e2e8f0';

  var CHEVRON = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' "
    + "width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' "
    + "stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")";

  // ─── CSS scopé ────────────────────────────────────────────────────────────
  var css = '<style>';

  // Conteneur racine du plugin (trigger uniquement)
  css += '.'+name+' { position: relative; '
    + 'width: 100%; height: 100%; '
    + 'font-family: inherit; font-size: var(--dd-font-size, 13px); color: #1e293b; '
    + 'box-sizing: border-box; }';
  css += '.'+name+' * { box-sizing: border-box; }';

  // Trigger
  css += '.'+name+' .dd-trigger { '
    + 'display: flex; align-items: center; width: 100%; height: 100%; '
    + 'padding: 0 32px 0 12px; position: relative; '
    + 'border: 1px solid '+BORDER+'; border-radius: 5px; '
    + 'background: #fff '+CHEVRON+' no-repeat right 10px center; '
    + 'cursor: pointer; user-select: none; transition: border-color 0.15s; overflow: hidden; }';
  css += '.'+name+' .dd-trigger-text { '
    + 'flex: 1; min-width: 0; '
    + 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }';
  css += '.'+name+'.open .dd-trigger { border-color: '+PRIMARY_LIGHT+'; }';
  css += '.'+name+' .dd-trigger:hover { border-color: '+PRIMARY_LIGHT+'; }';
  css += '.'+name+' .dd-trigger.placeholder { color: #94A3B8; }';

  // Liste déroulante — portal attaché au body (position: fixed)
  css += '.'+listName+' { '
    + 'position: fixed; '
    + 'background: #fff; border: 1px solid '+BORDER+'; border-radius: 5px; '
    + 'box-shadow: 0 4px 16px rgba(0,0,0,0.1); '
    + 'overflow: hidden; '   // clip les coins + bloque le scroll horizontal
    + 'z-index: 99999; display: none; '
    + 'color: #1e293b; '
    + 'animation: '+name+'_fadeIn 0.1s ease; }';

  css += '@keyframes '+name+'_fadeIn { '
    + 'from { opacity: 0; transform: translateY(-4px); } '
    + 'to   { opacity: 1; transform: translateY(0); } }';

  // Zone scrollable (options uniquement — la recherche reste fixe au-dessus)
  css += '.'+listName+' .dd-scroll-area { max-height: 200px; overflow-y: auto; overflow-x: hidden; }';

  // Scrollbar custom
  css += '.'+listName+' .dd-scroll-area::-webkit-scrollbar { width: 5px; }';
  css += '.'+listName+' .dd-scroll-area::-webkit-scrollbar-track { background: #F8FAFC; }';
  css += '.'+listName+' .dd-scroll-area::-webkit-scrollbar-thumb { background: '+PRIMARY+'; border-radius: 3px; }';

  // Barre de recherche
  css += '.'+listName+' .dd-search-wrap { display: block; overflow: hidden; }';
  css += '.'+listName+' .dd-search-wrap.hidden { display: none; }';
  css += '.'+listName+' .dd-search { '
    + 'width: 100%; padding: 8px 12px; border: none; box-sizing: border-box; '
    + 'border-bottom: 1px solid '+BORDER+'; outline: none; '
    + 'font-size: 12px; font-family: inherit; color: #1e293b; background: #fff; }';
  css += '.'+listName+' .dd-search::placeholder { color: #94A3B8; }';

  // Options
  css += '.'+listName+' .dd-option { '
    + 'padding: 9px 12px; cursor: pointer; '
    + 'transition: background 0.1s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }';
  css += '.'+listName+' .dd-option:hover { background: #F8FAFC; }';
  css += '.'+listName+' .dd-option.selected { '
    + 'background: '+PRIMARY_CONTRAST+'; color: '+PRIMARY+'; font-weight: 600; }';

  // Empty state
  css += '.'+listName+' .dd-empty { '
    + 'padding: 12px; text-align: center; color: #94A3B8; font-size: 12px; font-style: italic; }';

  // Bouton clear (×)
  css += '.'+name+' .dd-clear { '
    + 'position: absolute; right: 10px; top: 50%; transform: translateY(-50%); '
    + 'display: none; align-items: center; justify-content: center; '
    + 'width: 16px; height: 16px; border-radius: 50%; '
    + 'cursor: pointer; font-size: 13px; line-height: 1; color: #94A3B8; z-index: 1; }';
  css += '.'+name+' .dd-clear:hover { color: '+PRIMARY+'; background: #fee2e2; }';
  // Quand le bouton clear est visible → masquer le chevron
  css += '.'+name+'.has-clear .dd-trigger { background-image: none; }';

  css += '</style>';
  $(instance.canvas).append(css);

  // ─── DOM — trigger dans le plugin, liste dans le body (portal) ────────────
  var $root        = $('<div>').addClass(name);
  var $trigger     = $('<div>').addClass('dd-trigger placeholder');
  var $triggerText = $('<span>').addClass('dd-trigger-text');

  // Portal : attaché au body pour être indépendant de la taille du plugin
  var $list       = $('<div>').addClass(listName);
  var $searchWrap  = $('<div>').addClass('dd-search-wrap hidden');
  var $search      = $('<input>').addClass('dd-search').attr('placeholder', 'Rechercher…').attr('type', 'text');
  var $scrollArea  = $('<div>').addClass('dd-scroll-area');
  var $options     = $('<div>').addClass('dd-options');

  var $clearBtn = $('<div>').addClass('dd-clear').html('&#x2715;');

  $searchWrap.append($search);
  $scrollArea.append($options);
  $list.append($searchWrap).append($scrollArea);
  $trigger.append($triggerText);
  $root.append($trigger).append($clearBtn);
  $(instance.canvas).append($root);
  $(document.body).append($list); // ← portal

  // ─── État interne ─────────────────────────────────────────────────────────
  instance.data.currentValue  = null;
  instance.data.currentLabel  = null;

  instance.data.placeholder   = 'Sélectionner…';
  instance.data.cachedOptions = [];
  var isOpen = false;

  // ─── Positionnement du portal ─────────────────────────────────────────────
  function positionList() {
    var rect = $trigger[0].getBoundingClientRect();
    var listH = Math.min(200, $list[0].scrollHeight || 200);
    var spaceBelow = window.innerHeight - rect.bottom;

    $list.css({ left: rect.left, width: rect.width });

    if (spaceBelow < listH + 8 && rect.top > listH + 8) {
      // Ouvrir vers le haut
      $list.css({ top: 'auto', bottom: window.innerHeight - rect.top + 4 });
    } else {
      // Ouvrir vers le bas (défaut)
      $list.css({ top: rect.bottom + 4, bottom: 'auto' });
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function updateTriggerDisplay() {
    if (instance.data.currentLabel) {
      $triggerText.text(instance.data.currentLabel);
      $trigger.removeClass('placeholder');
      if (instance.data.showClearButton) {
        $clearBtn.css('display', 'flex');
        $root.addClass('has-clear');
      } else {
        $clearBtn.css('display', 'none');
        $root.removeClass('has-clear');
      }
    } else {
      $triggerText.text(instance.data.placeholder);
      $trigger.addClass('placeholder');
      $clearBtn.css('display', 'none');
      $root.removeClass('has-clear');
    }
  }

  function closeDropdown() {
    isOpen = false;
    $root.removeClass('open');
    $list.hide();
    // Réinitialiser la recherche
    $search.val('');
    $options.find('.dd-option').show();
    $options.find('.dd-empty').remove();
    if (instance.data.cachedOptions.length === 0) {
      $options.append($('<div>').addClass('dd-empty').text('Aucune option'));
    }
  }

  function openDropdown() {
    // Fermer toutes les autres instances
    $(document).trigger('dd:open', [name]);
    isOpen = true;
    $root.addClass('open');
    positionList();
    $list.show();
    if (!$searchWrap.hasClass('hidden')) {
      setTimeout(function() { $search.focus(); }, 50);
    }
  }

  function renderOptions(options) {
    instance.data.cachedOptions = options;
    $options.empty();
    $search.val('');

    if (!options || options.length === 0) {
      $options.append($('<div>').addClass('dd-empty').text('Aucune option'));
      return;
    }

    options.forEach(function(opt) {
      var $opt = $('<div>').addClass('dd-option').text(opt.label).data('dd-value', opt.value);
      if (opt.value === instance.data.currentValue) {
        $opt.addClass('selected');
      }
      $opt.on('click', function(e) {
        e.stopPropagation();

        // Mettre à jour la sélection
        $options.find('.dd-option').removeClass('selected');
        $opt.addClass('selected');

        instance.data.currentValue = opt.value;
        instance.data.currentLabel = opt.label;
        updateTriggerDisplay();
        closeDropdown();

        // Publier l'objet et déclencher l'event à chaque clic
        instance.publishState('selected_item', opt.bubbleObj);
        instance.triggerEvent('item_selected');
      });
      $options.append($opt);
    });
  }

  // Exposer les helpers pour update.js
  instance.data.renderOptions        = renderOptions;
  instance.data.updateTriggerDisplay = updateTriggerDisplay;
  instance.data.$root                = $root;
  instance.data.$trigger             = $trigger;
  instance.data.$list                = $list;
  instance.data.$searchWrap          = $searchWrap;
  instance.data.$search              = $search;
  instance.data.$options             = $options;

  // ─── Interactions ─────────────────────────────────────────────────────────

  $trigger.on('click', function(e) {
    e.stopPropagation();
    if (isOpen) { closeDropdown(); } else { openDropdown(); }
  });

  // Fermer en cliquant ailleurs
  $(document).on('click.' + name, function() {
    if (isOpen) { closeDropdown(); }
  });

  // Fermer quand une autre instance s'ouvre
  $(document).on('dd:open.' + name, function(e, openedName) {
    if (openedName !== name && isOpen) { closeDropdown(); }
  });

  // Bouton clear (×)
  $clearBtn.on('click', function(e) {
    e.stopPropagation();
    instance.data.lastInitialValue = null;
    instance.data.currentValue = null;
    instance.data.currentLabel = null;
    instance.data.$options.find('.dd-option').removeClass('selected');
    updateTriggerDisplay();
    if (isOpen) { closeDropdown(); }
    instance.publishState('selected_item', null);
  });

  // Empêcher la fermeture au clic dans la liste
  $list.on('click', function(e) {
    e.stopPropagation();
  });

  // Fermer sur scroll (capture phase pour capter les scrolls dans les conteneurs/repeating groups)
  function onScrollCapture(e) {
    if (isOpen && !$list[0].contains(e.target)) { closeDropdown(); }
  }
  document.addEventListener('scroll', onScrollCapture, true);

  // Repositionner sur resize uniquement
  $(window).on('resize.' + name, function() {
    if (isOpen) { positionList(); }
  });

  // Filtre de recherche
  $search.on('input', function() {
    var q = $(this).val().toLowerCase();

    if (q.length === 0) {
      $options.find('.dd-option').show();
      $options.find('.dd-empty').remove();
      if (instance.data.cachedOptions.length === 0) {
        $options.append($('<div>').addClass('dd-empty').text('Aucune option'));
      }
      return;
    }

    $options.find('.dd-option').each(function() {
      var match = $(this).text().toLowerCase().indexOf(q) !== -1;
      $(this).toggle(match);
    });

    var visibleCount = $options.find('.dd-option:visible').length;
    $options.find('.dd-empty').remove();
    if (visibleCount === 0) {
      $options.append($('<div>').addClass('dd-empty').text('Aucun résultat'));
    }
  });

  // ─── Affichage initial ────────────────────────────────────────────────────
  $triggerText.text('Sélectionner…');

  instance.data.initialized = true;
}