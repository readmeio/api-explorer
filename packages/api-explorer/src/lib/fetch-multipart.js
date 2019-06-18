/*
 * Copyright © 2019-present Mia s.r.l.
 * All rights reserved
 */
export const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) { // eslint-disable-line no-plusplus
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}

export const createMultipartBody = (formData) => {
  const data = new FormData();
  Object.keys(formData.formData).forEach((key) => {
    const dataString = formData.formData[key];
    if (dataString === undefined) {
      return;
    }
    // Explode data string into component to be appended.
    // NOTE: The data string is generaged by the FileInputWidget which reads a file using 
    // FileReader.readAsUrl and prepending the filename information.
    // The result is always in the form:
    //    data:<type>;filename=<name>;base64,<data>
    // e.g.
    //    data:image/jpeg;filename=cat.jpen;base64,/9j/4AAQS...AD/2w==
    const actualData = dataString.split('base64,')[1];
    const filename = dataString.split(';')[1].split('=')[1];
    data.append(key, b64toBlob(actualData), filename);
  });
  return data;
}

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
  options.body = createMultipartBody(formData);

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

