/*
 * Copyright © 2019-present Mia s.r.l.
 * All rights reserved
 */
import generateFormData from './generateFormData'

const fetchMultipart = (har, formData) => {
  if (!har) throw new Error('Missing har file');
  if (!har.log || !har.log.entries || !har.log.entries.length) {
    throw new Error('Missing log.entries array');
  }

  const { request } = har.log.entries[0];
  const { url } = request;
  const options = {
    method: request.method,
  };
  // Process form data into a multipart.
  options.body = generateFormData(formData.formData, {isMultipart: false});

  // Headers ignoring Content-Type since it will be filled up by FormData.
  if (request.headers.length) {
    options.headers = request.headers
      .map(header => {
        if (header.name === 'Content-Type') {
          return undefined
        }
        return { [header.name]: header.value };
      })
      .reduce((headers, next) => {
        if (!next) {
          return headers
        }

        return Object.assign(headers, next);
      }, {});
  }

  // Query string.
  let queryString = ''
  if (request.queryString.length) {
    const query = request.queryString.map(q => `${q.name}=${q.value}`).join('&');
    queryString = `?${query}`;
  }

  return fetch(`${url}${queryString}`, options)
}

export default fetchMultipart

