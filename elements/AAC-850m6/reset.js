function(instance, context) {

  instance.data.lastInitialValue = null;
  instance.data.currentValue = null;
  instance.data.currentLabel = null;

  if (instance.data.$options) {
    instance.data.$options.find('.dd-option').removeClass('selected');
  }

  if (instance.data.updateTriggerDisplay) {
    instance.data.updateTriggerDisplay();
  }

  instance.publishState('selected_item', null);
}