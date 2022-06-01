import { TIMEOUT_SET } from './config';

/**
 *
 * @param {number} s 超过多少秒就 reject请求
 * @returns {Promise<Error>} reject并抛出一个Error
 */
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    //超时处理,因为这里的数字不容易理解，所以为了后期维护应该在config中设置
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SET)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    // 返回err到module中，而不是在这里处理它
    throw err;
  }
};

/*
export const getJSON = async function (url) {
  try {
    //超时处理,因为这里的数字不容易理解，所以为了后期维护应该在config中设置
    const res = await Promise.race([fetch(url), timeout(TIMEOUT_SET)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    // 返回err到module中，而不是在这里处理它
    throw err;
  }
};

//

export const sendJSON = async function (url, uploadData) {
  try {
    const fetchPro = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadData),
    });
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SET)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};*/
