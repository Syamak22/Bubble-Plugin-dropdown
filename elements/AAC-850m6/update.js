function(instance, properties, context) {

  if (!instance.data.initialized) { return; }

  var container = instance.data.$root[0];

  // ── 1. CSS vars ─────────────────────────────────────────────────────────────
  var fontSize = properties.font_size ? Number(properties.font_size) : 13;
  container.style.setProperty('--dd-font-size', fontSize + 'px');
  instance.data.$list.css('font-size', fontSize + 'px');

  // ── 2. Placeholder ───────────────────────────────────────────────────────────
  instance.data.placeholder = properties.placeholder || 'Sélectionner…';

  // ── 3. Barre de recherche + bouton clear ─────────────────────────────────────
  if (properties.show_search) {
    instance.data.$searchWrap.removeClass('hidden');
  } else {
    instance.data.$searchWrap.addClass('hidden');
  }
  instance.data.showClearButton = !!properties.show_clear_button;

  // ── 4. Lire la datasource ────────────────────────────────────────────────────
  var dataSource = properties.data_source;
  var fieldName  = properties.field_name || 'name';

  if (!dataSource || typeof dataSource.length !== 'function') {
    instance.data.renderOptions([]);
    requestAnimationFrame(function() { instance.data.updateTriggerDisplay(); });
    return;
  }

  var len = dataSource.length();
  if (len === 0) {
    instance.data.renderOptions([]);
    requestAnimationFrame(function() { instance.data.updateTriggerDisplay(); });
    return;
  }

  // ── 5. Construire les options ────────────────────────────────────────────────
  var items   = dataSource.get(0, len);
  var options = items.map(function(item) {
    if (item && typeof item.get === 'function') {
      var label = String(item.get(fieldName) || '(sans nom)');
      var rawId = item.get('_id');
      var value = (rawId && String(rawId)) ? String(rawId) : label;
      return { value: value, label: label, bubbleObj: item };
    }
    var strVal = String(item);
    return { value: strVal, label: strVal, bubbleObj: item };
  });

  // ── 6. Initial value — appliqué à chaque appel ──────────────────────────────
  var rawInitial = properties.initial_value;
  var initialValue = null;
  if (rawInitial) {
    if (typeof rawInitial === 'object' && typeof rawInitial.get === 'function') {
      initialValue = String(rawInitial.get(fieldName) || '') || null;
    } else {
      initialValue = String(rawInitial) || null;
    }
  }

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
    } else {
      instance.data.currentValue = initialValue;
      instance.data.currentLabel = initialValue;
    }
  }

  // ── 7. Reconstruire les options ──────────────────────────────────────────────
  instance.data.renderOptions(options);

  // ── 8. Affichage du trigger — différé pour survivre au re-render Bubble ──────
  var _label = instance.data.currentLabel;
  var _value = instance.data.currentValue;
  requestAnimationFrame(function() {
    instance.data.currentLabel = _label;
    instance.data.currentValue = _value;
    instance.data.updateTriggerDisplay();
  });
}