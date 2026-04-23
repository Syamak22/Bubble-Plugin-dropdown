function(instance, properties, context) {

  if (instance.data.isUpdating) { return; }
  instance.data.isUpdating = true;

  try {
    if (!instance.data.initialized) { return; }

    var container = instance.data.$root[0];

    // ── 1. CSS vars ───────────────────────────────────────────────────────────
    var fontSize = properties.font_size ? Number(properties.font_size) : 13;

    container.style.setProperty('--dd-font-size', fontSize + 'px');
    // Le portal est dans body → font-size ne peut pas être hérité via CSS var, on le force
    instance.data.$list.css('font-size', fontSize + 'px');

    // ── 2. Placeholder ────────────────────────────────────────────────────────
    instance.data.placeholder = properties.placeholder || 'Sélectionner…';

    // ── 3. Barre de recherche + bouton clear ─────────────────────────────────
    if (properties.show_search) {
      instance.data.$searchWrap.removeClass('hidden');
    } else {
      instance.data.$searchWrap.addClass('hidden');
    }
    instance.data.showClearButton = !!properties.show_clear_button;

    // ── 4. Lire la datasource ─────────────────────────────────────────────────
    var dataSource = properties.data_source;
    var fieldName  = properties.field_name || 'name';

    if (!dataSource || typeof dataSource.length !== 'function') {
      instance.data.lastOptionsHash = null;
      instance.data.renderOptions([]);
      instance.data.updateTriggerDisplay();
      return;
    }

    var len = dataSource.length();
    if (len === 0) {
      instance.data.lastOptionsHash = null;
      instance.data.renderOptions([]);
      instance.data.updateTriggerDisplay();
      return;
    }

    var items   = dataSource.get(0, len);
    var options = items.map(function(item) {
      if (item && typeof item.get === 'function') {
        var label = String(item.get(fieldName) || '(sans nom)');
        // Pour les option sets, _id peut être null → fallback sur le label
        var rawId = item.get('_id');
        var value = (rawId && String(rawId)) ? String(rawId) : label;
        return {
          value:     value,
          label:     label,

          bubbleObj: item,
        };
      }
      var strVal = String(item);
      return { value: strVal, label: strVal, color: null, bubbleObj: item };
    });

    // ── 5. Hash check (doit précéder le check initial_value) ─────────────────
    var hash = options.map(function(o) { return o.value + ':' + o.label; }).join('|');
    var hashChanged = (hash !== instance.data.lastOptionsHash);
    instance.data.lastOptionsHash = hash;

    // ── 6. Initial value (hashChanged est maintenant défini) ──────────────────

    // Normaliser initial_value : Bubble peut passer un objet (option set) ou une string
    var rawInitial = properties.initial_value;
    var initialValue = null;
    if (rawInitial) {
      if (typeof rawInitial === 'object' && typeof rawInitial.get === 'function') {
        // Bubble a passé l'objet option set directement → extraire le label
        initialValue = String(rawInitial.get(fieldName) || '');
        if (!initialValue) initialValue = null;
      } else {
        initialValue = String(rawInitial) || null;
      }
    }

    var initialValueChanged = (initialValue !== instance.data.lastInitialValue);
    instance.data.lastInitialValue = initialValue;

    // On (re)cherche quand initial_value change OU quand la liste se recharge
    if (initialValueChanged || hashChanged) {
      if (initialValue) {
        var found = null;
        for (var i = 0; i < options.length; i++) {
          if (options[i].value === initialValue || options[i].label === initialValue) {
            found = options[i];
            break;
          }
        }
        if (found) {
          instance.data.currentValue = found.value;
          instance.data.currentLabel = found.label;

          instance.publishState('selected_item', found.bubbleObj);
        } else {
          instance.data.currentValue = null;
          instance.data.currentLabel = null;
          instance.data.currentColor = null;
        }
      } else {
        instance.data.currentValue = null;
        instance.data.currentLabel = null;
        instance.data.currentColor = null;
      }
    }


    // ── 8. Mettre à jour le DOM ───────────────────────────────────────────────
    if (hashChanged) {
      instance.data.renderOptions(options);
    } else if (initialValueChanged) {
      // Hash inchangé → mettre à jour la classe .selected en place
      var cv = instance.data.currentValue;
      instance.data.$options.find('.dd-option').removeClass('selected');
      if (cv) {
        instance.data.$options.find('.dd-option').each(function() {
          if ($(this).data('dd-value') === cv) {
            $(this).addClass('selected');
          }
        });
      }
    }

    // ── 9. Affichage du trigger ───────────────────────────────────────────────
    instance.data.updateTriggerDisplay();

  } finally {
    instance.data.isUpdating = false;
  }
}