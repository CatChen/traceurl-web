// @flow strict

if (!window.gtag) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args) {
    window.dataLayer.push(arguments);
  };
}

const Analytics = {
  logEvent: (
    category: string,
    action: string,
    label?: ?string,
    value?: ?number,
    interaction?: boolean = true,
  ): void => {
    window.gtag('event', action, {
      non_interaction: !interaction,
      event_category: category,
      event_label: label,
      value: value,
    });
  },
};

export default Analytics;
