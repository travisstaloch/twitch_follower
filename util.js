const headers_v1 = {
  'Accept': 'application/vnd.twitchtv.v5+json',
  'Client-ID': '6uxcjd04ga3quvz38kzoia1xz768hf',
};

const headers = headers_v1;

async function useApi(url, json_key) {
  const response = await fetch(url, {headers});
  const json_data = await response.json();
  return await json_key ? json_data[json_key] : json_data;
}

// binary search for the sorted location of element in array
// comparer is function that takes 2 array elements and returns {-1, 0, 1}
// start, end are optional and should be omitted usually (for searching entire
// array)
function indexFor(element, array, comparer, start, end) {
  if (array.length === 0) return -1;

  start = start || 0;
  end = end || array.length;
  var pivot = (start + end) >> 1;  // should be faster than dividing by 2
  // console.log('pivot ', pivot)

  var c = comparer(element, array[pivot]);
  if (end - start <= 1) return c == -1 ? pivot - 1 : pivot;

  switch (c) {
    case -1:
      return indexFor(element, array, comparer, start, pivot);
    case 0:
      return pivot;
    case 1:
      return indexFor(element, array, comparer, pivot, end);
    default:
      throw Error('comparer returned invalid code ' + c);
  };
};

function numberCompare(a, b) {
  return Math.sign(a - b)
}

function formatDate(s, locale = 'en-US') {
  // console.log(
  //     'timeZone', Intl.DateTimeFormat().resolvedOptions().timeZone, 'locale',
  //     locale);
  return new Date(s).toLocaleString(
      locale, {timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone});
}

function formatSeconds(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return [h, m > 9 ? m : (h ? '0' + m : m || '0'), s > 9 ? s : '0' + s].join(
      ':');
}

// toggle the attribute 'hidden' of event.target['data-target']
function toggleHidden(event) {
  const data_target = event.target.getAttribute('data-target');
  const target_ele = document.getElementById(data_target);
  target_ele.toggleAttribute('hidden');
}

// add a div with class 'message ' + message_class to #messages
// and then remove it duration ms later
function showMessage(message, message_class, duration = 5000) {
  const messages_ele = document.getElementById('messages');
  const element = document.createElement('div');
  element.className = 'message ' + message_class;
  element.innerHTML = message;
  messages_ele.appendChild(element);
  setTimeout(() => messages_ele.removeChild(element), duration)
}

// helpers
function infoMessage(message) {
  showMessage(message, 'info');
}
function warningMessage(message) {
  showMessage(message, 'warning');
}
function errorMessage(message) {
  showMessage(message, 'error');
}

// placed here as this is used in worker and index
const recent_videos_progress_segments = 10;

// module.exports = {
//   locationOf,
//   numberCompare,
//   useApi,
//   formatDate,
//   formatSeconds,
//   toggleHidden,
// };