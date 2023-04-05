function ractfeeds(data, decorators) {
  const key = ractfeeds;
  const template = domDocument.querySelector(`template[data-ract-id="${key}"]`);
  const clone = template.content;


  console.log(clone);
};
