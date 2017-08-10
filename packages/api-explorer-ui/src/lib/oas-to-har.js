module.exports = (oas, path = '', method = '') => {
  const har = {
    headers: [],
    queryString: [],
    postData: {},
    method: method.toUpperCase(),
    url: `${oas.servers ? oas.servers[0].url : ''}${path}`.replace(/\s/g, '%20'),
  };

  return har;
};
