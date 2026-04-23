function(instance, properties) {

  var BORDER  = '#e2e8f0';

  var CHEVRON = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' "
    + "width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' "
    + "stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")";

  var placeholder = properties.placeholder || 'Sélectionner…';
  var fontSize    = (properties.font_size ? Number(properties.font_size) : 13) + 'px';

  var html = '<div style="'
    + 'display:flex;align-items:center;'
    + 'width:100%;height:100%;'
    + 'padding:0 32px 0 12px;'
    + 'border:1px solid ' + BORDER + ';border-radius:5px;'
    + 'background:#fff ' + CHEVRON + ' no-repeat right 10px center;'
    + 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'
    + 'font-family:inherit;font-size:' + fontSize + ';'
    + 'color:#94A3B8;box-sizing:border-box;">'
    + placeholder
    + '</div>';

  $(instance.canvas)
    .css({ overflow: 'hidden', boxSizing: 'border-box' })
    .empty()
    .append(html);
}