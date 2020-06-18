/*
* Copyright © 2019-present Mia s.r.l.
* All rights reserved
*/
import MultipartFormData from './multipart-form-data'

const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
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

const getFormDataObject = (isMultipart) => isMultipart ? new MultipartFormData() : new FormData();

function appendItem(formDataObject, key, item, {isMultipart}) {
  if (isMultipart) {
    formDataObject.append(key, {
      data: item,
    })
    return
  }
  formDataObject.append(key, item)
}

function appendFile(formDataObject, key, item, {isMultipart}) {
  // Explode data string into component to be appended.
  // NOTE: The data string is generaged by the FileInputWidget which reads a file using 
  // FileReader.readAsUrl and prepending the filename information.
  // The result is always in the form:
  //    data:<type>;filename=<name>;base64,<data>
  // e.g.
  //    data:image/jpeg;filename=cat.jpen;base64,/9j/4AAQS...AD/2w==

  const actualData = item.split('base64,')[1]
  const filename = item.split(';')[1].split('=')[1]

  if (!isMultipart) {
    formDataObject.append(key, b64toBlob(actualData), filename);
    return
  }
  const type = item.split(';')[0].split('=')[1]

  formDataObject.append(key, {
    data: actualData,
    contentType: type,
    filename,
  })
}

export default function generateFormData(object, {isMultipart=false}) {
  const formDataObject = getFormDataObject(isMultipart)

  Object.keys(object).forEach((key) => {
    const formDataItem = object[key];
    if (typeof formDataItem !== 'string' || formDataItem.indexOf('base64') < 0) {
      appendItem(formDataObject, key, formDataItem, {isMultipart});
      return;
    }
    
    appendFile(formDataObject, key, formDataItem, {isMultipart})
  });
  return formDataObject
}
